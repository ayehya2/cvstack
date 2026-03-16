import { createElement, type ReactNode } from 'react';
import { htmlToPdfElements, containsHtml } from './htmlToPdfElements';

/**
 * Parse **bold** and *italic* markdown syntax in text and return React elements.
 * Also supports HTML input from the rich text editor.
 */
export function parseBoldText(text: string): ReactNode[] {
    if (!text) return [text];

    // If the input contains HTML, render it directly
    if (containsHtml(text)) {
        // Strip wrapping <p> and render HTML as raw
        const cleaned = text
            .replace(/^<p>/, '').replace(/<\/p>$/, '')
            .replace(/<p>/g, '<br>').replace(/<\/p>/g, '');
        return [<span key="html" dangerouslySetInnerHTML={{ __html: cleaned }} />];
    }

    // Legacy markdown parsing
    const parts: ReactNode[] = [];
    const regex = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        if (match[1] === '**' || match[1] === '__') {
            parts.push(<strong key={match.index}>{match[2]}</strong>);
        } else if (match[3] === '*' || match[3] === '_') {
            parts.push(<em key={match.index}>{match[4]}</em>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

/**
 * Parse **bold** and *italic* markdown syntax for @react-pdf/renderer.
 * Also supports HTML input from the rich text editor.
 */
export function parseBoldTextPDF(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TextComponent: any
): ReactNode[] {
    if (!text) return [text];

    // If the input contains HTML, use the HTML-to-PDF converter
    if (containsHtml(text)) {
        return htmlToPdfElements(text, TextComponent);
    }

    // Legacy markdown parsing
    const parts: ReactNode[] = [];
    const regex = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const style: any = {};
        if (match[1] === '**' || match[1] === '__') {
            style.fontWeight = 'bold';
        } else if (match[3] === '*' || match[3] === '_') {
            style.fontStyle = 'italic';
        }

        parts.push(
            createElement(
                TextComponent,
                { key: `s-${match.index}`, style },
                match[2] || match[4]
            )
        );
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

/**
 * Strip **bold** and *italic* markers from text (for plain text contexts).
 * Also strips HTML tags if present.
 */
export function stripBoldMarkers(text: string): string {
    if (containsHtml(text)) {
        return text.replace(/<[^>]+>/g, '');
    }
    return text.replace(/(\*\*|\*)(.+?)\1/g, '$2');
}
