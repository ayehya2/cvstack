import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/**
 * Internal: Set up pdfjs-dist and return the library.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPdfjsLib(): Promise<any> {
    if (typeof window === 'undefined') return null;

    // Check window cache
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

    const version = '5.4.624';
    // Prioritize JSDelivr and Unpkg for modern npm versions
    const urls = [
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.min.mjs`,
        `https://unpkg.com/pdfjs-dist@${version}/build/pdf.min.mjs`
    ];

    for (const url of urls) {
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const lib = await import(/* webpackIgnore: true */ url);
            const finalLib = lib.default || lib;

            if (finalLib && finalLib.GlobalWorkerOptions) {
                // Match the worker to the same CDN that succeeded
                finalLib.GlobalWorkerOptions.workerSrc = url.replace('pdf.min.mjs', 'pdf.worker.min.mjs');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).pdfjsLib = finalLib;
                return finalLib;
            }
        } catch (err) {
            console.warn(`[pdfToImage] CDN Load failed for ${url}:`, err);
        }
    }

    // fallback to local import if CDNs fail (requires transpilePackages: ['pdfjs-dist'] in next.config)
    try {
        const lib = await import('pdfjs-dist');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalLib = (lib as any).default || lib;
        if (finalLib && finalLib.GlobalWorkerOptions) {
            finalLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).pdfjsLib = finalLib;
            return finalLib;
        }
    } catch (err) {
        console.error('[pdfToImage] All loaders failed:', err);
    }

    return null;
}

/**
 * Internal: Render a PDF ArrayBuffer to a PNG data-URL.
 */
async function renderPdfPageToImage(arrayBuffer: ArrayBuffer, scale: number): Promise<string | null> {
    const pdfjsLib = await getPdfjsLib();
    if (!pdfjsLib) {
        console.error('[pdfToImage] pdfjsLib is null, cannot render PDF.');
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdfDoc: any;
    try {
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch (err) {
        console.warn('[pdfToImage] Initial getDocument failed, retrying without workerSrc...', err);
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '';
            pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        } catch (err2) {
            console.error('[pdfToImage] Secondary getDocument failed:', err2);
            return null;
        }
    }

    if (!pdfDoc) return null;

    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/png');

    page.cleanup();
    pdfDoc.destroy();

    return dataUrl;
}

/**
 * Render a @react-pdf/renderer Document to a PNG data-URL.
 * Returns `null` on any failure so the caller can show a fallback.
 */
export async function pdfToImage(
    component: ReactElement,
    scale = 2.0
): Promise<string | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = await pdf(component as any).toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        return await renderPdfPageToImage(arrayBuffer, scale);
    } catch (err) {
        console.error('[pdfToImage] Failed to render PDF thumbnail:', err);
        return null;
    }
}

/**
 * Render a PDF Blob (e.g. from LaTeX API) to a PNG data-URL.
 * Returns `null` on any failure.
 */
export async function blobToImage(
    blob: Blob,
    scale = 2.0
): Promise<string | null> {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        return await renderPdfPageToImage(arrayBuffer, scale);
    } catch (err) {
        console.error('[blobToImage] Failed to render PDF blob thumbnail:', err);
        return null;
    }
}
