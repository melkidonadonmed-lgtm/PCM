---
name: PresCMed Design System
version: "alpha"
description: "Sistema de Prescrição Médica Digital ambulatorial brasileira. Interface física com iluminação óptica a 135°, Deep Navy nos painéis estruturais, canvas duplo (Clean Slate #F8FAFC no Claro e Deep Slate #0F172A no Escuro) e folha A4 clínica imutável."
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

Diferente de interfaces genéricas de software, o PresCMed utiliza um sistema de elevação em camadas suaves com **física óptica direcional** (incidência superior sutil), conferindo relevo tátil, bordas chanfradas e profundidade sem qualquer excesso ou ruído visual.

### Princípios Cardeais
1. **Chrome Estrutural Equilibrado (Deep Navy & Slate)**: A navegação (`Header`, `Sidebar`, `MobileBottomNav`) ancora o sistema em tons profundos e serenos, mantendo simetria absoluta entre ícones e rótulos.
2. **Dualidade Cirúrgica de Superfície**: No tema Claro, o fundo cirúrgico Clean Slate (`#F8FAFC`) acomoda cards em branco puro (`#FFFFFF`) com bordas delicadas (`#E2E8F0`). No tema Escuro, o ambiente adota Deep Slate acetinado (`#0F172A` / `#1E293B`), eliminando pretos abissais e garantindo percepção natural de sombra e relevo.
3. **Imutabilidade da Folha Médica A4**: A folha de impressão (`printable-a4-sheet`) simula papel físico real de 75-90g/m². É **sempre branca (#FFFFFF) com tipografia grafite/preta**, independentemente de o usuário operar em modo claro ou escuro.

---

## Colors

A paleta é fundamentada na autoridade institucional médica e no contraste acessível (WCAG AA):

- **Primary (`#1E3A8A`)**: Azul-marinho equilibrado para o Chrome de navegação, títulos de alta relevância e botões de ação principal.
- **Secondary (`#334155`)**: Slate neutro para bordas de contenção, subtítulos e ações complementares.
- **Neutral (`#F8FAFC`)**: Canvas cinza cirúrgico claro que reduz o ofuscamento e confere visual límpido de consultório moderno.
- **Surface (`#FFFFFF`)**: Branco puro de alta definição para cards de prescrição, áreas de digitação e documentos.
- **Clinical (`#0F766E`)**: Verde azulado (Teal clínico) com contraste WCAG AA superior a 4.5:1 para confirmação de posologia, ações de envio e cálculos de dose.
- **Obsidian (`#0F172A`)**: Base Deep Slate do modo escuro. Absorve reflexos e preserva sombras e separação de planos.
- **Rose (`#BE123C`)**: Acento de alerta farmacêutico de alto contraste para interações de risco, exclusões e contraindicações.

---

## Typography

A tipografia do PresCMed é dual-engine:

1. **Plus Jakarta Sans (UI Engine)**:
   - Utilizada em toda a interface de aplicação, botões, modais, formulários de dosagem e dashboards.
   - Sua clareza geométrica nas pontuações, números e diacríticos em português assegura que frações, miligramas (mg) e volumes (mL/gotas) nunca sejam confundidos.
   - Pesos estruturais: `400` (corpo e posologias), `500`/`600` (rótulos e subtítulos) e `700` (títulos e doses de destaque).

2. **Cormorant Garamond (Document Engine)**:
   - Reservada exclusivamente para a folha A4 e emissão de receituários, atestados e laudos impressos.
   - Evoca a tradição e solenidade dos receituários médicos clássicos brasileiros, conferindo elegância ao documento entregue ao paciente.

---

## Layout & Spacing

A arquitetura espacial obedece a uma grade rígida de 8px com micro-passos de 4px:

- **Sidebar de Navegação**: Largura fixa de `280px` com transição elástica suave e alinhamento simétrico rigoroso de ícones e botões.
- **Header Superior**: Altura de `68px` a `72px` com alinhamento vertical central e perfil profissional do médico emitente à direita.
- **Breakpoint Mobile**: Fixado em `1024px` (`lg`). Abaixo desse limite, a Sidebar é recolhida e a navegação migra para o `MobileBottomNav` ergonômico no rodapé da viewport.
- **Contenção e Respiro**: Espaçamentos internos de cartões priorizam `24px` (`lg`) para isolar visualmente diferentes grupos medicamentosos e prescrições.

---

## Elevation & Depth

A profundidade no PresCMed utiliza **sombras táteis multicamadas com canal alfa suavizado**:

- **Sombras Táteis (Light)**:
  - `shadow-tactile-sm`: `0 2px 4px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`
  - `shadow-tactile-md`: `0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)`
  - `shadow-tactile-card`: `0 10px 25px -4px rgba(15, 23, 42, 0.06), 0 4px 8px -2px rgba(15, 23, 42, 0.03)`
- **Sombras Táteis (Dark)**:
  - Anéis de luz sutil interna (`inset 0 1px 0 rgba(255, 255, 255, 0.05)`) combinados com oclusão profunda (`0 10px 25px -4px rgba(0, 0, 0, 0.5)`).
- **Folha A4 Flutuante**: Sombra suave simulando papel físico sobre a bancada cirúrgica.

---

## Shapes

O vocabulário geométrico expressa segurança e precisão farmacêutica:

- **Contêineres e Cards (`14px` - `20px`)**: Curvatura balanceada que suaviza a tela sem perder a sensação estruturada de software clínico.
- **Inputs e Botões (`8px` - `14px`)**: Bordas definidas para rápido reconhecimento de áreas clicáveis e zonas de digitação.
- **Chips e Badges de Status (`9999px` - Full Pill)**: Formato pílula integral para selos de vias da receita (1ª via Farmácia / 2ª via Paciente), alertas da Portaria 344/98 e consentimento de CID-10.

---

## Components

Os botões e cartões obedecem a uma hierarquia estrita de 3 variantes táteis determinísticas:

- **Botão Primário (`button-primary`)**: Azul-marinho profundo (`#1E3A8A`), texto branco, raio de 14px, relevo tátil com micro-compressão ao clique.
- **Botão Secundário / Outline (`button-secondary`)**: Fundo neutro com borda sutil (`#E2E8F0` / `#334155`) e texto em cinza escuro/claro.
- **Botão Clínico (`button-clinical`)**: Fundo Teal clínico (`#0F766E`) com texto branco para ações afirmativas de prescrição, dosagem e impressão.
- **Botão de Risco (`button-danger`)**: Fundo rose escuro (`#BE123C`) com texto branco para deleções e suspensão de tratamentos.
- **Folha de Impressão A4 (`printable-a4-sheet`)**: Base retangular branca de `210mm x 297mm`, margens regulamentares de 15mm a 20mm, cabeçalho médico com CRM/UF e rodapé sanitário.

---

## Do's and Don'ts

### Do's (Práticas Obrigatórias)
- **Do** manter a folha A4 e todo documento médico em fundo branco `#FFFFFF` e texto escuro, mesmo quando a aplicação estiver no modo escuro.
- **Do** padronizar botões em exatamente 3 estilos semânticos (Primary, Secondary/Outline, Clinical) com raio e elevação consistentes.
- **Do** manter a Sidebar e o Header perfeitamente simétricos e alinhados, com acabamento integrado à barra sem contrastes gritantes em botões de status.
- **Do** utilizar sempre o componente canônico `<Icon name="..." />` (`src/components/Icon.tsx`) para renderizar ícones baseados no Google Material Design Symbols.
- **Do** formatar números e medidas no padrão brasileiro (vírgula decimal, ex.: `7,5 mL` ou `1 gota/kg/dose`).
- **Do** assegurar contraste WCAG AA mínimo (4.5:1 para texto normal, 3:1 para UI) em qualquer elemento interativo.

### Don'ts (Práticas Proibidas)
- **Don't** misturar botões pretos, verdes, azuis e outlines sem hierarquia semântica na mesma linha de visão.
- **Don't** aplicar classes de modo escuro (`dark:bg-*` ou texto invertido) dentro da área de impressão A4.
- **Don't** utilizar pretos 100% saturados que eliminem o relevo e a profundidade de sombra dos menus e dropdowns no tema escuro.
- **Don't** sobrecarregar a interface com textos explicativos redundantes quando placeholders inteligentes cumprirem a função.
- **Don't** omitir a indicação obrigatória de via (1ª via Farmácia / 2ª via Paciente) em medicamentos controlados pela Portaria SVS/MS 344/98.
- **Don't** incluir código CID-10 em atestados sem o consentimento explícito do paciente registrado.

---

## Iconography

O sistema de ícones do PresCMed adota exclusivamente o padrão **Google Material Design Symbols**:

- **Distribuição**: 100% offline via pacote `material-symbols` (fonte woff2 de alta performance empacotada no PWA).
- **Componente Canônico**: `<Icon name="receita" size={20} />` (`src/components/Icon.tsx`).
- **Prevenção de Mutação**: O componente conta com tipagem estrita e resolução de aliases clínicos em português (`receita`, `medicamento`, `gotas`, `vacina`, `estetoscopio`, `balanca`, `exame`, `atestado`, `alerta`, `imprimir`, etc.).
- **Regra**: Nunca utilize classes de ícones soltas ou elementos SVG inline não padronizados.
