/**
 * Generates consistent document filenames and titles.
 *
 * Resume:        John_Doe_Resume_2026.pdf
 * Cover Letter:  John_Doe_Software_Engineer_CoverLetter_2026.pdf
 *
 * Falls back gracefully when fields are empty.
 */

function sanitize(str: string): string {
    return str.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
}

interface NamingInput {
    userName: string;           // e.g. "John Doe"
    documentType: 'resume' | 'coverletter';
    jobTitle?: string;          // cover-letter position
    year?: number;              // defaults to current year
}

export function generateDocumentFileName(input: NamingInput): string {
    const { userName, documentType, jobTitle, year } = input;
    const y = year ?? new Date().getFullYear();

    const parts: string[] = [];

    if (userName) parts.push(sanitize(userName));

    if (jobTitle) parts.push(sanitize(jobTitle));

    parts.push(documentType === 'coverletter' ? 'CoverLetter' : 'Resume');

    parts.push(String(y));

    return parts.join('_') || (documentType === 'coverletter' ? 'CoverLetter' : 'Resume');
}

/** Human-readable title for PDF metadata (shown in browser PDF viewer tab). */
export function generateDocumentTitle(input: NamingInput): string {
    const { userName, documentType, jobTitle } = input;

    const parts: string[] = [];

    if (userName) parts.push(userName);
    if (jobTitle) parts.push(jobTitle);
    parts.push(documentType === 'coverletter' ? 'Cover Letter' : 'Resume');

    return parts.join(' - ') || (documentType === 'coverletter' ? 'Cover Letter' : 'Resume');
}
