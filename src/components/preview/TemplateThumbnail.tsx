import { PDFThumbnail } from './PDFThumbnail';
import type { TemplateId, ResumeData, CoverLetterData } from '../../types';

interface TemplateThumbnailProps {
    templateId: TemplateId;
    previewData?: ResumeData | CoverLetterData;
    isCoverLetter?: boolean;
    /**
     * When provided, the rendered image is cached in IndexedDB under this key
     * and loaded instantly on subsequent visits.
     * Use a stable key like `thumb-v2-{templateId}-{density}` for default templates.
     * Omit for live "your data" previews.
     */
    cacheKey?: string;
}

/**
 * TemplateThumbnail renders a high-fidelity preview of a resume template.
 * Powered by the actual PDF template rendered to canvas via pdfjs-dist.
 * Cached previews (cacheKey prop) load instantly from IndexedDB.
 */
export function TemplateThumbnail({ templateId, previewData, isCoverLetter, cacheKey }: TemplateThumbnailProps) {
    return (
        <div className="w-full relative overflow-hidden bg-white select-none pointer-events-none">
            <PDFThumbnail templateId={templateId} previewData={previewData} isCoverLetter={isCoverLetter} cacheKey={cacheKey} />
        </div>
    );
}
