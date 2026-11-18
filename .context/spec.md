# SPEC.MD — Contrato de Implementação: PresCMed (`PCM` v2.0)

## 1. Objetivo e Fronteiras (Scope Lock)
- **O que construir:**
  1. **Módulo de Prescrição & Documentos (`MOD-01`, `Alt+1..6`):** Receituário digital em 3 regimes sanitários (`simples`, `antimicrobiano` RDC 471/2021 e `controle_especial` Portaria 344/98), calculadora pediátrica por peso, solicitação de exames (SADT), atestados médicos (CFM 1.658/2002), encaminhamentos, Editor Livre A4 (Tiptap 3) e 9 impressos oficiais do SUS (`APAC`, `LME`, `SISREG`, `GAL/LACEN`, `SISCAN`, `TRM-TB`).
  2. **Módulo Hospitalar (`MOD-03`, `Alt+7`):** Gestão de leitos (`Dexie v3`), admissão e evolução padronizada, ingestão multimodal sem alucinação, monitoramento longitudinal (`tabular-nums`) e cruzamento *Conduta × Evolução* em 6 eixos.
  3. **Scoreboard CDSS & Emergência (`Alt+8`):** 114 calculadoras clínicas determinísticas em 9 blocos de especialidade, painel de PCR `EPARADA` (ACLS/PALS + 5H/5T), Rastreio Oncológico INCA/MS, Bomba de Infusão Contínua (`BIC`), Radar Fisiológico e vínculo com leitos (`HospitalBedScoreEntry`).
  4. **Padronização Visual Fosca Mineral (`DESIGN.md` v8.0.0):** Superfícies foscas minerais (`#F3F5F8` no claro; cartões `#243042` sobre `#141C27` no escuro), cabeçalhos enxutos (`text-sm font-semibold` + `<Icon size={18} />`), campos de identificação lado a lado e ritmo vertical compacto (`p-3.5 sm:p-4`, `gap-3`).
- **Não-Objetivos (Proibido fazer):**
  - Proibido adicionar dependências de backend ou IA server-side (`@google/genai`, `express`, `dotenv`, `motion`).
  - Proibido usar classes responsivas (`sm:`, `md:`) ou `dark:` dentro da `FolhaA4` (`794×1123 px`) ou criar um segundo motor de layout manual em `jsPDF`.
  - Proibido inventar dados clínicos default (CID-10 sem `authorizedByPatient === true`, posologias de itens livres ou campos de exames/história em guias SUS).

## 2. Contratos de Dados e Interfaces (I/O)

| Domínio | Arquivo Principal | Contrato / Invariante Obrigatória |
| :--- | :--- | :--- |
| **Cálculo Pediátrico** | `src/utils/doseCalculator.ts` | Regra estrita `"sem peso, sem dose"`; formatação decimal com vírgula sem separador de milhar (`"1000 mg"`). |
| **Regimes de Receita** | `src/utils/isSpecialControlOrAntibiotic.ts` | Classificação determinística em `simples` (1 via), `antimicrobiano` (2 vias RDC 471/2021) e `controle_especial` (2 vias Portaria 344/98). |
| **Notificação de Receita** | `src/utils/notificacaoDeReceita.ts` | Aviso `.no-print` na tela para listas `A1`, `A2` (> 100 mg), `A3`, `B1`, `B2`, `C2` e `C3` sem jamais incluir na folha impressa. |
| **Folha Única A4** | `src/components/documento/FolhaA4.tsx` | Geometria fixa A4 (`794×1123 px` retrato / `1123×794 px` paisagem), sempre fundo `#FFFFFF` e exportação via `html2canvas-pro` + `jspdf`. |
| **Formulários SUS** | `src/data/formulariosOficiaisSus.ts` | Sobreposição exata por coordenadas sobre a imagem oficial (`<img>`) para APAC e LME ou `.sus-grid` vetorial 12 colunas; campos vazios permanecem em branco. |
| **Sigilo CFM** | `src/components/CertificateAndReferral.tsx` | Inclusão de CID-10 em atestados exige `authorizedByPatient === true` (Res. CFM 1.658/2002). |
| **Módulo Hospitalar (`MOD-03`)** | `src/utils/hospital/hospitalEvolutionFormatter.ts` | Ingestão multimodal sem dados inventados, evolução padronizada, exames e escores em ordem cronológica e cruzamento *Conduta × Evolução* em 6 eixos. |
| **Scoreboard CDSS & EPARADA** | `src/utils/scores/calculationEngine.ts` | 114 calculadoras determinísticas em 9 blocos, trava `"sem peso, sem dose"` no `EPARADA` (PCR) e registro longitudinal direto no leito (`HospitalBedScoreEntry`). |

## 3. Critério de Aceite e Parada (Definition of Done)
- [x] Passar no linter/typecheck sem erros (`npm run lint` / `tsc --noEmit`).
- [x] Passar no linter de design tokens sem erros ou avisos (`npm run design:lint`).
- [x] Passar em 100% da suíte determinística Vitest (`npm run test` — `30/30` suítes, `286/286` testes).
- [x] Gerar build de produção e service worker PWA sem erros (`npm run build`).

## 4. Active Feature Contract: `TASK-20` — Full UI/A11y Gatekeeper Sanitization (`2026-11-18`), Governance Triad Hygiene & `Docs-vs-Disk` Parity
- **Scope:**
  1. **UI/A11y Gatekeeper Compliance (`verify_raw_frontend.py`, `ui_judge_gatekeeper.py --wcag AAA`, `frontend_inventory_and_slop_scanner.py`):**
     - Expand `src/vite-env.d.ts` above `100` bytes with ambient Vite/PWA JSDoc header.
     - Replace the 3 remaining pseudo-icons (`⋮` in `AppGlobalModalsAndOverlays.tsx` -> `<Icon name="more_vert" />`, `+` in `EditorTextFormattingToolbar.tsx` and `HospitalEvolutionFormPanel.tsx` -> `<Icon name="add" />`).
     - Remediate the 3 unsemantic `<div onClick>` / `<div onPointerDown>` elements (`CidSearchBar.tsx`, `DocumentEditorView.tsx`, `EditorSheetViewport.tsx`) with `role="button" tabIndex={0} onKeyDown`, `role="presentation"`, and `role="group" aria-label`.
     - Upgrade all 55 remaining `< 40px` interactive controls across 20 components to `.touch-target min-h-[44px]` (and `min-w-[44px]` on compact/icon/stepper/switch controls) without `@layer utilities` size overrides (`h-6..h-9`, `min-h-[28..40px]`).
  2. **Governance Triad v2.1 & Directory Hygiene:** Remove obsolete `.context/{CURRENT_STATE,SESSION_LOG,ANALISE_CALIBRACAO_SKILLS}.md`, duplicate root `agents/`, and September 2026 drafts (`docs/historico/`, `docs/superpowers/`), plus redundant `@source not` lines in `src/index.css`.
  3. **`Docs-vs-Disk` Parity:** Synchronize `README.md`, `docs/CLINICAL_AND_RUNTIME_SPEC.md`, `AGENTS.md`, `.context/{context,spec}.md`, and Obsidian `PCM.md` to exact disk inventory (`219` files in `src/`, `30/30` Vitest suites / `286` tests, `< 5 MB` PWA) and record the build-only upstream `picomatch <=4.0.7` advisory (`GHSA-fc5q-39xc-vjpf`).
- **Verification Gate (`TASK-20`):** `verify_raw_frontend.py --run-tsc` `[PASS]`, `ui_judge_gatekeeper.py --wcag AAA` `PASSED`, `frontend_inventory_and_slop_scanner.py` `[PASS] slop=0/100`, `npm run lint`, `npm run design:lint`, `npm run test` (`30/30`, `286/286`), and `npm run build` (`dist/sw.js < 5,000,000` B).
