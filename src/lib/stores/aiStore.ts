import { create } from 'zustand';

interface AIStore {
    apiKey: string;
    isConfigured: boolean;

    setAPIKey: (key: string) => void;
    clearAPIKey: () => void;
    loadAPIKey: () => void;
}

const AI_KEY_STORAGE_KEY = 'gemini_api_key';

export const useAIStore = create<AIStore>((set) => ({
    apiKey: '',
    isConfigured: false,

    setAPIKey: (key) => {
        localStorage.setItem(AI_KEY_STORAGE_KEY, key);
        set({ apiKey: key, isConfigured: key.length > 0 });
    },

    clearAPIKey: () => {
        localStorage.removeItem(AI_KEY_STORAGE_KEY);
        set({ apiKey: '', isConfigured: false });
    },

    loadAPIKey: () => {
        const key = localStorage.getItem(AI_KEY_STORAGE_KEY) || '';
        set({ apiKey: key, isConfigured: key.length > 0 });
    },
}));
