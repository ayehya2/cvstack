/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from 'react';
import type { ResumeData, CoverLetterData, DocumentType } from '../../types';

import { ClassicPDFTemplate } from '../../templates/resume/ClassicPDFTemplate';
import { ModernPDFTemplate } from '../../templates/resume/ModernPDFTemplate';
import { MinimalPDFTemplate } from '../../templates/resume/MinimalPDFTemplate';
import { ExecutivePDFTemplate } from '../../templates/resume/ExecutivePDFTemplate';
import { CreativePDFTemplate } from '../../templates/resume/CreativePDFTemplate';
import { TechnicalPDFTemplate } from '../../templates/resume/TechnicalPDFTemplate';
import { ElegantPDFTemplate } from '../../templates/resume/ElegantPDFTemplate';
import { CompactPDFTemplate } from '../../templates/resume/CompactPDFTemplate';
import { AcademicPDFTemplate } from '../../templates/resume/AcademicPDFTemplate';
import { CoverLetterPDFTemplate } from '../../templates/cover-letter/CoverLetterPDFTemplate';

/**
 * All LaTeX template IDs.
 * 11-14 = Resume, 21-23 = Cover Letter
 */
export const LATEX_TEMPLATE_IDS = [11, 12, 13, 14, 21, 22] as const;

/**
 * Check if a template ID corresponds to a real LaTeX template.
 */
export function isLatexTemplate(templateId: number): boolean {
    return (LATEX_TEMPLATE_IDS as readonly number[]).includes(templateId);
}

/**
 * Single source of truth for mapping a template ID to its PDF component.
 * NOTE: Do NOT call this with LaTeX template IDs — LaTeX templates use
 * the LaTeX API compiler instead of React PDF components.
 */
export function getPDFTemplateComponent(
    effectiveData: ResumeData,
    documentType: DocumentType,
    coverLetterData?: CoverLetterData,
    documentTitle?: string
): ReactElement {
    if (documentType === 'coverletter' && coverLetterData) {
        return (
            <CoverLetterPDFTemplate
                data={coverLetterData}
                documentTitle={documentTitle}
                templateId={effectiveData.selectedTemplate}
            />
        );
    }

    switch (effectiveData.selectedTemplate) {
        case 1: return <ClassicPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 2: return <ModernPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 3: return <MinimalPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 4: return <ExecutivePDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 5: return <CreativePDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 6: return <TechnicalPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 7: return <ElegantPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 8: return <CompactPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        case 9: return <AcademicPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
        default: return <ClassicPDFTemplate data={effectiveData} documentTitle={documentTitle} />;
    }
}
