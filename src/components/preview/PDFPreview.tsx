import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
// useRef still used for previousDataRef + generationRef
import { pdf } from '@react-pdf/renderer';
import equal from 'fast-deep-equal';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/stores/coverLetterStore';
import { useCustomTemplateStore } from '../../lib/stores/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/utils/templateResolver';
import { getPDFTemplateComponent, isLatexTemplate } from '../../lib/pdf/pdfTemplateMap';
import { generateLaTeXFromData, generateLaTeXCoverLetter } from '../../lib/latex/latexGenerator';
import { compileLatexViaApi } from '../../lib/latex/latexApiCompiler';
import type { TemplateId, DocumentType } from '../../types';
import { generateDocumentTitle, generateDocumentFileName } from '../../lib/utils/documentNaming';
import {
    Download, Printer, ZoomIn, ZoomOut, Maximize, MoveHorizontal,
    ChevronLeft, ChevronRight, Info, PanelLeft, X, Code2, FileJson,
    CircleDot, Clock, RefreshCw
} from 'lucide-react';
import { exportToContentJSON } from '../../lib/data/storage';

/* ──────────────────────────────────────
   Helpers
   ────────────────────────────────────── */

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
    showResume?: boolean;
    showCoverLetter?: boolean;
    onDocumentTypeChange?: (type: DocumentType) => void;
}

async function getPdfjsLib() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import('pdfjs-dist') as any;
    try {
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href;
    } catch {
        try {
            const ver = pdfjsLib.version || '5.4.624';
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.mjs`;
        } catch {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        }
    }
    return pdfjsLib;
}

/* ──────────────────────────────────────
   Native PDF Preview — Custom Themed Toolbar
   
   Uses browser's built-in PDF renderer via <iframe> for:
     • Perfect text selection
     • Crisp vector rendering at any zoom
     • Clickable links
     • Ctrl+scroll zoom (handled natively inside iframe)
   
   Native toolbar hidden with #toolbar=0.
   Our zoom buttons reload the iframe with #zoom=X.
   ────────────────────────────────────── */

export const PDFPreview = memo(function PDFPreview({ templateId, documentType, showResume, showCoverLetter, onDocumentTypeChange }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    // PDF generation
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);
    const previousManualRefreshRef = useRef(0);

    // Viewer state — zoom=0 means "fit to width"
    const [zoom, setZoom] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // UI panels
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [showProperties, setShowProperties] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(true);
    const [manualRefreshTrigger, setManualRefreshTrigger] = useState(0);
    const [pdfMetadata, setPdfMetadata] = useState<Record<string, string>>({});
    const [thumbnails, setThumbnails] = useState<string[]>([]);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const downloadFileName = generateDocumentFileName({
        userName: resumeData.basics.name || '',
        documentType,
        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
    });

    /* ── Generate PDF blob ── */
    useEffect(() => {
        // Optimization: Only track data relevant to the current document type to prevent unnecessary rerenders
        // e.g. Changing cover letter info shouldn't rerender the resume PDF.
        const currentState = {
            templateId,
            documentType,
            customLatexSource,
            latexFormatting,
            // Only include the data that actually affects the current document
            resumeData: documentType === 'resume' ? resumeData : null,
            coverLetterData: documentType === 'coverletter' ? coverLetterData : null,
            // Header/Signature in cover letter often depends on resume basics
            basics: documentType === 'coverletter' ? resumeData.basics : null,
        };

        const isManualRefresh = manualRefreshTrigger > previousManualRefreshRef.current;
        if (isManualRefresh) {
            previousManualRefreshRef.current = manualRefreshTrigger;
        }

        if (!isManualRefresh && previousDataRef.current && equal(currentState, previousDataRef.current) && pdfBlob) return;
        
        let timeoutId: ReturnType<typeof setTimeout>;

        const generatePDF = async () => {
            const gen = ++generationRef.current;
            setIsGenerating(true);
            setError(null);
            try {
                const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
                let blob: Blob;
                if (isLatexTemplate(templateId)) {
                    const tex = documentType === 'coverletter'
                        ? generateLaTeXCoverLetter(coverLetterData, templateId)
                        : (customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting));
                    blob = await compileLatexViaApi(tex);
                } else {
                    const title = generateDocumentTitle({
                        userName: resumeData.basics.name || '',
                        documentType,
                        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
                    });
                    const comp = getPDFTemplateComponent(effectiveData, documentType, coverLetterData, title);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    blob = await pdf(comp as any).toBlob();
                }
                if (gen !== generationRef.current) return;
                setPdfBlob(blob);
                previousDataRef.current = currentState;
            } catch (err) {
                if (gen !== generationRef.current) return;
                setError(err instanceof Error ? err.message : 'PDF generation failed');
            } finally {
                if (gen === generationRef.current) setIsGenerating(false);
            }
        };

        if (isLiveMode || isManualRefresh) {
            generatePDF();
        } else {
            timeoutId = setTimeout(() => {
                generatePDF();
            }, 30000);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeData, templateId, documentType, coverLetterData, customLatexSource, customTemplates, latexFormatting, isLiveMode, manualRefreshTrigger]);

    /* ── Create / revoke blob URL ── */
    useEffect(() => {
        if (!pdfBlob) { setPdfUrl(null); return; }
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [pdfBlob]);

    /* ── Metadata + thumbnails ── */
    useEffect(() => {
        if (!pdfBlob) return;
        let cancelled = false;
        (async () => {
            try {
                const pdfjsLib = await getPdfjsLib();
                const ab = await pdfBlob.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: ab }).promise;
                if (cancelled) { doc.destroy(); return; }
                setTotalPages(doc.numPages);
                setCurrentPage(1);

                // Metadata
                try {
                    const meta = await doc.getMetadata();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const info: any = meta?.info || {};
                    const md: Record<string, string> = {};
                    if (info.Title) md['Title'] = info.Title;
                    if (info.Author) md['Author'] = info.Author;
                    if (info.Creator) md['Creator'] = info.Creator;
                    if (info.Producer) md['Producer'] = info.Producer;
                    md['Pages'] = String(doc.numPages);
                    const p1 = await doc.getPage(1);
                    const vp = p1.getViewport({ scale: 1 });
                    md['Page Size'] = `${(vp.width / 72).toFixed(2)}" × ${(vp.height / 72).toFixed(2)}"`;
                    if (!cancelled) setPdfMetadata(md);
                } catch { /* */ }

                // Thumbnails
                const thumbs: string[] = [];
                for (let i = 1; i <= doc.numPages; i++) {
                    if (cancelled) break;
                    try {
                        const page = await doc.getPage(i);
                        const vp = page.getViewport({ scale: 0.25 });
                        const c = document.createElement('canvas');
                        c.width = vp.width; c.height = vp.height;
                        const ctx = c.getContext('2d');
                        if (ctx) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            await page.render({ canvasContext: ctx, canvas: c, viewport: vp } as any).promise;
                            thumbs.push(c.toDataURL('image/png'));
                        }
                    } catch { /* */ }
                }
                if (!cancelled) setThumbnails(thumbs);
                doc.destroy();
            } catch { /* */ }
        })();
        return () => { cancelled = true; };
    }, [pdfBlob]);

    /* ── Iframe src ──
       Computed from pdfUrl + zoom + currentPage.
       The iframe key includes zoom + page so React remounts it
       exactly ONCE per change. No imperative navigation needed. */
    const iframeSrc = useMemo(() => {
        if (!pdfUrl) return '';
        const parts = ['toolbar=0', 'navpanes=0'];
        if (zoom === 0) parts.push('view=FitH');
        else if (zoom === -1) parts.push('view=Fit');
        else parts.push(`zoom=${zoom}`);
        if (currentPage > 1) parts.push(`page=${currentPage}`);
        return `${pdfUrl}#${parts.join('&')}`;
    }, [pdfUrl, zoom, currentPage]);

    const iframeKey = `${pdfUrl}|${zoom}|${currentPage}`;

    /* ── Zoom controls ── */
    const handleZoomIn = useCallback(() => {
        setZoom(z => {
            const cur = (z === 0 || z === -1) ? 100 : z;
            return Math.min(cur + 25, 500);
        });
    }, []);
    const handleZoomOut = useCallback(() => {
        setZoom(z => {
            const cur = (z === 0 || z === -1) ? 100 : z;
            return Math.max(cur - 25, 25);
        });
    }, []);
    const handleFitToggle = useCallback(() => {
        setZoom(z => z === 0 ? -1 : 0);
    }, []);

    /* ── Page nav ── */
    const goToPage = useCallback((p: number) => {
        if (p < 1 || p > totalPages) return;
        setCurrentPage(p);
    }, [totalPages]);

    /* ── Download ── */
    const handleDownload = useCallback(() => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${downloadFileName}.pdf`;
        a.click();
    }, [pdfUrl, downloadFileName]);

    /* ── Print ── */
    const handlePrint = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const f = document.createElement('iframe');
        f.style.display = 'none';
        f.src = url;
        document.body.appendChild(f);
        f.onload = () => {
            try { f.contentWindow?.print(); } catch { window.open(url, '_blank'); }
            setTimeout(() => { document.body.removeChild(f); URL.revokeObjectURL(url); }, 3000);
        };
    }, [pdfBlob]);

    /* ── Export JSON ── */
    const handleExportJSON = useCallback(() => {
        const json = exportToContentJSON(resumeData);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const name = resumeData.basics.name || 'resume';
        a.download = `resume-${name}.json`.replace(/[^a-z0-9._-]/gi, '_');
        a.click();
        URL.revokeObjectURL(url);
    }, [resumeData]);

    /* ── Download .TEX ── */
    const handleDownloadTex = useCallback(() => {
        const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
        const texSource = documentType === 'coverletter'
            ? generateLaTeXCoverLetter(coverLetterData, templateId)
            : (customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting));

        const blob = new Blob([texSource], { type: 'application/x-latex' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const name = resumeData.basics.name || (documentType === 'coverletter' ? 'cover-letter' : 'resume');
        a.download = `${name.replace(/[^a-z0-9._-]/gi, '_')}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    }, [resumeData, customTemplates, documentType, coverLetterData, templateId, customLatexSource, latexFormatting]);

    /* ── Theme styles ── */
    const toolbarBg: React.CSSProperties = { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' };
    const txt: React.CSSProperties = { color: 'var(--main-text)' };
    const txtM: React.CSSProperties = { color: 'var(--main-text-secondary)' };
    const btn: React.CSSProperties = { backgroundColor: 'var(--input-bg)', color: 'var(--main-text)', borderColor: 'var(--input-border)' };

    const zoomLabel = zoom === 0 ? 'Width' : zoom === -1 ? 'Page' : `${zoom}%`;

    /* ── Error ── */
    if (error && !pdfBlob) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="max-w-lg text-center">
                    <h3 className="text-lg font-bold text-[#7f1d1d] mb-2 uppercase tracking-tighter">
                        {isLatexTemplate(templateId) ? 'LaTeX Compilation Error' : 'PDF Generation Error'}
                    </h3>
                    <pre className="text-xs text-left bg-[#7f1d1d]/10 border-2 border-[#7f1d1d]/30 p-4 overflow-auto max-h-48 text-[#7f1d1d] mb-4 whitespace-pre-wrap font-mono">{error}</pre>
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest border-2 transition-all active:scale-95" style={btn}>Retry Processing</button>
                </div>
            </div>
        );
    }

    /* ── Loading ── */
    if (!pdfBlob) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent rounded-full mx-auto mb-4"
                        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    <p className="text-sm font-semibold" style={txtM}>
                        {isLatexTemplate(templateId) ? 'Compiling with pdfTeX...' : 'Generating preview...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
            {/* ━━ Toolbar ━━ */}
            <div className="flex items-center gap-2 px-3 py-2 border-b-2 z-20 flex-shrink-0" style={toolbarBg}>
                {/* Left: filename + page nav */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="hidden sm:inline text-xs font-semibold truncate max-w-[120px]" style={txt}
                        title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {isGenerating && (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-t-transparent rounded-full flex-shrink-0"
                            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    )}
                    {totalPages > 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                                className="p-1 rounded transition-colors disabled:opacity-30 hover:bg-white/5 active:bg-white/10"
                                style={{ color: 'var(--main-text)' }} title="Previous Page">
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-[11px] font-bold px-1 tabular-nums" style={txt} title="Current Page">
                                {currentPage}/{totalPages}
                            </span>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                                className="p-1 rounded transition-colors disabled:opacity-30 hover:bg-white/5 active:bg-white/10"
                                style={{ color: 'var(--main-text)' }} title="Next Page">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}

                    {showResume && showCoverLetter && onDocumentTypeChange && (
                        <>
                            <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--card-border)' }} />
                            <div className="flex items-center gap-4 px-2 h-[28px]">
                                <button
                                    onClick={() => onDocumentTypeChange('resume')}
                                    className={`relative flex items-center justify-center text-[11px] font-bold transition-colors h-full px-1`}
                                    style={{ color: documentType === 'resume' ? 'var(--main-text)' : 'var(--main-text-secondary)' }}
                                    title="View Resume Preview"
                                >
                                    Resume
                                    {documentType === 'resume' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-sm" />
                                    )}
                                </button>
                                <button
                                    onClick={() => onDocumentTypeChange('coverletter')}
                                    className={`relative flex items-center justify-center text-[11px] font-bold transition-colors h-full px-1`}
                                    style={{ color: documentType === 'coverletter' ? 'var(--main-text)' : 'var(--main-text-secondary)' }}
                                    title="View Cover Letter Preview"
                                >
                                    Cover letter
                                    {documentType === 'coverletter' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t-sm" />
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Center: zoom + fit */}
                <div className="flex items-center gap-1 flex-shrink-0 justify-center">
                    <button onClick={handleZoomOut} className="p-2 sm:p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                        style={{ color: 'var(--main-text)' }} title="Zoom Out">
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-[11px] font-bold min-w-[44px] text-center select-none tabular-nums" style={txt}>
                        {zoomLabel}
                    </span>
                    <button onClick={handleZoomIn} className="p-2 sm:p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                        style={{ color: 'var(--main-text)' }} title="Zoom In">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={handleFitToggle} className="p-2 sm:p-1.5 transition-colors text-white/80 hover:text-white rounded hover:bg-white/5 active:bg-white/10"
                        style={(zoom === 0 || zoom === -1) ? { backgroundColor: 'transparent' } : undefined}
                        title={zoom === 0 ? "Switch to Fit Page" : "Switch to Fit Width"}>
                        {zoom === 0 ? (
                            <MoveHorizontal size={16} className="text-blue-400" />
                        ) : zoom === -1 ? (
                            <Maximize size={16} className="text-green-500" />
                        ) : (
                            <Maximize size={16} className="opacity-50" />
                        )}
                    </button>
                </div>

                {/* Right: auto-refresh toggle, refresh btn, thumbnails, properties, print, download */}
                <div className="flex items-center gap-1 flex-1 justify-end">
                    {/* Live / 30s Toggle & Refresh (Visible on larger screens) */}
                    <div className="hidden lg:flex items-center mr-1 gap-1.5">
                        <div className="flex items-center px-1 h-[28px]">
                            <button
                                onClick={() => setIsLiveMode(true)}
                                className="flex items-center justify-center gap-1.5 px-2 h-full text-[11px] font-bold transition-colors"
                                style={{ color: isLiveMode ? 'var(--main-text)' : 'var(--main-text-secondary)' }}
                                title="Live Preview (Updates immediately as you carefully type)"
                            >
                                <CircleDot size={12} className={isLiveMode ? "text-white" : "opacity-50"} />
                                <span>Live</span>
                            </button>
                            <span className="text-white/30 font-bold mx-1 select-none">·</span>
                            <button
                                onClick={() => setIsLiveMode(false)}
                                className="flex items-center justify-center gap-1.5 px-2 h-full text-[11px] font-bold transition-colors"
                                style={{ color: !isLiveMode ? 'var(--main-text)' : 'var(--main-text-secondary)' }}
                                title="Delayed Preview (Refreshes PDF 30 seconds after typing stops to save battery)"
                            >
                                <Clock size={12} className={!isLiveMode ? "text-white" : "opacity-50"} />
                                <span>30s</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setManualRefreshTrigger(t => t + 1)}
                            className="flex items-center justify-center p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                            style={{ color: 'var(--main-text)' }}
                            title="Force Refresh Preview PDF Now"
                        >
                            <RefreshCw size={16} className={isGenerating ? "animate-spin text-blue-400" : ""} />
                        </button>
                        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--card-border)' }} />
                    </div>

                    <button onClick={() => setShowThumbnails(v => !v)} className="p-2 sm:p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                        style={showThumbnails ? { color: 'var(--accent)', backgroundColor: 'transparent' } : { color: 'var(--main-text)' }} title="Thumbnails">
                        <PanelLeft size={16} strokeWidth={showThumbnails ? 3 : 2} />
                    </button>
                    <button onClick={() => setShowProperties(v => !v)} className="hidden sm:block p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                        style={showProperties ? { color: 'var(--accent)', backgroundColor: 'transparent' } : { color: 'var(--main-text)' }} title="Document Properties">
                        <Info size={16} />
                    </button>
                    <div className="hidden lg:block w-px h-5 mx-0.5" style={{ backgroundColor: 'var(--card-border)' }} />

                    {/* JSON Export */}
                    <button onClick={handleExportJSON} className="hidden lg:flex p-2 sm:p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                        style={{ color: 'var(--main-text)' }} title="Export JSON">
                        <FileJson size={16} />
                    </button>

                    {/* Tex Export (if LaTeX template) */}
                    {isLatexTemplate(templateId) && (
                        <button onClick={handleDownloadTex} className="hidden lg:flex p-2 sm:p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                            style={{ color: 'var(--main-text)' }} title="Download .TEX Source">
                            <Code2 size={16} strokeWidth={2} />
                        </button>
                    )}

                    <button onClick={handlePrint} className="p-2 sm:p-1.5 rounded transition-colors hover:bg-white/5 active:bg-white/10"
                        style={{ color: 'var(--main-text)' }} title="Print">
                        <Printer size={16} />
                    </button>
                    <button onClick={handleDownload} className="btn-accent p-2 sm:p-1.5 rounded shadow-lg transition-all active:scale-95 hover:brightness-110 ml-1"
                        title="Download PDF">
                        <Download size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* ━━ Error banner (stale) ━━ */}
            {error && (
                <div className="bg-[#7f1d1d] border-b-2 border-black/20 p-2 text-xs text-white text-center flex-shrink-0 font-bold uppercase tracking-wide">
                    <strong>Error:</strong> {error}
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="ml-3 underline hover:text-white/80 transition-colors">Retry</button>
                </div>
            )}

            {/* ━━ Body: thumbnails + PDF ━━ */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnail sidebar */}
                {showThumbnails && (
                    <div className="w-36 flex-shrink-0 border-r overflow-y-auto p-2 space-y-2"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        {thumbnails.map((src, i) => (
                            <button key={i} onClick={() => goToPage(i + 1)}
                                className="block w-full border-2 transition-all"
                                style={{ borderColor: currentPage === i + 1 ? 'var(--accent)' : 'var(--card-border)' }}>
                                <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                                <div className="text-[9px] font-bold text-center py-0.5" style={txtM}>{i + 1}</div>
                            </button>
                        ))}
                        {thumbnails.length === 0 && totalPages > 0 && (
                            <div className="text-[10px] text-center py-4" style={txtM}>Loading...</div>
                        )}
                    </div>
                )}

                {/* Native PDF iframe — full size, no CSS transforms */}
                <div className="flex-1 overflow-hidden">
                    {pdfUrl && (
                        <iframe
                            key={iframeKey}
                            ref={iframeRef}
                            src={iframeSrc}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                        />
                    )}
                </div>
            </div>

            {/* ━━ Properties modal ━━ */}
            {showProperties && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setShowProperties(false)}>
                    <div className="border-2 shadow-2xl max-w-sm w-full mx-4"
                        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--main-text)', borderColor: 'var(--card-border)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b"
                            style={{ borderColor: 'var(--card-border)' }}>
                            <h3 className="font-bold text-sm">Document Properties</h3>
                            <button onClick={() => setShowProperties(false)} className="p-1 border transition-colors" style={btn}>
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {Object.entries(pdfMetadata).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                    <span className="font-semibold" style={txtM}>{k}:</span>
                                    <span className="text-right max-w-[200px] truncate" style={txt} title={v}>{v}</span>
                                </div>
                            ))}
                            {Object.keys(pdfMetadata).length === 0 && (
                                <p className="text-xs" style={txtM}>No metadata available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
