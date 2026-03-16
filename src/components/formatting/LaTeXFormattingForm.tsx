/**
 * LaTeX-specific formatting settings.
 * Replaces the standard FormattingForm when a LaTeX template is selected.
 */

import { useResumeStore } from '../../store';
import { getLatexConfig } from '../../lib/latex/latexGenerator';
import type { LaTeXFormattingOptions } from '../../types';

export function LaTeXFormattingForm() {
    const { resumeData, latexFormatting, updateLatexFormatting, resetLatexFormatting } = useResumeStore();
    const templateId = resumeData?.selectedTemplate || 11;

    // Get resolved config: template defaults merged with user overrides
    const defaults = getLatexConfig(templateId);

    // Current values (user overrides or template defaults)
    const current: LaTeXFormattingOptions = {
        fontSize: (latexFormatting?.fontSize || defaults?.fontSize || '11pt') as LaTeXFormattingOptions['fontSize'],
        margins: latexFormatting?.margins || defaults?.margins || '0.75in',
        lineSpacing: latexFormatting?.lineSpacing || (defaults?.extraPreamble?.match(/linespread\{([^}]+)\}/)?.[1] || '1.15'),
        sectionSpaceBefore: latexFormatting?.sectionSpaceBefore || defaults?.sectionSpaceBefore || '12pt',
        sectionSpaceAfter: latexFormatting?.sectionSpaceAfter || defaults?.sectionSpaceAfter || '6pt',
        itemSep: latexFormatting?.itemSep || defaults?.itemSep || '6pt',
        bulletItemSep: latexFormatting?.bulletItemSep || defaults?.bulletItemSep || '0pt',
        headerSize: (latexFormatting?.headerSize || defaults?.headerSize?.replace('\\', '') || 'Huge') as LaTeXFormattingOptions['headerSize'],
        sectionTitleSize: (latexFormatting?.sectionTitleSize || defaults?.sectionTitleSize?.replace('\\', '') || 'large') as LaTeXFormattingOptions['sectionTitleSize'],
    };

    const selectClass = "w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all text-sm";
    const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5";
    const sectionClass = "bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">LaTeX Formatting</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Customize margins, spacing, and typography for pdfTeX output
                    </p>
                </div>
                <button
                    onClick={resetLatexFormatting}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#7f1d1d] text-white hover:bg-[#991b1b] transition-colors"
                >
                    Reset to Defaults
                </button>
            </div>

            {/* Page Layout */}
            <div className={sectionClass}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Page Layout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Font Size</label>
                        <select
                            value={current.fontSize}
                            onChange={(e) => updateLatexFormatting({ fontSize: e.target.value as LaTeXFormattingOptions['fontSize'] })}
                            className={selectClass}
                        >
                            <option value="9pt">9pt (Ultra Compact)</option>
                            <option value="10pt">10pt (Compact)</option>
                            <option value="11pt">11pt (Standard)</option>
                            <option value="12pt">12pt (Large)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Margins</label>
                        <select
                            value={current.margins}
                            onChange={(e) => updateLatexFormatting({ margins: e.target.value })}
                            className={selectClass}
                        >
                            <option value="0.3in">0.3in (Minimal)</option>
                            <option value="0.35in">0.35in (Ultra Tight)</option>
                            <option value="0.5in">0.5in (Tight)</option>
                            <option value="0.6in">0.6in (Compact)</option>
                            <option value="0.75in">0.75in (Standard)</option>
                            <option value="1in">1in (Wide)</option>
                            <option value="1.25in">1.25in (Academic)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Line Spacing</label>
                    <select
                        value={current.lineSpacing}
                        onChange={(e) => updateLatexFormatting({ lineSpacing: e.target.value })}
                        className={selectClass}
                    >
                        <option value="0.9">0.9 (Very Tight)</option>
                        <option value="0.95">0.95 (Tight)</option>
                        <option value="1.0">1.0 (Single)</option>
                        <option value="1.08">1.08 (Compact)</option>
                        <option value="1.15">1.15 (Standard)</option>
                        <option value="1.2">1.2 (Relaxed)</option>
                        <option value="1.5">1.5 (Wide)</option>
                    </select>
                </div>
            </div>

            {/* Typography */}
            <div className={sectionClass}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Typography</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Name Size</label>
                        <select
                            value={current.headerSize}
                            onChange={(e) => updateLatexFormatting({ headerSize: e.target.value as LaTeXFormattingOptions['headerSize'] })}
                            className={selectClass}
                        >
                            <option value="Huge">Huge (Largest)</option>
                            <option value="LARGE">LARGE</option>
                            <option value="Large">Large</option>
                            <option value="large">large (Smallest)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Section Title Size</label>
                        <select
                            value={current.sectionTitleSize}
                            onChange={(e) => updateLatexFormatting({ sectionTitleSize: e.target.value as LaTeXFormattingOptions['sectionTitleSize'] })}
                            className={selectClass}
                        >
                            <option value="Large">Large</option>
                            <option value="large">large (Standard)</option>
                            <option value="normalsize">normalsize (Compact)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section Spacing */}
            <div className={sectionClass}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Spacing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Space Before Sections</label>
                        <select
                            value={current.sectionSpaceBefore}
                            onChange={(e) => updateLatexFormatting({ sectionSpaceBefore: e.target.value })}
                            className={selectClass}
                        >
                            <option value="2pt">2pt (Minimal)</option>
                            <option value="4pt">4pt (Tight)</option>
                            <option value="6pt">6pt (Compact)</option>
                            <option value="8pt">8pt (Normal)</option>
                            <option value="10pt">10pt</option>
                            <option value="12pt">12pt (Standard)</option>
                            <option value="16pt">16pt (Spacious)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Space After Sections</label>
                        <select
                            value={current.sectionSpaceAfter}
                            onChange={(e) => updateLatexFormatting({ sectionSpaceAfter: e.target.value })}
                            className={selectClass}
                        >
                            <option value="1pt">1pt (Minimal)</option>
                            <option value="2pt">2pt (Tight)</option>
                            <option value="3pt">3pt</option>
                            <option value="4pt">4pt (Normal)</option>
                            <option value="6pt">6pt (Standard)</option>
                            <option value="8pt">8pt (Spacious)</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Entry Gap (Jobs/Edu)</label>
                        <select
                            value={current.itemSep}
                            onChange={(e) => updateLatexFormatting({ itemSep: e.target.value })}
                            className={selectClass}
                        >
                            <option value="0pt">0pt (None)</option>
                            <option value="1pt">1pt (Minimal)</option>
                            <option value="2pt">2pt</option>
                            <option value="3pt">3pt (Compact)</option>
                            <option value="4pt">4pt</option>
                            <option value="6pt">6pt (Standard)</option>
                            <option value="8pt">8pt (Spacious)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Bullet Item Gap</label>
                        <select
                            value={current.bulletItemSep}
                            onChange={(e) => updateLatexFormatting({ bulletItemSep: e.target.value })}
                            className={selectClass}
                        >
                            <option value="-3pt">-3pt (Overlap)</option>
                            <option value="-2pt">-2pt (Very Tight)</option>
                            <option value="-1pt">-1pt (Tight)</option>
                            <option value="0pt">0pt (Standard)</option>
                            <option value="1pt">1pt</option>
                            <option value="2pt">2pt (Relaxed)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 px-4 py-3 border-2"
                style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', borderColor: 'color-mix(in srgb, var(--accent) 40%, var(--card-border))' }}>
                <p className="text-sm" style={{ color: 'var(--main-text)' }}>
                    These settings modify the pdfTeX preamble. Changes automatically regenerate the LaTeX source and recompile the preview.
                    Use <strong>**bold**</strong> and <strong>*italic*</strong> in any text field for formatting.
                </p>
            </div>
        </div>
    );
}
