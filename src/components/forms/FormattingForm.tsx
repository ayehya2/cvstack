import { useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useResumeStore } from '../../store'
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { isCustomTemplate } from '../../lib/templateResolver';
import type { FormattingOptions, ColorTheme, SectionDivider, Alignment, FontFamily, NameSize, Spacing, BulletStyle, SectionTitleSize, BulletIndent, HeaderLineStyle, DateFormat, SubHeaderWeight, SkillLayout, CompanyTitleOrder, BodyTextWeight, ItalicStyle, DateSeparator, AccentColorPosition } from '../../types';

interface FormattingFormProps {
    data?: FormattingOptions;
    update?: (formatting: Partial<FormattingOptions>) => void;
    reset?: () => void;
    title?: string;
    description?: string;
}

export function FormattingForm({
    data: propsData,
    update: propsUpdate,
    reset: propsReset,
    title = "Formatting",
    description = "Deep customization for professional-grade documents. Changes apply to all templates."
}: FormattingFormProps) {
    const { resumeData, updateFormatting: storeUpdate, resetFormatting: storeReset } = useResumeStore();

    // Choose between props (CV mode) and store (Resume mode)
    const formatting = propsData || resumeData.formatting;
    const updateFormatting = propsUpdate || storeUpdate;
    const resetFormatting = propsReset || storeReset;

    const { customTemplates, updateCustomTemplate } = useCustomTemplateStore();

    // Find active custom template (if any)
    const activeCustomTemplate = isCustomTemplate(resumeData.selectedTemplate)
        ? customTemplates.find(t => t.id === resumeData.selectedTemplate)
        : undefined;

    // Auto-save formatting changes to custom template
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (activeCustomTemplate) {
            updateCustomTemplate(activeCustomTemplate.id, { formatting: { ...formatting } });
        }
    }, [formatting, activeCustomTemplate, updateCustomTemplate]);

    return (
        <div className="space-y-6">
            {/* Custom template banner */}
            {activeCustomTemplate && (
                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border-2 border-white/10 rounded-none shadow-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Layout Engine</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" />
                    <div className="text-sm font-bold text-blue-800 dark:text-blue-300">
                        Editing: {activeCustomTemplate.name}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                        Changes auto-save to this custom template
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                    <SlidersHorizontal size={20} className="text-slate-400" />
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">{title}</h3>
                </div>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 1: Typography */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Typography & Case
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Font Family</label>
                            <select
                                value={formatting?.fontFamily || 'default'}
                                onChange={(e) => updateFormatting({ fontFamily: e.target.value as FontFamily })}
                                className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                            >
                                <option value="default">Default (Times New Roman)</option>
                                <option value="times">Times New Roman</option>
                                <option value="arial">Arial</option>
                                <option value="calibri">Calibri</option>
                                <option value="georgia">Georgia</option>
                                <option value="helvetica">Helvetica</option>
                                <option value="palatino">Palatino</option>
                                <option value="garamond">Garamond</option>
                                <option value="cambria">Cambria</option>
                                <option value="bookAntiqua">Book Antiqua</option>
                                <option value="centurySchoolbook">Century Schoolbook</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Base Size</label>
                                <select
                                    value={formatting?.baseFontSize || '11pt'}
                                    onChange={(e) => updateFormatting({ baseFontSize: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="9pt">9pt — Compact</option>
                                    <option value="9.5pt">9.5pt</option>
                                    <option value="10pt">10pt — Small</option>
                                    <option value="10.5pt">10.5pt</option>
                                    <option value="11pt">11pt — Standard</option>
                                    <option value="11.5pt">11.5pt</option>
                                    <option value="12pt">12pt — Large</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Name Size</label>
                                <select
                                    value={formatting?.nameSize || 'large'}
                                    onChange={(e) => updateFormatting({ nameSize: e.target.value as NameSize })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="huge">Huge (24pt)</option>
                                    <option value="large">Large (20pt)</option>
                                    <option value="large2">Medium (18pt)</option>
                                    <option value="normal">Normal (16pt)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name Weight</label>
                                <select
                                    value={formatting?.fontWeightName || 'BOLD'}
                                    onChange={(e) => updateFormatting({ fontWeightName: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="LIGHT">Light</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="BOLD">Bold</option>
                                    <option value="HEAVY">Heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title Size</label>
                                <select
                                    value={formatting?.sectionTitleSize || 'normal'}
                                    onChange={(e) => updateFormatting({ sectionTitleSize: e.target.value as SectionTitleSize })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="large">Large (16pt)</option>
                                    <option value="normal">Normal (14pt)</option>
                                    <option value="small">Small (12pt)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Case</label>
                                <select
                                    value={formatting?.sectionHeaderStyle || 'uppercase'}
                                    onChange={(e) => updateFormatting({ sectionHeaderStyle: e.target.value as 'uppercase' | 'capitalize' | 'normal' })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="uppercase">ALL CAPS</option>
                                    <option value="capitalize">Capitalize Case</option>
                                    <option value="normal">Normal Case</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title Weight</label>
                                <select
                                    value={formatting?.fontWeightSectionTitle || 'BOLD'}
                                    onChange={(e) => updateFormatting({ fontWeightSectionTitle: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="NORMAL">Normal</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="BOLD">Bold</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.sectionTitleUnderline}
                                    onChange={(e) => updateFormatting({ sectionTitleUnderline: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600 rounded-none"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Underline Titles</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Body Text Weight</label>
                                <select
                                    value={formatting?.bodyTextWeight || 'normal'}
                                    onChange={(e) => updateFormatting({ bodyTextWeight: e.target.value as BodyTextWeight })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="light">Light</option>
                                    <option value="normal">Normal</option>
                                    <option value="medium">Medium</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Italic Style</label>
                                <select
                                    value={formatting?.italicStyle || 'normal'}
                                    onChange={(e) => updateFormatting({ italicStyle: e.target.value as ItalicStyle })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="normal">Normal (default)</option>
                                    <option value="italic">Italic</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Layout & Spacing */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Layout & Spacing
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Page Size</label>
                                <select
                                    value={formatting?.pageFormat || 'Letter'}
                                    onChange={(e) => updateFormatting({ pageFormat: e.target.value as 'Letter' | 'A4' })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="Letter">Letter (US)</option>
                                    <option value="A4">A4 (ISO)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Line Height</label>
                                <select
                                    value={formatting?.lineSpacing || '1.2'}
                                    onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="1.0">1.0 Tight</option>
                                    <option value="1.15">1.15</option>
                                    <option value="1.2">1.2 Regular</option>
                                    <option value="1.3">1.3</option>
                                    <option value="1.4">1.4</option>
                                    <option value="1.5">1.5 Loose</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Section Gap</label>
                                <select
                                    value={formatting?.sectionSpacing || 'normal'}
                                    onChange={(e) => updateFormatting({ sectionSpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="tight">Tight (4pt)</option>
                                    <option value="normal">Normal (6pt)</option>
                                    <option value="relaxed">Relaxed (10pt)</option>
                                    <option value="spacious">Spacious (16pt)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Entry Gap</label>
                                <select
                                    value={formatting?.entrySpacing || 'normal'}
                                    onChange={(e) => updateFormatting({ entrySpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                    <option value="spacious">Spacious</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Margins (inches)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { key: 'marginTop', label: 'T' },
                                    { key: 'marginBottom', label: 'B' },
                                    { key: 'marginLeft', label: 'L' },
                                    { key: 'marginRight', label: 'R' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <input
                                            type="number"
                                            min="0.25"
                                            max="2"
                                            step="0.05"
                                            value={String(formatting?.[key as keyof typeof formatting] || '0.6')}
                                            onChange={(e) => updateFormatting({ [key]: e.target.value })}
                                            className="w-full px-2 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-center text-[10px] sm:text-xs"
                                            title={label}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Paragraph Spacing</label>
                                <select
                                    value={formatting?.paragraphSpacing || 'normal'}
                                    onChange={(e) => updateFormatting({ paragraphSpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                    <option value="spacious">Spacious</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title Spacing</label>
                                <select
                                    value={formatting?.sectionTitleSpacing || 'normal'}
                                    onChange={(e) => updateFormatting({ sectionTitleSpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                    <option value="spacious">Spacious</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Bullets & Icons */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Bullets & Icons
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Bullet Style</label>
                                <select
                                    value={formatting?.bulletStyle || 'bullet'}
                                    onChange={(e) => updateFormatting({ bulletStyle: e.target.value as BulletStyle })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="bullet">• Bullet</option>
                                    <option value="dash">- Dash</option>
                                    <option value="arrow">→ Arrow</option>
                                    <option value="circle">○ Circle</option>
                                    <option value="square">■ Square</option>
                                    <option value="diamond">◆ Diamond</option>
                                    <option value="star">★ Star</option>
                                    <option value="chevron">› Chevron</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Bullet Gap</label>
                                <select
                                    value={formatting?.bulletGap || '4pt'}
                                    onChange={(e) => updateFormatting({ bulletGap: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="2pt">Tight (2pt)</option>
                                    <option value="4pt">Normal (4pt)</option>
                                    <option value="8pt">Spacious (8pt)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Bullet Indent</label>
                                <select
                                    value={formatting?.bulletIndent || 'none'}
                                    onChange={(e) => updateFormatting({ bulletIndent: e.target.value as BulletIndent })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="none">None</option>
                                    <option value="small">Small (0.2in)</option>
                                    <option value="medium">Medium (0.4in)</option>
                                    <option value="large">Large (0.6in)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Bullet Spacing</label>
                                <select
                                    value={formatting?.bulletSpacing || 'normal'}
                                    onChange={(e) => updateFormatting({ bulletSpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                    <option value="spacious">Spacious</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Social Icons</label>
                                <select
                                    value={formatting?.socialIconStyle || 'none'}
                                    onChange={(e) => updateFormatting({ socialIconStyle: e.target.value as 'circle' | 'square' | 'none' })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="none">Text Only</option>
                                    <option value="square">Square Icons</option>
                                    <option value="circle">Circle Icons</option>
                                </select>
                            </div>
                            <div />
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.showIcons}
                                    onChange={(e) => updateFormatting({ showIcons: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Contact Icons</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section 4: Decorative & Style */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Decorative & Style
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Section Divider</label>
                                <select
                                    value={formatting?.sectionDividers || 'none'}
                                    onChange={(e) => updateFormatting({ sectionDividers: e.target.value as SectionDivider })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="none">None</option>
                                    <option value="line">Thin Line</option>
                                    <option value="thick">Thick Line</option>
                                    <option value="double">Double Line</option>
                                    <option value="dotted">Dotted</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Separator Char</label>
                                <select
                                    value={formatting?.separator || '•'}
                                    onChange={(e) => updateFormatting({ separator: e.target.value as '•' | '|' | '·' | '—' })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="•">Bullet</option>
                                    <option value="|">Pipe</option>
                                    <option value="·">Dot</option>
                                    <option value="—">Dash</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Header Align</label>
                                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-950">
                                    {(['left', 'center', 'right'] as Alignment[]).map((align) => (
                                        <button
                                            key={align}
                                            onClick={() => updateFormatting({ headerAlignment: align })}
                                            className={`flex-1 py-1 px-2 text-[10px] sm:text-sm font-black uppercase tracking-widest transition-all ${formatting?.headerAlignment === align
                                                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            {align.charAt(0).toUpperCase() + align.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Header Line</label>
                                <select
                                    value={formatting?.headerLineStyle || 'none'}
                                    onChange={(e) => updateFormatting({ headerLineStyle: e.target.value as HeaderLineStyle })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="none">None</option>
                                    <option value="thin">Thin</option>
                                    <option value="medium">Medium</option>
                                    <option value="thick">Thick</option>
                                    <option value="double">Double</option>
                                    <option value="dotted">Dotted</option>
                                    <option value="dashed">Dashed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Color Theme</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {([
                                    { theme: 'black' as ColorTheme, color: '#000000' },
                                    { theme: 'navy' as ColorTheme, color: '#001f3f' },
                                    { theme: 'darkblue' as ColorTheme, color: '#0074D9' },
                                    { theme: 'darkgreen' as ColorTheme, color: '#2ECC40' },
                                    { theme: 'maroon' as ColorTheme, color: '#85144B' },
                                    { theme: 'purple' as ColorTheme, color: '#B10DC9' },
                                    { theme: 'teal' as ColorTheme, color: '#0D9488' },
                                    { theme: 'slate' as ColorTheme, color: '#475569' },
                                    { theme: 'burgundy' as ColorTheme, color: '#6B1D38' },
                                    { theme: 'forest' as ColorTheme, color: '#166534' },
                                    { theme: 'charcoal' as ColorTheme, color: '#333333' },
                                    { theme: 'steelblue' as ColorTheme, color: '#4682B4' },
                                    { theme: 'indigo' as ColorTheme, color: '#4B0082' },
                                    { theme: 'coral' as ColorTheme, color: '#FF6347' },
                                    { theme: 'olive' as ColorTheme, color: '#556B2F' },
                                ]).map(({ theme, color }) => (
                                    <button
                                        key={theme}
                                        onClick={() => updateFormatting({ colorTheme: theme })}
                                        className={`flex flex-col items-center p-2 border-2 transition-all group ${formatting?.colorTheme === theme
                                            ? 'border-slate-800 bg-slate-100 dark:bg-slate-800'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="w-full h-3 mb-1 shadow-inner" style={{ backgroundColor: color }} />
                                        <span className={`text-[9px] font-semibold uppercase tracking-widest ${formatting?.colorTheme === theme ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {theme}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {/* Custom Color Picker */}
                            <div className="mt-3 flex items-center gap-3">
                                <button
                                    onClick={() => updateFormatting({ colorTheme: 'custom' as ColorTheme })}
                                    className={`flex items-center gap-2 px-3 py-1.5 sm:py-2 border-2 transition-all text-[10px] sm:text-sm font-black uppercase tracking-widest ${formatting?.colorTheme === 'custom'
                                        ? 'border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                                        }`}
                                >
                                    Custom
                                </button>
                                {formatting?.colorTheme === 'custom' && (
                                    <input
                                        type="color"
                                        value={formatting?.customColor || '#000000'}
                                        onChange={(e) => updateFormatting({ customColor: e.target.value })}
                                        className="w-10 h-10 border-2 border-slate-300 dark:border-slate-600 cursor-pointer bg-transparent rounded-none"
                                        title="Pick custom accent color"
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Accent Position</label>
                            <select
                                value={formatting?.accentColorPosition || 'headers-only'}
                                onChange={(e) => updateFormatting({ accentColorPosition: e.target.value as AccentColorPosition })}
                                className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                            >
                                <option value="headers-only">Headers Only</option>
                                <option value="headers-and-links">Headers & Links</option>
                                <option value="all-accents">All Accents</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section 5: Content Controls */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Content Controls
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Date Format</label>
                                <select
                                    value={formatting?.dateFormat || 'short'}
                                    onChange={(e) => updateFormatting({ dateFormat: e.target.value as DateFormat })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="short">Short (Jan 2024)</option>
                                    <option value="long">Long (January 2024)</option>
                                    <option value="numeric">Numeric (01/2024)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">SubHeader Wt.</label>
                                <select
                                    value={formatting?.subHeaderWeight || 'normal'}
                                    onChange={(e) => updateFormatting({ subHeaderWeight: e.target.value as SubHeaderWeight })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="medium">Medium</option>
                                    <option value="bold">Bold</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Skill Layout</label>
                                <select
                                    value={formatting?.skillLayout || 'comma'}
                                    onChange={(e) => updateFormatting({ skillLayout: e.target.value as SkillLayout })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="comma">Comma (A, B, C)</option>
                                    <option value="pipe">Pipe (A | B | C)</option>
                                    <option value="inline-tags">Inline Tags</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Company/Title</label>
                                <select
                                    value={formatting?.companyTitleOrder || 'company-first'}
                                    onChange={(e) => updateFormatting({ companyTitleOrder: e.target.value as CompanyTitleOrder })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="company-first">Company First</option>
                                    <option value="title-first">Title First</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Date Sep.</label>
                                <select
                                    value={formatting?.dateSeparator || '\u2014'}
                                    onChange={(e) => updateFormatting({ dateSeparator: e.target.value as DateSeparator })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="\u2014">Em Dash (\u2014)</option>
                                    <option value="\u2013">En Dash (\u2013)</option>
                                    <option value="to">to</option>
                                    <option value="-">Hyphen (-)</option>
                                </select>
                            </div>
                            <div />
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.showLocation}
                                    onChange={(e) => updateFormatting({ showLocation: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Location</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.showGPA}
                                    onChange={(e) => updateFormatting({ showGPA: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">GPA</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.showEducationDescription}
                                    onChange={(e) => updateFormatting({ showEducationDescription: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Edu Desc.</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.showProjectKeywords}
                                    onChange={(e) => updateFormatting({ showProjectKeywords: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Proj Tags</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={!!formatting?.showAwardsSummaries}
                                    onChange={(e) => updateFormatting({ showAwardsSummaries: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Award Desc.</span>
                            </label>
                        </div>
                    </div>
                </section>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                    onClick={resetFormatting}
                    className="flex-1 px-4 py-3 bg-[#7f1d1d] hover:bg-[#991b1b] text-white border-2 border-transparent font-black uppercase tracking-widest transition-all active:scale-95 shadow-md text-[10px] sm:text-xs"
                >
                    Reset All Formatting
                </button>
            </div>
        </div>
    );
}
