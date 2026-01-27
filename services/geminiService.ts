import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { AnalysisResult, JobAnalysisResult, UserSettings } from "../types";
import { getSettings } from "../utils/storage";

const DEFAULT_ANALYSIS_MODEL = "gemini-3-flash-preview";
const DEFAULT_ENHANCEMENT_MODEL = "gemini-3-pro-preview";
const DEFAULT_VISION_MODEL = "gemini-2.5-flash-image"; 

export interface ConnectivityTelemetry {
  isValid: boolean;
  latency?: number;
  modelVersion?: string;
  error?: string;
}

const getAI = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getConfig = (settings: UserSettings): GenerateContentParameters['config'] => {
  const config: GenerateContentParameters['config'] = {
    temperature: settings.temperature ?? 1,
    topP: settings.topP ?? 0.95,
    topK: settings.topK ?? 64,
  };

  if (settings.maxOutputTokens) {
    config.maxOutputTokens = settings.maxOutputTokens;
    // Reserved thinking budget if applicable
    if (settings.thinkingBudget) {
      config.thinkingConfig = { thinkingBudget: settings.thinkingBudget };
    }
  }

  return config;
};

export const fetchAvailableModels = async (): Promise<string[]> => {
  await new Promise(r => setTimeout(r, 600));
  return [
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
    "gemini-2.5-flash-latest",
    "gemini-2.5-flash-lite-latest",
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-2.5-flash-preview-tts"
  ];
};

export const validateApiKey = async (modelOverride?: string): Promise<ConnectivityTelemetry> => {
  const startTime = Date.now();
  try {
    const settings = getSettings();
    const model = modelOverride || settings.analysisModel || DEFAULT_ANALYSIS_MODEL;
    const ai = getAI();
    await ai.models.generateContent({
      model: model,
      contents: "ping",
      config: getConfig(settings)
    });
    return { 
      isValid: true, 
      latency: Date.now() - startTime,
      modelVersion: model
    };
  } catch (error: any) {
    return { 
      isValid: false, 
      error: error.message || "Endpoint unreachable or authentication failure." 
    };
  }
};

export const extractTextFromMultimodal = async (base64Data: string, mimeType: string): Promise<string> => {
  const settings = getSettings();
  const model = settings.visionModel || DEFAULT_VISION_MODEL;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: "Extract all text from this resume document precisely. Maintain headers." }
      ]
    },
    config: getConfig(settings)
  });
  return response.text || "";
};

export const analyseWithIntelligence = async (cvText: string): Promise<NonNullable<AnalysisResult['aiAnalysis']>> => {
  const settings = getSettings();
  const model = settings.analysisModel || DEFAULT_ANALYSIS_MODEL;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Analyse the following professional CV for a South African applicant:
    
    ${cvText.slice(0, 15000)}`,
    config: {
      ...getConfig(settings),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          toneCheck: { type: Type.STRING },
          categorizedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["category", "skills"]
            }
          },
          suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "strengths", "missingKeywords", "toneCheck", "categorizedSkills", "suggestedKeywords"],
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const enhanceCVContent = async (originalText: string, instruction: string): Promise<string> => {
  const settings = getSettings();
  const model = settings.enhancementModel || DEFAULT_ENHANCEMENT_MODEL;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Improve the following content. Instruction: ${instruction}
    
    Content: ${originalText}`,
    config: getConfig(settings)
  });
  return response.text || "";
};

export const analyseJobDescription = async (jd: string): Promise<JobAnalysisResult> => {
  const settings = getSettings();
  const model = settings.analysisModel || DEFAULT_ANALYSIS_MODEL;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Extract requirements from this JD: ${jd}`,
    config: {
      ...getConfig(settings),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roleTitle: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
          cultureFit: { type: Type.STRING }
        },
        required: ["roleTitle", "keywords", "hardSkills", "softSkills", "responsibilities", "cultureFit"],
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateProfessionalLetter = async (cv: string, jd?: string): Promise<string> => {
  const settings = getSettings();
  const model = settings.enhancementModel || DEFAULT_ENHANCEMENT_MODEL;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Draft a cover letter. CV Context: ${cv}. Job Context: ${jd || "General"}`,
    config: getConfig(settings)
  });
  return response.text || "";
};