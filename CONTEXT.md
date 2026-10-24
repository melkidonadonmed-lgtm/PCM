# CONTEXTO OPERACIONAL — `PCM` (PresCMed — Plataforma Clínica, Escores CDSS e Gestão Hospitalar)

Este documento resume a arquitetura, o estado operacional e o fluxo de publicação do sistema **PresCMed (`PCM`)**.

---

## 1. Papel e Arquitetura
O **PresCMed (`PCM`)** é a SPA clínica, ambulatorial e hospitalar 100% client-side em **React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Dexie.js 4** voltada ao contexto médico brasileiro (SUS, consultório, emergência e internação).
- **Módulos Clínicos (`Alt+1..8`)**:
  - `MOD-01` (`Alt+1..6`): Receituário simples, antimicrobiano (2 vias RDC 471/2021) e controle especial (2 vias Portaria 344/98), calculadora pediátrica por peso (`sem peso, sem dose`), solicitação de exames (14 rotinas), atestados (consentimento explícito CID-10 conforme CFM 1.658/2002), encaminhamentos, Editor A4 (Tiptap 3) e 9 impressos oficiais do SUS (`APAC`, `LME`, `SISREG`, `GAL/LACEN`, `SISCAN`, `TRM-TB` + `.sus-grid` vetorial de 12 colunas).
  - `MOD-03` (`Alt+7` — Módulo Hospitalar): Gestão de leitos (`EF/LT`), modelo padronizado de evolução/admissão, ingestão multimodal sem alucinação, monitoramento longitudinal de exames e escores CDSS (`tabular-nums`), cruzamento *Conduta × Evolução* (6 eixos) e Copiloto do Leito / Agente Science.
  - `Scoreboard CDSS` (`Alt+8`): 114 calculadoras clínicas em 9 blocos de especialidade, painel `EPARADA` (PCR ACLS/PALS + 5H/5T), Rastreio Oncológico INCA/MS (Mama, Colo, Próstata), Bomba de Infusão Contínua (`BIC`), Radar Fisiológico e ponte bidirecional com os leitos hospitalares (`HospitalBedScoreEntry`).
- **Fonte Única de Impressão (`FolhaA4.tsx` + `DocumentoClinico.tsx`)**: A prévia na tela, a impressão (`window.print`) e a exportação em PDF (`html2canvas-pro` + `jspdf`) renderizam exatamente o mesmo componente A4.
- **Persistência Local, Backup v2 e Cloud Opcional**: IndexedDB (`Dexie.js` v4, esquema v3: `workContexts`, `savedDocuments`, `hospitalBeds`) + `localStorage`, backup portátil `.pcm.json` v2 (incluindo leitos hospitalares e estilos customizados) e sincronização opcional via Firebase Auth/Firestore com propagação de exclusões (`prescmed_cloud_pending_deletes`), fatiamento de lotes (`<= 450` ops) e compressão automática de logos Base64.

---

## 2. Estado Operacional e Deploy
- **Produção Cloud Run**: Serviço `prescmed` em `southamerica-east1` (projeto `agent-md-506215`), servido via Nginx (`node:24-alpine` build) com healthcheck em `/health`.
- **Qualidade e Governança**: `170` arquivos em `src/`, validado por `26` suítes no Vitest (`241/241` testes determinísticos Nível 4, `npm test`), typecheck (`npm run lint`) e design lint (`npm run design:lint`).
