import type { FormattingOptions, FontFamily, BulletStyle, ColorTheme, BodyTextWeight, Spacing, DateSeparator, SectionTitleSize, NameSize, BulletIndent, SectionDivider, SkillLayout, DateFormat, SubHeaderWeight } from '../../types';
import { Font } from '@react-pdf/renderer';
import React from 'react';
import { Text } from '@react-pdf/renderer';

/**
 * Convert simple HTML (strong, em, u, s) into React-PDF <Text> elements.
 * Supports NESTED tags: <strong><em><u>text</u></em></strong>
 * Used for rendering skill items and other HTML-containing fields in PDFs.
 */
export function renderHtmlText(html: string, baseStyle?: React.CSSProperties): React.ReactNode {
    if (!html) return html;

    // Strip wrapping <p> and </p> tags from RTE output, also <br> tags
    const cleaned = html
        .replace(/<p>/gi, '')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*\/?>/gi, ' ')
        .trim();

    if (!cleaned.includes('<')) {
        // No HTML tags — return plain text
        return cleaned;
    }

    // Recursive parser
    let keyCounter = 0;

    function parseHtml(input: string, inheritedStyle: Record<string, unknown>): React.ReactNode[] {
        const segments: React.ReactNode[] = [];
        // Match outermost tags greedily by finding matching open/close pairs
        const tagRegex = /<(strong|b|em|i|u|s)>([\s\S]*?)<\/\1>/gi;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        tagRegex.lastIndex = 0;

        while ((match = tagRegex.exec(input)) !== null) {
            // Add text before this tag
            if (match.index > lastIndex) {
                const before = input.substring(lastIndex, match.index);
                if (before) segments.push(before);
            }

            const tag = match[1].toLowerCase();
            const content = match[2];
            const style: Record<string, unknown> = { ...inheritedStyle };

            if (tag === 'strong' || tag === 'b') {
                style.fontWeight = 700;
            } else if (tag === 'em' || tag === 'i') {
                style.fontStyle = 'italic';
            } else if (tag === 'u') {
                style.textDecoration = 'underline';
            } else if (tag === 's') {
                style.textDecoration = 'line-through';
            }

            // Recursively parse inner content for nested tags
            if (content.includes('<')) {
                const children = parseHtml(content, style);
                segments.push(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    React.createElement(Text, { key: keyCounter++, style } as any, ...children)
                );
            } else {
                segments.push(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    React.createElement(Text, { key: keyCounter++, style } as any, content)
                );
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last tag
        if (lastIndex < input.length) {
            const remaining = input.substring(lastIndex);
            if (remaining) segments.push(remaining);
        }

        return segments;
    }

    const result = parseHtml(cleaned, baseStyle ? { ...baseStyle } : {});

    if (result.length === 0) return cleaned;
    if (result.length === 1 && typeof result[0] === 'string') return result[0];

    return result;
}

/**
 * Render an array of skill items with HTML support, joined by a separator.
 * Returns React-PDF <Text> children that can be placed inside a <Text> parent.
 */
export function renderSkillItems(items: string[], separator: string): React.ReactNode[] {
    const result: React.ReactNode[] = [];
    const filtered = items.filter(i => i.trim());
    filtered.forEach((item, idx) => {
        result.push(React.createElement(React.Fragment, { key: `item-${idx}` }, renderHtmlText(item)));
        if (idx < filtered.length - 1) {
            result.push(separator);
        }
    });
    return result;
}

/**
 * Register custom fonts for full Unicode support in PDF rendering.
 * Using .woff format (NOT .woff2 — react-pdf doesn't support woff2).
 * Fonts loaded from jsDelivr CDN (fontsource packages).
 */

// Noto Sans — for sans-serif families
Font.register({
    family: 'NotoSans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-400-normal.woff', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-700-normal.woff', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-400-italic.woff', fontWeight: 400, fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-700-italic.woff', fontWeight: 700, fontStyle: 'italic' },
    ],
});

// Noto Serif — for serif families
Font.register({
    family: 'NotoSerif',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-400-normal.woff', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-700-normal.woff', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-400-italic.woff', fontWeight: 400, fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-700-italic.woff', fontWeight: 700, fontStyle: 'italic' },
    ],
});

// Smart word hyphenation: break very long words (>20 chars) to prevent PDF overflow.
// Normal words are kept intact, but extremely long unbroken strings get split.
Font.registerHyphenationCallback((word) => {
    if (word.length <= 20) return [word];
    // Break long words into chunks of 15 characters
    const chunks: string[] = [];
    for (let i = 0; i < word.length; i += 15) {
        chunks.push(word.slice(i, i + 15));
    }
    return chunks;
});

/**
 * PDF Font Family Mapping
 * Uses registered custom fonts with full Unicode support.
 */
export function getPDFFontFamily(fontFamily: FontFamily | undefined): string {
    if (!fontFamily) return 'NotoSerif';
    const fontMap: Record<string, string> = {
        default: 'NotoSerif',
        times: 'NotoSerif',
        arial: 'NotoSans',
        calibri: 'NotoSans',
        georgia: 'NotoSerif',
        helvetica: 'NotoSans',
        palatino: 'NotoSerif',
        garamond: 'NotoSerif',
        cambria: 'NotoSerif',
        bookAntiqua: 'NotoSerif',
        centurySchoolbook: 'NotoSerif',
    };
    return fontMap[fontFamily] || 'NotoSerif';
}

/**
 * Get bullet symbol from formatting options.
 * Noto Sans/Serif fonts support these Unicode characters.
 */
export function getPDFBulletSymbol(bulletStyle: BulletStyle): string {
    const bulletMap: Record<BulletStyle, string> = {
        bullet: '\u2022',   // • (Standard bullet)
        dash: '-',          // - (Standard hyphen for better compatibility)
        arrow: '\u2192',    // →
        circle: 'o',        // o (Fallback to 'o' for circle if Unicode fails)
        square: '\u25A0',   // ■
        diamond: '\u25C6',  // ◆
        star: '*',          // * (Standard star)
        chevron: '>',       // > (Standard chevron)
    };
    return bulletMap[bulletStyle] || '\u2022';
}

/**
 * Get color value from theme  
 */
export function getPDFColorValue(theme: ColorTheme, customColor: string): string {
    const colorMap: Record<ColorTheme, string> = {
        black: '#000000',
        navy: '#001f3f',
        darkblue: '#0074D9',
        darkgreen: '#2ECC40',
        maroon: '#85144B',
        purple: '#B10DC9',
        teal: '#0D9488',
        slate: '#475569',
        burgundy: '#6B1D38',
        forest: '#166534',
        charcoal: '#333333',
        steelblue: '#4682B4',
        indigo: '#4B0082',
        coral: '#FF6347',
        olive: '#556B2F',
        custom: customColor,
    };
    return colorMap[theme] || '#000000';
}

/**
 * Get page padding from margin settings
 */
export function getPDFPagePadding(formatting: FormattingOptions): string {
    if (!formatting) return "0.6in 0.6in 0.6in 0.6in";
    return `${formatting.marginTop || '0.6'}in ${formatting.marginRight || '0.6'}in ${formatting.marginBottom || '0.6'}in ${formatting.marginLeft || '0.6'}in`;
}

/**
 * Get font size from baseFontSize (convert 11pt -> 11)
 */
export function getPDFFontSize(baseFontSize: string | undefined): number {
    if (!baseFontSize) return 11;
    return parseInt(baseFontSize.replace('pt', '')) || 11;
}

/**
 * Get name size in points
 */
export function getPDFNameSize(nameSize: NameSize): number {
    const sizeMap = {
        huge: 28,
        large: 22,
        large2: 20,
        normal: 18,
    };
    return sizeMap[nameSize] || 22;
}

/**
 * Get section title size in points
 */
export function getPDFSectionTitleSize(size: SectionTitleSize): number {
    const sizeMap = {
        large: 16,
        normal: 14,
        small: 12,
    };
    return sizeMap[size] || 14;
}

/**
 * Get line height from spacing
 */
export function getPDFLineHeight(lineSpacing: string | undefined): number {
    if (!lineSpacing) return 1.2;
    return parseFloat(lineSpacing) || 1.2;
}

/**
 * Get margin bottom for sections in points
 */
export function getPDFSectionMargin(spacing: Spacing): number {
    const spacingMap = {
        tight: 4,
        normal: 8,
        relaxed: 14,
        spacious: 20,
    };
    return spacingMap[spacing] || 8;
}

/**
 * Get margin bottom for entries (work/edu) in points
 */
export function getPDFEntrySpacing(spacing: Spacing): number {
    const spacingMap = {
        tight: 2,
        normal: 6,
        relaxed: 10,
        spacious: 16,
    };
    return spacingMap[spacing] || 6;
}

/**
 * Get gap between bullet and text in points
 */
export function getPDFBulletGap(gap: string | undefined): number {
    if (!gap) return 4;
    return parseInt(gap.replace('pt', '')) || 4;
}

/**
 * Get bullet indent in points (convert from inches)
 */
export function getPDFBulletIndent(indent: BulletIndent): number {
    const indentMap = {
        none: 0,
        small: 14,  // ~0.2in at 72dpi
        medium: 29, // ~0.4in at 72dpi
        large: 43,  // ~0.6in at 72dpi
    };
    return indentMap[indent] || 0;
}

/**
 * Helper to check if section dividers are enabled
 */
export function hasPDFSectionDivider(divider: SectionDivider): boolean {
    return divider !== 'none';
}

/**
 * Get border style for section dividers
 */
export function getPDFSectionBorderStyle(divider: SectionDivider, color: string): { borderBottom?: string; paddingBottom?: number } {
    switch (divider) {
        case 'line':
            return { borderBottom: `1.5pt solid ${color}`, paddingBottom: 2 };
        case 'double':
            return { borderBottom: `3pt double ${color}`, paddingBottom: 2 };
        case 'thick':
            return { borderBottom: `2.5pt solid ${color}`, paddingBottom: 2 };
        case 'dotted':
            return { borderBottom: `1.5pt dotted ${color}`, paddingBottom: 2 };
        case 'dashed':
            return { borderBottom: `1.5pt dashed ${color}`, paddingBottom: 2 };
        case 'none':
        default:
            return { paddingBottom: 2 };
    }
}

/**
 * Get social icon size
 */
export function getPDFSocialIconSize(baseFontSize: number): number {
    return baseFontSize + 2;
}

/**
 * Get case transformation for section headers
 */
export function getPDFSectionHeaderStyle(style: 'uppercase' | 'capitalize' | 'normal'): 'uppercase' | 'capitalize' | 'none' {
    const styleMap = {
        uppercase: 'uppercase',
        capitalize: 'capitalize',
        normal: 'none'
    };
    return (styleMap[style] || 'uppercase') as 'uppercase' | 'capitalize' | 'none';
}

/**
 * Get sub-header font family based on weight for PDF.
 * With registered custom fonts, bold is handled via fontWeight CSS property.
 */
export function getPDFSubHeaderFont(_weight: SubHeaderWeight, baseFont: string): string {
    // Custom registered fonts handle weight via fontWeight CSS property,
    // not by appending '-Bold' to the font name.
    return baseFont;
}

/**
 * Get skill separator for PDF rendering
 */
export function getPDFSkillSeparator(layout: SkillLayout): string {
    const separatorMap = {
        comma: ', ',
        pipe: ' | ',
        'inline-tags': ', ',
    };
    return separatorMap[layout] || ', ';
}
/**
 * Format date for PDF (best effort)
 */
export function getPDFDateFormat(dateStr: string, format: DateFormat): string {
    if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'currently') {
        return dateStr;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date: Date | null = null;

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        date = parsed;
    } else {
        if (/^\d{4}$/.test(dateStr)) {
            date = new Date(parseInt(dateStr), 0, 1);
        }
        const mmYyyy = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
        if (mmYyyy) {
            date = new Date(parseInt(mmYyyy[2]), parseInt(mmYyyy[1]) - 1, 1);
        }
    }

    if (!date) return dateStr;

    const mm = date.getMonth();
    const yyyy = date.getFullYear();

    switch (format) {
        case 'numeric':
            return `${(mm + 1).toString().padStart(2, '0')}/${yyyy}`;
        case 'short':
            return `${months[mm]} ${yyyy}`;
        case 'long':
            return `${fullMonths[mm]} ${yyyy}`;
        default:
            return dateStr;
    }
}

// Body text font-weight for PDF
export function getPDFBodyTextWeight(weight: BodyTextWeight): number {
    const weightMap = {
        light: 300,
        normal: 400,
        medium: 500,
    };
    return weightMap[weight] || 400;
}

// Paragraph spacing for PDF (points)
export function getPDFParagraphSpacing(spacing: Spacing): number {
    const spacingMap = {
        tight: 2,
        normal: 4,
        relaxed: 8,
        spacious: 14,
    };
    return spacingMap[spacing] || 4;
}

// Section title spacing for PDF (points, margin above title)
export function getPDFSectionTitleSpacing(spacing: Spacing): number {
    const spacingMap = {
        tight: 4,
        normal: 8,
        relaxed: 14,
        spacious: 20,
    };
    return spacingMap[spacing] || 8;
}

// Date separator character for PDF
export function getPDFDateSeparator(separator: DateSeparator): string {
    return ` ${separator} `;
}
