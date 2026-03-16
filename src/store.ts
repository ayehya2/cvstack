import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData, TemplateId, Basics, WorkExperience, Education, Skill, Project, Award, SectionKey, LaTeXFormattingOptions } from './types';
import { SAMPLE_RESUME_DATA } from './lib/data/sampleData';

// Default formatting options
export const getDefaultFormatting = (): import('./types').FormattingOptions => ({
    fontFamily: 'default',
    baseFontSize: '11pt',
    nameSize: 'large',
    sectionTitleSize: 'small',
    sectionTitleBold: true,
    sectionTitleUnderline: false,
    lineSpacing: '1.2',
    sectionSpacing: 'normal',
    paragraphSpacing: 'normal',
    pageMargins: 'custom',
    marginTop: '0.6',
    marginBottom: '0.6',
    marginLeft: '0.6',
    marginRight: '0.6',
    // Granular Spacing
    entrySpacing: 'normal',
    bulletSpacing: 'normal',
    bulletGap: '4pt',
    // Typography
    sectionHeaderStyle: 'uppercase',
    fontWeightName: 'BOLD',
    fontWeightSectionTitle: 'BOLD',
    fontWeightBody: 'NORMAL',
    // Decorative
    showIcons: true,
    socialIconStyle: 'none',
    pageFormat: 'Letter',
    bulletStyle: 'bullet',
    bulletIndent: 'none',
    colorTheme: 'black',
    customColor: '#000000',
    separator: '|',
    sectionDividers: 'line',
    headerLineStyle: 'none',
    headerAlignment: 'center',
    // Content Controls (Phase 4)
    dateFormat: 'short',
    subHeaderWeight: 'bold',
    skillLayout: 'comma',
    showLocation: true,
    showGPA: true,
    companyTitleOrder: 'company-first',
    // Phase 4.5 — Extended Formatting
    bodyTextWeight: 'normal',
    italicStyle: 'normal',
    sectionTitleSpacing: 'normal',
    showEducationDescription: true,
    showProjectKeywords: true,
    showAwardsSummaries: true,
    dateSeparator: '—',
    accentColorPosition: 'headers-only',
});

// Default/empty resume data
const getDefaultResumeData = (): ResumeData => ({
    basics: {
        name: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
        websites: [],
    },
    education: [],
    work: [],
    skills: [],
    projects: [],
    awards: [],
    customSections: [],
    sections: ['profile', 'education', 'work', 'skills', 'projects', 'awards'],
    selectedTemplate: 1,
    formatting: getDefaultFormatting(),
});

interface ResumeStore {
    resumeData: ResumeData;
    showResume: boolean;
    activeTab: string;

    setShowResume: (show: boolean) => void;
    setActiveTab: (tab: string) => void;
    customLatexSource: string | null;

    // LaTeX-specific formatting overrides (null = use template defaults)
    latexFormatting: LaTeXFormattingOptions | null;

    // Basics
    updateBasics: (basics: Partial<Basics>) => void;

    // Work Experience
    addWork: () => void;
    updateWork: (index: number, work: Partial<WorkExperience>) => void;
    removeWork: (index: number) => void;

    // Education
    addEducation: () => void;
    updateEducation: (index: number, education: Partial<Education>) => void;
    removeEducation: (index: number) => void;

    // Skills
    addSkill: () => void;
    updateSkill: (index: number, skill: Partial<Skill>) => void;
    removeSkill: (index: number) => void;

    // Projects
    addProject: () => void;
    updateProject: (index: number, project: Partial<Project>) => void;
    removeProject: (index: number) => void;

    // Awards
    addAward: () => void;
    updateAward: (index: number, award: Partial<Award>) => void;
    removeAward: (index: number) => void;

    // Custom Sections
    addCustomSection: (id?: string) => string;
    updateCustomSection: (id: string, section: Partial<import('./types').CustomSection>) => void;
    removeCustomSection: (id: string) => void;
    addCustomSectionItem: (sectionId: string) => void;
    updateCustomSectionItem: (sectionId: string, index: number, item: Partial<import('./types').CustomSectionEntry>) => void;
    removeCustomSectionItem: (sectionId: string, index: number) => void;

    // Sections
    setSections: (sections: SectionKey[]) => void;

    // Template
    setTemplate: (templateId: TemplateId) => void;

    // Formatting
    updateFormatting: (formatting: Partial<import('./types').FormattingOptions>) => void;
    resetFormatting: () => void;

    // LaTeX
    setCustomLatex: (source: string) => void;
    clearCustomLatex: () => void;
    updateLatexFormatting: (formatting: Partial<LaTeXFormattingOptions>) => void;
    resetLatexFormatting: () => void;

    // History
    undo: () => void;
    redo: () => void;
    past: ResumeData[];
    future: ResumeData[];
    saveToHistory: () => void;

    // Utility
    loadSampleData: () => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set, get) => ({
            resumeData: getDefaultResumeData(),
            showResume: true,
            activeTab: 'basics',
            customLatexSource: null,
            latexFormatting: null,
            past: [] as ResumeData[],
            future: [] as ResumeData[],

            saveToHistory: () => {
                const { resumeData, past } = get();
                // Limit history to 50 steps
                const newPast = [JSON.parse(JSON.stringify(resumeData)), ...past].slice(0, 50);
                set({ past: newPast, future: [] });
            },

            undo: () => {
                const { resumeData, past, future } = get();
                if (past.length === 0) return;

                const previous = past[0];
                const newPast = past.slice(1);
                const newFuture = [JSON.parse(JSON.stringify(resumeData)), ...future];

                set({
                    resumeData: previous,
                    past: newPast,
                    future: newFuture
                });
            },

            redo: () => {
                const { resumeData, past, future } = get();
                if (future.length === 0) return;

                const next = future[0];
                const newFuture = future.slice(1);
                const newPast = [JSON.parse(JSON.stringify(resumeData)), ...past];

                set({
                    resumeData: next,
                    past: newPast,
                    future: newFuture
                });
            },

            setShowResume: (show) => set({ showResume: show }),
            setActiveTab: (tab) => set({ activeTab: tab }),

            // Basics
            updateBasics: (basics) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        basics: { ...state.resumeData.basics, ...basics },
                    },
                }));
            },

            // Work Experience
            addWork: () => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        work: [
                            ...state.resumeData.work,
                            {
                                company: '',
                                position: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                bullets: [''],
                            },
                        ],
                    },
                }));
            },

            updateWork: (index: number, work: Partial<import('./types').WorkExperience>) => {
                // For nested fields like bullets, we might want to debounce history
                // but for now simple 1-1 history is fine.
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        work: state.resumeData.work.map((item, i) =>
                            i === index ? { ...item, ...work } : item
                        ),
                    },
                }));
            },

            removeWork: (index: number) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        work: state.resumeData.work.filter((_, i) => i !== index),
                    },
                }));
            },

            // Education
            addEducation: () => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        education: [
                            ...state.resumeData.education,
                            {
                                institution: '',
                                degree: '',
                                field: '',
                                location: '',
                                graduationDate: '',
                                thesis: '',
                                clubs: [],
                                courses: [],
                                activities: [],
                            },
                        ],
                    },
                }));
            },

            updateEducation: (index: number, education: Partial<import('./types').Education>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        education: state.resumeData.education.map((item, i) =>
                            i === index ? { ...item, ...education } : item
                        ),
                    },
                }));
            },

            removeEducation: (index: number) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        education: state.resumeData.education.filter((_, i) => i !== index),
                    },
                }));
            },

            // Skills
            addSkill: () => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        skills: [
                            ...state.resumeData.skills,
                            { category: '', items: [] },
                        ],
                    },
                }));
            },

            updateSkill: (index: number, skill: Partial<import('./types').Skill>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        skills: state.resumeData.skills.map((item, i) =>
                            i === index ? { ...item, ...skill } : item
                        ),
                    },
                }));
            },

            removeSkill: (index: number) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        skills: state.resumeData.skills.filter((_, i) => i !== index),
                    },
                }));
            },

            // Projects
            addProject: () => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        projects: [
                            ...state.resumeData.projects,
                            {
                                name: '',
                                bullets: [''],
                                keywords: [],
                            },
                        ],
                    },
                }));
            },

            updateProject: (index: number, project: Partial<import('./types').Project>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        projects: state.resumeData.projects.map((item, i) =>
                            i === index ? { ...item, ...project } : item
                        ),
                    },
                }));
            },

            removeProject: (index: number) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        projects: state.resumeData.projects.filter((_, i) => i !== index),
                    },
                }));
            },

            // Awards
            addAward: () => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        awards: [
                            ...state.resumeData.awards,
                            {
                                title: '',
                                awarder: '',
                                date: '',
                            },
                        ],
                    },
                }));
            },

            updateAward: (index: number, award: Partial<import('./types').Award>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        awards: state.resumeData.awards.map((item, i) =>
                            i === index ? { ...item, ...award } : item
                        ),
                    },
                }));
            },

            removeAward: (index: number) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        awards: state.resumeData.awards.filter((_, i) => i !== index),
                    },
                }));
            },

            // Custom Sections
            addCustomSection: (id?: string) => {
                (get() as ResumeStore).saveToHistory();
                const newId = id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newSection: import('./types').CustomSection = {
                    id: newId,
                    title: 'Custom Section',
                    type: 'bullets',
                    items: [
                        {
                            title: '',
                            subtitle: '',
                            date: '',
                            location: '',
                            link: '',
                            bullets: [''],
                        },
                    ],
                };
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: [...state.resumeData.customSections, newSection],
                        sections: [...state.resumeData.sections, newSection.id],
                    },
                }));
                return newId;
            },

            updateCustomSection: (id: string, section: Partial<import('./types').CustomSection>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((item) =>
                            item.id === id ? { ...item, ...section } : item
                        ),
                    },
                }));
            },

            removeCustomSection: (id: string) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.filter((item) => item.id !== id),
                        sections: state.resumeData.sections.filter((s) => s !== id),
                    },
                }));
            },

            addCustomSectionItem: (sectionId: string) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((section) =>
                            section.id === sectionId
                                ? {
                                    ...section,
                                    items: [
                                        ...section.items,
                                        {
                                            title: '',
                                            subtitle: '',
                                            date: '',
                                            location: '',
                                            link: '',
                                            bullets: [''],
                                        },
                                    ],
                                }
                                : section
                        ),
                    },
                }));
            },

            updateCustomSectionItem: (sectionId: string, index: number, item: Partial<import('./types').CustomSectionEntry>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((section) =>
                            section.id === sectionId
                                ? {
                                    ...section,
                                    items: section.items.map((entry, i) =>
                                        i === index ? { ...entry, ...item } : entry
                                    ),
                                }
                                : section
                        ),
                    },
                }));
            },

            removeCustomSectionItem: (sectionId: string, index: number) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((section) =>
                            section.id === sectionId
                                ? {
                                    ...section,
                                    items: section.items.filter((_, i) => i !== index),
                                }
                                : section
                        ),
                    },
                }));
            },

            // Sections
            setSections: (sections: string[]) => {
                (get() as ResumeStore).saveToHistory();
                set((state: ResumeStore) => {
                    // Allow standard sections and custom section IDs
                    const standardSections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
                    const customSectionIds = state.resumeData.customSections.map(s => s.id);
                    const validSections = [...standardSections, ...customSectionIds];

                    const uniqueSections = Array.from(new Set(sections)).filter(s =>
                        validSections.includes(s)
                    );
                    return {
                        resumeData: {
                            ...state.resumeData,
                            sections: uniqueSections,
                        },
                    };
                });
            },

            // Template
            setTemplate: (templateId: import('./types').TemplateId) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        selectedTemplate: templateId,
                    },
                }));
            },

            // Formatting
            updateFormatting: (formatting: Partial<import('./types').FormattingOptions>) => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        formatting: { ...state.resumeData.formatting, ...formatting },
                    },
                }));
            },

            resetFormatting: () => {
                (get() as ResumeStore).saveToHistory();
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        formatting: getDefaultResumeData().formatting,
                    },
                }));
            },

            // LaTeX
            setCustomLatex: (source) =>
                set({ customLatexSource: source }),

            clearCustomLatex: () =>
                set({ customLatexSource: null }),

            updateLatexFormatting: (formatting) =>
                set((state) => ({
                    latexFormatting: {
                        ...(state.latexFormatting || {
                            fontSize: '11pt',
                            margins: '0.75in',
                            lineSpacing: '1.15',
                            sectionSpaceBefore: '12pt',
                            sectionSpaceAfter: '6pt',
                            itemSep: '6pt',
                            bulletItemSep: '0pt',
                            headerSize: 'Huge',
                            sectionTitleSize: 'large',
                        }),
                        ...formatting,
                    } as LaTeXFormattingOptions,
                    customLatexSource: null, // Reset custom source when formatting changes
                })),

            resetLatexFormatting: () =>
                set({ latexFormatting: null, customLatexSource: null }),

            loadSampleData: () => {
                set((state) => ({
                    resumeData: {
                        ...SAMPLE_RESUME_DATA,
                        selectedTemplate: state.resumeData.selectedTemplate,
                        formatting: state.resumeData.formatting,
                    },
                }));
            },

            reset: () => set({ resumeData: getDefaultResumeData() }),
        }),
        {
            name: 'resume-builder-data',
            merge: (persistedState: unknown, currentState: ResumeStore) => {
                if (!persistedState) return currentState;
                const persisted = persistedState as ResumeStore;
                const data = persisted.resumeData;

                // Migrate old custom sections (content → items)
                if (data?.customSections) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.customSections = data.customSections.map((section: any) => {
                        if (section.content) {
                            const newItems = section.content.map((c: string) => ({
                                title: '', subtitle: '', date: '', location: '', link: '', bullets: [c],
                            }));
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { content: _content, ...rest } = section;
                            return { ...rest, items: newItems.length > 0 ? newItems : [{ title: '', subtitle: '', date: '', location: '', link: '', bullets: [''] }] };
                        }
                        return section;
                    });
                }

                // Deduplicate sections
                if (data?.sections) {
                    const standardSections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const customIds = (data.customSections || []).map((cs: any) => cs.id);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.sections = Array.from(new Set(data.sections)).filter((s: any) =>
                        standardSections.includes(s) || customIds.includes(s)
                    );
                }

                const mergedResumeData = {
                    ...currentState.resumeData,
                    ...(data || {}),
                    formatting: {
                        ...getDefaultFormatting(),
                        ...(data?.formatting || {})
                    }
                };

                return {
                    ...currentState,
                    ...persisted,
                    resumeData: mergedResumeData,
                    past: [],
                    future: []
                };
            },
        },
    ),
);
