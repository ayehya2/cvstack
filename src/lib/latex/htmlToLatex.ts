/**
 * Convert simple HTML to LaTeX.
 * Supports: <strong>, <em>, <u>, <s>, <a>, <p>, <ul>, <ol>, <li>, <br>.
 */

/**
 * Escape special LaTeX characters (same logic as latexGenerator).
 */
function escapeLatexChars(text: string): string {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}]/g, '\\$&')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/</g, '\\textless{}')
        .replace(/>/g, '\\textgreater{}');
}

/**
 * Check if string contains HTML tags.
 */
export function containsHtml(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Convert an HTML string to LaTeX.
 */
export function htmlToLatex(html: string): string {
    if (!html) return '';

    // Strip wrapping <p> and convert <br> to newlines
    let result = html
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\\\\\n');

    // Bold
    result = result.replace(/<strong>([\s\S]*?)<\/strong>/gi, (_, content) => {
        return `\\textbf{${processInner(content)}}`;
    });

    // Italic
    result = result.replace(/<em>([\s\S]*?)<\/em>/gi, (_, content) => {
        return `\\textit{${processInner(content)}}`;
    });

    // Underline
    result = result.replace(/<u>([\s\S]*?)<\/u>/gi, (_, content) => {
        return `\\underline{${processInner(content)}}`;
    });

    // Strikethrough
    result = result.replace(/<s>([\s\S]*?)<\/s>/gi, (_, content) => {
        return `\\sout{${processInner(content)}}`;
    });

    // Links
    result = result.replace(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
        return `\\href{${href}}{${processInner(content)}}`;
    });

    // Lists
    result = result.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, content) => {
        const items = content.replace(/<li>([\s\S]*?)<\/li>/gi, (_: string, itemContent: string) => {
            return `  \\item ${processInner(itemContent)}`;
        });
        return `\\begin{itemize}\n${items}\n\\end{itemize}`;
    });

    result = result.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, content) => {
        const items = content.replace(/<li>([\s\S]*?)<\/li>/gi, (_: string, itemContent: string) => {
            return `  \\item ${processInner(itemContent)}`;
        });
        return `\\begin{enumerate}\n${items}\n\\end{enumerate}`;
    });

    // Strip any remaining HTML tags
    result = result.replace(/<[^>]+>/g, '');

    // Escape remaining plain text characters (but not LaTeX commands we already inserted)
    // This is done selectively to avoid double-escaping
    result = result
        .replace(/&amp;/g, '\\&')
        .replace(/&lt;/g, '\\textless{}')
        .replace(/&gt;/g, '\\textgreater{}');

    return result.trim();
}

/**
 * Process inner HTML content recursively by calling htmlToLatex on it.
 * This handles nested formatting like <strong><em>text</em></strong>.
 */
function processInner(html: string): string {
    if (containsHtml(html)) {
        return htmlToLatex(html);
    }
    return escapeLatexChars(html);
}
