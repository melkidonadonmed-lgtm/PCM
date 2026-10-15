# CONTEXTO OPERACIONAL — `PCM` (PresCMed — Prescrição e Documentos Clínicos Digitais)

Este documento resume a arquitetura, o estado operacional e o fluxo de publicação do sistema **PresCMed (`PCM`)**.

---

## 1. Papel e Arquitetura
O **PresCMed (`PCM`)** é a SPA clínica e ambulatorial 100% client-side em **React 19 + TypeScript + Vite 6 + Tailwind CSS v4** voltada ao contexto médico brasileiro (SUS e consultório).
- **Módulos Clínicos**: Receituário simples, antimicrobiano (2 vias RDC 471/2021) e controle especial (2 vias Portaria 344/98), calculadora pediátrica por peso (`sem peso, sem dose`), solicitação de exames, atestados (consentimento explícito CID-10 conforme CFM 1.658/2002), encaminhamentos e impressos oficiais do SUS (`APAC`, `LME`, `SISREG`, `GAL/LACEN`, `SISCAN`, `TRM-TB`).
- **Fonte Única de Impressão (`FolhaA4.tsx` + `DocumentoClinico.tsx`)**: A prévia na tela, a impressão (`window.print`) e a exportação em PDF (`html2canvas-pro` + `jspdf`) renderizam exatamente o mesmo componente A4.
- **Persistência Local e Cloud Opcional**: IndexedDB (`Dexie.js` v4) + 11 chaves em `localStorage`, com sincronização opcional via Firebase Auth/Firestore carregada sob demanda (`vendor-firebase`).

---

## 2. Estado Operacional e Deploy
- **Produção Cloud Run**: Serviço `prescmed` em `southamerica-east1` (projeto `agent-md-506215`), servido via Nginx (`node:24-alpine` build) com healthcheck em `/health`.
- **Qualidade e Governança**: Validado por suíte abrangente no Vitest (`npm test`), typecheck (`npm run lint`) e design lint (`npm run design:lint`).
