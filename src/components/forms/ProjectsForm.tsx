import { Plus, Trash2, FolderKanban } from 'lucide-react';
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <FolderKanban size={20} className="text-slate-400" />
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Projects</h3>
                </div>
                <button
                    onClick={addProject}
                    className="btn-add px-3 py-1.5 flex items-center gap-1.5"
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
                                className="btn-remove px-3 py-1.5 flex items-center gap-1.5"
                            >
                                <Trash2 size={12} strokeWidth={3} />
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="form-label">Project Name</label>
                                <input
                                    type="text"
                                    value={project.name}
                                    onChange={(e) => updateProject(index, { name: e.target.value })}
                                    className="form-input"
                                    placeholder="E-Commerce Platform"
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="form-label">URL Name</label>
                                    <input
                                        type="text"
                                        value={project.urlName}
                                        onChange={(e) => updateProject(index, { urlName: e.target.value })}
                                        className="form-input"
                                        placeholder="GitHub"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="form-label">Project URL</label>
                                    <input
                                        type="url"
                                        value={project.url}
                                        onChange={(e) => updateProject(index, { url: e.target.value })}
                                        className="form-input"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 sm:gap-4">
                            <div style={{ width: '20%', minWidth: 0 }}>
                                <SmartDateInput
                                    label="Start Date"
                                    type="month"
                                    value={project.startDate || ''}
                                    onChange={(val) => updateProject(index, { startDate: val })}
                                    placeholder="Jan 2023"
                                />
                            </div>

                            <div style={{ width: '20%', minWidth: 0 }}>
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

                            <div style={{ width: '60%', minWidth: 0 }}>
                                <label className="form-label">Technologies (comma separated)</label>
                                <input
                                    type="text"
                                    value={project.keywords.join(', ')}
                                    onChange={(e) => updateProject(index, { keywords: e.target.value.split(',').map(s => s.trim()) })}
                                    className="form-input"
                                    placeholder="React, Node.js, Stripe, AWS"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Description & Key Features</label>
                                <button
                                    onClick={() => updateProject(index, { bullets: [...project.bullets, ''] })}
                                    className="btn-add px-3 py-1.5 flex items-center gap-1.5"
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
