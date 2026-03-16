/**
 * Migrate markdown-formatted strings to HTML.
 * Converts **bold** → <strong>bold</strong> and *italic* → <em>italic</em>.
 * Safe to run on strings that are already HTML (they just pass through).
 */

/**
 * Convert markdown-style formatting to HTML.
 */
export function migrateMarkdownToHtml(text: string): string {
    if (!text) return text;

    // If it already contains HTML tags, assume it's already migrated
    if (/<[a-z][\s\S]*>/i.test(text)) return text;

    // Convert **bold** or __bold__ to <strong>
    let result = text.replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>');

    // Convert *italic* or _italic_ to <em>
    result = result.replace(/(\*|_)(.+?)\1/g, '<em>$2</em>');

    return result;
}

/**
 * Migrate all text fields in a resume data object.
 * Modifies the object in-place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateResumeMarkdown(data: any): void {
    // Basics summary
    if (data.basics?.summary) {
        data.basics.summary = migrateMarkdownToHtml(data.basics.summary);
    }

    // Work bullets
    if (data.work && Array.isArray(data.work)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.work.forEach((job: any) => {
            if (job.bullets && Array.isArray(job.bullets)) {
                job.bullets = job.bullets.map((b: string) => migrateMarkdownToHtml(b));
            }
        });
    }

    // Project bullets
    if (data.projects && Array.isArray(data.projects)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.projects.forEach((project: any) => {
            if (project.bullets && Array.isArray(project.bullets)) {
                project.bullets = project.bullets.map((b: string) => migrateMarkdownToHtml(b));
            }
        });
    }

    // Award summaries
    if (data.awards && Array.isArray(data.awards)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.awards.forEach((award: any) => {
            if (award.summary) {
                award.summary = migrateMarkdownToHtml(award.summary);
            }
        });
    }

    // Education descriptions
    if (data.education && Array.isArray(data.education)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.education.forEach((edu: any) => {
            if (edu.description) {
                edu.description = migrateMarkdownToHtml(edu.description);
            }
        });
    }

    // Custom section bullets
    if (data.customSections && Array.isArray(data.customSections)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.customSections.forEach((section: any) => {
            if (section.items && Array.isArray(section.items)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                section.items.forEach((item: any) => {
                    if (item.bullets && Array.isArray(item.bullets)) {
                        item.bullets = item.bullets.map((b: string) => migrateMarkdownToHtml(b));
                    }
                });
            }
        });
    }
}
