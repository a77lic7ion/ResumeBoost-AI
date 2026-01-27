
import { AnalysisResult, JobAnalysisResult, AiProvider, AiModel } from "../types";
import { getSettings } from "../utils/storage";
import {
  analyseWithGemini,
  improveResumeContentWithGemini,
  analyseJobDescriptionWithGemini,
  generateCoverLetterWithGemini,
  fetchGeminiModels,
  extractTextFromMultimodalWithGemini
} from "./geminiService";

export const extractTextFromMultimodal = async (base64Data: string, mimeType: string): Promise<string> => {
    const settings = getSettings();
    if (settings.provider === 'gemini') {
        return extractTextFromMultimodalWithGemini(base64Data, mimeType);
    }
    throw new Error(`Vision extraction is currently only supported with Google Gemini. Please switch provider in settings.`);
};

export const fetchModels = async (provider: AiProvider, apiKey: string, baseUrl?: string): Promise<AiModel[]> => {
    switch (provider) {
        case 'gemini':
            return fetchGeminiModels(apiKey);
        case 'claude':
            return [
                { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
                { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
                { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
            ];
        case 'mistral':
            try {
                const response = await fetch('https://api.mistral.ai/v1/models', {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                const data = await response.json();
                return data.data.map((m: any) => ({ id: m.id, name: m.id }));
            } catch (e) {
                return [
                    { id: 'mistral-large-latest', name: 'Mistral Large' },
                    { id: 'mistral-small-latest', name: 'Mistral Small' }
                ];
            }
        case 'grok':
            return [
                { id: 'grok-2-1212', name: 'Grok 2' },
                { id: 'grok-2-vision-1212', name: 'Grok 2 Vision' },
                { id: 'grok-beta', name: 'Grok Beta' }
            ];
        case 'ollama':
            try {
                const response = await fetch(`${baseUrl || 'http://localhost:11434'}/api/tags`);
                const data = await response.json();
                return data.models.map((m: any) => ({ id: m.name, name: m.name }));
            } catch (e) {
                console.error("Ollama fetch failed", e);
                return [];
            }
        default:
            return [];
    }
};

const callGenericAi = async (prompt: string, jsonMode: boolean = false): Promise<string> => {
    const settings = getSettings();
    const { provider, apiKey, modelId, ollamaUrl } = settings;

    if (provider === 'gemini') {
        // Gemini is handled separately because of the SDK and complex schema
        throw new Error("Gemini should be handled by its own service");
    }

    let url = '';
    let headers: any = { 'Content-Type': 'application/json' };
    let body: any = {};

    switch (provider) {
        case 'claude':
            url = 'https://api.anthropic.com/v1/messages';
            headers['x-api-key'] = apiKey;
            headers['anthropic-version'] = '2023-06-01';
            headers['dangerously-allow-browser'] = 'true'; // Note: In production this should be proxied
            body = {
                model: modelId || 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
            };
            break;
        case 'mistral':
            url = 'https://api.mistral.ai/v1/chat/completions';
            headers['Authorization'] = `Bearer ${apiKey}`;
            body = {
                model: modelId || 'mistral-large-latest',
                messages: [{ role: 'user', content: prompt }],
                response_format: jsonMode ? { type: 'json_object' } : undefined
            };
            break;
        case 'grok':
            url = 'https://api.x.ai/v1/chat/completions';
            headers['Authorization'] = `Bearer ${apiKey}`;
            body = {
                model: modelId || 'grok-2-1212',
                messages: [{ role: 'user', content: prompt }],
                stream: false
            };
            break;
        case 'ollama':
            url = `${ollamaUrl || 'http://localhost:11434'}/api/generate`;
            body = {
                model: modelId || 'llama3',
                prompt: prompt,
                stream: false,
                format: jsonMode ? 'json' : undefined
            };
            break;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`AI Service Error (${provider}): ${err}`);
    }

    const data = await response.json();

    if (provider === 'claude') return data.content[0].text;
    if (provider === 'ollama') return data.response;
    return data.choices[0].message.content;
};

export const analyseWithAi = async (text: string): Promise<NonNullable<AnalysisResult['aiAnalysis']>> => {
    const settings = getSettings();
    if (settings.provider === 'gemini') {
        return analyseWithGemini(text);
    }

    const prompt = `Analyse the following resume text based on South African professional standards.
    Return ONLY a JSON object with this exact structure:
    {
      "summary": "2-sentence summary",
      "strengths": ["strength1", "strength2", "strength3"],
      "missingKeywords": ["keyword1", "keyword2"],
      "toneCheck": "Description of tone",
      "categorizedSkills": [{"category": "Programming Languages", "skills": ["Skill1"]}],
      "suggestedKeywords": ["locally relevant skill1"]
    }

    RESUME TEXT:
    ${text.slice(0, 10000)}`;

    try {
        const response = await callGenericAi(prompt, true);
        return JSON.parse(response);
    } catch (error) {
        console.error(error);
        return {
            summary: "Analysis incomplete due to service error.",
            strengths: [],
            missingKeywords: [],
            toneCheck: "Unknown",
            categorizedSkills: [],
            suggestedKeywords: []
        };
    }
};

export const improveResumeContent = async (originalText: string, specificInstruction: string): Promise<string> => {
    const settings = getSettings();
    if (settings.provider === 'gemini') {
        return improveResumeContentWithGemini(originalText, specificInstruction);
    }

    const prompt = `You are an expert South African Resume Writer. Rewrite the content based on: ${specificInstruction}.

      Ensure the output adheres to South African professional standards and is highly compatible for LinkedIn export.
      Focus on professional clarity, 11-official-language-awareness if relevant, and reverse-chronological order.

      ORIGINAL CONTENT:
      ${originalText}

      Requirements: Markdown format, strong action verbs, quantifiable results, South African market relevance. Return ONLY the improved text.`;

    try {
        return await callGenericAi(prompt);
    } catch (error) {
        return `Error: ${error}`;
    }
};

export const analyseJobDescription = async (jobDescription: string): Promise<JobAnalysisResult> => {
    const settings = getSettings();
    if (settings.provider === 'gemini') {
        return analyseJobDescriptionWithGemini(jobDescription);
    }

    const prompt = `Analyse this Job Description and return a JSON object:
    {
      "roleTitle": "string",
      "keywords": ["string"],
      "hardSkills": ["string"],
      "softSkills": ["string"],
      "responsibilities": ["string"],
      "cultureFit": "string"
    }

    JOB DESCRIPTION:
    ${jobDescription}`;

    try {
        const response = await callGenericAi(prompt, true);
        return JSON.parse(response);
    } catch (error) {
        throw error;
    }
};

export const generateCoverLetter = async (resumeText: string, jobDescription?: string): Promise<string> => {
    const settings = getSettings();
    if (settings.provider === 'gemini') {
        return generateCoverLetterWithGemini(resumeText, jobDescription);
    }

    const prompt = `Write a professional South African style cover letter for this resume: ${resumeText}.
      Job description (if any): ${jobDescription || "N/A"}.
      The tone should be professional and respectful, as per South African corporate standards. Return ONLY the letter.`;

    try {
        return await callGenericAi(prompt);
    } catch (error) {
        return `Error: ${error}`;
    }
};
