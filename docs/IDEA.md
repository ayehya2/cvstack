# CVStack — Feature Ideas & Planning

Status key: ✅ Implemented | 🔄 Partially Implemented | 📋 Planned

---

## 1. Template Deduplication & Density System ✅

**Goal:** Each unique design = one template card. Spacing/density variations are selectable options per card.

**Status: Implemented.**

- `Density` type: `'ultra' | 'compact' | 'standard' | 'large'`
- `REACT_DENSITY_PRESETS` in App.tsx maps each density to font size, line spacing, margin, and spacing fields
- LaTeX Professional uses template IDs 11 (standard), 12 (compact), 13 (ultra) — selected automatically when density changes
- LaTeX Academic has `ACADEMIC_LATEX_DENSITY_PRESETS` per density level
- Each template card shows ULTRA / COMPACT / STANDARD / LARGE buttons
- Selecting a density immediately updates the preview via the same debounced thumbnail pipeline
- Custom templates inherit the density system through `FormattingOptions`

---

## 2. Bullet Point Customization ✅

**Goal:** Users can choose bullet styles from a predefined set.

**Status: Implemented.**

- UI: dropdown/selector in the formatting panel
- Supported styles: `•` `–` `*` `○` `□` `■` `★` `→` `✓`
- LaTeX mapping: each symbol mapped to correct LaTeX representation (e.g. `\textbullet`, `\(\circ\)`, `\checkmark`)
- React PDF: same symbols rendered natively
- Required packages (e.g. `amssymb`) included automatically when needed
- `enumitem` used for clean label control in LaTeX

---

## 3. Static Image Previews for Default Templates 📋

**Problem:**
- Template card thumbnails are currently live-rendered — every card triggers a real PDF render (React PDF or LaTeX API call)
- This wastes CPU/network on render for templates the user may never select
- The thumbnail container clips the preview; the full first page is not visible
- There is no per-density preview — switching Ultra/Compact/Standard/Large re-renders the same template with different params rather than showing a pre-captured image

**Plan:**

### 3a. Pre-generate Static Previews

- Write a one-off script (`scripts/generate-template-previews.ts`) that:
  1. Loads each default template (IDs 1–9, 11–14) with sample data (`sampleResumeData`)
  2. Renders each at all 4 density levels (ultra/compact/standard/large)
  3. Captures page 1 as a PNG at 1x scale (letter page: 816×1056px before any scaling)
  4. Saves outputs to `src/assets/template-previews/<templateId>-<density>.png`
- Script runs with `tsx` or `vite-node` in Node, using `@react-pdf/renderer` server-side + `pdfjs-dist` for React PDF templates; for LaTeX templates it calls the compile API and saves the result

### 3b. StaticTemplateThumbnail Component

- New component: `src/components/preview/StaticTemplateThumbnail.tsx`
- For default templates (IDs 1–14): renders `<img src={staticPreviewUrl} />` instead of `<PDFThumbnail />`
- Image fits inside the card container using `object-fit: contain` so the **full first page is visible** (no cutoff)
- Falls back to live `<PDFThumbnail />` if the static asset is missing (e.g. in dev before script runs)
- `TemplateThumbnail` updated to route: `id < 100 && staticPreviewExists → StaticTemplateThumbnail`

### 3c. Per-Density Preview Images

- Each card shows the static preview for the **currently selected density**
- When user clicks ULTRA / COMPACT / STANDARD / LARGE, the image src swaps instantly (no render delay)
- Image filenames: `classic-ultra.png`, `classic-compact.png`, `classic-standard.png`, `classic-large.png`
- "Your Data" toggle (or a separate tab on the card): switches back to live `<PDFThumbnail />` using actual user resume data

### 3d. Implementation Steps

1. Add `scripts/generate-template-previews.ts`
2. Add `src/assets/template-previews/` directory with generated PNGs committed to repo
3. Create `StaticTemplateThumbnail.tsx` component
4. Update `TemplateThumbnail.tsx` routing logic
5. Update template card in `App.tsx` to pass `density` prop to `TemplateThumbnail`
6. Add "Your Data" button per card that enables live preview for that card only

---

## 4. New LaTeX Templates 📋

**Current LaTeX templates:**
- 11: Professional (11pt, 0.75in margins)
- 12: Compact (10pt, 0.5in margins) — density variant of 11
- 13: Ultra Compact (9pt, 0.35in margins) — density variant of 11
- 14: Academic (11pt, 1in margins, two-column skills)

**Planned new LaTeX templates:**

### 4a. Two-Column LaTeX (ID 15)

- **Design:** Left sidebar (~30% width) for skills/contact/education; right main column (~70%) for experience
- **Use case:** Maximizes content density for experienced candidates
- **LaTeX technique:** `minipage` or `paracol` package for two-column layout
- **Density support:** Ultra/Compact/Standard/Large via column width ratio + font size

### 4b. Modern Sans-Serif LaTeX (ID 16)

- **Design:** Uses `fontspec` + `Inter` or `SourceSansPro` for a clean sans-serif look
- **Requires XeLaTeX** (not pdfLaTeX) — API must support `xelatex` engine
- **Design:** Colored section headers (e.g. `#2563EB` blue), thin rule under name
- **Density support:** Same 4-level system

### 4c. Minimal ATS-Safe LaTeX (ID 17)

- **Design:** Zero decorative elements; pure single-column; standard fonts; no tables, colors, or columns
- **Use case:** Maximizes ATS parse accuracy
- **LaTeX technique:** Plain article class, `geometry`, `enumitem` only — no custom packages
- **Density support:** Standard and Compact only (ultra/large provided as minor tweaks)

### 4d. European CV / Europass-Inspired (ID 18)

- **Design:** Structured two-section layout common in EU job markets; date in left margin, content right
- **Use case:** EU job applications
- **LaTeX technique:** `moderncv` or manual `tabular` with date column
- **Density support:** Standard and Compact

**Implementation order:** 17 (quickest, no new packages) → 15 → 14a → 16 (requires engine change)

---

## 5. Known Layout Bugs (Ultra Compact LaTeX) 🔄

Issues observed in template 13 (Ultra Compact):

1. **Summary section** — extra tab/indent at start of paragraph
2. **Education section** — second school entry is over-indented compared to bullet points; some lines touch each other
3. **Projects section** — first project is tabbed in inconsistently vs subsequent ones
4. **Skills section** — first skill line is indented, next line starts at column 0; not aligned; should either have consistent indent with bullets or no indent

Root cause: spacing overrides at `9pt` / `0.35in` margins push `\leftskip` and `\parindent` into conflict with `enumitem` list indentation.

Fix plan: audit `latexGenerator.ts` TEMPLATE_CONFIGS for ID 13 — normalize `\leftskip=0pt`, `\parindent=0pt`, and ensure `enumitem` `leftmargin` is set explicitly rather than relying on defaults.

---

## 6. Cover Letter Templates 🔄

- IDs 24–25: React PDF cover letter variants (implemented)
- IDs 21–22: LaTeX cover letter variants (implemented)
- Planned: add cover letter variants for new templates 15–18 when added

---

## Screenshot (Template Grid — Current State)

![Template grid showing cutoff previews](image-2.webp)

Notes:
- Each card shows ULTRA / COMPACT / STANDARD / LARGE density selector — ✅ implemented
- Preview images are live-rendered (cut off, resource-heavy) — targeted by plan §3
- Static per-density previews not yet generated — targeted by plan §3

---

*Last updated: 2026-04-16*
