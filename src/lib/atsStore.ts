import { create } from 'zustand';
import type { ATSResult, QualityIssue, KeywordGap, SectionScore, AIATSResult } from './atsScoring';

interface ATSStore {
  // Results
  qualityScore: number | null;
  atsScore: number | null;
  qualityIssues: QualityIssue[];
  keywordGaps: KeywordGap[];
  matchedKeywords: string[];
  keywordMatchRate: number | null;
  sectionScores: SectionScore[];

  // AI Analysis
  aiResult: AIATSResult | null;
  aiLoading: boolean;
  aiError: string | null;

  // State
  isScoring: boolean;
  lastScoredAt: Date | null;
  hasJobDescription: boolean;

  // Actions
  setResults: (results: ATSResult) => void;
  setScoring: (isScoring: boolean) => void;
  setHasJobDescription: (has: boolean) => void;
  setAIResult: (result: AIATSResult) => void;
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string | null) => void;
  reset: () => void;
}

export const useATSStore = create<ATSStore>((set) => ({
  qualityScore: null,
  atsScore: null,
  qualityIssues: [],
  keywordGaps: [],
  matchedKeywords: [],
  keywordMatchRate: null,
  sectionScores: [],
  aiResult: null,
  aiLoading: false,
  aiError: null,
  isScoring: false,
  lastScoredAt: null,
  hasJobDescription: false,

  setResults: (results: ATSResult) => set({
    qualityScore: results.qualityScore,
    atsScore: results.atsScore,
    qualityIssues: results.qualityIssues,
    keywordGaps: results.keywordGaps,
    matchedKeywords: results.matchedKeywords,
    keywordMatchRate: results.keywordMatchRate,
    sectionScores: results.sectionScores,
    lastScoredAt: new Date(),
    isScoring: false,
  }),

  setScoring: (isScoring: boolean) => set({ isScoring }),
  setHasJobDescription: (has: boolean) => set({ hasJobDescription: has }),
  setAIResult: (result: AIATSResult) => set({ aiResult: result, aiLoading: false, aiError: null }),
  setAILoading: (loading: boolean) => set({ aiLoading: loading, aiError: null }),
  setAIError: (error: string | null) => set({ aiError: error, aiLoading: false }),

  reset: () => set({
    qualityScore: null,
    atsScore: null,
    qualityIssues: [],
    keywordGaps: [],
    matchedKeywords: [],
    keywordMatchRate: null,
    sectionScores: [],
    aiResult: null,
    aiLoading: false,
    aiError: null,
    isScoring: false,
    lastScoredAt: null,
  }),
}));
