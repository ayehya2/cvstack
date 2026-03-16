import { useState } from 'react';
import { useResumeStore } from '../../store';
import { buildShareUrl } from '../../lib/shareUtils';
import { Link2, Copy, Check, BarChart3, RefreshCw } from 'lucide-react';

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
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Link2 size={20} style={{ color: 'var(--accent)' }} />
                    <h3 className="text-xl font-bold" style={{ color: 'var(--main-text)' }}>
                        Share Resume
                    </h3>
                </div>

                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--main-text-secondary)' }}>
                    Generate a shareable link that contains your entire resume. Anyone with the link can view a read-only version of your resume — no account required.
                </p>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all rounded-none btn-accent disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Generating…</span>
                        </>
                    ) : shareUrl ? (
                        <>
                            <RefreshCw size={16} />
                            <span>Regenerate Link</span>
                        </>
                    ) : (
                        <>
                            <Link2 size={16} />
                            <span>Generate Share Link</span>
                        </>
                    )}
                </button>

                {/* Generated URL Display */}
                {shareUrl && (
                    <div className="mt-4 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 px-3 py-2 text-xs font-mono border-2 rounded-none truncate"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    borderColor: 'var(--card-border)',
                                    color: 'var(--main-text)',
                                }}
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 rounded-none transition-all"
                                style={{
                                    backgroundColor: copied ? '#16a34a' : 'transparent',
                                    borderColor: copied ? '#16a34a' : 'var(--card-border)',
                                    color: copied ? '#ffffff' : 'var(--main-text)',
                                }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>

                        {/* URL stats */}
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--main-text-secondary)' }}>
                                URL Length: {urlLength.toLocaleString()} chars
                            </span>
                            {urlLength > 8000 && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                                    ⚠ Long URL — some platforms may truncate
                                </span>
                            )}
                        </div>

                        {/* Info note */}
                        <div className="p-3 border-2 border-dashed" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed" style={{ color: 'var(--main-text-secondary)' }}>
                                This link reflects your resume at the moment it was generated. After making updates, click "Regenerate Link" to create a new one.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Analytics Section (Placeholder) ── */}
            <div className="border-t-2 pt-8" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 size={20} style={{ color: 'var(--main-text-secondary)' }} />
                    <h3 className="text-xl font-bold" style={{ color: 'var(--main-text)' }}>
                        Analytics
                    </h3>
                </div>

                <div
                    className="flex flex-col items-center justify-center py-12 border-2 border-dashed text-center"
                    style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}
                >
                    <BarChart3 size={40} className="mb-3 opacity-20" style={{ color: 'var(--main-text-secondary)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--main-text-secondary)' }}>
                        Analytics coming soon
                    </p>
                    <p className="text-xs mt-1.5 max-w-[280px]" style={{ color: 'var(--main-text-secondary)', opacity: 0.6 }}>
                        Track views, downloads, and engagement for your shared resume links.
                    </p>
                </div>
            </div>
        </div>
    );
}
