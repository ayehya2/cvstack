import type { FontFamily, BulletStyle, ColorTheme, SectionDivider, Spacing, FormattingOptions } from '../../types';
import type { CSSProperties } from 'react';

// Font family CSS mapping
export function getFontFamilyCSS(fontFamily: FontFamily): string {
    const fontMap: Record<FontFamily, string> = {
        default: '"Times New Roman", Times, serif',
        times: '"Times New Roman", Times, serif',
        arial: 'Arial, Helvetica, sans-serif',
        calibri: 'Calibri, sans-serif',
        georgia: 'Georgia, serif',
        helvetica: 'Helvetica, Arial, sans-serif',
        palatino: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
        garamond: 'Garamond, serif',
        cambria: 'Cambria, serif',
        bookAntiqua: '"Book Antiqua", Palatino, serif',
        centurySchoolbook: '"Century Schoolbook", serif',
    };
    return fontMap[fontFamily] || fontMap.default;
}

// Bullet symbol mapping
export function getBulletSymbol(bulletStyle: BulletStyle): string {
    const bulletMap: Record<BulletStyle, string> = {
        bullet: '•',
        dash: '-',
        arrow: '→',
        circle: '○',
        square: '■',
        diamond: '◆',
        star: '★',
        chevron: '›',
    };
    return bulletMap[bulletStyle] || '•';
}

// Color theme values
export function getColorValue(theme: ColorTheme, customColor: string): string {
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

// Section divider style
export function getSectionDividerStyle(divider: SectionDivider): CSSProperties {
    const baseStyle: CSSProperties = {
        borderBottom: 'none',
        paddingBottom: '2pt',
    };

    switch (divider) {
        case 'line':
            return { ...baseStyle, borderBottom: '1.5pt solid currentColor' };
        case 'double':
            return { ...baseStyle, borderBottom: '3pt double currentColor' };
        case 'thick':
            return { ...baseStyle, borderBottom: '2.5pt solid currentColor' };
        case 'dotted':
            return { ...baseStyle, borderBottom: '1.5pt dotted currentColor' };
        case 'dashed':
            return { ...baseStyle, borderBottom: '1.5pt dashed currentColor' };
        case 'none':
        default:
            return baseStyle;
    }
}

// Spacing to pixels/points
export function getSpacingValue(spacing: Spacing): string {
    const spacingMap: Record<Spacing, string> = {
        tight: '6pt',
        normal: '12pt',
        relaxed: '18pt',
        spacious: '24pt',
    };
    return spacingMap[spacing] || '12pt';
}

// Bullet indentation to inches
export function getBulletIndentValue(indent: import('../../types').BulletIndent): string {
    const indentMap = {
        none: '0',
        small: '0.2in',
        medium: '0.4in',
        large: '0.6in',
    };
    return indentMap[indent] || '0';
}

// Name size to pt
export function getNameSize(nameSize: import('../../types').NameSize): string {
    const sizeMap = {
        huge: '28pt',
        large: '22pt',
        large2: '20pt',
        normal: '18pt',
    };
    return sizeMap[nameSize] || '22pt';
}

// Section title size to pt
export function getSectionTitleSize(size: import('../../types').SectionTitleSize): string {
    const sizeMap = {
        large: '16pt',
        normal: '14pt',
        small: '12pt',
    };
    return sizeMap[size] || '14pt';
}

// Entry spacing to pt
export function getEntrySpacingValue(spacing: Spacing): string {
    const spacingMap: Record<Spacing, string> = {
        tight: '4pt',
        normal: '8pt',
        relaxed: '14pt',
        spacious: '20pt',
    };
    return spacingMap[spacing] || '8pt';
}

// Bullet gap to pt
export function getBulletGapValue(gap: string): string {
    return gap || '4pt';
}

// Section header case
export function getSectionHeaderCase(style: 'uppercase' | 'capitalize' | 'normal'): CSSProperties['textTransform'] {
    const styleMap: Record<string, CSSProperties['textTransform']> = {
        uppercase: 'uppercase',
        capitalize: 'capitalize',
        normal: 'none'
    };
    return styleMap[style] || 'uppercase';
}

// Apply formatting to template
export function applyFormattingStyles(formatting: FormattingOptions): CSSProperties {
    return {
        fontFamily: getFontFamilyCSS(formatting.fontFamily),
        textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle),
        fontSize: formatting.baseFontSize,
        lineHeight: formatting.lineSpacing,
        padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
        color: getColorValue(formatting.colorTheme, formatting.customColor),
    };
}

// Formatting presets
export const formattingPresets: Record<string, Partial<FormattingOptions>> = {
    classical: {
        fontFamily: 'times',
        baseFontSize: '11pt',
        nameSize: 'large',
        lineSpacing: '1.15',
        sectionSpacing: 'normal',
        bulletStyle: 'bullet',
        colorTheme: 'black',
        sectionDividers: 'line',
        headerAlignment: 'center',
    },
    modern: {
        fontFamily: 'calibri',
        baseFontSize: '11pt',
        nameSize: 'huge',
        lineSpacing: '1.2',
        sectionSpacing: 'relaxed',
        bulletStyle: 'square',
        colorTheme: 'darkblue',
        sectionDividers: 'thick',
        headerAlignment: 'left',
    },
    minimal: {
        fontFamily: 'arial',
        baseFontSize: '10pt',
        nameSize: 'large2',
        lineSpacing: '1.0',
        sectionSpacing: 'tight',
        bulletStyle: 'dash',
        colorTheme: 'black',
        sectionDividers: 'none',
        headerAlignment: 'left',
    },
    bold: {
        fontFamily: 'helvetica',
        baseFontSize: '12pt',
        nameSize: 'huge',
        lineSpacing: '1.3',
        sectionSpacing: 'spacious',
        bulletStyle: 'star',
        colorTheme: 'maroon',
        sectionDividers: 'double',
        headerAlignment: 'center',
    },
};

export const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Sub-header weight (company/institution names)
export function getSubHeaderWeight(weight: import('../../types').SubHeaderWeight): string {
    const weightMap = {
        normal: '400',
        medium: '500',
        bold: '700',
    };
    return weightMap[weight] || '700';
}

// Skill item separator
export function getSkillSeparator(layout: import('../../types').SkillLayout): string {
    const separatorMap = {
        comma: ', ',
        pipe: ' | ',
        'inline-tags': ', ', // tags layout uses different rendering, separator is fallback
    };
    return separatorMap[layout] || ', ';
}
// Date formatting (best effort)
export function formatDate(dateStr: string, format: import('../../types').DateFormat): string {
    if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'currently') {
        return dateStr;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date: Date | null = null;

    // Try parsing
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        date = parsed;
    } else {
        // Handle YYYY
        if (/^\d{4}$/.test(dateStr)) {
            date = new Date(parseInt(dateStr), 0, 1);
        }
        // Handle MM/YYYY
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

// Body text font-weight mapping
export function getBodyTextWeight(weight: import('../../types').BodyTextWeight): string {
    const weightMap = {
        light: '300',
        normal: '400',
        medium: '500',
    };
    return weightMap[weight] || '400';
}

// Paragraph spacing (margin between paragraphs)
export function getParagraphSpacingValue(spacing: Spacing): string {
    const spacingMap: Record<Spacing, string> = {
        tight: '2pt',
        normal: '6pt',
        relaxed: '10pt',
        spacious: '16pt',
    };
    return spacingMap[spacing] || '6pt';
}

// Section title spacing (margin above section titles)
export function getSectionTitleSpacingValue(spacing: Spacing): string {
    const spacingMap: Record<Spacing, string> = {
        tight: '4pt',
        normal: '8pt',
        relaxed: '14pt',
        spacious: '20pt',
    };
    return spacingMap[spacing] || '8pt';
}

// Date separator character
export function getDateSeparatorChar(separator: import('../../types').DateSeparator): string {
    return ` ${separator} `;
}
