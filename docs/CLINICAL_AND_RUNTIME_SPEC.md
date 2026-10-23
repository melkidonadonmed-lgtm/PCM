# Especificação Clínica, Sanitária e de Runtime — PresCMed (`PCM`)

> Documento de referência detalhada carregado sob demanda (*Progressive Disclosure*) a partir de [`../AGENTS.md`](../AGENTS.md).

---

## 1. Árvore Completa de Código (`src/` — 134 Arquivos)

```text
index.html                     # Entry HTML com script inline de tema e fontes
vite.config.ts                 # Plugins React + Tailwind; alias '@' → raiz do projeto
src/
  main.tsx                     # Bootstrap React (StrictMode)
  App.tsx                      # Estado global da aplicação + roteamento por abas (activeTab)
  types.ts                     # Interfaces de domínio (DoctorProfile, Patient, PrescriptionItem, etc.)
  types/
    index.ts                   # Contratos de estado finito (UIState) e reexportações de tipos
  config/
    tokens.ts                  # Registro canônico de tokens semânticos, propósito e densidade
  styles/
    globals.css                # Tokens semânticos CSS (:root), escala tipográfica clamp(), .clinical-unit e curvas de transição
  core/
    domain/
      clinicalEntities.ts      # Registro de macro-módulos (MOD-01..03) e contratos SOAP/PEP e Hospitalar
    storage/
      clinicalRepository.ts    # Repositório desacoplado (IClinicalRepository / LocalDexieClinicalRepository)
  index.css                    # Tailwind v4, tokens CSS, componentes em @layer e utilitários @utility
  components/
    Header.tsx                 # Header superior (fundo claro no Light, Command Bar unificada, perfil e nuvem)
    Sidebar.tsx                # Menu lateral de navegação, macro-módulos e kits clínicos de plantão (deep navy contínuo)
    MobileBottomNav.tsx        # Barra de navegação inferior mobile com 5 destinos (Receitas, Documentos, Doses, Editor, Mais)
    ui/
      SurfaceCard.tsx          # Primitiva de superfície com estados FSM (idle, loading, success, empty, error)
      SoftCard.tsx             # Cartão tátil leve com variantes flat, raised e inset
      ActionButton.tsx         # Botão semântico reutilizável com variantes e estado de loading
      Badge.tsx                # Pílula de status com suporte a alinhamento tabular (tabular-nums)
    layout/
      CommandPaletteModal.tsx  # Paleta de comandos global (Ctrl+K) para medicamentos, kits, protocolos e guias SUS
    bento/
      ConsultationReadinessBar.tsx # Barra de prontidão clínica (Emitente, Paciente/Peso, Conduta e Busca Ctrl+K)
    PrescriptionBuilder.tsx    # Construtor de receitas (orquestrador: paciente, sessões, lista e gaveta pediátrica)
    prescription/
      PatientQuickCard.tsx     # Card compacto de identificação rápida do paciente e atalhos de documentos
      MedicationComposerCard.tsx # Card de busca/composição rápida de medicamento, dose, horários e aviso de talonário
      PrescribedItemsList.tsx  # Lista reordenável de medicamentos prescritos por regime sanitário e modelos
      PrescriptionModelsModal.tsx # Modal de biblioteca e criação de modelos reutilizáveis de prescrição
      PrescriptionPreviewColumn.tsx # Coluna direita: alternância de regime (Simples/2 Vias), FolhaA4 e barra de ações
    AcoesDaReceita.tsx         # Barra de ações única da receita (Imprimir/PDF, Editor, WhatsApp, Copiar)
    PediatricCalculator.tsx    # Calculadora pediátrica dedicada por peso (mg/kg → mL/gotas)
    ExamRequester.tsx          # Solicitação de exames laboratoriais e diagnósticos por imagem
    CertificateAndReferral.tsx # Emissão de atestados médicos e encaminhamentos com conformidade CFM
    ClinicalDocumentsHub.tsx   # Central de Documentos: abas Atestado, Encaminhamento, Pedidos de Exames e Documentos SUS
    SusDocumentsFiller.tsx     # Catálogo e preenchimento dos documentos SUS (orquestrador de estado e impressão/PDF)
    sus/
      SusCatalogListView.tsx   # Grade filtrável dos 9 formulários SUS (APAC, LME, SISREG, GAL/LACEN, SISCAN, TRM-TB)
      SusCommonIdentityFields.tsx # Campos comuns de identificação (unidade/CNES, paciente/CNS, CID-10 e justificativa)
      SusRegulatorySpecificFields.tsx # Campos específicos de LME (anamnese, 1º–6º mês, incapaz) e APAC (procedimentos/oncologia/nefrologia)
      SusInteractiveVectorSheet.tsx # Grade vetorial interativa de 12 colunas (.sus-grid) para edição direta na folha SUS
    AvisoNotificacaoReceita.tsx # Aviso de tela (.no-print) para controlados que exigem Notificação de Receita
    ClinicalProtocolsView.tsx  # Protocolos de conduta clínica e catálogo por classes terapêuticas SUS/RENAME
    DocumentEditorView.tsx     # Editor visual avançado para laudos e documentos médicos livres (orquestrador Tiptap)
    editor/
      editorConfigAndFormatters.ts # Constantes tipográficas, temas de documento e geradores HTML (1 via e 2 vias)
      EditorTopActionsBar.tsx  # Barra superior do editor (alternância 1/2 vias, modelos, impressão, PDF e salvar)
      EditorSheetConfigBar.tsx # Barra de configuração da folha (margens, espaçamento, timbre, logos, marca d'água e tema)
      EditorTextFormattingToolbar.tsx # Barra de formatação rich-text Tiptap (fontes, alinhamento, listas, tabelas e imagem)
      EditorSingleViaCanvas.tsx # Folha A4 retrato (1 via) com cabeçalho editável, corpo ProseMirror e rodapé de assinatura
      EditorTwoViasCanvas.tsx  # Folha A4 paisagem (2 vias: Controle Especial Portaria 344/98 e Antimicrobiano RDC 471/2021)
      EditorModelsAndStylesDrawer.tsx # Gaveta lateral de modelos salvos, modelos clínicos predefinidos e estilos visuais
    PrintPreview.tsx           # Tela de emissão: folha A4 + ações (baixar PDF, imprimir, WhatsApp, copiar)
    documento/
      FolhaA4.tsx              # Papel A4 em tamanho real (794×1123 px), reduzido por zoom para caber; impressão fiel
      DocumentoClinico.tsx     # ÚNICO desenho de receita, exames, atestado e encaminhamento
      ReceitaDuasVias.tsx      # Receitas em paisagem (padrão PEC do SUS): simples (1 via), antimicrobiano (2 vias RDC 471/2021) e controle especial (2 vias Portaria 344/98)
      CabecalhoInstitucional.tsx  # Timbre: logo do órgão + local de atendimento + segundo logo (SUS na rede pública)
      FormularioOficialSus.tsx # Impresso oficial (APAC, LME) como fundo da folha, com os dados escritos por cima
      AssinaturaMedico.tsx     # Local, data e assinatura com nome/CRM do médico
    PatientModal.tsx           # Modal de edição rápida e cadastro de dados do paciente
    DoctorProfileModal.tsx     # Modal de configuração do médico emitente (nome, CRM/UF, clínica)
    CidSearchBar.tsx           # Campo de busca preditiva de diagnósticos e códigos CID-10
    BackupModal.tsx            # Modal de exportação e restauração de backups portáteis (.pcm.json)
    ConfirmationModal.tsx      # Modal genérico de confirmação para ações destrutivas ou de descarte
    AsyncErrorBoundary.tsx     # Barreira de erro das telas carregadas sob demanda, com opção de tentar de novo
    ContextSwitcher.tsx        # Seletor rápido de postos de trabalho e contextos clínicos do médico
    LogoGeneratorModal.tsx     # Utilitário para personalização de cabeçalho e monograma de receituário
    logo/
      LogoSvgCanvas.tsx        # Renderizador SVG vetorial parametrizado para logotipos e monogramas médicos
    PuxarParaAtualizar.tsx     # Gesto tátil de pull-to-refresh para atualização em dispositivos móveis
    WatermarkOverlay.tsx       # Camada visual de marca d'água no preview de documentos
    WatermarkSelector.tsx      # Seletor de marcas d'água predefinidas e personalizadas
    Icon.tsx                   # Componente canônico anti-mutação baseado no Google Material Symbols
  data/
    pediatricMeds.ts           # Catálogo de fármacos pediátricos com faixas de dosagem (mg/kg)
    examCatalog.ts             # Catálogo de exames laboratoriais e procedimentos diagnósticos
    cidCatalog.ts              # Base de códigos e descrições CID-10 com termos de busca
    clinicalKits.ts            # Kits clínicos de plantão ambulatorial (amigdalite, GECA, IVAS, ITU, etc.)
    clinicalProtocols.ts       # Protocolos patológicos com doses de emergência e cálculo de hidratação
    medicationDatabase.ts      # Ponto único de agregação (barrel) da base de medicamentos SUS/RENAME
    medications/
      analgesicsAndAntiInflammatories.ts # Analgésicos, antitérmicos, AINEs, corticoides e relaxantes musculares
      antimicrobialsAndAntiparasitics.ts # Antibióticos, antifúngicos, antivirais e antiparasitários
      cardioAndMetabolicMeds.ts # Anti-hipertensivos, antidiabéticos, hipolipemiantes, tireoide e vitaminas
      respiratoryGastroAndCnsMeds.ts # Respiratórios, anti-histamínicos, gastrointestinais, psicotrópicos e tópicos
    exemplos.ts                # Dados fictícios de exemplo (Melki Donadon / Seu Melki) para prévia e placeholders
    presetAssets.ts            # Logos e marcas d'água predefinidos (apontam para arquivos em public/; nunca embutir base64 aqui)
    presetClinicalTemplates.ts # Modelos estruturados de documentos e atestados clínicos
    susDocumentsCatalog.ts     # Catálogo dos 9 documentos SUS, laudo copiável e HTML do modelo do app (`TimbreSus`)
    formulariosOficiaisSus.ts  # Campos numerados da APAC e da LME: coordenadas no impresso oficial e fonte conferida
  hooks/
    useDocumentLogoManager.ts  # Estado e persistência de logotipos esquerdo/direito e estilos do Editor A4
    useDocumentTemplatesAndStyles.ts # Gerenciamento de modelos personalizados, estilos visuais e sincronização com a receita
    useModalAccessibility.ts   # Focus trap, restauração de foco e fechamento por Escape em modais
    useNavigationSync.ts       # Sincronização de abas com URL hash e atalhos de teclado Alt+1..6 / Ctrl+K
    usePrescriptionModels.ts   # Persistência local de modelos reutilizáveis de prescrição
    usePrescriptionSession.ts  # Gerenciamento de sessão, rascunhos e ciclo de vida da receita
    usePwaInstall.ts           # Detecção de suporte e acionamento de instalação como Progressive Web App
    useWorkContext.ts          # Controle de posto de trabalho ativo e alternância de contexto
  services/
    db.ts                      # Banco IndexedDB local via Dexie.js (esquema v2: workContexts e savedDocuments)
    storageService.ts          # Camada de persistência segura com fallback tipado para localStorage
    backupService.ts           # Geração e importação de backups integrais em formato .pcm.json
    cloud/
      cloudAuthService.ts      # Autenticação Google e controle de estado do médico na nuvem
      cloudSyncManager.ts      # Orquestrador de sincronização Zero-Knowledge lazy
      firebaseClient.ts        # Inicialização dos serviços Firebase/Firestore
  utils/
    doseCalculator.ts          # Motor de cálculo pediátrico, volumes, gotas e horários de tomada
    fuzzySearch.ts             # Algoritmo de busca textual fonética/aproximada com priorização de monofármacos
    medicoConfigurado.ts       # Validador de obrigatoriedade de identificação médica (nome e CRM)
    montarItensDoKit.ts        # Montagem inteligente e cálculo por peso de kits clínicos de plantão
    documentoClinico.ts        # Regras de conteúdo dos documentos (identidade do cabeçalho, título, orientação, textos)
    folhaA4.ts                 # Geometria da folha e `exportarFolhaPdf` (entrada leve; carrega o motor sob demanda)
    renderSheetToPdf.ts        # Motor de PDF: fotografa a folha na largura real do A4 e pagina
    downloadPdf.ts             # Download por blob compatível com WebView/PWA
    isSpecialControlOrAntibiotic.ts # `classificarReceita`: regime da receita (simples, antimicrobiano, controle especial)
    notificacaoDeReceita.ts    # `notificacaoExigida`: controlados que pedem Notificação de Receita em talonário próprio
    formularioOficial.ts       # Encaixe e quebra de linha do texto nas caixas do impresso oficial
    prescricaoRapida.ts        # Prescrição rápida: posologia estruturada e total de comprimidos a dispensar
    parsePrescriptionHtml.ts   # Converte o HTML do Editor A4 de volta em itens tipados da receita
    sanitizeHtml.ts            # Sanitizador anti-XSS (DOMPurify + escapeHtml preservando operadores < e >)
    compartilhamentoTexto.ts   # Formatadores puros de texto para cópia e WhatsApp por regime sanitário
  __tests__/                   # 23 suítes Vitest (215+ testes Nível 4) cobrindo cálculo pediátrico, Portaria 344/98, RDC 471/2021, CFM CID-10, APAC/LME e UI/A11y
```

---

## 2. Estado em Tempo de Execução e Chaves `localStorage`

- **SPA sem roteador (`activeTab: ActiveTab` em `App.tsx`):** Valores `'prescription'`, `'pediatric_calc'`, `'documents'`, `'exams'`, `'certificate'`, `'referral'`, `'protocols'`, `'editor'`, `'print_preview'`, `'patients'`.
  - `'documents'`, `'certificate'`, `'referral'` e `'exams'` abrem a Central de Documentos (`ClinicalDocumentsHub.tsx`) na aba correspondente; documentos SUS são a 4ª aba.
  - `'patients'` apenas abre o `PatientModal`.
- **11 Chaves Oficiais de `localStorage` (`storageService`):**
  1. `prescmed_theme`: `'light'` ou `'dark'`.
  2. `prescmed_doctor`: Perfil cadastrado do médico (`DoctorProfile`).
  3. `prescmed_patient`: Dados do paciente atual (`Patient`).
  4. `prescmed_prescription`: Lista de medicamentos da receita ativa (`PrescriptionItem[]`).
  5. `prescmed_exams`: Lista de exames solicitados (`ExamItem[]`).
  6. `prescmed_exam_indication`: Indicação clínica da solicitação de exames.
  7. `prescmed_certificate`: Dados do atestado médico ativo.
  8. `prescmed_referral`: Dados do encaminhamento ativo.
  9. `prescmed_show_kits`: Preferência de exibição da gaveta de kits clínicos na sidebar.
  10. `prescmed_custom_styles`: Estilos e personalizações visuais de impressão.
  11. `prescmed_cloud_auth_active`: Flag de sessão ativa para sincronização na nuvem.
  - Prefixo de backups: `prescmed_backup_` (`.pcm.json`). A chave legada `prescmed_show_pedia_calc` foi removida.

---

## 3. Regras Clínicas, Sanitárias e de Impressão A4 (Invariantes YMYL)

1. **Fonte Única de Desenho A4 (`FolhaA4.tsx` + `DocumentoClinico.tsx`):**
   - A prévia na tela, a tela de emissão, a impressão (`window.print`) e o PDF (`html2canvas-pro` → `jsPDF` via `exportarFolhaPdf`) saem do **mesmo componente**. Nunca crie um segundo desenho manual em jsPDF.
   - Largura fixa A4 (`794 px` retrato / `1123 px` paisagem) reduzida por `zoom` na tela. Proibido usar variantes responsivas (`sm:`, `md:`) ou `dark:` dentro da folha A4 (`#FFFFFF` com tinta escura sempre).
   - Datas de documento usam `dataLocalISO` (nunca `toISOString()`, que à noite avança para o dia seguinte em UTC).
2. **Três Regimes de Receita em A4 Paisagem (`classificarReceita` em `utils/isSpecialControlOrAntibiotic.ts`):**
   - *Simples:* 1 via na metade esquerda da folha A4 paisagem, linha de corte central (`✂`) e metade direita livre (padrão PEC do SUS).
   - *Antimicrobiano (RDC Anvisa nº 471/2021):* 2 vias lado a lado no modelo limpo da receita simples, validade de 10 dias; farmácia retém a **2ª via** e a 1ª fica com o paciente.
   - *Controle Especial (Portaria SVS/MS nº 344/98):* 2 vias lado a lado; farmácia retém a **1ª via**; quadros de comprador/fornecedor e endereço do paciente.
   - *Notificação de Receita (Listas A1, A3, B1, B2, C2):* O app não emite talonário físico; `notificacaoExigida` exibe `AvisoNotificacaoReceita` sempre com `.no-print`. Codeína/tramadol $\le 100\text{ mg}$/unidade e fenobarbital seguem em Controle Especial.
3. ** Segredos Clínicos e Posologia Segura:**
   - **Sem Peso, Sem Dose:** Calculadora pediátrica (`PediatricCalculator.tsx` / `doseCalculator.ts`) e protocolos bloqueiam cálculo sem peso cadastrado.
   - **Formatação Numérica:** Vírgula decimal e **sem separador de milhar** em mg (`"7,5 mg"`, `"1000 mg"` — nunca `"1.000 mg"`). Concordância singular/plural (`"1 gota"`, `"X gotas"`).
   - **Sem Horários ou Dados Inventados:** `scheduleTimes` só é preenchido a partir de catálogo/protocolo estruturado; itens livres usam `scheduleInterval: 'Conforme posologia'` e `scheduleTimes: []`. Em documentos SUS (`susDocumentsCatalog.ts`), campos vazios jamais recebem valores clínicos default (`susSemDadosInventados.test.ts`).
   - **Impresso Oficial SUS (APAC e LME):** Usa a imagem oficial em `<img>` (`public/formularios-sus/`) e posiciona os dados nas coordenadas numeradas (`formulariosOficiaisSus.ts` / `FormularioOficialSus.tsx`). Demais guias (SISREG, GAL/LACEN, SISCAN, TRM-TB) usam `TimbreSus` (`LOGO_DO_ESTADO` para categoria `apac`, logo do posto ativo + `LOGO_DO_SUS` para rede pública).
   - **Sigilo CID-10 (Res. CFM 1.658/2002 e 1.819/2007):** CID-10 só é impresso com `authorizedByPatient = true`.
