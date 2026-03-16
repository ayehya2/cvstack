import { useResumeStore } from '../../store'
import { SmartDateInput } from './SmartDateInput';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
                    className="btn-add px-3 py-1.5 flex items-center gap-1.5 text-[10px]"
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
                                className="btn-remove px-3 py-1.5 flex items-center gap-1.5 text-[10px]"
                            >
                                <Trash2 size={12} strokeWidth={3} />
                                Remove
                            </button>
                        </div>

                        <div className="flex gap-3 sm:gap-4">
                            <div className="flex-[2] min-w-0">
                                <label className="form-label">Award Title</label>
                                <input
                                    type="text"
                                    value={award.title}
                                    onChange={(e) => updateAward(index, { title: e.target.value })}
                                    className="form-input"
                                    placeholder="Employee of the Year"
                                />
                            </div>

                            <div className="flex-[2] min-w-0">
                                <label className="form-label">Issuer / Awarder</label>
                                <input
                                    type="text"
                                    value={award.awarder}
                                    onChange={(e) => updateAward(index, { awarder: e.target.value })}
                                    className="form-input"
                                    placeholder="TechVision Inc."
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <SmartDateInput
                                    label="Date"
                                    type="month"
                                    value={award.date}
                                    onChange={(val) => updateAward(index, { date: val })}
                                    placeholder="Dec 2022"
                                />
                            </div>
                        </div>

                        <div className="pt-1">
                            <label className="form-label">Summary (optional)</label>
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
