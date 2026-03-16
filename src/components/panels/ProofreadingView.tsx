import { useProofreadingStore, type ProofreadingSuggestion } from '../../lib/stores/proofreadingStore';
import { AlertCircle, CheckCircle2, Info, X, Zap } from 'lucide-react';

export function ProofreadingView() {
    const { suggestions, isOpen, setIsOpen, isChecking } = useProofreadingStore();

    if (suggestions.length === 0 && !isChecking) return null;

    return (
        <div className="relative mt-2">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 border-2 border-dashed transition-all group"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        borderColor: 'var(--sidebar-border)'
                    }}
                    title="View Writing Suggestions"
                >
                    <div className="flex items-center gap-2">
                        <Zap size={14} className={isChecking ? 'animate-pulse text-yellow-500' : ''} style={{ color: isChecking ? undefined : 'var(--sidebar-text)', opacity: isChecking ? 1 : 0.4 }} />
                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:opacity-100 transition-opacity" style={{ color: 'var(--sidebar-text)', opacity: 0.4 }}>Writing Assistant</span>
                    </div>
                    {suggestions.length > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 min-w-[18px] text-center rounded-none ring-1 ring-white/20">
                            {suggestions.length}
                        </span>
                    )}
                </button>
            ) : (
                <div className="absolute left-0 bottom-full w-full border-2 shadow-2xl flex flex-col max-h-[400px] animate-in slide-in-from-bottom-2 duration-200 z-[110]"
                    style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
                >
                    {/* Header */}
                    <div className="p-3 border-b-2 flex justify-between items-center" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--sidebar-border)' }}>
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-yellow-500" />
                            <h4 className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--sidebar-text)', opacity: 0.8 }}>Writing Assistant</h4>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--sidebar-text)', opacity: 0.4 }}>
                            <X size={14} className="hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Suggestions List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        {isChecking && suggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center px-4" style={{ color: 'var(--sidebar-text)', opacity: 0.2 }}>
                                <Zap size={20} className="animate-pulse text-yellow-500/50" />
                                <span className="text-[8px] font-bold uppercase tracking-widest leading-normal">Analyzing your text for style & grammar...</span>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-green-500/50 gap-2">
                                <CheckCircle2 size={20} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">No issues found!</span>
                            </div>
                        ) : (
                            suggestions.map((s: ProofreadingSuggestion) => (
                                <div key={s.id} className={`p-3 border-l-4 ${s.type === 'style' ? 'border-blue-500/40 bg-blue-500/5' : 'border-orange-500/40 bg-orange-500/5'} space-y-2 group/item relative`}>
                                    <div className="flex items-start gap-2">
                                        {s.type === 'style' ? <Info size={12} className="text-blue-400 mt-0.5" /> : <AlertCircle size={12} className="text-orange-400 mt-0.5" />}
                                        <div className="space-y-1 flex-1">
                                            <p className="text-[10px] font-bold leading-tight italic" style={{ color: 'var(--sidebar-text)', opacity: 0.9 }}>
                                                &quot;{s.text}&quot;
                                            </p>
                                            <p className="text-[9px] leading-snug" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
                                                {s.message}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const { dismissSuggestion } = useProofreadingStore.getState();
                                                dismissSuggestion(s.id);
                                            }}
                                            className="opacity-0 group-hover/item:opacity-100 transition-all p-0.5"
                                            style={{ color: 'var(--sidebar-text)', opacity: 0.2 }}
                                            title="Dismiss"
                                        >
                                            <X size={10} className="hover:opacity-60" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1 border-t mt-1" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <button
                                            onClick={() => {
                                                const { ignoreWord } = useProofreadingStore.getState();
                                                ignoreWord(s.text);
                                            }}
                                            className="text-[8px] font-black uppercase tracking-widest transition-colors"
                                            style={{ color: 'var(--sidebar-text)', opacity: 0.3 }}
                                        >
                                            [ Ignore Always ]
                                        </button>

                                        {s.suggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 flex-1 justify-end">
                                                {s.suggestions.map((suggestion: string, idx: number) => (
                                                    <span key={idx} className="text-[8px] px-2 py-0.5 font-bold border uppercase tracking-tighter"
                                                        style={{
                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                            color: 'var(--sidebar-text)',
                                                            opacity: 0.8,
                                                            borderColor: 'rgba(255,255,255,0.1)'
                                                        }}>
                                                        {suggestion}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t text-center" style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-[7px] font-black uppercase tracking-[0.2em] leading-relaxed" style={{ color: 'var(--sidebar-text)', opacity: 0.2 }}>
                            Style: write-good • Grammar: LT
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
