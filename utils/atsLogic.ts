import { AtsScore, Issue, IssueSeverity } from "../types";

// Localised SA Regex Patterns
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /(\+27|0)\s?[1-9]\d\s?\d{3}\s?\d{4}/, // SA Phone Format
  linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/,
  sections: {
    experience: /(work|professional|employment)\s+experience|history/i,
    education: /education|academic|qualifications/i,
    skills: /skills|technologies|competencies|proficiency/i,
    summary: /summary|objective|profile|about/i,
    projects: /projects/i,
    certifications: /certifications|courses|programmes/i,
  },
  quantifiers: /\b\d{1,3}%|\$\d+(?:,\d{3})*(?:\.\d+)?|R\d+(?:,\d{3})*(?:\.\d+)?|\b\d+\+?\s(users|customers|clients|revenue|sales|increase|reduction|projects|budget|savings)/i,
  badElements: {
    graph: /strength graph|competency scale|skill bar|stars|rating/i,
    visuals: /chart|diagram|infographic/i
  },
  buzzwords: /\b(hard worker|motivated|team player|out of the box|dynamic|proactive|synergy|thought leader)\b/i
};

export const calculateAtsScore = (text: string): { score: AtsScore; issues: Issue[] } => {
  const issues: Issue[] = [];
  
  const breakdown = {
    format: 20,         
    content: 20,        
    atsCompatibility: 30, 
    keywords: 15,
    impact: 15,         
  };

  const sectionsFound: string[] = [];
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  const hasEmail = PATTERNS.email.test(text);
  const hasPhone = PATTERNS.phone.test(text);
  
  if (!hasEmail) {
    breakdown.content -= 10;
    issues.push({
      id: 'missing-email',
      category: 'content',
      severity: IssueSeverity.CRITICAL,
      message: 'No email address detected.',
      remediation: 'Ensure a professional email address is visible in your header.',
    });
  }
  if (!hasPhone) {
    breakdown.content -= 5;
    issues.push({
      id: 'missing-phone',
      category: 'content',
      severity: IssueSeverity.IMPORTANT,
      message: 'No South African contact number detected.',
      remediation: 'Include a contact number (e.g., 082 123 4567 or +27...).',
    });
  }
  
  const hasSummary = PATTERNS.sections.summary.test(text);
  if (!hasSummary) {
    breakdown.content -= 5;
    issues.push({
        id: 'missing-summary',
        category: 'content',
        severity: IssueSeverity.IMPORTANT,
        message: 'Missing Professional Summary.',
        remediation: 'Add a concise summary highlighting your experience and key expertise.'
    });
  }

  Object.entries(PATTERNS.sections).forEach(([key, regex]) => {
    if (regex.test(text)) {
      sectionsFound.push(key);
    } else {
      if (['experience', 'education', 'skills'].includes(key)) {
          breakdown.atsCompatibility -= 8; 
          issues.push({
            id: `missing-section-${key}`,
            category: 'ats',
            severity: IssueSeverity.CRITICAL,
            message: `Missing section: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            remediation: `Label your "${key.charAt(0).toUpperCase() + key.slice(1)}" section clearly.`
          });
      }
    }
  });

  if (PATTERNS.badElements.graph.test(text)) {
      breakdown.atsCompatibility -= 15;
      issues.push({
          id: 'visual-elements-graph',
          category: 'ats',
          severity: IssueSeverity.CRITICAL,
          message: 'Visual skill indicators detected.',
          remediation: 'Remove skill bars or graphs as background services cannot parse them reliably. Use text descriptions.'
      });
  }

  const matches = text.match(new RegExp(PATTERNS.quantifiers, 'g')) || [];
  const quantifierCount = matches.length;

  if (quantifierCount === 0) {
      breakdown.impact = 0;
      issues.push({
        id: 'no-impact',
        category: 'impact',
        severity: IssueSeverity.CRITICAL,
        message: 'Zero measurable results found.',
        remediation: 'Focus on achievements rather than duties. Add Rands (R), percentages (%), or counts (#).'
      });
  } else if (quantifierCount < 4) {
    breakdown.impact -= 10;
    issues.push({
      id: 'low-impact',
      category: 'impact',
      severity: IssueSeverity.IMPORTANT,
      message: 'Limited evidence of professional impact.',
      remediation: `Only ${quantifierCount} metrics found. Aim for at least 5 to 8 quantifiable achievements.`
    });
  }

  if (wordCount < 300) {
    breakdown.format -= 10;
    issues.push({
      id: 'too-short',
      category: 'format',
      severity: IssueSeverity.IMPORTANT,
      message: 'CV content is too brief.',
      remediation: 'Professional South African CVs should ideally range from 400 to 1000 words.'
    });
  }
  
  if (PATTERNS.buzzwords.test(text)) {
      breakdown.format -= 5;
      issues.push({
          id: 'buzzwords',
          category: 'content',
          severity: IssueSeverity.MINOR,
          message: 'Cliche buzzwords detected.',
          remediation: 'Replace generic terms like "hard worker" with specific examples of your work ethic.'
      });
  }

  Object.keys(breakdown).forEach(k => {
    breakdown[k as keyof typeof breakdown] = Math.max(0, breakdown[k as keyof typeof breakdown]);
  });

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    score: {
      total,
      breakdown,
      details: {
        wordCount,
        pageCountEstimate: Math.ceil(wordCount / 500),
        emailDetected: hasEmail,
        phoneDetected: hasPhone,
        linkedInDetected: /linkedin\.com/.test(text),
        sectionsFound
      }
    },
    issues
  };
};