import pako from 'pako';
import type { ResumeData } from '../../types';

/**
 * Key mapping for JSON compression (abbreviations to save space)
 */
const KEY_MAP: Record<string, string> = {
    // Top-level
    basics: 'ba',
    education: 'ed',
    work: 'wo',
    skills: 'sk',
    projects: 'pr',
    awards: 'aw',
    customSections: 'cs',
    sections: 'sec',
    selectedTemplate: 'st',
    formatting: 'fo',

    // Basics
    name: 'n',
    email: 'e',
    phone: 'p',
    address: 'a',
    summary: 's',
    websites: 'w',
    url: 'u',

    // Work / Education / Projects
    company: 'c',
    position: 'po',
    location: 'l',
    startDate: 'sd',
    endDate: 'ed',
    bullets: 'b',
    institution: 'i',
    degree: 'd',
    field: 'f',
    graduationDate: 'gd',
    gpa: 'g',
    description: 'de',
    name_proj: 'np',

    // Skills
    category: 'ca',
    items: 'it',

    // Projects
    keywords: 'k',
    urlName: 'un',

    // Awards
    title: 't',
    awarder: 'ar',
    date: 'da',

    // Custom Sections
    id: 'id',
    type: 'ty',

    // Formatting (Very many keys, only common ones)
    fontFamily: 'ff',
    baseFontSize: 'bfs',
    lineSpacing: 'ls',
    sectionSpacing: 'ss',
    paragraphSpacing: 'ps',
};

// Inverse map for decoding
const REVERSE_MAP: Record<string, string> = Object.entries(KEY_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

/**
 * Apply key mapping to an object recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyKeyMapping(obj: unknown, map: Record<string, string>): any {
    if (Array.isArray(obj)) {
        return obj.map(item => applyKeyMapping(item, map));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: Record<string, unknown> = {};
        Object.entries(obj).forEach(([k, v]) => {
            const newKey = map[k] || k;
            newObj[newKey] = applyKeyMapping(v, map);
        });
        return newObj;
    }
    return obj;
}

/**
 * Compact a ResumeData object by removing empty strings, empty arrays, and nulls.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compactResumeData(data: unknown): any {
    if (Array.isArray(data)) {
        return data
            .map(v => compactResumeData(v))
            .filter(v => {
                if (v === null || v === undefined || v === '') return false;
                if (Array.isArray(v) && v.length === 0) return false;
                if (typeof v === 'object' && Object.keys(v).length === 0) return false;
                return true;
            });
    } else if (data !== null && typeof data === 'object') {
        const newObj: Record<string, unknown> = {};
        Object.entries(data).forEach(([k, v]) => {
            const compacted = compactResumeData(v);
            if (compacted !== null && compacted !== undefined && compacted !== '') {
                if (Array.isArray(compacted) && compacted.length === 0) return;
                if (typeof compacted === 'object' && Object.keys(compacted).length === 0) return;
                newObj[k] = compacted;
            }
        });
        return newObj;
    }
    return data;
}

/**
 * Compress & base64url-encode a ResumeData object for URL sharing.
 */
export function encodeResumeForUrl(resumeData: ResumeData): string {
    // Strip formatting, template, and sections to keep share URLs short
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { formatting, selectedTemplate, sections, ...cleanData } = resumeData;
    const compacted = compactResumeData(cleanData);
    const mapped = applyKeyMapping(compacted, KEY_MAP);

    const json = JSON.stringify(mapped);
    const compressed = pako.deflate(new TextEncoder().encode(json), { level: 9 });
    let base64 = btoa(String.fromCharCode(...compressed));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

/**
 * Decode a base64url-encoded resume string back to ResumeData.
 */
export function decodeResumeFromUrl(encoded: string): ResumeData | null {
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) base64 += '=';

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const decompressed = pako.inflate(bytes);
        const json = new TextDecoder().decode(decompressed);
        const rawData = JSON.parse(json);

        // Reverse key mapping
        const data = applyKeyMapping(rawData, REVERSE_MAP) as ResumeData;

        // Basic validation
        if (!data.basics || !data.sections || !Array.isArray(data.sections)) {
            return null;
        }

        return data;
    } catch (e) {
        console.warn('Failed to decode shared resume data:', e);
        return null;
    }
}

// ── Short-link via server-side Proxy (Next.js) ──

/**
 * Upload compressed resume data to our proxy API which then calls dpaste.org.
 * This bypasses browser CORS restrictions.
 */
export async function buildShareUrl(resumeData: ResumeData): Promise<string> {
    const encoded = encodeResumeForUrl(resumeData);
    
    try {
        // Find the API URL - in development it's likely on port 3000
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiBase = isDev ? 'http://localhost:3000' : '';
        
        const response = await fetch(`${apiBase}/api/share`, {
            method: 'POST',
            body: JSON.stringify({ content: encoded }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Proxy API returned ${response.status}`);
        }

        const data = await response.json();
        const pasteId = data.id;
        
        // Build our short share URL: site.com/?s=AbCdE
        const base = window.location.origin + window.location.pathname;
        return `${base}?s=${pasteId}`;
    } catch (error) {
        console.warn('Share proxy failed, falling back to inline URL:', error);
        // Fallback to inline (long) URL
        const base = window.location.origin + window.location.pathname;
        return `${base}?data=${encoded}`;
    }
}

/**
 * Fetch resume data from dpaste.org (raw)
 * This might still have CORS issues if dpaste doesn't allow raw GET from browser,
 * but typically raw endpoints are more permissive.
 */
export async function fetchFromShortLink(pasteId: string): Promise<ResumeData | null> {
    try {
        const response = await fetch(`https://dpaste.org/${pasteId}/raw`);
        if (!response.ok) {
            throw new Error(`dpaste.org returned ${response.status}`);
        }
        const encoded = (await response.text()).trim();
        return decodeResumeFromUrl(encoded);
    } catch (error) {
        console.warn('Failed to fetch from short link:', error);
        return null;
    }
}
