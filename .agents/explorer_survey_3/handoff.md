# Relatório de Handoff — Explorer 3 (Survey: Design System, Ergonomia Touch e Acessibilidade)

## 1. Observation

Durante a investigação exaustiva do Design System, Ergonomia Touch e Acessibilidade Mobile para os Requisitos R3 e R4, foram examinados minuciosamente `src/index.css` e todos os componentes da aplicação (`src/components/*` e `src/App.tsx`). A verificação de tipagem via `npm run lint` (`tsc --noEmit`) executou com sucesso (código 0, zero erros).

Abaixo estão as observações concretas, com caminhos de arquivo, números de linha e classes CSS exatas:

### A. Botões Primários com Bordas Duras / Contornos Grosseiros (`border: ...` que violam `border: none`)
1. **`src/components/CertificateAndReferral.tsx`**:
   - Linhas 287 e 302: Subtabs ativas de atestado e encaminhamento utilizam `border border-navy-800 dark:border-white/30`.
   - Linha 443: Chips de dias de repouso selecionados utilizam `border-sky-600`.
   - Linha 729: Chip de especialidade selecionado utiliza `border-emerald-500`.
   - Linhas 765, 767, 768: Botões de prioridade de encaminhamento (Urgente, Alta, Normal) ativos aplicam `border-rose-600`, `border-amber-600`, `border-emerald-600`.
2. **`src/components/Sidebar.tsx`**:
   - Linhas 235 e 270: `renderNavButton` ativo com `border border-white/20` e `dark:border-white/30`.
   - Linhas 361 e 392: Botão de CRM e badge ativo com `border border-white/15 dark:border-white/25`.
3. **`src/components/PediatricCalculator.tsx`**:
   - Linha 570: Chips de preset de peso ativos com `border-emerald-400`.
   - Linha 618: Chips de categoria clínica ativos com `border-navy-800 dark:border-white/30`.
4. **`src/components/ExamRequester.tsx`**:
   - Linha 296: Chips de categoria de exames ativos com `border-navy-800 dark:border-white/30`.
   - Linha 326: Linha de exame selecionada com `border border-navy-900/30 dark:border-cream-100/30`.
5. **`src/components/PrintPreview.tsx`**:
   - Linhas 461, 476, 492, 507, 522: Abas de tipos de documentos ativas com `border-navy-800 dark:border-white/30`.
   - Linhas 593 e 606: Seletor de via (1ª e 2ª via) com `border-rose-600` e `border-sky-600`.
   - Linhas 663, 676, 689: Filtros de exames com `border-navy-800`, `border-emerald-600`, `border-sky-600`.
6. **`src/components/MedicationSelectionModal.tsx` & `src/components/MedicationPresentationModal.tsx`**:
   - `MedicationSelectionModal.tsx` Linha 256 (`border-navy-800 dark:border-white/30`) e Linha 290 (`border-sky-600`).
   - `MedicationPresentationModal.tsx` Linhas 358 e 380 (`border-sky-500`, `border-emerald-500`).
7. **`src/components/CidSearchBar.tsx`**:
   - Linha 417: Chips de seleção rápida de CID (Quick Picks) ativos com `border-sky-600`.

---

### B. Pílulas e Caixas Translúcidas Saturadas ("Blobs")
1. **`src/components/Header.tsx`**:
   - Linha 121: Badge do paciente ativo com `bg-emerald-500/20 text-emerald-300 border-emerald-500/40`.
2. **`src/components/Sidebar.tsx`**:
   - Linha 421: Badge de status do paciente com `bg-emerald-500/20 text-emerald-400`.
   - Linha 447: Botão do paciente recolhido com `bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30`.
3. **`src/components/MedicationSelectionModal.tsx`**:
   - Linha 267: Badge de peso informado com `bg-emerald-500/10 border border-emerald-500/20`.
4. **`src/components/MedicationPresentationModal.tsx`**:
   - Linha 338: Botão "+ Informar Peso" com `bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30`.
5. **`src/components/PediatricCalculator.tsx`**:
   - Linha 745: Tag de faixa etária/dose com `bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20`.
   - Linha 765: Alerta clínico com `bg-amber-500/10 border border-amber-500/20`.
   - Linhas 801 e 890: Caixas de ícones informativos com `bg-cyan-500/10 border border-cyan-500/20` e `bg-amber-500/10 border border-amber-500/20`.
6. **`src/components/ExamRequester.tsx`**:
   - Linha 408: Tag de modalidade com `bg-indigo-500/10 text-indigo-600 dark:text-indigo-400`.
   - Linha 460: Badge de pacote de exames com `bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20`.
7. **`src/components/PrescriptionReview.tsx`**:
   - Linha 155: Tag de controle especial C1 com `bg-amber-500/20 text-amber-700 dark:text-amber-300`.
   - Linha 211: Banner de validação com `bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25`.
8. **`src/components/QuantityAssistant.tsx`**:
   - Linha 136: Caixa de sugestão de frascos com `bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30`.
9. **`src/components/PrintPreview.tsx`**:
   - Linha 484: Tag informativa de 2 vias com `bg-rose-500/20 text-rose-300`.
10. **`src/components/CidSearchBar.tsx`**:
    - Linha 341: Botão inline "+ Inserir" com `bg-emerald-600/20 text-emerald-500`.
11. **`src/components/PrescriptionBuilder.tsx`**:
    - Linha 1367: Botão de exclusão com `bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900`.
    - Linha 1557: Alerta clínico com `bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/25`.
    - Linhas 1750 e 1755: Badges de via de administração com `bg-emerald-50 border-emerald-200` e `bg-amber-50 border-amber-200`.

---

### C. Alvos de Toque no Mobile (< 44x44px) e Suporte a Safe Area
1. **Ausência de Definição de `pb-safe` em `src/index.css`**:
   - Em `MobileBottomNav.tsx` (linha 43), a classe `pb-safe` é declarada, mas **não existe** em `src/index.css` nem no Tailwind v4 padrão. O resultado é a ausência de espaçamento inferior dinâmico para a Home Indicator bar em iPhones e dispositivos móveis modernos.
2. **`src/components/PrescriptionBuilder.tsx`**:
   - Linhas 858-879: Switcher mobile de abas (Catálogo / Receita) declarado com `py-2 rounded-lg text-xs` (~32px de altura).
   - Linha 1047: Botão "Trocar" declarado explicitamente como `min-h-[40px]`.
   - Linhas 1354, 1367, 1378: Ações em lote ("Selecionar Todos" texto de ~20px, "Excluir Selecionados" `py-1` ~26px, "Limpar Tudo" texto de ~22px).
   - Linhas 1461 e 1469: Botões inline de edição "Salvar" e "Cancelar" com `py-1` (~26px).
   - Linhas 1570, 1580, 1590, 1600: Botões de ação rápida de item (Editar, Subir, Descer, Excluir) utilizam `p-2 rounded-lg` com ícones de 16px, totalizando alvos de 32x32px.
   - Linha 1697: Seletor de páginas da receita simulada com `py-1` (~26px).
3. **`src/components/PediatricCalculator.tsx`**:
   - Linha 665: Botão de adicionar medicamento da tabela (`py-1.5` ~30px).
   - Linha 712: Abas de função renal (`py-1.5` ~30px).
   - Linha 909: Abas de faixa etária para cálculo calórico/dieta (`py-1.5` ~30px).
4. **`src/components/ExamRequester.tsx`**:
   - Linha 271: Botão "+" de adicionar exame avulso (~34px).
   - Linhas 319-357: Linhas clicáveis do catálogo de exames (~36px de altura).
   - Linha 378: Botão "Limpar Tudo" (link texto ~22px).
   - Linha 468: Botão "X" de fechar modal de pacotes de exames (`p-1` ~24x24px).
   - Linhas 528 e 535: Botões de rodapé do modal de pacotes (`py-2` ~34px).
5. **`src/components/CertificateAndReferral.tsx`**:
   - Linha 882: Chips de sugestão rápida de CID para especialidade (`py-1` ~26px).
6. **`src/components/ClinicalProtocolsView.tsx`**:
   - Linha 233: Pílulas de filtro de categoria declaradas como `min-h-[40px]`.
   - Linha 335: Botões individuais de prescrição no deck com `min-h-[38px]`.
7. **`src/components/PrintPreview.tsx`**:
   - Linhas 388, 404, 416, 429: Botões da barra de ação declarados como `h-10 sm:h-11`. Em telas mobile (`<640px`), `h-10` equivale a 40px (< 44px).
   - Linhas 591 e 603: Seletor de 1ª/2ª via (`py-1.5` ~30px).
   - Linhas 624 e 633: Botões de navegação de página anterior/próxima (`p-1.5` = 28x28px).
   - Linhas 661, 673, 687: Chips de filtro de exames (`py-1.5` ~30px).
8. **Modais e Diálogos (`PatientModal.tsx`, `DoctorProfileModal.tsx`, `MedicationSelectionModal.tsx`, `MedicationPresentationModal.tsx`, `ConfirmationModal.tsx`, `CidSearchBar.tsx`)**:
   - Botões de fechar "X" em todos os modais variam entre 24x24px e 36x36px.
   - Ações secundárias internas ("Apresentações", "Fechar", "Adicionar Direto", "Trocar", "Limpar") operam com `py-1` ou `min-h-[36px]`.

---

### D. Consistência Cromática nos Temas Claro e Escuro
1. **`src/index.css`**:
   - Linhas 743-751 (Tema Claro): O `body` injeta `radial-gradient(...)` com paradas `#FCF9F3`, `#F8F3EA`, `#EFE7DA`. Esse degradê introduz uma textura amarelada/creme tipo pergaminho que contraria o padrão hospitalar límpido pretendido (`--bg-app: #F8FAFC`).
   - Linhas 753-761 (Tema Escuro): O degradê do `body` atinge `#0A0E17`, um preto denso e pesado que fere a diretriz de grafite ardósia aveludado (`--bg-app: #121824`, `--surface-card: #192130`, `--bg-surface-elevated: #202A3C`).
   - Linhas 864-876: A calha da barra de rolagem (`--scrollbar-track-color: #EFE8D4`) adota tom amarelado/lama no modo claro.
2. **Cores Terrosas e Pretos Hardcoded nos Modais**:
   - `PatientModal.tsx`, `DoctorProfileModal.tsx`, `MedicationSelectionModal.tsx`, `MedicationPresentationModal.tsx` utilizam `border-[#E3D7BD]` (vanilla-300 terroso) e cabeçalhos em `#F8F4EC` no tema claro; no tema escuro, utilizam `#0E1420` em vez das variáveis semânticas de elevação (`var(--surface-card)` / `var(--bg-surface-elevated)`).
   - `Header.tsx` (linha 45) e `Sidebar.tsx` (linha 318) contêm referências a `#0A0F18` hardcoded em vez de `var(--surface-panel)` (`#0C121A`).

---

### E. Integridade da Folha A4 em `PrintPreview.tsx`
- **Inspeção de `src/components/PrintPreview.tsx` (linhas 707-719)**:
  - O container raiz `#printable-a4-sheet` e seus filhos aplicam estritamente `backgroundColor: '#FFFFFF'` e `color: '#0F172A'`.
  - Não há nenhuma classe `dark:` dentro do documento físico de impressão.
  - As regras `@media print` em `src/index.css` (linhas 962-970 e 990-1007) forçam `background: white !important; color: black !important;`.
  - **Conclusão de Integridade**: A folha permanece 100% branca com texto preto/escuro de alto contraste em ambos os temas, sem contaminação pelo modo escuro.

---

## 2. Logic Chain

1. **Premissa de Botões Táteis (R4)**:
   - A diretriz em `AGENTS.md` proíbe contornos duros em botões primários (`border: none`), exigindo elevação por sombra tátil e acabamento nobre.
   - Observação 1.A revelou que múltiplos componentes ainda adicionam bordas duras (`border-navy-800`, `border-sky-600`, `border-emerald-500`, etc.) aos estados ativos.
   - Portanto, a remoção das classes de borda dura e o uso exclusivo de elevação por sombras suaves e preenchimento sólido sem contorno alinham a interface às diretrizes canônicas.

2. **Premissa de Erradicação de "Blobs" Translúcidos (R4)**:
   - A diretriz em `AGENTS.md` proíbe o uso de pílulas saturadas com transparência (`bg-emerald-500/15 border-emerald-500/30`, etc.), determinando a substituição por tipografia limpa acompanhada de micro-pontos de status (dots de 6px).
   - Observação 1.B catalogou 11 pontos com caixas semi-transparentes saturadas que causam poluição visual.
   - Logo, substituir essas caixas por tipografia neutra acompanhada de um elemento indicador `span className="w-1.5 h-1.5 rounded-full bg-..."` proporciona elegância e clareza clínica imediata.

3. **Premissa de Ergonomia Touch e Alvos Mínimos (R3)**:
   - O padrão WCAG 2.2 (Target Size 2.5.8) e o uso clínico hospitalar sob estresse exigem alvos de toque mínimos de 44x44px no mobile.
   - Observação 1.C identificou que botões centrais de fluxo (reordenação de itens, paginação, fechamento de modais e ações em lote) possuem alturas entre 22px e 40px.
   - Portanto, a adoção de `min-h-[44px] min-w-[44px]` (ou compensação com padding aumentado `p-2.5` / `p-3`) nos pontos mapeados elimina toques acidentais e melhora a precisão operacional.

4. **Premissa de Suporte à Safe Area (R3)**:
   - O componente `MobileBottomNav.tsx` depende da classe `pb-safe`.
   - Observação 1.C.1 constatou que `pb-safe` não existe no CSS do projeto.
   - Logo, adicionar `@utility pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }` em `src/index.css` é indispensável para evitar que a barra de navegação seja encoberta pelo indicador de início em dispositivos iOS e Android.

5. **Premissa de Coerência Cromática (R4)**:
   - A especificação canônica define a paleta Light como Hospitalar Límpida (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`) sem tons de lama/terrosos (`#ECE3D4`), e a paleta Dark como Grafite Ardósia Aveludado (`#121824`, `#192130`) sem pretos densos opressivos (`#0A0E17`).
   - Observação 1.D revelou que o `body` em `src/index.css` e os modais aplicam gradientes amarelados e fundos pretos densos hardcoded.
   - A substituição desses degradês pelas variáveis semânticas de fundo e elevação restaura a uniformidade visual do sistema.

---

## 3. Caveats

- **Modo Estritamente Read-Only**: Nenhuma alteração foi realizada nos arquivos do código-fonte (`src/`) nesta fase investigativa, respeitando a responsabilidade do Explorer.
- **Intocabilidade da Folha A4**: O documento médico impresso (`#printable-a4-sheet`) deve permanecer estritamente isolado de modificações visuais do tema dark, garantindo conformidade sanitária plena (Portaria 344/98 e RDC 20/2011).
- **Inexistência de Testes Automatizados Unitários**: O projeto não dispõe de frameworks como Vitest ou Jest; a verificação automatizada de conformidade de código apoia-se em `npm run lint` (`tsc --noEmit`), devendo a validação de layout ser inspecionada visualmente no navegador.

---

## 4. Conclusion

A infraestrutura visual de PresCMed é altamente funcional e bem estruturada, porém necessita de intervenções pontuais para atingir a conformidade estrita com os Requisitos R3 e R4:
1. **Acessibilidade Touch (R3)**:
   - Declarar `@utility pb-safe` em `src/index.css`.
   - Expandir a área interativa para `min-h-[44px] min-w-[44px]` nos botões de toolbar de `PrintPreview`, reordenação de `PrescriptionBuilder`, seletores de via, botões "X" de modais e ações em lote.
2. **Design System & Botões (R4)**:
   - Eliminar classes `border` dos botões e chips primários ativos, utilizando sombras suaves para elevação tátil.
   - Converter os 11 pontos de "blobs" translúcidos em tipografia limpa acompanhada de micro-pontos de status (dots de 6px).
3. **Consistência Cromática (R4)**:
   - Harmonizar os gradientes do `body` em `src/index.css` para refletir o canvas hospitalar límpido no modo claro e o grafite ardósia aveludado no modo escuro.
   - Substituir cores hardcoded em modais (`#E3D7BD`, `#0E1420`, `#0A0F18`) pelas variáveis semânticas de superfície e elevação.
4. **Integridade da Folha A4**:
   - 100% preservada e validada como folha física branca com alto contraste.

---

## 5. Verification Method

Para verificar de forma independente as conclusões deste relatório:
1. **Verificação de Compilação e Tipagem**:
   ```bash
   npm run lint
   ```
   Deve retornar código de saída 0 sem erros de TypeScript.
2. **Inspeção de Classes e Tokens CSS**:
   - Executar busca por `pb-safe` em `src/index.css` para constatar a sua ausência atual e validar sua futura adição.
   - Executar busca por `#ECE3D4`, `#E3D7BD` e `#0A0E17` no repositório para certificar os pontos de eliminação.
3. **Inspeção de Alvos de Toque no Navegador**:
   - Executar `npm run dev` e inspecionar os elementos móveis no Chrome DevTools com viewport de 375x667px (iPhone SE).
   - Validar que a barra inferior possui padding de segurança e que todos os alvos clicáveis possuem ao menos 44x44px de área de toque.
4. **Condição de Invalidação**:
   - Se qualquer modificação futura alterar as cores internas de `#printable-a4-sheet` ou introduzir fundo escuro na folha de impressão, a implementação deve ser imediatamente revertida.
