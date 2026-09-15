## 2026-09-15T02:04:42Z

Você é o Worker especializado em Engenharia Frontend, React 19, Tailwind v4 e Integridade Clínica (worker_m5).

### Ambiente e Diretório de Trabalho
- Diretório de trabalho exclusivo: c:\Users\melki\projetos\pcm\.agents\worker_m5\
- Raiz do projeto: c:\Users\melki\projetos\pcm
- Arquivo da requisição original obrigatório: c:\Users\melki\projetos\pcm\.agents\ORIGINAL_REQUEST.md
- Síntese dos Explorers: c:\Users\melki\projetos\pcm\.agents\orchestrator_3\SYNTHESIS_M5.md
- Relatórios detalhados dos Explorers:
  - c:\Users\melki\projetos\pcm\.agents\explorer_m5_1\handoff.md
  - c:\Users\melki\projetos\pcm\.agents\explorer_m5_2\handoff.md
  - c:\Users\melki\projetos\pcm\.agents\explorer_m5_3\handoff.md
- Diretrizes canônicas: c:\Users\melki\projetos\pcm\AGENTS.md

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Arquivos sob Sua Propriedade Exclusiva
- `src/utils/prescriptionPdf.ts`
- `src/utils/doseCalculator.ts`
- `index.html`
- `src/components/MedicationSearchDialog.tsx`
- `src/components/CidSearchBar.tsx`
- `src/components/CertificateAndReferral.tsx`
- `src/index.css`
- `src/App.tsx`
- `src/components/MedicationSelectionModal.tsx` e `src/components/MedicationPresentationModal.tsx` (remoção segura de código morto ou limpeza)

### Missão de Implementação e Refinamento
Com base na síntese `SYNTHESIS_M5.md` e nos relatórios dos Explorers, implemente as seguintes melhorias:

1. **Correção Regulatória Sanitária (RDC 20/2011)**:
   - Em `src/utils/prescriptionPdf.ts:86-88`, corrigir a inversão das vias de antimicrobianos:
     - 1ª via DEVE ser `1ª via — Farmácia (retenção)`
     - 2ª via DEVE ser `2ª via — Paciente`
2. **Precisão de Dose Pediátrica**:
   - Em `src/utils/doseCalculator.ts`, quando paracetamol ou ibuprofeno forem convertidos para gotas empíricas com ajuste de volume, recalcular `calculatedMg = (drops / dropsPerMl) * concentrationMgPerMl` (ou fórmula equivalente) para que o metadado `calculatedMg` corresponda exatamente à quantidade de princípio ativo entregue pelas gotas.
3. **Design System & Paleta de Cores**:
   - Em `index.html`: atualizar `<meta name="theme-color">` para `#121824` (dark) e `#F8FAFC` (light).
   - Em `src/components/MedicationSearchDialog.tsx`: substituir `dark:bg-slate-900` pelo padrão Grafite Ardósia `dark:bg-[#192130]` / `var(--surface-card)`.
   - Em `src/components/CidSearchBar.tsx:383`: erradicar o blob saturado `bg-emerald-500/15 border-emerald-500/30`, substituindo por tipografia limpa com micro-ponto (dot de 6px) `w-1.5 h-1.5 rounded-full bg-emerald-500`.
   - Em `src/components/CertificateAndReferral.tsx`: ajustar badges de etapas concluídas no stepper para padrão suave com micro-dot.
4. **Acessibilidade, Teclado e Ergonomia Touch (>= 44x44px)**:
   - Em `src/components/CidSearchBar.tsx`:
     - Adicionar navegação por teclado no input: `ArrowDown` e `ArrowUp` para navegar nos itens filtrados (com realce visual no item ativo), `Enter` para selecionar o item ativo, e `Escape` para fechar a lista suspensa.
     - Implementar detecção de clique-fora (`mousedown` no document) para fechar a lista quando o usuário clicar fora do `containerRef`.
     - Garantir que botões de inserção e conclusão tenham altura mínima de 44px (`min-h-[44px]`).
   - Em `src/components/CertificateAndReferral.tsx:1083`:
     - Expandir a área de toque do botão de exclusão do CID para no mínimo 44x44px (`min-w-[44px] min-h-[44px] inline-flex items-center justify-center`).
   - Em `src/components/MedicationSearchDialog.tsx`:
     - Garantir que o botão mobile de inserção tenha `min-h-[44px]`.
   - Em `src/index.css`:
     - Expandir a garantia de altura mínima de 44px para abranger todas as áreas clínicas e diálogos:
       `:is(.prescription-workspace, .clinical-workspace, [role="dialog"], .stepper-nav) :is(button, [role="button"], summary) { min-height: 44px; }`.
5. **Otimização de Ciclo de Vida e Re-render no React 19**:
   - Em `src/App.tsx:323-335`: adicionar guarda no `useEffect([patient])` para chamar `setCertificate` e `setReferral` apenas se `patient.name` ou `patient.documentNumber` realmente divergirem dos valores já presentes em `certificate` e `referral`, prevenindo cascatas de renderização e escritas desnecessárias no `localStorage`.
6. **Limpeza de Código Morto**:
   - Remover com segurança os arquivos não utilizados `src/components/MedicationSelectionModal.tsx` e `src/components/MedicationPresentationModal.tsx`.

### Verificação Obrigatória
- Execute `npm run lint` (`tsc --noEmit`) via `run_command` e comprove que conclui com exit code 0 e ZERO erros de TypeScript.
- Execute `npm run build` via `run_command` e comprove que o build do Vite é gerado com sucesso em `dist/`.
- Documente detalhadamente no seu `handoff.md` todas as alterações feitas, os comandos executados e as saídas literais dos testes/builds.
- Ao concluir, envie mensagem de conclusão via `send_message` ao orquestrador.
