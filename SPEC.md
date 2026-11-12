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
- [x] Passar em 100% da suíte determinística Vitest (`npm run test` — `29/29` suítes, `280/280` testes).
- [x] Gerar build de produção e service worker PWA sem erros (`npm run build`).
