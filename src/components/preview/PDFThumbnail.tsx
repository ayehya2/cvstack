import { useState, useEffect, useRef, memo } from 'react';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/stores/coverLetterStore';
import { useCustomTemplateStore } from '../../lib/stores/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/utils/templateResolver';
import { getPDFTemplateComponent, isLatexTemplate } from '../../lib/pdf/pdfTemplateMap';
import { pdfToImage, blobToImage } from '../../lib/pdf/pdfToImage';
import { generateLaTeXFromData, generateLaTeXCoverLetter } from '../../lib/latex/latexGenerator';
import { compileLatexViaApi } from '../../lib/latex/latexApiCompiler';
import { getCachedThumbnail, setCachedThumbnail } from '../../lib/utils/thumbnailCache';
import type { TemplateId, ResumeData, CoverLetterData } from '../../types';

interface PDFThumbnailProps {
    templateId: TemplateId;
    previewData?: ResumeData | CoverLetterData;
    isCoverLetter?: boolean;
    /**
     * When set, the rendered image is stored in / loaded from IndexedDB under
     * this key.  Pass a stable key (e.g. `thumb-v2-{templateId}-{density}`)
     * for default-template cards so they render once and are cached forever.
     * Leave undefined for "your data" live previews so they always re-render.
     */
    cacheKey?: string;
}

/**
 * PDFThumbnail generates a high-fidelity thumbnail image from the actual PDF
 * template. For LaTeX templates, it compiles via the real pdfTeX API.
 *
 * When `cacheKey` is provided the rendered PNG is stored in IndexedDB and
 * served instantly on subsequent visits — no spinner, no re-render.
 */
export const PDFThumbnail = memo(function PDFThumbnail({ templateId, previewData, isCoverLetter, cacheKey }: PDFThumbnailProps) {
    const resumeStore = useResumeStore();
    const coverLetterStore = useCoverLetterStore();

    const docData = previewData || (isCoverLetter ? coverLetterStore.coverLetterData : resumeStore.resumeData);
    const { customLatexSource, latexFormatting } = isCoverLetter
        ? { customLatexSource: '', latexFormatting: undefined }
        : resumeStore;
    const { customTemplates } = useCustomTemplateStore();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const generationId = useRef(0);

    // Cast docData to any to pass to getEffectiveResumeData which expects ResumeData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseEffectiveData = getEffectiveResumeData(docData as any, customTemplates);
    const effectiveData = { ...baseEffectiveData, selectedTemplate: templateId };

    const formattingFingerprint = JSON.stringify(effectiveData?.formatting || {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = docData as any;
    const fingerprint = `${isCoverLetter ? 'cv' : 'resume'}-${templateId}-${formattingFingerprint}-${doc?.basics?.name || doc?.company || ''}-${effectiveData?.sections?.join(',') || ''}-${doc?.work?.length || 0}-${customLatexSource ? 'custom' : 'auto'}`;

    useEffect(() => {
        const currentId = ++generationId.current;
        const isLatex = isLatexTemplate(templateId);
        const isLatexCoverLetter = isLatex && isCoverLetter;
        const debounceMs = isLatex ? 1200 : 600;

        let cancelled = false;

        const run = async () => {
            // ── Step 1: check IndexedDB cache (no debounce — cache hits are instant) ──
            if (cacheKey) {
                const cached = await getCachedThumbnail(cacheKey);
                if (cancelled || currentId !== generationId.current) return;
                if (cached) {
                    setImageUrl(cached);
                    setIsLoading(false);
                    setHasError(false);
                    return;
                }
            }

            // ── Step 2: cache miss — debounce then generate ──
            setIsLoading(true);
            setHasError(false);

            await new Promise(resolve => setTimeout(resolve, debounceMs));
            if (cancelled || currentId !== generationId.current) return;

            try {
                let url: string | null = null;

                if (isLatexCoverLetter) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const texSource = generateLaTeXCoverLetter(docData as any, templateId);
                    const blob = await compileLatexViaApi(texSource);
                    if (cancelled || currentId !== generationId.current) return;
                    url = await blobToImage(blob, 1.5);
                } else if (isLatex) {
                    const texSource = customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting);
                    const blob = await compileLatexViaApi(texSource);
                    if (cancelled || currentId !== generationId.current) return;
                    url = await blobToImage(blob, 1.5);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const component = getPDFTemplateComponent(effectiveData as any, isCoverLetter ? 'coverletter' : 'resume', isCoverLetter ? docData as any : undefined);
                    url = await pdfToImage(component, 1.5);
                }

                if (cancelled || currentId !== generationId.current) return;

                if (url) {
                    setImageUrl(url);
                    setHasError(false);
                    // Store in cache for next visit (fire-and-forget)
                    if (cacheKey) setCachedThumbnail(cacheKey, url);
                } else {
                    setHasError(true);
                }
            } catch (err) {
                if (cancelled || currentId !== generationId.current) return;
                console.error(`[PDFThumbnail] Generation failed for template ${templateId}:`, err, {
                    isCoverLetter,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    dataTitle: (docData as any)?.basics?.name || (docData as any)?.company || 'Unknown'
                });
                setHasError(true);
            } finally {
                if (!cancelled && currentId === generationId.current) {
                    setIsLoading(false);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fingerprint, cacheKey]);

    // ── Shared container: letter-page aspect ratio, full page visible ──
    const containerStyle: React.CSSProperties = {
        width: '100%',
        aspectRatio: '8.5 / 11',
        position: 'relative',
        backgroundColor: 'white',
        overflow: 'hidden',
    };

    if (isLoading && !imageUrl) {
        return (
            <div style={containerStyle} className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#e5e7eb', borderTopColor: 'var(--accent, #3b82f6)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#9ca3af' }}>
                        {isLatexTemplate(templateId) ? 'Compiling...' : 'Generating...'}
                    </span>
                </div>
            </div>
        );
    }

    if (hasError && !imageUrl) {
        return (
            <div style={containerStyle} className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                        {isLatexTemplate(templateId) ? 'LaTeX compilation failed' : 'Preview unavailable'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`Template ${templateId} preview`}
                    // object-contain so the full first page is always visible (no cutoff)
                    className="absolute inset-0 w-full h-full object-contain object-top block"
                    draggable={false}
                />
            )}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[1]">
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#e5e7eb', borderTopColor: 'var(--accent, #3b82f6)' }} />
                </div>
            )}
        </div>
    );
});
