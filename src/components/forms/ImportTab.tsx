import React, { useState, useRef } from 'react';
import { useModal } from '../ThemedModal';
import { Upload, FolderOpen, Linkedin, Check, AlertTriangle, FileText, X, FileDown } from 'lucide-react';
import { useResumeStore } from '../../store';
import { parseResumeFile } from '../../lib/resumeParser';
import { importFromJSON } from '../../lib/storage';
import type { ResumeData } from '../../types';

interface ParentDocument {
    id: string;
    title?: string;
    type?: string;
}

interface ImportTabProps {
    parentDocuments?: ParentDocument[];
    onLoadParentDoc?: (id: string | null) => void;
}

export const ImportTab: React.FC<ImportTabProps> = ({
    parentDocuments = [],
    onLoadParentDoc
}) => {
    const isIntegrated = typeof window !== 'undefined' && window.self !== window.top;
    const modal = useModal();

    const [isImporting, setIsImporting] = useState(false);
    const [liText, setLiText] = useState('');
    const [importSource, setImportSource] = useState<'file' | 'linkedin' | 'cloud'>(isIntegrated ? 'cloud' : 'file');
    const [pendingData, setPendingData] = useState<Partial<ResumeData> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            if (ext === 'json') {
                const text = await file.text();
                const data = importFromJSON(text);
                setPendingData(data);
            } else {
                const parsed = await parseResumeFile(file);
                setPendingData(parsed);
            }
        } catch (err) {
            console.error('Import error:', err);
            modal.alert('Import Failed', 'Failed to parse file. Ensure it is a valid resume document.');
        } finally {
            setIsImporting(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleLinkedInTextParse = () => {
        if (!liText.trim()) return;
        const lines = liText.split('\n').map(l => l.trim()).filter(Boolean);
        const parsed: Partial<ResumeData> = {
            basics: { name: '', email: '', phone: '', address: '', summary: '', websites: [] },
            work: [], education: [], skills: [],
        };
        if (lines.length > 0) parsed.basics!.name = lines[0];
        let currentMode: 'summary' | 'experience' | 'education' | 'skills' | null = null;
        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('about') || lower.includes('summary')) currentMode = 'summary';
            else if (lower.includes('experience')) currentMode = 'experience';
            else if (lower.includes('education')) currentMode = 'education';
            else if (lower.includes('skills')) currentMode = 'skills';
            else if (currentMode === 'summary') {
                parsed.basics!.summary += (parsed.basics!.summary ? ' ' : '') + line;
            } else if (currentMode === 'experience') {
                if (line.match(/\d{4}/)) {
                    parsed.work!.push({ company: line, position: 'Role', location: '', startDate: '', endDate: '', bullets: [''] });
                } else if (parsed.work!.length > 0) {
                    const last = parsed.work![parsed.work!.length - 1];
                    if (last.bullets[0] === '') last.bullets[0] = line;
                    else last.bullets.push(line);
                }
            } else if (currentMode === 'education') {
                if (line.length > 5 && !line.includes('|')) {
                    parsed.education!.push({ institution: line, degree: '', field: '', location: '', graduationDate: '' });
                }
            } else if (currentMode === 'skills') {
                const items = line.split(/[,|•]/).map(s => s.trim()).filter(Boolean);
                if (items.length > 0) parsed.skills!.push({ category: 'Imported Skills', items });
            }
        });
        setPendingData(parsed);
    };

    const applyImport = () => {
        if (!pendingData) return;
        const current = useResumeStore.getState().resumeData;
        const merged = {
            ...current,
            basics: { ...current.basics, ...pendingData.basics },
            work: pendingData.work?.length ? pendingData.work : current.work,
            education: pendingData.education?.length ? pendingData.education : current.education,
            skills: pendingData.skills?.length ? pendingData.skills : current.skills,
        };
        useResumeStore.setState({ resumeData: merged });
        setPendingData(null);
        setLiText('');
        modal.alert('Import Successful', 'Resume imported successfully!');
    };

    // Source tabs removed in favor of primary action grid

    if (pendingData) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 border-2 border-blue-500/20 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-2">Resume Data Ready</h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-6">
                        We've parsed the document. Would you like to merge this into your current profile?
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setPendingData(null)} className="py-3 btn-remove text-[10px] font-black uppercase tracking-widest">
                            Cancel
                        </button>
                        <button onClick={applyImport} className="py-3 btn-add text-[10px] font-black uppercase tracking-widest">
                            Import Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-2.5">
                <FileDown size={20} className="text-slate-400" />
                <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Import & Documents</h3>
            </div>

            {/* Primary Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload Zone - Merged File & LinkedIn PDF */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-44 flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50/10 bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden"
                >
                    <div className="absolute top-3 right-3 flex gap-1.5">
                        <div className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-bold uppercase tracking-widest text-slate-400">PDF</div>
                        <div className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-bold uppercase tracking-widest text-slate-400">JSON</div>
                    </div>
                    <Upload size={28} className={`mb-3 transition-colors ${isImporting ? 'animate-bounce text-blue-500' : 'text-slate-300 group-hover:text-blue-500'}`} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                        {isImporting ? 'Parsing...' : 'Upload Document'}
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        Resume, LinkedIn PDF, or JSON
                    </p>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json,.pdf,.docx" onChange={(e) => handleFileChange(e)} />
                </div>

                {/* Paste Zone */}
                <div
                    onClick={() => setImportSource('linkedin')}
                    className={`group relative h-44 flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed ${importSource === 'linkedin' ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20'}`}
                >
                    <Linkedin size={28} className={`mb-3 transition-colors ${importSource === 'linkedin' ? 'text-blue-500' : 'text-slate-300 group-hover:text-[#0077b5]'}`} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                        Paste LinkedIn
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        Import from raw profile text
                    </p>
                </div>
            </div>

            {/* Sub-sections based on selection */}
            <div className="space-y-4">
                {importSource === 'linkedin' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paste Profile Text</span>
                            <button onClick={() => setImportSource(isIntegrated ? 'cloud' : 'file')} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                        <textarea
                            value={liText}
                            onChange={(e) => setLiText(e.target.value)}
                            placeholder="Paste your raw LinkedIn profile text here (Experience, Education, Skills sections)..."
                            className="w-full h-40 p-4 text-xs font-bold outline-none border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500/50 bg-white dark:bg-slate-950 transition-all resize-none custom-scrollbar"
                        />
                        <button
                            onClick={handleLinkedInTextParse}
                            disabled={!liText.trim()}
                            className="w-full py-4 btn-add font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30 shadow-lg shadow-blue-500/20"
                        >
                            Process & Merge Data
                        </button>
                    </div>
                )}

                {/* Cloud Section - Always show if integrated, but as a list below primary actions */}
                {isIntegrated && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <FolderOpen size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Documents</span>
                        </div>
                        {parentDocuments.length === 0 ? (
                            <div className="p-8 text-center border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">No cloud documents found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                {parentDocuments.filter(d => d.type !== 'coverletter').map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => onLoadParentDoc?.(doc.id)}
                                        className="flex items-center gap-3 p-2 text-left transition-all border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-900/5 bg-white dark:bg-slate-950 group"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group-hover:border-blue-500/30 transition-all flex-shrink-0">
                                            <FileText size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 truncate">{doc.title || 'Untitled Resume'}</div>
                                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Last synced recently</div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <div className="px-2 py-1 bg-blue-500 rounded text-[8px] font-black text-white uppercase tracking-widest">Load</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Smart Merge Info */}
            <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 border-2 border-blue-100/50 dark:border-blue-900/30 flex items-start gap-4">
                <AlertTriangle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-relaxed text-blue-700 dark:text-blue-400 uppercase tracking-tight">
                    Imported data intelligently merges with your profile. Review changes before finalizing.
                </p>
            </div>
        </div>
    );
};
