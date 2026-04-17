/**
 * IndexedDB-backed cache for pre-rendered template thumbnail images.
 *
 * Keys follow the pattern:  `thumb-v2-{templateId}-{density}`
 * Bump CACHE_VERSION to invalidate all cached thumbnails (e.g. when sample
 * data or templates change significantly).
 */

export const THUMB_CACHE_VERSION = 'v2';

const DB_NAME = 'cvstack-thumbnails';
const STORE_NAME = 'thumbnails';
const DB_VERSION = 1;

let _dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (!_dbPromise) {
        _dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = () => {
                req.result.createObjectStore(STORE_NAME);
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => {
                _dbPromise = null; // allow retry
                reject(req.error);
            };
        });
    }
    return _dbPromise;
}

export async function getCachedThumbnail(key: string): Promise<string | null> {
    try {
        const db = await getDB();
        return await new Promise<string | null>((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).get(key);
            req.onsuccess = () => resolve((req.result as string) ?? null);
            req.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
}

export async function setCachedThumbnail(key: string, dataUrl: string): Promise<void> {
    try {
        const db = await getDB();
        await new Promise<void>((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).put(dataUrl, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => resolve(); // silent fail
        });
    } catch {
        // silent fail — cache is best-effort
    }
}
