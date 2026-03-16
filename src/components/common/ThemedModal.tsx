/* eslint-disable react-refresh/only-export-components */
/**
 * Themed Modal — CVStack Submodule
 *
 * Self-contained modal system for the standalone CVStack Vite app.
 * Same API as the main repo version: useModal() → { confirm, alert }
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

/* ── Types ── */
type ModalVariant = 'confirm' | 'alert';

interface ModalConfig {
    title: string;
    message: string;
    variant: ModalVariant;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    resolve: (result: boolean) => void;
}

interface ModalContextValue {
    confirm: (title: string, message: string, opts?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }) => Promise<boolean>;
    alert: (title: string, message: string) => Promise<void>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModal must be used within a ModalProvider');
    return ctx;
}

/* ── Provider ── */
export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<ModalConfig | null>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    const confirm = useCallback((title: string, message: string, opts?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }) => {
        return new Promise<boolean>((resolve) => {
            setModal({
                title,
                message,
                variant: 'confirm',
                confirmLabel: opts?.confirmLabel || 'Confirm',
                cancelLabel: opts?.cancelLabel || 'Cancel',
                destructive: opts?.destructive ?? false,
                resolve,
            });
        });
    }, []);

    const alert = useCallback((title: string, message: string) => {
        return new Promise<void>((resolve) => {
            setModal({
                title,
                message,
                variant: 'alert',
                confirmLabel: 'OK',
                resolve: () => resolve(),
            });
        });
    }, []);

    const close = useCallback((result: boolean) => {
        modal?.resolve(result);
        setModal(null);
    }, [modal]);

    useEffect(() => {
        if (!modal) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { e.preventDefault(); close(false); }
            if (e.key === 'Enter') { e.preventDefault(); close(true); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [modal, close]);

    useEffect(() => {
        if (modal) confirmBtnRef.current?.focus();
    }, [modal]);

    return (
        <ModalContext.Provider value={{ confirm, alert }}>
            {children}
            {modal && (
                <div
                    ref={backdropRef}
                    onClick={(e) => { if (e.target === backdropRef.current) close(false); }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        style={{
                            width: '100%', maxWidth: 420,
                            background: 'var(--card-bg, #1e293b)',
                            border: '2px solid var(--card-border, rgba(255,255,255,0.1))',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '1rem 1.5rem',
                                borderBottom: '2px solid var(--card-border, rgba(255,255,255,0.1))',
                            }}
                        >
                            <div
                                style={{
                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    background: modal.destructive
                                        ? 'rgba(239,68,68,0.15)'
                                        : modal.variant === 'alert'
                                            ? 'rgba(245,158,11,0.15)'
                                            : 'var(--accent-light, rgba(59,130,246,0.15))',
                                }}
                            >
                                {modal.variant === 'alert' ? (
                                    <AlertTriangle size={16} color="#f59e0b" />
                                ) : modal.destructive ? (
                                    <AlertTriangle size={16} color="#ef4444" />
                                ) : (
                                    <Info size={16} color="var(--accent, #3b82f6)" />
                                )}
                            </div>
                            <h3
                                style={{
                                    flex: 1, margin: 0,
                                    fontSize: '0.875rem', fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                    color: 'var(--main-text, #fff)',
                                }}
                            >
                                {modal.title}
                            </h3>
                            <button
                                onClick={() => close(false)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                    color: 'var(--main-text, #fff)', opacity: 0.4,
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.25rem 1.5rem' }}>
                            <p style={{
                                fontSize: '0.875rem', lineHeight: 1.6, margin: 0,
                                color: 'var(--main-text-secondary, rgba(255,255,255,0.6))',
                            }}>
                                {modal.message}
                            </p>
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                display: 'flex', gap: '0.75rem',
                                padding: '1rem 1.5rem',
                                borderTop: '2px solid var(--card-border, rgba(255,255,255,0.1))',
                            }}
                        >
                            {modal.variant === 'confirm' && (
                                <button
                                    onClick={() => close(false)}
                                    style={{
                                        flex: 1, padding: '0.625rem', border: '2px solid var(--card-border, rgba(255,255,255,0.1))',
                                        background: 'transparent', cursor: 'pointer',
                                        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                        color: 'var(--main-text-secondary, rgba(255,255,255,0.6))',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {modal.cancelLabel}
                                </button>
                            )}
                            <button
                                ref={confirmBtnRef}
                                onClick={() => close(true)}
                                style={{
                                    flex: 1, padding: '0.625rem', border: 'none', cursor: 'pointer',
                                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    background: modal.destructive ? '#dc2626' : 'var(--accent, #3b82f6)',
                                    color: '#fff',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {modal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}
