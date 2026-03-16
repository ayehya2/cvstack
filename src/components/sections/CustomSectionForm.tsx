import { useResumeStore } from '../../store';
import { useModal } from '../common/ThemedModal';
import { useProofreadingStore } from '../../lib/stores/proofreadingStore';
import { BulletList } from '../common/BulletList';
import { useEffect } from 'react';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import type { CustomSection, CustomSectionEntry } from '../../types';
import { SmartDateInput } from '../common/SmartDateInput';
import { RichTextEditor } from '../common/RichTextEditor';

interface CustomSectionFormProps {
    sectionId?: string;
}

export function CustomSectionForm({ sectionId }: CustomSectionFormProps) {
    const {
        resumeData,
        updateCustomSection,
        removeCustomSection,
        addCustomSectionItem,
        updateCustomSectionItem,
        removeCustomSectionItem
    } = useResumeStore();
    const modal = useModal();
    const checkContent = useProofreadingStore(state => state.checkContent);

    // Find the sections to render
    const sectionsToRender = sectionId
        ? resumeData.customSections.filter((s: CustomSection) => s.id === sectionId)
        : resumeData.customSections;

    // Check all text-based custom sections
    useEffect(() => {
        const textContent = sectionsToRender
            .filter(s => s.type === 'text')
            .flatMap(s => s.items.flatMap(i => i.bullets))
            .join(' ');

        if (textContent.trim()) {
            checkContent(textContent, 'custom-sections-text');
        }
    }, [sectionsToRender, checkContent]);

    if (sectionsToRender.length === 0 && sectionId) {
        return <div className="p-8 text-center text-slate-500 italic">Section not found</div>;
    }

    const handleTitleChange = (id: string, title: string) => {
        updateCustomSection(id, { title });
    };

    const handleTypeChange = (id: string, type: 'bullets' | 'text') => {
        updateCustomSection(id, { type });
    };

    const handleRemoveSection = async (id: string) => {
        if (await modal.confirm('Remove Section', 'Are you sure you want to remove this entire custom section?', { destructive: true })) {
            removeCustomSection(id);
        }
    };

    return (
        <div className="space-y-6">
            {sectionsToRender.map((section: CustomSection) => (
                <div key={section.id} className="space-y-6">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleTitleChange(section.id, e.target.value)}
                                className="form-input font-black text-lg sm:text-xl h-[34px] sm:h-[36px]"
                                placeholder="Section Title"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 p-0.5 h-[34px] sm:h-[36px]">
                                <button
                                    onClick={() => handleTypeChange(section.id, 'bullets')}
                                    className={`px-3 sm:px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all rounded-none ${section.type === 'bullets' ? 'btn-accent shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                >
                                    Bullets
                                </button>
                                <button
                                    onClick={() => handleTypeChange(section.id, 'text')}
                                    className={`px-3 sm:px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all rounded-none ${section.type === 'text' ? 'btn-accent shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                >
                                    Paragraph
                                </button>
                            </div>
                            <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="btn-remove px-3 py-1 flex items-center gap-1.5 h-[34px] sm:h-[36px]"
                                title="Delete Entire Section"
                            >
                                <Trash2 size={16} strokeWidth={3} />
                                <span className="hidden sm:inline">Remove Section</span>
                                <span className="sm:hidden text-[8px]">Del</span>
                            </button>
                        </div>
                    </div>

                    {/* Entries Container */}
                    <div className="space-y-4">
                        {section.items.map((item: CustomSectionEntry, index: number) => (
                            <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 relative group">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                                    <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Entry #{index + 1}</h4>
                                    <button
                                        onClick={() => removeCustomSectionItem(section.id, index)}
                                        className="btn-remove px-3 py-1.5 flex items-center gap-1.5"
                                        title="Remove Entry"
                                    >
                                        <Trash2 size={12} strokeWidth={3} />
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="form-label">Primary Heading</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { title: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g., Google Cloud Architect certificate"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Sub-heading</label>
                                        <input
                                            type="text"
                                            value={item.subtitle}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { subtitle: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g., Google Training"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                    <div>
                                        <SmartDateInput
                                            label="Date"
                                            type="month"
                                            value={item.date}
                                            onChange={(val) => updateCustomSectionItem(section.id, index, { date: val })}
                                            placeholder="Jan 2024"
                                            showPresent={true}
                                            showPresentToggle={true}
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            value={item.location}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { location: e.target.value })}
                                            className="form-input"
                                            placeholder="Remote / Sydney, AU"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="form-label">Link</label>
                                            {item.link && (
                                                <a
                                                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-[10px] font-bold"
                                                >
                                                    <ExternalLink size={10} />
                                                    Visit
                                                </a>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={item.link}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { link: e.target.value })}
                                            className="form-input"
                                            placeholder="https://verify.link/..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Content Details</label>
                                        {section.type === 'bullets' && (
                                            <button
                                                onClick={() => updateCustomSectionItem(section.id, index, { bullets: [...item.bullets, ''] })}
                                                className="btn-add px-3 py-1.5 flex items-center gap-1.5"
                                                type="button"
                                            >
                                                <Plus size={12} strokeWidth={3} />
                                                Add Point
                                            </button>
                                        )}
                                    </div>
                                    {section.type === 'bullets' ? (
                                        <BulletList
                                            bullets={item.bullets}
                                            onChange={(bullets) => updateCustomSectionItem(section.id, index, { bullets })}
                                            showAddButton={false}
                                        />
                                    ) : (
                                        <RichTextEditor
                                            value={item.bullets[0] || ''}
                                            onChange={(html) => updateCustomSectionItem(section.id, index, { bullets: [html] })}
                                            placeholder="Describe your achievements..."
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => addCustomSectionItem(section.id)}
                            className="w-full py-3 btn-add flex items-center justify-center gap-2 h-[46px]"
                        >
                            <Plus size={16} strokeWidth={3} />
                            <span>Add New Entry to {section.title}</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
