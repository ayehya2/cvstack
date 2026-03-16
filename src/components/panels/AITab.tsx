import { useState, useEffect, useCallback } from 'react';
import { useModal } from '../common/ThemedModal';
import { useAIStore } from '../../lib/stores/aiStore';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/stores/coverLetterStore';
import {
    useAISuggestionStore,
    generateSuggestionId,
    type AISuggestionTarget,
    type InlineSuggestion,
} from '../../lib/stores/aiSuggestionStore';
import { useJobStore } from '../../lib/stores/jobStore';
import {
    improveResumeBullet,
    improveCoverLetterContent,
    generateProfessionalSummary,
} from '../../lib/ai/geminiService';
import {
    Key, Sparkles, Loader, ExternalLink, Eye, EyeOff,
    CheckCircle, XCircle, ShieldCheck, FileCheck, Mail,
    AlertTriangle, ArrowRight, Check, X, RefreshCw,
} from 'lucide-react';

export function AITab() {
    const modal = useModal();
    const { apiKey, isConfigured, setAPIKey, clearAPIKey, loadAPIKey } = useAIStore();
    const { resumeData } = useResumeStore();
    const showResume = useResumeStore(s => s.showResume);
    const updateWork = useResumeStore(s => s.updateWork);
    const updateBasics = useResumeStore(s => s.updateBasics);
    const { coverLetterData } = useCoverLetterStore();
    const showCoverLetter = useCoverLetterStore(s => s.showCoverLetter);
    const updateContent = useCoverLetterStore(s => s.updateContent);

    const {
        suggestions, isGenerating, target, error, step,
        setTarget, setStep, setError, setIsGenerating,
        addSuggestions, acceptSuggestion, dismissSuggestion,
        dismissAll, clearSuggestions, getPendingSuggestions,
    } = useAISuggestionStore();

    const { jobTitle, jobDescription } = useJobStore();

    const [keyInput, setKeyInput] = useState('');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        loadAPIKey();
    }, [loadAPIKey]);

    const handleSaveKey = () => {
        if (keyInput.trim()) {
            setAPIKey(keyInput.trim());
            setKeyInput('');
            setShowKey(false);
        }
    };

    const handleClearKey = async () => {
        if (await modal.confirm('Remove API Key', 'Are you sure you want to remove your API key?', { destructive: true })) {
            clearAPIKey();
            setKeyInput('');
        }
    };

    // Detect panel state
    const bothActive = showResume && showCoverLetter;
    const onlyResume = showResume && !showCoverLetter;
    const onlyCoverLetter = !showResume && showCoverLetter;
    const neitherActive = !showResume && !showCoverLetter;

    // Determine effective target
    const getEffectiveTarget = useCallback((): AISuggestionTarget | null => {
        if (neitherActive) return null;
        if (onlyResume) return 'resume';
        if (onlyCoverLetter) return 'coverletter';
        return target; // both active — use user's selection
    }, [neitherActive, onlyResume, onlyCoverLetter, target]);

    // Generate inline suggestions
    const handleGenerate = useCallback(async (genTarget: AISuggestionTarget) => {
        if (!isConfigured) {
            setError('Please configure your API key first');
            return;
        }

        setIsGenerating(true);
        setError('');
        setStep('generating');

        const newSuggestions: InlineSuggestion[] = [];

        try {
            // Generate resume suggestions
            if (genTarget === 'resume' || genTarget === 'both') {
                // Improve each work experience bullet
                for (let wIdx = 0; wIdx < (resumeData.work?.length || 0); wIdx++) {
                    const work = resumeData.work[wIdx];
                    for (let bIdx = 0; bIdx < work.bullets.length; bIdx++) {
                        const bullet = work.bullets[bIdx].trim();
                        if (!bullet || bullet.length < 10) continue; // skip empty or too short

                        try {
                            const improved = await improveResumeBullet(apiKey, bullet, { title: jobTitle, description: jobDescription });
                            if (improved && improved.trim() !== bullet) {
                                newSuggestions.push({
                                    id: generateSuggestionId(),
                                    fieldPath: `work.${wIdx}.bullets.${bIdx}`,
                                    original: bullet,
                                    suggested: improved.trim(),
                                    status: 'pending',
                                    target: 'resume',
                                });
                            }
                        } catch {
                            // Skip individual bullet errors, continue with others
                        }
                    }
                }

                // Improve professional summary if it exists
                if (resumeData.basics?.summary && resumeData.basics.summary.length > 20) {
                    try {
                        const improvedSummary = await generateProfessionalSummary(apiKey, {
                            name: resumeData.basics.name,
                            currentRole: resumeData.work?.[0] ? `${resumeData.work[0].position} at ${resumeData.work[0].company}` : undefined,
                            skills: resumeData.skills?.map(s => s.items.join(', ')).join('; '),
                            experience: resumeData.work?.map(w => `${w.position} at ${w.company}`).join(', '),
                            education: resumeData.education?.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join(', '),
                        });
                        if (improvedSummary && improvedSummary.trim() !== resumeData.basics.summary.trim()) {
                            newSuggestions.push({
                                id: generateSuggestionId(),
                                fieldPath: 'basics.summary',
                                original: resumeData.basics.summary,
                                suggested: improvedSummary.trim(),
                                status: 'pending',
                                target: 'resume',
                            });
                        }
                    } catch {
                        // Skip summary errors
                    }
                }
            }

            // Generate cover letter suggestions
            if (genTarget === 'coverletter' || genTarget === 'both') {
                if (coverLetterData.content && coverLetterData.content.length > 30) {
                    try {
                        const improved = await improveCoverLetterContent(apiKey, coverLetterData.content, { title: jobTitle, description: jobDescription });
                        if (improved && improved.trim() !== coverLetterData.content.trim()) {
                            newSuggestions.push({
                                id: generateSuggestionId(),
                                fieldPath: 'coverLetter.content',
                                original: coverLetterData.content,
                                suggested: improved.trim(),
                                status: 'pending',
                                target: 'coverletter',
                            });
                        }
                    } catch {
                        // Skip cover letter errors
                    }
                }
            }

            if (newSuggestions.length === 0) {
                setError('No improvements found. Your content is already strong!');
                setStep('idle');
            } else {
                addSuggestions(newSuggestions);
                setStep('reviewing');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
            setStep('idle');
        } finally {
            setIsGenerating(false);
        }
    }, [apiKey, isConfigured, jobDescription, jobTitle, resumeData, coverLetterData, setError, setIsGenerating, setStep, addSuggestions]);

    // Start the suggestion flow
    const handleStartSuggestions = useCallback(() => {
        clearSuggestions();
        if (neitherActive) {
            setStep('idle');
            return;
        }
        if (bothActive) {
            setStep('choosing-target');
        } else {
            const effectiveTarget = getEffectiveTarget();
            if (effectiveTarget) {
                setTarget(effectiveTarget);
                handleGenerate(effectiveTarget);
            }
        }
    }, [clearSuggestions, neitherActive, bothActive, getEffectiveTarget, setTarget, handleGenerate, setStep]);

    // Debounced automatic generation when job context changes
    useEffect(() => {
        if (!isConfigured || !jobDescription || jobDescription.length < 50) return;

        const timer = setTimeout(() => {
            // Only auto-trigger if we're not already doing something and suggestible
            if (step === 'idle' || step === 'reviewing') {
                handleStartSuggestions();
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [jobDescription, jobTitle, isConfigured, step, handleStartSuggestions]);

    const handleSelectTarget = (selectedTarget: AISuggestionTarget) => {
        setTarget(selectedTarget);
        handleGenerate(selectedTarget);
    };

    // Accept a suggestion and apply it inline
    const handleAccept = (suggestion: InlineSuggestion) => {
        acceptSuggestion(suggestion.id);

        // Apply the change to the actual store
        if (suggestion.target === 'resume') {
            const parts = suggestion.fieldPath.split('.');
            if (parts[0] === 'work') {
                const workIdx = parseInt(parts[1]);
                if (parts[2] === 'bullets') {
                    const bulletIdx = parseInt(parts[3]);
                    const newBullets = [...resumeData.work[workIdx].bullets];
                    newBullets[bulletIdx] = suggestion.suggested;
                    updateWork(workIdx, { bullets: newBullets });
                }
            } else if (parts[0] === 'basics' && parts[1] === 'summary') {
                updateBasics({ ...resumeData.basics, summary: suggestion.suggested });
            }
        } else if (suggestion.target === 'coverletter') {
            if (suggestion.fieldPath === 'coverLetter.content') {
                updateContent(suggestion.suggested);
            }
        }
    };

    const handleDismiss = (suggestion: InlineSuggestion) => {
        dismissSuggestion(suggestion.id);
    };

    const handleAcceptAll = (filterTarget?: 'resume' | 'coverletter') => {
        const pending = getPendingSuggestions(filterTarget);
        pending.forEach(s => handleAccept(s));
    };

    const handleDismissAll = (filterTarget?: 'resume' | 'coverletter') => {
        dismissAll(filterTarget);
    };

    const pendingResumeSuggestions = suggestions.filter(s => s.status === 'pending' && s.target === 'resume');
    const pendingCoverLetterSuggestions = suggestions.filter(s => s.status === 'pending' && s.target === 'coverletter');
    const allPending = suggestions.filter(s => s.status === 'pending');
    const accepted = suggestions.filter(s => s.status === 'accepted');
    const dismissed = suggestions.filter(s => s.status === 'dismissed');

    // Helper: get a readable field label
    const getFieldLabel = (suggestion: InlineSuggestion) => {
        const parts = suggestion.fieldPath.split('.');
        if (parts[0] === 'work') {
            const wIdx = parseInt(parts[1]);
            const job = resumeData.work?.[wIdx];
            const pos = job?.position || `Job #${wIdx + 1}`;
            if (parts[2] === 'bullets') {
                const bIdx = parseInt(parts[3]);
                return `${pos} — Bullet #${bIdx + 1}`;
            }
            return pos;
        }
        if (parts[0] === 'basics' && parts[1] === 'summary') return 'Professional Summary';
        if (parts[0] === 'coverLetter') return 'Cover Letter Body';
        return suggestion.fieldPath;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                    <Sparkles size={20} className="text-slate-400" />
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">AI Content Suggestions</h3>
                </div>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                    Automatically improve your resume and cover letter with action-verb-led, quantified rewrites powered by Google Gemini.
                </p>
            </div>

            {/* API Key Configuration */}
            <div className="p-6 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 shadow-sm transition-all hover:border-slate-400 dark:hover:border-slate-500">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-slate-100 dark:border-slate-800">
                    <Key size={18} className="text-slate-700 dark:text-slate-300" />
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">API Key Configuration</h4>
                    {isConfigured && (
                        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-950/30 px-2 py-0.5 border border-green-200 dark:border-green-900/50">
                            Active
                        </div>
                    )}
                </div>

                {isConfigured ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold italic">
                            <CheckCircle size={14} className="text-green-600 dark:text-green-500" />
                            <span>API key configured and ready for use</span>
                        </div>
                        <button
                            onClick={handleClearKey}
                            className="px-4 py-2 bg-[#7f1d1d] hover:bg-[#991b1b] text-white font-bold uppercase tracking-widest text-[10px] transition-colors"
                        >
                            Remove API Key
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                className="flex-1 px-4 py-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 font-medium transition-all text-sm"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                title={showKey ? 'Hide key' : 'Show key'}
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                            <button
                                onClick={handleSaveKey}
                                disabled={!keyInput.trim()}
                                className="px-6 py-2.5 btn-accent font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                            >
                                Save API Key
                            </button>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase tracking-tight transition-colors border-b border-dotted border-slate-400"
                            >
                                <ExternalLink size={12} />
                                Get a free API key from Google AI Studio
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {isConfigured && (
                <>
                    {/* Panel Detection Status */}
                    <div className="p-4 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Active Panels</div>
                        <div className="flex gap-3">
                            <div className={`flex items-center gap-2 px-3 py-2 border-2 text-xs font-bold transition-all ${showResume ? 'border-green-500/40 bg-green-500/5 text-green-700 dark:text-green-400' : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50'}`}>
                                <FileCheck size={14} />
                                <span>Resume</span>
                                {showResume && <Check size={12} />}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 border-2 text-xs font-bold transition-all ${showCoverLetter ? 'border-green-500/40 bg-green-500/5 text-green-700 dark:text-green-400' : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 opacity-50'}`}>
                                <Mail size={14} />
                                <span>Cover Letter</span>
                                {showCoverLetter && <Check size={12} />}
                            </div>
                        </div>
                    </div>

                    {/* Neither Active Warning */}
                    {neitherActive && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 flex items-start gap-3">
                            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-tight">No panels active</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Enable at least one panel (Resume or Cover Letter) using the sidebar toggle to generate AI suggestions.</p>
                            </div>
                        </div>
                    )}

                    {/* Target Selection (when both are active) */}
                    {step === 'choosing-target' && bothActive && (
                        <div className="p-6 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 space-y-4 animate-in fade-in duration-300">
                            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Suggestion Target</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Both Resume and Cover Letter are active. Where would you like AI suggestions?</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleSelectTarget('resume')}
                                    className="flex flex-col items-center gap-2 px-4 py-5 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-white dark:bg-slate-950 transition-all group"
                                >
                                    <FileCheck size={22} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Resume Only</span>
                                </button>
                                <button
                                    onClick={() => handleSelectTarget('coverletter')}
                                    className="flex flex-col items-center gap-2 px-4 py-5 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-white dark:bg-slate-950 transition-all group"
                                >
                                    <Mail size={22} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Cover Letter Only</span>
                                </button>
                                <button
                                    onClick={() => handleSelectTarget('both')}
                                    className="flex flex-col items-center gap-2 px-4 py-5 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-white dark:bg-slate-950 transition-all group"
                                >
                                    <div className="flex -space-x-1">
                                        <FileCheck size={18} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                                        <Mail size={18} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Both</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Generating State */}
                    {step === 'generating' && (
                        <div className="p-8 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                            <div className="relative">
                                <Loader size={32} className="animate-spin text-slate-400" />
                                <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-500 animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Analyzing Content</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generating action-verb-led, quantified rewrites...</p>
                                {target === 'both' && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-widest">Processing Resume + Cover Letter</p>}
                            </div>
                        </div>
                    )}

                    {/* Review Suggestions */}
                    {step === 'reviewing' && allPending.length > 0 && (
                        <div className="space-y-4">
                            {/* Stats bar */}
                            <div className="flex items-center justify-between p-3 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        {allPending.length} pending
                                    </span>
                                    {accepted.length > 0 && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
                                            {accepted.length} accepted
                                        </span>
                                    )}
                                    {dismissed.length > 0 && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {dismissed.length} dismissed
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptAll()}
                                        className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white transition-colors"
                                    >
                                        Accept All
                                    </button>
                                    <button
                                        onClick={() => handleDismissAll()}
                                        className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Dismiss All
                                    </button>
                                </div>
                            </div>

                            {/* Resume suggestions */}
                            {pendingResumeSuggestions.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b-2 border-slate-200 dark:border-slate-700 pb-2">
                                        <FileCheck size={14} />
                                        Resume Suggestions ({pendingResumeSuggestions.length})
                                    </div>
                                    {pendingResumeSuggestions.map(s => (
                                        <SuggestionCard
                                            key={s.id}
                                            suggestion={s}
                                            label={getFieldLabel(s)}
                                            onAccept={() => handleAccept(s)}
                                            onDismiss={() => handleDismiss(s)}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Cover letter suggestions */}
                            {pendingCoverLetterSuggestions.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b-2 border-slate-200 dark:border-slate-700 pb-2">
                                        <Mail size={14} />
                                        Cover Letter Suggestions ({pendingCoverLetterSuggestions.length})
                                    </div>
                                    {pendingCoverLetterSuggestions.map(s => (
                                        <SuggestionCard
                                            key={s.id}
                                            suggestion={s}
                                            label={getFieldLabel(s)}
                                            onAccept={() => handleAccept(s)}
                                            onDismiss={() => handleDismiss(s)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completed State */}
                    {step === 'reviewing' && allPending.length === 0 && suggestions.length > 0 && (
                        <div className="p-6 border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 text-center space-y-3">
                            <CheckCircle size={24} className="text-green-600 dark:text-green-500 mx-auto" />
                            <p className="text-sm font-bold text-green-800 dark:text-green-400 uppercase tracking-wider">All Suggestions Reviewed</p>
                            <p className="text-xs text-green-700 dark:text-green-500">
                                {accepted.length} accepted, {dismissed.length} dismissed.
                                Accepted changes have been applied inline to your forms.
                            </p>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-slate-900 border-l-4 border-red-500 flex items-start gap-3">
                            <XCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-800 dark:text-red-300 font-bold uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {/* Generate Button */}
                    {!neitherActive && step !== 'generating' && (
                        <button
                            onClick={handleStartSuggestions}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 btn-accent font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.99] border-t-2 border-slate-700"
                        >
                            {step === 'reviewing' || (step === 'idle' && suggestions.length > 0) ? (
                                <>
                                    <RefreshCw size={18} className="text-slate-400" />
                                    <span>Re-analyze Content</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} className="text-slate-400" />
                                    <span>Generate AI Suggestions</span>
                                    <ArrowRight size={14} className="ml-1" />
                                </>
                            )}
                        </button>
                    )}
                </>
            )}

            <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity">
                    <ShieldCheck size={16} className="text-slate-500 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                        Security Notice: Your API key is persisted locally within your browser&apos;s secure storage. Requests are dispatched directly to the Google AI Gateway. No data is stored on our auxiliary servers.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Inline suggestion card component
function SuggestionCard({
    suggestion,
    label,
    onAccept,
    onDismiss,
}: {
    suggestion: InlineSuggestion;
    label: string;
    onAccept: () => void;
    onDismiss: () => void;
}) {
    return (
        <div className="p-4 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                <div className="flex gap-1.5">
                    <button
                        onClick={onAccept}
                        className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white transition-colors"
                        title="Accept suggestion"
                    >
                        <Check size={10} strokeWidth={3} />
                        Accept
                    </button>
                    <button
                        onClick={onDismiss}
                        className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border-2 border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Dismiss suggestion"
                    >
                        <X size={10} strokeWidth={3} />
                        Dismiss
                    </button>
                </div>
            </div>
            {/* Original */}
            <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/60">Original</span>
                <div className="px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-sm text-slate-700 dark:text-slate-300 line-through decoration-red-400/50">
                    {suggestion.original.length > 200 ? suggestion.original.slice(0, 200) + '...' : suggestion.original}
                </div>
            </div>
            {/* Suggested */}
            <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-green-500/60">Suggested</span>
                <div className="px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {suggestion.suggested.length > 200 ? suggestion.suggested.slice(0, 200) + '...' : suggestion.suggested}
                </div>
            </div>
        </div>
    );
}
