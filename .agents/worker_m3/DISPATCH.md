## 2026-09-13T01:38:00Z
Você é o Worker responsável pela implementação do Milestone 3 (M3) do projeto PresCMed (PCM):
"Ergonomia Touch e Consistência Visual do Design System" (Requisitos R3 e R4).

Sua pasta exclusiva de trabalho para metadados/relatórios é: c:\Users\melki\projetos\pcm\.agents\worker_m3

Arquivos obrigatórios para leitura inicial:
1. c:\Users\melki\projetos\pcm\.agents\ORIGINAL_REQUEST.md (Leia na íntegra!)
2. c:\Users\melki\projetos\pcm\AGENTS.md (Diretrizes arquiteturais, normas sanitárias CFM/ANVISA, design system)
3. c:\Users\melki\projetos\pcm\PROJECT.md (Arquitetura e escopo do projeto)
4. c:\Users\melki\projetos\pcm\.agents\explorer_survey_3\handoff.md (Relatório técnico aprofundado com a auditoria completa de botões com bordas duras, blobs translúcidos, alvos < 44px e paleta de cores)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Seu escopo de modificações para o Milestone 3:
1. `src/index.css`:
   - Remover gradiente do `body` com parada amarelada/pergaminho no tema claro (`#FCF9F3`, `#F8F3EA`, `#EFE7DA`) e a calha amarelada da scrollbar (`#EFE8D4`). Alinhar estritamente com a paleta hospitalar límpida: canvas `--bg-app: #F8FAFC`, cards `--surface-card: #FFFFFF`, bandejas `--surface-inset: #F1F5F9`.
   - No tema escuro, remover paradas pretas densas opressivas (`#0A0E17`); harmonizar com a paleta Grafite Ardósia Aveludado: `--bg-app: #121824`, `--surface-card: #192130`, `--bg-surface-elevated: #202A3C`, `--surface-inset: #141C28`.
   - Assegurar que botões primários (`.btn-tactile-primary`, `.tactile-btn-primary`, `.clinical-button`) mantenham `border: none` e elevação tátil aveludada.
   - Preservar intactas as regras da folha física A4 (`#printable-a4-sheet` e `@media print`), sempre 100% branca com texto escuro nos dois temas.

2. Erradicação de Bordas Duras em Botões Primários e Chips Ativos:
   - Remover `border: ...` rígido nos botões ativos/selecionados dos componentes mapeados no handoff do Explorer 3:
     - `src/components/CertificateAndReferral.tsx`: subtabs de atestado/encaminhamento (remover `border-navy-800` / `border-white/30`), chips de repouso, chip de especialidade, botões de prioridade.
     - `src/components/Sidebar.tsx`: botões ativos `renderNavButton` e badge de CRM.
     - `src/components/PediatricCalculator.tsx`: chips de presets de peso e categoria clínica.
     - `src/components/ExamRequester.tsx`: chips de categoria e exames selecionados.
     - `src/components/PrintPreview.tsx`: abas de tipos de documentos ativas, seletores de via e filtros de exame.
     - `src/components/CidSearchBar.tsx`: chips de Quick Picks ativos.
     - Modais auxiliares: `MedicationSelectionModal.tsx` e `MedicationPresentationModal.tsx`.

3. Erradicação de "Blobs" Translúcidos Saturados:
   - Substituir caixas e pílulas com fundos semi-transparentes saturados (`bg-emerald-500/20 text-emerald-400`, `bg-amber-500/20`, etc.) por tipografia limpa em tom neutro suave acompanhada de micro-pontos de status (dots de 6px: `w-1.5 h-1.5 rounded-full inline-block mr-1.5` ou equivalente discreto), conforme exigido no AGENTS.md:
     - `src/components/Sidebar.tsx`: status do paciente ativo e recolhido.
     - `src/components/PediatricCalculator.tsx`: tag de faixa etária/dose, alerta clínico e caixas de ícones.
     - `src/components/ExamRequester.tsx`: tag de modalidade e pacote.
     - `src/components/PrescriptionReview.tsx`: tag C1 e banner de validação.
     - `src/components/QuantityAssistant.tsx`: caixa de sugestão.
     - `src/components/PrintPreview.tsx`: tag informativa de 2 vias.
     - `src/components/CidSearchBar.tsx`: botão inline "+ Inserir".
     - `src/components/PrescriptionBuilder.tsx`: alerta clínico e badges de via de administração.

4. Ergonomia Touch Mobile (Área de Toque Mínima >= 44x44px):
   - Ajustar para `min-h-[44px] min-w-[44px]` (ou aumentar padding `p-2.5` / `p-3`) em:
     - `src/components/PrintPreview.tsx`: botões de ação móveis (Download, Imprimir, Compartilhar), botões de navegação de páginas anterior/próxima, seletores de 1ª/2ª via.
     - `src/components/PrescriptionBuilder.tsx`: botões rápidos de item (Editar, Subir, Descer, Excluir), botões de ações em lote ("Selecionar Todos", "Excluir Selecionados", "Limpar Tudo") e seletor de páginas da receita simulada.
     - `src/components/ExamRequester.tsx`: botão "+" de adicionar exame avulso, linhas clicáveis e botão "Limpar Tudo".
     - Modais (`PatientModal.tsx`, `DoctorProfileModal.tsx`, `ConfirmationModal.tsx`, etc.): botão "X" de fechar com área de toque mínima de 44x44px (`min-w-[44px] min-h-[44px]`).
