import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomTemplate, PreloadedTemplateId, FormattingOptions } from '../types';

interface CustomTemplateStore {
    customTemplates: CustomTemplate[];
    addCustomTemplate: (name: string, baseTemplateId: PreloadedTemplateId, formatting: FormattingOptions) => number;
    updateCustomTemplate: (id: number, updates: Partial<Omit<CustomTemplate, 'id'>>) => void;
    deleteCustomTemplate: (id: number) => void;
    getCustomTemplate: (id: number) => CustomTemplate | undefined;
}

export const useCustomTemplateStore = create<CustomTemplateStore>()(
    persist(
        (set, get) => ({
            customTemplates: [],

            addCustomTemplate: (name, baseTemplateId, formatting) => {
                const existing = get().customTemplates;
                // Auto-assign IDs starting at 100
                const nextId = existing.length > 0
                    ? Math.max(...existing.map(t => t.id)) + 1
                    : 100;

                const newTemplate: CustomTemplate = {
                    id: nextId,
                    name,
                    baseTemplateId,
                    formatting: { ...formatting },
                    createdAt: new Date().toISOString(),
                };

                set({ customTemplates: [...existing, newTemplate] });
                return nextId;
            },

            updateCustomTemplate: (id, updates) => {
                set((state) => ({
                    customTemplates: state.customTemplates.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ),
                }));
            },

            deleteCustomTemplate: (id) => {
                set((state) => ({
                    customTemplates: state.customTemplates.filter((t) => t.id !== id),
                }));
            },

            getCustomTemplate: (id) => {
                return get().customTemplates.find((t) => t.id === id);
            },
        }),
        {
            name: 'cvstack-custom-templates',
        },
    ),
);
