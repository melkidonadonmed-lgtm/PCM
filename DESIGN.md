---
name: PresCMed Design System
version: "alpha"
description: "Sistema de Prescrição Médica Digital ambulatorial brasileira. Interface física com iluminação óptica a 135°, Deep Navy na Sidebar e MobileBottomNav, Header integrado com fundo claro no tema claro, canvas duplo (Clean Slate #F8FAFC no Claro e Deep Slate #0F172A no Escuro) e folha A4 clínica imutável."
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

O **PresCMed** expressa uma identidade visual de **alta precisão cirúrgica, minimalismo funcional e resposta tátil controlada**.

Diferente de interfaces genéricas de software, o PresCMed utiliza um sistema de elevação em camadas suaves com **física óptica direcional** (incidência superior sutil a 135°), conferindo relevo tátil, bordas chanfradas e profundidade sem qualquer excesso ou ruído visual.

### Princípios Cardeais
1. **Chrome Estrutural Equilibrado (Deep Navy na Sidebar e Navegação Inferior; Header Integrado)**: A navegação lateral (`Sidebar`) e a barra inferior mobile (`MobileBottomNav`) ancoram o sistema em tons profundos e serenos de Deep Navy nos dois temas. O `Header` superior adota superfície clara no tema claro (`bg-[var(--surface-card)]`) e escura no tema escuro, integrando-se suavemente ao canvas da aplicação. O logo atua como botão "Início" funcional (retorna à aba Receitas e rola ao topo), sem tagline decorativa.
2. **Dualidade Cirúrgica de Superfície**: No tema Claro, o fundo cirúrgico Clean Slate (`#F8FAFC`) acomoda cards em branco puro (`#FFFFFF`) com bordas delicadas (`#E2E8F0`). No tema Escuro, o ambiente adota Deep Slate acetinado (`#0F172A` / `#1E293B`), eliminando pretos abissais e garantindo percepção natural de sombra e relevo.
3. **Imutabilidade da Folha Médica A4**: A folha de impressão (`printable-a4-sheet`) simula papel físico real de 75-90g/m². É **sempre branca (#FFFFFF) com tipografia grafite/preta**, independentemente de o usuário operar em modo claro ou escuro.

---

## Colors

A paleta é fundamentada na autoridade institucional médica e no contraste acessível (WCAG AA):

- **Primary (`#1E3A8A`)**: Azul-marinho equilibrado para títulos de alta relevância e botões de ação principal.
- **Secondary (`#334155`)**: Slate neutro para bordas de contenção, ações secundárias e elementos de apoio.
- **Neutral (`#F8FAFC`)**: Canvas cinza cirúrgico claro que reduz o ofuscamento e confere visual límpido de consultório moderno.
- **Surface (`#FFFFFF`)**: Branco puro de alta definição para cards de prescrição, áreas de digitação e documentos.
- **Clinical (`#0F766E`)**: Verde azulado (Teal clínico) com contraste WCAG AA superior a 4.5:1 para confirmação de posologia, ações de envio e cálculos de dose.
- **Obsidian (`#0F172A`)**: Base Deep Slate do modo escuro. Absorve reflexos e preserva sombras e separação de planos.
- **Rose (`#BE123C`)**: Acento de alerta farmacêutico de alto contraste para interações de risco, exclusões e contraindicações.

---

## Typography

A tipografia do PresCMed é dual-engine e obedece a regras estritas de hierarquia textual:

1. **Plus Jakarta Sans (UI Engine)**:
   - Utilizada em toda a interface de aplicação, botões, modais, formulários de dosagem e dashboards.
   - Sua clareza geométrica nas pontuações, números e diacríticos em português assegura que frações, miligramas (mg) e volumes (mL/gotas) nunca sejam confundidos.
   - Pesos estruturais: `400` (corpo e posologias), `500`/`600` (rótulos e subtítulos) e `700` (títulos e doses de destaque).
   - **Títulos de Cartão em Sentence Case**: Títulos de cards e seções são redigidos em sentence case (apenas a primeira letra maiúscula, ex.: "Medicamentos prescritos", "Dados do paciente"). A caixa alta é reservada exclusivamente para rótulos curtos de seção e badges (ex.: "PRO", "SUS / RENAME", "1ª VIA FARMÁCIA").
   - **Sem Subtítulos Decorativos**: É vedado o uso de subtítulos meramente decorativos sob títulos de cards; mantêm-se apenas avisos regulamentares legais e orientações clínicas essenciais.

2. **Cormorant Garamond (Document Engine)**:
   - Reservada exclusivamente para a folha A4 e emissão de receituários, atestados e laudos impressos.
   - Evoca a tradição e solenidade dos receituários médicos clássicos brasileiros, conferindo elegância ao documento entregue ao paciente.

---

## Layout & Spacing

A arquitetura espacial obedece a uma grade rígida de 8px com micro-passos de 4px:

- **Sidebar de Navegação**: Largura fixa de `280px` com transição elástica suave, alinhamento simétrico rigoroso de ícones e botões, mantendo acabamento Deep Navy contínuo nos dois temas.
- **Header Superior**: Altura de `64px` (`h-16`) com alinhamento vertical central rigoroso. Superfície em `bg-[var(--surface-card)]` (clara no tema claro, escura no tema escuro). Contém o disparador do menu, o botão Início (logo sem tagline), chip central do paciente ativo e controles de tema e sincronização em nuvem à direita.
- **Breakpoint Mobile & MobileBottomNav**: Fixado em `1024px` (`lg`). Abaixo desse limite, a Sidebar é recolhida e a navegação migra para o `MobileBottomNav` ergonômico no rodapé da viewport, em acabamento Deep Navy, contendo exatamente 5 destinos (Receitas, Doses, Exames, Editor, Mais). O botão "Mais" abre a Sidebar como gaveta modal (`dialog`). A opção de exportar/backup fica alocada na Sidebar.
- **Contenção e Respiro**: Espaçamentos internos de cartões priorizam `24px` (`lg`) para isolar visualmente diferentes grupos medicamentosos e prescrições.

---

## Elevation & Depth

A profundidade no PresCMed utiliza **sombras táteis multicamadas com canal alfa suavizado**, declaradas em `@utility` para compor perfeitamente com os anéis de foco do Tailwind:

- **Sombras Táteis (Light)**:
  - `shadow-tactile-sm`: `0 2px 4px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`
  - `shadow-tactile-md`: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`
  - `shadow-tactile-card`: `0 10px 25px -4px rgba(15, 23, 42, 0.06), 0 4px 8px -2px rgba(15, 23, 42, 0.03)`
- **Sombras Táteis (Dark)**:
  - Anéis de luz sutil interna (`inset 0 1px 0 rgba(255, 255, 255, 0.05)`) combinados com oclusão profunda (`0 10px 25px -4px rgba(0, 0, 0, 0.5)`).
- **Campos Vazios**: Inputs no estado `:placeholder-shown` recebem microcavidade côncava com fundo sutil (`--surface-inset`).
- **Folha A4 Flutuante**: Sombra suave simulando papel físico sobre a bancada cirúrgica.

---

## Shapes

O vocabulário geométrico expressa segurança e precisão farmacêutica:

- **Contêineres e Cards (`14px` - `20px`)**: Curvatura balanceada que suaviza a tela sem perder a sensação estruturada de software clínico.
- **Inputs e Botões (`8px` - `14px`)**: Bordas definidas para rápido reconhecimento de áreas clicáveis e zonas de digitação.
- **Chips e Badges de Status (`9999px` - Full Pill)**: Formato pílula integral para selos de vias da receita (1ª via Farmácia / 2ª via Paciente), alertas da Portaria 344/98 e consentimento de CID-10.

---

## Components

Os botões, campos e cartões obedecem a uma hierarquia estrita de relevo e foco:

- **Uma Ação Primária por Área**: Cada bloco visual ou área de trabalho possui exatamente uma ação primária em destaque (ex.: botão Imprimir/PDF na barra de ações da receita `AcoesDaReceita.tsx`).
- **Botão Primário (`button-primary`)**: Azul-marinho profundo (`#1E3A8A`), texto branco, raio de 14px, relevo tátil com micro-compressão ao clique.
- **Botão Secundário / Outline (`button-secondary`)**: Fundo neutro com borda sutil (`#E2E8F0` / `#334155`) e texto em cinza escuro/claro. Ações em linhas de tabelas ou listas (como "Usar na receita" no catálogo SUS/RENAME) são obrigatoriamente secundárias.
- **Botão Clínico (`button-clinical`)**: Fundo Teal clínico (`#0F766E`) com texto branco para ações afirmativas de prescrição, dosagem e cálculos de conferência.
- **Botão de Risco (`button-danger`)**: Fundo rose escuro (`#BE123C`) com texto branco para deleções e suspensão de tratamentos.
- **Campos de Formulário e Placeholders**:
  - Todo placeholder deve obrigatoriamente iniciar com o prefixo "Ex.:" (ex.: "Ex.: Amoxicilina 500mg").
  - O estilo do placeholder é visualmente distinto do dado preenchido (cor `--text-placeholder`, peso 400).
  - Campo vazio (`:placeholder-shown`) assume fundo de microcavidade côncava `--surface-inset`.
- **Regra Sem Peso, Sem Dose**:
  - A calculadora pediátrica e os protocolos de urgência bloqueiam a exibição de doses ou volumes calculados até que o peso do paciente seja informado.
- **Folha de Impressão A4 (`printable-a4-sheet`)**: Base retangular branca de `210mm x 297mm`, margens regulamentares de 15mm a 20mm, cabeçalho médico com CRM/UF e rodapé sanitário.

---

## Do's and Don'ts

### Do's (Práticas Obrigatórias)
- **Do** manter o Header com fundo claro no tema claro (`bg-[var(--surface-card)]`) e escuro no escuro, reservando o Deep Navy para Sidebar e MobileBottomNav.
- **Do** manter a folha A4 e todo documento médico em fundo branco `#FFFFFF` e texto escuro, mesmo quando a aplicação estiver no modo escuro.
- **Do** escrever títulos de cartão em sentence case, utilizando caixa alta exclusivamente para rótulos curtos de seção e badges.
- **Do** limitar a interface a exatamente uma única ação primária por área ou card, configurando ações em linhas de listas ou tabelas como secundárias.
- **Do** iniciar placeholders de formulário obrigatoriamente com o prefixo "Ex.:", assegurando distinção visual imediata de campos já preenchidos.
- **Do** seguir rigorosamente o princípio "sem peso, sem dose", não exibindo doses ou volumes na calculadora pediátrica ou protocolos sem peso cadastrado.
- **Do** manter a Sidebar e o Header perfeitamente simétricos e alinhados verticalmente na cota de 64px (`h-16`).
- **Do** utilizar sempre o componente canônico `<Icon name="..." />` (`src/components/Icon.tsx`) para renderizar ícones baseados no Google Material Design Symbols.
- **Do** formatar números e medidas no padrão brasileiro (vírgula decimal, sem separador de milhar em doses em mg como "1000 mg", e singular "1 gota").
- **Do** declarar componentes dentro de `@layer components` e sombras em `@utility`, respeitando a diretiva de acessibilidade `prefers-reduced-motion`.
- **Do** assegurar contraste WCAG AA mínimo (4.5:1 para texto normal, 3:1 para UI) em qualquer elemento interativo.

### Don'ts (Práticas Proibidas)
- **Don't** aplicar fundo escuro ou azul profundo no Header no tema claro.
- **Don't** adicionar subtítulos decorativos sob títulos de cartão (manter exclusivamente avisos clínicos e legais regulamentares).
- **Don't** colocar mais de uma ação primária no mesmo bloco de trabalho ou card.
- **Don't** aplicar classes de modo escuro (`dark:bg-*` ou texto invertido) dentro da área de impressão A4.
- **Don't** escrever regras de CSS fora de camadas (`@layer`), para não anular a especificidade dos anéis de foco e acessibilidade.
- **Don't** utilizar pretos 100% saturados que eliminem o relevo e a profundidade de sombra dos menus e dropdowns no tema escuro.
- **Don't** emitir documentos médicos (PDF, impressão, WhatsApp, cópia) sem médico configurado com nome e CRM válidos.
- **Don't** utilizar dados fictícios de exemplo em documentos emitidos reais.
- **Don't** incluir código CID-10 em atestados sem o consentimento explícito do paciente registrado.
- **Don't** omitir a indicação obrigatória de via (1ª via Farmácia / 2ª via Paciente) em medicamentos controlados pela Portaria SVS/MS 344/98.

---

## Iconography

O sistema de ícones do PresCMed adota exclusivamente o padrão **Google Material Design Symbols**:

- **Distribuição**: 100% offline via pacote `material-symbols` (fonte woff2 de alta performance empacotada no PWA).
- **Componente Canônico**: `<Icon name="receita" size={20} />` (`src/components/Icon.tsx`).
- **Prevenção de Mutação**: O componente conta com tipagem estrita e resolução de aliases clínicos em português (`receita`, `medicamento`, `gotas`, `vacina`, `estetoscopio`, `balanca`, `exame`, `atestado`, `alerta`, `imprimir`, etc.).
- **Regra**: Nunca utilize classes de ícones soltas ou elementos SVG inline não padronizados.
