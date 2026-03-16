import { useResumeStore } from '../../store'
import { useProofreadingStore } from '../../lib/stores/proofreadingStore';
import { useEffect } from 'react'
import { Trash2, Plus, ExternalLink, User } from 'lucide-react'
import { RichTextEditor } from '../common/RichTextEditor';

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
            <div className="flex items-center gap-2.5">
                <User size={20} className="text-slate-400" />
                <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Profile Information</h3>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            value={basics.name || ""}
                            onChange={(e) => updateBasics({ name: e.target.value })}
                            className="form-input"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={basics.email || ""}
                            onChange={(e) => updateBasics({ email: e.target.value })}
                            className="form-input"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">Phone</label>
                        <input
                            type="tel"
                            value={basics.phone || ""}
                            onChange={(e) => updateBasics({ phone: e.target.value })}
                            className="form-input"
                            placeholder="(555) 000-0000"
                        />
                    </div>

                    <div>
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            value={basics.address || ""}
                            onChange={(e) => updateBasics({ address: e.target.value })}
                            className="form-input"
                            placeholder="City, State"
                        />
                    </div>
                </div>

                {/* Professional Summary */}
                <div>
                    <label className="form-label">
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
                            className="btn-add px-3 py-1.5 flex items-center gap-1.5"
                        >
                            <Plus size={12} strokeWidth={3} />
                            Add Link
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {basics.websites.map((site, index) => (
                            <div key={index} className="flex gap-2 items-center py-2 first:pt-0 last:pb-0">
                                <div style={{ width: '140px', minWidth: '140px' }}>
                                    <input
                                        type="text"
                                        value={site.name}
                                        onChange={(e) => updateWebsite(index, 'name', e.target.value)}
                                        className="form-input"
                                        placeholder="Site name"
                                    />
                                </div>
                                <div className="flex-1 relative min-w-0">
                                    <input
                                        type="url"
                                        value={site.url}
                                        onChange={(e) => updateWebsite(index, 'url', e.target.value)}
                                        className="form-input pr-8"
                                        placeholder="https://..."
                                    />
                                    {site.url && (
                                        <a
                                            href={site.url.startsWith('http') ? site.url : `https://${site.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
                                            title="Open link"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <ExternalLink size={13} />
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeWebsite(index)}
                                    className="btn-remove px-3 py-1.5 flex items-center gap-1.5"
                                >
                                    <Trash2 size={12} strokeWidth={3} />
                                    Remove
                                </button>
                            </div>
                        ))}

                        {basics.websites.length === 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-600 italic py-2">No websites added. Add links to your LinkedIn, Portfolios, or Personal Sites.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
