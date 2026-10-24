# AGENTS.md — PresCMed (`PCM`)

**PresCMed** é uma SPA 100% client-side (React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Dexie.js 4) para prescrição médica digital, calculadora pediátrica por peso (`mg/kg → mL/gotas`), exames, atestados/encaminhamentos (CFM) e documentos SUS (APAC, LME, SISREG, GAL/LACEN, SISCAN, TRM-TB) em folha A4 única.

> **Domínio Médico Crítico (YMYL):** Qualquer alteração em cálculo de doses (`src/utils/doseCalculator.ts`), kits (`src/data/clinicalKits.ts`), regimes sanitários (`src/utils/isSpecialControlOrAntibiotic.ts`) ou formulários SUS exige leitura prévia de [`docs/CLINICAL_AND_RUNTIME_SPEC.md`](docs/CLINICAL_AND_RUNTIME_SPEC.md) e execução integral da suíte Vitest.

---

## 1. Comandos (`Command-First`)

```bash
npm ci              # Instalação reproduzível a partir do package-lock.json
npm run dev         # Dev server Vite na porta 3001 (host 0.0.0.0)
npm run lint        # Type-check estrito: tsc --noEmit
npm run test        # Suíte completa Vitest (cálculos clínicos, Portaria 344/98, CFM, SUS e snapshots)
npm run design:lint # Linter de conformidade DESIGN.md
npm run build       # Build de produção em dist/
```

---

## 2. Mapa de Diretórios e Divulgação Progressiva

- `src/App.tsx` e `src/types.ts` — Estado centralizado por abas (`activeTab`, sem `react-router` nem Redux/Zustand).
- `src/core/` — Fundação multi-módulo (`domain/clinicalEntities.ts` e `storage/clinicalRepository.ts`) orquestrando o Módulo de Prescrição (`MOD-01`), Evolução/PEP (`MOD-02`) e o Módulo Hospitalar e Gestão de Pacientes (`MOD-03`, `Dexie v3`).
- `src/components/hospital/` e `src/utils/hospital/` — Módulo Hospitalar (`MOD-03`, atalho `Alt+7`): gestão de leitos (`EF/LT`), admissão manual e multimodal via IA sob Diretriz de Rigor Terapêutico (zero alucinação), formulário de evolução padronizado (categorias fixas + livres), monitoramento longitudinal de exames (`tabular-nums`), cruzamento Conduta × Evolução, Chat Live API e Agente Science.
- `src/components/documento/` — Motor de folha única A4 (`FolhaA4.tsx`, `DocumentoClinico.tsx`, `ReceitaDuasVias.tsx`, `FormularioOficialSus.tsx`).
- `src/components/sus/` — Guias regulatórias do SUS e grade vetorial interativa 12 colunas (`SusInteractiveVectorSheet.tsx`, `SusCommonIdentityFields.tsx`, `SusRegulatorySpecificFields.tsx`).
- `src/utils/` — Motores clínicos determinísticos (`doseCalculator.ts`, `isSpecialControlOrAntibiotic.ts`, `notificacaoDeReceita.ts`, `formularioOficial.ts`, `folhaA4.ts`).
- `src/data/` — Catálogos clínicos (`pediatricMeds.ts`, `medicationDatabase.ts`, `clinicalKits.ts`, `formulariosOficiaisSus.ts`, `susDocumentsCatalog.ts`).
- **Especificação Completa de Runtime, Árvore de 134 Arquivos, 11 Chaves `localStorage` e Regras SUS/CFM/Anvisa:** Leia [`docs/CLINICAL_AND_RUNTIME_SPEC.md`](docs/CLINICAL_AND_RUNTIME_SPEC.md).
- **Skills e Agente Revisor Local:** Para UI/impressão/PDF, consulte `.github/skills/ui-pdf-validation`. Para regras clínicas/doses, consulte `.github/skills/clinical-change-safety` e o agente `.github/agents/prescmed-clinical-reviewer`.

---

## 3. Invariantes e Armadilhas Comuns (`Common Pitfalls`)

1. **SPA 100% Client-Side:** `@google/genai`, `express`, `dotenv` e `motion` não existem no projeto. A única integração externa é o Firebase 12 (`vendor-firebase` sob demanda).
2. **`html2canvas-pro` Obrigatório:** Nunca troque por `html2canvas` comum (que falha silenciosamente com cores `oklch()` do Tailwind v4).
3. **O que aparece na `FolhaA4` é o que sai no PDF:** Nunca monte um segundo layout manual em `jsPDF`. Dentro de `FolhaA4` (`794×1123 px`), **nunca use classes responsivas (`sm:`, `md:`) nem `dark:`** — a folha física é sempre branca (`#FFFFFF`) com tinta escura.
4. **Regras Clínicas Inegociáveis:**
   - **Sem peso, sem dose** na calculadora pediátrica e nos protocolos de emergência.
   - **Formatação de miligramas:** vírgula decimal e **zero separador de milhar** (`"7,5 mg"`, `"1000 mg"`, nunca `"1.000 mg"`).
   - **Zero dados clínicos inventados:** nunca preencha CID-10 sem `authorizedByPatient = true` (Res. CFM 1.658/2002), nunca invente `scheduleTimes` em itens livres e nunca defina valores default para exames/história em guias SUS (`susSemDadosInventados.test.ts`).
   - **Três regimes em A4 paisagem:** *Simples* (1 via à esquerda), *Antimicrobiano* (2 vias RDC 471/2021, farmácia retém 2ª via) e *Controle Especial* (2 vias Portaria 344/98, farmácia retém 1ª via). Avisos de Notificação de Receita (`listas A1/A3/B1/B2/C2`) levam sempre `.no-print`.
   - **Datas locais:** use sempre `dataLocalISO` (nunca `toISOString()`, que vira o dia seguinte à noite em UTC).
5. **Tailwind v4 & Ícones:** Classes em `@layer components`, sombras em `@utility` (nunca CSS solto fora de camada) e ícones exclusivamente via `<Icon name="..." />` (`src/components/Icon.tsx`).

---

## 4. Deploy Cloud Run (`prescmed`, `southamerica-east1`)

- Push em `main` aciona o gatilho Cloud Build `gcpmain` (`cloudbuild.yaml`), ou manual via `pwsh -File .\deploy-cloudrun.ps1`.
- O `Dockerfile` executa `npm run lint && npm run test` antes de gerar a imagem Nginx (`node:24-alpine`). Healthcheck em `/health` (nunca `/healthz`).

<!-- WORKSPACE-CONTEXT START -->
## Referências Globais do Workspace
- Diretrizes globais de engenharia, arquitetura visual por propósito e memória: [`C:\Users\melki\dev\AGENTS.md`](file:///C:/Users/melki/dev/AGENTS.md) e [`Preferências de Trabalho com Agentes.md`](file:///C:/Users/melki/dev/notes/Memória/Preferências%20de%20Trabalho%20com%20Agentes.md).
<!-- WORKSPACE-CONTEXT END -->
