import type { ResumeData } from '../../types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ATS Scoring Engine — Phase 1 (Client-Side Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Action Verbs (100+) ──
export const ACTION_VERBS = new Set([
  'achieved', 'administered', 'advanced', 'analyzed', 'architected', 'automated',
  'built', 'centralized', 'championed', 'collaborated', 'compiled', 'completed',
  'conducted', 'configured', 'consolidated', 'constructed', 'contributed', 'converted',
  'coordinated', 'created', 'customized', 'decreased', 'defined', 'delivered',
  'demonstrated', 'deployed', 'designed', 'developed', 'devised', 'diagnosed',
  'directed', 'documented', 'drove', 'earned', 'eliminated', 'enabled',
  'engineered', 'enhanced', 'established', 'evaluated', 'exceeded', 'executed',
  'expanded', 'expedited', 'facilitated', 'formulated', 'founded', 'generated',
  'grew', 'guided', 'headed', 'identified', 'implemented', 'improved',
  'increased', 'influenced', 'initiated', 'innovated', 'installed', 'instituted',
  'integrated', 'introduced', 'invented', 'investigated', 'launched', 'led',
  'leveraged', 'maintained', 'managed', 'maximized', 'mentored', 'migrated',
  'minimized', 'modernized', 'monitored', 'negotiated', 'operated', 'optimized',
  'orchestrated', 'organized', 'oversaw', 'partnered', 'performed', 'pioneered',
  'planned', 'prepared', 'presented', 'prioritized', 'processed', 'produced',
  'programmed', 'proposed', 'published', 'rebuilt', 'reconciled', 'redesigned',
  'reduced', 'refactored', 'remodeled', 'reorganized', 'replaced', 'researched',
  'resolved', 'restructured', 'revamped', 'reviewed', 'revised', 'scaled',
  'scheduled', 'secured', 'simplified', 'solved', 'spearheaded', 'standardized',
  'streamlined', 'strengthened', 'supervised', 'surpassed', 'trained',
  'transformed', 'translated', 'tripled', 'unified', 'upgraded', 'utilized',
]);

// ── Weak Filler Phrases ──
export const WEAK_PHRASES = [
  'responsible for', 'helped with', 'worked on', 'assisted in', 'duties included',
  'was tasked with', 'participated in', 'involved in', 'took part in', 'handled',
  'was responsible', 'dealt with', 'in charge of', 'served as', 'acted as',
  'was involved', 'helped to', 'contributed to',
];

// ── Types ──
export interface QualityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'section' | 'content' | 'formatting' | 'contact' | 'keyword';
  title: string;
  description: string;
  section?: string;
  fixSuggestion?: string;
}

export interface KeywordGap {
  keyword: string;
  importance: 'high' | 'medium' | 'low';
  occurrencesInJD: number;
}

export interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
}

export interface ATSResult {
  qualityScore: number;
  qualityIssues: QualityIssue[];
  sectionScores: SectionScore[];
  atsScore: number | null;
  keywordGaps: KeywordGap[];
  matchedKeywords: string[];
  keywordMatchRate: number | null;
}

// ── Keyword Extraction ──
let cachedJD = '';
let cachedTokens: string[] = [];

function tokenizeJobDescription(jd: string): string[] {
  if (jd === cachedJD && cachedTokens.length > 0) return cachedTokens;

  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her',
    'was', 'one', 'our', 'out', 'has', 'have', 'been', 'from', 'with', 'they',
    'will', 'that', 'this', 'your', 'what', 'when', 'make', 'like', 'than',
    'them', 'some', 'just', 'also', 'into', 'year', 'etc', 'other', 'more',
    'about', 'which', 'their', 'would', 'could', 'should', 'being', 'able',
    'well', 'such', 'must', 'using', 'work', 'team', 'role', 'experience',
    'ability', 'position', 'looking', 'strong', 'including', 'across',
    'within', 'through', 'between', 'join', 'company', 'opportunity',
    'successful', 'successfully', 'proven', 'track', 'record', 'growth',
    'high', 'level', 'results', 'driven', 'detail', 'oriented', 'skills',
  ]);

  const multiWordPatterns = [
    /machine learning/gi, /deep learning/gi, /data science/gi, /data engineering/gi,
    /full stack/gi, /front end/gi, /back end/gi, /ci\/cd/gi, /natural language/gi,
    /computer vision/gi, /artificial intelligence/gi, /cloud computing/gi,
    /project management/gi, /product management/gi, /software engineering/gi,
    /system design/gi, /distributed systems/gi, /version control/gi,
    /object oriented/gi, /test driven/gi, /agile methodology/gi,
    /cross functional/gi, /problem solving/gi,
  ];

  const multiWordTerms: string[] = [];
  for (const pattern of multiWordPatterns) {
    const matches = jd.match(pattern);
    if (matches) multiWordTerms.push(...matches.map(m => m.toLowerCase().trim()));
  }

  const words = jd
    .replace(/[^a-zA-Z0-9+#./\-\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length >= 3 && !stopWords.has(w));

  const wordCounts = new Map<string, number>();
  for (const w of words) wordCounts.set(w, (wordCounts.get(w) || 0) + 1);

  const unique = Array.from(new Set([...multiWordTerms, ...words]));
  cachedJD = jd;
  cachedTokens = unique;
  return unique;
}

// ── Resume Text Extraction ──
export function extractResumeText(resumeData: ResumeData): string {
  const parts: string[] = [];

  const b = resumeData.basics;
  if (b.summary) parts.push(b.summary);
  if (b.name) parts.push(b.name);

  for (const w of resumeData.work) {
    if (w.company) parts.push(w.company);
    if (w.position) parts.push(w.position);
    if (w.bullets) parts.push(...w.bullets);
  }

  for (const e of resumeData.education) {
    if (e.institution) parts.push(e.institution);
    if (e.degree) parts.push(e.degree);
    if (e.field) parts.push(e.field);
    if (e.thesis) parts.push(e.thesis);
    if (e.clubs) parts.push(...e.clubs.map(c => `${c.name} ${c.role || ''} ${(c.bullets || []).join(' ')}`));
    if (e.courses) parts.push(...e.courses);
    if (e.activities) parts.push(...e.activities.map(a => `${a.title} ${(a.items || []).join(' ')}`));
  }

  for (const s of resumeData.skills) {
    if (s.category) parts.push(s.category);
    if (s.items) parts.push(...s.items);
  }

  for (const p of resumeData.projects) {
    if (p.name) parts.push(p.name);
    if (p.bullets) parts.push(...p.bullets);
    if (p.keywords) parts.push(...p.keywords);
    if (p.url) parts.push(p.url);
  }

  for (const a of resumeData.awards) {
    if (a.title) parts.push(a.title);
    if (a.awarder) parts.push(a.awarder);
    if (a.summary) parts.push(a.summary);
  }

  for (const cs of resumeData.customSections) {
    if (cs.title) parts.push(cs.title);
    for (const item of cs.items) {
      if (item.title) parts.push(item.title);
      if (item.subtitle) parts.push(item.subtitle);
      if (item.bullets) parts.push(...item.bullets);
    }
  }

  return parts.filter(Boolean).join(' ');
}

// ── General Quality Checks (STRICT) ──
function runQualityChecks(resumeData: ResumeData): { issues: QualityIssue[]; sectionScores: SectionScore[] } {
  const issues: QualityIssue[] = [];
  const sectionScores: SectionScore[] = [];

  // 1. Summary (max 15)
  const summaryScore: SectionScore = { name: 'Summary', score: 0, maxScore: 15, issues: [] };
  if (!resumeData.basics.summary || resumeData.basics.summary.trim().length === 0) {
    issues.push({ id: 'summary-missing', severity: 'error', category: 'section', title: 'Missing Summary', description: 'Add a professional summary — recruiters spend 6 seconds scanning your resume.', section: 'basics', fixSuggestion: 'Write 2-3 sentences: years of experience, key skills, target role.' });
    summaryScore.issues.push('Missing');
  } else {
    const summary = resumeData.basics.summary.trim();
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const wc = summary.split(/\s+/).length;

    if (sentences.length < 2) {
      summaryScore.score = 4;
      summaryScore.issues.push('Too short');
      issues.push({ id: 'summary-short', severity: 'warning', category: 'content', title: 'Summary Too Short', description: 'Aim for 2-3 sentences (40-60 words).', section: 'basics', fixSuggestion: 'Expand with years of experience, specializations, and value proposition.' });
    } else if (wc < 30) {
      summaryScore.score = 7;
      summaryScore.issues.push('Brief');
    } else if (wc < 50) {
      summaryScore.score = 10;
    } else {
      summaryScore.score = 13;
    }
    if (/\d+\s*(years?|yrs?)\s*(of\s*)?(experience|expertise)/i.test(summary)) {
      summaryScore.score = Math.min(summaryScore.score + 2, 15);
    }
  }
  sectionScores.push(summaryScore);

  // 2. Experience (max 30)
  const expScore: SectionScore = { name: 'Experience', score: 0, maxScore: 30, issues: [] };
  if (resumeData.work.length === 0) {
    issues.push({ id: 'work-missing', severity: 'error', category: 'section', title: 'Missing Experience', description: 'Add work experience to demonstrate your professional background.', section: 'work' });
    expScore.issues.push('Missing');
  } else {
    let bulletPoints = 0, actionVerbCount = 0, quantifiedCount = 0, weakPhraseCount = 0, shortBullets = 0;

    for (let i = 0; i < resumeData.work.length; i++) {
      const w = resumeData.work[i];
      const bullets = (w.bullets || []).filter(b => b.trim().length > 0);
      bulletPoints += bullets.length;

      if (!w.startDate?.trim()) {
        issues.push({ id: `work-${i}-dates`, severity: 'warning', category: 'content', title: `"${w.position || `Entry #${i + 1}`}" missing dates`, description: 'ATS parsers need start/end dates.', section: 'work', fixSuggestion: 'Format: "Jan 2022 — Present".' });
      }
      if (bullets.length < 3) {
        issues.push({ id: `work-${i}-bullets`, severity: 'warning', category: 'content', title: `"${w.position || `Entry #${i + 1}`}" needs more bullets`, description: `Has ${bullets.length} bullets — aim for 3-5 per role.`, section: 'work' });
        expScore.issues.push(`Entry ${i + 1}: few bullets`);
      }

      for (const bullet of bullets) {
        const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        if (firstWord && ACTION_VERBS.has(firstWord)) actionVerbCount++;
        if (bullet.trim().split(/\s+/).length < 8) shortBullets++;
        if (/\d+%|\$[\d,]+|\d+x|\d+\+|\d+\s*(users?|clients?|projects?|engineers?|team)/i.test(bullet)) quantifiedCount++;

        const lowerBullet = bullet.toLowerCase();
        for (const phrase of WEAK_PHRASES) {
          if (lowerBullet.includes(phrase)) {
            weakPhraseCount++;
            issues.push({ id: `weak-${i}-${bullet.slice(0, 15)}`, severity: 'warning', category: 'content', title: 'Weak Phrasing', description: `"${phrase}" in "${bullet.slice(0, 50)}..."`, section: 'work', fixSuggestion: `Replace with "Led", "Built", "Implemented", or "Architected".` });
            break;
          }
        }
      }
    }

    const bulletScore = Math.min(bulletPoints / (resumeData.work.length * 4), 1) * 8;
    const actionRate = bulletPoints > 0 ? actionVerbCount / bulletPoints : 0;
    const actionScore = actionRate >= 0.85 ? 8 : actionRate >= 0.6 ? 5 : actionRate >= 0.4 ? 3 : 0;
    const quantRate = bulletPoints > 0 ? quantifiedCount / bulletPoints : 0;
    const quantScore = quantRate >= 0.4 ? 8 : quantRate >= 0.2 ? 5 : quantifiedCount >= 3 ? 3 : 0;
    const penalty = Math.min(shortBullets * 2.5, 10) + Math.min(weakPhraseCount * 4, 12);
    expScore.score = Math.max(0, Math.round(bulletScore + actionScore + quantScore - penalty));

    if (actionVerbCount < bulletPoints * 0.5) {
      issues.push({ id: 'action-verbs', severity: 'warning', category: 'content', title: 'Few Action Verbs', description: `${actionVerbCount}/${bulletPoints} bullets start with action verbs. Aim for 80%+.`, fixSuggestion: 'Start each bullet: "Built", "Led", "Reduced", "Designed"...' });
    }
    if (quantifiedCount < 2 && bulletPoints > 3) {
      issues.push({ id: 'quantified', severity: 'warning', category: 'content', title: 'No Quantified Achievements', description: 'Top resumes quantify 30%+ of bullets with numbers, %, or $.', fixSuggestion: '"Reduced load time by 40%" or "Managed 12 engineers".' });
    }
    if (shortBullets > 2) {
      issues.push({ id: 'short-bullets', severity: 'info', category: 'content', title: `${shortBullets} Bullets Too Short`, description: 'Bullets under 8 words look generic. Aim for 12-20 words.' });
    }
    if (weakPhraseCount > 0) expScore.issues.push(`${weakPhraseCount} weak phrases`);
  }
  sectionScores.push(expScore);

  // 3. Education (max 10)
  const eduScore: SectionScore = { name: 'Education', score: 0, maxScore: 10, issues: [] };
  if (resumeData.education.length === 0) {
    issues.push({ id: 'edu-missing', severity: 'warning', category: 'section', title: 'Missing Education', description: 'Add your educational background.', section: 'education' });
    eduScore.issues.push('Missing');
  } else {
    let pts = 3;
    const edu = resumeData.education[0];
    if (edu.degree?.trim()) pts += 2;
    else issues.push({ id: 'edu-degree', severity: 'info', category: 'content', title: 'Missing Degree Type', description: 'Specify degree (B.S., M.S., Ph.D.).', section: 'education' });
    if (edu.field?.trim()) pts += 2;
    else issues.push({ id: 'edu-field', severity: 'info', category: 'content', title: 'Missing Field of Study', description: 'Add your major/field.', section: 'education' });
    if (edu.graduationDate?.trim()) pts += 2;
    if (edu.gpa?.trim()) pts += 1;
    eduScore.score = Math.min(pts, 10);
  }
  sectionScores.push(eduScore);

  // 4. Skills (max 20) — strict
  const skillsScore: SectionScore = { name: 'Skills', score: 0, maxScore: 20, issues: [] };
  const allSkills = resumeData.skills.flatMap(s => s.items);
  const categories = resumeData.skills.filter(s => s.items.length > 0).length;

  if (allSkills.length === 0) {
    issues.push({ id: 'skills-missing', severity: 'error', category: 'section', title: 'Missing Skills', description: 'ATS heavily relies on keyword matching from skills.', section: 'skills' });
    skillsScore.issues.push('Missing');
  } else {
    let pts = 0;
    if (allSkills.length >= 15) pts += 10;
    else if (allSkills.length >= 10) pts += 8;
    else if (allSkills.length >= 5) pts += 5;
    else pts += Math.round((allSkills.length / 5) * 3);

    if (categories >= 3) pts += 6;
    else if (categories >= 2) pts += 4;
    else pts += 2;

    const hasNamedCats = resumeData.skills.some(s => s.category.trim().length > 0 && s.category.toLowerCase() !== 'skills');
    if (hasNamedCats) pts += 4;
    else issues.push({ id: 'skills-categories', severity: 'info', category: 'content', title: 'Categorize Skills', description: 'Group by type: "Languages", "Frameworks", "Tools".', section: 'skills' });

    if (allSkills.length < 8) {
      issues.push({ id: 'skills-few', severity: 'warning', category: 'content', title: 'Few Skills Listed', description: `${allSkills.length} skills — aim for 10-15.`, section: 'skills' });
      skillsScore.issues.push('Too few');
    }
    skillsScore.score = Math.min(pts, 20);
  }
  sectionScores.push(skillsScore);

  // 5. Contact (max 10)
  const contactScore: SectionScore = { name: 'Contact', score: 0, maxScore: 10, issues: [] };
  let cp = 0;
  if (resumeData.basics.name?.trim()) cp += 2;
  else issues.push({ id: 'contact-name', severity: 'error', category: 'contact', title: 'Missing Name', description: 'Name is required.', section: 'basics' });
  if (resumeData.basics.email?.trim()) cp += 2;
  else issues.push({ id: 'contact-email', severity: 'error', category: 'contact', title: 'Missing Email', description: 'Email is required.', section: 'basics' });
  if (resumeData.basics.phone?.trim()) cp += 2;
  else issues.push({ id: 'contact-phone', severity: 'warning', category: 'contact', title: 'Missing Phone', description: 'Recruiters need a phone number.', section: 'basics' });
  if (resumeData.basics.address?.trim()) cp += 1;
  else issues.push({ id: 'contact-location', severity: 'info', category: 'contact', title: 'No Location', description: 'City/state helps with location matching.', section: 'basics' });
  if (resumeData.basics.websites?.length > 0 && resumeData.basics.websites.some(w => w.url?.trim())) cp += 3;
  else issues.push({ id: 'contact-links', severity: 'info', category: 'contact', title: 'No Portfolio/Links', description: 'Add LinkedIn, GitHub, or portfolio.', section: 'basics', fixSuggestion: 'Add your LinkedIn URL at minimum.' });
  
  // Stricter contact penalty if multiple items missing
  if (cp < 5) cp = Math.max(0, cp - 2); 
  
  contactScore.score = Math.min(cp, 10);
  sectionScores.push(contactScore);

  // 6. Length (max 10)
  const fullText = extractResumeText(resumeData);
  const wc = fullText.split(/\s+/).filter(w => w.length > 0).length;
  const lengthScore: SectionScore = { name: 'Length', score: 0, maxScore: 10, issues: [] };
  if (wc < 150) {
    issues.push({ id: 'length-short', severity: 'error', category: 'formatting', title: 'Resume Too Short', description: `${wc} words. Aim for 400-800.` });
    lengthScore.score = Math.round((wc / 400) * 10);
    lengthScore.issues.push('Too short');
  } else if (wc < 300) {
    issues.push({ id: 'length-lacking', severity: 'warning', category: 'formatting', title: 'Needs More Content', description: `${wc} words. Strong resumes: 400-800 words.` });
    lengthScore.score = 5;
  } else if (wc > 1200) {
    issues.push({ id: 'length-long', severity: 'info', category: 'formatting', title: 'May Be Too Long', description: `${wc} words. Consider condensing.` });
    lengthScore.score = 7;
  } else {
    lengthScore.score = 10;
  }
  sectionScores.push(lengthScore);

  // 7. Projects (max 5 — bonus)
  const projectScore: SectionScore = { name: 'Projects', score: 0, maxScore: 5, issues: [] };
  if (resumeData.projects.length === 0) {
    issues.push({ id: 'projects-missing', severity: 'info', category: 'section', title: 'No Projects', description: 'Projects strengthen technical resumes.', section: 'projects', fixSuggestion: 'Add 2-3 notable projects with tech keywords.' });
  } else {
    const pb = resumeData.projects.reduce((s, p) => s + (p.bullets?.filter(b => b.trim()).length || 0), 0);
    projectScore.score = pb >= 4 ? 5 : pb >= 2 ? 3 : 1;
  }
  sectionScores.push(projectScore);

  return { issues, sectionScores };
}

// ── Keyword Matching ──
function matchKeywords(resumeData: ResumeData, jobDescription: string): {
  gaps: KeywordGap[];
  matched: string[];
  matchRate: number;
} {
  const jdTokens = tokenizeJobDescription(jobDescription);
  if (jdTokens.length === 0) return { gaps: [], matched: [], matchRate: 0 };

  const resumeText = extractResumeText(resumeData).toLowerCase();
  const matched: string[] = [];
  const gaps: KeywordGap[] = [];
  const jdLower = jobDescription.toLowerCase();

  for (const token of jdTokens) {
    if (resumeText.includes(token)) {
      matched.push(token);
    } else {
      const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const occurrences = (jdLower.match(regex) || []).length;
      const importance: 'high' | 'medium' | 'low' = occurrences >= 3 ? 'high' : occurrences >= 2 ? 'medium' : 'low';
      gaps.push({ keyword: token, importance, occurrencesInJD: occurrences });
    }
  }

  gaps.sort((a, b) => {
    const rank = { high: 3, medium: 2, low: 1 };
    return (rank[b.importance] - rank[a.importance]) || (b.occurrencesInJD - a.occurrencesInJD);
  });

  const matchRate = jdTokens.length > 0 ? matched.length / jdTokens.length : 0;
  return { gaps: gaps.slice(0, 30), matched, matchRate };
}

// ── Main Scoring Function ──
export function calculateATSScore(resumeData: ResumeData, jobDescription?: string): ATSResult {
  const { issues: qualityIssues, sectionScores } = runQualityChecks(resumeData);

  const totalAchieved = sectionScores.reduce((sum, s) => sum + s.score, 0);
  const totalMax = sectionScores.reduce((sum, s) => sum + s.maxScore, 0);
  const qualityScore = totalMax > 0 ? Math.round((totalAchieved / totalMax) * 100) : 0;

  let atsScore: number | null = null;
  let keywordGaps: KeywordGap[] = [];
  let matchedKeywords: string[] = [];
  let keywordMatchRate: number | null = null;

  if (jobDescription && jobDescription.trim().length > 50) {
    const { gaps, matched, matchRate } = matchKeywords(resumeData, jobDescription);
    keywordGaps = gaps;
    matchedKeywords = matched;
    keywordMatchRate = matchRate;
    // ATS score: 70% keyword match + 30% quality (keywords are king for ATS)
    atsScore = Math.round(matchRate * 80 + (qualityScore / 100) * 20);
    // ATS score should almost always be slightly higher or equal to quality if keywords exist
    if (atsScore < qualityScore && matchRate > 0.1) {
      atsScore = Math.min(100, Math.round(qualityScore + (matchRate * 10)));
    }
  }

  return { qualityScore, qualityIssues, sectionScores, atsScore, keywordGaps, matchedKeywords, keywordMatchRate };
}

// ── Utility ──
export function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Weak';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI-Powered Deep Analysis (via Gemini)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AIATSSuggestion {
  section: string;
  currentText?: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AIATSResult {
  overallScore: number;
  summary: string;
  suggestions: AIATSSuggestion[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
}

export async function runAIATSAnalysis(
  apiKey: string,
  resumeData: ResumeData,
  jobDescription: string,
): Promise<AIATSResult> {
  const { callGeminiAPI } = await import('./geminiService');

  const resumeText = extractResumeText(resumeData);

  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach. Analyze how well this resume matches the given job description.

=== RESUME ===
${resumeText.slice(0, 4000)}

=== JOB DESCRIPTION ===
${jobDescription.slice(0, 3000)}

Respond in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>"],
  "suggestions": [
    {
      "section": "<Summary, Experience, Skills, Education, or Projects>",
      "suggestion": "<specific, actionable improvement>",
      "impact": "<high, medium, or low>"
    }
  ]
}

Be strict — most resumes should score 40-70. Only perfectly tailored resumes score 80+.
Focus on: keyword alignment, skills gaps, experience relevance, concrete rewording suggestions.
Provide 4-8 suggestions. Return ONLY valid JSON.`;

  const raw = await callGeminiAPI(apiKey, prompt);
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      overallScore: Math.max(0, Math.min(100, Number(parsed.overallScore) || 50)),
      summary: String(parsed.summary || 'Analysis complete.'),
      suggestions: (parsed.suggestions || []).map((s: Record<string, string>) => ({
        section: String(s.section || 'General'),
        currentText: s.currentText ? String(s.currentText) : undefined,
        suggestion: String(s.suggestion || ''),
        impact: (['high', 'medium', 'low'].includes(s.impact) ? s.impact : 'medium') as 'high' | 'medium' | 'low',
      })),
      missingKeywords: (parsed.missingKeywords || []).map(String),
      strengths: (parsed.strengths || []).map(String),
      weaknesses: (parsed.weaknesses || []).map(String),
    };
  } catch {
    return {
      overallScore: 50,
      summary: raw.slice(0, 300),
      suggestions: [],
      missingKeywords: [],
      strengths: [],
      weaknesses: ['Could not parse AI response — try again.'],
    };
  }
}
