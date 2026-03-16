import React, { useMemo, useState, useRef, useEffect } from 'react';

/**
 * SmartDateInput – Clean date picker:
 * - type='month': Single input → popover with year nav + 4×3 month grid (for resume)
 * - type='date':  Native browser date input (for cover letter — needs full date)
 */

interface SmartDateInputProps {
    value: string;
    onChange: (value: string) => void;
    type: 'month' | 'date';
    showPresent?: boolean;
    showPresentToggle?: boolean;
    placeholder?: string;
    label?: string;
    className?: string;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SmartDateInput({
    value,
    onChange,
    type,
    showPresent = false,
    showPresentToggle = false,
    label,
    className = '',
}: SmartDateInputProps) {
    // ── Cover letter: native <input type="date"> ──
    if (type === 'date') {
        // Convert display value ("March 15, 2026") to YYYY-MM-DD for input
        const toInputDate = (v: string) => {
            if (!v) return '';
            try {
                const d = new Date(v);
                if (isNaN(d.getTime())) return '';
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            } catch { return ''; }
        };

        const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (!val) { onChange(''); return; }
            const [y, m, d] = val.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            onChange(new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date));
        };

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        {label}
                    </label>
                )}
                <input
                    type="date"
                    value={toInputDate(value)}
                    onChange={handleNativeChange}
                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all h-[38px] sm:h-[42px]"
                />
            </div>
        );
    }

    // ── Resume sections: month picker popover ──
    return <MonthPicker value={value} onChange={onChange} label={label} className={className} showPresent={showPresent} showPresentToggle={showPresentToggle} />;
}

/* ── Month Picker (internal) ── */

function MonthPicker({ value, onChange, label, className = '', showPresent, showPresentToggle }: {
    value: string; onChange: (v: string) => void; label?: string; className?: string; showPresent?: boolean; showPresentToggle?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const currentYear = new Date().getFullYear();

    const isPresent = !!value && (value.toLowerCase() === 'present' || value.toLowerCase() === 'currently' || value.toLowerCase() === 'ongoing');

    const parsed = useMemo(() => {
        if (!value || isPresent) return { month: -1, year: currentYear };
        const parts = value.split(' ');
        if (parts.length === 2) {
            const mIdx = MONTHS_SHORT.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
            if (mIdx >= 0) return { month: mIdx, year: parseInt(parts[1]) || currentYear };
        }
        try {
            const d = new Date(value);
            if (!isNaN(d.getTime())) return { month: d.getMonth(), year: d.getFullYear() };
        } catch { /* ignore */ }
        return { month: -1, year: currentYear };
    }, [value, isPresent, currentYear]);

    const [viewYear, setViewYear] = useState(parsed.year);

    useEffect(() => {
        if (parsed.year && !isPresent) setViewYear(parsed.year);
    }, [parsed.year, isPresent]);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const handleMonthClick = (idx: number) => {
        onChange(`${MONTHS_SHORT[idx]} ${viewYear}`);
        setOpen(false);
    };

    const handlePresentToggle = () => {
        if (isPresent) { onChange(''); } else { onChange('Present'); setOpen(false); }
    };

    const displayText = isPresent ? 'Present' : value || '';

    return (
        <div ref={wrapperRef} className={`w-full relative ${className}`}>
            {label && (
                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`w-full px-3 py-1.5 sm:py-2 border-2 text-left font-medium transition-all h-[38px] sm:h-[42px] flex items-center justify-between ${
                    open
                        ? 'border-blue-500 ring-2 ring-blue-400/20 bg-white dark:bg-slate-950'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 hover:border-slate-400 dark:hover:border-slate-500'
                } ${displayText ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
            >
                <span className={isPresent ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}>
                    {displayText || 'MM / YYYY'}
                </span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-xl z-50">
                    {/* Year nav */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <button type="button" onClick={() => setViewYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-base font-black text-slate-800 dark:text-white">{viewYear}</span>
                        <button type="button" onClick={() => setViewYear(y => y + 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-4 gap-1 p-1.5">
                        {MONTHS_SHORT.map((m, idx) => {
                            const isSelected = !isPresent && parsed.month === idx && parsed.year === viewYear;
                            const isCurrent = idx === new Date().getMonth() && viewYear === currentYear;
                            return (
                                <button key={m} type="button" onClick={() => handleMonthClick(idx)}
                                    className={`py-1.5 text-xs font-semibold transition-all rounded-sm ${
                                        isSelected ? 'bg-blue-600 text-white shadow-sm'
                                            : isCurrent ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >{m}</button>
                            );
                        })}
                    </div>

                    {/* Toggle */}
                    {(showPresent || showPresentToggle) && (
                        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="flex items-center gap-2 cursor-pointer select-none group">
                                <div className="relative">
                                    <input type="checkbox" checked={isPresent} onChange={handlePresentToggle} className="sr-only" />
                                    <div className={`w-9 h-5 rounded-full transition-colors ${isPresent ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPresent ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                    Currently here
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
