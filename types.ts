export interface ResumeData {
  text: string;
  fileName?: string;
}

export enum IssueSeverity {
  CRITICAL = 'critical',
  IMPORTANT = 'important',
  MINOR = 'minor',
}

export interface Issue {
  id: string;
  category: 'format' | 'content' | 'ats' | 'keywords' | 'impact';
  severity: IssueSeverity;
  message: string;
  remediation: string;
}

export interface AtsScore {
  total: number;
  breakdown: {
    format: number; 
    content: number; 
    atsCompatibility: number;
    keywords: number;
    impact: number;
  };
  details: {
    wordCount: number;
    pageCountEstimate: number;
    emailDetected: boolean;
    phoneDetected: boolean;
    linkedInDetected: boolean;
    sectionsFound: string[];
  };
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface AnalysisResult {
  score: AtsScore;
  issues: Issue[];
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    missingKeywords: string[];
    toneCheck: string;
    categorizedSkills?: SkillCategory[];
    suggestedKeywords?: string[];
  };
}

export interface JobAnalysisResult {
  roleTitle: string;
  keywords: string[];
  hardSkills: string[];
  softSkills: string[];
  responsibilities: string[];
  cultureFit: string;
}

export type IntelligenceProvider = 'google' | 'anthropic' | 'mistral' | 'xai' | 'ollama';

export interface UserSettings {
  apiKey?: string;
  theme?: 'light' | 'dark' | 'system';
  preferredProvider?: IntelligenceProvider;
  analysisModel?: string;
  enhancementModel?: string;
  visionModel?: string;
}

export interface SavedSession {
  id: string;
  name: string;
  timestamp: number;
  resumeText: string;
  analysisResult: AnalysisResult;
  profileImage?: string;
}

export type ProcessingStatus = 'idle' | 'parsing' | 'scoring' | 'analysing' | 'complete' | 'error';