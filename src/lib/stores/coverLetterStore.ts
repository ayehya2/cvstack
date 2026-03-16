import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoverLetterData } from '../../types';
import { getDefaultFormatting } from '../../store';
import { SAMPLE_COVER_LETTER_DATA } from '../data/sampleData';

interface CoverLetterStore {
    coverLetterData: CoverLetterData;
    showCoverLetter: boolean;

    setShowCoverLetter: (show: boolean) => void;
    updateRecipient: (recipient: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) => void;
    updatePosition: (position: string) => void;
    updateDate: (date: string) => void;
    updateContent: (content: string) => void;
    updateClosing: (closing: string) => void;
    updateSignature: (signature: string) => void;
    setTemplate: (templateId: number) => void;
    updateFormatting: (formatting: Partial<import('../../types').FormattingOptions>) => void;
    resetFormatting: () => void;
    loadSampleData: () => void;
    autoPopulateFromResume: (basics: import('../../types').Basics) => void;
    reset: () => void;

    // History
    undo: () => void;
    redo: () => void;
    past: CoverLetterData[];
    future: CoverLetterData[];
    saveToHistory: () => void;
}

const getDefaultCoverLetterData = (): CoverLetterData => ({
    recipientName: '',
    recipientTitle: '',
    company: '',
    companyAddress: '',
    position: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    content: '',
    closing: 'Sincerely',
    signature: '',
    email: '',
    phone: '',
    selectedTemplate: 21, // Default Professional LaTeX Cover Letter
    formatting: getDefaultFormatting(),
});

export const useCoverLetterStore = create<CoverLetterStore>()(
    persist(
        (set, get) => ({
            coverLetterData: getDefaultCoverLetterData(),
            showCoverLetter: false,
            past: [],
            future: [],
            saveToHistory: () => {
                const { coverLetterData, past } = get();
                // Reduce history depth to keep memory light
                const newPast = [JSON.parse(JSON.stringify(coverLetterData)), ...past].slice(0, 20);
                set({ past: newPast, future: [] });
            },

            undo: () => {
                const { coverLetterData, past, future } = get();
                if (past.length === 0) return;

                const previous = past[0];
                const newPast = past.slice(1);
                const newFuture = [JSON.parse(JSON.stringify(coverLetterData)), ...future];

                set({
                    coverLetterData: previous,
                    past: newPast,
                    future: newFuture
                });
            },

            redo: () => {
                const { coverLetterData, past, future } = get();
                if (future.length === 0) return;

                const next = future[0];
                const newFuture = future.slice(1);
                const newPast = [JSON.parse(JSON.stringify(coverLetterData)), ...past];

                set({
                    coverLetterData: next,
                    past: newPast,
                    future: newFuture
                });
            },

            setShowCoverLetter: (show: boolean) => set({ showCoverLetter: show }),

            updateRecipient: (recipient: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, ...recipient },
                }));
            },

            updatePosition: (position: string) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, position },
                }));
            },

            updateDate: (date: string) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, date },
                }));
            },

            updateContent: (content: string) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, content },
                }));
            },

            updateClosing: (closing: string) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, closing },
                }));
            },

            updateSignature: (signature: string) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, signature },
                }));
            },

            setTemplate: (templateId: number) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, selectedTemplate: templateId },
                }));
            },

            updateFormatting: (formatting: Partial<import('../../types').FormattingOptions>) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        formatting: { ...state.coverLetterData.formatting, ...formatting },
                    },
                }));
            },

            resetFormatting: () => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        formatting: getDefaultFormatting(),
                    },
                }));
            },

            loadSampleData: () => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        ...SAMPLE_COVER_LETTER_DATA,
                    }
                }));
            },

            autoPopulateFromResume: (basics: import('../../types').Basics) => {
                get().saveToHistory();
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        signature: basics.name || state.coverLetterData.signature,
                        userBasics: basics,
                    }
                }));
            },

            reset: () => set({ coverLetterData: getDefaultCoverLetterData() }),
        }),
        {
            name: 'resume-builder-cover-letter',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            merge: (persistedState: any, currentState: CoverLetterStore) => {
                const data = persistedState as Partial<CoverLetterStore>;
                if (!data) return currentState;

                const mergedCoverLetterData = {
                    ...currentState.coverLetterData,
                    ...(data.coverLetterData || {}),
                    formatting: {
                        ...getDefaultFormatting(),
                        ...(data.coverLetterData?.formatting || {})
                    }
                };

                return {
                    ...currentState,
                    ...(data || {}),
                    coverLetterData: mergedCoverLetterData,
                    past: [],
                    future: []
                };
            },
            // Exclude history from localStorage to prevent QuotaExceededError
            partialize: (state) => ({
                coverLetterData: state.coverLetterData,
                showCoverLetter: state.showCoverLetter
            }),
        }
    )
);
