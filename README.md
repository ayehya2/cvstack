# ⚡ CVStack

A professional-grade **resume & cover letter builder** with pixel-perfect PDF output, 13+ templates, and real-time WYSIWYG preview. Built with **React**, **TypeScript**, and powered by both **@react-pdf/renderer** and **pdfLaTeX**.

> **Live at** [cvstack.vercel.app](https://cvstack.vercel.app)

## ✨ Features

- 📝 **Full Document Editor** — Profile, Experience, Education, Skills, Projects, Awards, and Cover Letters
- 🎨 **13+ Professional Templates** — Classic, Modern, Technical, Creative, Academic, Compact, Elegant, Executive, and Minimal layouts with LaTeX variants for both resumes and cover letters
- 👁️ **Live PDF Preview** — Real-time, high-fidelity Letter-sized preview with continuous scroll mode
- ✍️ **LaTeX Support** — Monaco editor integration for direct LaTeX template editing and compilation
- 🎯 **Deep Formatting Controls** — Typography, line heights, section spacing, margins, and decorative elements
- ⏳ **Undo/Redo History** — Full edit history for both resumes and cover letters with keyboard shortcuts (Ctrl+Z/Y)
- ✅ **Writing Assistant** — Inline spell check, grammar analysis, and style suggestions powered by LanguageTool
- ✍️ **Rich Text Editing** — Inline bold, italic, underline, strikethrough, and link support within bullet points and descriptions
- 🎯 **Resume Intelligence** — Resume quality scoring, ATS keyword matching, and real-time suggestions with 30s auto-refresh
- 💾 **Persistence** — Auto-save to local storage, JSON import/export, and DOCX import
- 🌓 **Premium Theming** — 10+ built-in themes with full dark mode support
- 📋 **Template Gallery** — Browse, preview, and select templates with filtering and pagination
- 🖨️ **Pixel-Perfect PDF Export** — Production-quality PDF generation for print and digital use
- 📐 **Standardized Form System** — Consistent input heights, labels, and focus states across all form components
- 🔗 **Embeddable** — Runs standalone or as an iframe module within [JobMint](https://github.com/ayehya2/jobmint)

## 🏗️ Tech Stack

| Layer               | Technology                     |
| ------------------- | ------------------------------ |
| **Frontend**        | React 19 + TypeScript 5.9      |
| **Build Tool**      | Vite 7                         |
| **Styling**         | Tailwind CSS v4                |
| **State**           | Zustand                        |
| **Rich Text**       | TipTap (ProseMirror)           |
| **Drag & Drop**     | @dnd-kit                       |
| **PDF Engine**      | @react-pdf/renderer + pdfLaTeX |
| **Code Editor**     | Monaco Editor                  |
| **Form Validation** | React Hook Form + Zod          |

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server (port 5173)
npm run dev

# Build for production
npm run build
```

## 🔗 Integration with JobMint

CVStack is embedded as a **Git submodule** inside [JobMint](https://github.com/ayehya2/jobmint) at `src/modules/cvstack`. When embedded:

- **Theme sync** — Inherits the parent app's active theme via `postMessage`
- **Document management** — Saves/loads documents through the parent's localStorage
- **Job linking** — Links resumes and cover letters to tracked job applications
- **Prefill** — Accepts pre-filled job data via URL parameters

## 📋 Roadmap

- [x] **Rich Text** — Inline bold/italic/underline support within descriptions ✅
- [x] **ATS Scoring** — Resume intelligence with quality scoring and keyword matching ✅
- [x] **Form Standardization** — Consistent input sizing and layout across all form components ✅
- [ ] **AI Assistance** — Smart bullet point suggestions and content generation
- [ ] **Cloud Sync** — Cross-device access via cloud storage providers
- [ ] **Cloud Document Pagination** — Grid view and pagination for document lists

---

Built with ❤️ by [ayehya2](https://github.com/ayehya2) & [sankeer28](https://github.com/sankeer28)
