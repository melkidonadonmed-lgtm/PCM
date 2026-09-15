# Handoff Report — UI, Layout & Design System Audit (PresCMed)

**Agent ID**: `explorer_m5_2`  
**Archetype**: Explorer (Read-only Investigation)  
**Parent Agent**: `parent` (`96bf7919-06a5-4fb4-891b-d219cd1be1d5`)  
**Date**: 2026-09-15T02:05:00Z  
**Target Project**: PresCMed (`c:\Users\melki\projetos\pcm`)  

---

## 1. Observation

Durante a auditoria estática e estrutural de UI, layout, Design System (Tailwind CSS v4) e ergonomia do PresCMed, foram observados os seguintes pontos no código-fonte e configurações:

### 1.1 Paleta Cromática e Tokens de Design System (`AGENTS.md`)
- **Arquivo `src/index.css`**:
  - Linhas 44-77: Implementação correta dos tokens canônicos:
    - **Tema Claro**: `--bg-app: #F8FAFC`, `--surface-card: #FFFFFF`, `--surface-inset: #F1F5F9`. O tom terroso/lama (`#ECE3D4`) foi completamente erradicado das superfícies.
    - **Tema Escuro**: `--bg-app: #121824`, `--surface-card: #192130`, `--bg-surface-elevated: #202A3C`, `--surface-inset: #141C28`. Pretos absolutos (`#000000`, `#0A0F1A`) foram eliminados dos containers base.
    - **Chrome de Navegação**: `--surface-panel: #0C121A` (Deep Navy) e texto claro (`#F1F5F9` / `#CBD5E1`) aplicado consistentemente em `Header.tsx`, `Sidebar.tsx` e `MobileBottomNav.tsx`.
- **Arquivo `index.html` (Discrepâncias de Meta Theme Color)**:
  - Linha 18: `<meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)" />`
    *Observação*: Aponta para `#0F172A` (slate-900) em vez do token canônico escuro `#121824`.
  - Linha 19: `<meta name="theme-color" content="#F9F6F0" media="(prefers-color-scheme: light)" />`
    *Observação*: Aponta para o creme antigo `#F9F6F0` em vez do Hospitalar Límpido `#F8FAFC`.
- **Arquivo `src/components/MedicationSearchDialog.tsx` (Inconsistência de Superfície)**:
  - Linha 59: `dark:bg-slate-900`
    *Observação*: Utiliza Slate-900 (`#0F172A`) em vez de Grafite Ardósia (`#192130` / `var(--surface-card)`).

### 1.2 Diretriz de Botões e Acabamento Tátil
- **Arquivo `src/index.css`**:
  - Linhas 640-705: As classes `.btn-tactile-primary`, `.tactile-btn-primary` e `.clinical-button` declaram explicitamente `border: none !important;`. No tema escuro, adotam acabamento nobre Creme/Baunilha (`linear-gradient(180deg, #FFFFFF 0%, #EFE7DA 100%)`) com tipografia escura (`#1C160C`) e elevação óptica aveludada. No tema claro, gradiente Navy elegante (`linear-gradient(180deg, #1E4F7A 0%, #143857 100%)`) com texto branco.
  - Botões secundários (`.btn-tactile-secondary`, etc.) utilizam `border: 1px solid transparent` com fundos sutis (`rgba(255,255,255,0.06)` no escuro / `rgba(0,0,0,0.04)` no claro), sem contornos grosseiros.

### 1.3 Violações da Regra de Erradicação de "Blobs" Saturados
O `AGENTS.md` estipula:
> *"Proibido o uso de pílulas/caixas com fundos semi-transparentes saturados e bordas destacadas (`bg-emerald-500/15 border-emerald-500/30`, etc.). Substituir sempre por tipografia limpa acompanhada de micro-pontos de status (dots de 6px) ou badges em tom neutro suave."*

Foram detectadas violações diretas:
1. **`src/components/CidSearchBar.tsx`**:
   - Linha 383:
     ```tsx
     <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
     ```
     *Observação*: Violação literal do exemplo citado na regra.
2. **`src/components/CertificateAndReferral.tsx`**:
   - Linhas 340 e 358: Círculos de etapas concluídas no stepper utilizam `bg-emerald-500/20 text-emerald-600 dark:text-emerald-400`.
3. **`src/components/MedicationSelectionModal.tsx`**:
   - Linha 352: Card de medicamento selecionado utiliza `border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/25 shadow-md`.
4. **`src/components/MedicationPresentationModal.tsx`**:
   - Linha 453: Apresentação selecionada utiliza `border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20 shadow-sm`.

### 1.4 Ergonomia Touch e Alvos Interativos (< 44x44px)
- Em `src/index.css`, a regra de garantia de 44px (linha 761) está restrita por escopo:
  ```css
  .prescription-workspace :is(button, [role="button"]) {
    min-height: 44px;
  }
  ```
  Isso protege apenas `PrescriptionBuilder.tsx`. Fora desse contêiner, múltiplos elementos falham o critério de acessibilidade móvel (WCAG 2.5.5 / 2.5.8 >= 44x44px):
  1. **`src/components/CidSearchBar.tsx`**:
     - Linha 391: `<button className="... min-h-[36px] ...">` (Botão "Inserir" em modo encaminhamento).
     - Linha 442: `<button className="... min-h-[36px] ...">` (Botão "Concluir seleção").
     - Linha 455: `<summary className="... min-h-[36px] ...">` (Accordion de atalhos rápidos).
     - Linha 468: `<button className="... min-h-[38px] ...">` (Chips diagnósticos rápidos).
  2. **`src/components/CertificateAndReferral.tsx`**:
     - Linhas 381 e 390: Botões de navegação do stepper declaram `min-h-[38px]`.
     - Linha 1083: Botão de remoção de CID declara `p-0.5` com ícone de 12px (`w-3 h-3`), gerando área de toque de aproximadamente 16x16px.
     - Linha 1114: Chips de sugestões diagnósticas da especialidade declaram `min-h-[38px]`.
  3. **`src/components/MedicationSearchDialog.tsx`**:
     - Linha 34: Botão de inserção rápida `<button className="min-h-[36px] ...">` ("Inserir" no resultado mobile).
  4. **`src/components/MedicationSelectionModal.tsx`**:
     - Linha 230: Botão de limpar busca com `min-w-[32px] min-h-[32px]`.
     - Linha 290: Chips de filtro por classe terapêutica com `min-h-[32px]`.
  5. **`src/components/MedicationPresentationModal.tsx`**:
     - Linha 339: Botão `+ Informar Peso` declara `min-h-[36px]`.
     - Linhas 553, 564, 584, 608: Campos de entrada (inputs) do passo 2 declaram `min-h-[40px]`.

### 1.5 Mobile Responsiveness e Safe Area
- **`index.html`**: Linha 5 declara `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`.
- **`src/index.css`**: Define utilitários `@utility pb-safe`, `@utility h-mobile-nav`, `@utility pb-mobile-container`, e `@utility pb-sidebar-safe` utilizando `env(safe-area-inset-bottom, 0px)`.
- **`src/components/MobileBottomNav.tsx`**: Utiliza `h-mobile-nav pb-safe` com botões em `min-h-[48px] h-12`.
- **`src/App.tsx`**: O elemento `<main>` recebe `pb-mobile-container lg:pb-6` (`calc(4.5rem + env(safe-area-inset-bottom, 0px))`), prevenindo qualquer sobreposição de conteúdo pela barra de navegação inferior.
- **`src/components/Sidebar.tsx`**: Em viewports < 1024px, opera como drawer/modal com `inert` quando fechada; em >= 1024px, atua como rail lateral de 72px.

### 1.6 Integridade da Folha A4 nos Documentos Médicos
- **`src/components/PrintPreview.tsx`**: O container da folha `#printable-a4-sheet` (linhas 131-152) define inline `style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}` com bordas `#0F172A` e `#1E4F7A`. Nenhum token de dark mode contamina o conteúdo da folha.
- **`src/components/PrescriptionPages.tsx`**: Utiliza `.rx-page` com `background: #fff; color: #141414;` e posicionamento rígido em milímetros.
- **`src/index.css`**: O bloco `@media print` força `html, body { background: #FFFFFF !important; color: #0F172A !important; }` e oculta todo o chrome da aplicação (`#prescmed-header`, `#sidebar-nav`, `#mobile-bottom-nav`, etc.).

---

## 2. Logic Chain

1. **Premissa de Design System e Cores**: O `AGENTS.md` exige Hospitalar Límpido (`#F8FAFC`) no tema claro e Grafite Ardósia Aveludado (`#121824`, `#192130`, `#202A3C`) no tema escuro.
   - *Ligação com Observação 1.1*: O CSS principal segue a regra, mas `index.html` e `MedicationSearchDialog.tsx` mantêm resquícios do tema legado (`#F9F6F0` e `dark:bg-slate-900`), o que causa quebra sutil na barra de status do navegador móvel e no modal de busca.
2. **Premissa de Botões e Blobs**: O `AGENTS.md` proíbe expressamente contornos duros em botões primários e pílulas translúcidas saturadas (`bg-emerald-500/15 border-emerald-500/30`).
   - *Ligação com Observação 1.2 e 1.3*: Enquanto os botões primários e secundários foram devidamente refatorados para o padrão tátil sem bordas, `CidSearchBar.tsx:383` preservou exatamente a string proibida pela diretriz. Da mesma forma, os modais de seleção de medicamentos ainda utilizam contornos saturados (`bg-sky-500/10 ring-2 ring-sky-500/25`) que destoam do acabamento tátil fosco da aplicação.
3. **Premissa de Ergonomia Touch**: As diretrizes do projeto e os critérios WCAG 2.5.5 / 2.5.8 exigem que alvos de interação em interfaces móveis tenham no mínimo 44x44px.
   - *Ligação com Observação 1.4*: A regra global de 44px foi restrita a `.prescription-workspace`. Fora dela (em `CidSearchBar`, `CertificateAndReferral` e nos modais), existem diversos botões e chips com 32px a 38px, e o botão de exclusão de CID com ~16x16px, gerando alto risco de miss-tap em smartphones hospitalares.
4. **Premissa de Não-Regressão na Impressão**: Os documentos médicos (receitas simples, controle especial, antimicrobianos, exames, atestados) devem ser renderizados estritamente em fundo branco com tipografia escura, sem interferência do tema da aplicação.
   - *Ligação com Observação 1.6*: Tanto o HTML preview quanto os estilos de impressão (`@media print`) respeitam essa segregação com cores hexadecimais explícitas e isolamento de tema.

---

## 3. Caveats

1. **Modo Read-Only**: Por ser uma investigação estritamente analítica (explorer), nenhuma alteração de código foi aplicada diretamente aos arquivos de `src/` ou `index.html`.
2. **Dispositivos Físicos Específicos**: Os cálculos de safe area (`env(safe-area-inset-bottom)`) foram validados via código e especificações CSS; variações específicas de navegadores legados sem suporte a CSS Environment Variables dependem dos fallbacks declarados (0px).
3. **Verificação de Runtime**: O build do Vite e a tipagem TypeScript foram analisados estaticamente; testes dinâmicos de interação em browser real estão delegados aos milestones M6/M7.

---

## 4. Conclusion

O PresCMed apresenta excelente maturidade técnica e sólida adesão aos princípios arquiteturais do `AGENTS.md`. As fundações de layout (Vite 6, Tailwind v4, safe area mobile, navegação desatada e segregação de folha A4) estão íntegras e robustas.

No entanto, para alcançar conformidade visual plena e excelência ergonômica, são necessárias as seguintes correções pontuais:

### Propostas de Correção (Actionable Recommendations)

#### A. Harmonização de Cores e Tokens
1. **`index.html` (linhas 18-19)**:
   ```html
   <!-- Antes -->
   <meta name="theme-color" content="#0F172A" media="(prefers-color-scheme: dark)" />
   <meta name="theme-color" content="#F9F6F0" media="(prefers-color-scheme: light)" />

   <!-- Proposta -->
   <meta name="theme-color" content="#121824" media="(prefers-color-scheme: dark)" />
   <meta name="theme-color" content="#F8FAFC" media="(prefers-color-scheme: light)" />
   ```
2. **`src/components/MedicationSearchDialog.tsx` (linha 59)**:
   Substituir `dark:bg-slate-900` por `dark:bg-[var(--surface-card)]` ou `dark:bg-[#192130]`.

#### B. Erradicação de Blobs Saturados
1. **`src/components/CidSearchBar.tsx` (linhas 383-386)**:
   Substituir a pílula saturada com borda por tipografia limpa e micro-ponto de 6px:
   ```tsx
   {/* Antes */}
   <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
     <Check className="w-3.5 h-3.5" />
     Selecionado
   </span>

   {/* Proposta */}
   <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
     Selecionado
   </span>
   ```
2. **`src/components/MedicationSelectionModal.tsx` (linha 352)** e **`MedicationPresentationModal.tsx` (linha 453)**:
   Substituir anéis saturados (`ring-2 ring-sky-500/25`) por realce tátil suave e neutro com indicador micro-dot de seleção ativa.

#### C. Ergonomia Touch (Expansão Global para >= 44x44px)
1. **`src/index.css` (linha 761)**:
   Expandir a garantia de altura mínima de 44px para cobrir todas as áreas interativas móveis:
   ```css
   /* Antes */
   .prescription-workspace :is(button, [role="button"]) {
     min-height: 44px;
   }

   /* Proposta */
   :is(.prescription-workspace, .clinical-workspace, [role="dialog"], .stepper-nav) :is(button, [role="button"], summary) {
     min-height: 44px;
   }
   ```
2. **`src/components/CertificateAndReferral.tsx` (linha 1083)**:
   Aumentar a área de clique do botão de exclusão do CID:
   ```tsx
   {/* Antes */}
   <button onClick={() => handleRemoveCid(item.code)} className="p-0.5 hover:bg-red-500/20 rounded">
     <X className="w-3 h-3 text-red-500" />
   </button>

   {/* Proposta: Padding ergonômico mantendo o ícone discreto */}
   <button onClick={() => handleRemoveCid(item.code)} className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center -mr-2 rounded hover:bg-red-500/10 active:bg-red-500/20" title="Remover CID">
     <X className="w-4 h-4 text-red-500" />
   </button>
   ```
3. **Ajustar chips e botões rápidos em `CidSearchBar.tsx` e modais**:
   Garantir `min-h-[44px]` nos botões de inserção e conclusão, e padding touch expandido nos chips de categorias.

---

## 5. Verification Method

Para verificar de forma independente e reproduzível os achados desta auditoria:

1. **Conformidade de Tipos e Build**:
   ```bash
   npm run lint   # Deve executar `tsc --noEmit` retornando exit code 0
   npm run build  # Deve compilar o bundle Vite sem warnings de imports quebrados
   ```
2. **Inspeção de Pílulas/Blobs Saturados**:
   Grep no repositório buscando ocorrências do padrão proibido:
   ```bash
   # Procurar padrões como bg-emerald-500/15 ou border-emerald-500/30
   rg "bg-emerald-500/15" src/
   ```
   *Resultado esperado*: Linha 383 de `src/components/CidSearchBar.tsx` deve ser confirmada.
3. **Inspeção de Alvos de Toque (< 44px)**:
   Grep buscando botões com alturas inferiores a 44px:
   ```bash
   rg "min-h-\[(32|36|38|40)px\]" src/components/
   ```
   *Resultado esperado*: Confirmação das ocorrências documentadas na Seção 1.4.
4. **Inspeção da Folha A4 em Modo Escuro**:
   Executar `npm run dev`, acessar `http://localhost:3000`, ativar o tema Escuro, navegar até a aba `PrintPreview` e inspecionar o elemento `#printable-a4-sheet` no DevTools.
   *Critério de Sucesso*: O fundo da folha deve permanecer estritamente `#FFFFFF` com texto `#0F172A`, sem inversão acidental de contraste.
