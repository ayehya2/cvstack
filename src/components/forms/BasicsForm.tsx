import { useResumeStore } from '../../store'
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor';

export function BasicsForm() {
    const { resumeData, updateBasics } = useResumeStore();
    const { basics } = resumeData;
    const checkContent = useProofreadingStore(state => state.checkContent);

    useEffect(() => {
        if (basics.summary) {
            checkContent(basics.summary, 'basics-summary');
        }
    }, [basics.summary, checkContent]);

    const updateWebsite = (index: number, field: 'name' | 'url', value: string) => {
        const newWebsites = [...basics.websites];
        newWebsites[index] = { ...newWebsites[index], [field]: value };
        updateBasics({ websites: newWebsites });
    };

    const removeWebsite = (index: number) => {
        const newWebsites = basics.websites.filter((_, i) => i !== index);
        updateBasics({ websites: newWebsites });
    };

    return (
        <div className="space-y-6">
            <header className="space-y-0.5">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">Profile Information</h3>
            </header>

            <div className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={basics.name || ""}
                            onChange={(e) => updateBasics({ name: e.target.value })}
                            className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={basics.email || ""}
                            onChange={(e) => updateBasics({ email: e.target.value })}
                            className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={basics.phone || ""}
                            onChange={(e) => updateBasics({ phone: e.target.value })}
                            className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="(555) 000-0000"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Address</label>
                        <input
                            type="text"
                            value={basics.address || ""}
                            onChange={(e) => updateBasics({ address: e.target.value })}
                            className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="City, State"
                        />
                    </div>
                </div>

                {/* Professional Summary */}
                <div>
                    <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Professional Summary <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
                    </label>
                    <RichTextEditor
                        value={basics.summary || ''}
                        onChange={(html) => updateBasics({ summary: html })}
                        placeholder="A brief 2-3 sentence summary of your professional background, key skills, and career goals..."
                    />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Websites &amp; Links</h4>
                        <button
                            onClick={() => updateBasics({ websites: [...(basics.websites || []), { name: '', url: '' }] })}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                        >
                            <Plus size={12} strokeWidth={3} />
                            Add Link
                        </button>
                    </div>

                    <div className="space-y-3">
                        {basics.websites.map((site, index) => (
                            <div key={index} className="flex gap-3 items-end group">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Site Name</label>
                                    <input
                                        type="text"
                                        value={site.name}
                                        onChange={(e) => updateWebsite(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="LinkedIn"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">URL</label>
                                    <input
                                        type="url"
                                        value={site.url}
                                        onChange={(e) => updateWebsite(index, 'url', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <button
                                    onClick={() => removeWebsite(index)}
                                    className="w-9 flex-shrink-0 bg-red-500/5 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 border border-red-500/20 transition-all flex items-center justify-center rounded-none active:scale-95"
                                    title="Remove Link"
                                    style={{ height: '42px' }}
                                >
                                    <X size={16} strokeWidth={3} />
                                </button>
                            </div>
                        ))}

                        {basics.websites.length === 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-600 italic">No websites added. Add links to your LinkedIn, Portfolios, or Personal Sites.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
