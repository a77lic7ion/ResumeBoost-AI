import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, JobAnalysisResult, UserSettings } from "../types";
import { getSettings } from "../utils/storage";

const DEFAULT_ANALYSIS_MODEL = "gemini-3-flash-preview";
const DEFAULT_ENHANCEMENT_MODEL = "gemini-3-pro-preview";
const VISION_ENGINE = "gemini-2.5-flash-image"; 

const handleServiceError = (error: any): string => {
  console.error("Intelligence Service Error:", error);
  if (error.message?.includes("entity was not found")) {
    return "The selected model or project was not found. Please re-select your API key.";
  }
  return error.message || "A background service error occurred.";
};

const getAI = (): GoogleGenAI => {
  // Always create a new instance to ensure we use the most up-to-date injected key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const validateApiKey = async (): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const settings = getSettings();
    const model = settings.analysisModel || DEFAULT_ANALYSIS_MODEL;
    const ai = getAI();
    await ai.models.generateContent({
      model: model,
      contents: "Service connectivity test.",
    });
    return { isValid: true };
  } catch (error: any) {
    return { isValid: false, error: handleServiceError(error) };
  }
};

export const extractTextFromMultimodal = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: VISION_ENGINE,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Examine this South African CV/document. Transcribe all text clearly, maintaining the structure of experience, education, and contact details. Do not summarise."
          }
        ]
      }
    });
    
    return response.text || "";
  } catch (error: any) {
    throw new Error(handleServiceError(error));
  }
};

export const analyseWithIntelligence = async (cvText: string): Promise<NonNullable<AnalysisResult['aiAnalysis']>> => {
  try {
    const settings = getSettings();
    const model = settings.analysisModel || DEFAULT_ANALYSIS_MODEL;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: model,
      contents: `Analyse this South African CV. 
      1. Provide a 2-sentence professional summary in UK/SA English.
      2. List 3-5 core strengths based on the content.
      3. Identify missing industry keywords relevant to the South African market.
      4. Evaluate the tone (Active vs Passive).
      5. Categorise ALL skills into 'Technical Skills', 'Frameworks & Tools', 'Interpersonal Skills', or 'Other'.
      6. Suggest 5 additional high-demand skills the candidate likely possesses but hasn't listed.

      CV CONTENT:
      ${cvText.slice(0, 12000)}`,
      config: {
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
  } catch (error: any) {
    return {
      summary: "Analysis incomplete due to service interruption.",
      strengths: [],
      missingKeywords: [],
      toneCheck: "Unknown",
      categorizedSkills: [],
      suggestedKeywords: []
    };
  }
};

export const enhanceCVContent = async (originalText: string, instruction: string): Promise<string> => {
  try {
    const settings = getSettings();
    const model = settings.enhancementModel || DEFAULT_ENHANCEMENT_MODEL;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: model,
      contents: `Refine this South African CV content based on: ${instruction}. 
      Use UK/SA English spelling (e.g., 'optimise', 'programme'). Use strong action verbs and quantifiable metrics.
      
      ORIGINAL TEXT:
      ${originalText}`,
    });

    return response.text || "Enhancement failed.";
  } catch (error: any) {
    return `Service Error: ${handleServiceError(error)}`;
  }
};

export const analyseJobDescription = async (jd: string): Promise<JobAnalysisResult> => {
  try {
    const settings = getSettings();
    const model = settings.analysisModel || DEFAULT_ANALYSIS_MODEL;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: model,
      contents: `Analyse this South African Job Description: ${jd}`,
      config: {
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
  } catch (error: any) {
    throw new Error(handleServiceError(error));
  }
};

export const generateProfessionalLetter = async (cv: string, jd?: string): Promise<string> => {
  try {
    const settings = getSettings();
    const model = settings.enhancementModel || DEFAULT_ENHANCEMENT_MODEL;
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: model,
      contents: `Write a professional cover letter for a South African job application. 
      CV: ${cv}. Job Details: ${jd || "General application"}. Use UK English spelling.`
    });
    return response.text || "Letter generation failed.";
  } catch (error: any) {
    return `Service Error: ${handleServiceError(error)}`;
  }
};