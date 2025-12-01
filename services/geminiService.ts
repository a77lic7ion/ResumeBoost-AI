
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, JobAnalysisResult } from "../types";
import { getSettings } from "../utils/storage";

const ANALYSIS_MODEL = "gemini-2.5-flash";
const IMPROVEMENT_MODEL = "gemini-2.5-flash";
const VISION_MODEL = "gemini-2.5-flash"; // Supports PDF and Images

// Helper: Centralized Error Handler
const handleGeminiError = (error: any): string => {
  console.error("Gemini Service Error:", error);
  const msg = error.toString().toLowerCase();
  
  if (error.status === 403 || msg.includes('403') || msg.includes('permission denied')) {
    return "Access Denied (Error 403).\n\nPossible fixes:\n1. In Google Cloud Console, ensure 'Generative Language API' is ENABLED.\n2. Check 'API Key Restrictions'. If using Vercel, add your production domain to the allowed referrers or remove strict browser restrictions.\n3. Verify billing is active for this project.";
  }
  
  if (msg.includes('fetch failed') || msg.includes('network')) {
    return "Network Error. Please check your internet connection.";
  }
  
  return error.message || "An unexpected error occurred with the AI service.";
};

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
    // Ignore syntax errors
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
 * Returns an object indicating validity and any error message.
 */
export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    // Simple prompt to test connectivity
    await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: "Test",
    });
    return { isValid: true };
  } catch (error: any) {
    return { isValid: false, error: handleGeminiError(error) };
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
    const friendlyError = handleGeminiError(error);
    throw new Error(friendlyError);
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
    const friendlyError = handleGeminiError(error);
    
    // Fallback in case of API failure to prevent app crash
    return {
      summary: `Analysis Failed: ${friendlyError}`,
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
      - Calculate and include the duration of employment for each role next to the dates in parentheses (e.g., "Jan 2019 - Dec 2021 (2 years)").
      - Always include a "References" section at the end. If original references exist, format them professionally. If not, add "## References\nReferences available upon request."
      - Remove any "Strength Graphs" or "Skill Bars" textual representations, convert them to lists.
      - Return ONLY the rewritten markdown. Do not add conversational filler.`,
      config: {
        maxOutputTokens: 8000,
      }
    });

    return response.text || "Could not generate improvement.";
  } catch (error: any) {
    const friendlyError = handleGeminiError(error);
    return `Error generating improvements.\n\n${friendlyError}`;
  }
};

/**
 * Analyzes a Job Description to extract key data points.
 */
export const analyzeJobDescription = async (jobDescription: string): Promise<JobAnalysisResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: `Analyze the following Job Description (JD) and provide a structured "Cheat Sheet" for a candidate applying to this role.
      
      JOB DESCRIPTION:
      ${jobDescription.slice(0, 10000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roleTitle: { type: Type.STRING, description: "The likely job title." },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 5-10 essential ATS keywords found in the text." },
            hardSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical or hard skills required." },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Interpersonal or soft skills mentioned." },
            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Summary of 3-5 core responsibilities." },
            cultureFit: { type: Type.STRING, description: "Brief description of the company culture or values implied." }
          },
          required: ["roleTitle", "keywords", "hardSkills", "softSkills", "responsibilities", "cultureFit"],
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    return JSON.parse(jsonText);
  } catch (error: any) {
    const friendlyError = handleGeminiError(error);
    throw new Error(friendlyError);
  }
};

/**
 * Generates a Cover Letter based on the Resume and (Optional) Job Description.
 */
export const generateCoverLetter = async (resumeText: string, jobDescription?: string): Promise<string> => {
  try {
    const ai = getAI();
    const prompt = `You are an expert Career Coach. Write a professional, compelling cover letter for the candidate.
    
    CANDIDATE RESUME:
    ${resumeText.slice(0, 8000)}
    
    ${jobDescription ? `TARGET JOB DESCRIPTION: ${jobDescription.slice(0, 5000)}` : 'TARGET ROLE: General Application'}
    
    INSTRUCTIONS:
    - Tone: Confident, professional, and enthusiastic.
    - Structure: Standard business letter format.
    - Content: Align the candidate's strongest achievements from the resume with the requirements of the job description (if provided).
    - If no JD is provided, focus on the candidate's top 3 transferable skills and leadership qualities.
    - Output: Return ONLY the body of the cover letter in Markdown format. Do not include placeholders like "[Your Name]" if the name is available in the resume.`;

    const response = await ai.models.generateContent({
      model: IMPROVEMENT_MODEL,
      contents: prompt
    });

    return response.text || "Could not generate cover letter.";
  } catch (error: any) {
    const friendlyError = handleGeminiError(error);
    return `Error generating cover letter.\n\n${friendlyError}`;
  }
};
