/**
 * LaTeX Editor Component
 *
 * Provides a dual-mode editing experience:
 * - Form Mode: Resume data is edited via the standard form editors;
 *   LaTeX is auto-generated from the data. User can download the .tex file.
 * - Advanced Mode: User directly edits the raw LaTeX source in Monaco Editor.
 *
 * When switching from Advanced -> Form, custom LaTeX edits are discarded (with warning).
 * When switching from Form -> Advanced, the current LaTeX is generated as a starting point.
 */

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useResumeStore } from '../../store';
import { generateLaTeXFromData } from '../../lib/latex/latexGenerator';
import { getEffectiveResumeData } from '../../lib/utils/templateResolver';
import { useCustomTemplateStore } from '../../lib/stores/customTemplateStore';
import { useModal } from '../common/ThemedModal';
import { Download, Copy, RotateCcw } from 'lucide-react';

// Lazy-load Monaco Editor — it's large (~2MB) and only needed in Advanced Mode
const Editor = lazy(() => import('@monaco-editor/react'));

type EditorMode = 'form' | 'advanced';

export function LaTeXEditor() {
    const modal = useModal();
    const { resumeData, customLatexSource, setCustomLatex, clearCustomLatex, latexFormatting } = useResumeStore();
    const { customTemplates } = useCustomTemplateStore();

    const [mode, setMode] = useState<EditorMode>(customLatexSource ? 'advanced' : 'form');
    const [texSource, setTexSource] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get effective resume data (respects custom template formatting)
    const effectiveData = getEffectiveResumeData(resumeData, customTemplates);

    const selectedTemplate = resumeData.selectedTemplate;

    // Sync TeX source based on mode
    useEffect(() => {
        if (mode === 'form') {
            setTexSource(generateLaTeXFromData(effectiveData, selectedTemplate, latexFormatting));
        } else if (customLatexSource) {
            setTexSource(customLatexSource);
        } else {
            const generated = generateLaTeXFromData(effectiveData, selectedTemplate, latexFormatting);
            setTexSource(generated);
            setCustomLatex(generated);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, selectedTemplate, ...(mode === 'form' ? [effectiveData] : [])]);

    const handleModeSwitch = useCallback(async (newMode: EditorMode) => {
        if (newMode === mode) return;

        if (newMode === 'form' && mode === 'advanced' && customLatexSource) {
            const confirmed = await modal.confirm(
                'Switch to Form Mode',
                'Switching to Form Mode will discard your manual LaTeX edits. Continue?'
            );
            if (!confirmed) return;
            clearCustomLatex();
        }

        if (newMode === 'advanced' && mode === 'form') {
            const generated = generateLaTeXFromData(effectiveData, selectedTemplate, latexFormatting);
            setTexSource(generated);
            setCustomLatex(generated);
        }

        setMode(newMode);
    }, [mode, customLatexSource, effectiveData, clearCustomLatex, setCustomLatex, latexFormatting, selectedTemplate, modal]);

    const handleLatexChange = useCallback((value: string | undefined) => {
        if (value === undefined) return;
        setTexSource(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (mode === 'advanced') {
                setCustomLatex(value);
            }
        }, 800);
    }, [mode, setCustomLatex]);

    const handleReset = useCallback(async () => {
        const confirmed = await modal.confirm(
            'Reset LaTeX',
            'Reset to auto-generated LaTeX? This will discard all custom edits.',
            { destructive: true }
        );
        if (!confirmed) return;

        const freshSource = generateLaTeXFromData(effectiveData, selectedTemplate, latexFormatting);
        setTexSource(freshSource);
        setCustomLatex(freshSource);
    }, [effectiveData, selectedTemplate, setCustomLatex, latexFormatting, modal]);

    const handleDownloadTex = useCallback(() => {
        const source = mode === 'advanced' && customLatexSource ? customLatexSource : texSource;
        const blob = new Blob([source], { type: 'application/x-latex' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const name = resumeData.basics.name || 'resume';
        a.download = `${name.replace(/[^a-z0-9._-]/gi, '_')}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    }, [mode, customLatexSource, texSource, resumeData.basics.name]);

    const handleCopyTex = useCallback(async () => {
        const source = mode === 'advanced' && customLatexSource ? customLatexSource : texSource;
        try {
            await navigator.clipboard.writeText(source);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = source;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        }
    }, [mode, customLatexSource, texSource]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">LaTeX Editor</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Edit and export your resume as real LaTeX source
                    </p>
                </div>
            </div>

            {/* Mode Switcher + Actions */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => handleModeSwitch('form')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${mode === 'form'
                        ? 'btn-accent'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                        }`}
                >
                    Form Mode
                </button>
                <button
                    onClick={() => handleModeSwitch('advanced')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${mode === 'advanced'
                        ? 'btn-accent'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                        }`}
                >
                    Advanced (LaTeX)
                </button>

                <div className="flex-1" />

                <button
                    onClick={handleCopyTex}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                    <Copy size={12} />
                    {copyFeedback ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={handleDownloadTex}
                    className="btn-accent flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-colors shadow-sm"
                >
                    <Download size={12} />
                    Download .tex
                </button>

                {mode === 'advanced' && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 border-red-700 bg-red-700 text-white hover:bg-red-600 hover:border-red-600 transition-colors"
                    >
                        <RotateCcw size={12} />
                        Reset
                    </button>
                )}
            </div>

            {/* Content */}
            {mode === 'form' ? (
                <div className="space-y-5">
                    {/* Info box */}
                    <div className="flex items-start gap-3 px-4 py-3 border-2"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', borderColor: 'color-mix(in srgb, var(--accent) 40%, var(--card-border))' }}>
                        <p className="text-sm" style={{ color: 'var(--main-text)' }}>
                            <strong>Form Mode:</strong> Your resume data is auto-compiled to a real pdfTeX PDF.
                            Tip: Use <code className="px-1" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))' }}>**bold**</code> for emphasis
                            and <code className="px-1" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))' }}>*italic*</code> for titles in any text field.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-3 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">LaTeX Features</h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                            <p>
                                The generated LaTeX uses the <code className="bg-slate-200 dark:bg-slate-700 px-1">article</code> document class with:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Clean section dividers with <code className="bg-slate-200 dark:bg-slate-700 px-1">titlesec</code></li>
                                <li>Clickable hyperlinks via <code className="bg-slate-200 dark:bg-slate-700 px-1">hyperref</code></li>
                                <li>Compact bullet points with <code className="bg-slate-200 dark:bg-slate-700 px-1">enumitem</code></li>
                                <li>Page geometry with <code className="bg-slate-200 dark:bg-slate-700 px-1">geometry</code></li>
                                <li>Proper LaTeX typography and spacing</li>
                            </ul>
                            <p className="mt-3">
                                Switch to <strong>Advanced Mode</strong> to edit the raw LaTeX source for full control.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadTex}
                            className="btn-accent flex-1 py-3 text-sm font-bold uppercase tracking-wider border-2 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Download size={16} />
                            Download .tex File
                        </button>
                        <button
                            onClick={handleCopyTex}
                            className="flex-1 py-3 text-sm font-bold uppercase tracking-wider border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy size={16} />
                            {copyFeedback ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>

                    {/* Read-only preview of generated LaTeX */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Generated LaTeX Source
                        </h4>
                        <div className="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 shadow-inner">
                            <pre className="text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 p-4 overflow-auto max-h-[500px] font-mono whitespace-pre-wrap">
                                {texSource}
                            </pre>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-0">
                    <div className="px-4 py-3 border-2 border-b-0"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', borderColor: 'color-mix(in srgb, var(--accent) 40%, var(--card-border))' }}>
                        <p className="text-xs" style={{ color: 'var(--main-text)' }}>
                            <strong>Advanced Mode:</strong> Editing raw LaTeX source. Changes here won't sync back to form fields.
                            Download the <code className="px-1" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))' }}>.tex</code> to compile locally.
                        </p>
                    </div>
                    <div className="border-2 border-slate-200 dark:border-slate-700" style={{ height: '600px' }}>
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-800">
                                <div className="text-center">
                                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Loading editor...</p>
                                </div>
                            </div>
                        }>
                            <Editor
                                height="100%"
                                defaultLanguage="latex"
                                value={texSource}
                                onChange={handleLatexChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                    renderWhitespace: 'selection',
                                    bracketPairColorization: { enabled: true },
                                    padding: { top: 8 },
                                }}
                            />
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
}
