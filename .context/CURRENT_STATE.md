# PresCMed — CURRENT STATE (.context)

## Fase atual: saída única de documentos (10/10/2026)

**Problema resolvido:** a prévia mostrava uma coisa e o arquivo saía outra. Havia cinco desenhos
independentes do mesmo documento (prévia da tela de receitas, folha do `PrintPreview`, PDF desenhado à
mão em `pdfGenerator.ts`, Editor A4 e HTML dos documentos SUS).

**Agora existe uma única folha:** `src/components/documento/` (`FolhaA4` + `DocumentoClinico`). A prévia,
a impressão e o PDF saem dela. Detalhes e regras em `AGENTS.md` → "Geração e Impressão de Documentos".

### O que mudou
- `pdfGenerator.ts` e `jspdf-autotable` removidos; PDF = fotografia da folha exibida (`exportarFolhaPdf`).
- `html2canvas` → `html2canvas-pro`: o original falhava com as cores `oklch` do Tailwind v4, e o código
  caía em silêncio em `window.print()` — por isso o PDF do SUS/APAC e do Editor A4 nunca era gerado.
- Cabeçalho = local de atendimento + logo; médico na assinatura (e no "emitente" da receita especial).
- Removidos QR code, "Validação Digital CFM" e "Assinatura Eletrônica Válida": o app não assina digitalmente.
- Receita de controle especial: as duas vias trazem a prescrição completa e o endereço do paciente.
- Editor A4 voltou a abrir (TipTap 3 lançava exceção ao ler `editor.view` antes da montagem).
- Atestado: CID-10 começa desmarcado; datas em horário local (antes, à noite, saía o dia seguinte).
- Deploy: cabeçalhos de segurança efetivos no nginx, Node 24, testes como portão do build, teste de fumaça.
- `node_modules/` deixou de ser versionado (eram 30.957 arquivos no git).

### Documentos SUS no impresso oficial (11/10/2026)
- **APAC (laudo de 55 campos) e LME (23 campos)** saem sobre o próprio formulário do Ministério da Saúde:
  a imagem do impresso é o fundo da folha (`public/formularios-sus/`) e os dados caem em cada campo
  numerado (`data/formulariosOficiaisSus.ts`, `components/documento/FormularioOficialSus.tsx`).
- Campo sem dado fica em branco para a caneta; sexo, raça/cor, tratamento prévio e incapacidade só saem
  marcados se escolhidos na tela. Texto que não cabe na caixa sai com "[…]" e a tela avisa.
- Os outros 7 documentos SUS não têm impresso nacional único: seguem no modelo do app, agora com o logo
  do órgão do posto de trabalho ativo (SEMUSA, na USF) à esquerda e o do SUS à direita do título
  (`TimbreSus` em `susDocumentsCatalog.ts`). A tela diz em cada cartão qual é o caso.
- **Timbre geral:** receitas, exames, atestado e encaminhamento de posto público saem com o logo do
  órgão à esquerda, o nome do local no meio e o logo do SUS à direita (antes só o logo do órgão).
  Documentos da categoria APAC levam o logo do estado (SESAU-RO) no lugar do municipal.
- Os PDFs da pasta do Drive `16_Documentos_comp_SUS` **não são os impressos oficiais** (são recriações:
  APAC com 52 campos, LME com 27). Não usar como referência de diagramação.
- Fundos gerados dos PDFs oficiais com `sandbox/python/pcm-formularios/gera_fundo.py` (PyMuPDF, 200 dpi);
  validação em navegador com `sandbox/node/pcm-repro/formularios.mjs`.

## Implantação
- Produção: Cloud Run `prescmed` (southamerica-east1) — https://prescmed-syqnqsm4iq-rj.a.run.app
- Deploy automático no push em `main` (gatilho `gcpmain` → `cloudbuild.yaml`).

## Qualidade
- 190/190 testes (`test-quality-auditor` 100.0/100 Nível 4 Determinístico) · `tsc --noEmit` limpo (0 `any`) · `npm run design:lint` limpo · `npm run build` OK · `deterministic_scorer.py` SGA 93.3/100 (`APROVADO`, INE 86.25%, IPC 100%, IRM 100%, ICTE 100%, 0 `alert()`/`confirm()` nativos).
- Validado em navegador (dados fictícios): desktop claro e celular escuro geram PDFs idênticos.

### Padrão PEC do SUS (A4 Paisagem) + Correções dos Grupos A e B (13/10/2026)
- **Receituário em A4 paisagem (padrão PEC do SUS):** as três modalidades de receita (`simple_prescription`, `antimicrobial_prescription`, `special_prescription`) saem sempre em A4 paisagem (`1123×794 px`), facilitando o corte ao meio (`✂`):
  - *Simples:* 1 via na metade esquerda da folha A4 paisagem, linha de corte central e metade direita em branco.
  - *Antimicrobiano (RDC Anvisa nº 471/2021):* 2 vias lado a lado no mesmo modelo limpo da receita simples (válida por 10 dias; retenção da 2ª via na farmácia).
  - *Controle Especial (Portaria SVS/MS nº 344/98):* 2 vias lado a lado com os quadros de comprador e fornecedor (retenção da 1ª via na farmácia).
- **Grupo A resolvido:**
  - Editor A4 (`DocumentEditorView.tsx`): seletor no topo com 3 botões independentes (`Receita simples`, `Antimicrobiano • 2 vias`, `Controle especial • 2 vias`), corrigindo o bug em que o botão "Receita simples" não trocava a folha em consultas mistas (antiga pendência #10).
  - Documentos SUS sem impresso oficial (`susDocumentsCatalog.ts`): SIGTAP e nome do procedimento não abrem mais pré-preenchidos por padrão nos 7 modelos restantes; o médico opta explicitamente pelo botão "Usar código sugerido" em `SusDocumentsFiller.tsx` (antiga pendência #3).
- **Grupo B resolvido:**
  - *Notificação de Receita (antiga pendência #1):* adicionado `avisoTextoNotificacao` no texto de WhatsApp e área de transferência (`PrescriptionBuilder.tsx` e `PrintPreview.tsx`) para alertar sobre a exigência de talonário físico (Listas A1, A3, B1, B2 e C2) sem poluir a folha A4 impressa; substituído o Clonazepam (Lista B1) por Cloridrato de Amitriptilina 25 mg (Lista C1) no modelo pronto `tpl-receituario-controle-especial` (`presetClinicalTemplates.ts`).
  - *Sexo do paciente na receita de antimicrobiano (RDC 471/2021 — antiga pendência #2):* adicionado campo opcional `sex?: '' | 'M' | 'F'` em `Patient` (iniciando vazio `''`, nunca presumido), com seletor em `PatientModal.tsx`, sincronização bidirecional com `SusDocumentsFiller.tsx` e impressão em `ReceitaDuasVias.tsx` apenas quando informado.
  - *CNS, CPF e CNES do médico no perfil (antiga pendência #6):* adicionados campos opcionais `cns`, `cpf` e `cnes` em `DoctorProfileModal.tsx` e `DEFAULT_DOCTOR`, preservando-os ao salvar o perfil e preenchendo automaticamente o campo 15 da LME e o campo 44 da APAC.
  - *Timbre institucional nas 2 vias do Editor A4 (antiga pendência #8):* cabeçalhos de 1ª e 2ª via em `DocumentEditorView.tsx` exibem o logotipo principal à esquerda e o logotipo secundário (SUS) à direita, alinhados ao `CabecalhoInstitucional.tsx`.

### Refinamento de Front-End Minimalista e Navegação Fluida (14/10/2026)
- **Combobox único de fármacos (`PrescriptionBuilder.tsx`):** unificação da busca e do campo de medicamento (`#med-search-input` / `Ctrl+K`), com proteção contra sobrescrita acidental ao pressionar `Enter` quando o médico edita livremente o nome do medicamento.
- **Navegação de topo e atalhos globais (`Header.tsx` e `App.tsx`):** barra segmentada de módulos no desktop (`lg:flex`) com atalhos globais `Alt+1` a `Alt+5` (ignorados quando o foco está em campos editáveis ou `contenteditable`).
- **Sidebar e Central de Documentos (`Sidebar.tsx` e `ClinicalDocumentsHub.tsx`):** `Sidebar` enxuta em Deep Navy com tooltips flutuantes no modo recolhido (`68px`); abas da Central de Documentos com navegação por setas (`roving tabindex`).
- **Suíte dedicada:** adicionado `src/__tests__/uiNavigationAndLayout.test.tsx`.

### Segurança Clínica, Grades Técnicas SUS, Qualidade Determinística Nível 4 & CSP Ativa (16/10/2026)
- **Segurança clínica pediátrica e Portaria 344/98:**
  - `src/utils/montarItensDoKit.ts`: aplicado teto máximo de 20 mL por tomada para amoxicilina 250 mg/5 mL (1000 mg) e prednisolona 3 mg/mL (60 mg), alinhado ao catálogo `src/data/pediatricMeds.ts`.
  - `src/utils/notificacaoDeReceita.ts` e `src/utils/isSpecialControlOrAntibiotic.ts`: incluída detecção da Lista C3 (`talidomida`, `lenalidomida` — Notificação de Receita Especial da Talidomida + Termo de Responsabilidade/Esclarecimento) e do adendo da Lista A2 para `codeína` e `tramadol` com concentração acima de 100 mg por unidade posológica (Notificação de Receita A amarela).
- **Grades técnicas HTML estruturadas nos 7 documentos SUS complementares (`src/data/susDocumentsCatalog.ts`):**
  - `buildSusDocumentHtml` agora renderiza tabelas e quadros técnicos numerados com checkboxes `[ ]` / `[X]` para preenchimento híbrido (digital no Editor A4 + caneta no papel) nos 7 modelos sem formulário nacional único (`apac_complementar`, `sisreg_guia`, `siscan_citopatologico`, `gal_lacen_geral`, `siscan_histopatologico`, `siscan_mamografia`, `gal_trm_tb`), preservando timbre `TimbreSus` e zero dado clínico inventado.
- **Qualidade de código, tipagem estrita e UX não-bloqueante:**
  - Eliminadas todas as 21 chamadas bloqueantes `alert()` / `confirm()` em `BackupModal.tsx`, `LogoGeneratorModal.tsx`, `PrescriptionBuilder.tsx` e `DocumentEditorView.tsx`, substituídas por banners acessíveis (`role="alert"`), toasts e `ConfirmationModal`.
  - Eliminadas todas as ocorrências de `any` explícito em `src/` e removido código morto (`handleApplyStylePreset`), desacoplando `localStorage.setItem` via `storageService` e extraindo URLs externas para `src/data/externalUrlsConfig.ts`.
  - Suíte Vitest (`src/__tests__/`) 100% determinística (`100.0/100` Nível 4 no `test-quality-auditor`, 0 `Date.now()`/`Math.random()`).
  - `nginx-security-headers.conf`: cabeçalho `Content-Security-Policy` promovido para modo ativo.

## Pendências (precisam de decisão ou revisão humana)
1. **APAC:** a cópia do modelo nacional veio do site da SES/RS (o Ministério não publica o PDF em página própria). Conferir com o impresso que a regulação local aceita; campos 4, 11, 12, 15 e 21–35 ficam em branco porque o app não coleta esses dados.
2. **Fonte de ícones (`material-symbols`, 4 MB):** avaliar subconjunto de glifos no empacotamento PWA caso seja necessário reduzir o precache offline.
3. **Modularização de arquivos extensos:** `DocumentEditorView.tsx`, `PrescriptionBuilder.tsx`, `medicationDatabase.ts`, `SusDocumentsFiller.tsx` e `LogoGeneratorModal.tsx` possuem > 1.000 linhas e podem ser fatiados em submódulos em ciclos futuros.


