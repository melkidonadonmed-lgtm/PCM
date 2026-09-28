# PresCMed repository instructions

## Commands

- Install dependencies with `npm ci`. The repository uses `package-lock.json`;
  `bun.lock` is legacy and Bun is not required.
- Run the Vite development server with `npm run dev`; it listens on `0.0.0.0:3000`.
- Create the production bundle in `dist/` with `npm run build`.
- Preview the production bundle with `npm run preview`.
- Run the only automated code check with `npm run lint`. Despite its name, this runs `tsc --noEmit`; there is no ESLint configuration.
- There is no test framework or test suite in this repository, so there is no full-suite or single-test command. For focused verification, run `npm run lint` and manually exercise the affected flow with `npm run dev`.
- Use the `ui-pdf-validation` skill for UI, print, sharing, and PDF changes.
  Use the `clinical-change-safety` skill for medication, dose, protocol, CID,
  legal wording, or other safety-critical changes.
- `npm run clean` uses `rm -rf dist server.js`; it requires a Unix-compatible shell and references a `server.js` that is not present.

## Architecture

PresCMed is a React 19 + TypeScript + Vite SPA for Brazilian medical prescriptions, pediatric dose calculations, exam requests, certificates, referrals, clinical protocols, and PDF output. It is entirely client-side: do not assume that the declared `express`, `dotenv`, or `@google/genai` dependencies imply an implemented backend or Gemini integration.

- `src/main.tsx` mounts `App` in `StrictMode`.
- `src/App.tsx` is the application shell and state owner. It implements tab-based navigation without a router, owns doctor/patient/document state, opens the patient/doctor modals, and passes data and callbacks down through props.
- State is persisted directly to `localStorage` under `prescmed_*` keys. When adding persisted state, follow the existing lazy initializer plus synchronizing `useEffect` pattern and preserve compatibility with older partial objects by merging defaults where appropriate.
- `src/types.ts` is the shared domain model for patients, doctors, prescriptions, exams, documents, and protocols.
- `src/data/` contains static clinical catalogs. `pediatricMeds.ts` drives weight-based calculations; `clinicalProtocols.ts` references pediatric entries by exact `pediatricMedId`; `examCatalog.ts` and `cidCatalog.ts` drive their respective search UIs.
- The active prescription composer in `PrescriptionBuilder.tsx` reads `UNIFIED_MEDICATIONS` from `src/data/medicationDatabase.ts`. A separate grouped/fuzzy catalog path exists in `utils/medicationCatalog.ts`, `utils/fuzzySearch.ts`, `MedicationSelectionModal.tsx`, and `MedicationPresentationModal.tsx`, but those modal components are not currently mounted. Check call sites before changing one catalog path and assuming the other UI will inherit the change.
- `src/utils/doseCalculator.ts` is shared by the pediatric calculator, clinical protocols, and grouped medication presentation flow. Protocol entries with `pediatricMedId` must match an ID in `PEDIATRIC_MEDICATIONS` to receive weight-based dosing.
- Document output has two related surfaces: `PrintPreview.tsx` renders the printable HTML/UI and sharing text, while `utils/pdfGenerator.ts` builds downloadable PDFs programmatically with jsPDF/autoTable. Changes to document wording, legal notices, patient fields, or document types usually need to be reflected in both.

## Project-specific conventions

- User-facing text, medication data, legal notices, and generated documents are in Brazilian Portuguese (`pt-BR`). Preserve accents and use pt-BR number/date formatting; calculated dose text uses decimal commas through `toLocaleString('pt-BR')`.
- This is medical/YMYL software. Treat changes to dose formulas, concentration fields, maximum doses, schedules, medication catalogs, clinical protocols, and contraindication warnings as safety-critical. Keep catalog values, `calculatePediatricDose()`, protocol references, UI summaries, and PDF output consistent.
- Preserve the explicit CID consent notice tied to Resolução CFM nº 1.658/2002 in both the certificate UI and generated documents.
- Components are functional React components with local interfaces and named exports; `App` is the default export. Shared domain types belong in `src/types.ts`.
- The app intentionally uses prop drilling from `App.tsx`; do not introduce a router or global state library for isolated changes.
- Styling uses Tailwind CSS v4 through `@tailwindcss/vite`, configured in `src/index.css` with `@import "tailwindcss"`, `@theme`, CSS variables, and reusable classes such as `tactile-*` and `panel-navy`. There is no `tailwind.config.js`.
- Prefer existing `var(--*)` design tokens and tactile classes over new hard-coded colors. Navigation chrome remains navy in both themes. The desktop/mobile behavior pivots at Tailwind's `lg` breakpoint (1024px), which is also hard-coded in `App.tsx` sidebar logic.
- Theme state is the `darkMode` boolean in `App.tsx`; it toggles the root `.dark` class and is also passed to components because many components select colors inline rather than relying only on `dark:` utilities.
- Printed A4 content must remain white with dark text in both themes. Keep print behavior in sync with the `@media print` rules and `#printable-a4-sheet`/`.print-page` styles in `src/index.css`.
- `PrintPreview.tsx` contains color normalization for `html2canvas`, which cannot reliably consume modern CSS color functions. Avoid introducing unsupported colors into captured document content without extending that conversion path.
- Use relative imports within `src/`, matching existing code. The `@` alias points to the repository root, not specifically to `src`, and is currently little used.
- `vite.config.ts` uses `DISABLE_HMR=true` to disable both HMR and file watching in AI Studio-style environments; preserve that behavior.
- Do not add network transmission, analytics, or telemetry for patient/doctor data without an explicit requirement. Current sensitive data remains in browser `localStorage`.
