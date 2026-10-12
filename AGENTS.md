# AGENTS.md — Remix PresCMed new

## Visão geral do projeto

**PresCMed** é um sistema de prescrição médica digital em português (pt-BR), voltado ao contexto clínico e ambulatorial brasileiro. Funcionalidades principais:

- Prescrição médica estruturada com busca inteligente de fármacos, categorias SUS/RENAME e kits de plantão.
- Calculadora pediátrica unificada de doses por peso (mg/kg → mL/gotas), com regra estrita "sem peso, sem dose".
- Solicitação de exames laboratoriais e diagnósticos por imagem, com rotinas e painéis prontos.
- Documentos SUS: APAC e LME sobre o impresso oficial; guia SISREG, GAL/LACEN, SISCAN e TRM-TB no modelo do app.
- Emissão de atestados médicos e encaminhamentos (com conformidade ética e legal CFM, ex.: Res. CFM 1.658/2002 para consentimento de CID-10).
- Editor visual de laudos e documentos clínicos.
- Emissão de documentos (receituário simples, receituário de controle especial em 2 vias — Portaria 344/98, exames, atestado, encaminhamento, documentos SUS) por **uma única folha A4**: a prévia na tela, a impressão e o PDF saem do mesmo componente.
- Tela de emissão (`PrintPreview`) e protocolos clínicos por patologia.

O projeto foi gerado a partir de um template do **Google AI Studio** (ver `metadata.json`), mas o código atual é uma **SPA 100% client-side**: não há backend próprio. A única comunicação com servidor é a sincronização opcional com o Firebase (login Google + Firestore), carregada sob demanda. `@google/genai`, `express`, `dotenv` e `motion` **saíram do `package.json`** e não são importados em nenhum arquivo de `src/` — não crie código assumindo que exista um servidor, chamadas à API Gemini ou animações via `motion`.

**Atenção:** este é um app do domínio médico (YMYL). As doses pediátricas usam regras clínicas específicas do Brasil (ex.: paracetamol gotas = 1 gota/kg/dose). Qualquer alteração em lógica de cálculo de doses (`src/utils/doseCalculator.ts`), kits de plantão (`src/data/clinicalKits.ts`) ou catálogos farmacêuticos (`src/data/`) exige revisão cuidadosa e execução dos testes.

## Stack tecnológica

- **React 19 + TypeScript ~5.8** (modo funcional com hooks; modo estrito parcial — `tsconfig.json` não habilita `strict`).
- **Vite 6** como bundler e dev server (`@vitejs/plugin-react` e `@tailwindcss/vite`).
- **Tailwind CSS v4** via `@tailwindcss/vite` (configuração declarada diretamente no CSS com `@import "tailwindcss"`, `@theme`, `@utility` e `@layer` em `src/index.css`).
- **Ícones**: Componente canônico `<Icon />` com Google Material Design Symbols (`material-symbols` 100% offline via woff2) e `lucide-react`.
- **html2canvas-pro + jspdf** para exportar em PDF a folha exibida na tela (carregados sob demanda). `html2canvas-pro` é obrigatório: o `html2canvas` original não entende as cores `oklch` do Tailwind v4 e falha em silêncio.
- **Dexie.js 4** para persistência estruturada IndexedDB de contextos e documentos salvos (o esquema do banco está na versão 2: tabelas `workContexts` e `savedDocuments`).
- **Tiptap 3** no Editor A4 (`DocumentEditorView.tsx`), em chunk separado.
- **Firebase 12** (Auth + Firestore) para a sincronização opcional na nuvem, em chunk `vendor-firebase` carregado só depois do clique em "Nuvem" e fora do precache.
- **vite-plugin-pwa** (Workbox) para instalação como PWA e funcionamento offline.
- **Vitest 5** para os testes.
- Gerenciador de pacotes: **npm**, com `package-lock.json`.

## Comandos

```bash
npm ci             # instalação reproduzível a partir do package-lock.json
npm run dev        # dev server Vite na porta 3001, host 0.0.0.0
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção
npm run lint       # type-check: tsc --noEmit
npm run test       # testes unitários, clínicos e snapshots via Vitest
npm run test:watch # modo contínuo de testes Vitest
npm run design:lint # linter de conformidade DESIGN.md (Google Labs)
npm run clean      # remove dist/
```

**Testes:** o projeto utiliza **Vitest** integrado ao Vite. A suíte cobre:
- Cálculos pediátricos e formatação segura (`doseCalculator.test.ts`).
- Kits clínicos de plantão e montagem de prescrição com snapshots (`clinicalKits.test.ts`).
- Conformidade sanitária com a Portaria SVS/MS 344/98 para controle especial em 2 vias (`sanitaryCompliancePortaria344.test.ts`).
- Consentimento explícito de CID-10 conforme Resoluções CFM 1.658/2002 e 1.819/2007 (`cfmConsentCid10.test.ts`).
- Resolução de símbolos e aliases do componente canônico de ícones (`iconComponent.test.ts`).
- Rotinas e painéis de exames (pré-natal por trimestre, saúde da mulher/homem/idoso, HAS, diabetes, IST): todo exame do painel existe no catálogo (`examCatalog.test.ts`).
- Aviso de Notificação de Receita para as listas A1, A3, B1, B2 e C2, fora da folha impressa (`notificacaoDeReceita.test.tsx`).
- Regimes de receita e folha do antimicrobiano (`regimesDeReceita.test.tsx`); documentos SUS em branco sem dado clínico (`susSemDadosInventados.test.ts`).
- APAC e LME sobre o impresso oficial: cada dado no campo numerado, campo vazio em branco, encaixe do texto na caixa (`formulariosOficiaisSus.test.tsx`).
- Folha única dos documentos — cabeçalho institucional, ausência de selos/QR de validação, CID só com consentimento, nada de texto clínico inventado (`documentoClinico.test.tsx`).
- Detecção de antimicrobianos e controlados por nome e princípio ativo (`specialControlAntibiotic.test.ts`).
- Prescrição rápida: posologia estruturada e total de comprimidos a dispensar (`prescricaoRapida.test.ts`).
- Volta do Editor A4 para a receita: HTML editado convertido de novo em itens tipados (`parsePrescriptionHtml.test.ts`).
- Catálogo e gerador dos documentos SUS (`susDocumentsAndEditorEnhancements.test.ts`).
- Limpeza dos dados antes de gravar no Firestore (`cloudSyncSanitize.test.ts`).
- Navegação e fluxo de consulta: rotas do editor, preenchimento e limpeza do paciente, calculadora em gaveta e Central de Documentos (`editorRoutingAndActions.test.ts`, `patientAutofillAndClear.test.ts`, `pediatricDrawerAndDocumentsHub.test.ts`).

Ao modificar lógica de cálculo, kits ou conformidade sanitária, execute obrigatoriamente `npm run test`, `npm run lint` e `npm run design:lint`.

Para alterações de UI, impressão ou PDF, use a skill `ui-pdf-validation`. Para qualquer alteração clínica, use `clinical-change-safety` e solicite revisão do agente `prescmed-clinical-reviewer`. As skills ficam em `.github/skills/` e o agente em `.github/agents/`.

## Estrutura do código

```
index.html                     # Entry HTML com script inline de tema e fontes
vite.config.ts                 # Plugins React + Tailwind; alias '@' → raiz do projeto
src/
  main.tsx                     # Bootstrap React (StrictMode)
  App.tsx                      # Estado global da aplicação + roteamento por abas (activeTab)
  types.ts                     # Interfaces de domínio (DoctorProfile, Patient, PrescriptionItem, etc.)
  index.css                    # Tailwind v4, tokens CSS, componentes em @layer e utilitários @utility
  components/
    Header.tsx                 # Header superior (fundo claro no Light, botão Início, perfil e nuvem)
    Sidebar.tsx                # Menu lateral de navegação e kits clínicos de plantão (deep navy contínuo)
    MobileBottomNav.tsx        # Barra de navegação inferior mobile com 5 destinos (Receitas, Documentos, Doses, Editor, Mais)
    PrescriptionBuilder.tsx    # Construtor de receitas (busca, formulário de prescrição, lista e prévia A4)
    AcoesDaReceita.tsx         # Barra de ações única da receita (Imprimir/PDF, Editor, WhatsApp, Copiar)
    PediatricCalculator.tsx    # Calculadora pediátrica dedicada por peso (mg/kg → mL/gotas)
    ExamRequester.tsx          # Solicitação de exames laboratoriais e diagnósticos por imagem
    CertificateAndReferral.tsx # Emissão de atestados médicos e encaminhamentos com conformidade CFM
    ClinicalDocumentsHub.tsx   # Central de Documentos: abas Atestado, Encaminhamento, Pedidos de Exames e Documentos SUS
    SusDocumentsFiller.tsx     # Catálogo e preenchimento dos documentos SUS (APAC, LME, SISREG, GAL/LACEN, SISCAN, TRM-TB)
    AvisoNotificacaoReceita.tsx # Aviso de tela (.no-print) para controlados que exigem Notificação de Receita
    ClinicalProtocolsView.tsx  # Protocolos de conduta clínica e catálogo por classes terapêuticas SUS/RENAME
    DocumentEditorView.tsx     # Editor visual avançado para laudos e documentos médicos livres
    PrintPreview.tsx           # Tela de emissão: folha A4 + ações (baixar PDF, imprimir, WhatsApp, copiar)
    documento/
      FolhaA4.tsx              # Papel A4 em tamanho real (794×1123 px), reduzido por zoom para caber; impressão fiel
      DocumentoClinico.tsx     # ÚNICO desenho de receita, exames, atestado e encaminhamento
      ReceitaDuasVias.tsx      # 2 vias lado a lado em paisagem: antimicrobiano (RDC 471/2021) e controle especial (Portaria 344/98)
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
    medicationDatabase.ts      # Base unificada de medicamentos (adulto e pediátrico) categorizada por classe SUS/RENAME
    exemplos.ts                # Dados fictícios de exemplo (Melki Donadon / Seu Melki) para prévia e placeholders
    presetAssets.ts            # Logos e marcas d'água predefinidos (apontam para arquivos em public/; nunca embutir base64 aqui)
    presetClinicalTemplates.ts # Modelos estruturados de documentos e atestados clínicos
    susDocumentsCatalog.ts     # Catálogo dos 9 documentos SUS, laudo copiável e HTML do modelo do app (`TimbreSus`)
    formulariosOficiaisSus.ts  # Campos numerados da APAC e da LME: coordenadas no impresso oficial e fonte conferida
  hooks/
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
    fuzzySearch.ts             # Algoritmo de busca textual fonética/aproximada para medicamentos e CIDs
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
  __tests__/                   # Um arquivo por regra; a lista do que cada um cobre está em "Comandos → Testes"
```

## Arquitetura em tempo de execução

- **SPA sem roteador:** A navegação ocorre por estado centralizado (`activeTab: ActiveTab`) em `App.tsx` (valores: `'prescription'`, `'pediatric_calc'`, `'documents'`, `'exams'`, `'certificate'`, `'referral'`, `'protocols'`, `'editor'`, `'print_preview'`, `'patients'`). Não há react-router nem alteração de rota via URL.
  - `'documents'`, `'certificate'`, `'referral'` e `'exams'` abrem a mesma tela, a Central de Documentos (`ClinicalDocumentsHub.tsx`), já na aba correspondente; os documentos SUS são a quarta aba dela.
  - `'patients'` não tem tela: selecioná-lo só abre o `PatientModal`.
- **Estado centralizado em `App.tsx`:** Médico, paciente, medicamentos prescritos, exames selecionados, atestado e encaminhamento residem em `useState` no App e são transmitidos via props. Mantenha esse padrão determinístico; não adicione gerenciadores globais externos (Redux/Zustand).
- **Persistência em `localStorage`:** O sistema utiliza 11 chaves oficiais sincronizadas via `storageService` e `useEffect`:
  1. `prescmed_theme`: Tema visual (`'light'` ou `'dark'`).
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
  - Prefixo de arquivos: `prescmed_backup_` (nomenclatura padrão de backups `.pcm.json`).
  - *Nota:* A chave legada `prescmed_show_pedia_calc` não existe mais no sistema.
- **Tema claro/escuro e layout:**
  - Script inline no `<head>` de `index.html` avalia `prescmed_theme` antes da pintura da tela para prevenir FOUC (flash de tema).
  - Tema Claro: Canvas creme/slate cirúrgico (`--bg-app: #F9F6F0` / `#F8FAFC`), superfícies e cards brancos (`--surface-card: #FFFFFF` / `#FFFDF9`).
  - Tema Escuro: Fundo obsidian (`--bg-app: #0D0F12`), superfícies grafite translúcidas (`--surface-card: #1A1D24`).
  - **Header claro no tema claro**: `Header.tsx` adota superfície de cartão `bg-[var(--surface-card)]` (claro no tema claro, escuro no tema escuro), integrando-se ao canvas de trabalho. O logo é um botão "Início" funcional (retorna à aba Receitas e rola para o topo) sem tagline textual decorativa.
  - **Sidebar e MobileBottomNav contínuos em Deep Navy**: Ambos mantêm acabamento azul-marinho profundo (`.panel-navy`) com tipografia clara em ambos os temas.
  - **Navegação Mobile (`MobileBottomNav`)**: Visível abaixo de `lg` (1024px) com exatamente 5 destinos (Receitas, Documentos, Doses, Editor, Mais). O botão "Mais" abre a `Sidebar` completa em modo gaveta/diálogo acessível, onde ficam Protocolos e Exportar. A funcionalidade de exportar/backup reside na Sidebar.
  - Gesto tátil de puxar para atualizar (`PuxarParaAtualizar.tsx`) integrado para telas de toque.
- **Página Principal de Receituário (`PrescriptionBuilder.tsx`):**
  - Composta por busca rápida de medicamentos, formulário "Prescrição", lista "Medicamentos prescritos" e bancada com prévia de impressão A4.
  - Barra de ações única consolidada em `AcoesDaReceita.tsx`: Imprimir/PDF (ação primária), Editor e WhatsApp (ações secundárias) e Copiar texto (ação terciária).
  - A antiga calculadora rápida inline foi removida; o botão "Calcular dose pelo peso" direciona para a aba Doses (`PediatricCalculator.tsx` + `src/utils/doseCalculator.ts`, a única calculadora do sistema).
- **Kits de Plantão e Protocolos:**
  - Kits ambulatoriais de plantão acessíveis na sidebar (`src/data/clinicalKits.ts`), montados por `src/utils/montarItensDoKit.ts` e validados por snapshots em `clinicalKits.test.ts`.
  - Protocolos clínicos (`ClinicalProtocolsView.tsx`) dispõem de condutas patológicas e catálogo farmacêutico agrupado por classe terapêutica SUS/RENAME, com ação "Usar na receita" para transferência direta.
- **Geração e Impressão de Documentos (fonte única):**
  - **Regra de ouro: o que aparece na folha é o que sai.** Existe um único desenho de cada documento — `components/documento/DocumentoClinico.tsx` dentro de `FolhaA4.tsx`. A prévia da tela de receitas, a tela de emissão, a impressão (`window.print`/Ctrl+P) e o PDF usam esse mesmo componente. **Nunca crie um segundo desenho** (ex.: PDF montado à mão com jsPDF): foi isso que fazia a prévia mostrar uma coisa e o arquivo sair outra.
  - A `FolhaA4` tem largura fixa de A4 (794 px retrato / 1123 px paisagem) e é apenas reduzida por `zoom` na tela. **Dentro da folha não use variantes responsivas (`sm:`, `md:`) nem `dark:`** — a diagramação não pode depender do aparelho.
  - PDF: `exportarFolhaPdf` (`utils/folhaA4.ts`) fotografa a folha (html2canvas-pro → jsPDF) sempre na largura real do A4, então celular e desktop geram o mesmo arquivo. Elementos `.no-print` ficam fora do PDF e da impressão. Para texto selecionável/vetorial, use Imprimir → "Salvar como PDF".
  - **Timbre geral da rede pública:** logo do órgão (ex.: SEMUSA) de um lado, logo do SUS do outro e, no meio, o nome do local — a única coisa que muda de uma unidade para outra. Em posto de trabalho público (`sphere` diferente de `private`) com logo cadastrado, o SUS entra sozinho como segundo logo (`LOGO_DO_SUS`), salvo se o posto tiver outro segundo logo escolhido. Consultório particular não recebe logo do SUS.
  - **Cabeçalho = local de atendimento + logo** (`resolverIdentidade` em `utils/documentoClinico.ts`). O médico aparece na assinatura (nome, CRM/UF, especialidade) e, na receita de controle especial, também no quadro "Identificação do emitente". Só sem local cadastrado o título recai no nome do médico.
  - **Nada inventado no documento:** sem QR code, "validação digital" ou "assinatura eletrônica" (o app não assina digitalmente); sem cidade, horários, duração ou texto clínico que o médico não tenha informado. Campo vazio não imprime.
  - A folha A4 (`printable-a4-sheet`) simula papel físico real: é **sempre branca (#FFFFFF) com tipografia grafite/preta nos dois temas**.
  - Datas de documento usam `dataLocalISO` (nunca `toISOString()`, que à noite devolve o dia seguinte em UTC).

## Convenções de código

- **Idioma:** UI, termos médicos, alertas e documentos exclusivamente em **português do Brasil (pt-BR)**.
- **Componentes:** Estrutura funcional com hooks React, exportações nomeadas (`export const X: React.FC<...>`), um componente por arquivo em PascalCase.
- **Regras Clínicas e Emissão de Documentos:**
  - **Exigência de Médico Configurado:** Emissão de documentos (impressão, PDF, envio por WhatsApp e cópia de texto) exige validação prévia de nome e CRM do médico (`src/utils/medicoConfigurado.ts`).
  - **Dados de Exemplo Restritos:** Registros de exemplo em `src/data/exemplos.ts` (médico "Melki Donadon", paciente "Seu Melki") são utilizados exclusivamente como placeholder e na prévia A4 com marca d'água "EXEMPLO"; nunca aparecem em documentos emitidos.
  - **Sem peso, sem dose:** A calculadora pediátrica e os protocolos de urgência bloqueiam doses e volumes calculados caso o peso do paciente não esteja cadastrado.
  - **Formatação Numérica Rigorosa:** Doses em miligramas utilizam vírgula decimal e **sem separador de milhar** (ex.: "7,5 mg", "1000 mg", evitando que "1.000 mg" seja interpretado erroneamente como 1 mg); concordância gramatical estrita para unidades ("1 gota" no singular, "X gotas" no plural).
  - **Sem horários inventados:** `scheduleTimes` só é preenchido quando o intervalo vem de dado estruturado (catálogo pediátrico ou protocolo). Itens digitados no formulário e itens de kits usam `scheduleInterval: 'Conforme posologia'` e `scheduleTimes: []`, para o PDF e a folha A4 não imprimirem "Horários sugeridos" que contradigam a posologia escrita.
  - **Três regimes de receita, três documentos:** `classificarReceita` (`utils/isSpecialControlOrAntibiotic.ts`) devolve `simples`, `antimicrobiano` ou `controle_especial`, e cada regime sai na sua própria folha (`separarPorRegime`, `DOCUMENTO_DO_REGIME`). Nunca emita antimicrobiano com título ou avisos de controle especial.
    - *Antimicrobiano (RDC Anvisa nº 471/2021):* 2 vias, válida por 10 dias; a farmácia retém a **2ª via** e a 1ª volta ao paciente.
    - *Controle especial (Portaria SVS/MS nº 344/98):* 2 vias; a farmácia retém a **1ª via**; quadros de comprador/fornecedor e endereço do paciente.
    - *Notificação de Receita (Portaria 344/98, listas A1, A3, B1, B2 e C2):* o app não emite o talonário. `notificacaoExigida` (`utils/notificacaoDeReceita.ts`) alimenta o aviso de tela `AvisoNotificacaoReceita` — sempre `.no-print`, nunca dentro da folha. Não inclua na tabela o que os adendos mandam para a Receita de Controle Especial (codeína e tramadol até 100 mg por unidade, fenobarbital). Reconfira a tabela a cada atualização do Anexo I.
    - A detecção olha só nome e princípio ativo (a categoria conta apenas quando é a de antibióticos). Termos curtos entram como palavra inteira — `astro` já casou dentro de `gastro` e mandou omeprazol para 2 vias. O tipo escolhido no formulário (`regimeReceita`) vale, mas nunca rebaixa um controlado detectado.
  - **Documentos SUS sem dado presumido:** a folha e o laudo copiado trazem só o que está no formulário (`susDocumentsCatalog.ts`). Campo vazio sai como "—" / "não informado". CID-10 e justificativa abrem em branco e o texto-modelo só entra quando o médico clica em "Inserir texto-modelo". Nunca use valor padrão para resultado de exame (creatinina, eTFG), triagem de segurança (ex.: marca-passo em RM), história clínica, data de início de sintomas, CID ou justificativa — nem como `||` de reserva na montagem, nem como valor inicial de campo sem controle visível na tela. Coberto por `susSemDadosInventados.test.ts`.
  - **Impresso oficial é o fundo da folha (APAC e LME):** quando o órgão tem formulário nacional, a folha é a imagem do próprio impresso (`public/formularios-sus/`, sempre em `<img>` — fundo em CSS não sai na impressão) e o app só escreve os dados por cima, cada um no campo numerado (`data/formulariosOficiaisSus.ts`, `FormularioOficialSus.tsx`, dentro de `FolhaA4` com `folha-a4--formulario`). **Nunca desenhe um formulário "no estilo SUS"**: impresso recriado é recusado pela regulação e pela farmácia. Só entra formulário com fonte oficial conferida (`fonte.url`). Campo sem dado fica em branco (sem "—"); caixa de marcar só com escolha explícita na tela (o sexo padrão do cadastro não conta). A quebra de linha é calculada em `utils/formularioOficial.ts`, não pelo navegador; texto que não cabe sai com "[…]" e a tela avisa (`camposSemEspaco`). Coordenadas em pontos do PDF oficial: se o órgão publicar nova versão, gere o fundo de novo e reconfira campo a campo. Os demais documentos SUS (guia SISREG, GAL/LACEN, SISCAN, TRM-TB) não têm impresso nacional único: seguem no modelo do app, com o logo do órgão à esquerda e o do SUS à direita do título (`TimbreSus`). O logo do órgão vem do posto de trabalho ativo (`activeContext.logoDataUrl`, ex.: SEMUSA) — nunca fixe um órgão municipal no código. Exceção: documentos da categoria `apac` levam o logo do estado (`LOGO_DO_ESTADO`), porque a regulação da APAC é estadual (`timbreDoDocumentoSus`). Coberto por `formulariosOficiaisSus.test.tsx`.
  - **Kits de plantão pendentes de revisão clínica:** as doses pediátricas fixas de `src/utils/montarItensDoKit.ts` (paracetamol limitado a 35 gotas, amoxicilina e prednisolona sem dose máxima) e os kits com apresentações de adulto sem restrição de faixa etária aguardam revisão humana qualificada. Não os altere sem fonte clínica.
- **Regras de CSS e Estilização (Tailwind CSS v4):**
  - **Arquitetura em Camadas:** Classes de componentes devem ser declaradas dentro de `@layer components`.
  - **Sombras e Física Tátil:** Declaradas via `@utility` (ex.: `@utility shadow-tactile-*`), garantindo composição harmônica com anéis de foco do Tailwind (`focus-visible:ring-*`).
  - **Proibição de CSS Fora de Camada:** Nunca escreva CSS solto fora de camadas, pois ele anula a especificidade dos utilitários do framework e quebra anéis de foco.
  - **Campos e Formulários:** Placeholders recebem a variável `--text-placeholder`. Campos vazios no estado `:placeholder-shown` recebem fundo côncavo `--surface-inset`.
  - **Acessibilidade:** Suporte global obrigatório a `prefers-reduced-motion` para anular transições e animações quando solicitado pelo sistema.
- **Sistema Canônico de Ícones (Anti-Mutação):**
  - Utilize sempre o componente canônico `<Icon name="..." />` (`src/components/Icon.tsx`).
  - Baseado no Google Material Design Symbols (`material-symbols`), com mapa de aliases clínicos em pt-BR e empacotamento offline via woff2. Não utilize pacotes de ícones alternativos.

## Variáveis de ambiente

- `.env.example` documenta as variáveis `VITE_FIREBASE_*` (opcionais; há padrões no código) e `APP_URL`. O git ignora `.env*` (exceto `.env.example`) e `node_modules/`.
- `vite.config.ts` respeita `DISABLE_HMR=true` para suporte a ambientes headless.

## Considerações de segurança e privacidade

- **Soberania de Dados Locais:** Dados de pacientes e médicos residem no dispositivo via IndexedDB (`Dexie.js`) e `localStorage`. Não há telemetria nem transmissão de dados sensíveis para servidores terceiros sem ação explícita do usuário.
- **Sigilo Diagnóstico (CFM 1.658/2002 e 1.819/2007):** A inclusão de código ou descrição CID-10 em atestados médicos depende de consentimento explícito e assinalado pelo paciente (`authorizedByPatient = true`).
- **Controle Sanitário (Portaria SVS/MS 344/98):** Receituários de medicamentos controlados devem ser emitidos estritamente em formato de 2 vias (1ª via Farmácia / 2ª via Paciente) com todos os campos de identificação regulamentares.

## Deploy

Produção: **Google Cloud Run**, serviço `prescmed`, região `southamerica-east1` (projeto `agent-md-506215`), imagem Nginx servindo `dist/` (build em `node:24-alpine`).

- **Deploy automático:** push em `main` dispara o gatilho Cloud Build `gcpmain`, que executa `cloudbuild.yaml`: build da imagem → push → deploy → teste de fumaça.
- **Portão de qualidade no `Dockerfile`:** `npm run lint && npm run test` rodam antes do build. Teste vermelho = imagem não é gerada = nada é publicado.
- **Deploy manual:** `pwsh -File .\deploy-cloudrun.ps1` (ou `bash deploy-cloudrun.sh`) submete o mesmo `cloudbuild.yaml`.
- **nginx:** os cabeçalhos de segurança ficam em `nginx-security-headers.conf` e precisam ser incluídos em todo `location` que tenha `add_header` (no nginx, um `add_header` no `location` descarta os herdados). A CSP está em modo `Report-Only` até ser validada com login Google/Firebase.
- Verificação de saúde: `/health` (não use `/healthz`, interceptado pelo Google em `run.app`).
