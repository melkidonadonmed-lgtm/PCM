---
name: PresCMed Design System
version: "alpha"
description: "Contrato Arquitetural e Design System Canônico do PresCMed (PCM) — regido por design-md v8.0.0 (9 Eixos SSOT, Tokens em 3 Camadas OKLCH 60-30-10 + 90/8/2, Física Óptica Zenital, Macro/Microlayouts @container, 4 Variantes de Cards, Navegação em 3 Camadas e Adendos A–I) e design-interface-medica-minimalista v4.0.0."
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

# Diretrizes e Arquitetura de Design System Frontend — PresCMed (`DESIGN.md` v8.0.0)

> **Escopo do Contrato:** Especificação normativa de engenharia de interface, tokens em 3 camadas (`OKLCH`), física óptica zenital, macro/microlayouts (`@container`), acessibilidade WCAG 2.1 AA/AAA, navegação semântica em 3 camadas, máquina de estados Real-State e adendos especializados (A–I) para o **PresCMed (`PCM`)**, em conformidade com `design-md v8.0.0`, `design-interface-medica-minimalista v4.0.0` e `@google/design.md`.

---

## Overview

O **PresCMed (`PCM`)** é uma plataforma clínica assistencial de **precisão cirúrgica, ergonomia anti-TDAH e física óptica direcional (luz zenital 90°–120° combinada com vetor 135°)**, projetada para prescrição médica digital ambulatorial e hospitalar, cálculo pediátrico por peso (`mg/kg -> mL/gotas`), gestão de leitos (`MOD-03`), apoio à decisão clínica (`114 calculadoras CDSS` + `EPARADA` + `BIC` + `Rastreio INCA/MS`) e emissão de documentos CFM/SUS em folha A4 vetorial única.

### Diagnóstico de Propósito, Nível de Complexidade e Arquétipos Espaciais (`[AUDIT-DESIGN-01]`)

1. **Parâmetros Canônicos de Identidade**:
   - **`project_purpose`**: `medtech_clinico` — Sistema clínico crítico (YMYL) de prescrição médica, suporte avançado à decisão clínica (CDSS), evolução hospitalar multimodal e impressão A4 regulatória (Portaria SVS/MS 344/98, RDC Anvisa 471/2021, Res. CFM 1.658/2002 e guias SUS APAC/LME/SISREG/GAL/SISCAN/TRM-TB).
   - **`complexity_tier`**: `tier_2_spa_feature_driven` (**Nível 2: SPA Modular Feature-Driven + PWA 100% Offline-First** em React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Dexie.js 4, com contratos preparados para interoperabilidade **Nível 3: Fullstack App Router & PWA**).
   - **`spatial_archetype`**: Composição multi-arquétipo governada pela tarefa clínica ativa:
     - **Arquétipo 1 (`Workbench Split-View`) + Arquétipo 6 (`Folha Vetorial de Impressão A4`)**: Aplicado no Construtor de Receitas (`PrescriptionBuilder`), Central de Documentos (`ClinicalDocumentsHub`) e Guias SUS (`SusFormsHub`), combinando painel de parâmetros à esquerda (`xl:col-span-7`) com a bancada A4 ao vivo à direita (`xl:col-span-5`, `xl:sticky xl:top-20`).
     - **Arquétipo 3 (`Command Center / Data Grid de Alta Densidade`) + Arquétipo 2 (`Bento Grid Assimétrico 12 Colunas`)**: Aplicado no Módulo Hospitalar (`MOD-03`, `Alt+7`) e no Scoreboard CDSS (`Alt+8`), com cabeçalhos `sticky`, métricas em `tabular-nums`, cruzamento Conduta × Evolução em 6 eixos e gavetas contextuais (*Slide-over Drawers*).
2. **Polaridade Luminosa Assistencial (`clinical-day` & `clinical-night`)**:
   - **Modo Diurno (`clinical-day`)**: Superfície Clean Slate (`#F8FAFC` / `oklch(0.985 0.004 255)`) com cartões em branco puro (`#FFFFFF` / `oklch(1 0 0)`) e contraste $\ge 10:1$ para doses, fármacos e alertas sanitários.
   - **Modo Plantão Noturno (`clinical-night`)**: Elevação por clareamento progressivo da luminosidade $L$ em `OKLCH` (`L = 0.14 -> 0.18 -> 0.22` / `0.16 -> 0.22 -> 0.27`, correspondendo a `#0F172A -> #1E293B -> #27354A`), eliminando pretos abissais (`#000000`) que causam *OLED smearing* e evitando branco puro (`#FFFFFF`) em textos corridos para reduzir fadiga visual (APCA).
3. **Chrome Estrutural Esculpido & Imutabilidade da Folha Física A4**:
   - **`Header` Command Bar (`64px` / `h-16`)**: Superfície adaptativa (`--surface-card` com `backdrop-blur-md`), integrando o **Segmented Workspace Track** (`Alt+1..8`) e o **Command & Context Cluster** (`Ctrl+K`, Paciente, Peso, CRM, Nuvem, Tema).
   - **`Sidebar` & `MobileBottomNav` em Deep Navy (`.panel-navy`)**: Ancoram o perímetro de navegação em ambos os temas (`#0F172A`), com barra luminosa vertical (`3px` em `#38BDF8`) e seletor de Macro-Módulos (`MOD-01`, `MOD-02`, `MOD-03`).
   - **Folha Física A4 (`#printable-a4-sheet`, `.folha-a4`, `.sus-grid`)**: Simula papel físico real (`210mm × 297mm` retrato / `297mm × 210mm` paisagem) e permanece **incondicionalmente branca (`#FFFFFF`) com tinta escura (`#0F172A`)** em qualquer tema.

### 1. Estrutura de Diretórios e Organização de Arquivos (*Feature-Driven + Colocation*)

Para garantir escalabilidade, isolamento de domínio clínico e zero acoplamento circular, o projeto adota **Arquitetura Orientada a Funcionalidades (*Feature-Driven Architecture*)** aliada à **Colocalização (*Colocation*)**:

```text
PCM/
├── public/                       # Ativos estáticos, ícones PWA e impressos oficiais SUS (formularios-sus/)
├── src/
│   ├── core/                     # FUNDAÇÃO MULTI-MÓDULO (MOD-01, MOD-02, MOD-03)
│   │   ├── domain/               # Entidades clínicas canônicas (clinicalEntities.ts)
│   │   └── storage/              # Persistência Dexie.js v3 IndexedDB (clinicalRepository.ts)
│   ├── components/               # BIBLIOTECA DE COMPONENTES & DOMÍNIOS VISUAIS
│   │   ├── ui/                   # Primitivas atômicas com FSM (SurfaceCard, ActionButton, Badge)
│   │   ├── bento/                # Blocos operacionais (ConsultationReadinessBar, BentoGrid)
│   │   ├── layout/               # Casca espacial e sincronia de abas (AppShell, useNavigationSync)
│   │   ├── documento/            # Motor de folha A4 única (FolhaA4, DocumentoClinico, ReceitaDuasVias)
│   │   ├── sus/                  # Grade vetorial 12 colunas SUS (SusInteractiveVectorSheet)
│   │   ├── hospital/             # Módulo Hospitalar MOD-03 (Alt+7: Leitos, Evolução, Ingestor IA, Live API)
│   │   ├── scores/               # Scoreboard CDSS (Alt+8: 114 escores, EPARADA, BIC, Rastreio INCA)
│   │   └── editor/               # Editor rico Tiptap A4 sob demanda
│   ├── config/                   # Contratos tipados de tokens (tokens.ts)
│   ├── data/                     # Catálogos determinísticos (medicationDatabase, pediatricMeds, scores/)
│   ├── services/                 # Backup portátil .pcm.json e sincronização opcional Firebase 12
│   ├── styles/                   # TOKENS EM 3 CAMADAS E REGRAS DE BASE
│   │   └── globals.css           # Camadas semânticas OKLCH, clamp(), @container e trilhos táteis
│   ├── utils/                    # Motores matemáticos puros (doseCalculator, isSpecialControlOrAntibiotic)
│   └── __tests__/                # 26 suítes determinísticas Vitest (241/241 testes Nível 4)
├── DESIGN.md                     # Contrato canônico do Design System (validado por npm run design:lint)
├── AGENTS.md                     # Diretrizes operacionais e invariantes clínicos
└── package.json
```

#### Convenção Equivalente para Evolução Fullstack (Next.js 15+ App Router) & Regras de Colocalização
1. **Regra de Proximidade (*Colocation*)**: Componentes (`.tsx`), estilos (`.module.css` ou camadas `@layer components`), testes (`.test.tsx`) e tipos (`.types.ts`) devem permanecer colocalizados por domínio.
2. **Isolamento de Rotas e Pastas Privadas (`_components`)**: Em arquiteturas App Router (`src/app/(dashboard)/`), componentes pesados exclusivos de uma rota residem em pastas privadas `_components/` para não expor rotas públicas acidentais, enquanto domínios de negócio ficam encapsulados em `src/features/<dominio>/{api,components,hooks,types}/`.

---

## Colors

O sistema cromático opera no espaço perceptual **`OKLCH` (`oklch(L C H)`)** em **3 Camadas Hierárquicas** (*1. Primitivos*, *2. Semânticos Reativos*, *3. Componentes*), harmonizando a **Regra 60-30-10** (proporção espacial de superfícies) com a **Regra Clínica 90 / 8 / 2** (`90%` superfícies neutras calmeantes, `8%` estrutura/bordas sutis e `2%` acento sólido restrito ao único CTA primário da vista) (`[AUDIT-DESIGN-02]`).

### 1. Tokens em 3 Camadas (`OKLCH`, `light-dark()`, `color-mix()` e Sintaxe de Cor Relativa `from`)

- **Primary (`#1E3A8A` / `oklch(0.36 0.14 262)`)**: Azul-marinho institucional reservado ao CTA primário de emissão/impressão e ao anel `:focus-visible`.
- **Secondary (`#334155` / `oklch(0.34 0.03 255)`)**: Slate estrutural para ações secundárias, barras segmentadas e controles de apoio.
- **Clinical (`#0F766E` / `oklch(0.51 0.10 182)`)**: Teal clínico (contraste WCAG AA $> 4.5:1$ com `#FFFFFF`) para confirmação de posologia, inclusão na receita e prontidão assistencial.
- **Neutral & Surface (`#F8FAFC` / `#FFFFFF` no Light; `#0F172A` / `#1E293B` no Dark)**: Base luminosa de 60% (`--bg-app` / `--bg-canvas`) e 30% (`--bg-surface` / `--bg-card` / `--surface-card`).
- **Rose (`#BE123C` / `oklch(0.51 0.20 16)`)**: Vermelho farmacêutico **estritamente reservado** a alergias medicamentosas, doses acima do teto seguro, interações graves e exclusão destrutiva.

```css
/* ==========================================================================
   ARQUITETURA DE TOKENS EM 3 CAMADAS (OKLCH + light-dark + color-mix + RCS)
   Sincronizado com <meta name="color-scheme" content="light dark">
   ========================================================================== */
:root {
  color-scheme: light dark;

  /* --- CAMADA 1: TOKENS PRIMITIVOS (Catálogo Bruto Perceptual OKLCH) --- */
  --primitive-navy-700: oklch(0.36 0.14 262);      /* #1E3A8A */
  --primitive-blue-500: oklch(0.62 0.21 258);      /* Azul interativo */
  --primitive-teal-600: oklch(0.51 0.10 182);      /* #0F766E */
  --primitive-emerald-500: oklch(0.70 0.17 160);   /* Sucesso semântico */
  --primitive-amber-600: oklch(0.66 0.17 65);      /* #D97706 Alerta */
  --primitive-rose-700: oklch(0.51 0.20 16);       /* #BE123C Perigo clínico */

  --primitive-neutral-50: oklch(0.985 0.004 255);  /* #F8FAFC Clean Slate */
  --primitive-neutral-100: oklch(0.955 0.008 255); /* #F1F5F9 Inset Light */
  --primitive-neutral-800: oklch(0.22 0.025 260);  /* #1E293B Surface Dark */
  --primitive-neutral-900: oklch(0.16 0.02 260);   /* #0F172A Canvas Dark */

  /* --- CAMADA 2: TOKENS SEMÂNTICOS REATIVOS (60-30-10 & light-dark) --- */
  --brand-primary: var(--primitive-navy-700);
  --brand-accent: var(--primitive-teal-600);
  --color-success: var(--primitive-teal-600);
  --color-warning: var(--primitive-amber-600);
  --color-danger: var(--primitive-rose-700);

  /* 60% Superfície Dominante (Nível 0) */
  --bg-app: light-dark(var(--primitive-neutral-50), oklch(0.14 0.02 260));
  --bg-canvas: var(--bg-app);
  --surface-canvas: var(--bg-canvas);

  /* 30% Superfícies Secundárias (Nível 1 e Nível 2 com clareamento L no Dark Mode) */
  --bg-surface: light-dark(oklch(1.0 0 0), oklch(0.18 0.02 260));
  --bg-surface-1: var(--bg-surface);
  --surface-card: var(--bg-surface);

  --bg-card: light-dark(oklch(0.96 0.01 250), oklch(0.22 0.03 260));
  --bg-surface-2: light-dark(
    var(--primitive-neutral-100),
    oklch(from var(--primitive-neutral-800) calc(l + 0.05) c h)
  );
  --surface-elevated: var(--bg-surface-2);
  --surface-sunken: light-dark(oklch(0.94 0.01 250), oklch(0.11 0.02 260));
  --surface-glass: oklch(from var(--bg-surface-1) l c h / 0.80);

  /* Tipografia e Tinta Semântica (APCA / WCAG AAA > 13:1 para doses) */
  --text-primary: light-dark(
    color-mix(in oklab, var(--brand-primary) 15%, oklch(0.15 0.02 255)),
    oklch(0.96 0.01 250)
  );
  --text-secondary: light-dark(oklch(0.40 0.02 250), oklch(0.75 0.02 250));
  --text-muted: light-dark(oklch(0.52 0.02 250), oklch(0.66 0.02 250));
  --ink-primary: var(--text-primary);
  --ink-secondary: var(--text-secondary);
  --ink-muted: var(--text-muted);

  /* Bordas e Luz Especular Zenital */
  --border-subtle: light-dark(oklch(0.20 0.02 255 / 0.08), oklch(1.0 0 0 / 0.12));
  --catch-light: inset 0px 1px 0px 0px light-dark(oklch(1 0 0 / 0.85), oklch(1 0 0 / 0.12));

  /* --- CAMADA 3: TOKENS DE COMPONENTE DERIVADOS VIA RCS (from) --- */
  --btn-primary-bg: var(--brand-primary);
  --btn-primary-hover: oklch(from var(--brand-primary) calc(l - 0.08) c h);
  --btn-primary-active: oklch(from var(--brand-primary) calc(l - 0.14) c h);
  --badge-bg: oklch(from var(--brand-primary) l c h / 0.12);
}

/* Reconfiguração explícita para Dark Mode (Mídia e Atributo [data-theme="dark"]) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-app: oklch(0.14 0.02 260);        /* Nível 0: Canvas Escuro (sem #000 puro) */
    --bg-surface: oklch(0.18 0.02 260);    /* Nível 1: Painéis e Headers */
    --bg-card: oklch(0.22 0.03 260);       /* Nível 2: Cartões e Modais */
    --surface-sunken: oklch(0.11 0.02 260);/* Poços e Inputs em recesso */
    --text-primary: oklch(0.96 0.01 250);
    --text-secondary: oklch(0.75 0.02 250);
    --text-muted: oklch(0.58 0.015 250);
    --border-subtle: oklch(1.0 0 0 / 0.12);
    --btn-primary-bg: oklch(from var(--brand-primary) calc(l + 0.06) c h);
    --btn-primary-hover: oklch(from var(--brand-primary) calc(l + 0.12) c h);
    --btn-primary-active: var(--brand-primary);
  }
}

[data-theme="light"] { color-scheme: light; }
[data-theme="dark"], .dark {
  color-scheme: dark;
  --bg-app: oklch(0.14 0.02 260);
  --bg-surface: oklch(0.18 0.02 260);
  --bg-card: oklch(0.22 0.03 260);
  --surface-sunken: oklch(0.11 0.02 260);
}
```

---

## Typography

A tipografia do PresCMed combina **3 famílias tipográficas especializadas**, **escala modular fluida (`clamp()`)**, **travas de nitidez anti-borrão GPU** e **alinhamento numérico tabular obrigatório** (`[AUDIT-DESIGN-03]`).

### 1. Motores Tipográficos e Escala Fluida (`clamp()`)

1. **Plus Jakarta Sans (`--font-sans` — UI & Clinical Narrative Engine)**:
   - Utilizada na casca da aplicação, modais, prontuário hospitalar e formulários (`line-height: 1.5` a `1.6`, medida confortável limitada a `max-inline-size: 60ch`–`65ch`).
   - **Escala Tipográfica Fluida**:
     - `--step--2` / `--text-xs`: `clamp(0.6875rem, 0.65rem + 0.15vw, 0.75rem)` (`11–12px`)
     - `--step--1` / `--text-sm`: `clamp(0.8125rem, 0.78rem + 0.16vw, 0.9rem)` (`13–14.4px`)
     - `--step-0` / `--text-base`: `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` (`16–18px`)
     - `--step-1` / `--text-lg`: `clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)` (`20–24px`)
     - `--step-2` / `--text-xl`: `clamp(1.5625rem, 1.4rem + 0.8vw, 2rem)` (`25–32px`)
     - `--step-3` / `--text-2xl`: `clamp(1.953rem, 1.7rem + 1.25vw, 2.665rem)` (`31–42px`)
2. **JetBrains Mono / IBM Plex Mono (`--font-mono` — Precision Tabular Engine)**:
   - Obrigatória com `font-variant-numeric: tabular-nums` em todas as doses (`mg`, `mL`, `gotas`), pesos (`kg`), escores CDSS, vazões de bomba de infusão (`mL/h`, `mcg/kg/min`), códigos `CID-10`/`SIGTAP`, `CNS`/`CNES` e atalhos (`Alt+1..8`, `Ctrl+K`).
   - **Blindagem de Unidades (`.clinical-unit`)**: Unidades clínicas usam `white-space: nowrap; flex-shrink: 0` para jamais quebrar linha separadas do algarismo.
3. **Cormorant Garamond (`--font-serif-doc` — A4 Document Engine)**:
   - Exclusiva do interior editorial da folha A4 de receituários, atestados e encaminhamentos.

### 2. Nitidez Anti-Borrão GPU, `text-wrap` e Hierarquia Squint Test

- **Travas de Renderização de Subpixel e GPU**:
  ```css
  html, body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-optical-sizing: auto;
    font-synthesis: none;
  }

  h1, h2, h3, h4 {
    text-wrap: balance;
    line-height: 1.18;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  p, li {
    line-height: 1.6;
    max-inline-size: 65ch;
    text-wrap: pretty;
    hyphens: auto;
    color: var(--text-secondary);
  }

  .tabular-data, .clinical-unit, table td, input[type="number"], .metricValue {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
  ```
- **Proibição de `scale()` Fracionário em Textos**: É proibido animar containers de texto com `transform: scale(0.97)` ou valores fracionários em repouso/hover que borrem a rasterização de glifos na GPU; utilize `translateY(-1px)` / `translateY(0px)`.
- **Hierarquia em 3 Níveis (Squint Test)**:
  - *Nível 1 (Âncora Primária)*: Título da vista, dose calculada e o único CTA sólido.
  - *Nível 2 (Agrupamentos Operacionais)*: Títulos de cartão em **sentence case** (`font-weight: 600`), sem subtítulos redundantes.
  - *Nível 3 (Micro-rótulos e Badges)*: Caixa alta compacta (`0.6875rem–0.75rem`, `letter-spacing: 0.05em`) restrita a siglas regulatórias (`SUS / RENAME`, `1ª VIA FARMÁCIA`, `CRM`, `MOD-01..03`).

---

## Layout & Spacing

A arquitetura espacial separa rigorosamente **Macrolayouts** (casca da página) de **Microlayouts** (componentes autônomos regidos por `@container`), apoiada em **Box Model Lógico**, **prevenção de colapso de margem** e grade **Base-4 / Base-8 (`4px, 8px, 12px, 16px, 24px, 32px, 64px`)** (`[AUDIT-DESIGN-01]`, `[AUDIT-DESIGN-04]`).

### 1. Box Model Lógico, `100dvh` e Prevenção de Colapso de Margem (BFC)

- **Propriedades Lógicas Internacionais**: Prefira `inline-size`, `block-size`, `max-inline-size`, `padding-inline`, `padding-block`, `margin-inline`, `margin-block` e `inset-inline-start` em vez de propriedades físicas legadas.
- **Dynamic Viewport Height (`100dvh`)**: Toda casca de tela cheia e gaveta móvel utiliza `min-block-size: 100dvh` (ou `h-dvh`), adaptando-se às barras retráteis de navegadores mobile e ao modo instalado PWA (`@media (display-mode: standalone)`).
- **Anti-Colapso de Margem**: Contêineres de seção aplicam `display: flow-root` (criando um *Block Formatting Context* limpo), espaçamento entre irmãos é governado por `gap` no elemento pai Flex/Grid e blocos editoriais usam o seletor coruja (`.prose > * + * { margin-block-start: var(--flow-space, 1.25em); }`).

### 2. Macrolayouts (`CSS Grid` + `@media`) vs. Microlayouts Autônomos (`@container`)

- **Macrolayouts**: Coordenam a casca global (`Header` `64px`, `Sidebar` `256px`/`64px`, área principal `max-w-[1600px]` e `MobileBottomNav` abaixo de `1024px`).
- **Microlayouts Autônomos (`@container`)**: Cartões clínicos, blocos do Scoreboard CDSS, cards de leitos hospitalares e a gaveta pediátrica declaram `container-type: inline-size` e adaptam sua grade interna pela própria largura útil (`cqw`), sem depender da viewport:

```css
.cardContainer {
  container-type: inline-size;
  container-name: cardComponent;
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: clamp(1rem, 3cqw, 1.5rem);
  box-shadow: var(--elevation-low);
}

.metricsGrid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@container cardComponent (min-width: 320px) {
  .metricsGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 3. Os 6 Arquétipos Espaciais Canônicos da SSOT

| Arquétipo Espacial | Domínio / Aplicação no PresCMed (`PCM`) | Composição Macro (`@media`) e Micro (`@container`) |
| :--- | :--- | :--- |
| **1. Workbench Split-View** | `PrescriptionBuilder`, `ClinicalDocumentsHub`, `SusFormsHub`. | Coluna esquerda de edição (`xl:col-span-7`) + bancada A4 sticky à direita (`xl:col-span-5`) + gaveta `@container`. |
| **2. Bento Grid Assimétrico (12 col)** | `ConsultationReadinessBar`, painéis de resumo de leito e sinais vitais. | CSS Grid 12 colunas (`col-span-4`, `col-span-8`, `gap: var(--space-6)`) + `grid-template-rows: subgrid`. |
| **3. Command Center / Data Grid** | `HospitalWardModuleView` (`MOD-03`, `Alt+7`) e `ScoreboardView` (`Alt+8`). | Cabeçalhos `sticky`, linhas `nowrap` em `tabular-nums`, barra `Cluster` de filtros e *Slide-over Drawer*. |
| **4. Canvas Editorial & Leitura** | `DocumentEditorView` (Tiptap A4), notas científicas e relatórios SOAP/SBAR. | Coluna central `max-inline-size: 65ch`, `.prose > * + *`, *Table of Contents* local e Breadcrumbs. |
| **5. HUD Espacial com Dock Flutuante** | Visualizadores, barras de ferramentas flutuantes do Editor e alertas `EPARADA`. | Docks flutuantes `--surface-glass` (`backdrop-filter: blur(16px)`) + `--shadow-elevation-3`. |
| **6. Folha Vetorial de Impressão A4** | `FolhaA4.tsx`, `ReceitaDuasVias.tsx`, `SusInteractiveVectorSheet.tsx`. | Folha `210mm × 297mm` (`794×1123px`) em **100% CSS Grid vetorial e SVG** (zero bitmaps Base64 pesados). |

---

## Elevation & Depth

A profundidade visual rejeita sombras lavadas de camada única e aplica **Física Óptica de Luz Zenital (90°–120° superior + matriz direcional 135°)**, combinando **3 tipos de sombra**, **3 níveis de elevação** e **`isolation: isolate`** (`[AUDIT-DESIGN-03]`).

### 1. Os 3 Tipos de Sombra e `isolation: isolate`

1. **`box-shadow` Multi-Camadas**: Composta por **Umbra de contato** (curta e escura), **Penumbra difusa** (ampla com `spread` negativo `-2px` a `-8px`) e **Catch-Light especular superior** (`inset 0 1px 0 0`).
2. **`text-shadow`**: Aplicada sutilmente em títulos sobre superfícies de gradiente ou painéis Deep Navy (`.heroTitleOverGradient { text-shadow: 0px 2px 8px oklch(0.05 0.02 260 / 0.8); }`).
3. **`filter: drop-shadow()`**: Utilizada em ícones vetoriais e brasões SVG transparentes onde `box-shadow` recortaria a caixa retangular.
4. **Isolamento de Empilhamento (`isolation: isolate`)**: Aplicado em cartões interativos, modais e na bancada A4 para confinar `z-index` e *blend modes* sem vazar para o canvas.

### 2. Os 3 Níveis de Elevação (`--elevation-low/medium/high`) e Recesso Côncavo (`--shadow-inset`)

```css
:root {
  /* Nível 1: Cartões em repouso e pílulas ativas */
  --shadow-elevation-1:
    0px 1px 2px 0px oklch(0.2 0.03 255 / 0.05),
    0px 2px 4px -1px oklch(0.2 0.03 255 / 0.04),
    var(--catch-light);

  /* Nível 2: Cartões em hover, popovers e dropdowns */
  --shadow-elevation-2:
    0px 2px 4px -1px oklch(0.2 0.03 255 / 0.06),
    0px 6px 12px -2px oklch(0.2 0.03 255 / 0.08),
    0px 14px 24px -4px oklch(0.2 0.03 255 / 0.05),
    var(--catch-light);

  /* Nível 3: Modais, Command Palette (Ctrl+K), Drawers e Folha A4 flutuante */
  --shadow-elevation-3:
    0px 4px 8px -2px oklch(0.2 0.03 255 / 0.06),
    0px 16px 24px -4px oklch(0.2 0.03 255 / 0.10),
    0px 32px 48px -8px oklch(0.2 0.03 255 / 0.14),
    var(--catch-light);

  /* Cavidade Côncava (Trilhos segmentados e inputs vazios) */
  --shadow-inset:
    inset 0px 2px 4px 0px oklch(0.15 0.02 255 / 0.08),
    inset 0px 0px 0px 1px oklch(0.15 0.02 255 / 0.05);

  --elevation-low: var(--shadow-elevation-1);
  --elevation-medium: var(--shadow-elevation-2);
  --elevation-high: var(--shadow-elevation-3);
  --sunken-recess: var(--shadow-inset);
}

@media (prefers-color-scheme: dark) {
  :root {
    --elevation-low:
      0px 2px 4px oklch(0.05 0.01 260 / 0.5),
      inset 0px 1px 0px 0px oklch(1.0 0 0 / 0.08);
    --elevation-medium:
      0px 8px 16px -2px oklch(0.05 0.01 260 / 0.65),
      0px 0px 12px 0px oklch(from var(--brand-primary) l c h / 0.16),
      inset 0px 1px 0px 0px oklch(1.0 0 0 / 0.12);
    --elevation-high:
      0px 20px 40px -6px oklch(0.02 0.01 260 / 0.8),
      0px 0px 24px 0px oklch(from var(--brand-primary) l c h / 0.24),
      inset 0px 1px 0px 0px oklch(1.0 0 0 / 0.16);
  }
}
```

---

## Shapes

A geometria de bordas obedece à **Harmonia de Raios Concêntricos** para eliminar calombos ópticos entre contêineres externos e elementos filhos:

$$R_{\text{interno}} = \max(0, R_{\text{externo}} - P_{\text{padding}})$$

- **Cartões e Painéis Clínicos (`16px` – `20px` / `rounded.lg`)**: Contenção principal com borda hairline de `1px` (`--border-subtle`). Quando o padding interno é `6px`–`8px`, o item filho recebe `border-radius: calc(var(--radius-outer) - var(--padding-card))` (`8px`–`12px`).
- **Trilhos Segmentados, Botões e Inputs (`8px` – `14px` / `rounded.sm` e `rounded.md`)**: Geometria de alta precisão para controles operacionais.
- **Badges, Pílulas de Status e Contadores (`9999px` / `rounded.full`)**: Formato pílula para indicadores de via sanitária (`1ª VIA FARMÁCIA`), escores e contadores tabulares.

---

## Components

Todos os componentes interativos seguem **Engenharia Real-State (Máquina de Estados Finitos Executável)**, **4 Variantes Canônicas de Cards**, **Navegação em 3 Camadas** e **Acessibilidade Tátil e de Teclado** (`[AUDIT-DESIGN-04]`).

### 1. As 4 Variantes Canônicas de Cards (`SurfaceCard.tsx`)

1. **`Elevated` (`data-variant="elevated"`)**: Superfície `--surface-card`, borda `--border-subtle` e sombra `--elevation-low` com Catch-Light zenital; usado em cartões primários de prescrição e evolução.
2. **`Outlined` (`data-variant="outlined"`)**: Fundo transparente ou `--surface-card`, borda estrutural `1px solid var(--border-medium)` e sombra zero; usado em agrupamentos secundários e tabelas clínicas.
3. **`Filled / Subtle` (`data-variant="filled"`)**: Superfície rebaixada `--surface-inset` / `--surface-sunken` com `--shadow-inset` sutil; usado em trilhos segmentados (`nav-segmented-track`), poços de métricas e áreas de resumo.
4. **`Interactive` (`data-variant="interactive"`)**: Eleva-se no `:hover` (`transform: translateY(-1px); box-shadow: var(--elevation-medium)`) e responde no `:active` (`transform: translateY(0px)`) com curva física `--ease-out-natural: cubic-bezier(0.22, 1, 0.36, 1)`, anel `:focus-visible` e `isolation: isolate`.

### 2. Arquitetura de Navegação Semântica em 3 Camadas

1. **Camada 1 — Navegação Global (Perímetro da Aplicação)**:
   - `Header.tsx` (`h-16` / `64px`): Gatilho da Sidebar, botão Início, **Segmented Workspace Track** (`Receitas`, `Documentos`, `Doses`, `Protocolos`, `Editor`, `Guias SUS`, `Hospitalar`, `Scores CDSS` com atalhos `Alt+1..8`) e **Command & Context Cluster** (`Ctrl+K`).
   - `Sidebar.tsx` (Deep Navy `.panel-navy`, `256px` expandida / `64px` recolhida) e `MobileBottomNav.tsx` (5 destinos abaixo de `1024px`).
2. **Camada 2 — Navegação Local / In-Page (Trilhos de Domínio)**:
   - Trilhos segmentados côncavos (`.nav-segmented-track` + `.nav-segmented-pill-active`) com `role="tablist"` e `role="tab"` (`aria-selected`, `aria-controls`) na Central de Documentos (`Atestado`, `Encaminhamento`, `Exames`, `Guias SUS`), nos 9 blocos de especialidade do `ScoreboardView` e nas sub-abas do paciente internado (`MOD-03`).
3. **Camada 3 — Navegação Estrutural e Breadcrumbs Silenciosos**:
   - Estruturada com `<nav aria-label="Caminho de navegação">` e lista ordenada `<ol role="list" class="breadcrumbsList">`, injetando separadores `/` via CSS (`::before`) para não poluir leitores de tela e marcando a página ativa com `aria-current="page"`:
   ```html
   <nav aria-label="Caminho de navegação">
     <ol role="list" class="breadcrumbsList">
       <li><a href="#mod-03">Hospitalar (MOD-03)</a></li>
       <li><a href="#enfermaria">Enfermaria Clínica</a></li>
       <li><a href="#leito-110-15" aria-current="page">Leito 110-15</a></li>
     </ol>
   </nav>
   ```
   ```css
   .breadcrumbsList {
     display: flex;
     list-style: none;
     gap: 0.5rem;
     font-size: 0.8125rem;
   }
   .breadcrumbsList li + li::before {
     content: "/";
     margin-inline-end: 0.5rem;
     color: var(--text-muted);
   }
   .breadcrumbsList a[aria-current="page"] {
     color: var(--brand-primary);
     font-weight: 600;
   }
   ```

### 3. Engenharia de Interatividade, Acessibilidade e Entrada

- **Ordem de Origem (DOM) = Ordem Visual**: O foco do teclado (`Tab`) segue estritamente a árvore HTML. É proibido usar `order`, `flex-direction: row-reverse` ou posicionamento absoluto que desconecte a sequência visual da ordem de tabulação.
- **Regra LVHA e `:focus-visible`**: Links respeitam `:link -> :visited -> :hover -> :active`. Nunca remova `outline` sem fornecer `:focus-visible` (`outline: 2px solid var(--brand-primary); outline-offset: 2px`).
- **Lei de Fitts e Apontadores Físicos (`pointer: fine` vs. `any-pointer: coarse`)**:
  - `@media (pointer: fine)`: Densidade otimizada para mouse e atalhos de teclado.
  - `@media (pointer: coarse)`, `@media (any-pointer: coarse)`: Alvos interativos expandidos para área mínima de **48 × 48 px** (`min-block-size: 44px` a `48px`; `min-inline-size: 44px` a `48px`) com espaçamento mínimo de `8px`.
- **Acessibilidade Vestibular (`prefers-reduced-motion`)**:
  - `@media (prefers-reduced-motion: reduce)` desativa ou atenua transições e animações espaciais.
- **Máquina de Estados Finitos Real-State (`UIState`)**:
  - Todo componente declara estados reais (`'idle' | 'loading' | 'success' | 'empty' | 'error'`) refletidos em atributos executáveis (`data-state`, `data-theme`, `data-variant`, `aria-busy`, `aria-pressed`, `aria-selected`, `role="status"`, `role="alert"`).
- **Invariantes Clínicos de Componente**:
  - **Isolamento de Acento**: Apenas **1 botão sólido primário** por seção (`button-primary` `#1E3A8A` ou `button-clinical` `#0F766E`).
  - **Placeholders Padronizados (`Ex.:`)**: Todo input inicia seu placeholder com `"Ex.:"`.
  - **Sem Peso, Sem Dose**: Calculadora pediátrica e protocolos bloqueiam doses enquanto `weightKg <= 0`.

### 4. Diretrizes de Hooks de Tema (`useTheme`) e Interpolação `color-mix()`

- **Sincronização de Tema sem FOUC**: O estado `darkMode` sincroniza a classe `.dark` e o atributo `data-theme="light|dark"` em `document.documentElement` e persiste em `localStorage` (`pcm_dark_mode`).
- **Badges Semânticos com `color-mix(in oklab)`**:
  ```css
  .badgeInfo {
    background-color: color-mix(in oklab, var(--brand-primary) 15%, transparent);
    color: var(--brand-primary);
    border: 1px solid color-mix(in oklab, var(--brand-primary) 30%, transparent);
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  ```

---

## Do's and Don'ts

### Do's (Práticas Obrigatórias)
- **Do** estruturar tokens nas 3 camadas (`Primitivos OKLCH` -> `Semânticos light-dark() / color-mix() / RCS from` -> `Componente`) mantendo a regra `60-30-10` e a contenção de acento `90 / 8 / 2`.
- **Do** manter o `Header` com superfície adaptativa (`--surface-card`) e reservar o acabamento Deep Navy (`.panel-navy`) para `Sidebar` e `MobileBottomNav`.
- **Do** manter a folha A4 (`FolhaA4.tsx` e `.sus-grid`) estritamente em fundo `#FFFFFF` e tinta `#0F172A` nos dois temas.
- **Do** aplicar `font-variant-numeric: tabular-nums` e `.clinical-unit` (`white-space: nowrap`) em todas as doses, pesos, contadores, escores CDSS e atalhos.
- **Do** usar propriedades lógicas (`inline-size`, `padding-inline`, `margin-block`), `display: flow-root`, `100dvh`, `text-wrap: balance/pretty` e `font-synthesis: none`.
- **Do** garantir alvos de toque $\ge 44\times 44\text{px}$ (`48\times 48\text{px}$ em `any-pointer: coarse`), Ordem DOM = Ordem Visual, anel `:focus-visible` e suporte a `@media (prefers-reduced-motion: reduce)`.
- **Do** formatar doses em miligramas com vírgula decimal e zero separador de milhar (`"7,5 mg"`, `"1000 mg"`).

### Don'ts (Práticas Proibidas)
- **Don't** usar emojis decorativos em controles, alertas, cabeçalhos ou badges (`AUDIT-VIS-EMOJI`).
- **Don't** usar `#000000` puro em fundos de modo escuro ou sombras simples lavadas de camada única (`0 4px 12px rgba(0,0,0,0.4)`).
- **Don't** aplicar `transform: scale()` fracionário em textos ou usar `order` / `row-reverse` quebrando a sequência da tecla `Tab`.
- **Don't** embutir ativos Base64 pesados (`> 50 KB`) no código ou substituir grades `.sus-grid` vetoriais por imagens estáticas (`AUDIT-VIS-BLOAT`).
- **Don't** usar classes responsivas (`sm:`, `md:`) ou `dark:` no interior da `FolhaA4`.
- **Don't** incluir CID-10 em atestados sem `authorizedByPatient === true` (Res. CFM 1.658/2002) ou inventar dados clínicos não preenchidos em guias SUS.

### Checklist de Qualidade de Design e Acessibilidade (10 Itens Verificáveis)

- [x] **1. Modelo de Caixa e BFC**: Reset `box-sizing: border-box`, propriedades lógicas (`inline-size`, `margin-inline`, `padding-block`), `display: flow-root` e `gap` no pai ativos.
- [x] **2. Tokens em 3 Camadas OKLCH**: Primitivos, Semânticos (`light-dark()`, `color-mix(in oklab)`, RCS `from`) e Componente com Regra 60-30-10.
- [x] **3. Modo Escuro Progressivo**: Superfícies com luminosidade $L$ progressiva (`0.14 -> 0.18 -> 0.22`) e Catch-Light especular `oklch(1 0 0 / 0.12)` sem `#000000` puro.
- [x] **4. Arquitetura Macro/Micro**: Macrolayouts em CSS Grid (`100dvh`) e Microlayouts autônomos com `@container` (`container-type: inline-size` + `cqw`).
- [x] **5. Leitura e Nitidez GPU**: Extensão limitada a `60ch`–`65ch`, `text-wrap: balance/pretty`, `antialiased`, `font-synthesis: none` e `tabular-nums` (`.clinical-unit`).
- [x] **6. Acessibilidade de Foco**: Anel `:focus-visible` nítido e Regra LVHA sem remoção global de contorno.
- [x] **7. Ordem de Teclado**: Sequência do DOM coincide 100% com a ordem visual na tela sem saltos por `order`.
- [x] **8. Telas de Toque (Lei de Fitts)**: Alvos interativos com área $\ge 48 \times 48\text{ px}$ em `@media (any-pointer: coarse)`.
- [x] **9. Navegação em 3 Camadas**: Global, Local (`role="tablist"`) e Breadcrumbs semânticos (`<ol role="list">` + `aria-current="page"`) com separadores CSS `::before`.
- [x] **10. Sensibilidade Vestibular e Real-State**: Transições desativadas em `@media (prefers-reduced-motion: reduce)` e 100% dos controles com estados FSM reais (`data-state`).

---

## 8. Adendos por Escopo de Projeto (`design-md` v8.0.0 — A a I)

Diretrizes técnicas especializadas para os subdomínios atuais e expansões modulares do PresCMed:

### 8.1. Adendo A: Canvas Infinito, Geometria, Nós Reativos e Editores Visuais (`Canvas, Nodes, Geometry, Resize`)
Aplicável a mapas clínicos de evolução, fluxogramas de protocolos assistenciais, árvore de decisão CDSS e editores visuais:
- **Grelha de Fundo (`.canvasPattern`)**:
  ```css
  .canvasPattern {
    background-image: radial-gradient(var(--border-subtle) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  ```
- **Redimensionamento Nativo de Nós (`.nodeResizable`)**:
  ```css
  .nodeResizable {
    resize: both;
    overflow: auto;
    min-width: 200px;
    min-height: 120px;
    max-width: 600px;
    max-height: 500px;
  }
  ```
- **Sinalização Reativa em Tempo Real (`.nodeFlashing`)**: Destaca atualizações de sinais vitais, exames ou nós de conduta sem re-renderizar a árvore inteira:
  ```css
  @keyframes flashYellow {
    0% {
      background-color: oklch(0.85 0.18 85);
      box-shadow: 0 0 20px oklch(0.85 0.18 85);
      transform: scale(1.12);
    }
    100% {
      background-color: var(--bg-card);
      box-shadow: var(--elevation-low);
      transform: scale(1);
    }
  }
  .nodeFlashing {
    animation: flashYellow 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  ```
- **Alta Escala (+1.000 nós)**: Ative `onlyRenderVisibleElements={true}`, processe layouts automáticos (Dagre/ELK) em **Web Workers** fora da *main thread* e encapsule nós em `React.memo`.

### 8.2. Adendo B: Transições Discretas (`allow-discrete` + `@starting-style`) e Scroll-Driven Animations
Aplicável a modais nativos (`PatientModal`, `DoctorProfileModal`, `CommandPaletteModal`) e revelação progressiva de cartões:
```css
.modalOverlay {
  display: none;
  opacity: 0;
  transform: scale(0.95);
  transition:
    display 0.25s allow-discrete,
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modalOverlay[open] {
  display: flex;
  opacity: 1;
  transform: scale(1);
  @starting-style {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes revealCard {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.scrollRevealCard {
  animation: revealCard linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 30%;
}
```

### 8.3. Adendo C: Sombras Limpas, Dark Mode Glow, `text-shadow` e Variáveis Tipadas (`@property`)
```css
:root {
  --shadow-clean-card:
    0px 1px 2px oklch(0.15 0.02 250 / 0.05),
    0px 4px 8px oklch(0.15 0.02 250 / 0.04),
    0px 12px 24px -4px oklch(0.15 0.02 250 / 0.03);
}

.heroTitleOverGradient {
  color: oklch(0.98 0 0);
  text-shadow: 0px 2px 8px oklch(0.05 0.02 260 / 0.8);
}

.menuDropdownShadow {
  box-shadow:
    0px 10px 25px -5px oklch(0.02 0.01 260 / 0.7),
    0px 0px 1px 1px oklch(1.0 0 0 / 0.12);
}

@property --gradient-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.animatedGradientCard {
  background-image: linear-gradient(
    var(--gradient-angle),
    oklch(0.62 0.22 255),
    oklch(0.72 0.19 150)
  );
  animation: rotateGrad 8s linear infinite;
}

@keyframes rotateGrad {
  to { --gradient-angle: 360deg; }
}
```

### 8.4. Adendo D: Grid Sliders com CSS Scroll Snap e `TabControl` Acessível
Aplicável a carrosséis de kits clínicos de plantão, filtros de categorias pediátricas e barras de abas com rolagem horizontal:
```css
.sliderGrid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(260px, 40vw, 360px);
  gap: 1.25rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding-block-end: 1rem;
  scrollbar-width: thin;
}

.sliderCard {
  scroll-snap-align: start;
}

.tabsOverflowContainer {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  white-space: nowrap;
  user-select: none;
  border-block-end: 1px solid var(--border-subtle);
  padding-block-end: 2px;
}

.tabItem[aria-selected="true"] {
  color: var(--brand-primary);
  border-block-end: 2px solid var(--brand-primary);
  font-weight: 600;
}
```

### 8.5. Adendo E: Pseudoclasses Relacionais, Pseudoelementos e Anatomia de Cards (`.cardStructured`)

| Seletor | Tipo | Aplicação Prática no PresCMed (`PCM`) |
| :--- | :--- | :--- |
| **`:has()`** | Pseudoclasse Relacional | Destaca o cartão de prescrição ou leito quando contém alerta crítico (`.card:has(.clinical-alert-rose)`). |
| **`:is()` / `:not()`** | Pseudoclasses Lógicas | Isola a folha física A4 do filtro anti-ofuscamento noturno (`.dark img:not(:is(#printable-a4-sheet, .folha-a4) *)`). |
| **`:focus-visible`** | Pseudoclasse de Estado | Exibe anel de foco `2px solid var(--brand-primary)` exclusivamente na navegação por teclado. |
| **`::before` / `::after`** | Pseudoelementos | Separadores silenciosos de breadcrumbs (`/`) e barras luminosas de item ativo. |
| **`::selection`** | Pseudoelemento | Seleção clínica de alto contraste em posologias e notas SOAP. |

```css
.cardStructured {
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: clamp(1rem, 2.5vw, 1.75rem);
  box-shadow: var(--elevation-low);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

### 8.6. Adendo F: Cascata `@layer`, Grid Responsivo Intrínseco (RAM Pattern) e CSS Subgrid
- **Ordem Explícita de Camadas**: `@layer reset, tokens, base, layouts, components, utilities, overrides;` eliminando conflitos de especificidade.
- **RAM Pattern & CSS Subgrid**: Alinha cabeçalhos, corpos e rodapés de cartões clínicos vizinhos no Scoreboard CDSS e no painel de leitos (`MOD-03`):
```css
.bentoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

.bentoCardSubgrid {
  grid-row: span 3;
  display: grid;
  grid-template-rows: subgrid;
  gap: 0.75rem;
  background-color: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.25rem;
}
```

### 8.7. Adendo G: Geometria Concêntrica, Bordas `conic-gradient` (`background-clip`) e Trigonometria CSS (`sin()`, `cos()`)
```css
.outerCard {
  --radius-outer: 16px;
  --padding-card: 8px;
  border-radius: var(--radius-outer);
  padding: var(--padding-card);
}

.innerMedia {
  border-radius: calc(var(--radius-outer) - var(--padding-card));
}

.glowBorderCard {
  border: 1px solid transparent;
  border-radius: 12px;
  background:
    linear-gradient(var(--bg-card), var(--bg-card)) padding-box,
    conic-gradient(from var(--gradient-angle), var(--brand-primary), var(--brand-accent), var(--brand-primary)) border-box;
  animation: rotateGrad 6s linear infinite;
}

.radialMenuItem {
  --angle: calc(360deg / var(--total-items) * var(--item-index));
  --orbit-radius: 96px;
  transform: translate(
    calc(cos(var(--angle)) * var(--orbit-radius)),
    calc(sin(var(--angle)) * var(--orbit-radius))
  );
}
```

### 8.8. Adendo H: Primitivas HTML Semânticas (`<dialog>`, `popover="auto"`, `inert`), Validação Tardia (`:user-invalid`) e View Transitions
- **Primitivas Nativas**: Uso de `<dialog>` modal, `popover="auto"`, acordeões `<details name="grupo-clinico">` e atributo `inert` no fundo quando gavetas modais estiverem ativas.
- **Validação Tardia (`:user-invalid` / `:user-valid`)**: Nunca marque campos obrigatórios vazios como vermelhos antes da interação do médico; utilize `:user-invalid`:
```css
.inputField {
  inline-size: 100%;
  padding: 0.625rem 0.875rem;
  background-color: var(--surface-sunken);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  accent-color: var(--brand-primary);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.inputField:focus-visible {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px oklch(from var(--brand-primary) l c h / 0.2);
}

.inputField:user-invalid {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px oklch(from var(--color-danger) l c h / 0.18);
}

.inputField:user-valid {
  border-color: var(--color-success);
}
```
- **View Transitions API**: Trocas de aba principal (`runTabViewTransition` em `useNavigationSync.ts`) invocam `document.startViewTransition(() => updateState())` respeitando `prefers-reduced-motion`.

### 8.9. Adendo I: Sistemas Agênticos Clínicos (AI/LLM UI no `MOD-03`), Next.js 15+ Server/Client e Grafos em Tempo Real (`Batch 150ms + LOD Zoom`)
Aplicável ao **Ingestor Multimodal sob Diretriz de Rigor Terapêutico**, **Chat Live API** e **Agente Science** do Módulo Hospitalar (`MOD-03`):
1. **Streaming e Raciocínio Clínico Progressivo**: Blocos de raciocínio (*Chain-of-Thought*) são encapsulados em `<details class="reasoningAccordion">` colapsáveis com *Scroll Lock Override* (o auto-scroll pausa imediatamente se o médico rolar para cima para ler uma evidência).
2. **Cartões de Inspeção de Tool Calls & Evidências**: Exibem status semântico (`pending`, `running`, `success`, `error`), parâmetros estruturados e latência em `tabular-nums`.
3. **Portões de Aprovação Humana (HITL Approval Gates)**: Nenhuma sugestão de admissão ou cruzamento Conduta × Evolução altera a prescrição ou o leito sem confirmação explícita do médico responsável (`approval_token` + `idempotency_key`, zero alucinação de dados não informados).
4. **Fronteira Server vs. Client (Interoperabilidade Next.js 15+ App Router)**: Em rotas híbridas, layouts e páginas operam como Server Components com `params` e `searchParams` tipados como `Promise` (`const { id } = await params;`), empurrando `'use client'` para folhas interativas.
5. **Grafos Interativos em Tempo Real (Batching `150ms` + LOD Semântico por Zoom)**:
   - **Janela de Batching (`150ms`)**: Eventos de alta frequência acumulam em buffer de `150ms` antes de atualizar o estado visual, preservando `60fps`.
   - **Nível de Detalhe Dinâmico (*LOD* por Zoom)**:
     - **Zoom $< 0.4$ (Visão Macro)**: Oculta metadados secundários e controles internos; exibe apenas o bloco semântico e identificação do leito/nó.
     - **Zoom $\ge 0.4$ (Visão Micro)**: Revela sinais vitais completos, badges de escores CDSS e ações rápidas.

---

## 9. Matriz de Decisão Rápida de Arquitetura Visual

| Desafio de Interface no PresCMed (`PCM`) | Solução Padrão Canônica (`DESIGN.md` v8.0.0) |
| :--- | :--- |
| **Layout geral da aplicação (Shell)** | CSS Grid + Media Queries + `100dvh` (`AppShell.tsx` + `Header` `64px` + `Sidebar` Deep Navy) |
| **Componente adaptável a qualquer coluna ou gaveta** | `@container` (`container-type: inline-size`) + unidades `cqw` (Microlayout) |
| **Alinhamento interno entre cards de escores/leitos** | `display: grid` + `grid-template-rows: subgrid` (`grid-row: span 3`) |
| **Grade responsiva sem Media Queries** | `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))` (RAM Pattern) |
| **Paleta de cores consistente e acessível** | Espaço `oklch(L C H)` em 3 camadas + Regra 60-30-10 / 90-8-2 + `light-dark()` / `color-mix()` / RCS |
| **Elevação no Modo Escuro (`clinical-night`)** | Clareamento progressivo de $L$ em OKLCH (`0.14 -> 0.18 -> 0.22`) + Catch-Light `oklch(1 0 0 / 0.12)` |
| **Arredondamento de card com item interno** | Raios concêntricos: $R_{\text{interno}} = \max(0, R_{\text{externo}} - P_{\text{padding}})$ |
| **Animação de entrada de `<dialog>` / Modal** | `transition: display 0.25s allow-discrete` + `@starting-style` |
| **Validação visual de campos clínicos** | Pseudoclasses `:user-invalid` e `:user-valid` + placeholders iniciados por `"Ex.:"` |
| **Impressão e exportação PDF de documentos médicos** | Componente único `FolhaA4.tsx` / `.sus-grid` 100% vetorial (`#FFFFFF` imutável) + `html2canvas-pro` |
| **Grafo / Monitoramento em tempo real (+1.000 nós)** | `onlyRenderVisibleElements` + Web Worker (Dagre/ELK) + Batch `150ms` + LOD Zoom ($< 0.4$ vs. $\ge 0.4$) |

---

## Iconography

O PresCMed utiliza exclusivamente o **Google Material Design Symbols** empacotado 100% offline (`material-symbols` via `woff2` precacheado no PWA):

- **Componente Canônico Anti-Mutação**: `<Icon name="receita" size={20} />` (`src/components/Icon.tsx`), com container blindado (`overflow-hidden`, `select-none`, `aria-hidden="true"`).
- **Resolução Determinística de Aliases Clínicos**: Mapeamento tipado de termos em português (`receita`, `documentos`, `balanca`, `coracao`, `editor`, `sus`, `guias_sus`, `atestado`, `encaminhamento`, `exame`, `imprimir`, `verified`, `hospital`, `calculadoras`).
- **Regra Inegociável**: É estritamente proibido utilizar emojis decorativos ou instalar pacotes de ícones paralelos fora do componente `<Icon />`.
