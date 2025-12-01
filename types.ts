
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
    format: number; // Max 25
    content: number; // Max 25
    atsCompatibility: number; // Max 25
    keywords: number; // Max 15
    impact: number; // Max 10
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

export interface AnalysisResult {
  score: AtsScore;
  issues: Issue[];
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    missingKeywords: string[];
    toneCheck: string;
  };
}

export interface SavedSession {
  id: string;
  name: string;
  timestamp: number;
  resumeText: string;
  analysisResult: AnalysisResult;
  profileImage?: string;
}

export interface UserSettings {
  apiKey?: string;
  theme?: 'light' | 'dark' | 'system';
}

export type ProcessingStatus = 'idle' | 'parsing' | 'scoring' | 'ai-analyzing' | 'complete' | 'error';
