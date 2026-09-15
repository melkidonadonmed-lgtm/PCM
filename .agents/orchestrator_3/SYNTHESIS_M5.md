# Síntese da Auditoria M5 — Qualidade Frontend, Design System e Domínio Clínico

## 1. Consenso e Diagnóstico Consolidado

Os três Explorers independentes concluíram com alto rigor técnico a auditoria do PresCMed:

1. **Arquitetura Geral Saudável (React 19)**:
   - Aplicação 100% client-side sem backend ou APIs externas.
   - Estado centralizado em `src/App.tsx`, com prop drilling claro.
   - Navegação por hash e abas desatada e livre de loops (`hashMatchesTab`).
   - Folha A4 de impressão e geração de PDF estritamente em fundo branco com texto escuro nos dois modos (Claro e Escuro).

2. **Itens Críticos de Correção / Refinamento Identificados**:

### A. Integridade Sanitária e Regulatória YMYL (Prioridade Máxima)
- **Inversão das Vias de Antimicrobianos em `src/utils/prescriptionPdf.ts:86-88`**:
  - *Atual*: `1ª via — Paciente` / `2ª via — Farmácia (retenção)`.
  - *Obrigatório pela RDC ANVISA nº 20/2011 (Art. 6º)*: `1ª via — Farmácia (retenção)` / `2ª via — Paciente`.
- **Sincronização de `calculatedMg` em Gotas Pediátricas (`src/utils/doseCalculator.ts`)**:
  - Garantir que `calculatedMg` para paracetamol e ibuprofeno reflita exatamente a dose administrada pelas gotas calculadas.

### B. Consistência do Design System e Erradicação de Blobs Saturados
- **Meta Theme-Color em `index.html` (linhas 18-19)**:
  - Atualizar para `#121824` (escuro) e `#F8FAFC` (claro), removendo resquícios legados.
- **Superfície em `src/components/MedicationSearchDialog.tsx` (linha 59)**:
  - Substituir `dark:bg-slate-900` pelo token canônico `dark:bg-[#192130]` / `var(--surface-card)`.
- **Erradicação de "Blobs" Saturados**:
  - `src/components/CidSearchBar.tsx:383`: Substituir `bg-emerald-500/15 border-emerald-500/30` por tipografia limpa com micro-ponto (dot de 6px) `w-1.5 h-1.5 rounded-full bg-emerald-500`.
  - `src/components/CertificateAndReferral.tsx:340,358`: Ajustar badges de etapas concluídas no stepper para tons suaves e neutros com dots.

### C. Acessibilidade, Ergonomia Touch e Usabilidade Médica
- **Navegação por Teclado e Dismiss no `CidSearchBar.tsx`**:
  - Implementar `onKeyDown` com suporte para `ArrowDown`, `ArrowUp`, `Enter` (seleção do item ativo) e `Escape` (fechar dropdown).
  - Implementar listener de clique-fora (`mousedown`) via `containerRef` para fechar a lista suspensa ao clicar fora.
- **Área de Toque Mínima (>= 44x44px)**:
  - `src/components/CertificateAndReferral.tsx:1083`: Expandir a área de clique do botão de remoção de CID para `min-w-[44px] min-h-[44px]`.
  - `src/components/CidSearchBar.tsx`: Garantir `min-h-[44px]` nos botões de inserção e conclusão.
  - `src/components/MedicationSearchDialog.tsx`: Botão de inserção mobile com `min-h-[44px]`.
  - `src/index.css`: Expandir regra de altura mínima de 44px para além de `.prescription-workspace`.

### D. Ciclo de Vida do React 19 e Gestão de Memória
- **Otimização de Re-render em `src/App.tsx` (linhas 323-335)**:
  - Adicionar guarda condicional antes de `setCertificate` e `setReferral` no `useEffect([patient])` para evitar disparos redundantes quando o nome/documento não sofreram alteração.
- **Cleanup de Timers Assíncronos**:
  - Armazenar referências de `setTimeout` e executar `clearTimeout` no retorno de efeitos ou unmount nos componentes com feedbacks transitórios.
- **Higiene de Código Morto**:
  - Remover com segurança os arquivos órfãos não importados: `src/components/MedicationSelectionModal.tsx` e `src/components/MedicationPresentationModal.tsx`.
