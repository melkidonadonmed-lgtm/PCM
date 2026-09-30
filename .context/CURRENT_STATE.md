# PresCMed — CURRENT STATE (.context)

## Fase Atual: v2.0.4 (Modo Rápido de Prescrição & Quantidade Total de Comprimidos)

O sistema foi otimizado para o fluxo ambulatorial real brasileiro, eliminando menções burocráticas a "caixa" ou "frasco" para medicamentos sólidos, passando a definir e calcular a quantidade total de comprimidos a dispensar:

- **Modo Rápido de Prescrição Integrado (`PrescriptionBuilder.tsx`):**
  - Card ergonômico no construtor com 4 seletores clínicos baseados no modelo do Google Forms:
    1. *Dose por tomada* (1, 2, 0.5, etc.)
    2. *Apresentação / Unidade* (comp, caps, gotas, mL, sachê, jato, ampola, aplicação)
    3. *Horários / Frequência* (8/8h, 12/12h, 6/6h, 4/4h, 24h, Manhã, Noite, Dose Única, S.O.S)
    4. *Duração do tratamento* (3, 5, 7, 10, 14, 30 dias ou Uso Contínuo)
  - Cálculo instantâneo da quantidade total de comprimidos e geração determinística de posologia médica textual pronta para a receita.
- **Quantidade Total a Dispensar Sem Caixa:**
  - O campo de quantidade foi ajustado para foco na quantidade total de comprimidos (ex.: `15 comprimidos`, `30 comprimidos`).
  - Adicionadas pílulas táteis de 1 toque: `10 comp`, `14 comp`, `15 comp`, `20 comp`, `30 comp`, `60 comp`.
- **Limpeza do Catálogo Farmacêutico (`medicationDatabase.ts`):** 111 medicamentos com formato legado "1 caixa (X comprimidos)" convertidos diretamente para a quantidade total de comprimidos/cápsulas.
- **Utilitário de Prescrição Rápida (`src/utils/prescricaoRapida.ts`):**
  - Funções de cálculo `calcularPrescricaoRapida`, `getTomadasPorDia` e formatação de unidades com concordância gramatical em pt-BR.
- **Blindagem no PDF e Editor Livre (`pdfGenerator.ts` e `DocumentEditorView.tsx`):**
  - Eliminação de repetições redundantes entre a apresentação e a quantidade total na linha do medicamento.

---

## Decisões Tomadas
1. **Dispensação por Unidade Total:** Atender à prática ambulatorial e dispensação de farmácias e SUS, onde o que importa é o total de comprimidos receitados, não o tamanho da caixa comercial.
2. **Sincronização Bidirecional sem Bloqueio:** O médico pode usar o construtor rápido para preencher automaticamente ou editar livremente a quantidade e posologia sem atrito.
3. **Pluralização Gramatical Estrita:** Concordância correta de singular e plural ("1 comprimido", "15 comprimidos", "1 cápsula", "20 cápsulas").

---

## Débitos Técnicos e Blockers
- **Nenhum blocker ativo.** 68/68 testes unitários e clínicos aprovados com 100% de sucesso.
- **Tipagem estrita:** `tsc --noEmit` limpo com 0 erros.
- **Design System:** Conformidade com DESIGN.md 100% validada (0 erros, 0 avisos).
- **Bundle compilado:** `npm run build` gerado sem falhas.

---

## Próximo Ponto de Entrada
- Realizar commit, push para o repositório GitHub e deploy no Google Cloud Run se solicitado pelo usuário.
