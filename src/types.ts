// Core Resume Data Types
export interface ResumeData {
    basics: Basics;
    education: Education[];
    work: WorkExperience[];
    skills: Skill[];
    projects: Project[];
    awards: Award[];
    customSections: CustomSection[];
    sections: SectionKey[];
    selectedTemplate: TemplateId;
    formatting: FormattingOptions;
}

export interface CustomSectionEntry {
    title: string;
    subtitle: string;
    date: string;
    location: string;
    link: string;
    bullets: string[];
}

export interface CustomSection {
    id: string;
    title: string;
    type: 'bullets' | 'text';
    items: CustomSectionEntry[];
}

export interface Basics {
    name: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    websites: Website[];
}

export interface Website {
    name: string;
    url: string;
}

export interface WorkExperience {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}

export interface Education {
    institution: string;
    degree: string;
    field: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    description?: string;
    thesis?: string;
    clubs?: Club[];
    courses?: string[];
    activities?: ActivitySection[];
}

export interface Skill {
    category: string;
    items: string[];
}

export interface Project {
    name: string;
    bullets: string[];
    keywords: string[];
    url?: string;
    urlName?: string;
    startDate?: string;
    endDate?: string;
}

export interface Award {
    title: string;
    awarder: string;
    date: string;
    summary?: string;
}

export interface Club {
    name: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}

export interface Course {
    name: string;
    institution: string;
    date: string;
    description?: string;
}

export interface ActivitySection {
    title: string;
    items: string[];
}

// Template Types
export type TemplateId = number;
export type PreloadedTemplateId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 12 | 13 | 14 | 21 | 22 | 23 | 24 | 25;
export type SectionKey = 'profile' | 'education' | 'work' | 'skills' | 'projects' | 'awards' | string;

export interface CustomTemplate {
    id: number;              // IDs start at 100
    name: string;
    baseTemplateId: PreloadedTemplateId;
    formatting: FormattingOptions;
    createdAt: string;
}

export interface TemplateMetadata {
    id: TemplateId;
    name: string;
    description: string;
    previewImage: string;
}

export interface TemplateProps {
    data: ResumeData;
}

// Formatting Types
export interface FormattingOptions {
    fontFamily: FontFamily;
    baseFontSize: string;
    nameSize: NameSize;
    sectionTitleSize: SectionTitleSize;
    sectionTitleBold: boolean;
    sectionTitleUnderline: boolean;
    lineSpacing: string;
    sectionSpacing: Spacing;
    paragraphSpacing: Spacing;
    pageMargins: PageMargins;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    // Granular Spacing
    entrySpacing: Spacing;
    bulletSpacing: Spacing;
    bulletGap: string; // spacing between bullet and text
    // Typography
    sectionHeaderStyle: 'uppercase' | 'capitalize' | 'normal';
    fontWeightName: string;
    fontWeightSectionTitle: string;
    fontWeightBody: string;
    // Decorative
    showIcons: boolean;
    socialIconStyle: 'circle' | 'square' | 'none';
    pageFormat: 'Letter' | 'A4';
    bulletStyle: BulletStyle;
    bulletIndent: BulletIndent;
    colorTheme: ColorTheme;
    customColor: string;
    sectionDividers: SectionDivider;
    headerLineStyle: HeaderLineStyle;
    headerAlignment: Alignment;
    separator: '•' | '|' | '·' | '—'; // Universal separator for contact info and lists
    // Content Controls (Phase 4)
    dateFormat: DateFormat;
    subHeaderWeight: SubHeaderWeight;
    skillLayout: SkillLayout;
    showLocation: boolean;
    showGPA: boolean;
    companyTitleOrder: CompanyTitleOrder;
    // Phase 4.5 — Extended Formatting
    bodyTextWeight: BodyTextWeight;
    italicStyle: ItalicStyle;
    sectionTitleSpacing: Spacing;
    showEducationDescription: boolean;
    showProjectKeywords: boolean;
    showAwardsSummaries: boolean;
    dateSeparator: DateSeparator;
    accentColorPosition: AccentColorPosition;
    density: Density;
}

export type Density = 'ultra' | 'compact' | 'standard' | 'large';
export type FontFamily = 'default' | 'times' | 'arial' | 'calibri' | 'georgia' | 'helvetica' | 'palatino' | 'garamond' | 'cambria' | 'bookAntiqua' | 'centurySchoolbook';
export type NameSize = 'huge' | 'large' | 'large2' | 'normal';
export type SectionTitleSize = 'large' | 'normal' | 'small';
export type Spacing = 'tight' | 'normal' | 'relaxed' | 'spacious';
export type PageMargins = 'narrow' | 'normal' | 'wide' | 'custom';
export type BulletStyle = 'bullet' | 'dash' | 'arrow' | 'circle' | 'square' | 'diamond' | 'star' | 'chevron';
export type BulletIndent = 'none' | 'small' | 'medium' | 'large';
export type ColorTheme = 'black' | 'navy' | 'darkblue' | 'darkgreen' | 'maroon' | 'purple' | 'teal' | 'slate' | 'burgundy' | 'forest' | 'charcoal' | 'steelblue' | 'indigo' | 'coral' | 'olive' | 'custom';
export type SectionDivider = 'none' | 'line' | 'double' | 'thick' | 'dotted' | 'dashed';
export type HeaderLineStyle = 'none' | 'thin' | 'medium' | 'thick' | 'double' | 'dotted' | 'dashed';
export type Alignment = 'left' | 'center' | 'right';
export type DateFormat = 'short' | 'long' | 'numeric';
export type SubHeaderWeight = 'normal' | 'medium' | 'bold';
export type SkillLayout = 'comma' | 'pipe' | 'inline-tags';
export type CompanyTitleOrder = 'company-first' | 'title-first';
export type BodyTextWeight = 'light' | 'normal' | 'medium';
export type ItalicStyle = 'normal' | 'italic';
export type DateSeparator = '—' | '–' | 'to' | '-';
export type AccentColorPosition = 'headers-only' | 'headers-and-links' | 'all-accents';

// LaTeX-specific Formatting
export interface LaTeXFormattingOptions {
    fontSize: '9pt' | '10pt' | '11pt' | '12pt';
    margins: string;          // e.g. '0.75in', '0.5in'
    lineSpacing: string;      // e.g. '1.0', '1.15', '1.2'
    sectionSpaceBefore: string; // e.g. '12pt', '8pt', '4pt'
    sectionSpaceAfter: string;  // e.g. '6pt', '4pt', '2pt'
    itemSep: string;            // between entries e.g. '6pt', '3pt'
    bulletItemSep: string;      // between bullet items e.g. '0pt', '-1pt'
    headerSize: 'Huge' | 'LARGE' | 'Large' | 'large';
    sectionTitleSize: 'Large' | 'large' | 'normalsize';
    latexBulletStyle?: 'bullet' | 'dash' | 'circle' | 'square' | 'filledSquare' | 'star' | 'arrow' | 'asterisk';
}

// API Types
export interface GeneratePDFRequest {
    resumeData: ResumeData;
}

export interface GeneratePDFResponse {
    success: boolean;
    pdfUrl?: string;
    error?: string;
}

// Cover Letter Types
export interface CoverLetterData {
    recipientName: string;
    recipientTitle: string;
    company: string;
    companyAddress: string;
    position: string;
    date: string;
    content: string;
    closing: string;
    signature: string;
    email?: string;
    phone?: string;
    selectedTemplate: TemplateId;
    formatting: FormattingOptions;
    // Reference to resume basics for auto-population
    userBasics?: Basics;
}

// Document Type
export type DocumentType = 'resume' | 'coverletter';

// AI Configuration
export interface AIConfig {
    apiKey: string;
    isConfigured: boolean;
}
