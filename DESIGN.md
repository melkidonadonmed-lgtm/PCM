---
name: PresCMed Design System
version: "alpha"
description: "Sistema de Prescrição Médica Digital ambulatorial brasileira (design-md v5.0.0 + design-interface-medica-minimalista v4.0.0). Interface clínica de precisão cirúrgica com iluminação óptica a 135°, tokens semânticos em 3 camadas, hierarquia Squint Test em 3 níveis, equilíbrio 90/8/2, Command Bar integrada no Header, Deep Navy escultural na Sidebar/MobileBottomNav, proteção .clinical-unit e folha A4 vetorial imutável."
colors:
  primary: "#1E3A8A"
  on-primary: "#FFFFFF"
  secondary: "#334155"
  on-secondary: "#FFFFFF"
  neutral: "#F8FAFC"
  on-neutral: "#0F172A"
  surface: "#FFFFFF"
  on-surface: "#0F172A"
  clinical: "#0F766E"
  on-clinical: "#FFFFFF"
  obsidian: "#0F172A"
  on-obsidian: "#F8FAFC"
  rose: "#BE123C"
  on-rose: "#FFFFFF"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.875rem
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.05em
  document-heading:
    fontFamily: Cormorant Garamond
    fontSize: 1.75rem
    fontWeight: 700
    lineHeight: 1.2
  document-body:
    fontFamily: Cormorant Garamond
    fontSize: 1.125rem
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 8px
  md: 14px
  lg: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-clinical:
    backgroundColor: "{colors.clinical}"
    textColor: "{colors.on-clinical}"
    rounded: "{rounded.md}"
    padding: 12px
  button-danger:
    backgroundColor: "{colors.rose}"
    textColor: "{colors.on-rose}"
    rounded: "{rounded.md}"
    padding: 12px
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-canvas:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-neutral}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-dark:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.on-obsidian}"
    rounded: "{rounded.lg}"
    padding: 24px
---

## Overview

O **PresCMed (`PCM`)** expressa uma identidade visual de **precisão cirúrgica, ergonomia assistencial anti-TDAH e física óptica direcional a 135°**, governada conjuntamente pelas especificações `design-md v5.0.0` e `design-interface-medica-minimalista v4.0.0`.

### Diagnóstico de Propósito e Atmosfera
1. **Tarefa Primária do Médico**: Prescrever medicamentos (Simples, Antimicrobiano RDC 471/2021 e Controle Especial Portaria 344/98), calcular doses pediátricas por peso (`mg/kg -> mL/gotas`) e emitir documentos clínicos/SUS em folha A4 única com zero carga cognitiva supérflua.
2. **Polaridade Luminosa Assistencial (`clinical-day` & `clinical-night`)**:
   - **Modo Diurno (`clinical-day`)**: Superfície Clean Slate (`#F8FAFC`) com cartões em branco puro (`#FFFFFF`) e contraste `>= 10:1` para doses, nomes de fármacos e alertas sanitários.
   - **Modo Plantão Noturno (`clinical-night`)**: Superfície Deep Slate acetinada (`#0F172A` / `#1E293B`), reduzindo o ofuscamento em plantões noturnos sem recorrer a pretos abissais `#000000` que apagam bordas e sombras.
3. **Chrome Estrutural Esculpido & Navegação Não-Genérica**:
   - **Header Command Bar**: Superfície clara no tema claro (`--surface-card`) e escura no escuro, integrando o **Segmented Workspace Track** (`Alt+1..6` com indicador ativo esculpido) e o **Command & Context Cluster** (Paciente + Peso + Busca `Ctrl+K` + CRM + Nuvem + Tema agrupados em trilho coeso).
   - **Sidebar & MobileBottomNav em Deep Navy**: Ancoram o perímetro de navegação nos dois temas (`#0F172A` / `#0B1120`), com indicador luminoso vertical (`3px` em `#38BDF8`), atalhos visíveis em `tabular-nums` e seletor compacto de Macro-Módulos (`MOD-01` Ativo, `MOD-02` PEP, `MOD-03` Hospitalar).
4. **Imutabilidade da Folha Física A4 (`printable-a4-sheet` & `.sus-grid`)**: A folha médica simula papel físico real (`794x1123px` retrato / `1123x794px` paisagem) e é **sempre branca (`#FFFFFF`) com tinta escura**, tanto na tela quanto em `@media print` e PDF.

---

## Colors

A arquitetura cromática opera em **3 camadas de tokens semânticos (`:root`)** e respeita a **Regra de Equilíbrio 90 / 8 / 2** (`90%` superfícies neutras, `8%` estrutura/bordas sutis e `2%` acento reservado ao único CTA primário da vista):

### 1. Tokens Semânticos de Superfície e Tinta
- **Superfícies (`--bg-canvas`, `--bg-surface`, `--bg-elevated`, `--surface-inset`)**:
  - Light (`clinical-day`): Canvas `#F8FAFC`, Surface `#FFFFFF`, Inset `#F1F5F9`, Contrast `#0F172A`.
  - Dark (`clinical-night`): Canvas `#0F172A`, Surface `#1E293B`, Elevated `#27354A`, Inset `#131B2E`.
- **Tinta / Tipografia (`--ink-primary`, `--ink-secondary`, `--ink-muted`)**:
  - `--ink-primary`: `#0F172A` (Light) / `#F8FAFC` (Dark) — contraste `> 13:1` (WCAG AAA) para títulos, fármacos e doses.
  - `--ink-secondary`: `#334155` (Light) / `#CBD5E1` (Dark) — contraste `> 7:1` (WCAG AAA) para posologias e controles.
  - `--ink-muted`: `#5B6B80` (Light) / `#94A3B8` (Dark) — contraste `>= 4.6:1` (WCAG AA) para metadados, carimbos e placeholders (`Ex.:`).

### 2. Paleta de Autoridade Clínica e Semântica Estrita
- **Primary (`#1E3A8A`)**: Azul-marinho institucional para o único CTA primário de emissão/impressão da área e indicadores de foco.
- **Secondary (`#334155`)**: Slate estrutural para ações secundárias, barras segmentadas e botões de apoio.
- **Clinical (`#0F766E`)**: Teal clínico (contraste WCAG AA `> 4.5:1`) para confirmação de posologia, inclusão na receita e selos de prontidão.
- **Rose (`#BE123C`)**: Vermelho farmacêutico **estritamente reservado** a alergias, doses acima do teto seguro, interações graves e ações destrutivas (nunca em navegação neutra).

---

## Typography

A tipografia combina 3 motores especializados com **escala modular fluida (`clamp()`)** e **alinhamento numérico tabular obrigatório**:

1. **Plus Jakarta Sans (`--font-sans` — UI Engine)**:
   - Interface, modais, barras de navegação e formulários clínicos (`line-height: 1.5`, largura de leitura `60ch–75ch`).
   - Escala Fluida: `--text-xs` (`11–12px`), `--text-sm` (`13–14px`), `--text-base` (`15–16px`), `--text-lg` (`18–20px`), `--text-xl` (`22–26px`) e `--text-2xl` (`28–36px`).
   - **Hierarquia em 3 Níveis (Squint Test)**:
     - *Nível 1 (Âncora Primária)*: Título da vista, dose calculada e o único CTA sólido.
     - *Nível 2 (Agrupamentos Operacionais)*: Títulos de cartão em **sentence case** (`600`/`700`, ex.: `"Identificação do paciente"`, `"Medicamentos prescritos"`), sem subtítulos decorativos.
     - *Nível 3 (Micro-rótulos e Badges)*: Caixa alta compacta (`0.6875rem–0.75rem`, `letter-spacing: 0.05em`) reservada a siglas regulatórias (`SUS / RENAME`, `1ª VIA FARMÁCIA`, `CRM`, `MOD-01`).
2. **JetBrains Mono / IBM Plex Mono (`--font-mono` — Precision Tabular Engine)**:
   - Obrigatório com `font-variant-numeric: tabular-nums` (`.clinical-tabular-nums` e `.clinical-unit`) em todas as dosagens (`mg`, `mL`, `gotas`), pesos (`kg`), códigos `CID-10`/`SIGTAP`, `CNS`/`CNES` e atalhos (`Alt+1..6`, `Ctrl+K`).
   - **Blindagem de Unidades (`.clinical-unit`)**: Unidades (`mg/kg`, `mg/dL`, `mL/h`, `gotas`) usam `white-space: nowrap; flex-shrink: 0` para jamais quebrar linha separadas do valor numérico.
3. **Cormorant Garamond (`--font-serif-doc` — Document Engine)**:
   - Exclusiva da folha A4 de receituários, atestados e encaminhamentos clássicos.

---

## Layout & Spacing

A composição espacial utiliza primitivas intrínsecas em grade **Base-4 / Base-8 (`4px, 8px, 12px, 16px, 24px, 32px, 64px`)**:

- **Split-View Assimétrico (`12 Colunas`)**: No `PrescriptionBuilder`, a coluna esquerda (`xl:col-span-7`) concentra o fluxo vertical (`Stack`) de identificação, composição e lista prescrita, enquanto a coluna direita (`xl:col-span-5`, `xl:sticky xl:top-20`) ancora a bancada A4 em tempo real e a gaveta pediátrica (`@container`).
- **Header Command Bar (`64px` / `h-16`)**: Alinhamento simétrico contendo gatilho da Sidebar, botão Início unificado, **Segmented Workspace Track** (`Receitas`, `Documentos`, `Doses`, `Protocolos`, `Editor` com atalhos `Alt+1..5`) e **Command & Context Cluster** à direita.
- **Sidebar Deep Navy (`256px` expandida / `68px` recolhida)**: Topo imediato com Posto de Atuação SUS (`ContextSwitcher`) e Perfil CRM, seguido por `Atendimento` e `Apoio clínico` com barra de acento vertical no item ativo, `Kits de plantão` retráteis e rodapé de Macro-Módulos + utilitários (`Novo Atendimento`, `Backup .pcm`, `Instalar App`).
- **Breakpoint Mobile (`1024px` / `lg`) & `MobileBottomNav`**: Abaixo de `1024px`, a navegação migra para o `MobileBottomNav` (`h-16`, Deep Navy) com 5 destinos (`Receitas`, `Documentos`, `Doses`, `Editor`, `Mais`), alvos `>= 44x44px` e `whitespace-nowrap`.

---

## Elevation & Depth

A profundidade utiliza **iluminação direcional a 135° (`--rim-light` superior + oclusão multicamada)** declarada em `@utility`:

- **Sombras Táteis Esculpidas (Light)**:
  - `shadow-tactile-sm`: `0 2px 4px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`
  - `shadow-tactile-md`: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`
  - `shadow-tactile-card`: `0 10px 25px -4px rgba(15, 23, 42, 0.06), 0 4px 8px -2px rgba(15, 23, 42, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)`
- **Sombras Táteis Esculpidas (Dark)**:
  - Chanfro superior (`inset 0 1px 0 rgba(255, 255, 255, 0.06)`) + oclusão (`0 12px 30px -4px rgba(0, 0, 0, 0.5)`).
- **Trilhos Segmentados e Campos Vazios (`--surface-inset`)**: Barras de abas (`nav-segmented-track`) e inputs em `:placeholder-shown` recebem microcavidade côncava sutil, destacando o item ativo ou preenchido por contraste de elevação.

---

## Shapes

- **Cartões e Painéis Clínicos (`16px` – `20px` / `rounded-2xl`)**: Contenção suave com borda hairline de `1px` (`--border-subtle`).
- **Trilhos de Navegação e Controles (`10px` – `14px` / `rounded-xl`)**: Geometria precisa para botões, inputs e itens da Sidebar.
- **Badges e Selos Regulatórios (`9999px` / `rounded-full`)**: Formato pílula para contadores tabulares, vias da Portaria 344/98 e status de sincronização.

---

## Components

Todos os componentes interativos operam sob **Máquina de Estados Finitos (`UIState = 'idle' | 'loading' | 'success' | 'empty' | 'error'`)** via `data-state` e `aria-busy`:

- **Isolamento de Acento (Uma Ação Primária por Área)**: Cada vista exibe apenas **1 botão sólido primário** (`button-primary` `#1E3A8A` ou `button-clinical` `#0F766E`). Demais ações usam `button-secondary` ou `.btn-ghost`.
- **Segmented Workspace & Document Tracks**: Na `Header` e na `ClinicalDocumentsHub`, as abas operam dentro de um trilho unificado (`bg-[var(--surface-inset)] p-1 rounded-xl border border-[var(--border-subtle)]`), onde a aba ativa recebe superfície elevada, sombra tátil e indicador de acento.
- **Placeholders Padronizados (`Ex.:`)**: Todo campo de entrada inicia seu placeholder obrigatoriamente com `"Ex.:"` e aplica `--text-placeholder` distinto do valor digitado.
- **Invariante Sem Peso, Sem Dose**: `PediatricCalculator` e `ClinicalProtocolsView` bloqueiam cálculos de volume/gotas enquanto `weightKg <= 0`.
- **Folha A4 Única (`FolhaA4.tsx` + `SusInteractiveVectorSheet.tsx`)**: Renderização vetorial idêntica entre preview, impressão nativa e exportação PDF (`html2canvas-pro`).

---

## Do's and Don'ts

### Do's (Práticas Obrigatórias)
- **Do** manter o `Header` com superfície clara no tema claro (`--surface-card`) e escura no escuro, reservando o acabamento Deep Navy (`.panel-navy`) para `Sidebar` e `MobileBottomNav`.
- **Do** manter a folha A4 (`FolhaA4` e `.sus-grid`) estritamente em fundo `#FFFFFF` e tinta escura nos dois temas.
- **Do** aplicar `font-variant-numeric: tabular-nums` e `.clinical-unit` (`white-space: nowrap`) em todas as doses, pesos, contadores e atalhos.
- **Do** escrever títulos de cartão em sentence case e reservar caixa alta para micro-rótulos e badges regulatórios.
- **Do** limitar cada seção a 1 único CTA primário sólido (regra `90 / 8 / 2`) e iniciar todo placeholder com `"Ex.:"`.
- **Do** garantir alvos de toque `>= 44x44px`, anel `:focus-visible` nítido e suporte a `@media (prefers-reduced-motion: reduce)`.
- **Do** formatar doses em miligramas com vírgula decimal e zero separador de milhar (`"7,5 mg"`, `"1000 mg"`).

### Don'ts (Práticas Proibidas)
- **Don't** usar emojis decorativos em controles, alertas, cabeçalhos ou badges (`AUDIT-VIS-EMOJI`).
- **Don't** embutir ativos Base64 pesados (`> 50 KB`) no código ou substituir grades `.sus-grid` vetoriais por imagens estáticas (`AUDIT-VIS-BLOAT`).
- **Don't** espalhar múltiplos botões sólidos primários competindo na mesma barra ou cartão.
- **Don't** usar classes responsivas (`sm:`, `md:`) ou `dark:` dentro do interior da `FolhaA4`.
- **Don't** incluir CID-10 em atestados sem `authorizedByPatient === true` (Res. CFM 1.658/2002) ou inventar dados clínicos não preenchidos em guias SUS.

---

## Iconography

O PresCMed utiliza exclusivamente o **Google Material Design Symbols** empacotado offline (`material-symbols`):

- **Componente Canônico**: `<Icon name="receita" size={20} />` (`src/components/Icon.tsx`), com container blindado (`overflow-hidden`, `select-none`, `aria-hidden="true"`).
- **Resolução Determinística de Aliases**: Mapeamento tipado de termos clínicos em português (`receita`, `documentos`, `balanca`, `coracao`, `editor`, `sus`, `guias_sus`, `atestado`, `encaminhamento`, `exame`, `imprimir`, `verified`).
- **Regra**: Proibido usar emojis ou tags de ícone soltas fora do componente `<Icon />`.
