# PresCMed — CURRENT STATE (.context)

## Fase Atual: v2.0.5 (Unificação da Emissão de Receitas, Edição Direta e Sincronização Bidirecional Editor <-> Receita)

O fluxo de emissão e edição de receitas médicas foi completamente reformulado e unificado para eliminar a desconexão entre telas e facilitar o dia a dia do médico:

- **Ação Primária Canônica de Emissão (`AcoesDaReceita.tsx`):**
  - O botão primário em destaque é **`Imprimir / Gerar PDF`**, eliminando a ambiguidade anterior onde o médico caía no editor sem querer.
  - O **`Editor de Folha A4`** é agora o botão secundário claro para customização avançada.
- **Edição Direta de Medicamentos na Receita (`PrescriptionBuilder.tsx`):**
  - Cada medicamento na lista possui botão dedicado de **Editar** (ícone `Pencil`).
  - Ao clicar, o fármaco entra no **Modo de Edição**, preenchendo todos os campos no formulário com aviso visual e botão **"Salvar Alterações no Medicamento"**.
  - Permite alterar dose, via, quantidade ou posologia diretamente sem precisar apagar e recriar o item.
- **Botão de Impressão Direta no Topo do Editor (`DocumentEditorView.tsx`):**
  - O botão **`Imprimir A4 / PDF`** (`Printer`) está fixo e visível no topo direito da barra superior, acessível imediatamente sem rolagem de toolbar.
- **Sincronização Bidirecional Editor <-> Receita (`parsePrescriptionHtml.ts` & `App.tsx`):**
  - O que é editado no processador de texto A4 é sincronizado de volta para a receita ativa da consulta (`prescriptionItems`) via `syncWithActivePrescription()`.
  - Os botões **"Salvar na Receita"** e **"Voltar à Receita"** garantem que nenhuma alteração textual se perca ao alternar entre abas.
- **Documentação de Auditoria de Habilidades (`.context/ANALISE_CALIBRACAO_SKILLS.md`):**
  - Análise detalhada sobre por que avaliadores estáticos atribuíram 97,5% a um fluxo com quebra na malha do usuário, definindo penalidades e diretrizes para calibração das skills.

---

## Decisões Tomadas
1. **Fonte Única da Verdade:** Toda alteração feita no Editor ou na Receita atualiza o estado central da consulta (`usePrescriptionSession`), garantindo que tanto a impressão quanto o PDF reflitam exatamente o mesmo documento.
2. **Priorização Ergonômica:** Ações de alta frequência (Imprimir, Salvar, Editar) devem residir no primeiro nível visual, sem depender de overflow horizontal.
3. **Resiliência do Parser:** O extrator `parsePrescriptionHtmlToItems` é 100% puro e agnóstico ao DOM (funciona no Node/Vitest e no browser).

---

## Status de Implantação e Nuvem
- **GitHub (`origin/main`):** Commit `b70d676` enviado com sucesso.
- **Google Cloud Run:** Revisão `prescmed-00048-t5h` implantada com sucesso na região `southamerica-east1` (HTTP 200 OK).
  - URL Ativa: `https://prescmed-1044179901556.southamerica-east1.run.app`
- **Persistência na Nuvem (Firestore):**
  - Identificado e sanado bug de `Unsupported field value: undefined` com a função `sanitizeForFirestore` recursiva em `cloudSyncManager.ts`.
  - Conformidade total com LGPD e sigilo médico mantida (somente postos de trabalho e templates reutilizáveis vão para a nuvem; prontuários e rascunhos de pacientes permanecem estritamente no IndexedDB local).

---

## Débitos Técnicos e Blockers
- **Nenhum blocker ativo.** 76/76 testes unitários e clínicos aprovados com 100% de sucesso (`ExitCode: 0`).
- **Tipagem estrita:** `tsc --noEmit` limpo com 0 erros (`ExitCode: 0`).
- **Design System:** Conformidade com DESIGN.md 100% validada (`ExitCode: 0`).
- **Bundle compilado:** `npm run build` gerado sem falhas (`ExitCode: 0`).

