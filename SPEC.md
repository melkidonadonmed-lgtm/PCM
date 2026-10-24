# ESPECIFICAÇÃO TÉCNICA (`SPEC.md`) — `PCM` (PresCMed)

## 1. Visão Geral
Aplicação médica (YMYL) client-side em **React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Dexie.js 4**, com suporte offline via PWA (Workbox) e deploy automatizado no Google Cloud Run (`prescmed`).

---

## 2. Contratos e Invariantes Clínicas

| Domínio | Arquivo Principal | Invariante Obrigatória |
| :--- | :--- | :--- |
| **Cálculo Pediátrico** | `src/utils/doseCalculator.ts` | Regra estrita `"sem peso, sem dose"`; formatação decimal com vírgula sem separador de milhar (`"1000 mg"`). |
| **Regimes de Receita** | `src/utils/isSpecialControlOrAntibiotic.ts` | Classificação determinística em `simples` (1 via), `antimicrobiano` (2 vias RDC 471/2021) e `controle_especial` (2 vias Portaria 344/98). |
| **Notificação de Receita** | `src/utils/notificacaoDeReceita.ts` | Aviso `.no-print` na tela para listas `A1`, `A2` (> 100 mg), `A3`, `B1`, `B2`, `C2` e `C3` sem jamais incluir na folha impressa. |
| **Folha Única A4** | `src/components/documento/FolhaA4.tsx` | Geometria fixa A4 (`794x1123px` retrato / `1123x794px` paisagem), sempre fundo `#FFFFFF` e sem classes `sm:`/`md:`/`dark:` internas. |
| **Formulários SUS** | `src/data/formulariosOficiaisSus.ts` | Sobreposição exata por coordenadas sobre a imagem oficial (`<img>`) para APAC e LME; campos vazios permanecem em branco sem dados presumidos. |
| **Sigilo CFM** | `src/components/CertificateAndReferral.tsx` | Inclusão de CID-10 em atestados exige `authorizedByPatient === true` (Res. CFM 1.658/2002). |
| **Módulo Hospitalar (`MOD-03`)** | `src/utils/hospital/hospitalEvolutionFormatter.ts` | Ingestão multimodal sem dados inventados, evolução padronizada, exames e escores em ordem estritamente cronológica e cruzamento *Conduta × Evolução* em 6 eixos. |
| **Scoreboard CDSS & EPARADA** | `src/utils/scores/calculationEngine.ts` | 114 calculadoras determinísticas em 9 blocos, trava `"sem peso, sem dose"` no `EPARADA` (PCR) e registro longitudinal direto no leito (`HospitalBedScoreEntry`). |

---

## 3. Verificação Obrigatória
```powershell
npm run lint
npm run test
npm run design:lint
```
