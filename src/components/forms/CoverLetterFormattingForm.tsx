import { FileType } from 'lucide-react';
import type { FormattingOptions, ColorTheme, Alignment, FontFamily, NameSize, Spacing, BodyTextWeight } from '../../types';

interface CoverLetterFormattingFormProps {
    data: FormattingOptions;
    update: (formatting: Partial<FormattingOptions>) => void;
    reset: () => void;
}

export function CoverLetterFormattingForm({
    data: formatting,
    update: updateFormatting,
    reset: resetFormatting,
}: CoverLetterFormattingFormProps) {

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                    <FileType size={20} className="text-slate-400" />
                    <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Cover Letter Formatting</h3>
                </div>
                <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                    Simplified formatting for clean, professional business letters.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 1: Typography */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Typography
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
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Text Size</label>
                                <select
                                    value={formatting?.baseFontSize || '11pt'}
                                    onChange={(e) => updateFormatting({ baseFontSize: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="10pt">10pt</option>
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
                                    <option value="huge">24pt</option>
                                    <option value="large">20pt</option>
                                    <option value="large2">18pt</option>
                                    <option value="normal">16pt</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name Weight</label>
                                <select
                                    value={formatting?.fontWeightName || 'BOLD'}
                                    onChange={(e) => updateFormatting({ fontWeightName: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="NORMAL">Normal</option>
                                    <option value="BOLD">Bold</option>
                                    <option value="HEAVY">Heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Body Weight</label>
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
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Page Format</label>
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
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Line Spacing</label>
                                <select
                                    value={formatting?.lineSpacing || '1.2'}
                                    onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-xs sm:text-sm"
                                >
                                    <option value="1.0">1.0 Tight</option>
                                    <option value="1.15">1.15</option>
                                    <option value="1.2">1.2 Standard</option>
                                    <option value="1.5">1.5 Loose</option>
                                </select>
                            </div>
                        </div>

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
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Margins (inches)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: 'marginTop', label: 'T' },
                                    { key: 'marginBottom', label: 'B' },
                                    { key: 'marginLeft', label: 'L' },
                                    { key: 'marginRight', label: 'R' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <input
                                            type="number"
                                            min="0.5"
                                            max="1.5"
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
                    </div>
                </section>

                {/* Section 3: Color & Aesthetics */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 lg:col-span-2 space-y-3 sm:space-y-4 shadow-sm">
                    <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                        Style & Theme
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Color Theme</label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {([
                                    { theme: 'black' as ColorTheme, color: '#000000' },
                                    { theme: 'navy' as ColorTheme, color: '#001f3f' },
                                    { theme: 'darkblue' as ColorTheme, color: '#0074D9' },
                                    { theme: 'maroon' as ColorTheme, color: '#85144B' },
                                    { theme: 'purple' as ColorTheme, color: '#B10DC9' },
                                    { theme: 'teal' as ColorTheme, color: '#0D9488' },
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
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Header Alignment</label>
                            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-600">
                                {(['left', 'center', 'right'] as Alignment[]).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateFormatting({ headerAlignment: align })}
                                        className={`flex-1 py-2 px-2 text-[10px] sm:text-sm font-black uppercase tracking-widest transition-all ${formatting?.headerAlignment === align
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="pt-4">
                <button
                    onClick={resetFormatting}
                    className="w-full sm:w-auto px-6 py-3 bg-[#7f1d1d] hover:bg-[#991b1b] text-white border-2 border-transparent font-black uppercase tracking-widest transition-all active:scale-95 shadow-md text-[10px] sm:text-xs"
                >
                    Reset Letter Styles
                </button>
            </div>
        </div>
    );
}
