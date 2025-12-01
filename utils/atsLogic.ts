import { AtsScore, Issue, IssueSeverity } from "../types";

// Regex Patterns
const PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  phone: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
  linkedin: /linkedin\.com\/in\/[a-zA-Z0-9_-]+/,
  sections: {
    experience: /(work|professional|employment)\s+experience|history/i,
    education: /education|academic/i,
    skills: /skills|technologies|competencies/i,
    summary: /summary|objective|profile|about/i,
    projects: /projects/i,
  },
  dates: /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}|\d{2}\/\d{4}|\d{4}/i,
  quantifiers: /\d+%|\$\d+|\d+\+? (users|customers|clients|revenue|sales|increase|reduction)/i,
};

export const calculateAtsScore = (text: string): { score: AtsScore; issues: Issue[] } => {
  const issues: Issue[] = [];
  const breakdown = {
    format: 25,
    content: 25,
    atsCompatibility: 25,
    keywords: 15,
    impact: 10,
  };

  const sectionsFound: string[] = [];
  
  // 1. Content Checks (25pts)
  const hasEmail = PATTERNS.email.test(text);
  const hasPhone = PATTERNS.phone.test(text);
  const hasLinkedIn = PATTERNS.linkedin.test(text);
  
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
  if (!hasLinkedIn) {
    breakdown.content -= 2;
    issues.push({
      id: 'missing-linkedin',
      category: 'content',
      severity: IssueSeverity.MINOR,
      message: 'LinkedIn profile link missing.',
      remediation: 'Adding a LinkedIn URL helps recruiters research you.',
    });
  }

  // 2. ATS Compatibility (Sections) (25pts)
  Object.entries(PATTERNS.sections).forEach(([key, regex]) => {
    if (regex.test(text)) {
      sectionsFound.push(key);
    } else {
      breakdown.atsCompatibility -= 5;
      issues.push({
        id: `missing-section-${key}`,
        category: 'ats',
        severity: key === 'experience' || key === 'education' ? IssueSeverity.CRITICAL : IssueSeverity.IMPORTANT,
        message: `Missing standard section: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
        remediation: `Rename your section to standard ATS-friendly terms like "${key.charAt(0).toUpperCase() + key.slice(1)}".`
      });
    }
  });

  // 3. Impact (Quantifiers) (10pts)
  const quantifierMatches = (text.match(new RegExp(PATTERNS.quantifiers, 'g')) || []).length;
  if (quantifierMatches < 3) {
    breakdown.impact -= 5;
    issues.push({
      id: 'low-impact',
      category: 'impact',
      severity: IssueSeverity.IMPORTANT,
      message: 'Few quantifiable achievements found.',
      remediation: 'Use numbers (%, $, +) to demonstrate your impact (e.g., "Increased sales by 20%").'
    });
  }

  // 4. Format & Length (25pts)
  const wordCount = text.split(/\s+/).length;
  // Approx 500 words per page
  const pageEstimate = Math.ceil(wordCount / 500);
  
  if (wordCount < 150) {
    breakdown.format -= 10;
    issues.push({
      id: 'too-short',
      category: 'format',
      severity: IssueSeverity.CRITICAL,
      message: 'Resume is too short.',
      remediation: 'Expand on your experience and skills.'
    });
  } else if (pageEstimate > 2) {
    breakdown.format -= 5;
    issues.push({
      id: 'too-long',
      category: 'format',
      severity: IssueSeverity.IMPORTANT,
      message: 'Resume exceeds 2 pages.',
      remediation: 'Condense your resume to 1-2 pages for better readability.'
    });
  }

  // 5. Keywords (Basic Check) (15pts)
  // This is hard to do without a specific Job Description, so we give points for finding "Skills" section
  // and generally having enough content length (proxy for detail).
  // Real keyword analysis happens via Gemini.
  if (!sectionsFound.includes('skills')) {
    breakdown.keywords -= 10;
  }
  if (wordCount > 300) {
    // assume good density if length is decent
  } else {
    breakdown.keywords -= 5;
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
        pageCountEstimate: pageEstimate,
        emailDetected: hasEmail,
        phoneDetected: hasPhone,
        linkedInDetected: hasLinkedIn,
        sectionsFound
      }
    },
    issues
  };
};
