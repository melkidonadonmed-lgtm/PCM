# AGENTS.md — PresCMed (PCM)

Regras de comportamento para agentes. Descrição funcional, árvore de pastas, setup
passo a passo e normas regulatórias completas estão no `README.md`; este arquivo
contém apenas o que muda a forma de trabalhar no repo e não é derivável do código.

## Contexto crítico

**PresCMed** é prescrição médica digital em pt-BR e uma **SPA 100% client-side, sem
backend**. Não crie código assumindo servidor ou API externa. O projeto veio de um
template do Google AI Studio (`metadata.json`), mas o código atual não usa isso.

**Domínio médico (YMYL).** Alterações em `src/utils/doseCalculator.ts` ou nos
catálogos de `src/data/` exigem revisão cuidadosa: as doses pediátricas seguem
regras clínicas brasileiras específicas (ex.: paracetamol gotas = 1 gota/kg/dose).
Erro aqui chega ao paciente.

## Comandos

```bash
npm install        # ou: bun install (há bun.lock, mas npm funciona)
npm run dev        # Vite na porta 3000, host 0.0.0.0
npm run build      # produção em dist/
npm run preview    # serve o build
npm run lint       # tsc --noEmit — única verificação de tipos
npm test           # node --test via tsx (18 testes)
npm run check      # lint + testes + build (validação completa)
npm run clean      # remove dist/ e server.js
```

Rode `npm test` após mudar `prescriptionRules`, geradores de PDF ou catálogos. Os
testes (`src/utils/*.test.ts` e `tests/*.test.ts`) cobrem regras clínicas
(RDC 20/2011, Portaria 344/98), doses, CID-10 e persistência.

Árvore de pastas e papel de cada arquivo: `README.md` § "Estrutura do Projeto".

## Proibições — invariantes de arquitetura

- **Não** usar `motion`, nem adicionar gerenciador de estado global, nem roteador
  externo. A navegação é por `activeTab` em `App.tsx`, sincronizado com
  `location.hash` em pt-BR (`#/prescricao`, `#/exames`…) via `utils/navigation.ts`.
  Voltar/Avançar do navegador funcionam; hash desconhecida cai no destino padrão.
- **Não** introduzir estado global: médico, paciente, itens da prescrição, exames,
  atestado e encaminhamento vivem em `useState` no `App.tsx` e descem por props.
  Siga o prop drilling existente.
- **Não** mover dados de catálogo para dentro das views lazy. Só
  `PrescriptionBuilder` é eagerly loaded; `PediatricCalculator`, `ExamRequester`,
  `CertificateAndReferral`, `ClinicalProtocolsView` e `PrintPreview` entram via
  `React.lazy` + `Suspense`, e `jspdf`/`html2canvas` têm `manualChunks` no
  `vite.config.ts`.
- **Não** remover a lógica de `DISABLE_HMR=true` do `vite.config.ts`.
- **Não** silenciar erro de exportação de PDF: os estados carregando, sucesso e
  falha são visíveis de propósito.
- **Não** aplicar o tema da app dentro da folha A4 (`printable-a4-sheet` e todo o
  conteúdo médico): o documento é **sempre branco com texto escuro, nos dois
  temas**. É o requisito 17 do `PROJECT.md`.
- **Não** usar emoji em WhatsApp, cópia de texto e documentos impressos (YMYL
  sóbrio). Mantenha negrito estrutural e bullets simples.
- **Não** recriar sombra para o mesmo seletor em blocos separados, nem reintroduzir
  a paleta `vanilla-*` (removida por órfãos). Creme utilitário é
  `cream-50/100/200/300`.
- **Não** usar `!important` de cor em botão. Os únicos `!important` legítimos ficam
  em `@media print`, `[hidden]` e `:focus-visible`.

## Gotchas de PDF

`pdfGenerator.ts` monta os PDFs programaticamente com jsPDF + autoTable (exportação
principal); `html2canvas` serve só para captura do preview. O **html2canvas não
suporta cores modernas (oklch/oklab)** — por isso existe o helper de conversão para
rgb. Não remova.

## Regras clínicas e sanitárias

- Antimicrobianos: estritamente segregados em Receituário de Antimicrobianos, 2
  vias (RDC 20/2011).
- Controle especial C1: 2 vias, máximo de 3 substâncias por folha (Portaria
  344/98), com quantidade em dígitos **e** por extenso (`utils/quantityWords.ts`).
- Nunca misturar antimicrobiano ou C1 em receita simples.
- Atestado com CID exige consentimento do paciente (Res. CFM 1.658/2002) — preserve
  os avisos legais ao alterar `CertificateAndReferral.tsx` ou `pdfGenerator.ts`.
- Doses e volumes em locale pt-BR (`toLocaleString('pt-BR')`, vírgula decimal) nos
  textos de prescrição.

## Convenções

- **Idioma:** UI, dados clínicos e textos de documentos em pt-BR. Comentários de
  código misturam pt e en; novos textos de UI sempre em pt-BR.
- **Componentes:** funcionais com hooks, exportação nomeada (`export function X`),
  um componente principal por arquivo em PascalCase.
- **Estilo:** Tailwind utility inline. Design tokens são CSS custom properties em
  `src/index.css`, que é a **fonte canônica de cores** — não hardcode hex no
  componente. Breakpoint de referência para "mobile": `lg` (1024px); abaixo dele a
  sidebar fecha automaticamente.
- **Tipos:** centralize novos tipos de domínio em `src/types.ts`. O `tsconfig` **não**
  habilita `strict` e permite `allowJs`, mas escreva código tipado.
- **Imports:** prefira relativos dentro de `src/`. O alias `@/*` aponta para a raiz,
  mas é pouco usado.
- **Botões:** primários (`.btn-tactile-primary`, `.clinical-button`) sem bordas
  duras (`border: none`), cor de texto via token `--btn-primary-fg`. Secundários:
  soft-flat (`border: 1px solid transparent`, fundo sutil).
- **Cards:** `.tactile-card` (estático) tem uma única fonte de box-shadow em
  `index.css` e **não** eleva no hover; só `.tactile-card-interactive` eleva.
- **Status visual:** proibido pílula translúcida saturada com borda destacada
  (`bg-emerald-500/15 border-emerald-500/30`). Use micro-dot de status (6px) ou
  badge neutro suave.

## Atalhos de teclado — preservar

Teclas `1-7` navegam entre as abas (`App.tsx`; ignora inputs, diálogos e
modificadores). `Ctrl+K` ou `/` focam a busca de fármaco (`PrescriptionBuilder`,
somente com a aba ativa).

## Persistência

`localStorage` escrito por `safeStorage` (protege quota e reporta falha),
sincronizado via `useEffect`, com leitura em try/catch e fallback para defaults.
Chaves: `prescmed_theme`, `prescmed_doctor`, `prescmed_patient`,
`prescmed_prescription`, `prescmed_exams`, `prescmed_exam_indication`,
`prescmed_certificate`, `prescmed_referral`.

## Tema

Booleano `darkMode` no App aplica/remove a classe `dark` no `<html>`. Componentes
recebem `darkMode` como prop e alternam classes manualmente — o app **não** depende
apenas do seletor `dark:` do Tailwind. Tokens canônicos: `--bg-app`,
`--surface-card`, `--surface-inset`, `--surface-panel`, `--text-main`,
`--btn-primary-fg`. Valores de cor e tema light/dark: `src/index.css`.

## Segurança e privacidade

Dados sensíveis de paciente (nome, CPF/RG, peso, alergias) ficam **somente no
navegador** via localStorage — não há envio a servidor. Não introduza telemetria ou
rede com esses dados sem necessidade explícita. Não commite `.env` nem dados reais
de pacientes/médicos.

`.env.example` documenta `GEMINI_API_KEY` e `APP_URL` herdados do template — **não
são usados pelo código**. `.env*` é ignorado pelo git, exceto `.env.example`.

## Deploy

`npm run build` gera estáticos em `dist/`, servíveis por qualquer host estático.
Não há configuração de deploy no repositório. Detalhes em `README.md` § "Como Fazer
Deploy".
