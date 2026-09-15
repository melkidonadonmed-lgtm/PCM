# AGENTS.md — PresCMed (PCM)

## Visão geral do projeto

**PresCMed** é um sistema de prescrição médica digital em português (pt-BR), voltado ao contexto brasileiro:

- Prescrição médica com calculadora automática de doses pediátricas por peso (mg/kg → mL/gotas).
- Solicitação de exames laboratoriais e de imagem.
- Atestados médicos e encaminhamentos (legislação CFM, ex.: Res. 1.658/2002 para CID).
- PDF dos documentos (receituário simples, controle especial, exames, atestado, encaminhamento).
- Preview de impressão (`PrintPreview`) e 27 decks de protocolos clínicos.

O projeto veio de um template do **Google AI Studio** (ver `metadata.json`), mas o código atual é uma **SPA 100% client-side**: não há backend. Não crie código assumindo servidor ou API externa.

**Atenção:** este é um app do domínio médico (YMYL). As doses pediátricas usam regras clínicas específicas do Brasil (ex.: paracetamol gotas = 1 gota/kg/dose). Qualquer alteração em lógica de cálculo de doses (`src/utils/doseCalculator.ts`) ou nos catálogos de medicamentos (`src/data/`) exige revisão cuidadosa.

## Stack tecnológica

- **React 19 + TypeScript ~5.8** (modo estrito parcial — `tsconfig.json` não habilita `strict`).
- **Vite 6** como bundler e dev server (`@vitejs/plugin-react`).
- **Tailwind CSS v4** via `@tailwindcss/vite` (sem `tailwind.config.js`; a configuração é feita em CSS com `@import "tailwindcss"` e `@theme`/variáveis em `src/index.css`).
- **lucide-react** para ícones. NÃO use `motion` nem adicione gerenciadores de estado ou roteador externos.
- **jspdf + jspdf-autotable** para geração de PDF (chunk próprio, carregado só ao exportar) e **html2canvas** para captura de tela do preview.
- Gerenciador de pacotes: há `bun.lock` (Bun), mas os comandos `npm` também funcionam.

## Comandos

```bash
npm install        # ou: bun install
npm run dev        # dev server Vite na porta 3000, host 0.0.0.0
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção
npm run lint       # type-check: tsc --noEmit (única forma de verificação de tipos)
npm test           # node --test via tsx: regras de prescrição, PDF, CID, storage e smoke
npm run check      # lint + testes + build (validação completa)
npm run clean      # remove dist/ e server.js
```

**Testes:** 18 testes (`src/utils/*.test.ts` e `tests/*.test.ts`, node:test via tsx) cobrem regras clínicas (RDC 20/2011, Portaria 344/98), doses, CID-10 e persistência. Rode `npm test` após mudanças em `prescriptionRules`, geradores de PDF ou catálogos.

## Estrutura do código

```
index.html              # Entry HTML (monta #root, carrega /src/main.tsx)
vite.config.ts          # Plugins React + Tailwind; alias '@' → raiz; manualChunks (jspdf/html2canvas)
src/
  main.tsx              # Bootstrap React (StrictMode)
  App.tsx               # Estado global + roteamento por abas; views secundárias com React.lazy + Suspense
  types.ts              # Todas as interfaces de domínio (centralize novos tipos aqui)
  index.css             # Tailwind v4 + design system em CSS custom properties (temas light/dark)
  components/
    Header.tsx, Sidebar.tsx, MobileBottomNav.tsx   # Navegação e layout
    PrescriptionBuilder.tsx                        # Construtor de receituário (maior arquivo)
    PediatricCalculator.tsx                        # Calculadora de dose por peso
    ExamRequester.tsx                              # Solicitação de exames
    CertificateAndReferral.tsx                     # Atestados e encaminhamentos
    ClinicalProtocolsView.tsx                      # Decks de protocolos clínicos
    PrintPreview.tsx                               # Preview + exportação PDF/WhatsApp
    PatientModal.tsx, DoctorProfileModal.tsx       # Edição de paciente e médico
    CidSearchBar.tsx; MedicationSearchDialog.tsx, MedicationVoiceSearch.tsx,
    DispensedQuantity.tsx, QuantityAssistant.tsx, PrescriptionReview.tsx,
    PrescriptionPages.tsx, ConfirmationModal.tsx   # Busca, diálogos e subcomponentes
  hooks/useModalA11y.ts   # Foco/ESC para <dialog> e overlays
  data/                   # Catálogos estáticos (dados clínicos em pt-BR)
    medicationDatabase.ts # ~219 medicamentos unificados (UNIFIED_MEDICATIONS)
    pediatricMeds.ts      # ~54 medicamentos pediátricos com dose mg/kg
    adultMeds.ts          # ~32 medicamentos adultos com posologia
    clinicalProtocols.ts  # 27 decks de patologias (PATHOLOGY_PROTOCOLS)
    examCatalog.ts        # ~43 exames
    cidCatalog.ts         # Catálogo CID-10 (code, description, category, keywords)
  utils/
    doseCalculator.ts     # calculatePediatricDose() e generateScheduleTimes()
    prescriptionRules.ts  # Segregação de receitas (simples/antimicrobiano/C1) — tem testes
    prescriptionPdf.ts / pdfGenerator.ts  # PDFs (5 tipos de documento)
    fuzzySearch.ts        # Busca fuzzy (Damerau-Levenshtein)
    medicationCatalog.ts  # Agrupamento adulto+pediátrico (getAllMedicationGroups)
    navigation.ts         # Hash routing pt-BR, TAB_ORDER, TAB_TITLES
    storage.ts            # safeStorage (quota + erros), backup local
    quantityWords.ts      # Quantidade em dígitos + palavras (exigência C1)
```

## Arquitetura em tempo de execução

- **SPA sem roteador:** a navegação é feita por estado (`activeTab: ActiveTab`) em `App.tsx`, sincronizado com `location.hash` em português (`#/prescricao`, `#/exames`... — ver `utils/navigation.ts`). Voltar/Avançar do navegador funcionam; URLs desconhecidas caem no destino padrão.
- **Code splitting:** apenas `PrescriptionBuilder` é eagerly loaded. `PediatricCalculator`, `ExamRequester`, `CertificateAndReferral`, `ClinicalProtocolsView` e `PrintPreview` entram via `React.lazy` + `Suspense` (fallback spinner). `jspdf`/`html2canvas` têm `manualChunks` no `vite.config.ts`. Não mova dados de catálogo para dentro dessas views sem necessidade.
- **Estado centralizado em `App.tsx`:** médico, paciente, itens da prescrição, exames, atestado e encaminhamento vivem em `useState` no App e são passados por props (prop drilling). Siga esse padrão; não introduza gerenciador de estado global.
- **Atalhos de teclado:** teclas `1-7` navegam entre as abas (App, ignora inputs/diálogos/modificadores); `Ctrl+K` ou `/` focam a busca de fármaco (PrescriptionBuilder, só quando a aba está ativa). Preserve esses comportamentos.
- **Persistência em `localStorage`:** chaves `prescmed_theme`, `prescmed_doctor`, `prescmed_patient`, `prescmed_prescription`, `prescmed_exams`, `prescmed_exam_indication`, `prescmed_certificate`, `prescmed_referral`, sincronizadas via `useEffect` e escritas por `safeStorage` (protege quota e reporta falhas). Leituras usam try/catch com fallback para defaults.
- **Tema claro/escuro:** booleano `darkMode` no App; aplica/remove a classe `dark` no `<html>`. Componentes recebem `darkMode` como prop e alternam classes manualmente (o app não depende apenas do seletor `dark:` do Tailwind). Tokens canônicos: `--bg-app`, `--surface-card`, `--surface-inset`, `--surface-panel` (deep navy `#0C121A` nos dois temas, textos claros), `--text-main` etc. Light: canvas `#F8FAFC`, cards brancos. Dark (grafite): fundo `#121824`, cards `#192130`, sem pretos densos.
  - **Diretriz de Botões (Zero Contornos Grosseiros):**
    - Botões primários (`.btn-tactile-primary`, `.clinical-button`): **nunca usar bordas duras** (`border: none`). Cor de texto via token `--btn-primary-fg` (creme no claro / navy no escuro) — **não usar `!important` de cor em botões**; os únicos `!important` legítimos ficam em `@media print`, `[hidden]` e `:focus-visible`.
    - Botões secundários: soft-flat (`border: 1px solid transparent`, fundo sutil `rgba(0,0,0,0.04)` no claro / `rgba(255,255,255,0.06)` no escuro), sem contornos contrastantes.
  - **Elevação de Cards:** `.tactile-card` (estático) tem UMA única fonte de box-shadow em `index.css` e NÃO tem hover de elevação. Só `.tactile-card-interactive` levanta no hover. Não recrie sombras para o mesmo seletor em blocos separados.
  - **Tokens:** paleta creme utilitária é `cream-50/100/200/300` (tons `vanilla-*` foram removidos por órfãos). Categorias do catálogo: `analgesicos | antibioticos | cardio | diabetes | respiratorio | gastro | snc | outros` (rotuladas em `CATEGORY_LABELS`; `outros` = Ginecologia & Outros).
  - **Erradicação de "Blobs" de Texto Translúcidos:** proibido pílulas translúcidas saturadas com borda destacada (`bg-emerald-500/15 border-emerald-500/30`); substituir por tipografia limpa com micro-dots de status (6px) ou badges neutros suaves.
  - **Texto de documentos (YMYL sóbrio):** WhatsApp, cópia de texto e documentos impressos NÃO usam emojis. Mantenha a estrutura em negrito e bullets simples.
- **Geração de documentos:** `pdfGenerator.ts` monta PDFs programaticamente com jsPDF/autoTable (exportação principal); `html2canvas` fica para captura do preview. A folha A4 do documento (`printable-a4-sheet` e todo o conteúdo médico) é **sempre branca com texto escuro, nos dois temas** — nunca aplique o tema da app dentro da folha. Há helper de conversão oklch/oklab → rgb porque o html2canvas não suporta cores modernas. Exportação tem estados visíveis de carregando, sucesso e **falha** (nunca silencie erro de PDF).

## Convenções de código

- **Idioma:** UI, dados clínicos e textos de documentos em **português (pt-BR)**; comentários de código misturam português e inglês. Novos textos de UI devem ser em pt-BR.
- **Componentes:** funcionais com hooks, exportação nomeada (`export function X` / `export const X`), um componente principal por arquivo em PascalCase.
- **Estilo:** Tailwind utility classes inline; design tokens como CSS custom properties em `src/index.css` (ex.: `--bg-app`, `--surface-card`). Breakpoint de referência para "mobile": `lg` (1024px) — a sidebar fecha automaticamente abaixo dele.
- **Normas Clínicas e Sanitárias YMYL:** Antimicrobianos devem ser estritamente segregados em Receituário de Antimicrobianos (2 vias, RDC 20/2011) e substâncias sujeitas a controle especial C1 em 2 vias (Portaria 344/98, máx 3 substâncias por folha). Nunca misturar antimicrobianos ou C1 em receita simples. Cálculos pediátricos devem respeitar rigorosamente a posologia por kg/dose.
- **Tipos:** centralizados em `src/types.ts`; adicione novos tipos de domínio lá. `tsconfig` não é estrito e permite `allowJs`, mas escreva código tipado.
- **Path alias:** `@/*` mapeia para a raiz do projeto (pouco usado; os imports existentes são relativos — prefira relativos dentro de `src/`).
- **Formatação numérica:** doses e volumes usam locale pt-BR (`toLocaleString('pt-BR')`, vírgula decimal) nos textos de prescrição.

## Variáveis de ambiente

- `.env.example` documenta `GEMINI_API_KEY` e `APP_URL`, herdadas do template — **não usadas pelo código**. `.env*` é ignorado pelo git (exceto `.env.example`).
- `vite.config.ts` respeita `DISABLE_HMR=true` (edições de agente no AI Studio). Não remova essa lógica.

## Considerações de segurança e privacidade

- Dados sensíveis de pacientes (nome, CPF/RG, peso, alergias) ficam **somente no navegador** via localStorage — não há envio a servidor. Não introduza telemetria ou rede com esses dados sem necessidade explícita.
- Não commite `.env` nem dados reais de pacientes/médicos.
- Atestados com CID exigem consentimento do paciente (Res. CFM 1.658/2002) — preserve os avisos legais ao alterar `CertificateAndReferral.tsx` ou `pdfGenerator.ts`.

## Deploy

`npm run build` gera estáticos em `dist/`, servíveis por qualquer host estático (deploy típico via Cloud Run pela plataforma AI Studio); não há configuração de deploy no repositório.
