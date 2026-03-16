/**
 * LaTeX Compiler Service
 *
 * TypeScript wrapper around the SwiftLaTeX PdfTeX WebAssembly engine.
 * SwiftLaTeX runs entirely in the browser via a Web Worker, compiling
 * real LaTeX to PDF without any server infrastructure.
 *
 * Engine files are served from /swiftlatex/ (public directory).
 */

/** Shape of the compilation result from the SwiftLaTeX worker */
interface CompileResult {
    pdf?: ArrayBuffer;
    status: number;
    log: string;
}

/** Engine readiness states */
const EngineStatus = {
    Init: 1,
    Ready: 2,
    Busy: 3,
    Error: 4,
} as const;

type EngineStatusType = typeof EngineStatus[keyof typeof EngineStatus];

/** Initialization timeout (30 seconds — WASM loading can be slow on first load) */
const INIT_TIMEOUT_MS = 30_000;

class LaTeXCompilerService {
    private worker: Worker | null = null;
    private status: EngineStatusType = EngineStatus.Init;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize the PdfTeX engine.
     * This is an expensive operation (loads ~1.8MB WASM) — called once per session.
     * Subsequent calls return immediately if already initialized.
     */
    async initialize(): Promise<void> {
        if (this.status === EngineStatus.Ready) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.status = EngineStatus.Error;
                this.initPromise = null;
                reject(new Error('LaTeX engine initialization timed out (30s). Check network connectivity.'));
            }, INIT_TIMEOUT_MS);

            try {
                // Construct the Worker URL at runtime.
                // Files in Vite's public/ directory are served at the root.
                // We use an absolute URL to avoid Vite's module transformation.
                const workerUrl = new URL('/swiftlatex/swiftlatexpdftex.js', window.location.origin).href;

                console.log('[LaTeX] Creating Worker from:', workerUrl);
                this.worker = new Worker(workerUrl);
                this.status = EngineStatus.Init;

                this.worker.onmessage = (ev: MessageEvent) => {
                    const data = ev.data;
                    const result = data['result'];

                    // The engine sends { result: 'ok' } after full WASM initialization
                    if (result === 'ok') {
                        clearTimeout(timeoutId);
                        this.status = EngineStatus.Ready;
                        console.log('[LaTeX] Engine initialized successfully');
                        resolve();
                    } else if (result === 'failed') {
                        clearTimeout(timeoutId);
                        this.status = EngineStatus.Error;
                        this.initPromise = null;
                        console.error('[LaTeX] Engine initialization failed:', data);
                        reject(new Error('LaTeX engine initialization failed'));
                    }
                };

                this.worker.onerror = (err) => {
                    clearTimeout(timeoutId);
                    this.status = EngineStatus.Error;
                    this.initPromise = null;
                    console.error('[LaTeX] Worker error:', err);
                    reject(new Error(`LaTeX worker failed to load. Ensure /swiftlatex/ files exist. (${err.message})`));
                };
            } catch (error) {
                clearTimeout(timeoutId);
                this.status = EngineStatus.Error;
                this.initPromise = null;
                reject(error);
            }
        });

        return this.initPromise;
    }

    /**
     * Compile a LaTeX source string to a PDF Blob.
     * Automatically initializes the engine on first call.
     */
    async compile(texSource: string): Promise<Blob> {
        // Ensure engine is ready
        if (this.status !== EngineStatus.Ready) {
            await this.initialize();
        }

        if (!this.worker || this.status !== EngineStatus.Ready) {
            throw new Error('LaTeX engine not initialized');
        }

        this.status = EngineStatus.Busy;

        try {
            // Write TeX source to the virtual filesystem
            this.worker.postMessage({
                cmd: 'writefile',
                url: 'resume.tex',
                src: texSource,
            });

            // Set the main file
            this.worker.postMessage({
                cmd: 'setmainfile',
                url: 'resume.tex',
            });

            // Compile and wait for result
            const result = await new Promise<CompileResult>((resolve, reject) => {
                const compileTimeout = setTimeout(() => {
                    reject(new Error('LaTeX compilation timed out (60s)'));
                }, 60_000);

                this.worker!.onmessage = (ev: MessageEvent) => {
                    const data = ev.data;
                    if (data['cmd'] !== 'compile') return;

                    clearTimeout(compileTimeout);

                    const pdfData = data['result'] === 'ok'
                        ? (data['pdf'] as ArrayBuffer)
                        : undefined;

                    const compileResult: CompileResult = {
                        status: data['status'] as number,
                        log: data['log'] as string,
                        pdf: pdfData,
                    };

                    resolve(compileResult);
                };

                this.worker!.postMessage({ cmd: 'compilelatex' });
                console.log('[LaTeX] Compilation started');
            });

            this.status = EngineStatus.Ready;

            // Clear the message handler
            this.worker.onmessage = () => { };

            console.log('[LaTeX] Compilation finished, status:', result.status);

            // Check for errors
            if (result.status !== 0 || !result.pdf) {
                const errorMsg = this.parseLatexError(result.log);
                throw new Error(errorMsg);
            }

            return new Blob([new Uint8Array(result.pdf)], { type: 'application/pdf' });
        } catch (error) {
            this.status = EngineStatus.Ready; // Allow retries
            if (error instanceof Error) throw error;
            throw new Error('LaTeX compilation failed');
        }
    }

    /**
     * Parse LaTeX error log to extract a meaningful error message.
     * LaTeX logs are extremely verbose — we extract the key error info.
     */
    private parseLatexError(log: string): string {
        if (!log) return 'LaTeX compilation failed (no log available).';

        // LaTeX errors start with "!" on a line
        const errorLines: string[] = [];
        const lines = log.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('!')) {
                errorLines.push(line);
                // Grab the next few lines for context
                if (i + 1 < lines.length) errorLines.push(lines[i + 1]);
                if (i + 2 < lines.length) errorLines.push(lines[i + 2]);
                break;
            }
        }

        if (errorLines.length > 0) {
            return errorLines.join('\n');
        }

        // Check for line number references
        const lineMatch = log.match(/l\.(\d+)/);
        if (lineMatch) {
            return `LaTeX error near line ${lineMatch[1]}. Check your syntax.`;
        }

        return 'LaTeX compilation failed. Check your syntax.';
    }

    /**
     * Check if the engine is currently ready for compilation.
     */
    isReady(): boolean {
        return this.status === EngineStatus.Ready;
    }

    /**
     * Check if the engine has been initialized (may still be loading).
     */
    isInitialized(): boolean {
        return this.worker !== null;
    }

    /**
     * Reset the engine state to allow re-initialization after an error.
     */
    reset(): void {
        this.dispose();
    }

    /**
     * Shut down the engine and release resources.
     */
    dispose(): void {
        if (this.worker) {
            try {
                this.worker.postMessage({ cmd: 'grace' });
            } catch {
                // Worker may already be terminated
            }
            this.worker.terminate();
            this.worker = null;
        }
        this.status = EngineStatus.Init;
        this.initPromise = null;
    }
}

// Export singleton instance
export const latexCompiler = new LaTeXCompilerService();

// Convenience function
export const compileLaTeX = (source: string): Promise<Blob> => {
    return latexCompiler.compile(source);
};
