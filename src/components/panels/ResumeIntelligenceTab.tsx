import { useEffect, useRef, useCallback, useState } from 'react';
import {
  CheckCircle2, AlertTriangle, Info, XCircle,
  Plus, TrendingUp, Zap, ChevronDown, ChevronRight,
  Sparkles, ThumbsUp, ThumbsDown, Star, Loader2, BrainCircuit
} from 'lucide-react';
import { useResumeStore } from '../../store';
import { useJobStore } from '../../lib/stores/jobStore';
import { useAIStore } from '../../lib/stores/aiStore';
import { useATSStore } from '../../lib/stores/atsStore';
import { calculateATSScore, getScoreColor, getScoreLabel, runAIATSAnalysis } from '../../lib/ai/atsScoring';
import type { QualityIssue, KeywordGap, AIATSSuggestion } from '../../lib/ai/atsScoring';

// ── Score Ring — compact, always-visible ──
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[7px] font-bold uppercase tracking-widest opacity-40">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

// ── Section Bar ──
function SectionBar({ name, score, maxScore }: { name: string; score: number; maxScore: number }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color = getScoreColor(pct);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-50 w-16 shrink-0 text-right">{name}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-bold w-10 tabular-nums" style={{ color }}>{score}/{maxScore}</span>
    </div>
  );
}

// ── Issue Row ──
function IssueRow({ issue }: { issue: QualityIssue }) {
  const [open, setOpen] = useState(false);
  const Icon = issue.severity === 'error' ? XCircle : issue.severity === 'warning' ? AlertTriangle : Info;
  const c = issue.severity === 'error' ? '#ef4444' : issue.severity === 'warning' ? '#f59e0b' : '#60a5fa';
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color: c }} className="shrink-0" />
        <span className="text-[10px] font-bold flex-1 truncate">{issue.title}</span>
        {open ? <ChevronDown size={10} className="opacity-20" /> : <ChevronRight size={10} className="opacity-20" />}
      </div>
      {open && (
        <div className="mt-1.5 ml-5 space-y-1">
          <p className="text-[9px] opacity-50 leading-relaxed">{issue.description}</p>
          {issue.fixSuggestion && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 bg-white/5 border border-white/10">
              <Zap size={8} className="shrink-0 mt-0.5 text-amber-400" />
              <span className="text-[8px] opacity-60 leading-relaxed">{issue.fixSuggestion}</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ── Keyword Gap Row ──
function GapRow({ gap, onAdd }: { gap: KeywordGap; onAdd: (kw: string) => void }) {
  const c = gap.importance === 'high' ? '#ef4444' : gap.importance === 'medium' ? '#f59e0b' : '#60a5fa';
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 transition-colors group">
      <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: c }} />
      <span className="text-[10px] font-bold flex-1 truncate">{gap.keyword}</span>
      <span className="text-[7px] font-bold uppercase tracking-wider opacity-20">{gap.occurrencesInJD}×</span>
      <button onClick={() => onAdd(gap.keyword)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10" title="Add to skills">
        <Plus size={10} className="text-green-400" />
      </button>
    </div>
  );
}

// ── AI Suggestion Row ──
function AISuggestionRow({ s }: { s: AIATSSuggestion }) {
  const [open, setOpen] = useState(false);
  const impactColor = s.impact === 'high' ? '#ef4444' : s.impact === 'medium' ? '#f59e0b' : '#60a5fa';
  return (
    <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
      <div className="flex items-center gap-2">
        <Star size={10} style={{ color: impactColor }} className="shrink-0" />
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-40 w-16 shrink-0">{s.section}</span>
        <span className="text-[10px] flex-1 truncate opacity-70">{s.suggestion.slice(0, 80)}{s.suggestion.length > 80 ? '...' : ''}</span>
        {open ? <ChevronDown size={10} className="opacity-20" /> : <ChevronRight size={10} className="opacity-20" />}
      </div>
      {open && <p className="mt-1.5 ml-7 text-[9px] opacity-50 leading-relaxed">{s.suggestion}</p>}
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function ResumeIntelligenceTab() {
  const resumeData = useResumeStore(s => s.resumeData);
  const jobStore = useJobStore();
  const aiStore = useAIStore();
  const atsStore = useATSStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const hasMountedRef = useRef(false);
  
  const jobDescription = jobStore.jobDescription || '';
  const hasJD = jobDescription.trim().length > 50;

  const prevResumeDataRef = useRef(resumeData);
  const prevJDRef = useRef(jobDescription);

  // Scoring function
  const runScoring = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    atsStore.setScoring(true);
    setIsStale(false);
    setTimeout(() => {
      const results = calculateATSScore(resumeData, jobDescription);
      atsStore.setResults(results);
    }, 50);
  }, [resumeData, jobDescription, atsStore]);

  // Initial scoring on mount
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      // Use setTimeout to avoid sync setState in effect
      setTimeout(() => runScoring(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle changes after mount — auto-refresh after 30s
  useEffect(() => {
    if (!hasMountedRef.current) return;
    const hasResumeChanged = resumeData !== prevResumeDataRef.current;
    const hasJDChanged = jobDescription !== prevJDRef.current;

    if (hasResumeChanged || hasJDChanged) {
      prevResumeDataRef.current = resumeData;
      prevJDRef.current = jobDescription;
      
      // Use setTimeout to avoid sync setState in effect
      setTimeout(() => setIsStale(true), 0);
      
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(runScoring, 30000); // 30s auto-refresh
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resumeData, jobDescription, runScoring]);

  // AI Deep Analysis handler
  const handleAIAnalysis = async () => {
    if (!aiStore.isConfigured || !hasJD) return;
    atsStore.setAILoading(true);
    try {
      const result = await runAIATSAnalysis(aiStore.apiKey, resumeData, jobDescription);
      atsStore.setAIResult(result);
    } catch (err) {
      atsStore.setAIError(err instanceof Error ? err.message : 'AI analysis failed');
    }
  };

  // Add keyword to skills
  const addToSkills = (keyword: string) => {
    const store = useResumeStore.getState();
    const skills = [...store.resumeData.skills];
    if (skills.length === 0) {
      store.addSkill();
      store.updateSkill(0, { category: 'Additional Skills', items: [keyword] });
    } else {
      const lastIdx = skills.length - 1;
      store.updateSkill(lastIdx, { items: [...skills[lastIdx].items, keyword] });
    }
  };

  const { qualityScore, atsScore, qualityIssues, keywordGaps, matchedKeywords, sectionScores, isScoring, keywordMatchRate, aiResult, aiLoading, aiError } = atsStore;

  // Loading state
  if (qualityScore === null || isScoring) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 mx-auto mb-3 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">Analyzing...</p>
      </div>
    );
  }

  const errorCount = qualityIssues.filter(i => i.severity === 'error').length;
  const warningCount = qualityIssues.filter(i => i.severity === 'warning').length;
  const visibleIssues = showAllIssues ? qualityIssues : qualityIssues.slice(0, 4);
  const visibleGaps = showAllGaps ? keywordGaps : keywordGaps.slice(0, 6);

  return (
    <div className="space-y-4 pb-8">

      {/* ━━ SECTION HEADER ━━ */}
      <div className="flex items-center gap-2.5 mb-4">
        <BrainCircuit size={20} className="text-slate-400" />
        <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Resume Intelligence</h3>
      </div>

      {/* ━━ DUAL SCORE HEADER — Always visible ━━ */}
      <div className="border-2 overflow-hidden shadow-sm relative isolate" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
        {/* Stale/Manual Refresh Overlay */}
        {isStale && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest">
              <Loader2 size={8} className="animate-spin" />
              Changes Detected
            </div>
            <button 
              onClick={runScoring}
              className="btn-add px-2 py-1 text-[8px] font-black uppercase tracking-widest shadow-lg"
            >
              Refresh Now
            </button>
          </div>
        )}

        <div className={`relative z-10 flex items-stretch border-slate-100 dark:border-slate-800 transition-opacity duration-300 ${isStale ? 'opacity-60' : 'opacity-100'}`} style={{ backgroundColor: 'var(--card-bg)' }}>
          {/* Resume Quality Score */}
          <div className="flex-1 p-5 flex flex-col items-center border-r-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
            <ScoreRing score={qualityScore || 0} />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-2">Resume Quality</span>
            <p className="text-[8px] font-bold opacity-40 mt-1 text-center max-w-[140px] leading-relaxed uppercase tracking-tight">
              General resume completeness, structure, action verbs & formatting
            </p>
            <div className="mt-2 flex items-center gap-2">
              {errorCount > 0 && <span className="text-[7px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5">{errorCount} err</span>}
              {warningCount > 0 && <span className="text-[7px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5">{warningCount} warn</span>}
              {errorCount === 0 && warningCount === 0 && <span className="text-[7px] font-bold text-green-400">✓ Clean</span>}
            </div>
          </div>

          {/* ATS Match Score */}
          <div className="flex-1 p-4 flex flex-col items-center">
            {atsScore !== null ? (
              <>
                <ScoreRing score={atsScore} />
                <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-30 mt-1">ATS Match</span>
                <p className="text-[7px] opacity-20 mt-1 text-center max-w-[120px] leading-relaxed">
                  How well your resume matches the job description keywords & requirements
                </p>
                {keywordMatchRate !== null && (
                  <span className="text-[7px] font-bold opacity-30 mt-2">{Math.round(keywordMatchRate * 100)}% keywords</span>
                )}
              </>
            ) : (
              <>
                <div className="w-[80px] h-[80px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-full">
                  <span className="text-[9px] font-bold opacity-20 text-center">No JD</span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-30 mt-1">ATS Match</span>
                <p className="text-[7px] opacity-20 mt-1 text-center max-w-[120px] leading-relaxed">
                  Paste a job description in the "Job Link" tab to get this score
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ━━ AI DEEP ANALYSIS ━━ */}
      {hasJD && (
        <div className="border-2 overflow-hidden" style={{ borderColor: 'var(--card-border)' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-purple-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-30">AI Deep Analysis</span>
            </div>
            <button
              onClick={handleAIAnalysis}
              disabled={aiLoading || !aiStore.isConfigured}
              className="btn-add flex items-center gap-1.5 px-3 py-1 text-[8px] font-bold uppercase tracking-widest transition-all disabled:opacity-30"
            >
              {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              {aiLoading ? 'Analyzing...' : aiResult ? 'Re-scan' : 'Run AI Scan'}
            </button>
          </div>

          {!aiStore.isConfigured && (
            <div className="px-3 py-2 text-[9px] opacity-40 border-t border-white/5">
              Set your Gemini API key in the AI tab to enable deep analysis.
            </div>
          )}

          {aiError && (
            <div className="px-3 py-2 text-[9px] text-red-400 border-t border-white/5">{aiError}</div>
          )}

          {aiResult && (
            <div className="border-t border-white/5">
              {/* AI Score + Summary */}
              <div className="px-3 py-3 flex items-start gap-3">
                <div className="shrink-0">
                  <ScoreRing score={aiResult.overallScore} size={56} />
                  <span className="text-[7px] font-bold uppercase tracking-widest opacity-20 block text-center mt-1">AI Score</span>
                </div>
                <p className="text-[10px] opacity-60 leading-relaxed flex-1">{aiResult.summary}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 border-t border-white/5">
                <div className="p-3 border-r border-white/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ThumbsUp size={10} className="text-green-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Strengths</span>
                  </div>
                  {aiResult.strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 mb-1">
                      <CheckCircle2 size={8} className="text-green-400 shrink-0 mt-0.5" />
                      <span className="text-[9px] opacity-50 leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ThumbsDown size={10} className="text-red-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Weaknesses</span>
                  </div>
                  {aiResult.weaknesses.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5 mb-1">
                      <XCircle size={8} className="text-red-400 shrink-0 mt-0.5" />
                      <span className="text-[9px] opacity-50 leading-relaxed">{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions */}
              {aiResult.suggestions.length > 0 && (
                <div className="border-t border-white/5">
                  <div className="px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-20">AI Suggestions ({aiResult.suggestions.length})</span>
                  </div>
                  {aiResult.suggestions.map((s, i) => <AISuggestionRow key={i} s={s} />)}
                </div>
              )}

              {/* AI Missing Keywords */}
              {aiResult.missingKeywords.length > 0 && (
                <div className="border-t border-white/5 px-3 py-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-20 block mb-1.5">AI-Detected Missing Keywords</span>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.missingKeywords.map(kw => (
                      <button key={kw} onClick={() => addToSkills(kw)}
                        className="px-2 py-0.5 text-[8px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        title="Click to add to skills">
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ━━ SECTION BREAKDOWN ━━ */}
      <div className="border-2 overflow-hidden isolate relative" style={{ borderColor: 'var(--card-border)' }}>
        <div className="px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-20">Section Breakdown</span>
        </div>
        <div className="px-3 py-2 space-y-2">
          {sectionScores.map(s => <SectionBar key={s.name} name={s.name} score={s.score} maxScore={s.maxScore} />)}
        </div>
      </div>

      {/* ━━ KEYWORD GAPS (only when JD) ━━ */}
      {keywordGaps.length > 0 && (
        <div className="border-2 overflow-hidden" style={{ borderColor: 'var(--card-border)' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-amber-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-20">Missing Keywords ({keywordGaps.length})</span>
            </div>
            <div className="flex items-center gap-2 text-[7px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-0.5"><div className="w-1 h-1 rounded-full bg-red-400" /> High</span>
              <span className="flex items-center gap-0.5"><div className="w-1 h-1 rounded-full bg-amber-400" /> Med</span>
              <span className="flex items-center gap-0.5"><div className="w-1 h-1 rounded-full bg-blue-400" /> Low</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {visibleGaps.map(g => <GapRow key={g.keyword} gap={g} onAdd={addToSkills} />)}
          </div>
          {keywordGaps.length > 6 && (
            <button onClick={() => setShowAllGaps(!showAllGaps)} className="w-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-blue-500">
              {showAllGaps ? 'Show Less' : `Show All ${keywordGaps.length}`}
            </button>
          )}
        </div>
      )}

      {/* ━━ MATCHED KEYWORDS ━━ */}
      {matchedKeywords.length > 0 && (
        <div className="border-2 overflow-hidden" style={{ borderColor: 'var(--card-border)' }}>
          <div className="px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-green-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-20">Matched ({matchedKeywords.length})</span>
            </div>
          </div>
          <div className="px-3 py-2 flex flex-wrap gap-1">
            {matchedKeywords.slice(0, 15).map(kw => (
              <span key={kw} className="px-1.5 py-0.5 text-[8px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">{kw}</span>
            ))}
            {matchedKeywords.length > 15 && <span className="px-1.5 py-0.5 text-[8px] opacity-20">+{matchedKeywords.length - 15} more</span>}
          </div>
        </div>
      )}

      {/* ━━ QUALITY ISSUES ━━ */}
      {qualityIssues.length > 0 && (
        <div className="border-2 overflow-hidden" style={{ borderColor: 'var(--card-border)' }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <span className="text-[8px] font-black uppercase tracking-[0.15em] opacity-20">Issues ({qualityIssues.length})</span>
          </div>
          {visibleIssues.map(issue => <IssueRow key={issue.id} issue={issue} />)}
          {qualityIssues.length > 4 && (
            <button onClick={() => setShowAllIssues(!showAllIssues)} className="w-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-blue-500">
              {showAllIssues ? 'Show Less' : `Show All ${qualityIssues.length}`}
            </button>
          )}
        </div>
      )}

      {qualityIssues.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-3 bg-green-500/5 border border-green-500/20">
          <CheckCircle2 size={14} className="text-green-400" />
          <span className="text-[10px] font-bold text-green-300">All quality checks pass</span>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-[7px] font-bold uppercase tracking-widest opacity-15 pt-2">
        Local analysis • No data leaves your browser{hasJD && aiStore.isConfigured && ' • AI uses Gemini API'}
      </p>
    </div>
  );
}
