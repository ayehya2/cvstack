import { Plus } from 'lucide-react';
import { useResumeStore } from '../../store'
import { BulletList } from './BulletList';
import { SmartDateInput } from './SmartDateInput';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react';

export function WorkForm() {
    const { resumeData, addWork, updateWork, removeWork } = useResumeStore();
    const { work } = resumeData;
    const checkContent = useProofreadingStore(state => state.checkContent);

    useEffect(() => {
        const textToContent = work.map(w => `${w.company} ${w.position} ${w.bullets.join('. ')}`).join('. ');
        if (textToContent.trim()) {
            checkContent(textToContent, 'work-all');
        }
    }, [work, checkContent]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 border-2 border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Experience</h3>
                <button
                    onClick={addWork}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                >
                    <Plus size={12} strokeWidth={3} />
                    Add Job
                </button>
            </div>

            {work.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No work experience added yet. Click "Add Job" to get started.
                </p>
            )}

            <div className="space-y-4">
                {work.map((job, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Job #{index + 1}</h4>
                            <button
                                onClick={() => removeWork(index)}
                                className="text-red-400/80 hover:text-red-500 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 transition-all bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 active:scale-95"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={job.company}
                                    onChange={(e) => updateWork(index, { company: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Tech Solutions Inc."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Position</label>
                                <input
                                    type="text"
                                    value={job.position}
                                    onChange={(e) => updateWork(index, { position: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Software Engineer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={job.location}
                                    onChange={(e) => updateWork(index, { location: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="San Francisco, CA"
                                />
                            </div>

                            <div>
                                <SmartDateInput
                                    label="Start Date"
                                    type="month"
                                    value={job.startDate}
                                    onChange={(val) => updateWork(index, { startDate: val })}
                                    placeholder="Jan 2020"
                                />
                            </div>

                            <div>
                                <SmartDateInput
                                    label="End Date"
                                    type="month"
                                    value={job.endDate}
                                    onChange={(val) => updateWork(index, { endDate: val })}
                                    placeholder="Present"
                                    showPresent={true}
                                    showPresentToggle={true}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Responsibilities & Achievements</label>
                                <button
                                    onClick={() => updateWork(index, { bullets: [...job.bullets, ''] })}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                                    type="button"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                    Add Point
                                </button>
                            </div>
                            <BulletList
                                bullets={job.bullets}
                                onChange={(bullets) => updateWork(index, { bullets })}
                                placeholder="Led team of 5 developers"
                                showAddButton={false}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
