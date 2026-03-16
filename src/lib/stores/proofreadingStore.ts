import { create } from 'zustand';

export interface ProofreadingSuggestion {
    id: string;
    text: string;
    fieldId: string;
    offset: number;
    length: number;
    message: string;
    ruleId: string;
    shortMessage?: string;
    suggestions: string[];
    type: 'style' | 'grammar' | 'spelling';
}

interface ProofreadingState {
    suggestions: ProofreadingSuggestion[];
    ignoredWords: string[];
    dismissedIds: string[];
    isChecking: boolean;
    lastCheckedText: string;
    isOpen: boolean;

    // Actions
    setIsOpen: (isOpen: boolean) => void;
    clearSuggestions: () => void;
    checkContent: (text: string, fieldId: string) => Promise<void>;
    ignoreWord: (word: string) => void;
    dismissSuggestion: (id: string) => void;
}

// LanguageTool API URL (Free tier)
const LANGUAGETOOL_API_URL = 'https://api.languagetool.org/v2/check';

export const useProofreadingStore = create<ProofreadingState>((set, get) => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    return {
        suggestions: [],
        ignoredWords: [],
        dismissedIds: [],
        isChecking: false,
        lastCheckedText: '',
        isOpen: false,

        setIsOpen: (isOpen) => set({ isOpen }),
        clearSuggestions: () => set({ suggestions: [] }),

        ignoreWord: (word) => {
            const normalized = word.toLowerCase().trim();
            if (!get().ignoredWords.includes(normalized)) {
                set(state => ({
                    ignoredWords: [...state.ignoredWords, normalized],
                    suggestions: state.suggestions.filter(s => s.text.toLowerCase().trim() !== normalized)
                }));
            }
        },

        dismissSuggestion: (id) => {
            set(state => ({
                dismissedIds: [...state.dismissedIds, id],
                suggestions: state.suggestions.filter(s => s.id !== id)
            }));
        },

        checkContent: async (text: string, fieldId: string) => {
            if (!text || text.trim().length < 3) {
                // If there were suggestions for this field, clear them
                set(state => ({
                    suggestions: state.suggestions.filter(s => s.fieldId !== fieldId)
                }));
                return;
            }

            if (debounceTimer) clearTimeout(debounceTimer);

            debounceTimer = setTimeout(async () => {
                if (text === get().lastCheckedText) return;

                set({ isChecking: true, lastCheckedText: text });
                const allSuggestions: ProofreadingSuggestion[] = [];
                const { ignoredWords, dismissedIds } = get();

                // Removed local write-good check as it's redundant with LanguageTool and causing issues.

                // 2. Remote grammar check with LanguageTool
                try {
                    const params = new URLSearchParams();
                    params.append('text', text);
                    params.append('language', 'en-US');

                    const response = await fetch(LANGUAGETOOL_API_URL, {
                        method: 'POST',
                        body: params
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        data.matches.forEach((match: any, index: number) => {
                            const issueText = match.context.text.substring(match.context.offset, match.context.offset + match.length);
                            const id = `grammar-${fieldId}-${index}`;

                            if (!ignoredWords.includes(issueText.toLowerCase().trim()) && !dismissedIds.includes(id)) {
                                allSuggestions.push({
                                    id,
                                    text: issueText,
                                    fieldId,
                                    offset: match.offset,
                                    length: match.length,
                                    message: match.message,
                                    ruleId: match.rule.id,
                                    shortMessage: match.shortMessage,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    suggestions: match.replacements.map((r: any) => r.value).slice(0, 3),
                                    type: match.rule.category.id === 'TYPOS' ? 'spelling' : 'grammar'
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.warn('LanguageTool API unavailable, falling back to local checks only.', e);
                }

                // Merge with existing suggestions from OTHER fields
                set(state => ({
                    suggestions: [
                        ...state.suggestions.filter(s => s.fieldId !== fieldId),
                        ...allSuggestions
                    ],
                    isChecking: false
                }));
            }, 1800);
        },
    };
});
