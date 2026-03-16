import type { CustomTemplate, FormattingOptions, PreloadedTemplateId, ResumeData, TemplateId } from '../../types';

/**
 * Check if a template ID refers to a custom template (>= 100).
 */
export function isCustomTemplate(templateId: TemplateId): boolean {
    return templateId >= 100;
}

/**
 * Resolve a template ID to its base preloaded template ID (1-9, 11-14).
 * For preloaded templates, returns the ID unchanged.
 * For custom templates, looks up the baseTemplateId.
 */
export function getBaseTemplateId(
    templateId: TemplateId,
    customTemplates: CustomTemplate[]
): PreloadedTemplateId {
    if (!isCustomTemplate(templateId)) {
        return templateId as PreloadedTemplateId;
    }

    const custom = customTemplates.find((t) => t.id === templateId);
    if (custom) {
        return custom.baseTemplateId;
    }

    // Fallback to Classic if custom template not found
    return 1;
}

/**
 * Get the effective formatting for rendering.
 * If the active template is custom, returns the custom template's formatting.
 * Otherwise returns the resume's formatting as-is.
 */
export function getEffectiveFormatting(
    resumeData: ResumeData,
    customTemplates: CustomTemplate[]
): FormattingOptions {
    if (!isCustomTemplate(resumeData.selectedTemplate)) {
        return resumeData.formatting;
    }

    const custom = customTemplates.find((t) => t.id === resumeData.selectedTemplate);
    if (custom) {
        return custom.formatting;
    }

    return resumeData.formatting;
}

/**
 * Build resume data with effective formatting applied (for rendering).
 */
export function getEffectiveResumeData(
    resumeData: ResumeData,
    customTemplates: CustomTemplate[]
): ResumeData {
    const formatting = getEffectiveFormatting(resumeData, customTemplates);
    const baseId = getBaseTemplateId(resumeData.selectedTemplate, customTemplates);

    return {
        ...resumeData,
        selectedTemplate: baseId,
        formatting,
    };
}
