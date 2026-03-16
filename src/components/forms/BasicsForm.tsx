import { useResumeStore } from '../../store'
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
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

                    <div className="space-y-3">
                        {basics.websites.map((site, index) => (
                            <div key={index} className="flex gap-3 items-end group">
                                <div className="flex-1">
                                    <label className="form-label">Site Name</label>
                                    <input
                                        type="text"
                                        value={site.name}
                                        onChange={(e) => updateWebsite(index, 'name', e.target.value)}
                                        className="form-input"
                                        placeholder="LinkedIn"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="form-label !mb-0">URL</label>
                                        {site.url && (
                                            <a
                                                href={site.url.startsWith('http') ? site.url : `https://${site.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                Open ↗
                                            </a>
                                        )}
                                    </div>
                                    <input
                                        type="url"
                                        value={site.url}
                                        onChange={(e) => updateWebsite(index, 'url', e.target.value)}
                                        className="form-input"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <button
                                    onClick={() => removeWebsite(index)}
                                    className="btn-remove w-9 h-[32px] sm:h-[34px] flex-shrink-0 flex items-center justify-center"
                                    title="Remove Link"
                                >
                                    <Trash2 size={14} strokeWidth={3} />
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
