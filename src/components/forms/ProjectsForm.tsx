import { Plus } from 'lucide-react';
import { useResumeStore } from '../../store'
import { BulletList } from './BulletList';
import { SmartDateInput } from './SmartDateInput';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react';

export function ProjectsForm() {
    const { resumeData, addProject, updateProject, removeProject } = useResumeStore();
    const { projects } = resumeData;
    const checkContent = useProofreadingStore(state => state.checkContent);

    useEffect(() => {
        const textToContent = projects.map(p => `${p.name} ${p.bullets.join('. ')}`).join('. ');
        if (textToContent.trim()) {
            checkContent(textToContent, 'projects-all');
        }
    }, [projects, checkContent]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 border-2 border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Projects</h3>
                <button
                    onClick={addProject}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                >
                    <Plus size={12} strokeWidth={3} />
                    Add Project
                </button>
            </div>

            {projects.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No projects added yet. Click "Add Project" to get started.
                </p>
            )}

            <div className="space-y-4">
                {projects.map((project, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Project #{index + 1}</h4>
                            <button
                                onClick={() => removeProject(index)}
                                className="text-red-400/80 hover:text-red-500 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 transition-all bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 active:scale-95"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={project.name}
                                    onChange={(e) => updateProject(index, { name: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="E-Commerce Platform"
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">URL Name</label>
                                    <input
                                        type="text"
                                        value={project.urlName}
                                        onChange={(e) => updateProject(index, { urlName: e.target.value })}
                                        className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="GitHub"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Project URL</label>
                                    <input
                                        type="url"
                                        value={project.url}
                                        onChange={(e) => updateProject(index, { url: e.target.value })}
                                        className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <SmartDateInput
                                    label="Start Date"
                                    type="month"
                                    value={project.startDate || ''}
                                    onChange={(val) => updateProject(index, { startDate: val })}
                                    placeholder="Jan 2023"
                                />
                            </div>

                            <div>
                                <SmartDateInput
                                    label="End Date"
                                    type="month"
                                    value={project.endDate || ''}
                                    onChange={(val) => updateProject(index, { endDate: val })}
                                    placeholder="Present"
                                    showPresent={true}
                                    showPresentToggle={true}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Technologies (comma separated)</label>
                            <input
                                type="text"
                                value={project.keywords.join(', ')}
                                onChange={(e) => updateProject(index, { keywords: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="React, Node.js, Stripe, AWS"
                            />
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Description & Key Features</label>
                                <button
                                    onClick={() => updateProject(index, { bullets: [...project.bullets, ''] })}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                                    type="button"
                                >
                                    <Plus size={12} strokeWidth={3} />
                                    Add Point
                                </button>
                            </div>
                            <BulletList
                                bullets={project.bullets}
                                onChange={(bullets) => updateProject(index, { bullets })}
                                placeholder="Built full-stack e-commerce platform"
                                showAddButton={false}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
