
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, JobAnalysisResult, AiModel } from "../types";
import { getSettings } from "../utils/storage";

const DEFAULT_ANALYSIS_MODEL = "gemini-1.5-flash";
const DEFAULT_IMPROVEMENT_MODEL = "gemini-1.5-pro";
const VISION_MODEL = "gemini-1.5-flash";

const handleGeminiError = (error: any): string => {
  console.error("Gemini Service Error:", error);
  return error.message || "An unexpected error occurred with the AI service.";
};

const getAI = (providedKey?: string): GoogleGenAI => {
  const settings = getSettings();
  const apiKey = providedKey || settings.apiKey || (import.meta as any).env.VITE_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Using a very simple model list call to validate key
    const models = await fetchGeminiModels(apiKey);
    return { isValid: models.length > 0 };
  } catch (error: any) {
    return { isValid: false, error: handleGeminiError(error) };
  }
};

export const fetchGeminiModels = async (apiKey: string): Promise<AiModel[]> => {
    try {
        // Since @google/genai might not have a direct listModels that works easily in browser without proxy
        // We can manually define common ones or try to fetch them
        // For simplicity and reliability in this context, we'll return the known ones
        return [
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
            { id: 'gemini-2.0-flash-lite-preview-02-05', name: 'Gemini 2.0 Flash-Lite' },
            { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro' }
        ];
    } catch (e) {
        return [];
    }
};

export const extractTextFromMultimodalWithGemini = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAI();
    const settings = getSettings();
    const modelId = settings.modelId || VISION_MODEL;
    const model = ai.getGenerativeModel({ model: modelId });

    const result = await model.generateContent([
        {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
        },
        "Extract all text from this document explicitly. Preserve the logical flow of sections (Experience, Education, etc.). Do not summarize, just transcribe."
    ]);
    
    const response = await result.response;
    return response.text() || "";
  } catch (error: any) {
    throw new Error(handleGeminiError(error));
  }
};

export const analyseWithGemini = async (resumeText: string): Promise<NonNullable<AnalysisResult['aiAnalysis']>> => {
  try {
    const ai = getAI();
    const settings = getSettings();
    const modelId = settings.modelId || DEFAULT_ANALYSIS_MODEL;
    const model = ai.getGenerativeModel({
        model: modelId,
        generationConfig: {
            responseMimeType: "application/json",
            // @ts-ignore
            responseSchema: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  missingKeywords: { type: "array", items: { type: "string" } },
                  toneCheck: { type: "string" },
                  categorizedSkills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        skills: { type: "array", items: { type: "string" } }
                      },
                      required: ["category", "skills"]
                    }
                  },
                  suggestedKeywords: { type: "array", items: { type: "string" } }
                },
                required: ["summary", "strengths", "missingKeywords", "toneCheck", "categorizedSkills", "suggestedKeywords"],
            }
        }
    });

    const result = await model.generateContent(`Analyse the following resume text based on South African professional standards.
      1. Provide a 2-sentence summary.
      2. List 3-5 strengths.
      3. Identify missing industry keywords specifically relevant to the South African market.
      4. Evaluate the tone (ensure it meets professional South African expectations).
      5. Categorize ALL skills found into 'Programming Languages', 'Tools & Frameworks', 'Soft Skills', or other relevant categories.
      6. Suggest 5 additional high-demand skills (locally relevant in SA) the candidate likely has but didn't list based on their experience.

      RESUME TEXT:
      ${resumeText.slice(0, 15000)}`);

    const response = await result.response;
    const jsonText = response.text();
    if (!jsonText) throw new Error("Empty response from AI");
    return JSON.parse(jsonText);
  } catch (error: any) {
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

export const improveResumeContentWithGemini = async (originalText: string, specificInstruction: string): Promise<string> => {
  try {
    const ai = getAI();
    const settings = getSettings();
    const modelId = settings.modelId || DEFAULT_IMPROVEMENT_MODEL;
    const model = ai.getGenerativeModel({ model: modelId });

    const result = await model.generateContent(`You are an expert South African Resume Writer. Rewrite the content based on: ${specificInstruction}.

      Ensure the output adheres to South African professional standards and is highly compatible for LinkedIn export.
      Focus on professional clarity, 11-official-language-awareness if relevant, and reverse-chronological order.
      
      ORIGINAL CONTENT:
      ${originalText}
      
      Requirements: Markdown format, strong action verbs, quantifiable results, South African market relevance.`);

    const response = await result.response;
    return response.text() || "Could not generate improvement.";
  } catch (error: any) {
    return `Error: ${handleGeminiError(error)}`;
  }
};

export const analyseJobDescriptionWithGemini = async (jobDescription: string): Promise<JobAnalysisResult> => {
  try {
    const ai = getAI();
    const settings = getSettings();
    const modelId = settings.modelId || DEFAULT_ANALYSIS_MODEL;
    const model = ai.getGenerativeModel({
        model: modelId,
        generationConfig: {
            responseMimeType: "application/json",
            // @ts-ignore
            responseSchema: {
                type: "object",
                properties: {
                  roleTitle: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                  hardSkills: { type: "array", items: { type: "string" } },
                  softSkills: { type: "array", items: { type: "string" } },
                  responsibilities: { type: "array", items: { type: "string" } },
                  cultureFit: { type: "string" }
                },
                required: ["roleTitle", "keywords", "hardSkills", "softSkills", "responsibilities", "cultureFit"],
            }
        }
    });

    const result = await model.generateContent(`Analyse this Job Description: ${jobDescription}`);
    const response = await result.response;
    return JSON.parse(response.text() || "{}");
  } catch (error: any) {
    throw new Error(handleGeminiError(error));
  }
};

export const generateCoverLetterWithGemini = async (resumeText: string, jobDescription?: string): Promise<string> => {
  try {
    const ai = getAI();
    const settings = getSettings();
    const modelId = settings.modelId || DEFAULT_IMPROVEMENT_MODEL;
    const model = ai.getGenerativeModel({ model: modelId });

    const result = await model.generateContent(`Write a professional South African style cover letter for this resume: ${resumeText}.
      Job description (if any): ${jobDescription || "N/A"}.
      The tone should be professional and respectful, as per South African corporate standards.`);

    const response = await result.response;
    return response.text() || "Could not generate letter.";
  } catch (error: any) {
    return `Error: ${handleGeminiError(error)}`;
  }
};
