"use client";
// v2.0.2 - Clean professional build
import React, { useState, useEffect, useRef, Suspense, lazy, useCallback } from 'react';
import { useResumeStore } from './store'
import { BasicsForm } from './components/sections/BasicsForm'
import { WorkForm } from './components/sections/WorkForm'
import { EducationForm } from './components/sections/EducationForm'
import { SkillsForm } from './components/sections/SkillsForm'
import { ProjectsForm } from './components/sections/ProjectsForm'
import { AwardsForm } from './components/sections/AwardsForm'
import { CustomSectionForm } from './components/sections/CustomSectionForm'
import { CoverLetterForm } from './components/sections/CoverLetterForm'
import { AITab } from './components/panels/AITab'
import { ResumeIntelligenceTab } from './components/panels/ResumeIntelligenceTab'
import { ShareAnalyticsView } from './components/panels/ShareAnalyticsView'
import { FormattingForm } from './components/formatting/FormattingForm'
import { CoverLetterFormattingForm } from './components/formatting/CoverLetterFormattingForm'
import { LaTeXFormattingForm } from './components/formatting/LaTeXFormattingForm'
import { ProofreadingView } from './components/panels/ProofreadingView'
import { JobLinkTab } from './components/panels/JobLinkTab'
import { ImportTab } from './components/panels/ImportTab'
import { ModalProvider, useModal } from './components/common/ThemedModal'
import { useJobStore } from './lib/stores/jobStore'
import { TemplateThumbnail } from './components/preview/TemplateThumbnail'
import { PDFPreview } from './components/preview/PDFPreview'
import type { TemplateId, SectionKey, DocumentType, PreloadedTemplateId } from './types'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import {
  importFromJSON,
  saveActiveTab,
  saveCoverLetterData, loadCoverLetterData, saveDocumentType, loadDocumentType,
  saveContinuousMode, loadContinuousMode, saveShowResume,
  saveShowCoverLetter
} from './lib/data/storage'
import { loadPrefillData } from './lib/data/loadFromUrl'
import { decodeResumeFromUrl } from './lib/data/shareUtils'
import { parseResumeFile } from './lib/data/resumeParser'
import { isLatexTemplate } from './lib/pdf/pdfTemplateMap'
import { useCoverLetterStore } from './lib/stores/coverLetterStore'
import { useThemeStore, applyTheme, THEMES, THEME_MAP } from './lib/stores/themeStore'
import { useCustomTemplateStore } from './lib/stores/customTemplateStore'
import { generateDocumentTitle } from './lib/utils/documentNaming'
import { SAMPLE_RESUME_DATA, SAMPLE_COVER_LETTER_DATA } from './lib/data/sampleData';
import {
  Plus,
  LayoutTemplate,
  Palette,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  FolderKanban,
  Award,
  ListChecks,
  Sparkles,
  Check,
  Upload,
  FileText,
  RotateCcw,
  GripVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Code2,
  Layers,
  FileCheck,
  Mail,
  Pencil,
  Trash2,
  Copy,
  Search,
  Menu,
  Eye,
  Settings,
  ArrowLeft,
  Save,
  Share2,
  Undo2,
  Redo2,
  BarChart3,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import './styles/index.css'

// Lazy-load the LaTeX editor (only needed when LaTeX template is selected)
const LaTeXEditor = lazy(() => import('./components/latex/LaTeXEditor').then(m => ({ default: m.LaTeXEditor })))

// Tab system types
type TabKey = 'basics' | 'work' | 'education' | 'skills' | 'projects' | 'awards' | 'custom-sections' | 'cover-letter' | 'templates' | 'formatting' | 'ai' | string;

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  draggable?: boolean;
  sectionKey?: SectionKey;
}

const templates: Array<{ id: TemplateId; name: string; isLatex?: boolean; description?: string; type?: DocumentType }> = [
  { id: 1, name: 'Classic', type: 'resume' },
  { id: 2, name: 'Modern', type: 'resume' },
  { id: 3, name: 'Minimal', type: 'resume' },
  { id: 4, name: 'Executive', type: 'resume' },
  { id: 5, name: 'Creative', type: 'resume' },
  { id: 6, name: 'Technical', type: 'resume' },
  { id: 7, name: 'Elegant', type: 'resume' },
  { id: 8, name: 'Compact', type: 'resume' },
  { id: 9, name: 'Academic', type: 'resume' },
  { id: 11, name: 'Professional LaTeX', isLatex: true, description: 'Standard pdfTeX resume', type: 'resume' },
  { id: 12, name: 'Compact LaTeX', isLatex: true, description: '10pt, tight spacing', type: 'resume' },
  { id: 13, name: 'Ultra Compact LaTeX', isLatex: true, description: '9pt, max density', type: 'resume' },
  { id: 14, name: 'Academic LaTeX', isLatex: true, description: 'Academic CV style', type: 'resume' },

  // Cover Letter Templates
  { id: 21, name: 'Professional LaTeX CV', isLatex: true, description: 'Formal LaTeX cover letter', type: 'coverletter' },
  { id: 22, name: 'Executive LaTeX CV', isLatex: true, description: 'Modern executive style', type: 'coverletter' },
  { id: 24, name: 'Classic CV', description: 'Standard React PDF layout', type: 'coverletter' },
  { id: 25, name: 'Modern CV', description: 'Modern card-based layout', type: 'coverletter' },
];

function SidebarItem({ tab, isActive, onClick }: { tab: TabItem; isActive: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.key,
    disabled: !tab.draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={{ ...style, ...(isActive ? { backgroundColor: 'var(--sidebar-hover)' } : {}) }}
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 font-semibold transition-all border-l-4 cursor-pointer rounded-none
        ${isActive
          ? 'border-white'
          : 'border-transparent'
        }
      `}
    >
      {tab.draggable && (
        <span {...attributes} {...listeners} className="cursor-move text-white/40 hover:text-white">
          <GripVertical size={16} />
        </span>
      )}
      <span className="!text-white">{tab.icon}</span>
      <span className="text-sm !text-white">{tab.label}</span>
    </button>
  );
}

interface ParentDocument {
  id: string;
  title?: string;
  type?: string;
}

interface ParentApplication {
  id: string;
  company: string;
  position: string;
}

function App() { // Stores
  const modal = useModal();
  const {
    resumeData,
    setTemplate: setResumeTemplate, reset: resetResume, loadSampleData: loadResumeSample,
    setSections, addCustomSection,
    updateFormatting: updateResumeFormatting,
    activeTab, setActiveTab,
    showResume, setShowResume,
    undo: undoResume, redo: redoResume, past: resumePast, future: resumeFuture
  } = useResumeStore();

  const {
    coverLetterData,
    updateContent,
    setTemplate: setCVTemplate, reset: resetCV, loadSampleData: loadCVSample,
    updateFormatting: updateCVFormatting,
    resetFormatting: resetCVFormatting,
    showCoverLetter, setShowCoverLetter,
    undo: undoCV, redo: redoCV, past: cvPast, future: cvFuture
  } = useCoverLetterStore();
  const { customTemplates, addCustomTemplate, updateCustomTemplate, deleteCustomTemplate } = useCustomTemplateStore()
  const { themeId, setTheme } = useThemeStore()
  const handleSetTheme = useCallback((id: string) => {
    setTheme(id);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'THEME_CHANGED', themeId: id }, '*');
    }
  }, [setTheme]);

  const [documentType, setDocumentType] = useState<DocumentType>('resume')

  // Data from parent (if iframed)
  const [parentDocuments, setParentDocuments] = useState<ParentDocument[]>([])
  const [parentApplications, setParentApplications] = useState<ParentApplication[]>([])
  const [parentSaveStatus, setParentSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);
  const [jobDropdownOpen, setJobDropdownOpen] = useState(false);
  const [jobSearch, setJobSearch] = useState('');

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [resumeTemplateFilter, setResumeTemplateFilter] = useState<'all' | 'standard' | 'latex'>('all');
  const [resumeTemplateSearch, setResumeTemplateSearch] = useState('');
  const [resumeTemplateSort, setResumeTemplateSort] = useState<'default' | 'latex-first' | 'standard-first'>('default');
  const [resumeTemplatePage, setResumeTemplatePage] = useState(1);
  const [resumeTemplatesPerPage, setResumeTemplatesPerPage] = useState(6);

  const [cvTemplateFilter, setCvTemplateFilter] = useState<'all' | 'standard' | 'latex'>('all');
  const [cvTemplateSearch, setCvTemplateSearch] = useState('');
  const [cvTemplateSort, setCvTemplateSort] = useState<'default' | 'latex-first' | 'standard-first'>('default');
  const [cvTemplatePage, setCvTemplatePage] = useState(1);
  const [cvTemplatesPerPage, setCvTemplatesPerPage] = useState(6);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const handleUndo = useCallback(() => {
    if (documentType === 'resume') undoResume();
    else undoCV();
  }, [documentType, undoResume, undoCV]);

  const handleRedo = useCallback(() => {
    if (documentType === 'resume') redoResume();
    else redoCV();
  }, [documentType, redoResume, redoCV]);

  const canUndo = documentType === 'resume' ? resumePast.length > 0 : cvPast.length > 0;
  const canRedo = documentType === 'resume' ? resumeFuture.length > 0 : cvFuture.length > 0;

  // New state for sidebar controls
  const [continuousMode, setContinuousMode] = useState(() => loadContinuousMode());
  const [isImporting, setIsImporting] = useState(false);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateBase, setNewTemplateBase] = useState<PreloadedTemplateId>(1);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');
  const [previewDataSource, setPreviewDataSource] = useState<'sample' | 'real'>('sample');

  // Broadcast current state to parent window for cf-documents persistence
  const broadcastSave = useCallback(() => {
    if (window.parent !== window) {
      try {
        const currentResumeData = useResumeStore.getState().resumeData;
        const currentCL = useCoverLetterStore.getState().coverLetterData;
        // Use cover letter fields as fallback for document ID when basics.name is empty
        const baseName = currentResumeData.basics?.name
          || (documentType === 'coverletter'
            ? `${currentCL.company || ''} ${currentCL.position || ''}`.trim()
            : '')
          || 'untitled';
        const docId = `builder-${baseName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
        const title = generateDocumentTitle({ userName: currentResumeData.basics?.name || baseName, documentType });
        window.parent.postMessage({
          type: 'DOCUMENT_SAVED',
          documentId: docId,
          documentType,
          showResume,
          showCoverLetter,
          title,
          data: {
            resumeData: currentResumeData,
            customLatexSource: useResumeStore.getState().customLatexSource,
            latexFormatting: useResumeStore.getState().latexFormatting
          },
          coverLetterData: currentCL,
        }, '*');
      } catch { /* ignore serialization errors */ }
    }
  }, [documentType, showResume, showCoverLetter]);

  // Scroll to a section in continuous mode instead of switching tabs
  const scrollToContinuousSection = (tabKey: TabKey) => {
    const sectionId = `continuous-section-${tabKey}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle sidebar tab click — scroll if continuous mode, else switch tab
  const handleSidebarClick = (tabKey: TabKey) => {
    if (continuousMode) {
      scrollToContinuousSection(tabKey);
      setActiveTab(tabKey);
    } else {
      setActiveTab(tabKey);
    }
    // Only close mobile sidebar on navigation; keep it open on desktop
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Track which section is visible when scrolling in continuous mode
  useEffect(() => {
    if (!continuousMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip updates while user is typing to prevent jittery preview switching
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }

        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length === 0) return;

        const bestEntry = visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const tabKey = bestEntry.target.id.replace('continuous-section-', '');
        if (tabKey) {
          setActiveTab(tabKey as TabKey);
        }
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: '-10% 0px -60% 0px' }
    );

    const sections = document.querySelectorAll('[id^="continuous-section-"]');
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [continuousMode, setActiveTab]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Listen for messages from parent window (theme, load document, link job)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SET_THEME' && event.data.themeId) {
        setTheme(event.data.themeId);
      }
      if (event.data?.type === 'REQUEST_SAVE') {
        broadcastSave();
      }
      if (event.data?.type === 'LOAD_RESUME' || event.data?.type === 'HYDRATE_DOCUMENT') {
        const data = event.data.data;
        if (data) {
          if (data.resumeData) {
            useResumeStore.setState({
              resumeData: data.resumeData,
              customLatexSource: data.customLatexSource || null,
              latexFormatting: data.latexFormatting || null
            });
          } else if (data.basics || data.work || data.education || data.skills) {
            useResumeStore.setState({ resumeData: { ...useResumeStore.getState().resumeData, ...data } });
          }
        }
        if (event.data.coverLetterData) {
          useCoverLetterStore.setState({ coverLetterData: event.data.coverLetterData });
        }
        if (event.data.showResume !== undefined) setShowResume(event.data.showResume);
        if (event.data.showCoverLetter !== undefined) setShowCoverLetter(event.data.showCoverLetter);
        if (event.data.documentType) setDocumentType(event.data.documentType);
      }
      if (event.data?.type === 'SET_PARENT_DATA') {
        if (event.data.documents) setParentDocuments(event.data.documents);
        if (event.data.applications) setParentApplications(event.data.applications);
      }
      if (event.data?.type === 'SET_SAVE_STATUS') {
        setParentSaveStatus(event.data.status);
      }
      if (event.data?.type === 'LINK_JOB' && event.data.job) {
        const job = event.data.job;
        useJobStore.getState().setJobContext({
          jobTitle: job.title || '',
          jobDescription: job.description || '',
          jobUrl: job.url || '',
          linkedJobId: job.id || null
        });

        // Update cover letter context
        const currentCL = useCoverLetterStore.getState().coverLetterData;
        const currentBasics = useResumeStore.getState().resumeData.basics;

        useCoverLetterStore.setState({
          coverLetterData: {
            ...currentCL,
            company: job.company || currentCL.company,
            position: job.title || currentCL.position,
            signature: currentBasics?.name || currentCL.signature,
          }
        });

        // Broadcast save back to parent
        setTimeout(() => broadcastSave(), 200);
      }
      if (event.data?.type === 'REQUEST_SAVE') {
        // Parent is requesting an immediate save broadcast
        broadcastSave();
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('message', handleMessage);
    };
  }, [setTheme, broadcastSave, resetResume, resetCV, setShowResume, setShowCoverLetter, setActiveTab, updateContent]); // Added broadcastSave and reset to prevent stale closures

  // Load non-store persisted data on mount; resume store is auto-persisted via Zustand middleware
  useEffect(() => {
    const savedCoverLetter = loadCoverLetterData();
    if (savedCoverLetter) {
      useCoverLetterStore.setState({ coverLetterData: savedCoverLetter });
    }

    const savedType = loadDocumentType();
    if (savedType) {
      setDocumentType(savedType);
    }

    // Check for shared resume data in URL
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      const decoded = decodeResumeFromUrl(sharedData);
      if (decoded) {
        useResumeStore.setState({ resumeData: decoded });
        setReadOnlyMode(true);
        setDocumentType('resume');
        return; // Don't load other data when in shared read-only mode
      }
    }

    // Check for theme in URL for instant sync when iframed
    const urlTheme = params.get('theme');
    if (urlTheme && THEME_MAP[urlTheme]) {
      setTheme(urlTheme);
    }

    // Prefill data overrides localStorage — must run AFTER the above
    loadPrefillData(); // This should still be called to handle URL prefill
  }, [setTheme]);

  // Save active tab on change
  useEffect(() => {
    saveActiveTab(activeTab);
  }, [activeTab]);

  // Apply theme CSS custom properties + dark class whenever theme changes
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  // Load sample data for both resume and cover letter
  const loadAllSampleData = () => {
    loadResumeSample();
    loadCVSample();
    // Immediate sync to parent to prevent stale reverts
    setTimeout(() => broadcastSave(), 50);
  };

  // Persist new settings
  useEffect(() => { saveContinuousMode(continuousMode); }, [continuousMode]);
  useEffect(() => { saveShowResume(showResume); }, [showResume]);
  useEffect(() => { saveShowCoverLetter(showCoverLetter); }, [showCoverLetter]);

  // Debounced auto-save & sync with parent (1s delay for performance)
  useEffect(() => {
    // When data changes, clear any previous 'saved' status to show it's dirty again
    // but DON'T add parentSaveStatus to dependencies to avoid infinite loops

    const timeout = setTimeout(() => {
      saveCoverLetterData(coverLetterData);
      saveDocumentType(documentType);
      broadcastSave();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [resumeData, coverLetterData, documentType, showResume, showCoverLetter, broadcastSave]);

  // Handle 'saved' status auto-reset (Quieter feedback)
  useEffect(() => {
    if (parentSaveStatus === 'saved') {
      const timeout = setTimeout(() => {
        setParentSaveStatus('idle');
      }, 3000); // Reset to 'idle' after 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [parentSaveStatus]);

  // Periodic safety sync (every 2 minutes - reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      broadcastSave();
    }, 120000);
    return () => clearInterval(interval);
  }, [broadcastSave]);

  // Sync documentType with toggles and activeTab
  useEffect(() => {
    const isCVTab = activeTab === 'cover-letter' || activeTab === 'cv-templates' || activeTab === 'cv-formatting';
    const isResumeTab = activeTab === 'templates' || activeTab === 'formatting' ||
      activeTab === 'work' || activeTab === 'education' || activeTab === 'skills' ||
      activeTab === 'projects' || activeTab === 'awards' || activeTab === 'latex-editor' ||
      activeTab === 'share-analytics' ||
      resumeData.sections.includes(activeTab as SectionKey);
    const isProfileTab = activeTab === 'basics';

    if (isProfileTab) {
      // Profile is neutral — keep current documentType
    } else if (showCoverLetter && !showResume) {
      setDocumentType('coverletter');
    } else if (showResume && !showCoverLetter) {
      setDocumentType('resume');
    } else if (isCVTab) {
      setDocumentType('coverletter');
    } else if (isResumeTab) {
      setDocumentType('resume');
    }
  }, [activeTab, resumeData.sections, showResume, showCoverLetter]);

  // Sync resume basics to cover letter basics whenever basics change
  useEffect(() => {
    if (resumeData.basics) {
      useCoverLetterStore.getState().autoPopulateFromResume(resumeData.basics);
    }
  }, [resumeData.basics]);

  // Redirect if current tab becomes hidden in Simple mode
  useEffect(() => {
    if (!isAdvancedMode) {
      const hiddenTabs = ['formatting', 'cv-formatting', 'latex-editor'];
      if (hiddenTabs.includes(activeTab)) {
        setActiveTab('templates');
      }
    }
  }, [isAdvancedMode, activeTab, setActiveTab]);

  // If the current tab becomes hidden, switch to the first visible tab
  useEffect(() => {
    if (!showResume && activeTab !== 'basics' && activeTab !== 'cover-letter' && activeTab !== 'cv-templates' && activeTab !== 'cv-formatting' && activeTab !== 'templates' && activeTab !== 'formatting' && activeTab !== 'ai') {
      if (showCoverLetter) {
        setActiveTab('cover-letter');
      } else {
        setActiveTab('basics');
      }
    }
    if (!showCoverLetter && activeTab === 'cover-letter') {
      if (showResume) {
        setActiveTab('basics');
      } else {
        setActiveTab('templates');
      }
    }
  }, [showResume, showCoverLetter, activeTab, setActiveTab]);

  // (Dark mode is controlled by theme selection — no separate toggle)

  // Handle resume/cover letter toggle with "at least one" constraint
  const handleToggleResume = () => {
    if (showResume && !showCoverLetter) return; // Can't uncheck both
    setShowResume(!showResume);
    setTimeout(() => broadcastSave(), 0);
  };

  const handleToggleCoverLetter = () => {
    if (showCoverLetter && !showResume) return; // Can't uncheck both
    setShowCoverLetter(!showCoverLetter);
    setTimeout(() => broadcastSave(), 0);
  };

  // Import — supports JSON, PDF, DOCX, LaTeX, TXT
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pdf,.docx,.doc,.tex,.latex,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setIsImporting(true);

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        if (ext === 'json') {
          // Full-fidelity JSON import
          const text = await file.text();
          const data = importFromJSON(text);
          useResumeStore.setState({ resumeData: data });
          modal.alert('Import Successful', 'Resume data imported successfully from JSON!');
        } else {
          // Parse other formats
          const parsed = await parseResumeFile(file);

          // Merge parsed data into current resume
          const current = useResumeStore.getState().resumeData;

          // Merge websites
          const existingUrls = new Set(current.basics.websites.map(w => w.url));
          const newWebsites = parsed.basics?.websites?.filter(w => !existingUrls.has(w.url)) || [];

          useResumeStore.setState({
            resumeData: {
              ...current,
              basics: {
                ...current.basics,
                ...parsed.basics,
                websites: [...current.basics.websites, ...newWebsites]
              },
              work: parsed.work && parsed.work.length > 0 ? parsed.work : current.work,
              education: parsed.education && parsed.education.length > 0 ? parsed.education : current.education,
              skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : current.skills,
              projects: parsed.projects && parsed.projects.length > 0 ? parsed.projects : current.projects,
              awards: parsed.awards && parsed.awards.length > 0 ? parsed.awards : current.awards,
            }
          });
          modal.alert('Import Successful', `Resume data imported from ${ext.toUpperCase()} file! Please review and adjust the parsed content.`);
        }
      } catch (error) {
        console.error('Import error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        modal.alert('Import Failed', `Failed to import file: ${msg}`);
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // Map sections to tabs dynamically
  const sectionTabs: TabItem[] = resumeData.sections.filter(sk => sk !== 'profile').map(sectionKey => {
    const tabMap: Record<string, TabItem> = {
      work: { key: 'work', label: 'Experience', icon: <Briefcase size={18} />, draggable: true, sectionKey: 'work' },
      education: { key: 'education', label: 'Education', icon: <GraduationCap size={18} />, draggable: true, sectionKey: 'education' },
      skills: { key: 'skills', label: 'Skills', icon: <Zap size={18} />, draggable: true, sectionKey: 'skills' },
      projects: { key: 'projects', label: 'Projects', icon: <FolderKanban size={18} />, draggable: true, sectionKey: 'projects' },
      awards: { key: 'awards', label: 'Awards', icon: <Award size={18} />, draggable: true, sectionKey: 'awards' },
    };

    // Check if it's a custom section
    if (!tabMap[sectionKey]) {
      const customSection = resumeData.customSections.find(cs => cs.id === sectionKey);
      if (customSection) {
        return {
          key: customSection.id,
          label: customSection.title,
          icon: <ListChecks size={18} />,
          draggable: true,
          sectionKey: customSection.id,
        };
      }
    }

    return tabMap[sectionKey];
  }).filter(Boolean);

  // Flat tab list
  const isLatexSelected = isLatexTemplate(resumeData.selectedTemplate);

  // Filtered, searched, sorted templates (RESUME)
  const filteredResumeTemplates = (() => {
    let result = templates.filter(t => t.type === 'resume');
    if (resumeTemplateFilter === 'latex') result = result.filter(t => t.isLatex);
    else if (resumeTemplateFilter === 'standard') result = result.filter(t => !t.isLatex);

    if (resumeTemplateSearch.trim()) {
      const q = resumeTemplateSearch.trim().toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.isLatex && 'latex pdftex'.includes(q)) ||
        (!t.isLatex && 'standard react pdf'.includes(q))
      );
    }
    if (resumeTemplateSort === 'latex-first') result.sort((a, b) => (a.isLatex === b.isLatex ? 0 : a.isLatex ? -1 : 1));
    else if (resumeTemplateSort === 'standard-first') result.sort((a, b) => (a.isLatex === b.isLatex ? 0 : a.isLatex ? 1 : -1));
    return result;
  })();

  const paginatedResumeTemplates = filteredResumeTemplates.slice((resumeTemplatePage - 1) * resumeTemplatesPerPage, resumeTemplatePage * resumeTemplatesPerPage);

  // Filtered, searched, sorted templates (CV)
  const filteredCVTemplates = (() => {
    let result = templates.filter(t => t.type === 'coverletter');
    if (cvTemplateFilter === 'latex') result = result.filter(t => t.isLatex);
    else if (cvTemplateFilter === 'standard') result = result.filter(t => !t.isLatex);

    if (cvTemplateSearch.trim()) {
      const q = cvTemplateSearch.trim().toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.isLatex && 'latex pdftex'.includes(q)) ||
        (!t.isLatex && 'standard react pdf'.includes(q))
      );
    }
    if (cvTemplateSort === 'latex-first') result.sort((a, b) => (a.isLatex === b.isLatex ? 0 : a.isLatex ? -1 : 1));
    else if (cvTemplateSort === 'standard-first') result.sort((a, b) => (a.isLatex === b.isLatex ? 0 : a.isLatex ? 1 : -1));
    return result;
  })();

  const paginatedCVTemplates = filteredCVTemplates.slice((cvTemplatePage - 1) * cvTemplatesPerPage, cvTemplatePage * cvTemplatesPerPage);

  // Reset pages
  useEffect(() => { setResumeTemplatePage(1); }, [resumeTemplateFilter, resumeTemplateSearch, resumeTemplateSort, resumeTemplatesPerPage]);
  useEffect(() => { setCvTemplatePage(1); }, [cvTemplateFilter, cvTemplateSearch, cvTemplateSort, cvTemplatesPerPage]);

  const renderTemplateFilterBar = (
    type: 'resume' | 'cv',
    filteredCount: number,
    search: string,
    setSearch: (s: string) => void,
    filter: 'all' | 'standard' | 'latex',
    setFilter: (f: 'all' | 'standard' | 'latex') => void,
    sort: 'default' | 'latex-first' | 'standard-first',
    setSort: (s: 'default' | 'latex-first' | 'standard-first') => void
  ) => (
    <div className="flex flex-wrap items-stretch gap-3 mb-6 w-full">
      <div className="flex flex-col justify-center border-r-2 pr-3 mr-1 shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <h3 className="text-sm font-black whitespace-nowrap uppercase tracking-tighter" style={{ color: 'var(--main-text)' }}>
          {type === 'resume' ? 'Resume' : 'CV'} Templates
        </h3>
        <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest whitespace-nowrap">
          {filteredCount} Found
        </span>
      </div>

      <div className="relative flex-[2] min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
        <input
          type="text"
          placeholder={`Search ${type}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-full bg-black/30 border-2 border-white/10 rounded-none pl-9 pr-4 py-2 text-xs focus:border-white/30 transition-all placeholder:text-white/20"
          style={{ color: 'var(--main-text)' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex-1 min-w-[120px] relative">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'standard' | 'latex')}
          className="w-full h-full bg-black/30 border-2 border-white/10 rounded-none px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all focus:border-white/30 cursor-pointer appearance-none"
          style={{ color: 'var(--main-text)' }}
        >
          <option value="all">All Styles</option>
          <option value="standard">React PDF</option>
          <option value="latex">pdfTeX</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
      </div>

      <div className="flex-1 min-w-[130px] relative">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'default' | 'latex-first' | 'standard-first')}
          className="w-full h-full bg-black/30 border-2 border-white/10 rounded-none px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all focus:border-white/30 cursor-pointer appearance-none"
          style={{ color: 'var(--main-text)' }}
        >
          <option value="default">Sort: Default</option>
          <option value="latex-first">Latex First</option>
          <option value="standard-first">Standard First</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
      </div>

      <button
        onClick={() => setPreviewDataSource(prev => prev === 'sample' ? 'real' : 'sample')}
        className={`px-4 h-[38px] text-[10px] font-black uppercase tracking-widest border-2 transition-all rounded-none ${previewDataSource === 'real' ? 'btn-accent' : 'hover:bg-white/5'}`}
        style={previewDataSource !== 'real' ? { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--main-text-secondary)' } : {}}
      >
        {previewDataSource === 'sample' ? 'Your Data' : 'Sample Data'}
      </button>
    </div>
  );

  const renderPagination = (
    filteredCount: number,
    perPage: number,
    setPerPage: (n: number) => void,
    page: number,
    setPage: (p: number | ((prev: number) => number)) => void
  ) => {
    // If we have very few items total, don't show pagination unless we're already paging
    if (filteredCount <= 6 && perPage !== 6) return null;
    if (filteredCount <= 6 && page === 1) return null;

    const totalPages = perPage === 9999 ? 1 : Math.ceil(filteredCount / perPage);
    const options = [6, 12, 24, 48, 9999];

    return (
      <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-4 border-t-2" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--main-text-secondary)' }}>Show:</span>
          <div className="relative">
            <select
              value={perPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPerPage(val);
                setPage(1);
              }}
              className="bg-black/30 border-2 border-white/10 rounded-none px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all focus:border-white/30 cursor-pointer appearance-none pr-6"
              style={{ color: 'var(--main-text)' }}
            >
              {options.map(n => (
                <option key={n} value={n}>{n === 9999 ? 'All' : n}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
            disabled={page <= 1 || perPage === 9999}
            className="p-1 border-2 disabled:opacity-10 transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider min-w-[40px] text-center">
            {perPage === 9999 ? '1 / 1' : `${page} / ${totalPages}`}
          </span>
          <button
            onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || perPage === 9999}
            className="p-1 border-2 disabled:opacity-10 transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  const thickSeparator = (
    <div className="px-4 py-1 flex items-center gap-2">
      <div className="h-[2px] w-full" style={{ backgroundColor: 'var(--sidebar-border)', backgroundImage: 'linear-gradient(to right, var(--sidebar-border), var(--sidebar-border) 25%, transparent 25%, transparent 50%, var(--sidebar-border) 50%, var(--sidebar-border) 75%, transparent 75%, transparent)', backgroundSize: '4px 2px' }} />
    </div>
  );

  const resumePrimaryTabs: TabItem[] = [
    { key: 'templates', label: 'Template', icon: <LayoutTemplate size={18} />, draggable: false },
    { key: 'formatting', label: isLatexSelected ? 'LaTeX Formatting' : 'Formatting', icon: <Palette size={18} />, draggable: false },
  ].filter(tab => isAdvancedMode || tab.key !== 'formatting');

  const cvTabs: TabItem[] = [
    { key: 'cv-templates', label: 'Template', icon: <LayoutTemplate size={18} />, draggable: false },
    { key: 'cv-formatting', label: 'Formatting', icon: <Palette size={18} />, draggable: false },
    { key: 'cover-letter', label: 'Edit Content', icon: <FileText size={18} />, draggable: false },
  ].filter(tab => isAdvancedMode || tab.key !== 'cv-formatting');

  const toolsTabs: TabItem[] = [
    { key: 'job-link', label: 'Job Link & Description', icon: <Zap size={18} />, draggable: false },
    { key: 'import-tool', label: 'Import', icon: <Download size={18} />, draggable: false },
    { key: 'ats-score', label: 'Resume Intelligence', icon: <BarChart3 size={18} />, draggable: false },
    { key: 'ai', label: 'AI Content Suggestions', icon: <Sparkles size={18} />, draggable: false },
  ];

  const profileTab: TabItem = { key: 'basics', label: 'Profile', icon: <User size={18} />, draggable: false };

  const allTabs = [
    profileTab,
    ...resumePrimaryTabs,
    ...sectionTabs,
    { key: 'share-analytics', label: 'Share & Analytics', icon: <Share2 size={18} />, draggable: false },
    ...(isLatexTemplate(resumeData.selectedTemplate) ? [{ key: 'latex-editor' as TabKey, label: 'LaTeX Editor', icon: <Code2 size={18} />, draggable: false }] : []),
    ...cvTabs,
    ...toolsTabs,
  ].filter(tab => isAdvancedMode || (tab.key !== 'latex-editor' && tab.key !== 'share-analytics' && tab.key !== 'formatting' && tab.key !== 'cv-formatting'));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Convert tab keys back to section keys
    const activeSection = active.id === 'basics' ? 'profile' : (active.id as SectionKey);
    const overSection = over.id === 'basics' ? 'profile' : (over.id as SectionKey);

    const oldIndex = resumeData.sections.indexOf(activeSection);
    const newIndex = resumeData.sections.indexOf(overSection);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Profile must always stay at top
      if (activeSection === 'profile' || overSection === 'profile') return;

      const newSections = arrayMove(resumeData.sections, oldIndex, newIndex);
      // Aggressive uniqueness check before setting
      const uniqueSections = Array.from(new Set(newSections));
      setSections(uniqueSections);
    }
  };

  // Render all forms stacked (continuous mode)
  const renderContinuousMode = () => {
    const sections: React.ReactNode[] = [];
    const dividerClass = 'pb-6 mb-6 border-b-2' as const;

    // ━━ PERSISTENT PROFILE ━━
    sections.push(
      <div key="basics" id="continuous-section-basics" className={dividerClass}>
        <BasicsForm />
      </div>
    );

    // ━━ RESUME SECTIONS ━━
    if (showResume) {
      sections.push(<div key="res-header" className="px-4 py-4 mb-6 text-xs font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 border-y-2 border-white/10">Resume Configuration</div>);

      // Resume Template selector
      sections.push(
        <div key="templates" id="continuous-section-templates" className={dividerClass}>
          {renderTemplateFilterBar('resume', filteredResumeTemplates.length, resumeTemplateSearch, setResumeTemplateSearch, resumeTemplateFilter, setResumeTemplateFilter, resumeTemplateSort, setResumeTemplateSort)}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {paginatedResumeTemplates.map((template) => {
              const isSelected = resumeData.selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setResumeTemplate(template.id)}
                  className="group relative flex flex-col overflow-hidden border-2 transition-all rounded-none"
                  style={{
                    borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                    backgroundColor: 'var(--card-bg)',
                    boxShadow: isSelected ? '0 0 0 3px var(--accent-offset), 0 0 20px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  <div className="overflow-hidden bg-white pdf-paper relative" style={{ borderBottom: '2px solid var(--card-border)' }}>
                    <TemplateThumbnail
                      templateId={template.id}
                      previewData={previewDataSource === 'sample' ? SAMPLE_RESUME_DATA : undefined}
                    />
                    {template.isLatex && (
                      <div className="absolute top-2 right-2 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10" style={{ backgroundColor: '#1e293b' }}>
                        pdfTeX
                      </div>
                    )}
                  </div>
                  <div
                    className="p-3 text-left transition-colors relative"
                    style={{
                      backgroundColor: isSelected ? 'var(--main-bg)' : 'var(--card-bg)',
                      borderTop: isSelected ? '1px solid var(--card-border)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm leading-tight" style={{ color: isSelected ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                          {template.name}
                        </div>
                        <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isSelected ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
                          {template.description || (template.isLatex ? 'pdfTeX' : 'React PDF')}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-none flex items-center justify-center shadow-none text-white" style={{ backgroundColor: 'var(--accent)' }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {renderPagination(filteredResumeTemplates.length, resumeTemplatesPerPage, setResumeTemplatesPerPage, resumeTemplatePage, setResumeTemplatePage)}

          {/* ── My Templates (Resume) ── */}
          {isAdvancedMode && (
            <div className="border-t-2 pt-6 mt-6" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--main-text)' }}>My Templates</h3>
                <button
                  onClick={() => setShowCreateTemplate(!showCreateTemplate)}
                  className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded-none"
                >
                  <Plus size={14} />
                  <span>New Template</span>
                </button>
              </div>

              {showCreateTemplate && (
                <div className="mb-4 p-4 border-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>Template Name</label>
                      <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="e.g. Software Engineer v1"
                        className="w-full px-3 py-2 text-sm rounded-none border-2 bg-transparent text-white"
                        style={{ borderColor: 'var(--card-border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>Base Template</label>
                      <select
                        value={newTemplateBase}
                        onChange={(e) => setNewTemplateBase(Number(e.target.value) as PreloadedTemplateId)}
                        className="w-full px-3 py-2 text-sm rounded-none border-2 bg-transparent text-white"
                        style={{ borderColor: 'var(--card-border)' }}
                      >
                        {templates.filter(t => t.type === 'resume').map((t) => (
                          <option key={t.id} value={t.id}>{t.name} {t.isLatex ? '(pdfTeX)' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (!newTemplateName.trim()) return;
                          const newId = addCustomTemplate(newTemplateName.trim(), newTemplateBase, resumeData.formatting);
                          setResumeTemplate(newId);
                          setNewTemplateName('');
                          setShowCreateTemplate(false);
                        }}
                        className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${!newTemplateName.trim()
                          ? 'cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                          }`}
                        style={!newTemplateName.trim() ? { backgroundColor: 'var(--input-border)', color: 'var(--main-text-secondary)' } : {}}
                      >
                        Create
                      </button>
                      <button
                        onClick={() => { setShowCreateTemplate(false); setNewTemplateName(''); }}
                        className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
                        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--main-text)', border: '1px solid var(--card-border)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom templates grid */}
              {customTemplates.length === 0 && !showCreateTemplate ? (
                <div className="text-center py-8 border-2 border-dashed" style={{ borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' }}>
                  <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No custom templates yet</p>
                  <p className="text-xs mt-1">Click &quot;New Template&quot; to create one with your own formatting</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  {customTemplates.map((ct) => {
                    const baseName = templates.find(t => t.id === ct.baseTemplateId)?.name || 'Classic';
                    const isActive = resumeData.selectedTemplate === ct.id;
                    const isEditing = editingTemplateId === ct.id;

                    return (
                      <div
                        key={ct.id}
                        className="group relative flex flex-col overflow-hidden border-2 transition-all cursor-pointer rounded-none"
                        style={{
                          borderColor: isActive ? 'var(--accent)' : 'var(--card-border)',
                          backgroundColor: 'var(--card-bg)',
                        }}
                      >
                        <button
                          onClick={() => {
                            setResumeTemplate(ct.id);
                            updateResumeFormatting(ct.formatting);
                          }}
                          className="overflow-hidden bg-white pdf-paper w-full"
                          style={{ borderBottom: '2px solid var(--card-border)' }}
                        >
                          <TemplateThumbnail
                            templateId={ct.baseTemplateId}
                            previewData={previewDataSource === 'sample' ? SAMPLE_RESUME_DATA : undefined}
                          />
                          {isActive && (
                            <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.3 }}></div>
                          )}
                        </button>

                        <div
                          className="p-3 text-left transition-colors relative"
                          style={{
                            backgroundColor: isActive ? 'var(--main-bg)' : 'var(--card-bg)',
                            borderTop: isActive ? '1px solid var(--accent)' : 'none',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingTemplateName}
                                  onChange={(e) => setEditingTemplateName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && editingTemplateName.trim()) {
                                      updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                      setEditingTemplateId(null);
                                    }
                                    if (e.key === 'Escape') setEditingTemplateId(null);
                                  }}
                                  onBlur={() => {
                                    if (editingTemplateName.trim()) {
                                      updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                    }
                                    setEditingTemplateId(null);
                                  }}
                                  autoFocus
                                  className="w-full px-1.5 py-0.5 text-sm font-bold rounded border"
                                />
                              ) : (
                                <div className="font-bold text-sm leading-tight truncate" style={{ color: isActive ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                                  {ct.name}
                                </div>
                              )}
                              <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isActive ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
                                Based on {baseName}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isActive && (
                                <div className="text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--accent)' }}>
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingTemplateId(ct.id); setEditingTemplateName(ct.name); }}
                                title="Rename"
                                className="p-1 rounded-none transition-colors opacity-0 group-hover:opacity-100"
                                style={{ color: 'var(--main-text-secondary)' }}
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newId = addCustomTemplate(`${ct.name} (Copy)`, ct.baseTemplateId, ct.formatting);
                                  setResumeTemplate(newId);
                                  updateResumeFormatting(ct.formatting);
                                }}
                                title="Duplicate"
                                className="p-1 rounded-none transition-colors opacity-0 group-hover:opacity-100"
                                style={{ color: 'var(--main-text-secondary)' }}
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (await modal.confirm('Delete Template', `Delete "${ct.name}"?`, { destructive: true })) {
                                    deleteCustomTemplate(ct.id);
                                    if (resumeData.selectedTemplate === ct.id) setResumeTemplate(1);
                                  }
                                }}
                                title="Delete"
                                className="p-1 rounded-none transition-colors opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      );

      // Resume Formatting
      if (isAdvancedMode) {
        sections.push(
          <div key="formatting" id="continuous-section-formatting" className={dividerClass}>
            {isLatexTemplate(resumeData.selectedTemplate) ? <LaTeXFormattingForm /> : <FormattingForm />}
          </div>
        );
      }

      // Resume Content Forms (Merged with Custom Sections to prevent duplicates and respect reordering)
      sectionTabs.forEach(tab => {
        // Standard sections we handle individually
        const standardKeys = ['education', 'work', 'skills', 'projects', 'awards'];

        // Data presence checks for filtering
        let hasData = false;

        if (tab.key === 'education') hasData = resumeData.education.some(edu => edu.institution?.trim() || edu.degree?.trim());
        else if (tab.key === 'work') hasData = resumeData.work.some(job => job.company?.trim() || job.position?.trim());
        else if (tab.key === 'skills') hasData = resumeData.skills.some(s => s.category?.trim() || s.items.some(i => i.trim()));
        else if (tab.key === 'projects') hasData = resumeData.projects.some(p => p.name?.trim());
        else if (tab.key === 'awards') hasData = resumeData.awards.some(a => a.title?.trim());
        else {
          // Custom Section
          const cs = resumeData.customSections.find(c => c.id === tab.key);
          if (cs) {
            // Loosened check: if it has a title OR items with data, consider it having data
            hasData = cs.title?.trim().length > 0 || cs.items.some(item => item.title?.trim() || item.subtitle?.trim() || (item.bullets && item.bullets.some(b => b.trim())));
          }
        }

        // Only render if it has data OR it's the active tab (to allow editing)
        if (hasData || activeTab === tab.key) {
          sections.push(
            <div key={tab.key} id={`continuous-section-${tab.key}`} className={dividerClass}>
              {tab.key === 'education' && <EducationForm />}
              {tab.key === 'work' && <WorkForm />}
              {tab.key === 'skills' && <SkillsForm />}
              {tab.key === 'projects' && <ProjectsForm />}
              {tab.key === 'awards' && <AwardsForm />}
              {!standardKeys.includes(tab.key) && (
                <CustomSectionForm sectionId={tab.key} />
              )}
            </div>
          );
        }
      });

      // Share & Analytics (End of Resume Section)
      sections.push(
        <div key="share-analytics" id="continuous-section-share-analytics" className={dividerClass}>
          <ShareAnalyticsView />
        </div>
      );
    }

    // LaTeX Editor (if LaTeX template is selected) — Matched to Sidebar order (part of Resume cluster)
    if (isAdvancedMode && isLatexTemplate(resumeData.selectedTemplate)) {
      sections.push(
        <div key="latex-editor" id="continuous-section-latex-editor" className={dividerClass}>
          <Suspense fallback={
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          }>
            <LaTeXEditor />
          </Suspense>
        </div>
      );
    }

    // ━━ COVER LETTER SECTIONS ━━
    if (showCoverLetter) {
      sections.push(<div key="cv-header" className="px-4 py-4 mb-6 text-xs font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 border-y-2 border-white/10 mt-12">Cover Letter Configuration</div>);

      // CV Template selector
      sections.push(
        <div key="cv-templates" id="continuous-section-cv-templates" className={dividerClass}>
          {renderTemplateFilterBar('cv', filteredCVTemplates.length, cvTemplateSearch, setCvTemplateSearch, cvTemplateFilter, setCvTemplateFilter, cvTemplateSort, setCvTemplateSort)}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {paginatedCVTemplates.map((template) => {
              const isSelected = coverLetterData.selectedTemplate === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setCVTemplate(template.id)}
                  className="group relative flex flex-col overflow-hidden border-2 transition-all rounded-none"
                  style={{
                    borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                    backgroundColor: 'var(--card-bg)',
                    boxShadow: isSelected ? '0 0 0 3px var(--accent-offset), 0 0 20px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  <div className="overflow-hidden bg-white pdf-paper relative" style={{ borderBottom: '2px solid var(--card-border)' }}>
                    <TemplateThumbnail
                      templateId={template.id}
                      isCoverLetter={true}
                      previewData={previewDataSource === 'sample' ? SAMPLE_COVER_LETTER_DATA : undefined}
                    />
                    {template.isLatex && (
                      <div className="absolute top-2 right-2 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10" style={{ backgroundColor: '#1e293b' }}>
                        pdfTeX
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-left relative" style={{ backgroundColor: isSelected ? 'var(--main-bg)' : 'var(--card-bg)' }}>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm" style={{ color: isSelected ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>{template.name}</div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-none flex items-center justify-center shadow-none text-white" style={{ backgroundColor: 'var(--accent)' }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {renderPagination(filteredCVTemplates.length, cvTemplatesPerPage, setCvTemplatesPerPage, cvTemplatePage, setCvTemplatePage)}
        </div>
      );

      // CV Formatting
      if (isAdvancedMode) {
        sections.push(
          <div key="cv-formatting" id="continuous-section-cv-formatting" className={dividerClass}>
            <CoverLetterFormattingForm
              data={coverLetterData.formatting}
              update={updateCVFormatting}
              reset={resetCVFormatting}
            />
          </div>
        );
      }

      // CV Content
      sections.push(
        <div key="cover-letter" id="continuous-section-cover-letter" className={dividerClass}>
          <CoverLetterForm />
        </div>
      );
    }


    // Job Link & Description
    sections.push(
      <div key="job-link" id="continuous-section-job-link" className={dividerClass}>
        <JobLinkTab
          parentApplications={parentApplications}
          onLinkJob={(id) => window.parent.postMessage({ type: 'LINK_PARENT_JOB', id }, '*')}
        />
      </div>
    );

    // Import Tool
    sections.push(
      <div key="import-tool" id="continuous-section-import-tool" className={dividerClass}>
        <ImportTab
          parentDocuments={parentDocuments}
          onLoadParentDoc={(id) => window.parent.postMessage({ type: 'LOAD_PARENT_DOCUMENT', id }, '*')}
        />
      </div>
    );

    // Resume Intelligence
    sections.push(
      <div key="ats-score" id="continuous-section-ats-score" className={dividerClass}>
        <ResumeIntelligenceTab />
      </div>
    );

    // AI Content Suggestions
    sections.push(
      <div key="ai" id="continuous-section-ai" className={dividerClass}>
        <AITab />
      </div>
    );

    // Final spacer to allow bottom items to scroll to top (Reduced gap)
    sections.push(<div key="spacer" className="h-16" />);

    return sections;
  };

  // ━━ Read-Only Share Mode ━━
  // When someone opens a shared URL (?data=...), render only the PDF preview.
  if (readOnlyMode) {
    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b-2 flex-shrink-0"
          style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-text)' }}>
          <div className="flex items-center gap-3">
            <Share2 size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-black tracking-tighter uppercase italic">Shared Resume</span>
            {resumeData.basics?.name && (
              <span className="text-xs font-semibold opacity-50 ml-2">— {resumeData.basics.name}</span>
            )}
          </div>
          <a
            href={window.location.origin + window.location.pathname}
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border-2 transition-all hover:bg-white/5"
            style={{ borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-text)' }}
          >
            Build Your Own
          </a>
        </div>
        {/* Full-width PDF Preview */}
        <div className="flex-1 overflow-hidden">
          <PDFPreview
            templateId={resumeData.selectedTemplate}
            documentType="resume"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden" style={{ backgroundColor: 'var(--main-bg)', transition: 'all 0.3s ease' }}>
      {/* ━━ Mobile Header ━━ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b-2 flex-shrink-0 z-40 sticky top-0 shadow-sm"
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <button onClick={() => setSidebarOpen(v => !v)} className="p-1 rounded transition-colors active:scale-95"
          style={{ color: 'var(--sidebar-text)' }}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-sm font-black tracking-tighter uppercase italic" style={{ color: 'var(--sidebar-text)' }}>Career Studio</span>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* ━━ Mobile Bottom Navigation ━━ */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 h-16 border-2 z-[60] flex items-center justify-around px-2 rounded-2xl shadow-2xl backdrop-blur-lg"
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <button
          onClick={() => setMobileView('form')}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-2 ${mobileView === 'form' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Pencil size={20} />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Edit</span>
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-2 rounded-none ${mobileView === 'preview' ? 'bg-white/10' : 'opacity-40 hover:opacity-100'}`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Eye size={20} />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Preview</span>
        </button>
        <button
          onClick={() => {
            setMobileView('form');
            handleSidebarClick('templates');
            setSidebarOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-2 rounded-none opacity-40 hover:opacity-100`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <LayoutTemplate size={20} />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">Layout</span>
        </button>
        <button
          onClick={() => setSidebarOpen(true)}
          className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-2 rounded-none opacity-40 hover:opacity-100`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <Plus size={20} />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">More</span>
        </button>
      </div>

      {/* ━━ Mobile Sidebar Overlay ━━ */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex w-full h-screen overflow-hidden">
        {/* ━━ Sidebar ━━
            Desktop: always visible, w-56
            Mobile: slide-out drawer (fixed, overlays content) */}
        <aside className={`
      ${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 border-r-2 z-[80]
          fixed lg:sticky lg:top-0 left-0 h-full lg:h-screen
          transform transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 overflow-hidden'}
      `} style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', borderColor: 'var(--sidebar-border)' }}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-4 space-y-3">
              {/* Dashboard Link (only if iframed) */}
              {window.self !== window.top && (
                <button
                  onClick={() => window.parent.postMessage({ type: 'NAVIGATE_DASHBOARD' }, '*')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/20"
                >
                  <ArrowLeft size={14} />
                  <span>Dashboard</span>
                </button>
              )}


              <div className="flex p-0.5 bg-black/40 rounded-none border border-white/10 shadow-none overflow-hidden gap-0.5">
                <button
                  onClick={handleToggleResume}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-none text-[10px] font-black uppercase tracking-tighter border transition-all duration-200 ${showResume ? 'bg-white text-black border-white' : 'bg-transparent text-white border-transparent hover:text-white hover:bg-white/5'}`}
                >
                  <FileCheck size={13} className={showResume ? "text-black" : "text-white/40 group-hover:text-white/70"} />
                  <span>Resume</span>
                </button>
                <button
                  onClick={handleToggleCoverLetter}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-2 rounded-none text-[10px] font-black uppercase tracking-tighter border transition-all duration-200 ${showCoverLetter ? 'bg-white text-black border-white' : 'bg-transparent text-white border-transparent hover:text-white hover:bg-white/5'}`}
                >
                  <Mail size={13} className={showCoverLetter ? "text-black" : "text-white/40 group-hover:text-white/70"} />
                  <span>Cover Letter</span>
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-1 pl-1.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={continuousMode}
                      onChange={() => setContinuousMode(!continuousMode)}
                      className="sr-only"
                    />
                    <div className="w-8 h-4 rounded-none transition-all ring-2 ring-white/10"
                      style={{ backgroundColor: continuousMode ? 'var(--accent)' : 'rgba(0,0,0,0.5)' }}
                    >
                      <div className={`w-3 h-3 bg-white rounded-none shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform absolute top-[2px] ${continuousMode ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={13} className="text-white/40 group-hover:text-white/70 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 group-hover:text-white/90 transition-colors">Continuous Page</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isAdvancedMode}
                      onChange={() => setIsAdvancedMode(!isAdvancedMode)}
                      className="sr-only"
                    />
                    <div className="w-8 h-4 rounded-none transition-all ring-2 ring-white/40"
                      style={{ backgroundColor: isAdvancedMode ? 'var(--accent)' : 'rgba(0,0,0,0.5)' }}
                    >
                      <div className={`w-3 h-3 bg-white rounded-none shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform absolute top-[2px] ${isAdvancedMode ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings size={13} className="text-white/40 group-hover:text-white/70 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 group-hover:text-white/90 transition-colors">Advanced Mode</span>
                  </div>
                </label>
              </div>
            </div>

            {thickSeparator}

            {/* Sidebar Navigation */}
            <div className="flex-1 overflow-y-auto pb-6">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={allTabs.map(t => t.key)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col">

                    {/* ━━ Persistent Profile ━━ */}
                    <SidebarItem
                      tab={profileTab}
                      isActive={activeTab === 'basics'}
                      onClick={() => handleSidebarClick('basics')}
                    />
                    {thickSeparator}

                    {/* ━━ Resume Section ━━ */}
                    {showResume && (
                      <>
                        <div className="px-4 pt-4 pb-1 text-[11px] font-black uppercase tracking-[0.15em] text-white/70">Resume</div>
                        {resumePrimaryTabs.map((tab) => (
                          <SidebarItem
                            key={tab.key}
                            tab={tab}
                            isActive={activeTab === tab.key}
                            onClick={() => handleSidebarClick(tab.key)}
                          />
                        ))}
                        {sectionTabs.map((tab) => (
                          <SidebarItem
                            key={tab.key}
                            tab={tab}
                            isActive={activeTab === tab.key}
                            onClick={() => handleSidebarClick(tab.key)}
                          />
                        ))}
                        <button
                          onClick={() => {
                            const newId = addCustomSection();
                            if (!continuousMode) setActiveTab(newId);
                          }}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 mt-1 transition-colors border border-dashed border-white/15 hover:border-white/30 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/70"
                        >
                          <Plus size={14} />
                          <span>Add Custom Section</span>
                        </button>
                        <SidebarItem
                          tab={{ key: 'share-analytics', label: 'Share & Analytics', icon: <Share2 size={18} /> }}
                          isActive={activeTab === 'share-analytics'}
                          onClick={() => handleSidebarClick('share-analytics')}
                        />
                        {isAdvancedMode && isLatexTemplate(resumeData.selectedTemplate) && (
                          <SidebarItem
                            tab={{ key: 'latex-editor', label: 'LaTeX Editor', icon: <Code2 size={18} /> }}
                            isActive={activeTab === 'latex-editor'}
                            onClick={() => handleSidebarClick('latex-editor')}
                          />
                        )}
                        {thickSeparator}
                      </>
                    )}

                    {/* ━━ Cover Letter Section ━━ */}
                    {showCoverLetter && (
                      <>
                        <div className="px-4 pt-6 pb-1 text-[11px] font-black uppercase tracking-[0.15em] text-white/70">Cover Letter</div>
                        {cvTabs.map((tab) => (
                          <SidebarItem
                            key={tab.key}
                            tab={tab}
                            isActive={activeTab === tab.key}
                            onClick={() => handleSidebarClick(tab.key)}
                          />
                        ))}
                        {thickSeparator}
                      </>
                    )}

                    {/* ━━ Tools Section ━━ */}
                    <div className="px-4 pt-6 pb-1 text-[11px] font-black uppercase tracking-[0.15em] text-white/70">Tools</div>
                    {toolsTabs.map((tab) => (
                      <SidebarItem
                        key={tab.key}
                        tab={tab}
                        isActive={activeTab === tab.key}
                        onClick={() => handleSidebarClick(tab.key)}
                      />
                    ))}

                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Bottom Controls — Compact */}
            <div className="relative border-t-2 p-2 space-y-1.5 shrink-0 mt-auto backdrop-blur-md" style={{ backgroundColor: 'var(--sidebar-bg)', opacity: 0.95, borderColor: 'var(--sidebar-border)' }}>

              {/* Row 1: Undo / Redo */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all !rounded-none border-2 ${!canUndo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 active:scale-95'}`}
                  style={{ backgroundColor: 'var(--sidebar-hover)', borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-text)' }}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={12} />
                  <span>Undo</span>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className={`flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all !rounded-none border-2 ${!canRedo ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 active:scale-95'}`}
                  style={{ backgroundColor: 'var(--sidebar-hover)', borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-text)' }}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 size={12} />
                  <span>Redo</span>
                </button>
              </div>

              {/* Row 2: Save / Theme */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setParentSaveStatus('saving'); broadcastSave(); }}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all !rounded-none border-2 group"
                  style={{
                    backgroundColor: 'var(--sidebar-hover)',
                    borderColor: parentSaveStatus === 'saved' ? 'var(--accent)' : 'var(--sidebar-border)',
                    color: parentSaveStatus === 'saved' ? 'var(--accent)' : 'var(--sidebar-text)'
                  }}
                >
                  {parentSaveStatus === 'saved' ? (
                    <FileCheck size={12} className="animate-in fade-in zoom-in duration-300" />
                  ) : parentSaveStatus === 'saving' ? (
                    <Save size={12} className="opacity-50 animate-pulse" />
                  ) : (
                    <Save size={12} className="group-hover:scale-110 transition-transform" />
                  )}
                  <span>
                    {parentSaveStatus === 'saved' ? 'Saved' : parentSaveStatus === 'saving' ? 'Saving' : 'Save'}
                  </span>
                </button>
                <button
                  onClick={() => { setThemeDropdownOpen(!themeDropdownOpen); setDocDropdownOpen(false); setJobDropdownOpen(false); }}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all !rounded-none border-2"
                  style={{ backgroundColor: 'var(--sidebar-hover)', borderColor: themeDropdownOpen ? 'var(--accent)' : 'var(--sidebar-border)', color: 'var(--sidebar-text)' }}
                >
                  <Palette size={12} />
                  <span>Theme</span>
                </button>
              </div>

              {/* Row 3: Sample / Reset */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={loadAllSampleData}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all !rounded-none border-2"
                  style={{ backgroundColor: 'var(--sidebar-hover)', borderColor: 'var(--sidebar-border)', color: 'var(--sidebar-text)' }}
                >
                  <FileText size={12} />
                  <span>Sample</span>
                </button>
                <button
                  onClick={() => { resetResume(); resetCV(); setTimeout(() => broadcastSave(), 50); }}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all !rounded-none border-2"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Writing Assistant Dropdown / Widget */}
              <ProofreadingView />

              {/* Dropdown Popups (Moved to container level for perfect full-width alignment) */}
              {docDropdownOpen && (
                <div className="absolute left-0 bottom-full w-full shadow-2xl border-t-2 z-[100] overflow-hidden" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)', transform: 'translateX(0)' }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--sidebar-border)' }}>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Saved Documents</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {parentDocuments.length === 0 ? (
                      <div className="p-4 text-center text-[9px] opacity-30 uppercase tracking-widest italic">No Items Found</div>
                    ) : (
                      parentDocuments.map((doc: ParentDocument) => (
                        <button
                          key={doc.id}
                          onClick={() => { window.parent.postMessage({ type: 'LOAD_PARENT_DOCUMENT', id: doc.id }, '*'); setDocDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b last:border-0 group"
                          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                        >
                          <div className="font-bold text-[10px] truncate group-hover:text-accent transition-colors">{doc.title || 'Untitled'}</div>
                          <div className="text-[7px] opacity-40 uppercase tracking-tight">{doc.type === 'cover-letter' ? 'Cover Letter' : 'Resume'}</div>
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => { handleImport(); setDocDropdownOpen(false); }}
                    disabled={isImporting}
                    className="w-full flex items-center gap-2.5 px-4 py-3.5 text-[9px] font-black uppercase tracking-widest border-t hover:bg-white/5 transition-all group"
                    style={{ borderColor: 'var(--sidebar-border)', color: 'var(--accent)' }}
                  >
                    <Upload size={12} className="group-hover:scale-110 transition-transform" />
                    <span>{isImporting ? 'Importing...' : 'Import JSON/PDF'}</span>
                  </button>
                </div>
              )}

              {jobDropdownOpen && (
                <div className="absolute left-0 bottom-full w-full shadow-2xl border-t-2 z-[100] overflow-hidden" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
                  <div className="px-4 py-3.5 border-b flex items-center gap-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'var(--sidebar-border)' }}>
                    <Search size={12} className="opacity-20" />
                    <input
                      type="text"
                      value={jobSearch}
                      onChange={e => setJobSearch(e.target.value)}
                      placeholder="SEARCH JOBS..."
                      className="bg-transparent text-[9px] outline-none w-full font-black tracking-widest uppercase placeholder:opacity-20 translate-y-[0.5px]"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {parentApplications.filter(app => !jobSearch || app.company.toLowerCase().includes(jobSearch.toLowerCase()) || app.position.toLowerCase().includes(jobSearch.toLowerCase())).length === 0 ? (
                      <div className="p-4 text-center text-[9px] opacity-30 uppercase tracking-widest italic">No Match</div>
                    ) : (
                      parentApplications
                        .filter(app => !jobSearch || app.company.toLowerCase().includes(jobSearch.toLowerCase()) || app.position.toLowerCase().includes(jobSearch.toLowerCase()))
                        .map((app: ParentApplication) => (
                          <button
                            key={app.id}
                            onClick={() => { window.parent.postMessage({ type: 'LINK_PARENT_JOB', id: app.id }, '*'); setJobDropdownOpen(false); }}
                            className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b last:border-0 border-white/5 group"
                          >
                            <div className="font-bold text-[10px] truncate group-hover:text-accent transition-colors">{app.position}</div>
                            <div className="text-[7px] opacity-40 uppercase tracking-tight">{app.company}</div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}

              {themeDropdownOpen && (
                <div className="absolute left-0 bottom-full w-full shadow-2xl border-t-2 z-[100] overflow-hidden max-h-64 overflow-y-auto" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => { handleSetTheme(theme.id); setThemeDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase tracking-widest flex items-center gap-3 transition-colors ${themeId === theme.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      style={{ color: 'var(--sidebar-text)' }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: theme.swatch }} />
                      <span className="flex-1">{theme.name}</span>
                      {themeId === theme.id && <Check size={10} strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        </aside>

        {/* ━━ Main Content Area ━━ */}
        <main className={`flex-1 flex flex-col h-full overflow-y-auto ${mobileView !== 'form' ? 'hidden lg:flex' : 'flex'}`}
          style={{ backgroundColor: 'var(--main-bg)', color: 'var(--main-text)' }}>
          {/* Desktop Toggles */}
          <div className="hidden lg:flex items-center justify-between px-6 py-2 sticky top-0 z-50 backdrop-blur-md border-b"
            style={{ backgroundColor: 'var(--main-bg)', borderColor: 'var(--card-border)' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-black/5 rounded transition-colors" title="Toggle Sidebar">
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Editor Focus</span>
              <button
                onClick={() => setMobileView(mobileView === 'preview' ? 'form' : 'preview')}
                className="p-1.5 hover:bg-black/5 rounded transition-colors"
                title="Toggle Preview Focus"
              >
                {mobileView === 'preview' ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto px-2 py-3 sm:p-4 lg:p-8">
            {continuousMode ? (
              renderContinuousMode()
            ) : (
              <div className="w-full">
                {activeTab === 'basics' && <BasicsForm />}
                {activeTab === 'work' && showResume && <WorkForm />}
                {activeTab === 'education' && showResume && <EducationForm />}
                {activeTab === 'skills' && showResume && <SkillsForm />}
                {activeTab === 'projects' && showResume && <ProjectsForm />}
                {activeTab === 'awards' && showResume && <AwardsForm />}
                {activeTab === 'share-analytics' && showResume && <ShareAnalyticsView />}
                {activeTab.startsWith('custom-') && showResume && <CustomSectionForm sectionId={activeTab} />}
                {activeTab === 'cover-letter' && showCoverLetter && <CoverLetterForm />}
                {activeTab === 'latex-editor' && isAdvancedMode && isLatexTemplate(resumeData.selectedTemplate) && (
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  }>
                    <LaTeXEditor />
                  </Suspense>
                )}
                {activeTab === 'ai' && <AITab />}
                {activeTab === 'ats-score' && <ResumeIntelligenceTab />}
                {activeTab === 'job-link' && (
                  <JobLinkTab
                    parentApplications={parentApplications}
                    onLinkJob={(id) => window.parent.postMessage({ type: 'LINK_PARENT_JOB', id }, '*')}
                  />
                )}
                {activeTab === 'import-tool' && (
                  <ImportTab
                    parentDocuments={parentDocuments}
                    onLoadParentDoc={(id) => window.parent.postMessage({ type: 'LOAD_PARENT_DOCUMENT', id }, '*')}
                  />
                )}
                {isAdvancedMode && (activeTab === 'formatting' || activeTab === 'cv-formatting') && (
                  activeTab === 'cv-formatting'
                    ? <CoverLetterFormattingForm
                      data={coverLetterData.formatting}
                      update={updateCVFormatting}
                      reset={resetCVFormatting}
                    />
                    : (isLatexSelected ? <LaTeXFormattingForm /> : <FormattingForm />)
                )}
                {(activeTab === 'templates' || activeTab === 'cv-templates') && (
                  <div className="space-y-6">
                    {activeTab === 'cv-templates'
                      ? renderTemplateFilterBar('cv', filteredCVTemplates.length, cvTemplateSearch, setCvTemplateSearch, cvTemplateFilter, setCvTemplateFilter, cvTemplateSort, setCvTemplateSort)
                      : renderTemplateFilterBar('resume', filteredResumeTemplates.length, resumeTemplateSearch, setResumeTemplateSearch, resumeTemplateFilter, setResumeTemplateFilter, resumeTemplateSort, setResumeTemplateSort)}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(activeTab === 'cv-templates' ? paginatedCVTemplates : paginatedResumeTemplates)
                        .map((template) => {
                          const isCV = activeTab === 'cv-templates';
                          const isSelected = isCV
                            ? coverLetterData.selectedTemplate === template.id
                            : resumeData.selectedTemplate === template.id;

                          return (
                            <button
                              key={template.id}
                              onClick={() => isCV ? setCVTemplate(template.id) : setResumeTemplate(template.id)}
                              className="group relative flex flex-col overflow-hidden border-2 transition-all rounded-none"
                              style={{
                                borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                                backgroundColor: 'var(--card-bg)',
                                boxShadow: isSelected ? '0 0 0 3px var(--accent-offset), 0 0 20px rgba(0,0,0,0.3)' : 'none'
                              }}
                            >
                              <div className="overflow-hidden bg-white pdf-paper relative" style={{ borderBottom: '2px solid var(--card-border)' }}>
                                <TemplateThumbnail
                                  templateId={template.id}
                                  previewData={previewDataSource === 'sample' ? SAMPLE_RESUME_DATA : undefined}
                                  isCoverLetter={isCV}
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.4 }}></div>
                                )}
                                {template.isLatex && (
                                  <div className="absolute top-2 right-2 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 shadow-lg z-10" style={{ backgroundColor: '#1e293b' }}>
                                    pdfTeX
                                  </div>
                                )}
                              </div>

                              <div
                                className="p-3 text-left transition-colors relative"
                                style={{
                                  backgroundColor: isSelected ? 'var(--main-bg)' : 'var(--card-bg)',
                                  borderTop: isSelected ? '1px solid var(--card-border)' : 'none',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-bold text-sm leading-tight" style={{ color: isSelected ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                                      {template.name}
                                    </div>
                                    <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isSelected ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
                                      {template.description || (template.isLatex ? 'pdfTeX' : 'React PDF')}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="w-6 h-6 rounded-none flex items-center justify-center shadow-none text-white" style={{ backgroundColor: 'var(--accent)' }}>
                                      <Check size={14} strokeWidth={3} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>

                    {activeTab === 'cv-templates'
                      ? renderPagination(filteredCVTemplates.length, cvTemplatesPerPage, setCvTemplatesPerPage, cvTemplatePage, setCvTemplatePage)
                      : renderPagination(filteredResumeTemplates.length, resumeTemplatesPerPage, setResumeTemplatesPerPage, resumeTemplatePage, setResumeTemplatePage)}

                    {/* ━━ My Templates ━━ */}
                    {activeTab === 'templates' && isAdvancedMode && (
                      <div className="border-t-2 pt-6" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold" style={{ color: 'var(--main-text)' }}>My Templates</h3>
                          <button
                            onClick={() => setShowCreateTemplate(!showCreateTemplate)}
                            className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded"
                          >
                            <Plus size={14} />
                            <span>New Template</span>
                          </button>
                        </div>

                        {/* Create template form */}
                        {showCreateTemplate && (
                          <div className="mb-4 p-4 border-2" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>
                                  Template Name
                                </label>
                                <input
                                  type="text"
                                  value={newTemplateName}
                                  onChange={(e) => setNewTemplateName(e.target.value)}
                                  placeholder="e.g. Software Engineer v1"
                                  className="w-full px-3 py-2 text-sm rounded border-2"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--main-text-secondary)' }}>
                                  Base Template
                                </label>
                                <select
                                  value={newTemplateBase}
                                  onChange={(e) => setNewTemplateBase(Number(e.target.value) as PreloadedTemplateId)}
                                  className="w-full px-3 py-2 text-sm rounded border-2"
                                >
                                  {templates.filter(t => t.type === 'resume').map((t) => (
                                    <option key={t.id} value={t.id}>{t.name} {t.isLatex ? '(pdfTeX)' : ''}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (!newTemplateName.trim()) return;
                                    const newId = addCustomTemplate(newTemplateName.trim(), newTemplateBase, resumeData.formatting);
                                    setResumeTemplate(newId);
                                    setNewTemplateName('');
                                    setShowCreateTemplate(false);
                                  }}
                                  disabled={!newTemplateName.trim()}
                                  className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${!newTemplateName.trim()
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'bg-green-600 hover:bg-green-500 text-white'
                                    }`}
                                  style={!newTemplateName.trim() ? { backgroundColor: 'var(--input-border)', color: 'var(--main-text-secondary)' } : {}}
                                >
                                  Create
                                </button>
                                <button
                                  onClick={() => { setShowCreateTemplate(false); setNewTemplateName(''); }}
                                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors"
                                  style={{ backgroundColor: 'var(--card-bg)', color: 'var(--main-text)', border: '2px solid var(--card-border)' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Custom templates grid */}
                        {customTemplates.length === 0 && !showCreateTemplate ? (
                          <div className="text-center py-8 border-2 border-dashed" style={{ borderColor: 'var(--card-border)', color: 'var(--main-text-secondary)' }}>
                            <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-semibold">No custom templates yet</p>
                            <p className="text-xs mt-1">Click &quot;New Template&quot; to create one with your own formatting</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {customTemplates.map((ct) => {
                              const bName = templates.find(t => t.id === ct.baseTemplateId)?.name || 'Classic';
                              const isActive = resumeData.selectedTemplate === ct.id;
                              const isEditing = editingTemplateId === ct.id;

                              return (
                                <div
                                  key={ct.id}
                                  className="group relative flex flex-col overflow-hidden border-2 transition-all cursor-pointer"
                                  style={{
                                    borderColor: isActive ? 'var(--accent)' : 'var(--card-border)',
                                    backgroundColor: 'var(--card-bg)',
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setResumeTemplate(ct.id);
                                      updateResumeFormatting(ct.formatting);
                                    }}
                                    className="overflow-hidden bg-white pdf-paper w-full"
                                    style={{ borderBottom: '2px solid var(--card-border)' }}
                                  >
                                    <TemplateThumbnail
                                      templateId={ct.baseTemplateId}
                                      previewData={previewDataSource === 'sample' ? SAMPLE_RESUME_DATA : undefined}
                                    />
                                    {isActive && (
                                      <div className="absolute inset-0 pointer-events-none" style={{ border: '4px solid var(--accent)', opacity: 0.3 }}></div>
                                    )}
                                  </button>

                                  <div
                                    className="p-3 text-left transition-colors relative"
                                    style={{
                                      backgroundColor: isActive ? 'var(--main-bg)' : 'var(--card-bg)',
                                      borderTop: isActive ? '1px solid var(--accent)' : 'none',
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={editingTemplateName}
                                            onChange={(e) => setEditingTemplateName(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter' && editingTemplateName.trim()) {
                                                updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                                setEditingTemplateId(null);
                                              }
                                              if (e.key === 'Escape') setEditingTemplateId(null);
                                            }}
                                            onBlur={() => {
                                              if (editingTemplateName.trim()) {
                                                updateCustomTemplate(ct.id, { name: editingTemplateName.trim() });
                                              }
                                              setEditingTemplateId(null);
                                            }}
                                            autoFocus
                                            className="w-full px-1.5 py-0.5 text-sm font-bold rounded border"
                                          />
                                        ) : (
                                          <div className="font-bold text-sm leading-tight truncate" style={{ color: isActive ? 'var(--main-text)' : 'var(--main-text-secondary)' }}>
                                            {ct.name}
                                          </div>
                                        )}
                                        <div className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider" style={{ color: isActive ? 'var(--accent)' : 'var(--main-text-secondary)' }}>
                                          Based on {bName}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {isActive && (
                                          <div className="text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--accent)' }}>
                                            <Check size={12} strokeWidth={3} />
                                          </div>
                                        )}
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditingTemplateId(ct.id); setEditingTemplateName(ct.name); }}
                                          title="Rename"
                                          className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                          style={{ color: 'var(--main-text-secondary)' }}
                                        >
                                          <Pencil size={12} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newId = addCustomTemplate(`${ct.name} (Copy)`, ct.baseTemplateId, ct.formatting);
                                            setResumeTemplate(newId);
                                            updateResumeFormatting(ct.formatting);
                                          }}
                                          title="Duplicate"
                                          className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                                          style={{ color: 'var(--main-text-secondary)' }}
                                        >
                                          <Copy size={12} />
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            if (await modal.confirm('Delete Template', `Delete "${ct.name}"?`, { destructive: true })) {
                                              deleteCustomTemplate(ct.id);
                                              if (resumeData.selectedTemplate === ct.id) setResumeTemplate(1);
                                            }
                                          }}
                                          title="Delete"
                                          className="p-1 rounded transition-colors opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main >

        {/* ━━ PDF Preview Panel ━━ */}
        <aside className={`
          flex-shrink-0 transition-all duration-300
          ${mobileView === 'preview' ? 'w-full 2xl:w-[1100px] xl:w-[900px] lg:w-[70%]' : 'w-full 2xl:w-[800px] xl:w-[550px] lg:w-[40%] md:w-[350px]'}
          ${mobileView !== 'preview' ? 'hidden lg:block md:block' : ''}
          `} style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="sticky top-0 h-screen">
            <PDFPreview
              templateId={documentType === 'coverletter' ? coverLetterData.selectedTemplate : resumeData.selectedTemplate}
              documentType={documentType}
              showResume={showResume}
              showCoverLetter={showCoverLetter}
              onDocumentTypeChange={setDocumentType}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function AppWithProvider() {
  return (
    <ModalProvider>
      <App />
    </ModalProvider>
  );
}

export default AppWithProvider;
