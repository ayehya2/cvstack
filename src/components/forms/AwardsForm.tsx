import { useResumeStore } from '../../store'
import { SmartDateInput } from './SmartDateInput';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

export function AwardsForm() {
    const { resumeData, addAward, updateAward, removeAward } = useResumeStore();
    const { awards } = resumeData;
    const checkContent = useProofreadingStore(state => state.checkContent);

    useEffect(() => {
        const textToContent = awards.map(a => `${a.title} ${a.awarder} ${a.summary}`).join('. ');
        if (textToContent.trim()) {
            checkContent(textToContent, 'awards-all');
        }
    }, [awards, checkContent]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 border-2 border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Awards</h3>
                <button
                    onClick={addAward}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                >
                    <Plus size={12} strokeWidth={3} />
                    Add Award
                </button>
            </div>

            {awards.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No awards added yet. Click "Add Award" to get started.
                </p>
            )}

            <div className="space-y-4">
                {awards.map((award, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Award #{index + 1}</h4>
                            <button
                                onClick={() => removeAward(index)}
                                className="text-red-400/80 hover:text-red-500 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 transition-all bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 active:scale-95"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Award Title</label>
                                <input
                                    type="text"
                                    value={award.title}
                                    onChange={(e) => updateAward(index, { title: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Employee of the Year"
                                />
                            </div>

                            <div>
                                <SmartDateInput
                                    label="Date"
                                    type="month"
                                    value={award.date}
                                    onChange={(val) => updateAward(index, { date: val })}
                                    placeholder="Dec 2022"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Issuer / Awarder</label>
                            <input
                                type="text"
                                value={award.awarder}
                                onChange={(e) => updateAward(index, { awarder: e.target.value })}
                                className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="TechVision Inc."
                            />
                        </div>

                        <div className="pt-1">
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Summary (optional)</label>
                            <RichTextEditor
                                value={award.summary || ''}
                                onChange={(html) => updateAward(index, { summary: html })}
                                placeholder="Recognized for outstanding leadership and mentorship..."
                                singleLine
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
