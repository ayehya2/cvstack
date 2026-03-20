# CVStack
> Professional-grade resume & cover letter builder.

**Live Site**: [cvstack.vercel.app](https://cvstack.vercel.app/) | **GitHub**: [ayehya2/cvstack](https://github.com/ayehya2/cvstack)

## The JobMint Ecosystem

CVStack is a core module of the JobMint platform. Each module works standalone or integrates seamlessly:

| Module | Purpose | Live Site | GitHub |
| :--- | :--- | :--- | :--- |
| **JobMint** | Central Dashboard & Job Tracking | [jobmint.vercel.app](https://jobmint.vercel.app/) | [ayehya2/jobmint](https://github.com/ayehya2/jobmint) |
| **CVStack** (this repo) | Resume & Cover Letter Builder | [cvstack.vercel.app](https://cvstack.vercel.app/) | [ayehya2/cvstack](https://github.com/ayehya2/cvstack) |
| **InterviewMint** | AI Interview Simulator | [interviewmint.vercel.app](https://interviewmint.vercel.app/) | [ayehya2/interviewmint](https://github.com/ayehya2/interviewmint) |
| **PortfolioMint** | Professional Web Portfolios | [portfoliomint.vercel.app](https://portfoliomint.vercel.app/) | [ayehya2/portfoliomint](https://github.com/ayehya2/portfoliomint) |
| **GrowthMint** | Career Path Trajectory | [growthmint.vercel.app](https://growthmint.vercel.app/) | [ayehya2/growthmint](https://github.com/ayehya2/growthmint) |

---

A professional-grade **resume & cover letter builder** with pixel-perfect PDF output, 14+ templates, and real-time WYSIWYG preview. Built with **React**, **TypeScript**, and powered by both **@react-pdf/renderer** and **pdfLaTeX**.

- **Standalone**: Full feature access at [cvstack.vercel.app](https://cvstack.vercel.app/).
- **Integrated**: Seamlessly embedded in the [JobMint](https://jobmint.vercel.app/) dashboard with real-time theme synchronization and data sharing.

## Features

- **Full Document Editor** — Profile, Experience, Education, Skills, Projects, Awards, and Cover Letters
- **14+ Professional Templates** — Classic, Modern, Technical, Creative, Academic, Compact, Elegant, Executive, and Minimal layouts with LaTeX variants for both resumes and cover letters
- **Live PDF Preview** — Real-time, high-fidelity Letter-sized preview with continuous scroll mode
- **LaTeX Support** — Monaco editor integration for direct LaTeX template editing and compilation
- **Deep Formatting Controls** — Typography, line heights, section spacing, margins, and decorative elements
- **Undo/Redo History** — Full edit history for both resumes and cover letters with keyboard shortcuts (Ctrl+Z/Y)
- **Writing Assistant** — Inline spell check, grammar analysis, and style suggestions powered by LanguageTool
- **Rich Text Editing** — Inline bold, italic, underline, strikethrough, and link support within bullet points and descriptions
- **Resume Intelligence** — Resume quality scoring, ATS keyword matching, and real-time suggestions with 30s auto-refresh
- **Persistence** — Auto-save to local storage, JSON import/export, and DOCX import
- **Premium Theming** — 10+ built-in themes with full dark mode support
- **Template Gallery** — Browse, preview, and select templates with filtering and pagination
- **Pixel-Perfect PDF Export** — Production-quality PDF generation for print and digital use
- **Standardized Form System** — Consistent input heights, labels, and focus states across all form components
- **Embeddable** — Runs standalone or as an iframe module within JobMint

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript 5.9 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand |
| **Rich Text** | TipTap (ProseMirror) |
| **Drag & Drop** | @dnd-kit |
| **PDF Engine** | @react-pdf/renderer + pdfLaTeX |
| **Code Editor** | Monaco Editor |
| **Form Validation** | React Hook Form + Zod |

## Running Locally

```bash
npm install
npm run dev       # starts on port 5173
npm run build     # production build
```

## Integration with JobMint

CVStack is embedded as a **Git submodule** inside [JobMint](https://github.com/ayehya2/jobmint) at `src/modules/cvstack`. When embedded:

- **Theme sync** — Inherits the parent app's active theme via `postMessage`
- **Document management** — Saves/loads documents through the parent's localStorage
- **Job linking** — Links resumes and cover letters to tracked job applications
- **Prefill** — Accepts pre-filled job data via URL parameters

### Handshake API

CVStack fires upward to JobMint:

```typescript
{ type: 'RESUME_UPDATED', payload: ResumeData }
{ type: 'COVER_LETTER_UPDATED', payload: CoverLetterData }
{ type: 'JOB_LINKED', payload: { jobId: string } }
{ type: 'REQUEST_SAVED_RESUME', payload: { documentId: string } }
```

JobMint fires downward to CVStack:

```typescript
{ type: 'THEME_SYNC', payload: { theme: string } }
{ type: 'RESUME_LOADED', payload: ResumeData }
{ type: 'JOB_CONTEXT', payload: JobData }
{ type: 'SAVE_CONFIRMED', payload: { documentId: string } }
```

## Authentication (CI/CD)

All repos in the ecosystem use a single GitHub PAT stored as **`SUB_TOKEN`**.

1. Generate a classic PAT with `repo` scope at [github.com/settings/tokens](https://github.com/settings/tokens).
2. Add it as a repository secret named `SUB_TOKEN` in **all 5 repos**.
3. For Vercel: add `SUB_TOKEN` as an environment variable in project settings.

## Roadmap

- [x] **Rich Text** — Inline bold/italic/underline support within descriptions
- [x] **ATS Scoring** — Resume intelligence with quality scoring and keyword matching
- [x] **Form Standardization** — Consistent input sizing and layout across all form components
- [ ] **AI Assistance** — Smart bullet point suggestions and content generation
- [ ] **Cloud Sync** — Cross-device access via cloud storage providers
- [ ] **International CV Formats** — Region-specific formats (European CV, Japanese Rirekisho, etc.)
- [ ] **Cloud Document Pagination** — Grid view and pagination for document lists

---

Built by [ayehya2](https://github.com/ayehya2) & [sankeer28](https://github.com/sankeer28)
