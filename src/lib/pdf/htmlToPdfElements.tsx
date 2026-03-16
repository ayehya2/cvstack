import { createElement, type ReactNode } from 'react';

/**
 * Check if a string contains HTML tags (heuristic).
 */
export function containsHtml(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Parse simple HTML into React-PDF elements.
 * Supports: <strong>, <em>, <u>, <s>, <a>, <p>, <ul>, <ol>, <li>, <br>.
 * Falls back to plain text for unknown tags.
 */
export function htmlToPdfElements(
    html: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TextComponent: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ViewComponent?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LinkComponent?: any
): ReactNode[] {
    if (!html) return [];

    // Strip wrapping <p> tags for simpler bullet rendering
    const cleaned = html
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '')
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '')
        .replace(/<br\s*\/?>/g, '\n');

    return parseNodes(cleaned, TextComponent, ViewComponent, LinkComponent);
}

function parseNodes(
    html: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Text: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    View?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link?: any,
    keyPrefix = ''
): ReactNode[] {
    const parts: ReactNode[] = [];
    let remaining = html;
    let idx = 0;

    while (remaining.length > 0) {
        const tagMatch = remaining.match(/^<(strong|em|u|s|a|ul|ol|li)(\s[^>]*)?\s*>/i);

        if (!tagMatch) {
            // Find next tag or end
            const nextTag = remaining.indexOf('<');
            if (nextTag === -1 || nextTag === remaining.length) {
                // No more tags — rest is plain text
                if (remaining.trim()) {
                    parts.push(remaining);
                }
                break;
            }
            if (nextTag > 0) {
                parts.push(remaining.slice(0, nextTag));
                remaining = remaining.slice(nextTag);
                continue;
            }

            // Unknown tag — skip it
            const closeAngle = remaining.indexOf('>', 1);
            if (closeAngle === -1) {
                parts.push(remaining);
                break;
            }
            remaining = remaining.slice(closeAngle + 1);
            continue;
        }

        const tagName = tagMatch[1].toLowerCase();
        const attrs = tagMatch[2] || '';
        remaining = remaining.slice(tagMatch[0].length);

        // Find closing tag
        const closeTag = `</${tagName}>`;
        const closeIdx = findClosingTag(remaining, tagName);
        if (closeIdx === -1) {
            // No closing tag found — treat rest as content
            parts.push(...parseNodes(remaining, Text, View, Link, `${keyPrefix}${idx}-`));
            break;
        }

        const innerHtml = remaining.slice(0, closeIdx);
        remaining = remaining.slice(closeIdx + closeTag.length);

        const key = `${keyPrefix}${idx}`;
        const children = parseNodes(innerHtml, Text, View, Link, `${key}-`);

        switch (tagName) {
            case 'strong':
                parts.push(createElement(Text, { key, style: { fontWeight: 'bold' } }, ...children));
                break;
            case 'em':
                parts.push(createElement(Text, { key, style: { fontStyle: 'italic' } }, ...children));
                break;
            case 'u':
                parts.push(createElement(Text, { key, style: { textDecoration: 'underline' } }, ...children));
                break;
            case 's':
                parts.push(createElement(Text, { key, style: { textDecoration: 'line-through' } }, ...children));
                break;
            case 'a': {
                const hrefMatch = attrs.match(/href="([^"]*)"/);
                const href = hrefMatch ? hrefMatch[1] : '';
                if (Link) {
                    parts.push(createElement(Link, { key, src: href, style: { color: '#0066cc', textDecoration: 'underline' } }, ...children));
                } else {
                    parts.push(createElement(Text, { key, style: { color: '#0066cc', textDecoration: 'underline' } }, ...children));
                }
                break;
            }
            case 'ul':
            case 'ol':
                // Render as plain View with bullet items
                if (View) {
                    parts.push(createElement(View, { key }, ...children));
                } else {
                    parts.push(...children);
                }
                break;
            case 'li':
                if (View) {
                    parts.push(
                        createElement(View, { key, style: { flexDirection: 'row', marginLeft: 10, marginBottom: 2 } },
                            createElement(Text, { style: { marginRight: 4 } }, '•'),
                            createElement(Text, { style: { flex: 1 } }, ...children)
                        )
                    );
                } else {
                    parts.push(createElement(Text, { key }, '• ', ...children));
                }
                break;
        }
        idx++;
    }

    return parts;
}

/**
 * Find the position of the matching closing tag, handling nesting.
 */
function findClosingTag(html: string, tagName: string): number {
    const openTag = new RegExp(`<${tagName}(\\s[^>]*)?>`, 'gi');
    const closeStr = `</${tagName}>`;
    let depth = 1;
    let pos = 0;

    while (pos < html.length && depth > 0) {
        const nextClose = html.indexOf(closeStr, pos);
        if (nextClose === -1) return -1;

        // Count opens between pos and nextClose
        const segment = html.slice(pos, nextClose);
        const opens = segment.match(openTag);
        depth += (opens ? opens.length : 0) - 1;

        if (depth <= 0) return nextClose;
        pos = nextClose + closeStr.length;
    }

    return -1;
}
