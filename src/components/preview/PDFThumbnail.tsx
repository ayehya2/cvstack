import { useState, useEffect, useRef, memo } from 'react';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/stores/coverLetterStore';
import { useCustomTemplateStore } from '../../lib/stores/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/utils/templateResolver';
import { getPDFTemplateComponent, isLatexTemplate } from '../../lib/pdf/pdfTemplateMap';
import { pdfToImage, blobToImage } from '../../lib/pdf/pdfToImage';
import { generateLaTeXFromData, generateLaTeXCoverLetter } from '../../lib/latex/latexGenerator';
import { compileLatexViaApi } from '../../lib/latex/latexApiCompiler';
import type { TemplateId, ResumeData, CoverLetterData } from '../../types';

interface PDFThumbnailProps {
    templateId: TemplateId;
    previewData?: ResumeData | CoverLetterData;
    isCoverLetter?: boolean;
}

/**
 * PDFThumbnail generates a high-fidelity thumbnail image from the actual PDF
 * template. For LaTeX templates, it compiles via the real pdfTeX API.
 * Debounces re-renders (~600ms for non-LaTeX, ~1200ms for LaTeX due to API latency).
 */
export const PDFThumbnail = memo(function PDFThumbnail({ templateId, previewData, isCoverLetter }: PDFThumbnailProps) {
    const resumeStore = useResumeStore();
    const coverLetterStore = useCoverLetterStore();

    const docData = previewData || (isCoverLetter ? coverLetterStore.coverLetterData : resumeStore.resumeData);
    const { customLatexSource, latexFormatting } = isCoverLetter
        ? { customLatexSource: '', latexFormatting: undefined } // CL doesn't have custom latex yet
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

        // Longer debounce for LaTeX to avoid hammering the API
        const debounceMs = isLatex ? 1200 : 600;

        const timer = setTimeout(async () => {
            if (currentId !== generationId.current) return;

            setIsLoading(true);
            setHasError(false);

            try {
                let url: string | null = null;

                if (isLatexCoverLetter) {
                    // LaTeX cover letter compilation via API
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const texSource = generateLaTeXCoverLetter(docData as any, templateId);
                    const blob = await compileLatexViaApi(texSource);
                    if (currentId !== generationId.current) return;
                    url = await blobToImage(blob, 1.5);
                } else if (isLatex) {
                    // Real LaTeX resume compilation via API
                    const texSource = customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting);
                    const blob = await compileLatexViaApi(texSource);
                    if (currentId !== generationId.current) return;
                    url = await blobToImage(blob, 1.5);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const component = getPDFTemplateComponent(effectiveData as any, isCoverLetter ? 'coverletter' : 'resume', isCoverLetter ? docData as any : undefined);
                    url = await pdfToImage(component, 1.5);
                }

                if (currentId !== generationId.current) return;

                if (url) {
                    setImageUrl(url);
                    setHasError(false);
                } else {
                    setHasError(true);
                }
            } catch (err) {
                if (currentId !== generationId.current) return;
                console.error(`[PDFThumbnail] Generation failed for template ${templateId}:`, err, {
                    isCoverLetter,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    dataTitle: (docData as any)?.basics?.name || (docData as any)?.company || 'Unknown'
                });
                setHasError(true);
            } finally {
                if (currentId === generationId.current) {
                    setIsLoading(false);
                }
            }
        }, debounceMs);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fingerprint]);

    if (isLoading && !imageUrl) {
        return (
            <div className="w-full aspect-[3/4] max-h-[280px] min-h-[140px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'white' }}>
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
            <div className="w-full aspect-[3/4] max-h-[280px] min-h-[140px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'white' }}>
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                        {isLatexTemplate(templateId) ? 'LaTeX compilation failed' : 'Preview unavailable'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full aspect-[3/4] max-h-[280px] min-h-[140px] relative bg-white overflow-hidden">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`Template ${templateId} preview`}
                    className="absolute inset-0 w-full h-full object-cover object-top block"
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
