# PresCMed (`PCM`) — Clinical Minimalist Design System (v2.0.0 Upgrade)

## 1. Brand, Polarity, Intent & Dials
PresCMed is a local-first Brazilian clinical prescription, hospital census, and CDSS workbench engineered for zero-ambiguity YMYL medical workflows. The aesthetic is Swiss-Clinical Precision: quiet mineral surfaces, crisp 1px control boundaries, disciplined typographic hierarchy, and zero decorative chrome. Light Mode (Mineral Alabaster canvas + pure white cards + Deep Navy structural sidebar) serves bright outpatient clinics; Dark Mode (Mineral Slate Matte monotonic ladder) protects dark-adaptation during night shifts. Focal moment budget: (1) Live split-view A4 sheet workbench (`FolhaA4`), and (2) single primary issuance CTA (`Imprimir / Gerar PDF`) paired with clinical insertion CTA (`Inserir na receita`).
- **Dials:** `Visual-Richness: 4/10` · `Motion: 2/10` · `Density: 8/10`
- **Polarity Strategy:** Explicit `:root` (Light) and `:root.dark, [data-theme="dark"]` (Dark) — zero `light-dark()` to guarantee `html2canvas-pro` PDF fidelity.

## 2. 3-Tier OKLCH Color Matrix (WCAG 2.2 AAA >= 7.0:1 & SC 1.4.11 >= 3.0:1)
| Layer | Token | Light Value (OKLCH) | Dark Value (OKLCH) | Contrast / Invariant |
| :--- | :--- | :--- | :--- | :--- |
| Primitive | `--p-navy-700` | `oklch(0.300 0.036 248)` | `oklch(0.390 0.052 246)` | Primary CTA bg (`>= 9.2:1` w/ white ink) |
| Primitive | `--p-teal-600` | `oklch(0.415 0.072 186)` | `oklch(0.435 0.074 186)` | Clinical CTA bg (`>= 7.4:1` w/ white ink) |
| Primitive | `--p-rose-700` | `oklch(0.445 0.185 18)` | `oklch(0.785 0.145 18)` | Danger ink (`>= 7.2:1` AAA) |
| Semantic | `--surface-canvas` | `oklch(0.962 0.006 248)` | `oklch(0.185 0.015 248)` | Base canvas (Dark L=0.185) |
| Semantic | `--surface-card` | `oklch(1.000 0.000 0)` | `oklch(0.245 0.018 248)` | Elevated card (`Dark Delta L = +0.060 >= 0.03`) |
| Semantic | `--surface-card-lit` | `oklch(0.985 0.004 248)` | `oklch(0.295 0.020 248)` | Hover/raised/inputs (`Dark Delta L = +0.050 >= 0.03`) |
| Semantic | `--ink-primary` | `oklch(0.195 0.024 252)` | `oklch(0.975 0.004 248)` | `> 15:1` AAA |
| Semantic | `--ink-secondary` | `oklch(0.315 0.022 252)` | `oklch(0.865 0.012 248)` | `> 10:1` AAA |
| Semantic | `--ink-muted` | `oklch(0.390 0.016 248)` | `oklch(0.790 0.014 248)` | `>= 7.5:1` AAA |
| Semantic | `--ink-accent` | `oklch(0.300 0.036 248)` | `oklch(0.860 0.045 245)` | `>= 8.5:1` AAA |
| Semantic | `--ink-clinical` | `oklch(0.395 0.072 186)` | `oklch(0.840 0.110 180)` | `>= 7.6:1` AAA |
| Semantic | `--status-danger` | `oklch(0.445 0.185 18)` | `oklch(0.785 0.145 18)` | `>= 7.2:1` AAA |
| Semantic | `--border-control` | `oklch(0.575 0.020 248)` | `oklch(0.610 0.024 248)` | `>= 3.4:1` SC 1.4.11 |
| Semantic | `--hairline` | `color-mix(in oklab, var(--ink-primary) 10%, transparent)` | `color-mix(in oklab, var(--ink-primary) 12%, transparent)` | Card dividers only |
| Component | `--sidebar-surface-bg` | `oklch(0.205 0.022 252)` | `oklch(0.215 0.022 252)` | Monolithic Deep Navy shell |
| Component | `--sidebar-text-muted` | `oklch(0.800 0.014 252)` | `oklch(0.800 0.014 252)` | `>= 7.8:1` AAA on sidebar bg |

```css
:root {
  color-scheme: light;
  --surface-canvas: oklch(0.962 0.006 248);
  --surface-card: oklch(1.000 0.000 0);
  --surface-card-lit: oklch(0.985 0.004 248);
  --ink-primary: oklch(0.195 0.024 252);
  --ink-secondary: oklch(0.315 0.022 252);
  --ink-muted: oklch(0.390 0.016 248);
  --ink-accent: oklch(0.300 0.036 248);
  --status-danger: oklch(0.445 0.185 18);
  --border-control: oklch(0.575 0.020 248);
  --hairline: color-mix(in oklab, var(--ink-primary) 10%, transparent);
}

:root.dark,
[data-theme="dark"] {
  color-scheme: dark;
  --surface-canvas: oklch(0.185 0.015 248);
  --surface-card: oklch(0.245 0.018 248);
  --surface-card-lit: oklch(0.295 0.020 248);
  --ink-primary: oklch(0.975 0.004 248);
  --ink-secondary: oklch(0.865 0.012 248);
  --ink-muted: oklch(0.790 0.014 248);
  --ink-accent: oklch(0.860 0.045 245);
  --status-danger: oklch(0.785 0.145 18);
  --border-control: oklch(0.610 0.024 248);
  --hairline: color-mix(in oklab, var(--ink-primary) 12%, transparent);
}
```

## 3. Elevation, Radii & Surface Craft
- **Light Mode:** Soft 2-layer ambient contact elevation on cards (`--elevation-low`), crisp `1px solid var(--border-control)` on interactive controls and secondary buttons, **1 clean contact shadow** on primary/clinical CTAs (zero stacked 6-8 shadow layers).
- **Dark Mode:** Monotonic OKLCH lightness ladder (`canvas 0.185 < card 0.245 < card-lit 0.295`), subtle `1px` top hairline (`oklch(1 0 0 / 0.09)`), quiet shadows, zero heavy bevels or frosted-glass blur on modals.
- **Concentric Radii:** Outer cards `16px` (`--radius-card`), interactive controls/buttons/sidebar nav items `10px` (`--radius-control`), micro-badges `6px` (`--radius-badge`), A4 paper sheet `2px` (screen) / `0` (print).

## 4. Typography & Modular Scale
- **App Chrome Stack `[DEFAULT — Pending User Choice A/B/C]`:** `IBM Plex Sans` (`--font-main`, `--font-display`), fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- **Technical / Dosage Mono:** `JetBrains Mono` (`--font-mono`) with `font-variant-numeric: tabular-nums` enforced on weights, doses, CRM, counts, and lab values.
- **A4 Print Document Serif (Scoped to `.folha-a4` & Editor A4 only):** `Cormorant Garamond` (preserved for classic prescription print templates without bleeding into app chrome `<h1>`).
- **Modular Scale (`1.2` clinical compact):** `h1: clamp(1.375rem, 1.2rem + 0.45vw, 1.5625rem)` (600, `-0.02em`, `line-height: 1.2`), `h2: 0.9375rem` (600), `body: 0.875rem-0.9375rem` (`line-height: 1.55`, `60-65ch` prose), `controls/buttons: 0.8125rem` (`13px`, 600), `metadata: 0.75rem` (`12px`).

## 5. Iconography & Asset Catalog
- **Single Icon Family:** Local subset `Material Symbols Outlined` (`src/assets/fonts/material-symbols-outlined.subset.woff2`) via `src/components/Icon.tsx`, rendered cleanly at `16px-20px`, `opsz 20`. Zero emojis or ASCII pseudo-icons as UI chrome.

## 6. Page-by-Page Hierarchy, Shell & Navigation Map
| Route / View | Primary User Job | Focal Hierarchy (`Primary -> Secondary -> Tertiary`) | Responsive Composition & Single-DOM Nav |
| :--- | :--- | :--- | :--- |
| `#prescription` | Compose & issue safe prescriptions | `MedicationComposerCard` + Live `FolhaA4` -> `PatientQuickCard` + `AcoesDaReceita` -> `PrescribedItemsList` + Models | Desktop `xl:grid-cols-12` (`7/5` split); Mobile segmented toggle (`Composer`/`Preview`) + Bottom Bar |
| `#documents` | Issue clinical certificates, referrals, labs | Active form card -> Template/CID quick pickers -> Print/PDF action bar | Single-column workbench inside `max-w-7xl` shell |
| `#sus` | Fill official SUS forms (APAC/LME/SISREG) | Interactive `.sus-grid` vector sheet -> Regulatory fields -> Export/Print | Split form + millimeter vector sheet (untouched `@media print`) |
| `#editor` | Free-text A4 document & letterhead editing | TipTap A4 canvas (`EditorSingleViaCanvas`/`EditorTwoViasCanvas`) -> Formatting bar -> Models drawer | Centered A4 stage + collapsible drawer; inline inputs `>= 44px` on screen, compact in `@media print` |
| `#pediatric_calc` | Weight-based pediatric dosing (`mg/kg`) | Weight input + active dose card -> Category filter -> Add to prescription | Single-column + drawer mode; zero-weight safety gate intact |
| `#protocols` | Reference clinical protocols | Search + active protocol conduct -> Specialty filters -> Quick prescribe | Master-detail / stacked cards |
| `#scores` | 114 CDSS clinical calculators & radar | Active calculator inputs + score verdict -> Export to bed/PEP -> Catalog | Split calculator + physiological radar |
| `#hospital` | Ward census, bed evolution & labs | Active bed evolution/conduct -> Census grid -> Labs/Science panel | Sidebar + bed census grid + detail tabs |
| `#print_preview` | Final A4 verification & PDF/Print export | Physical `FolhaA4` sheet -> Print/PDF CTA (`primary`) -> Text copy/back (`secondary`) | Full-bleed preview bench + clean action header |

- **Navigation Landmarks (`<= 3` `<nav>`, concise non-redundant `aria-label`):**
  1. Header macro-switcher (`aria-label="Áreas clínicas"`)
  2. Collapsible Deep Navy Sidebar (`aria-label="Módulos principais"`, `256px <-> 64px`)
  3. Mobile Bottom Bar (`aria-label="Atalhos móveis"`, `< 1024px`)

## 7. Module Containment, 5-State FSM, Transitions & AppSec Matrix
| Module | Containment | `@container` / Layout | 5-State FSM (`idle/loading/empty/error/success`) | Transitions (Zero-Reflow) | AppSec / Clinical Safety |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ActionButton` + `AcoesDaReceita` | Flat/1-layer contact CTA inside card footer | 2x2 `sm:grid-cols-2` symmetric grid | `data-state`, `aria-busy`, disabled-without-items, `copiedSuccess`, doctor-unconfigured alert | `transform`, `background-color`, `border-color` (`150ms`) | Zero `alert()`/`confirm()`; Portaria 344 / 2-vias segregation preserved |
| `Sidebar` + `ContextSwitcher` | Monolithic Deep Navy `panel-navy` rail | Expanded `256px` / Icon rail `64px` / Mobile drawer | `idle`, `confirmModal` HITL on Reset All | `transform` (`250ms --ease-spring`) on drawer; `colors` (`150ms`) on items | HITL modal for destructive reset; zero PII leaks |
| `MedicationComposerCard` + `PatientQuickCard` | `.card-surface` (`1px solid var(--hairline)`) | `.cq-card` + `.posology-cq-grid` `@container (min-width: 34rem)` | `idle`, editing banner, search empty/suggestions, sanitary alert | `border-color`, `background-color` (`150ms`) | Strict numeric bounds, `tabular-nums`, controlled-substance warnings |
| `EditorSingleViaCanvas` / `EditorTwoViasCanvas` | `.a4-bench-stage` hosting `.a4-editor-canvas` | Zoomable A4 sheet (`210mm` / `297mm`) | `idle`, `saving`, `saved`, `isExportingPdf` | Compositor-only drawer/modal springs | `DOMPurify` HTML sanitization preserved; `@media print` untouched |

## 8. Phase 0 Scope Lock, Tests & 4-Wave Disjoint `owned_files`
- **Verification & Stop Gates:** `npm run typecheck`, `npm run test` (Vitest lockstep updates for `designInterfaceMedicaMinimalista.test.tsx` and `uiFourAxesRefactorAudit.test.tsx`), `npm run build`, `ui_judge_gatekeeper.py --wcag AAA --composite --against-analysis .context/ui-audit-baseline.json` (`PASSED`), and Stage 3B code-blind `ui-visual-auditor` (`PASSED` in both Light and Dark).
- **Wave 1 — Tokens, OKLCH AAA Ladder, Typography & CSS Primitives:** `index.html`, `src/index.css`, `src/styles/dark-theme.css`, `src/styles/globals.css`, `src/styles/tactile-components.css`, `src/config/tokens.ts`
- **Wave 2 — Shell, Header, Sidebar & Navigation Polish:** `src/components/Header.tsx`, `src/components/Sidebar.tsx`, `src/components/SidebarKitsAndFooterSection.tsx`, `src/components/ContextSwitcher.tsx`, `src/components/MobileBottomNav.tsx`
- **Wave 3 — Main Page Typography, Button Overhaul & Prescription Workbench:** `src/components/ui/ActionButton.tsx`, `src/components/AcoesDaReceita.tsx`, `src/components/PrescriptionBuilder.tsx`, `src/components/prescription/MedicationComposerCard.tsx`, `src/components/prescription/PatientQuickCard.tsx`, `src/components/prescription/PrescribedItemsList.tsx`
- **Wave 4 — AI Slop Purge (`326 sky-*/purple-*`), Fitts `44px` Fixes & Lockstep Vitest Updates:** remaining secondary components + `src/__tests__/designInterfaceMedicaMinimalista.test.tsx` + `src/__tests__/uiFourAxesRefactorAudit.test.tsx`.
