# AGENTS.md — Remix PresCMed new

## Visão geral do projeto

**PresCMed** é um sistema de prescrição médica digital em português (pt-BR), voltado ao contexto clínico e ambulatorial brasileiro. Funcionalidades principais:

- Prescrição médica estruturada com busca inteligente de fármacos, categorias SUS/RENAME e kits de plantão.
- Calculadora pediátrica unificada de doses por peso (mg/kg → mL/gotas), com regra estrita "sem peso, sem dose".
- Solicitação de exames laboratoriais e diagnósticos por imagem.
- Emissão de atestados médicos e encaminhamentos (com conformidade ética e legal CFM, ex.: Res. CFM 1.658/2002 para consentimento de CID-10).
- Editor visual de laudos e documentos clínicos.
- Geração de PDF vetorial dos documentos (receituário simples, receituário de controle especial em 2 vias — Portaria 344/98, exames, atestado, encaminhamento).
- Visualização de impressão física (`PrintPreview`) e protocolos clínicos por patologia.

O projeto foi gerado a partir de um template do **Google AI Studio** (ver `metadata.json` e `README.md`), mas o código atual é uma **SPA 100% client-side**: não há backend implementado em produção. As dependências `@google/genai`, `express`, `dotenv` e `motion` estão declaradas no `package.json`, porém **não são importadas em nenhum arquivo de `src/`** — não crie código assumindo que exista um servidor, chamadas ativas à API Gemini ou animações via `motion`. O script `clean` remove `server.js`, que não existe no repositório.

**Atenção:** este é um app do domínio médico (YMYL). As doses pediátricas usam regras clínicas específicas do Brasil (ex.: paracetamol gotas = 1 gota/kg/dose). Qualquer alteração em lógica de cálculo de doses (`src/utils/doseCalculator.ts`), kits de plantão (`src/data/clinicalKits.ts`) ou catálogos farmacêuticos (`src/data/`) exige revisão cuidadosa e execução dos testes.

## Stack tecnológica

- **React 19 + TypeScript ~5.8** (modo funcional com hooks; modo estrito parcial — `tsconfig.json` não habilita `strict`).
- **Vite 6** como bundler e dev server (`@vitejs/plugin-react` e `@tailwindcss/vite`).
- **Tailwind CSS v4** via `@tailwindcss/vite` (configuração declarada diretamente no CSS com `@import "tailwindcss"`, `@theme`, `@utility` e `@layer` em `src/index.css`).
- **Ícones**: Componente canônico `<Icon />` com Google Material Design Symbols (`material-symbols` 100% offline via woff2) e `lucide-react`.
- **jspdf + jspdf-autotable** para geração de PDF e **html2canvas** para captura de tela dos documentos no preview.
- **Dexie.js v2** para persistência estruturada IndexedDB de contextos e documentos salvos.
- Gerenciador de pacotes: **npm**, com `package-lock.json`. O `bun.lock` é legado e não exige a instalação do Bun.

## Comandos

```bash
npm ci             # instalação reproduzível a partir do package-lock.json
npm run dev        # dev server Vite na porta 3000, host 0.0.0.0
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção
npm run lint       # type-check: tsc --noEmit
npm run test       # testes unitários, clínicos e snapshots via Vitest
npm run test:watch # modo contínuo de testes Vitest
npm run design:lint # linter de conformidade DESIGN.md (Google Labs)
npm run clean      # remove dist/ e server.js
```

**Testes:** o projeto utiliza **Vitest** integrado ao Vite. A suíte cobre:
- Cálculos pediátricos e formatação segura (`doseCalculator.test.ts`).
- Kits clínicos de plantão e montagem de prescrição com snapshots (`clinicalKits.test.ts`).
- Conformidade sanitária com a Portaria SVS/MS 344/98 para controle especial em 2 vias (`sanitaryCompliancePortaria344.test.ts`).
- Consentimento explícito de CID-10 conforme Resoluções CFM 1.658/2002 e 1.819/2007 (`cfmConsentCid10.test.ts`).
- Resolução de símbolos e aliases do componente canônico de ícones (`iconComponent.test.ts`).

Ao modificar lógica de cálculo, kits ou conformidade sanitária, execute obrigatoriamente `npm run test`, `npm run lint` e `npm run design:lint`.

Para alterações de UI, impressão ou PDF, use a skill `ui-pdf-validation`. Para qualquer alteração clínica, use `clinical-change-safety` e solicite revisão do agente `prescmed-clinical-reviewer`.

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
    MobileBottomNav.tsx        # Barra de navegação inferior mobile com 5 destinos (Receitas, Doses, Exames, Editor, Mais)
    PrescriptionBuilder.tsx    # Construtor de receitas (busca, formulário de prescrição, lista e prévia A4)
    AcoesDaReceita.tsx         # Barra de ações única da receita (Imprimir/PDF, Editor, WhatsApp, Copiar)
    PediatricCalculator.tsx    # Calculadora pediátrica dedicada por peso (mg/kg → mL/gotas)
    ExamRequester.tsx          # Solicitação de exames laboratoriais e diagnósticos por imagem
    CertificateAndReferral.tsx # Emissão de atestados médicos e encaminhamentos com conformidade CFM
    ClinicalProtocolsView.tsx  # Protocolos de conduta clínica e catálogo por classes terapêuticas SUS/RENAME
    DocumentEditorView.tsx     # Editor visual avançado para laudos e documentos médicos livres
    PrintPreview.tsx           # Pré-visualização de impressão física e exportação de PDF vetorial
    PatientModal.tsx           # Modal de edição rápida e cadastro de dados do paciente
    DoctorProfileModal.tsx     # Modal de configuração do médico emitente (nome, CRM/UF, clínica)
    CidSearchBar.tsx           # Campo de busca preditiva de diagnósticos e códigos CID-10
    BackupModal.tsx            # Modal de exportação e restauração de backups portáteis (.pcm.json)
    ConfirmationModal.tsx      # Modal genérico de confirmação para ações destrutivas ou de descarte
    ContextSwitcher.tsx        # Seletor rápido de postos de trabalho e contextos clínicos do médico
    LogoGeneratorModal.tsx     # Utilitário para personalização de cabeçalho e monograma de receituário
    PuxarParaAtualizar.tsx     # Gesto tátil de pull-to-refresh para atualização em dispositivos móveis
    WatermarkOverlay.tsx       # Camada visual de marca d'água no preview de documentos
    WatermarkSelector.tsx      # Seletor de marcas d'água predefinidas e personalizadas
    Icon.tsx                   # Componente canônico anti-mutação baseado no Google Material Symbols
  data/
    pediatricMeds.ts           # Catálogo de fármacos pediátricos com faixas de dosagem (mg/kg)
    adultMeds.ts               # Catálogo de apresentações e posologias para uso adulto
    examCatalog.ts             # Catálogo de exames laboratoriais e procedimentos diagnósticos
    cidCatalog.ts              # Base de códigos e descrições CID-10 com termos de busca
    clinicalKits.ts            # Kits clínicos de plantão ambulatorial (amigdalite, GECA, IVAS, ITU, etc.)
    clinicalProtocols.ts       # Protocolos patológicos com doses de emergência e cálculo de hidratação
    medicationDatabase.ts      # Base unificada de medicamentos categorizada por classe SUS/RENAME
    exemplos.ts                # Dados fictícios de exemplo (Melki Donadon / Seu Melki) para prévia e placeholders
    presetAssets.ts            # Ativos visuais e marcas d'água predefinidas
    presetClinicalTemplates.ts # Modelos estruturados de documentos e atestados clínicos
  hooks/
    usePrescriptionSession.ts  # Gerenciamento de sessão, rascunhos e ciclo de vida da receita
    usePwaInstall.ts           # Detecção de suporte e acionamento de instalação como Progressive Web App
    useWorkContext.ts          # Controle de posto de trabalho ativo e alternância de contexto
  services/
    db.ts                      # Banco IndexedDB local estruturado via Dexie.js v2
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
    pdfGenerator.ts            # Gerador vetorial de PDF com suporte aos 5 tipos de documentos e 2 vias
  __tests__/
    doseCalculator.test.ts     # Testes da calculadora de dose por peso e regras de arredondamento
    clinicalKits.test.ts       # Testes de montagem de kits clínicos de plantão com snapshots
    cfmConsentCid10.test.ts    # Testes de validação de consentimento de CID em atestados (CFM 1.658/2002)
    sanitaryCompliancePortaria344.test.ts # Testes de emissão em 2 vias para Portaria 344/98
    iconComponent.test.ts      # Testes de tipagem, aliases clínicos e renderização de ícones
```

## Arquitetura em tempo de execução

- **SPA sem roteador:** A navegação ocorre por estado centralizado (`activeTab: ActiveTab`) em `App.tsx` (valores: `'prescription'`, `'pediatric_calc'`, `'exams'`, `'editor'`, `'certificate'`, `'referral'`, `'protocols'`, `'print_preview'`). Não há react-router nem alteração de rota via URL.
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
  - **Navegação Mobile (`MobileBottomNav`)**: Visível abaixo de `lg` (1024px) com exatamente 5 destinos (Receitas, Doses, Exames, Editor, Mais). O botão "Mais" abre a `Sidebar` completa em modo gaveta/diálogo acessível. A funcionalidade de exportar/backup reside na Sidebar.
  - Gesto tátil de puxar para atualizar (`PuxarParaAtualizar.tsx`) integrado para telas de toque.
- **Página Principal de Receituário (`PrescriptionBuilder.tsx`):**
  - Composta por busca rápida de medicamentos, formulário "Prescrição", lista "Medicamentos prescritos" e bancada com prévia de impressão A4.
  - Barra de ações única consolidada em `AcoesDaReceita.tsx`: Imprimir/PDF (ação primária), Editor e WhatsApp (ações secundárias) e Copiar texto (ação terciária).
  - A antiga calculadora rápida inline foi removida; o botão "Calcular dose pelo peso" direciona para a aba Doses (`PediatricCalculator.tsx` + `src/utils/doseCalculator.ts`, a única calculadora do sistema).
- **Kits de Plantão e Protocolos:**
  - Kits ambulatoriais de plantão acessíveis na sidebar (`src/data/clinicalKits.ts`), montados por `src/utils/montarItensDoKit.ts` e validados por snapshots em `clinicalKits.test.ts`.
  - Protocolos clínicos (`ClinicalProtocolsView.tsx`) dispõem de condutas patológicas e catálogo farmacêutico agrupado por classe terapêutica SUS/RENAME, com ação "Usar na receita" para transferência direta.
- **Geração e Impressão de Documentos:**
  - `PrintPreview.tsx` renderiza os documentos na folha física A4.
  - `pdfGenerator.ts` gera PDFs programaticamente via jsPDF/autoTable.
  - A folha A4 (`printable-a4-sheet`) simula papel físico real de alta gramatura: é **sempre branca (#FFFFFF) com tipografia grafite/preta nos dois temas**. Jamais aplique classes de modo escuro dentro da folha do documento.

## Convenções de código

- **Idioma:** UI, termos médicos, alertas e documentos exclusivamente em **português do Brasil (pt-BR)**.
- **Componentes:** Estrutura funcional com hooks React, exportações nomeadas (`export const X: React.FC<...>`), um componente por arquivo em PascalCase.
- **Regras Clínicas e Emissão de Documentos:**
  - **Exigência de Médico Configurado:** Emissão de documentos (impressão, PDF, envio por WhatsApp e cópia de texto) exige validação prévia de nome e CRM do médico (`src/utils/medicoConfigurado.ts`).
  - **Dados de Exemplo Restritos:** Registros de exemplo em `src/data/exemplos.ts` (médico "Melki Donadon", paciente "Seu Melki") são utilizados exclusivamente como placeholder e na prévia A4 com marca d'água "EXEMPLO"; nunca aparecem em documentos emitidos.
  - **Sem peso, sem dose:** A calculadora pediátrica e os protocolos de urgência bloqueiam doses e volumes calculados caso o peso do paciente não esteja cadastrado.
  - **Formatação Numérica Rigorosa:** Doses em miligramas utilizam vírgula decimal e **sem separador de milhar** (ex.: "7,5 mg", "1000 mg", evitando que "1.000 mg" seja interpretado erroneamente como 1 mg); concordância gramatical estrita para unidades ("1 gota" no singular, "X gotas" no plural).
  - **Sem horários inventados:** `scheduleTimes` só é preenchido quando o intervalo vem de dado estruturado (catálogo pediátrico ou protocolo). Itens digitados no formulário e itens de kits usam `scheduleInterval: 'Conforme posologia'` e `scheduleTimes: []`, para o PDF e a folha A4 não imprimirem "Horários sugeridos" que contradigam a posologia escrita.
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

- `.env.example` documenta `GEMINI_API_KEY` e `APP_URL`, herdadas do template AI Studio — **não são usadas pelo código atual**. O git ignora `.env*`.
- `vite.config.ts` respeita `DISABLE_HMR=true` para suporte a ambientes headless.

## Considerações de segurança e privacidade

- **Soberania de Dados Locais:** Dados de pacientes e médicos residem no dispositivo via IndexedDB (`Dexie.js`) e `localStorage`. Não há telemetria nem transmissão de dados sensíveis para servidores terceiros sem ação explícita do usuário.
- **Sigilo Diagnóstico (CFM 1.658/2002 e 1.819/2007):** A inclusão de código ou descrição CID-10 em atestados médicos depende de consentimento explícito e assinalado pelo paciente (`authorizedByPatient = true`).
- **Controle Sanitário (Portaria SVS/MS 344/98):** Receituários de medicamentos controlados devem ser emitidos estritamente em formato de 2 vias (1ª via Farmácia / 2ª via Paciente) com todos os campos de identificação regulamentares.

## Deploy

O comando `npm run build` compila a aplicação para estáticos otimizados na pasta `dist/`, servíveis por servidores Nginx, Cloud Run ou qualquer host estático com suporte a SPA.
