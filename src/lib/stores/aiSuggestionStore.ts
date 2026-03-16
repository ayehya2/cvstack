import { create } from 'zustand';

export interface InlineSuggestion {
    id: string;
    /** The field path, e.g. 'work.0.bullets.2' or 'coverLetter.content' */
    fieldPath: string;
    /** Original text in that field */
    original: string;
    /** AI-suggested replacement */
    suggested: string;
    /** Status of the suggestion */
    status: 'pending' | 'accepted' | 'dismissed';
    /** Which document it belongs to */
    target: 'resume' | 'coverletter';
}

export type AISuggestionTarget = 'resume' | 'coverletter' | 'both';

interface AISuggestionStore {
    suggestions: InlineSuggestion[];
    isGenerating: boolean;
    target: AISuggestionTarget | null;
    error: string;
    /** Which step of the flow we're on */
    step: 'idle' | 'choosing-target' | 'generating' | 'reviewing';

    setTarget: (target: AISuggestionTarget) => void;
    setStep: (step: AISuggestionStore['step']) => void;
    setError: (error: string) => void;
    setIsGenerating: (val: boolean) => void;
    addSuggestions: (suggestions: InlineSuggestion[]) => void;
    acceptSuggestion: (id: string) => void;
    dismissSuggestion: (id: string) => void;
    acceptAll: (target?: 'resume' | 'coverletter') => void;
    dismissAll: (target?: 'resume' | 'coverletter') => void;
    clearSuggestions: () => void;
    getSuggestionsForField: (fieldPath: string) => InlineSuggestion[];
    getPendingSuggestions: (target?: 'resume' | 'coverletter') => InlineSuggestion[];
}

let idCounter = 0;
export function generateSuggestionId(): string {
    return `ai-sug-${Date.now()}-${++idCounter}`;
}

export const useAISuggestionStore = create<AISuggestionStore>((set, get) => ({
    suggestions: [],
    isGenerating: false,
    target: null,
    error: '',
    step: 'idle',

    setTarget: (target) => set({ target }),
    setStep: (step) => set({ step }),
    setError: (error) => set({ error }),
    setIsGenerating: (val) => set({ isGenerating: val }),

    addSuggestions: (newSuggestions) => set(state => ({
        suggestions: [...state.suggestions, ...newSuggestions],
    })),

    acceptSuggestion: (id) => set(state => ({
        suggestions: state.suggestions.map(s =>
            s.id === id ? { ...s, status: 'accepted' as const } : s
        ),
    })),

    dismissSuggestion: (id) => set(state => ({
        suggestions: state.suggestions.map(s =>
            s.id === id ? { ...s, status: 'dismissed' as const } : s
        ),
    })),

    acceptAll: (target) => set(state => ({
        suggestions: state.suggestions.map(s =>
            s.status === 'pending' && (!target || s.target === target)
                ? { ...s, status: 'accepted' as const }
                : s
        ),
    })),

    dismissAll: (target) => set(state => ({
        suggestions: state.suggestions.map(s =>
            s.status === 'pending' && (!target || s.target === target)
                ? { ...s, status: 'dismissed' as const }
                : s
        ),
    })),

    clearSuggestions: () => set({
        suggestions: [],
        step: 'idle',
        target: null,
        error: '',
        isGenerating: false,
    }),

    getSuggestionsForField: (fieldPath) => {
        return get().suggestions.filter(s => s.fieldPath === fieldPath && s.status === 'pending');
    },

    getPendingSuggestions: (target) => {
        return get().suggestions.filter(s =>
            s.status === 'pending' && (!target || s.target === target)
        );
    },
}));
