
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, JobAnalysisResult } from "../types";
import { getSettings } from "../utils/storage";

const ANALYSIS_MODEL = "gemini-3-flash-preview";
const IMPROVEMENT_MODEL = "gemini-3-pro-preview";
const VISION_MODEL = "gemini-2.5-flash-image"; 

const handleGeminiError = (error: any): string => {
  console.error("Gemini Service Error:", error);
  return error.message || "An unexpected error occurred with the AI service.";
};

const getAI = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: "Test",
    });
    return { isValid: true };
  } catch (error: any) {
    return { isValid: false, error: handleGeminiError(error) };
  }
};

export const extractTextFromMultimodal = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Extract all text from this document explicitly. Preserve the logical flow of sections (Experience, Education, etc.). Do not summarize, just transcribe."
          }
        ]
      }
    });
    
    return response.text || "";
  } catch (error: any) {
    throw new Error(handleGeminiError(error));
  }
};

export const analyzeWithGemini = async (resumeText: string): Promise<NonNullable<AnalysisResult['aiAnalysis']>> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Analyze the following resume text. 
      1. Provide a 2-sentence summary.
      2. List 3-5 strengths.
      3. Identify missing industry keywords.
      4. Evaluate the tone.
      5. Categorize ALL skills found into 'Programming Languages', 'Tools & Frameworks', 'Soft Skills', or other relevant categories.
      6. Suggest 5 additional high-demand skills the candidate likely has but didn't list based on their experience.

      RESUME TEXT:
      ${resumeText.slice(0, 10000)}`,
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
            suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-demand missing skills to add." }
          },
          required: ["summary", "strengths", "missingKeywords", "toneCheck", "categorizedSkills", "suggestedKeywords"],
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    return JSON.parse(jsonText);
  } catch (error: any) {
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
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: IMPROVEMENT_MODEL,
      contents: `You are an expert Resume Writer. Rewrite the content based on: ${specificInstruction}
      
      ORIGINAL CONTENT:
      ${originalText}
      
      Requirements: Markdown format, strong action verbs, quantifiable results.`,
    });

    return response.text || "Could not generate improvement.";
  } catch (error: any) {
    return `Error: ${handleGeminiError(error)}`;
  }
};

export const analyzeJobDescription = async (jobDescription: string): Promise<JobAnalysisResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Analyze this Job Description: ${jobDescription}`,
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
    throw new Error(handleGeminiError(error));
  }
};

export const generateCoverLetter = async (resumeText: string, jobDescription?: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: IMPROVEMENT_MODEL,
      contents: `Write a cover letter for this resume: ${resumeText}. Job description (if any): ${jobDescription || "N/A"}`
    });
    return response.text || "Could not generate letter.";
  } catch (error: any) {
    return `Error: ${handleGeminiError(error)}`;
  }
};
