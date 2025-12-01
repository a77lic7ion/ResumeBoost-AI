
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";
import { getSettings } from "../utils/storage";

const ANALYSIS_MODEL = "gemini-2.5-flash";
const IMPROVEMENT_MODEL = "gemini-2.5-flash";
const VISION_MODEL = "gemini-2.5-flash"; // Supports PDF and Images

// Helper to safely access env vars in browser or node
const getEnvApiKey = () => {
  let key = undefined;
  
  // 1. Check Vite/Browser standard (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) key = import.meta.env.VITE_API_KEY;
      // @ts-ignore
      else if (import.meta.env.API_KEY) key = import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore syntax errors in environments that don't support import.meta
  }

  // 2. Check Node/Process standard (process.env)
  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.API_KEY) key = process.env.API_KEY;
        else if (process.env.VITE_API_KEY) key = process.env.VITE_API_KEY;
      }
    } catch (e) {
      // Ignore reference errors
    }
  }

  return key;
};

// Helper to get the best available API Key (User Settings > Environment Variable)
const getApiKey = (): string | undefined => {
  const settings = getSettings();
  if (settings.apiKey && settings.apiKey.trim().length > 0) {
    return settings.apiKey.trim();
  }
  const envKey = getEnvApiKey();
  return envKey ? envKey.trim() : undefined;
};

// Helper to initialize AI instance dynamically
const getAI = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in Settings or configure VITE_API_KEY in .env");
  }
  // Strip quotes if they were accidentally included in the env var
  const cleanKey = apiKey.replace(/^["']|["']$/g, '');
  return new GoogleGenAI({ apiKey: cleanKey });
};

/**
 * Validates a provided API key by making a minimal request.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    // Simple prompt to test connectivity
    await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: "Test connection",
    });
    return true;
  } catch (error: any) {
    console.error("API Key Validation Error:", error);
    if (error.status === 403 || (error.message && error.message.includes('403'))) {
      console.error("Permission Denied: Please check if the API Key is valid and the API is enabled in Google Cloud Console.");
    }
    return false;
  }
};

/**
 * Extracts text from an Image or PDF file using Gemini's multimodal capabilities.
 */
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
    console.error("Gemini Extraction Error:", error);
    if (error.status === 403 || (error.toString().includes('403'))) {
      throw new Error("Permission Denied: Your API Key is invalid or does not have access to the Gemini API.");
    }
    throw new Error("Failed to extract text from file. Please check your API Key.");
  }
};

/**
 * Performs a qualitative analysis of the resume using Gemini.
 */
export const analyzeWithGemini = async (resumeText: string): Promise<NonNullable<AnalysisResult['aiAnalysis']>> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Analyze the following resume text for a general professional role. 
      Provide a summary, list 3-5 key strengths, identify missing critical keywords (generic or inferred from content), 
      and evaluate the professional tone.

      RESUME TEXT:
      ${resumeText.slice(0, 10000)}`, // Limit context window just in case
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A 2-sentence executive summary of the candidate." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 strong points." },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 5 potential missing keywords based on the candidate's likely industry." },
            toneCheck: { type: Type.STRING, description: "Brief critique of the resume's voice (e.g., 'Too passive', 'Professional', 'Sales-oriented')." }
          },
          required: ["summary", "strengths", "missingKeywords", "toneCheck"],
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    let errorMessage = "AI Analysis unavailable. Please check your API Key settings.";
    if (error.status === 403 || (error.toString().includes('403'))) {
      errorMessage = "Error 403: Permission Denied. Check your API Key.";
    }

    // Fallback in case of API failure to prevent app crash
    return {
      summary: errorMessage,
      strengths: ["Analysis Failed"],
      missingKeywords: ["N/A"],
      toneCheck: "N/A"
    };
  }
};

/**
 * Generates an improved version of a specific section or the whole resume.
 */
export const improveResumeContent = async (originalText: string, specificInstruction: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: IMPROVEMENT_MODEL,
      contents: `You are an expert Resume Writer and ATS Optimization Specialist.
      
      TASK: Rewrite the following resume content to be more impactful, concise, and ATS-friendly.
      INSTRUCTION: ${specificInstruction}
      
      ORIGINAL CONTENT:
      ${originalText.slice(0, 12000)}
      
      OUTPUT REQUIREMENTS:
      - Use STRICT Markdown formatting.
      - Use # for Name/Title, ## for Sections, ### for Roles/Companies, and - for bullet points.
      - Ensure clear separation between sections.
      - Use strong action verbs.
      - Quantify achievements where numbers are present or can be inferred (e.g. "Managed team of 5").
      - Remove any "Strength Graphs" or "Skill Bars" textual representations, convert them to lists.
      - Return ONLY the rewritten markdown. Do not add conversational filler.`,
      config: {
        maxOutputTokens: 8000,
      }
    });

    return response.text || "Could not generate improvement.";
  } catch (error: any) {
    console.error("Gemini Improvement Error:", error);
    if (error.status === 403 || (error.toString().includes('403'))) {
      return "Error: Permission Denied. Please check your API Key in Settings.";
    }
    return "Error generating improvements. Please check your API key and try again.";
  }
};
