/**
 * loadFromUrl.ts
 *
 * Reads pre-fill data from either:
 *  1. localStorage key `resume_builder_prefill` (set by the tester page)
 *  2. URL hash `#data=<base64json>` (fallback for direct links)
 *
 * The tester page writes JSON to localStorage, then opens the resume builder.
 * On mount, the builder reads it, applies it, and deletes the key.
 */

import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../stores/coverLetterStore';
import { saveShowCoverLetter, saveActiveTab } from './storage';
import type { WorkExperience, Education, Skill, Project, Award, CustomSection, TemplateId, FormattingOptions } from '../../types';

const PREFILL_KEY = 'resume_builder_prefill';

/** Shape of the JSON blob the external site sends. */
export interface ExternalResumeData {
    // ── Basics / Profile ──
    basics?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        websites?: Array<{ name: string; url: string }>;
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };

    // ── Resume sections ──
    work?: WorkExperience[];
    education?: Education[];
    skills?: Skill[];
    projects?: Project[];
    awards?: Award[];
    customSections?: CustomSection[];

    // ── Template & Formatting ──
    selectedTemplate?: TemplateId;           // 1, 2, 3, or 4
    formatting?: Partial<FormattingOptions>; // only override what you need

    // ── Cover letter ──
    coverLetter?: {
        recipientName?: string;
        recipientTitle?: string;
        company?: string;
        companyAddress?: string;
        position?: string;
        date?: string;
        content?: string;
        greeting?: string; // legacy
        opening?: string; // legacy
        body?: string[]; // legacy
        closing?: string;
        signature?: string;
    };

    // ── Job info (auto-generates a cover letter) ──
    job?: {
        title?: string;
        company?: string;
        companyAddress?: string;
        description?: string;
        skills?: string[];
    };
}

/**
 * Call once on App mount (after localStorage resume data is loaded).
 * Checks localStorage for prefill data, applies it, then removes the key.
 */
export function loadPrefillData(): void {
    try {
        // Method 1: localStorage (preferred — used by the tester page)
        const raw = localStorage.getItem(PREFILL_KEY);
        if (raw) {
            const data: ExternalResumeData = JSON.parse(raw);
            console.log('[loadPrefillData] Found prefill data in localStorage:', data);
            applyExternalData(data);
            // Delete after a delay so React StrictMode's second mount still finds it
            setTimeout(() => localStorage.removeItem(PREFILL_KEY), 2000);
            return;
        }

        // Method 2: URL hash fallback (`#data=<base64>`)
        const hash = window.location.hash;
        if (hash && hash.startsWith('#data=')) {
            const b64 = hash.slice('#data='.length);
            if (b64) {
                const json = decodeURIComponent(escape(atob(b64)));
                const data: ExternalResumeData = JSON.parse(json);
                console.log('[loadPrefillData] Found prefill data in URL hash:', data);
                applyExternalData(data);
                setTimeout(() => {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }, 50); // Immediate clear to prevent re-run on re-renders
            }
        }
    } catch (err) {
        console.error('[loadPrefillData] Failed to parse prefill data:', err);
    }
}

/** Push the parsed data into both stores. */
function applyExternalData(data: ExternalResumeData): void {
    const resumeStore = useResumeStore.getState();
    const coverLetterStore = useCoverLetterStore.getState();

    // ── Basics ──
    if (data.basics) {
        const b = data.basics;
        const websites: Array<{ name: string; url: string }> = [];
        if (b.linkedin) websites.push({ name: 'LinkedIn', url: b.linkedin });
        if (b.github) websites.push({ name: 'GitHub', url: b.github });
        if (b.portfolio) websites.push({ name: 'Portfolio', url: b.portfolio });
        if (b.websites) websites.push(...b.websites);

        resumeStore.updateBasics({
            ...(b.name !== undefined ? { name: b.name } : {}),
            ...(b.email !== undefined ? { email: b.email } : {}),
            ...(b.phone !== undefined ? { phone: b.phone } : {}),
            ...(b.address !== undefined ? { address: b.address } : {}),
            ...(websites.length > 0 ? { websites } : {}),
        });

        if (b.name) coverLetterStore.updateSignature(b.name);
    }

    // ── Work experience ──
    if (data.work && data.work.length > 0) {
        useResumeStore.setState((s) => ({
            resumeData: { ...s.resumeData, work: data.work! },
        }));
    }

    // ── Education ──
    if (data.education && data.education.length > 0) {
        useResumeStore.setState((s) => ({
            resumeData: { ...s.resumeData, education: data.education! },
        }));
    }

    // ── Skills ──
    if (data.skills && data.skills.length > 0) {
        useResumeStore.setState((s) => ({
            resumeData: { ...s.resumeData, skills: data.skills! },
        }));
    }

    // ── Projects ──
    if (data.projects && data.projects.length > 0) {
        useResumeStore.setState((s) => ({
            resumeData: { ...s.resumeData, projects: data.projects! },
        }));
    }

    // ── Awards ──
    if (data.awards && data.awards.length > 0) {
        useResumeStore.setState((s) => ({
            resumeData: { ...s.resumeData, awards: data.awards! },
        }));
    }

    // ── Custom sections ──
    if (data.customSections && data.customSections.length > 0) {
        const sections = data.customSections.map((cs, i) => ({
            ...cs,
            id: cs.id || `custom-${Date.now()}-${i}`,
        }));
        useResumeStore.setState((s) => ({
            resumeData: {
                ...s.resumeData,
                customSections: sections,
                sections: [
                    ...s.resumeData.sections,
                    ...sections.map(cs => cs.id).filter(id => !s.resumeData.sections.includes(id)),
                ],
            },
        }));
    }

    // ── Template ──
    if (data.selectedTemplate !== undefined) {
        useResumeStore.setState((s) => ({
            resumeData: { ...s.resumeData, selectedTemplate: data.selectedTemplate! },
        }));
    }

    // ── Formatting ──
    if (data.formatting) {
        useResumeStore.setState((s) => ({
            resumeData: {
                ...s.resumeData,
                formatting: { ...s.resumeData.formatting, ...data.formatting },
            },
        }));
    }

    // ── Cover letter (explicit) ──
    if (data.coverLetter) {
        const cl = data.coverLetter;
        if (cl.recipientName || cl.recipientTitle || cl.company || cl.companyAddress) {
            coverLetterStore.updateRecipient({
                ...(cl.recipientName ? { recipientName: cl.recipientName } : {}),
                ...(cl.recipientTitle ? { recipientTitle: cl.recipientTitle } : {}),
                ...(cl.company ? { company: cl.company } : {}),
                ...(cl.companyAddress ? { companyAddress: cl.companyAddress } : {}),
            });
        }
        if (cl.position) coverLetterStore.updatePosition(cl.position);
        if (cl.date) coverLetterStore.updateDate(cl.date);

        // Handle content (or legacy fields)
        if (typeof cl.content === 'string') {
            coverLetterStore.updateContent(cl.content);
        } else if (cl.greeting || cl.opening || cl.body) {
            // Combine legacy fields
            const combined = [
                cl.greeting,
                cl.opening,
                Array.isArray(cl.body) ? cl.body.join('\n\n') : cl.body
            ].filter(Boolean).join('\n\n');
            coverLetterStore.updateContent(combined);
        }

        if (cl.closing) coverLetterStore.updateClosing(cl.closing);
        if (cl.signature) coverLetterStore.updateSignature(cl.signature);
    }

    // ── Job posting → auto-generate cover letter ──
    if (data.job && data.job.title && data.job.company) {
        const j = data.job;
        coverLetterStore.updateRecipient({ company: j.company! });
        if (j.companyAddress) coverLetterStore.updateRecipient({ companyAddress: j.companyAddress });
        coverLetterStore.updatePosition(j.title!);

        let generatedContent = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${j.title} position at ${j.company}.`;

        if (j.description) {
            generatedContent += `\n\nAfter reviewing the job description, I am excited about the opportunity to contribute to ${j.company}. My background and skills align well with your requirements.`;
        }
        if (j.skills && j.skills.length > 0) {
            generatedContent += `\n\nI have extensive experience with ${j.skills.slice(0, 5).join(', ')}, which makes me a strong candidate for this role.`;
        }
        generatedContent += `\n\nI am enthusiastic about the opportunity to bring my expertise to ${j.company} and contribute to your team's success.`;

        coverLetterStore.updateContent(generatedContent);

        coverLetterStore.updateClosing(
            'Thank you for considering my application. I look forward to discussing this position further.'
        );

        // Auto-enable cover letter so the user sees the generated content
        saveShowCoverLetter(true);
        saveActiveTab('cover-letter');
    }

    console.log('[loadPrefillData] Applied successfully. Store state:', useResumeStore.getState().resumeData);
}
