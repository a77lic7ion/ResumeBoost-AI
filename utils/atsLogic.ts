import { AtsScore, Issue, IssueSeverity } from "../types";

// Regex Patterns
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/,
  sections: {
    experience: /(work|professional|employment)\s+experience|history/i,
    education: /education|academic/i,
    skills: /skills|technologies|competencies|technical proficiency/i,
    summary: /summary|objective|profile|about/i,
    projects: /projects/i,
    certifications: /certifications|courses/i,
  },
  dates: /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\d{2}\/\d{4}|\d{4}/i,
  // Stricter quantifier check: looks for number followed by word, or specific metric keywords
  quantifiers: /\b\d{1,3}%|\$\d+(?:,\d{3})*(?:\.\d+)?|\b\d+\+?\s(users|customers|clients|revenue|sales|increase|reduction|tickets|servers|workstations|endpoints|projects|budget|savings)/i,
  badElements: {
    graph: /strength graph|competency scale|skill bar|my arms|rating|stars/i, // Specific catch for visual skill representations
    visuals: /chart|diagram|infographic/i
  },
  buzzwords: /\b(hard worker|motivated|team player|out of the box|dynamic|proactive|go-getter|synergy|thought leader)\b/i
};

export const calculateAtsScore = (text: string): { score: AtsScore; issues: Issue[] } => {
  const issues: Issue[] = [];
  
  // Adjusted Weights for stricter scoring
  const breakdown = {
    format: 20,         // Was 25
    content: 20,        // Was 25
    atsCompatibility: 30, // Increased weight (Was 25)
    keywords: 15,
    impact: 15,         // Increased weight (Was 10)
  };

  const sectionsFound: string[] = [];
  
  // 1. Content Checks (20pts)
  const hasEmail = PATTERNS.email.test(text);
  const hasPhone = PATTERNS.phone.test(text);
  
  if (!hasEmail) {
    breakdown.content -= 10;
    issues.push({
      id: 'missing-email',
      category: 'content',
      severity: IssueSeverity.CRITICAL,
      message: 'No email address detected.',
      remediation: 'Add a professional email address to your header.',
    });
  }
  if (!hasPhone) {
    breakdown.content -= 5;
    issues.push({
      id: 'missing-phone',
      category: 'content',
      severity: IssueSeverity.IMPORTANT,
      message: 'No phone number detected.',
      remediation: 'Include a contact number.',
    });
  }
  
  // Check for Summary
  const hasSummary = PATTERNS.sections.summary.test(text);
  if (!hasSummary) {
    breakdown.content -= 5;
    issues.push({
        id: 'missing-summary',
        category: 'content',
        severity: IssueSeverity.IMPORTANT,
        message: 'Missing Professional Summary.',
        remediation: 'Add a 2-3 sentence summary at the top highlighting your years of experience and key skills.'
    });
  }

  // 2. ATS Compatibility (Sections & Bad Elements) (30pts)
  Object.entries(PATTERNS.sections).forEach(([key, regex]) => {
    if (regex.test(text)) {
      sectionsFound.push(key);
    } else {
      if (key === 'experience' || key === 'education' || key === 'skills') {
          breakdown.atsCompatibility -= 8; 
          issues.push({
            id: `missing-section-${key}`,
            category: 'ats',
            severity: IssueSeverity.CRITICAL,
            message: `Missing section: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            remediation: `Ensure you have a clearly labeled "${key.charAt(0).toUpperCase() + key.slice(1)}" section.`
          });
      }
    }
  });

  // Check for Bad Elements (Graphs, Strength bars)
  if (PATTERNS.badElements.graph.test(text)) {
      breakdown.atsCompatibility -= 15; // Heavy Penalty
      issues.push({
          id: 'visual-elements-graph',
          category: 'ats',
          severity: IssueSeverity.CRITICAL,
          message: 'Visual Skill Graphs detected.',
          remediation: 'ATS cannot read "Strength Graphs" or "Skill Bars". Remove them and list skills as text bullets.'
      });
  }

  // 3. Impact (Quantifiers) (15pts)
  // We need significantly more metrics for a "good" score
  const matches = text.match(new RegExp(PATTERNS.quantifiers, 'g')) || [];
  const quantifierCount = matches.length;

  if (quantifierCount === 0) {
      breakdown.impact = 0; // 0/15
      issues.push({
        id: 'no-impact',
        category: 'impact',
        severity: IssueSeverity.CRITICAL,
        message: 'Zero measurable results found.',
        remediation: 'Your resume describes tasks, not results. You MUST add numbers (e.g., "Reduced costs by 20%", "Managed 50 servers").'
      });
  } else if (quantifierCount < 5) {
    breakdown.impact -= 10; // 5/15
    issues.push({
      id: 'low-impact',
      category: 'impact',
      severity: IssueSeverity.IMPORTANT,
      message: 'Weak evidence of impact.',
      remediation: `Only found ${quantifierCount} metrics. Aim for at least 5-8 specific numbers ($, %, #) to prove your value.`
    });
  }

  // 4. Format & Buzzwords (20pts)
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount < 250) {
    breakdown.format -= 10;
    issues.push({
      id: 'too-short',
      category: 'format',
      severity: IssueSeverity.IMPORTANT,
      message: 'Resume is too short.',
      remediation: 'Expand on your experience. A standard professional resume is typically 400-800 words.'
    });
  }
  
  // Check for generic buzzwords
  if (PATTERNS.buzzwords.test(text)) {
      breakdown.format -= 5;
      issues.push({
          id: 'buzzwords',
          category: 'content',
          severity: IssueSeverity.MINOR,
          message: 'Generic buzzwords detected.',
          remediation: 'Avoid phrases like "Hard worker" or "Out of the box thinker". Show these traits through specific project examples instead.'
      });
  }

  // 5. Keywords (15pts)
  // Check if skills are jumbled or nonexistent
  const skillsContext = text.match(/skills[\s\S]{0,300}/i);
  if (!skillsContext || skillsContext[0].length < 50) {
      breakdown.keywords -= 10;
       issues.push({
          id: 'weak-skills',
          category: 'keywords',
          severity: IssueSeverity.IMPORTANT,
          message: 'Skills section is weak or missing.',
          remediation: 'Create a dedicated "Technical Skills" section grouped by category (e.g., "Languages", "Tools").'
      });
  }

  // Clamp scores to 0
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
        linkedInDetected: PATTERNS.linkedin.test(text),
        sectionsFound
      }
    },
    issues
  };
};