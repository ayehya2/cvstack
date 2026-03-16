import { useState } from 'react';
import { useResumeStore } from '../../store';
import { buildShareUrl } from '../../lib/shareUtils';
import { Link2, Copy, Check, BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';

export function ShareAnalyticsView() {
    const resumeData = useResumeStore(state => state.resumeData);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [urlLength, setUrlLength] = useState(0);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const url = await buildShareUrl(resumeData);
            setShareUrl(url);
            setUrlLength(url.length);
            setCopied(false);
        } catch (e) {
            console.error('Failed to generate share link:', e);
            setShareUrl('');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = shareUrl;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <div className="space-y-8">
            {/* ── Share Section ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4 border-b pb-2 border-slate-50 dark:border-slate-800">
                    <Link2 size={16} style={{ color: 'var(--accent)' }} />
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--main-text)' }}>
                        Share Resume
                    </h3>
                </div>

                <p className="text-xs mb-6 leading-relaxed opacity-70" style={{ color: 'var(--main-text-secondary)' }}>
                    Generate a shareable link that contains your entire resume. Anyone with the link can view a read-only version of your resume — no account required.
                </p>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-accent w-full flex items-center justify-center gap-2 py-3 px-6 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Generating…</span>
                        </>
                    ) : shareUrl ? (
                        <>
                            <RefreshCw size={16} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Regenerate Link</span>
                        </>
                    ) : (
                        <>
                            <Link2 size={16} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Generate Share Link</span>
                        </>
                    )}
                </button>

                {/* Generated URL Display */}
                {shareUrl && (
                    <div className="mt-6 space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-3 py-2 text-xs font-mono border-2 focus:border-accent outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--input-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--main-text)',
                                }}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button
                                onClick={handleCopy}
                                className="flex items-center justify-center gap-2 px-6 border-2 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
                                style={{
                                    backgroundColor: copied ? '#16a34a' : 'transparent',
                                    borderColor: copied ? '#16a34a' : 'var(--card-border)',
                                    color: copied ? '#ffffff' : 'var(--main-text)',
                                }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>

                        {/* URL stats */}
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded" style={{ color: 'var(--main-text-secondary)' }}>
                                URL Length: {urlLength.toLocaleString()} chars
                            </span>
                            {urlLength > 8000 && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Truncation Risk
                                </span>
                            )}
                        </div>

                        {/* Info note */}
                        <div className="p-4 border-2 border-dashed bg-orange-50/20 dark:bg-orange-950/10" style={{ borderColor: 'rgba(234, 88, 12, 0.2)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed text-orange-600/80 dark:text-orange-400/80">
                                This link reflects your resume at the moment it was generated. After making updates, click "Regenerate Link" to create a new one.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Analytics Section (Placeholder) ── */}
            <div className="border-t-2 pt-8 border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={16} style={{ color: 'var(--main-text-secondary)' }} />
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--main-text)' }}>
                        Analytics
                    </h3>
                </div>

                <div
                    className="flex flex-col items-center justify-center py-16 border-2 border-dashed"
                    style={{ borderColor: 'var(--card-border)', backgroundColor: 'transparent' }}
                >
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <BarChart3 size={32} className="opacity-20" style={{ color: 'var(--main-text-secondary)' }} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--main-text-secondary)' }}>
                        Analytics coming soon
                    </p>
                    <p className="text-[10px] font-bold mt-2 max-w-[280px] opacity-40 uppercase tracking-wider" style={{ color: 'var(--main-text-secondary)' }}>
                        Track views, downloads, and engagement for your shared resume links.
                    </p>
                </div>
            </div>
        </div>
    );
}
