# AGENTS.md — Repository Delta & Clinical YMYL Invariants (`PCM` / PresCMed v2.1)

> **Global Kernel Inheritance:** Universal Golden Rules (1–8), `Managed Antigravity Agent` constraints, Technical English internals / **Portuguese (`pt-BR`)** user bridge, and the Self-Refine Closing Block inherit from `quality-efficiency-guidelines.md` (`always_on`).

## 0. PROJECT CONTEXT & COMMANDS

- **Project:** `PCM` (**PresCMed** — Digital Medical Prescription System, Pediatric Dose Calculator, SUS Forms, Hospital Module `MOD-03`, and CDSS Scoreboard).
- **Active Stack:** TypeScript 5.8+ / Node LTS + React 19 + Vite 6 + Tailwind CSS v4 + Dexie.js 4 (`package.json`) — 100% Client-Side SPA.
- **Executable Commands (`Command-First`):**
  - `npm ci` — Reproducible install from `package-lock.json`
  - `npm run dev` — Vite dev server on port `3001` (`host 0.0.0.0`)
  - `npm run lint` — Strict type-check (`tsc --noEmit`)
  - `npm run design:lint` — Validate [`DESIGN.md`](file:///C:/Users/melki/dev/repos/PCM/DESIGN.md) compliance
  - `npm run test` — Full Vitest suite (`29` suites / `280` deterministic tests)
  - `npm run build` — Production build in `dist/`
- **State Triad:** [`.context/context.md`](file:///C:/Users/melki/dev/repos/PCM/.context/context.md) | [`.context/spec.md`](file:///C:/Users/melki/dev/repos/PCM/.context/spec.md) | [`docs/CLINICAL_AND_RUNTIME_SPEC.md`](file:///C:/Users/melki/dev/repos/PCM/docs/CLINICAL_AND_RUNTIME_SPEC.md)

## 1. NON-NEGOTIABLE CLINICAL (YMYL) & A4 PRINT INVARIANTS

1. **100% Client-Side SPA & `html2canvas-pro`:** `@google/genai`, `express`, `dotenv`, and `motion` do not exist in this repo. Never replace `html2canvas-pro` with standard `html2canvas`.
2. **Single-Source Physical `FolhaA4` (`794×1123 px`):** What renders inside `FolhaA4` is exactly what exports to PDF. Never use responsive breakpoints (`sm:`, `md:`) or `dark:` classes inside the physical sheet (always `#FFFFFF` background and dark ink).
3. **Clinical Safety Locks:**
   - `"Sem peso, sem dose"` (no weight, no dose) in pediatrics and emergency calculators; zero fabricated/assumed clinical data.
   - Format milligrams with a decimal comma and **zero thousands separators** (`"7,5 mg"`, `"1000 mg"`).
   - Print ICD-10 (`CID-10`) on medical certificates strictly when `authorizedByPatient = true` (CFM Resolution 1.658/2002).
   - Enforce 3 separate sanitary regimes (*Simples*, *Antimicrobiano* RDC 471/2021, and *Controle Especial* Portaria 344/98) with Notification warnings in `.no-print`.
   - Format local dates exclusively via `dataLocalISO` and render icons exclusively via `<Icon name="..." />` (`src/components/Icon.tsx`).

## 2. EVOLUTIONARY MEMORY (Project-Learned Rules)

- **Adversarial Clinical & Cloud Boundary Tests:** Every test for sanitary rules (CFM 1.658/2002, Portaria 344/98, RDC 471/2021), dose math (`"sem peso, sem dose"`), HTML sanitization (`sanitizeHtml.ts`), or Cloud sync (`firestore.rules`) must include adversarial rejection cases.
- **Mineral Matte Visual Consistency (`DESIGN.md` v8.0.0):** Keep compact headers (`text-sm font-semibold` + `<Icon size={18} />`), side-by-side ID fields, tight spacing (`p-3.5 sm:p-4`, `gap-3`), and `.chip-neutral` clear buttons across all modules.
