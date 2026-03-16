import { useResumeStore } from '../../store'
import { useState, useEffect } from 'react';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

export function SkillsForm() {
    const { resumeData, addSkill, updateSkill, removeSkill } = useResumeStore();
    const { skills } = resumeData;
    const [newSkillHtml, setNewSkillHtml] = useState<{ [key: number]: string }>({});
    const checkContent = useProofreadingStore(state => state.checkContent);

    // Monitor skills content
    useEffect(() => {
        const textToContent = skills.map(s => `${s.category}: ${s.items.join(', ')}`).join('. ');
        if (textToContent.trim()) {
            checkContent(textToContent, 'skills-all');
        }
    }, [skills, checkContent]);

    const addSkillItem = (index: number) => {
        const skill = skills[index];
        const rawHtml = newSkillHtml[index]?.trim();

        // Strip outer <p> tags that TipTap wraps content in
        const cleaned = rawHtml
            ?.replace(/^<p>/, '')
            .replace(/<\/p>$/, '')
            .trim();

        if (cleaned && cleaned !== '<br>' && cleaned !== '<br/>') {
            updateSkill(index, { items: [...skill.items, cleaned] });
            setNewSkillHtml({ ...newSkillHtml, [index]: '' });
        }
    };

    const removeSkillItem = (skillIndex: number, itemIndex: number) => {
        const skill = skills[skillIndex];
        updateSkill(skillIndex, {
            items: skill.items.filter((_, i) => i !== itemIndex),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Wrench size={20} className="text-slate-400" />
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Skills</h3>
                </div>
                <button
                    onClick={addSkill}
                    className="btn-add px-3 py-1.5 flex items-center gap-1.5"
                >
                    <Plus size={12} strokeWidth={3} />
                    Add Category
                </button>
            </div>

            {skills.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No skills added yet. Click "Add Skill Category" to get started.
                </p>
            )}

            <div className="space-y-4">
                {skills.map((skill, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px] whitespace-nowrap">Category #{index + 1}</h4>
                            <input
                                type="text"
                                value={skill.category}
                                onChange={(e) => updateSkill(index, { category: e.target.value })}
                                className="form-input flex-1"
                                placeholder="Programming Languages"
                                spellCheck={true}
                            />
                            <button
                                onClick={() => removeSkill(index)}
                                className="btn-remove px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
                            >
                                <Trash2 size={12} strokeWidth={3} />
                                Remove
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Top row: Label + Input + Add Button */}
                            <div className="flex items-center gap-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                    Skills
                                </label>
                                <div className="flex-1 border-2 border-transparent focus-within:border-blue-500/50 transition-colors bg-white dark:bg-slate-950">
                                    <RichTextEditor
                                        value={newSkillHtml[index] || ''}
                                        onChange={(html) =>
                                            setNewSkillHtml({ ...newSkillHtml, [index]: html })
                                        }
                                        singleLine={true}
                                        placeholder="Add a skill..."
                                        onEnter={() => addSkillItem(index)}
                                    />
                                </div>
                                <button
                                    onClick={() => addSkillItem(index)}
                                    className="px-6 h-[32px] sm:h-[34px] btn-add flex items-center gap-2 transition-all active:scale-95 shadow-md flex-shrink-0"
                                >
                                    <Plus size={14} strokeWidth={3} />
                                    ADD
                                </button>
                            </div>

                            {/* Bottom row: Chips */}
                            {skill.items.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {skill.items.map((item, itemIndex) => (
                                        <span
                                            key={itemIndex}
                                            className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm"
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: item }} className="leading-none mt-0.5" />
                                            <button
                                                onClick={() => removeSkillItem(index, itemIndex)}
                                                className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-500 transition-colors"
                                                title="Remove skill"
                                            >
                                                <Trash2 size={12} strokeWidth={3} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
