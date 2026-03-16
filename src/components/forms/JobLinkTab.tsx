import React, { useState } from 'react';
import { Search, Check, Zap, Link as LinkIcon, AlertCircle, Trash2, Target } from 'lucide-react';
import { useJobStore } from '../../lib/jobStore';

interface ParentApplication {
    id: string;
    company: string;
    position: string;
}

interface JobLinkTabProps {
    parentApplications?: ParentApplication[];
    onLinkJob?: (id: string) => void;
}

export const JobLinkTab: React.FC<JobLinkTabProps> = ({
    parentApplications = [],
    onLinkJob
}) => {
    const isIntegrated = typeof window !== 'undefined' && window.self !== window.top;
    const {
        jobTitle, jobUrl, jobDescription, linkedJobId, applyToBoth, setJobContext
    } = useJobStore();

    const [view, setView] = useState<'tracker' | 'manual'>(isIntegrated ? 'tracker' : 'manual');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    const filteredApps = parentApplications.filter(app =>
        !search ||
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApps.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    // Reset page on search
    React.useEffect(() => setPage(0), [search]);

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-2">
                <Target size={20} className="text-slate-400" />
                <h3 className="text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-white">Job Context</h3>
            </div>

            {/* Header — compact row with tab toggle + auto-sync */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50">
                    {isIntegrated && (
                        <button
                            onClick={() => setView('tracker')}
                            className={`flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'tracker' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            JobTracker
                        </button>
                    )}
                    <button
                        onClick={() => setView('manual')}
                        className={`flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Manual Input
                    </button>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group px-4 py-2 bg-slate-50 dark:bg-slate-900/40 border-2 border-slate-100 dark:border-slate-800">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={applyToBoth}
                            onChange={(e) => setJobContext({ applyToBoth: e.target.checked })}
                            className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-all duration-300 ${applyToBoth ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${applyToBoth ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Auto-Sync Resume & Letter
                    </span>
                </label>
            </div>

            {view === 'tracker' && isIntegrated ? (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="px-5 py-4 flex items-center gap-3 border-b-2 border-slate-100 dark:border-slate-800">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="SEARCH YOUR APPLICATIONS..."
                                className="bg-transparent text-[11px] outline-none w-full font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200"
                            />
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedApps.length === 0 ? (
                                <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest italic text-slate-400">
                                    {search ? 'No Matches Found' : 'No Applications Found'}
                                </div>
                            ) : (
                                paginatedApps.map((app) => {
                                    const isSelected = linkedJobId === app.id;
                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => {
                                                setJobContext({ linkedJobId: app.id, jobTitle: app.position });
                                                if (onLinkJob) onLinkJob(app.id);
                                            }}
                                            className={`w-full text-left px-5 py-5 transition-all group flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div>
                                                <div className={`font-bold text-sm uppercase tracking-tight ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>{app.position}</div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50">{app.company}</div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 bg-blue-600 flex items-center justify-center">
                                                    <Check size={14} className="text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="px-5 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 border-t-2 border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Page {page + 1} / {totalPages}</span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all border-2 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                                    >Prev</button>
                                    <button
                                        disabled={page === totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all border-2 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                                    >Next</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-blue-50/30 dark:bg-blue-900/10 border-2 border-blue-100/50 dark:border-blue-900/30 flex items-center gap-3">
                        <AlertCircle size={14} className="text-blue-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                            Linking a job automatically updates your cover letter recipient.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Job Title</label>
                            <div className="relative group">
                                <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-all" />
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={e => setJobContext({ jobTitle: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full pl-10 pr-4 py-3 text-xs font-bold outline-none border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500/50 bg-white dark:bg-slate-950 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Job URL (Optional)</label>
                            <div className="relative group">
                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-all" />
                                <input
                                    type="text"
                                    value={jobUrl}
                                    onChange={e => setJobContext({ jobUrl: e.target.value })}
                                    placeholder="https://linkedin.com/jobs/..."
                                    className="w-full pl-10 pr-4 py-3 text-xs font-bold outline-none border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500/50 bg-white dark:bg-slate-950 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Job Description</label>
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobContext({ jobDescription: e.target.value })}
                            placeholder="Paste the job description here. AI will use this as the primary source of truth for tailoring."
                            className="w-full h-52 px-4 py-4 text-xs font-bold outline-none border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500/50 bg-white dark:bg-slate-950 transition-all resize-none custom-scrollbar"
                        />
                        <div className="flex justify-between items-center px-1 pt-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                {jobDescription.length.toLocaleString()} characters entered
                            </span>
                            <button
                                onClick={() => setJobContext({ jobTitle: '', jobUrl: '', jobDescription: '', linkedJobId: null })}
                                className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                            >
                                <Trash2 size={12} />
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
