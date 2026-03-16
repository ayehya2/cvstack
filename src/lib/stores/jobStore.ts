import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JobState {
    jobTitle: string;
    jobUrl: string;
    jobDescription: string;
    linkedJobId: string | null;
    lastUpdated: string;
    applyToBoth: boolean;
    setJobContext: (data: Partial<Omit<JobState, 'setJobContext' | 'resetJobContext'>>) => void;
    resetJobContext: () => void;
}

const initialState = {
    jobTitle: '',
    jobUrl: '',
    jobDescription: '',
    linkedJobId: null,
    lastUpdated: '',
    applyToBoth: true,
};

export const useJobStore = create<JobState>()(
    persist(
        (set) => ({
            ...initialState,
            setJobContext: (data) => set((state) => ({
                ...state,
                ...data,
                lastUpdated: new Date().toISOString()
            })),
            resetJobContext: () => set(initialState),
        }),
        {
            name: 'cf-job-context',
        }
    )
);
