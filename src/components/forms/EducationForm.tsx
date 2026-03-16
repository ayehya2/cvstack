import { Plus, Trash2, Users, BookOpen, Award, GraduationCap } from 'lucide-react';
import { useResumeStore } from '../../store'
import { SmartDateInput } from './SmartDateInput';
import { useProofreadingStore } from '../../lib/proofreadingStore';
import { useEffect } from 'react';

export function EducationForm() {
    const { resumeData, addEducation, updateEducation, removeEducation } = useResumeStore();
    const { education } = resumeData;
    const checkContent = useProofreadingStore(state => state.checkContent);

    useEffect(() => {
        const textToContent = education.map(e => `${e.institution} ${e.degree} ${e.field}`).join('. ');
        if (textToContent.trim()) {
            checkContent(textToContent, 'education-all');
        }
    }, [education, checkContent]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <GraduationCap size={20} className="text-slate-400" />
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Education</h3>
                </div>
                <button
                    onClick={addEducation}
                    className="btn-add px-3 py-1.5 flex items-center gap-1.5"
                >
                    <Plus size={12} strokeWidth={3} />
                    Add Edu
                </button>
            </div>

            {education.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No education added yet. Click "Add Education" to get started.
                </p>
            )}

            <div className="space-y-4">
                {education.map((edu, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Education #{index + 1}</h4>
                            <button
                                onClick={() => removeEducation(index)}
                                className="btn-remove px-3 py-1.5 flex items-center gap-1.5"
                            >
                                <Trash2 size={12} strokeWidth={3} />
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="form-label">Institution</label>
                                <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                    className="form-input"
                                    placeholder="University of Technology"
                                />
                            </div>

                            <div>
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => updateEducation(index, { location: e.target.value })}
                                    className="form-input"
                                    placeholder="Boston, MA"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="form-label">Degree</label>
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                    className="form-input"
                                    placeholder="Bachelor of Science"
                                />
                            </div>

                            <div>
                                <label className="form-label">Field of Study</label>
                                <input
                                    type="text"
                                    value={edu.field}
                                    onChange={(e) => updateEducation(index, { field: e.target.value })}
                                    className="form-input"
                                    placeholder="Computer Science"
                                />
                            </div>

                            <div>
                                <SmartDateInput
                                    label="Graduation Date"
                                    type="month"
                                    value={edu.graduationDate}
                                    onChange={(val) => updateEducation(index, { graduationDate: val })}
                                    placeholder="May 2017"
                                    showPresent={true}
                                    showPresentToggle={true}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="form-label">GPA (optional)</label>
                                <input
                                    type="text"
                                    value={edu.gpa || ''}
                                    onChange={(e) => updateEducation(index, { gpa: e.target.value })}
                                    className="form-input"
                                    placeholder="3.8/4.0"
                                />
                            </div>
                            <div>
                                <label className="form-label">Thesis (optional)</label>
                                <input
                                    type="text"
                                    value={edu.thesis || ''}
                                    onChange={(e) => updateEducation(index, { thesis: e.target.value })}
                                    className="form-input"
                                    placeholder="Title of your thesis"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <Users size={12} />
                                    Clubs & Organizations
                                </label>
                                <button
                                    onClick={() => {
                                        const newClubs = [...(edu.clubs || []), { name: '', role: '', location: '', startDate: '', endDate: '', bullets: [''] }];
                                        updateEducation(index, { clubs: newClubs });
                                    }}
                                    className="btn-add px-3 py-1.5 flex items-center gap-1.5"
                                >
                                    <Plus size={10} strokeWidth={3} /> Add Club
                                </button>
                            </div>
                            <div className="space-y-4">
                                {edu.clubs?.map((club, cIdx) => (
                                    <div key={cIdx} className="p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 relative group shadow-sm">
                                        <button
                                            onClick={() => {
                                                const newClubs = edu.clubs?.filter((_, i) => i !== cIdx);
                                                updateEducation(index, { clubs: newClubs });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 btn-remove !bg-transparent !border-none !shadow-none opacity-40 hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="form-label">Organization Name</label>
                                                <input
                                                    type="text"
                                                    value={club.name}
                                                    onChange={(e) => {
                                                        const newClubs = [...(edu.clubs || [])];
                                                        newClubs[cIdx] = { ...club, name: e.target.value };
                                                        updateEducation(index, { clubs: newClubs });
                                                    }}
                                                    placeholder="e.g. Robotics Club"
                                                    className="form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">Role / Title</label>
                                                <input
                                                    type="text"
                                                    value={club.role}
                                                    onChange={(e) => {
                                                        const newClubs = [...(edu.clubs || [])];
                                                        newClubs[cIdx] = { ...club, role: e.target.value };
                                                        updateEducation(index, { clubs: newClubs });
                                                    }}
                                                    placeholder="e.g. President"
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Description / Achievement</label>
                                            <textarea
                                                value={club.bullets?.[0] || ''}
                                                onChange={(e) => {
                                                    const newClubs = [...(edu.clubs || [])];
                                                    newClubs[cIdx] = { ...club, bullets: [e.target.value] };
                                                    updateEducation(index, { clubs: newClubs });
                                                }}
                                                placeholder="What did you do there?"
                                                className="w-full px-3 py-1.5 border-2 border-slate-200 dark:border-slate-700 focus:border-slate-400 outline-none bg-slate-50/50 dark:bg-slate-900/30 text-[11px] resize-none"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Relevant Coursework Subsection */}
                        <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <BookOpen size={12} />
                                    Relevant Coursework
                                </label>
                            </div>
                            <textarea
                                value={edu.courses?.join(', ') || ''}
                                onChange={(e) => {
                                    const courses = e.target.value.split(',').map(c => c.trim()).filter(c => c !== '');
                                    updateEducation(index, { courses });
                                }}
                                placeholder="Algorithms, Data Structures, Operating Systems..."
                                className="w-full px-3 py-2 text-[11px] border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 focus:border-slate-500 outline-none min-h-[80px] font-medium"
                            />
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 italic font-medium">Enter courses separated by commas</p>
                        </div>

                        {/* Activities & Honors Subsection */}
                        <div className="pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    <Award size={12} />
                                    Activities & Honors
                                </label>
                                <button
                                    onClick={() => {
                                        const newActs = [...(edu.activities || []), { title: 'Honors & Awards', items: [''] }];
                                        updateEducation(index, { activities: newActs });
                                    }}
                                    className="btn-add px-3 py-1.5 flex items-center gap-1.5"
                                    style={{ color: '#d97706', backgroundColor: '#fff7ed', borderColor: '#ffedd5' } as React.CSSProperties}
                                >
                                    <Plus size={10} strokeWidth={3} /> Add Section
                                </button>
                            </div>
                            <div className="space-y-4">
                                {edu.activities?.map((section, sIdx) => (
                                    <div key={sIdx} className="p-4 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 relative shadow-sm">
                                        <button
                                            onClick={() => {
                                                const newActs = edu.activities?.filter((_, i) => i !== sIdx);
                                                updateEducation(index, { activities: newActs });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 btn-remove !bg-transparent !border-none !shadow-none opacity-40 hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="mb-3">
                                            <label className="form-label">Section Title</label>
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newActs = [...(edu.activities || [])];
                                                    newActs[sIdx] = { ...section, title: e.target.value };
                                                    updateEducation(index, { activities: newActs });
                                                }}
                                                placeholder="e.g. Honors & Awards"
                                                className="form-input w-full md:w-1/2 font-black uppercase tracking-tight"
                                            />
                                        </div>
                                        <div className="space-y-2 mt-4 ml-2 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                                            {section.items.map((item, iIdx) => (
                                                <div key={iIdx} className="flex items-center gap-3 group/item">
                                                    <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 transition-colors group-focus-within/item:bg-blue-500" />
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newActs = [...(edu.activities || [])];
                                                            const newItems = [...section.items];
                                                            newItems[iIdx] = e.target.value;
                                                            newActs[sIdx] = { ...section, items: newItems };
                                                            updateEducation(index, { activities: newActs });
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                const newActs = [...(edu.activities || [])];
                                                                const newItems = [...section.items];
                                                                newItems.splice(iIdx + 1, 0, '');
                                                                newActs[sIdx] = { ...section, items: newItems };
                                                                updateEducation(index, { activities: newActs });
                                                            } else if (e.key === 'Backspace' && item === '' && section.items.length > 1) {
                                                                const newActs = [...(edu.activities || [])];
                                                                const newItems = section.items.filter((_, i) => i !== iIdx);
                                                                newActs[sIdx] = { ...section, items: newItems };
                                                                updateEducation(index, { activities: newActs });
                                                            }
                                                        }}
                                                        placeholder="Add an item... (Enter for new, Backspace to delete)"
                                                        className="flex-1 text-[11px] bg-transparent outline-none py-1 border-b-2 border-transparent focus:border-slate-200 dark:focus:border-slate-700 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
