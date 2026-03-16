import { useEffect } from 'react';
import { useCoverLetterStore } from '../../lib/coverLetterStore';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useResumeStore } from '../../store';
import { Sparkles, Mail } from 'lucide-react';
import { SmartDateInput } from './SmartDateInput';
import { RichTextEditor } from './RichTextEditor';

export function CoverLetterForm() {
    const { coverLetterData, updateRecipient, updatePosition, updateDate, updateContent } = useCoverLetterStore();
    const checkContent = useProofreadingStore(state => state.checkContent);
    useResumeStore();

    useEffect(() => {
        if (coverLetterData.content) {
            checkContent(coverLetterData.content, 'cover-letter-content');
        }
    }, [coverLetterData.content, checkContent]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2.5">
                <Mail size={20} className="text-slate-400" />
                <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Cover Letter</h3>
            </div>

            {/* Date */}
            <div className="relative">
                <SmartDateInput
                    label="Date"
                    type="date"
                    value={coverLetterData.date}
                    onChange={updateDate}
                    placeholder="January 29, 2026"
                />
                <button
                    onClick={() => updateDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
                    className="absolute right-0 top-0 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-accent transition-colors py-1"
                >
                    Today
                </button>
            </div>

            {/* Recipient Information — 2×2 grid */}
            <div className="p-5 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-tight text-sm pb-2 mb-4 border-b border-slate-200 dark:border-slate-800">Recipient Information</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Recipient Name
                        </label>
                        <input
                            type="text"
                            value={coverLetterData.recipientName || ''}
                            onChange={(e) => updateRecipient({ recipientName: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="Jane Smith"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Recipient Title
                        </label>
                        <input
                            type="text"
                            value={coverLetterData.recipientTitle || ''}
                            onChange={(e) => updateRecipient({ recipientTitle: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="Hiring Manager"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={coverLetterData.company || ''}
                            onChange={(e) => updateRecipient({ company: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="Acme Corporation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Company Address
                        </label>
                        <input
                            type="text"
                            value={coverLetterData.companyAddress || ''}
                            onChange={(e) => updateRecipient({ companyAddress: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="123 Business St, City, State 12345"
                        />
                    </div>
                </div>
            </div>

            {/* Position */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Position Applying For
                </label>
                <input
                    type="text"
                    value={coverLetterData.position || ''}
                    onChange={(e) => updatePosition(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="Senior Software Engineer"
                />
            </div>

            {/* Letter Body (Content) */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Letter Body (Greeting, Content, & Signature)
                </label>
                <RichTextEditor
                    value={coverLetterData.content}
                    onChange={(html) => updateContent(html)}
                    placeholder="Dear Hiring Manager, &#10;&#10;I am writing to express my interest...&#10;&#10;Sincerely, &#10;&#10;[Your Name]"
                />
            </div>

            <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-3">
                    <Sparkles size={16} className="text-slate-500 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                        Professional Guidance: Utilize the &quot;AI Assistant&quot; module to generate highly targeted, industry-specific content for your cover letter.
                    </p>
                </div>
            </div>
        </div>
    );
}
