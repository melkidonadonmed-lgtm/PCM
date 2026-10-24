# PresCMed — CURRENT STATE (.context)

## Fase atual: Plataforma Multi-Módulo (`MOD-01`, `MOD-03` Hospitalar & `Scoreboard CDSS`) + Auditoria REA P0–P3 (24/10/2026)

### 1. Resumo Arquitetural Vigente
- **Saída única de documentos A4 (`src/components/documento/`):** `FolhaA4` + `DocumentoClinico` + `ReceitaDuasVias` + `FormularioOficialSus`. A prévia na tela, a impressão (`window.print`) e o PDF (`html2canvas-pro` + `jspdf` via `exportarFolhaPdf`) renderizam exatamente o mesmo componente A4.
- **Três regimes sanitários em A4 paisagem (`1123×794 px`, padrão PEC/SUS):**
  - *Simples:* 1 via na metade esquerda, linha de corte central (`✂`) e metade direita livre.
  - *Antimicrobiano (RDC Anvisa nº 471/2021):* 2 vias lado a lado (validade 10 dias, retenção da 2ª via na farmácia, sexo do paciente quando informado).
  - *Controle Especial (Portaria SVS/MS nº 344/98):* 2 vias lado a lado (retenção da 1ª via na farmácia, endereço do paciente e quadros de comprador/fornecedor).
  - *Notificação de Receita (Listas A1, A2 > 100 mg, A3, B1, B2, C2, C3):* aviso de tela e texto exportado (`.no-print`), nunca na folha impressa.
- **9 Documentos Regulatórios do SUS (`Alt+6`):**
  - **APAC (55 campos) e LME (23 campos)** saem sobre a imagem do impresso oficial do Ministério da Saúde (`public/formularios-sus/`) ou na grade vetorial interativa de 12 colunas (`SusInteractiveVectorSheet.tsx` / `.sus-grid`).
  - **7 Guias Complementares** (`APAC Complementar`, `SISREG`, `SISCAN Citopatológico`, `SISCAN Histopatológico`, `SISCAN Mamografia`, `GAL/LACEN Geral` e `GAL TRM-TB`) saem em grades técnicas HTML numeradas com `TimbreSus` e zero dados clínicos presumidos.
- **Módulo Hospitalar & Gestão de Leitos (`MOD-03` — `Alt+7`):**
  - Persistência IndexedDB `Dexie v3` (`workContexts`, `savedDocuments`, `hospitalBeds`).
  - Modelo Padronizado de Evolução e Admissão (`EF/LT`, `ID`, `DN`, `CNS`, `DIH` → `D1..Dn`, `QP`, `HD 1/1.1`, `HDA`, `ALERGIAS`, `SOROLOGIAS`, `HPP`, `HF/SOCIAL`, `FEZ USO`, `EM USO`, `EXAMES LAB`, `EXAMES DE IMAGEM`, `ESCORES CLÍNICOS`, `EXAME FÍSICO`, `EVOLUÇÃO 24H`, `DIETA`, `HIDRATAÇÃO`, `Pareceres`, `PENDÊNCIAS`, `CD`).
  - Ingestão multimodal sob Diretriz de Rigor Terapêutico (zero alucinação), monitoramento longitudinal e cruzamento *Conduta × Evolução* em 6 eixos (`infeccioso`, `hemodinamico`, `renal`, `ventilatorio`, `metabolico`, `escores_clinicos`).
- **Scoreboard CDSS, EPARADA & Rastreio Oncológico (`Alt+8`):**
  - 114 calculadoras clínicas determinísticas em 9 blocos de especialidade (`scores-catalog` em chunk dedicado), Bomba de Infusão Contínua (`BIC`), Radar Fisiológico, exportação SOAP/SBAR (`pepExportEngine.ts`), painel de PCR `EPARADA` (ACLS/PALS por peso + 5H/5T), Rastreio Oncológico Rápido INCA/MS (Mama BI-RADS, Colo, Próstata PSA) e ponte bidirecional com os leitos hospitalares (`HospitalBedScoreEntry`).

### 2. Entregas Recentes (21/10/2026 a 24/10/2026)
- **Modularização concluída (21/10/2026):** Os 5 antigos monólitos > 1.000 linhas (`medicationDatabase.ts`, `LogoGeneratorModal.tsx`, `PrescriptionBuilder.tsx`, `SusDocumentsFiller.tsx`, `DocumentEditorView.tsx`) foram decompostos em submódulos coesos (0 arquivos > 850 linhas em `src/`).
- **Auditoria REA P0–P3 e Saneamento de Segurança (24/10/2026):**
  - Evolução do backup `.pcm.json` para `version: 2` incluindo `hospitalBeds` e `customStyles`.
  - Sanitização HTML multi-pass em ponto fixo (`sanitizeHtml.ts`) e escape integral de operadores clínicos (`<` e `>`) no Editor A4.
  - Fila persistente de exclusões (`prescmed_cloud_pending_deletes`) e fatiamento de lotes (`<= 450` ops) no `cloudSyncManager.ts` (prevenindo "Zombie Records").
  - Higienização de `firestore.rules` (remoção de coleções órfãs legadas, limite de chaves `<= 30` e validação LGPD `isTemplate == true`).
  - Remoção da dependência residual `lucide-react` (100% dos ícones unificados em `Icon.tsx` via `material-symbols`) e injeção determinística de clock (`nowMs`) nos motores hospitalares.

## Implantação e Qualidade
- **Produção:** Cloud Run `prescmed` (`southamerica-east1`) — https://prescmed-syqnqsm4iq-rj.a.run.app
- **Qualidade:** `241/241` testes em `26` suítes Vitest (`100.0/100` Nível 4 Determinístico) · `tsc --noEmit` limpo (`0 any`) · `npm run design:lint` limpo (`0 erros`) · `audit_tactile_ui.py` `100.0/100.0 [PASS]`.

## Pendências (Backlog Opcional / Revisão Humana)
1. **APAC (Conferência Regulatória Local):** Validar o impresso nacional (matriz SES/RS, 55 campos) junto à regulação local (SESAU-RO / SEMUSA) quanto aos campos administrativos deixados em branco para preenchimento manual (campos 4, 11, 12, 15 e 21–35).
2. **Subset WOFF2 (`material-symbols`):** Avaliar geração futura de subset de glifos para reduzir o precache offline do PWA (~4 MB).
