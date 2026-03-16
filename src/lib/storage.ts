import type { ResumeData, CoverLetterData, DocumentType } from '../types';
import { migrateResumeMarkdown } from './migrateMarkdown';

const STORAGE_KEY = 'resume-builder-data';
const VERSION_KEY = 'resume-builder-version';
const CURRENT_VERSION = '2.0';

// Save resume data to localStorage
export function saveResumeData(data: ResumeData): void {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
        console.error('Failed to save resume data:', error);
    }
}

// Load resume data from localStorage
export function loadResumeData(): ResumeData | null {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) {
            return null;
        }

        const data = JSON.parse(serialized) as ResumeData;

        // Migrate old data if needed
        return migrateData(data);
    } catch (error) {
        console.error('Failed to load resume data:', error);
        return null;
    }
}

// Clear all saved data
export function clearResumeData(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERSION_KEY);
    } catch (error) {
        console.error('Failed to clear resume data:', error);
    }
}

// Export to JSON file (full backup including formatting)
export function exportToJSON(data: ResumeData): string {
    return JSON.stringify(data, null, 2);
}

// Export lean JSON (content only — no formatting, no empty fields)
export function exportToContentJSON(data: ResumeData): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lean: Record<string, any> = {
        selectedTemplate: data.selectedTemplate,
    };

    // Basics — only non-empty fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const basics: Record<string, any> = {};
    if (data.basics.name) basics.name = data.basics.name;
    if (data.basics.email) basics.email = data.basics.email;
    if (data.basics.phone) basics.phone = data.basics.phone;
    if (data.basics.address) basics.address = data.basics.address;
    if (data.basics.summary) basics.summary = data.basics.summary;
    const sites = (data.basics.websites || []).filter(w => w.url || w.name);
    if (sites.length > 0) basics.websites = sites;
    if (Object.keys(basics).length > 0) lean.basics = basics;

    // Work — only entries with content
    const work = (data.work || [])
        .filter(j => j.company || j.position)
        .map(j => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const entry: Record<string, any> = {};
            if (j.company) entry.company = j.company;
            if (j.position) entry.position = j.position;
            if (j.location) entry.location = j.location;
            if (j.startDate) entry.startDate = j.startDate;
            if (j.endDate) entry.endDate = j.endDate;
            const bullets = (j.bullets || []).filter(b => b.trim());
            if (bullets.length > 0) entry.bullets = bullets;
            return entry;
        });
    if (work.length > 0) lean.work = work;

    // Education
    const education = (data.education || [])
        .filter(e => e.institution || e.degree)
        .map(e => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const entry: Record<string, any> = {};
            if (e.institution) entry.institution = e.institution;
            if (e.degree) entry.degree = e.degree;
            if (e.field) entry.field = e.field;
            if (e.location) entry.location = e.location;
            if (e.graduationDate) entry.graduationDate = e.graduationDate;
            if (e.gpa) entry.gpa = e.gpa;
            if (e.description) entry.description = e.description;
            return entry;
        });
    if (education.length > 0) lean.education = education;

    // Skills
    const skills = (data.skills || [])
        .filter(s => s.category || s.items.some(i => i.trim()))
        .map(s => ({
            category: s.category,
            items: s.items.filter(i => i.trim()),
        }));
    if (skills.length > 0) lean.skills = skills;

    // Projects
    const projects = (data.projects || [])
        .filter(p => p.name)
        .map(p => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const entry: Record<string, any> = { name: p.name };
            const bullets = (p.bullets || []).filter(b => b.trim());
            if (bullets.length > 0) entry.bullets = bullets;
            const keywords = (p.keywords || []).filter(k => k.trim());
            if (keywords.length > 0) entry.keywords = keywords;
            if (p.url) entry.url = p.url;
            if (p.urlName) entry.urlName = p.urlName;
            if (p.startDate) entry.startDate = p.startDate;
            if (p.endDate) entry.endDate = p.endDate;
            return entry;
        });
    if (projects.length > 0) lean.projects = projects;

    // Awards
    const awards = (data.awards || [])
        .filter(a => a.title)
        .map(a => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const entry: Record<string, any> = { title: a.title };
            if (a.awarder) entry.awarder = a.awarder;
            if (a.date) entry.date = a.date;
            if (a.summary) entry.summary = a.summary;
            return entry;
        });
    if (awards.length > 0) lean.awards = awards;

    // Custom sections
    const customSections = (data.customSections || [])
        .filter(cs => cs.items.some(item => item.title || item.subtitle || (item.bullets && item.bullets.some(b => b.trim()))))
        .map(cs => ({
            id: cs.id,
            title: cs.title,
            type: cs.type,
            items: cs.items.filter(item => item.title || item.subtitle || (item.bullets && item.bullets.some(b => b.trim()))),
        }));
    if (customSections.length > 0) lean.customSections = customSections;

    // Sections order
    if (data.sections) lean.sections = data.sections;

    return JSON.stringify(lean, null, 2);
}

// Import from JSON string
export function importFromJSON(jsonString: string): ResumeData {
    try {
        const data = JSON.parse(jsonString) as ResumeData;
        return migrateData(data);
    } catch {
        throw new Error('Invalid JSON format');
    }
}

// Migrate old data format to new format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateData(data: any): ResumeData {
    // Ensure unique sections
    if (data.sections && Array.isArray(data.sections)) {
        // Standard sections
        const standardSections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];

        // Custom sections from customSections array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customSectionIds = (data.customSections || []).map((cs: any) => cs.id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.sections = Array.from(new Set(data.sections)).filter((s: any) =>
            standardSections.includes(s) || customSectionIds.includes(s)
        );
    }

    // Migrate CustomSections from version 1 (content: string[]) to version 2 (items: CustomSectionEntry[])
    if (data.customSections && Array.isArray(data.customSections)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.customSections = data.customSections.map((section: any) => {
            if (section.content) {
                // If it's the old format, migrate to new format
                const newItems = section.content.map((c: string) => ({
                    title: '',
                    subtitle: '',
                    date: '',
                    location: '',
                    link: '',
                    bullets: [c]
                }));
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { content, ...rest } = section;
                return { ...rest, items: newItems.length > 0 ? newItems : [{ title: '', subtitle: '', date: '', location: '', link: '', bullets: [''] }] };
            }
            return section;
        });
    }

    // Migrate markdown formatting (**bold**, *italic*) to HTML for rich text editor
    migrateResumeMarkdown(data);

    return data as ResumeData;
}

// Dark mode storage
const DARK_MODE_KEY = 'resume-builder-dark-mode';

export function saveDarkMode(enabled: boolean): void {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(enabled));
}

export function loadDarkMode(): boolean {
    try {
        const saved = localStorage.getItem(DARK_MODE_KEY);
        return saved ? JSON.parse(saved) : false;
    } catch {
        return false;
    }
}

// Active tab storage
const ACTIVE_TAB_KEY = 'resume-builder-active-tab';

export function saveActiveTab(tab: string): void {
    localStorage.setItem(ACTIVE_TAB_KEY, tab);
}

export function loadActiveTab(): string {
    return localStorage.getItem(ACTIVE_TAB_KEY) || 'basics';
}

// Cover Letter storage
const COVER_LETTER_KEY = 'resume-builder-cover-letter';

export function saveCoverLetterData(data: CoverLetterData): void {
    try {
        localStorage.setItem(COVER_LETTER_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save cover letter data:', error);
    }
}

export function loadCoverLetterData(): CoverLetterData | null {
    try {
        const saved = localStorage.getItem(COVER_LETTER_KEY);
        if (!saved) return null;

        const data = JSON.parse(saved);

        // Migration: greeting/opening/body -> content
        if (data.greeting || data.opening || data.body) {
            data.content = [
                data.greeting,
                data.opening,
                Array.isArray(data.body) ? data.body.join('\n\n') : data.body
            ].filter(Boolean).join('\n\n');
            delete data.greeting;
            delete data.opening;
            delete data.body;
        }

        return data as CoverLetterData;
    } catch {
        return null;
    }
}

// Document type storage
const DOCUMENT_TYPE_KEY = 'resume-builder-document-type';

export function saveDocumentType(type: DocumentType): void {
    localStorage.setItem(DOCUMENT_TYPE_KEY, type);
}

export function loadDocumentType(): DocumentType {
    const type = localStorage.getItem(DOCUMENT_TYPE_KEY) as DocumentType;
    return type || 'resume';
}

// Continuous mode storage
const CONTINUOUS_MODE_KEY = 'resume-builder-continuous-mode';

export function saveContinuousMode(enabled: boolean): void {
    localStorage.setItem(CONTINUOUS_MODE_KEY, JSON.stringify(enabled));
}

export function loadContinuousMode(): boolean {
    try {
        const saved = localStorage.getItem(CONTINUOUS_MODE_KEY);
        return saved ? JSON.parse(saved) : false;
    } catch {
        return false;
    }
}

// Show resume toggle storage
const SHOW_RESUME_KEY = 'resume-builder-show-resume';

export function saveShowResume(enabled: boolean): void {
    localStorage.setItem(SHOW_RESUME_KEY, JSON.stringify(enabled));
}

export function loadShowResume(): boolean {
    try {
        const saved = localStorage.getItem(SHOW_RESUME_KEY);
        return saved !== null ? JSON.parse(saved) : true;
    } catch {
        return true;
    }
}

// Show cover letter toggle storage
const SHOW_COVER_LETTER_KEY = 'resume-builder-show-cover-letter';

export function saveShowCoverLetter(enabled: boolean): void {
    localStorage.setItem(SHOW_COVER_LETTER_KEY, JSON.stringify(enabled));
}

export function loadShowCoverLetter(): boolean {
    try {
        const saved = localStorage.getItem(SHOW_COVER_LETTER_KEY);
        return saved !== null ? JSON.parse(saved) : false;
    } catch {
        return false;
    }
}
