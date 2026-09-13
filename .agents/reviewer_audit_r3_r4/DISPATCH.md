# DISPATCH: Auditoria Forense Independente de Código (R3 e R4)

Você atuará como Reviewer & Adversarial Critic para o Victory Auditor do PresCMed.
Sua pasta exclusiva de trabalho é: c:\Users\melki\projetos\pcm\.agents\reviewer_audit_r3_r4

## Missão:
Auditar exaustivamente e sem condescendência os requisitos R3 e R4 diretamente no código-fonte em `c:\Users\melki\projetos\pcm`:

### R3. Ergonomia Touch e Acessibilidade Mobile:
- Inspecione as dimensões interativas em todos os componentes principais da aplicação.
- Verifique se os alvos táteis mobile possuem dimensão mínima de toque de >= 44x44px (WCAG 2.2 Target Size 2.5.8):
  * Botões de ação primária e secundária (`min-h-[44px]` ou classes táteis).
  * Botões "X" de fechamento de todos os modais da aplicação (`ConfirmationModal`, `PatientModal`, `DoctorProfileModal`, `MedicationSelectionModal`, `MedicationPresentationModal`, `ExamRequester`, `Sidebar`, etc.).
  * Controles de paginação, reordenação de itens (subir/descer na prescrição), toolbar de impressão e chips de filtro.
- Verifique se há respeito à safe area (`pb-safe`) e espaçamento ergonômico para uso com polegar.

### R4. Consistência Visual do Design System e Normas Sanitárias:
- Inspecione `src/index.css` e todos os componentes relevantes:
  * Verifique se botões táteis primários NÃO possuem bordas duras (`border: none` em `.btn-tactile-primary` e classes equivalentes nos temas claro e escuro).
  * Verifique se "blobs" translúcidos saturados foram totalmente erradicados e substituídos por tipografia limpa acompanhada de micro-pontos (dots) de status de 6px (`w-1.5 h-1.5 rounded-full`).
  * Verifique a paleta de cores: se foram eliminados tons terrosos/lama obsoletos (`#F8F4EC`, `#0A0F18`, etc.) e se o tema claro adota o hospitalar límpido (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`) e o tema escuro adota o grafite ardósia aveludado (`#121824`, `#192130`, `#202A3C`).
  * Verifique a blindagem da folha física A4 (`#printable-a4-sheet` e `.print-page`): a folha e todos os documentos emitidos DEVEM ser 100% brancos com texto escuro em ambos os temas, sem contaminação pelo modo escuro.
  * Verifique o respeito às normas sanitárias e ético-médicas do Brasil: RDC 20/2011 (segregação de antimicrobianos em receituário de 2 vias), Portaria 344/98 (notificação de receita C1 em 2 vias com identificação de comprador/fornecedor), e Resolução CFM 1.658/2002 (consentimento explícito do paciente para inclusão de CID-10 no atestado).

Documente cada verificação com caminhos, linhas e evidências concretas em:
`c:\Users\melki\projetos\pcm\.agents\reviewer_audit_r3_r4\handoff.md`.
Envie sua conclusão via send_message ao Victory Auditor com o veredicto de R3 e R4 (`CONFORME` ou `NÃO CONFORME`).
