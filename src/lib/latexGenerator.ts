/**
 * LaTeX Generator
 *
 * Converts ResumeData JSON into a complete LaTeX document string.
 * Supports multiple template variants via LaTeXTemplateConfig.
 *
 * Templates:
 *   11 = Professional (standard spacing, 0.75in margins)
 *   12 = Compact (1.0 line spacing, 0.5in margins, tighter sections)
 *   13 = Ultra Compact (0.9 line spacing, 0.35in margins, 9pt font, minimal gaps)
 *   14 = Academic (serif, two-column skills, publication-ready style)
 *
 * Markdown-like formatting is supported in all text fields:
 *   **bold text** → \textbf{bold text}
 *   *italic text* → \textit{italic text}
 */

import type { ResumeData, TemplateId, LaTeXFormattingOptions } from '../types';
import { htmlToLatex, containsHtml } from './htmlToLatex';

// ─── Template Configuration ─────────────────────────────────────────────────

export interface LaTeXTemplateConfig {
    fontSize: string;           // e.g. '11pt', '10pt', '9pt'
    margins: string;            // e.g. '0.75in', '0.5in'
    headerSize: string;         // e.g. '\\Huge', '\\LARGE', '\\Large'
    sectionTitleSize: string;   // e.g. '\\large', '\\normalsize'
    sectionSpaceBefore: string; // e.g. '12pt', '8pt', '4pt'
    sectionSpaceAfter: string;  // e.g. '6pt', '4pt', '2pt'
    itemSep: string;            // space between job/edu entries e.g. '6pt', '3pt', '1pt'
    bulletItemSep: string;      // space between bullet items e.g. '0pt', '-1pt', '-2pt'
    bulletTopSep: string;       // space above bullet list e.g. '4pt', '2pt', '0pt'
    headerVSpace: string;       // vspace after contact line e.g. '0.1in', '0.05in', '2pt'
    contactVSpace: string;      // vspace after name e.g. '4pt', '2pt', '1pt'
    parskip: boolean;           // whether to use parskip package
    extraPreamble?: string;     // extra preamble commands
}

const TEMPLATE_CONFIGS: Record<number, LaTeXTemplateConfig> = {
    // 11: Professional — generous spacing, easy to read
    11: {
        fontSize: '11pt',
        margins: '0.75in',
        headerSize: '\\Huge',
        sectionTitleSize: '\\large',
        sectionSpaceBefore: '12pt',
        sectionSpaceAfter: '6pt',
        itemSep: '6pt',
        bulletItemSep: '0pt',
        bulletTopSep: '4pt',
        headerVSpace: '0.1in',
        contactVSpace: '4pt',
        parskip: true,
    },
    // 12: Compact — tighter but still readable (1.0 line spacing)
    12: {
        fontSize: '10pt',
        margins: '0.5in',
        headerSize: '\\LARGE',
        sectionTitleSize: '\\normalsize',
        sectionSpaceBefore: '8pt',
        sectionSpaceAfter: '3pt',
        itemSep: '3pt',
        bulletItemSep: '-1pt',
        bulletTopSep: '2pt',
        headerVSpace: '0.05in',
        contactVSpace: '2pt',
        parskip: true,
        extraPreamble: '\\linespread{1.0}\\selectfont',
    },
    // 13: Ultra Compact — maximum density, 9pt font
    13: {
        fontSize: '9pt',
        margins: '0.35in',
        headerSize: '\\Large',
        sectionTitleSize: '\\normalsize',
        sectionSpaceBefore: '4pt',
        sectionSpaceAfter: '2pt',
        itemSep: '1pt',
        bulletItemSep: '-2pt',
        bulletTopSep: '0pt',
        headerVSpace: '2pt',
        contactVSpace: '1pt',
        parskip: false,
        extraPreamble: '\\linespread{0.92}\\selectfont\n\\setlength{\\parskip}{0pt}',
    },
    // 14: Academic — classic academic CV style with serif and wider margins
    14: {
        fontSize: '11pt',
        margins: '1in',
        headerSize: '\\LARGE',
        sectionTitleSize: '\\large',
        sectionSpaceBefore: '10pt',
        sectionSpaceAfter: '4pt',
        itemSep: '4pt',
        bulletItemSep: '0pt',
        bulletTopSep: '3pt',
        headerVSpace: '0.08in',
        contactVSpace: '3pt',
        parskip: true,
        extraPreamble: '% Academic style: use Computer Modern serif throughout\n\\usepackage{lmodern}',
    },
    // 21: Professional LaTeX Cover Letter
    21: {
        fontSize: '11pt',
        margins: '1.0in',
        headerSize: '\\Huge',
        sectionTitleSize: '\\large',
        sectionSpaceBefore: '12pt',
        sectionSpaceAfter: '6pt',
        itemSep: '8pt',
        bulletItemSep: '0pt',
        bulletTopSep: '4pt',
        headerVSpace: '0.2in',
        contactVSpace: '4pt',
        parskip: true,
    },
    // 22: Executive LaTeX Cover Letter
    22: {
        fontSize: '10pt',
        margins: '0.8in',
        headerSize: '\\LARGE',
        sectionTitleSize: '\\normalsize',
        sectionSpaceBefore: '10pt',
        sectionSpaceAfter: '4pt',
        itemSep: '6pt',
        bulletItemSep: '0pt',
        bulletTopSep: '2pt',
        headerVSpace: '0.15in',
        contactVSpace: '2pt',
        parskip: true,
    },
};

/**
 * Get the config for a LaTeX template, falling back to template 11.
 * If latexFormatting overrides are provided, merge them on top.
 */
export function getLatexConfig(templateId: TemplateId, overrides?: LaTeXFormattingOptions | null): LaTeXTemplateConfig {
    const base = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS[11];
    if (!overrides) return base;

    return {
        ...base,
        fontSize: overrides.fontSize || base.fontSize,
        margins: overrides.margins || base.margins,
        headerSize: `\\${overrides.headerSize || base.headerSize.replace('\\', '')}`,
        sectionTitleSize: `\\${overrides.sectionTitleSize || base.sectionTitleSize.replace('\\', '')}`,
        sectionSpaceBefore: overrides.sectionSpaceBefore || base.sectionSpaceBefore,
        sectionSpaceAfter: overrides.sectionSpaceAfter || base.sectionSpaceAfter,
        itemSep: overrides.itemSep || base.itemSep,
        bulletItemSep: overrides.bulletItemSep || base.bulletItemSep,
        extraPreamble: overrides.lineSpacing && overrides.lineSpacing !== '1.15'
            ? `\\linespread{${overrides.lineSpacing}}\\selectfont${base.extraPreamble ? '\n' + base.extraPreamble : ''}`
            : base.extraPreamble,
    };
}

// ─── Escaping & Formatting ──────────────────────────────────────────────────

/**
 * Escape special LaTeX characters in user-supplied text.
 * Order matters: backslash must be escaped first.
 */
const escapeLatex = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}]/g, '\\$&')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/</g, '\\textless{}')
        .replace(/>/g, '\\textgreater{}');
};

/**
 * Process markdown-like formatting in text:
 *   **bold** → \textbf{bold}
 *   *italic* → \textit{italic}
 *
 * Escapes LaTeX special chars first, then applies formatting.
 */
const formatLatexText = (text: string): string => {
    if (!text) return '';

    // If input contains HTML tags (from rich text editor), use HTML-to-LaTeX converter
    if (containsHtml(text)) {
        return htmlToLatex(text);
    }

    // Legacy: escape LaTeX special chars, then convert markdown formatting
    let result = escapeLatex(text);

    // Convert **bold** to \textbf{bold} (must be before single *)
    result = result.replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}');

    // Convert *italic* to \textit{italic}
    result = result.replace(/\*(.+?)\*/g, '\\textit{$1}');

    return result;
};

// ─── Generator ──────────────────────────────────────────────────────────────

/**
 * Generate a complete LaTeX document from ResumeData.
 * Uses the template config for the selected template (or a specific templateId).
 */
export const generateLaTeXFromData = (data: ResumeData, overrideTemplateId?: TemplateId, latexFormatting?: LaTeXFormattingOptions | null): string => {
    const templateId = overrideTemplateId ?? data.selectedTemplate;
    const cfg = getLatexConfig(templateId, latexFormatting);

    const name = data.basics?.name || 'Your Name';
    const email = data.basics?.email || '';
    const phone = data.basics?.phone || '';
    const address = data.basics?.address || '';

    // Build websites string
    const websiteLinks = (data.basics?.websites || [])
        .filter(w => w.url)
        .map(w => `\\href{${w.url}}{${escapeLatex(w.name || w.url.replace(/^https?:\/\//, ''))}}`)
        .join(' \\textbar{} ');

    // Build contact line parts
    const contactParts: string[] = [];
    if (email) contactParts.push(`\\href{mailto:${email}}{${escapeLatex(email)}}`);
    if (phone) contactParts.push(escapeLatex(phone));
    if (address) contactParts.push(escapeLatex(address));
    if (websiteLinks) contactParts.push(websiteLinks);
    const contactLine = contactParts.join(' \\textbar{} ');

    // Summary section
    const summarySection = data.basics?.summary
        ? `\\section*{Summary}
${formatLatexText(data.basics.summary)}
`
        : '';

    // Work experience section
    const workSection = data.work && data.work.length > 0
        ? `\\section*{Experience}
${data.work.map(job => {
            const bullets = (job.bullets || []).filter(b => b.trim());
            const bulletList = bullets.length > 0
                ? `\\begin{itemize}[leftmargin=*,itemsep=${cfg.bulletItemSep},topsep=${cfg.bulletTopSep}]
${bullets.map(b => `  \\item ${formatLatexText(b)}`).join('\n')}
\\end{itemize}`
                : '';

            return `\\noindent \\textbf{${escapeLatex(job.position || '')}} -- \\textit{${escapeLatex(job.company || '')}} \\hfill ${escapeLatex(job.startDate || '')} -- ${escapeLatex(job.endDate || 'Present')}
${job.location ? `\\\\ ${escapeLatex(job.location)}` : ''}
${bulletList}`;
        }).join(`\n\\vspace{${cfg.itemSep}}\n`)}
`
        : '';

    // Education section — compact two-line format matching standard LaTeX resumes:
    //   Line 1: **University Name**                              Location
    //   Line 2: _Degree, Field_                                  Date
    //   Line 3: (compact) GPA + description as tight bullets
    const educationSection = data.education && data.education.length > 0
        ? `\\section*{Education}
${data.education.map(edu => {
            const degreeField = [edu.degree, edu.field].filter(Boolean).join(', ');
            const institution = edu.institution || '';
            const location = edu.location || '';
            const date = edu.graduationDate || '';

            // Build the header block: line1 \\ line2 (tight, no paragraph break)
            let header = '';
            if (institution) {
                header = `\\noindent \\textbf{${escapeLatex(institution)}} \\hfill ${escapeLatex(location)}`;
                if (degreeField) {
                    header += `\n\\\\ \\textit{${escapeLatex(degreeField)}} \\hfill ${escapeLatex(date)}`;
                }
            } else if (degreeField) {
                header = `\\noindent \\textit{${escapeLatex(degreeField)}} \\hfill ${escapeLatex(date)}`;
            }

            // Compact details: GPA inline, description as tight bullets
            const detailParts: string[] = [];
            if (edu.gpa) detailParts.push(`GPA: ${escapeLatex(edu.gpa)}`);

            const bullets: string[] = [];
            if (detailParts.length > 0) bullets.push(detailParts.join(' \\textbar{} '));
            if (edu.description) bullets.push(formatLatexText(edu.description));

            let details = '';
            if (bullets.length > 0) {
                details = `\n\\begin{itemize}[leftmargin=*,itemsep=${cfg.bulletItemSep},topsep=1pt,parsep=0pt]
${bullets.map(b => `  \\item ${b}`).join('\n')}
\\end{itemize}`;
            }

            // Thesis
            let thesisLine = '';
            if (edu.thesis) {
                thesisLine = `\n\\textit{Thesis: ${escapeLatex(edu.thesis)}}`;
            }

            // Clubs & Organizations
            let clubsBlock = '';
            if (edu.clubs && edu.clubs.length > 0) {
                const clubItems = edu.clubs.map(c => {
                    const datePart = [c.startDate, c.endDate].filter(Boolean).join(' -- ');
                    return `  \\item \\textbf{${escapeLatex(c.name || '')}}${c.role ? ` -- \\textit{${escapeLatex(c.role)}}` : ''}${datePart ? ` \\hfill ${escapeLatex(datePart)}` : ''}`;
                }).join('\n');
                clubsBlock = `\n\n\\textbf{Clubs \\& Organizations:}\n\\begin{itemize}[leftmargin=*,itemsep=${cfg.bulletItemSep},topsep=1pt]\n${clubItems}\n\\end{itemize}`;
            }

            // Relevant Coursework
            let coursesLine = '';
            if (edu.courses && edu.courses.length > 0) {
                coursesLine = `\n\n\\textbf{Relevant Coursework:} ${edu.courses.map(escapeLatex).join(', ')}`;
            }

            // Activities & Honors
            let activitiesBlock = '';
            if (edu.activities && edu.activities.length > 0) {
                activitiesBlock = edu.activities.map(section => {
                    const items = section.items.filter(i => i.trim());
                    if (items.length === 0) return '';
                    return `\n\n\\textbf{${escapeLatex(section.title)}:} ${items.map(escapeLatex).join(', ')}`;
                }).filter(Boolean).join('');
            }

            return header + details + thesisLine + clubsBlock + coursesLine + activitiesBlock;
        }).join(`\n\\vspace{${cfg.itemSep}}\n`)}
`
        : '';

    // Skills section
    const skillsSection = data.skills && data.skills.length > 0
        ? `\\section*{Skills}
${data.skills.map(skillGroup =>
            `\\textbf{${escapeLatex(skillGroup.category || 'Skills')}:} ${(skillGroup.items || []).map(i => formatLatexText(i)).join(', ')}`
        ).join('\n\n')}
`
        : '';

    // Projects section
    const projectsSection = data.projects && data.projects.length > 0
        ? `\\section*{Projects}
${data.projects.map(project => {
            const titleParts = [escapeLatex(project.name || '')];
            if (project.url) {
                titleParts.push(`-- \\href{${project.url}}{${escapeLatex(project.urlName || project.url.replace(/^https?:\/\//, ''))}}`);
            }

            const dateParts: string[] = [];
            if (project.startDate) dateParts.push(escapeLatex(project.startDate));
            if (project.endDate) dateParts.push(escapeLatex(project.endDate));
            const dateStr = dateParts.join(' -- ');

            const keywords = (project.keywords || []).filter(k => k.trim());
            const keywordsLine = keywords.length > 0
                ? `\\\\ \\textit{${keywords.map(escapeLatex).join(', ')}}`
                : '';

            const bullets = (project.bullets || []).filter(b => b.trim());
            const bulletList = bullets.length > 0
                ? `\\begin{itemize}[leftmargin=*,itemsep=${cfg.bulletItemSep},topsep=${cfg.bulletTopSep}]
${bullets.map(b => `  \\item ${formatLatexText(b)}`).join('\n')}
\\end{itemize}`
                : '';

            return `\\textbf{${titleParts.join(' ')}} ${dateStr ? `\\hfill ${dateStr}` : ''}
${keywordsLine}
${bulletList}`;
        }).join(`\n\\vspace{${cfg.itemSep}}\n`)}
`
        : '';

    // Awards section
    const awardsSection = data.awards && data.awards.length > 0
        ? `\\section*{Awards \\& Honors}
\\begin{itemize}[leftmargin=*,itemsep=2pt]
${data.awards.map(award => {
            const parts = [`\\textbf{${escapeLatex(award.title || '')}}`];
            if (award.awarder) parts.push(`-- ${escapeLatex(award.awarder)}`);
            const datePart = award.date ? ` \\hfill ${escapeLatex(award.date)}` : '';
            const summaryPart = award.summary ? `\n\n    ${formatLatexText(award.summary)}` : '';
            return `  \\item ${parts.join(' ')}${datePart}${summaryPart}`;
        }).join('\n')}
\\end{itemize}
`
        : '';

    // Custom sections
    const customSectionsTeX = (data.customSections || []).map(section => {
        const items = section.items || [];
        if (items.length === 0) return '';

        const itemsTeX = items.map(item => {
            const title = item.title ? `\\textbf{${escapeLatex(item.title)}}` : '';
            const subtitle = item.subtitle ? ` -- ${escapeLatex(item.subtitle)}` : '';
            const date = item.date ? ` \\hfill ${escapeLatex(item.date)}` : '';
            const location = item.location ? `\\\\ ${escapeLatex(item.location)}` : '';
            const link = item.link ? `\\\\ \\href{${item.link}}{${escapeLatex(item.link.replace(/^https?:\/\//, ''))}}` : '';

            const bullets = (item.bullets || []).filter(b => b.trim());
            const bulletList = bullets.length > 0
                ? `\\begin{itemize}[leftmargin=*,itemsep=${cfg.bulletItemSep},topsep=${cfg.bulletTopSep}]
${bullets.map(b => `  \\item ${formatLatexText(b)}`).join('\n')}
\\end{itemize}`
                : '';

            return `${title}${subtitle}${date}
${location}
${link}
${bulletList}`;
        }).join(`\n\\vspace{${cfg.itemSep}}\n`);

        return `\\section*{${escapeLatex(section.title || 'Custom Section')}}
${itemsTeX}
`;
    }).filter(s => s).join('\n');

    // Ordered sections based on user's section order
    const sectionMap: Record<string, string> = {
        profile: summarySection,
        work: workSection,
        education: educationSection,
        skills: skillsSection,
        projects: projectsSection,
        awards: awardsSection,
    };

    // Build sections in user's configured order
    const orderedSections = (data.sections || ['profile', 'work', 'education', 'skills', 'projects', 'awards'])
        .map(key => sectionMap[key] || '')
        .filter(s => s)
        .join('\n');

    return `\\documentclass[${cfg.fontSize},letterpaper]{article}

% Essential packages
\\usepackage[utf8]{inputenc}
\\usepackage[margin=${cfg.margins}]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage[normalem]{ulem}
${cfg.parskip ? '\\usepackage{parskip}' : ''}
\\usepackage{titlesec}
${cfg.extraPreamble ? `\n${cfg.extraPreamble}` : ''}

% Hyperlink configuration
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue,
    pdfauthor={${escapeLatex(name)}},
    pdftitle={Resume - ${escapeLatex(name)}}
}

% Section title formatting
\\titleformat{\\section}{${cfg.sectionTitleSize}\\bfseries}{}{0pt}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{${cfg.sectionSpaceBefore}}{${cfg.sectionSpaceAfter}}

% Remove page numbers for single-page resume
\\pagestyle{empty}

\\begin{document}

% Header
\\begin{center}
{${cfg.headerSize} \\textbf{${escapeLatex(name)}}}

\\vspace{${cfg.contactVSpace}}
${contactLine}
\\end{center}

\\vspace{${cfg.headerVSpace}}

${orderedSections}
${customSectionsTeX}

\\end{document}
`;
};

/**
 * Generate a complete LaTeX cover letter document.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateLaTeXCoverLetter = (data: any, templateId: number): string => {
    // Falls back to Professional (11) if templateId is not 21-23
    const cfg = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS[11];
    const { recipientName, recipientTitle, company, companyAddress, date, content, closing, signature, userBasics } = data;

    const userName = userBasics?.name || 'Your Name';
    const email = userBasics?.email || '';
    const phone = userBasics?.phone || '';
    const address = userBasics?.address || '';

    const bodyContent = content || '';
    const normalizedContent = bodyContent.toLowerCase().trim();
    const hasGreeting = normalizedContent.startsWith('dear') ||
        normalizedContent.startsWith('to ') ||
        normalizedContent.startsWith('hello') ||
        normalizedContent.startsWith('hi ');

    const hasClosing = normalizedContent.includes('sincerely') ||
        normalizedContent.includes('thank you') ||
        normalizedContent.includes('best regards') ||
        normalizedContent.includes('kind regards') ||
        normalizedContent.includes('yours truly') ||
        normalizedContent.includes('thanks,') ||
        normalizedContent.includes('regards,');

    return `\\documentclass[${cfg.fontSize},letterpaper]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[margin=${cfg.margins}]{geometry}
\\usepackage{hyperref}
${cfg.parskip ? '\\usepackage{parskip}' : ''}

% Professional cover letter font
\\usepackage{charter}

\\begin{document}

% User Header
\\begin{center}
    {\\Huge \\textbf{${escapeLatex(userName)}}} \\\\
    \\vspace{4pt}
    ${escapeLatex(address)} \\textbar{} ${escapeLatex(phone)} \\textbar{} ${escapeLatex(email)}
\\end{center}

\\vspace{0.2in}

% Date
${escapeLatex(date || new Date().toLocaleDateString())}

\\vspace{0.2in}

% Recipient
\\noindent ${escapeLatex(recipientName || '')} \\\\
${recipientTitle ? escapeLatex(recipientTitle) + ' \\\\' : ''}
${company ? '\\textbf{' + escapeLatex(company) + '} \\\\' : ''}
${escapeLatex(companyAddress || '')}

\\vspace{0.2in}

${hasGreeting ? '' : `Dear ${escapeLatex(recipientName || 'Hiring Manager')}, \\\\ \\vspace{0.15in}`}

${bodyContent.split('\n').map((line: string) => line.trim() === '' ? '\\par\\vspace{10pt}' : escapeLatex(line)).join('\n')}

\\vspace{0.3in}

${hasClosing ? '' : `${escapeLatex(closing || 'Sincerely')}, \\\\ \\vspace{0.4in} \\textbf{${escapeLatex(signature || userName)}}`}

\\end{document}
`;
};
