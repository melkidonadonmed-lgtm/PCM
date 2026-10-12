# PresCMed repository instructions

`AGENTS.md` at the repository root is the authoritative, detailed guide (in pt-BR): clinical rules, sanitary regimes, document-emission rules, file-by-file structure. Read it before any non-trivial change. This file is the short version.

## Commands

- Install dependencies with `npm ci`. The repository uses `package-lock.json`.
- Run the Vite development server with `npm run dev`; it listens on `0.0.0.0:3001`.
- Create the production bundle in `dist/` with `npm run build`; preview it with `npm run preview`.
- Type-check with `npm run lint`. Despite its name, this runs `tsc --noEmit`; there is no ESLint configuration.
- Run the test suite with `npm run test` (Vitest); `npm run test:watch` for watch mode. Run a single file with `npx vitest run src/__tests__/<file>`.
- Check `DESIGN.md` conformance with `npm run design:lint`.
- `npm run clean` removes `dist/`.
- After changing dose logic, clinical kits, medication catalogs, or sanitary compliance, run `npm run test`, `npm run lint`, and `npm run design:lint`.
- Use the `ui-pdf-validation` skill for UI, print, sharing, and PDF changes.
  Use the `clinical-change-safety` skill for medication, dose, protocol, CID,
  legal wording, or other safety-critical changes, and request review from the
  `prescmed-clinical-reviewer` agent. Skills live in `.github/skills/`, the agent in `.github/agents/`.

## Deploy

- **A push to `main` deploys to production** (Google Cloud Run, service `prescmed`, region `southamerica-east1`). The Cloud Build trigger runs `cloudbuild.yaml`: image build, push, deploy, smoke test.
- The `Dockerfile` runs `npm run lint && npm run test` before the build; a red test means no image and no deploy.
- Work on a branch and open a pull request; never push to `main` without the owner's confirmation.

## Architecture

PresCMed is a React 19 + TypeScript + Vite 6 SPA for Brazilian medical prescriptions, pediatric dose calculations, exam requests, certificates, referrals, SUS documents, clinical protocols, and A4/PDF output. It is entirely client-side: there is no backend. The only server communication is the optional Firebase sync (Google sign-in + Firestore), loaded on demand. `express`, `dotenv`, `@google/genai`, and `motion` are no longer dependencies; do not write code that assumes a server, Gemini calls, or `motion` animations.

- `src/main.tsx` mounts `App` in `StrictMode`.
- `src/App.tsx` is the application shell. It implements tab-based navigation without a router (`activeTab: ActiveTab`), opens the patient/doctor modals, and passes data and callbacks down through props. The `documents`, `certificate`, `referral`, and `exams` tabs all render `ClinicalDocumentsHub.tsx` on the matching sub-tab; SUS documents are its fourth sub-tab.
- Session state (doctor, patient, prescription, exams, certificate, referral) lives in `src/hooks/usePrescriptionSession.ts` and is persisted to `localStorage` under `prescmed_*` keys through `src/services/storageService.ts`. When adding persisted state, follow the existing lazy initializer plus synchronizing `useEffect` pattern and keep compatibility with older partial objects by merging defaults.
- Work contexts (workplaces) and saved documents live in IndexedDB through Dexie (`src/services/db.ts`, tables `workContexts` and `savedDocuments`). `src/services/cloud/` optionally syncs work contexts and reusable templates to Firestore; patient and consultation data are not part of that sync.
- `src/types.ts` is the shared domain model for patients, doctors, prescriptions, exams, documents, and protocols.
- `src/data/` contains static clinical catalogs. `pediatricMeds.ts` drives weight-based calculations; `clinicalProtocols.ts` references pediatric entries by exact `pediatricMedId`; `examCatalog.ts` and `cidCatalog.ts` drive their respective search UIs; `susDocumentsCatalog.ts` and `formulariosOficiaisSus.ts` drive the SUS documents.
- The prescription composer in `PrescriptionBuilder.tsx` reads `UNIFIED_MEDICATIONS` from `src/data/medicationDatabase.ts`, searched through `utils/fuzzySearch.ts`.
- `src/utils/doseCalculator.ts` is the only dose calculator; it is shared by the pediatric calculator and the clinical protocols. Protocol entries with `pediatricMedId` must match an ID in `PEDIATRIC_MEDICATIONS` to receive weight-based dosing. Clinical kits do not use it: `src/utils/montarItensDoKit.ts` has its own fixed pediatric doses, which are pending clinical review; do not change them without a clinical source.
- Document output has a single source: `components/documento/DocumentoClinico.tsx` rendered inside `FolhaA4.tsx`. The on-screen preview, browser print and the downloaded PDF (`exportarFolhaPdf` in `utils/folhaA4.ts`, a capture of that same sheet) all come from it. Never add a second, hand-drawn rendering of a document (e.g. jsPDF drawing calls): that is what used to make the preview and the file disagree. Content rules (header identity, titles, derived text) live in `utils/documentoClinico.ts`; `PrintPreview.tsx` only hosts the sheet, the actions and the sharing text.
- APAC and LME are printed on the official form: the form image (`public/formularios-sus/`) is the sheet background and the app only writes data into each numbered field (`FormularioOficialSus.tsx`, `data/formulariosOficiaisSus.ts`). Never redraw a form "in SUS style".

## Project-specific conventions

- User-facing text, medication data, legal notices, and generated documents are in Brazilian Portuguese (`pt-BR`). Preserve accents and use pt-BR number/date formatting. Doses in milligrams use a decimal comma and **no thousands separator** ("1000 mg", never "1.000 mg").
- This is medical/YMYL software. Treat changes to dose formulas, concentration fields, maximum doses, schedules, medication catalogs, clinical kits, clinical protocols, and contraindication warnings as safety-critical. Keep catalog values, `calculatePediatricDose()`, protocol references, UI summaries, and document output consistent.
- "No weight, no dose": the pediatric calculator and protocols show no calculated dose when the patient's weight is missing.
- Three prescription regimes, three sheets: `classificarReceita` (`utils/isSpecialControlOrAntibiotic.ts`) returns `simples`, `antimicrobiano` (RDC Anvisa 471/2021), or `controle_especial` (Portaria SVS/MS 344/98). Never emit an antimicrobial with special-control titles or notices. Controlled drugs that require a "Notificação de Receita" get an on-screen `.no-print` warning (`utils/notificacaoDeReceita.ts`); the app does not emit that form.
- Nothing invented in a document: no QR code, "digital validation", or "electronic signature" (the app does not sign digitally); no city, times, duration, or clinical text the doctor did not enter. Empty fields are not printed, and clinical fields never open pre-filled.
- Preserve the explicit CID consent tied to Resoluções CFM nº 1.658/2002 and 1.819/2007 in both the certificate UI and generated documents.
- Emitting a document (print, PDF, WhatsApp, copy) requires the doctor's name and CRM (`utils/medicoConfigurado.ts`).
- Components are functional React components with local interfaces and named exports; `App` is the default export. Shared domain types belong in `src/types.ts`.
- The app intentionally uses prop drilling from `App.tsx`; do not introduce a router or global state library.
- Styling uses Tailwind CSS v4 through `@tailwindcss/vite`, configured in `src/index.css` with `@import "tailwindcss"`, `@theme`, CSS variables, and reusable classes such as `tactile-*` and `panel-navy`. There is no `tailwind.config.js`. Component classes go inside `@layer components`; never write CSS outside a layer.
- Prefer existing `var(--*)` design tokens and tactile classes over new hard-coded colors. The sidebar and the mobile bottom navigation stay navy (`.panel-navy`) in both themes; the header uses the card surface (light in the light theme). The desktop/mobile behavior pivots at Tailwind's `lg` breakpoint (1024px).
- Icons: use the canonical `<Icon name="..." />` component (`src/components/Icon.tsx`, Material Symbols, offline). Do not add other icon packages.
- Theme state is the `darkMode` boolean in `App.tsx`; it toggles the root `.dark` class.
- Printed A4 content must remain white with dark text in both themes. Keep print behavior in sync with the `@media print` rules and `#printable-a4-sheet` styles in `src/index.css`.
- PDF capture uses `html2canvas-pro` (not `html2canvas`, which throws on Tailwind v4 `oklch` colors). Inside the sheet, use fixed sizes and no responsive (`sm:`/`md:`) or `dark:` variants, so the layout never depends on the device.
- Document dates use `dataLocalISO`, never `toISOString()` (which returns the next day in UTC at night).
- Use relative imports within `src/`, matching existing code. The `@` alias points to the repository root, not to `src`, and is little used.
- `vite.config.ts` uses `DISABLE_HMR=true` to disable both HMR and file watching in AI Studio-style environments; preserve that behavior.
- Do not add network transmission, analytics, or telemetry for patient/doctor data without an explicit requirement. Sensitive data stays on the device (`localStorage` and IndexedDB).
