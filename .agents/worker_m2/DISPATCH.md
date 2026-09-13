## 2026-09-13T01:14:12Z

Você é o Worker responsável pela implementação do Milestone 2 (M2) do projeto PresCMed (PCM):
"Fluxo Linear de Atendimento e Desatamento de Loops de Botões".

Sua pasta exclusiva de trabalho para metadados/relatórios é: c:\Users\melki\projetos\pcm\.agents\worker_m2

Arquivos obrigatórios para leitura inicial:
1. c:\Users\melki\projetos\pcm\.agents\ORIGINAL_REQUEST.md (Leia na íntegra!)
2. c:\Users\melki\projetos\pcm\AGENTS.md (Diretrizes arquiteturais, normas sanitárias CFM/ANVISA, design system)
3. c:\Users\melki\projetos\pcm\PROJECT.md (Arquitetura e escopo do projeto)
4. c:\Users\melki\projetos\pcm\.agents\explorer_survey_2\handoff.md (Relatório técnico aprofundado com diagnóstico de todos os loops e propostas de solução)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Seu escopo de modificações para o Milestone 2:
1. `src/components/PrescriptionBuilder.tsx`:
   - Corrigir `handleCopyText`: implementar cópia real para o clipboard via `navigator.clipboard.writeText(buildPrescriptionText(prescriptionItems, patient, doctor))` com feedback visual inline ("Copiado para a área de transferência!"), sem redirecionar para impressão!
   - Corrigir `handleSendWhatsApp`: compartilhar o texto formatado da receita via `https://wa.me/?text=...` ou modal correspondente, sem forçar desvio de tela.
   - Conectar a prop `onNavigateToPediatricCalc` para permitir que o médico acerte doses pediátricas na calculadora clínica direto do composer de medicamentos quando o paciente tiver peso informado ou for criança.
   - No rodapé da lista de medicamentos (linhas 1618-1647), desatar a competição de múltiplos botões de impressão. Estabelecer hierarquia clara:
     - Ações secundárias limpas: "Copiar Texto", "Zerar", "Revisar Receita".
     - CTA Primário recomendado em destaque tátil: "Avançar para Exames ➔" (ou se não houver exames a pedir, permitir avanço direto ou revisão).
   - No Stepper do topo: alinhar os passos com a jornada de atendimento clínico (1. Paciente -> 2. Medicamentos -> 3. Exames / Documentos / Finalizar).
   - Na folha simulada lateral (desktop/mobile preview): unificar os botões redundantes em um único botão claro de visualização/revisão.

2. `src/components/ExamRequester.tsx`:
   - Integrar o fluxo linear:
     - Adicionar botão de retorno secundário: "◀ Voltar para Prescrição" (`onNavigateToPrescription`).
     - Adicionar CTA Primário de avanço no rodapé / cabeçalho: "Avançar para Documentos ➔" (`onNavigateToDocuments`).
     - Manter a ação de "Visualizar Pedido de Exames" (`onNavigateToPrint`).

3. `src/components/CertificateAndReferral.tsx`:
   - Integrar o fluxo linear:
     - Adicionar botão secundário de retorno: "◀ Voltar para Exames" (`onNavigateToExams`).
     - Adicionar CTA Primário de encerramento no rodapé / cabeçalho: "Finalizar Atendimento & Emitir Documentos ➔" (`onNavigateToPrint`).

4. `src/components/PrintPreview.tsx` e `src/components/PrescriptionReview.tsx`:
   - Desatar o loop circular entre `PrintPreview` e `PrescriptionReview`:
     - O botão de retorno não pode ejetar o médico para a tela errada (ex.: se o médico estava em Exames e alternou para Receita Simples dentro do preview, o botão de retorno deve ser claro e intuitivo, como "Voltar aos Medicamentos" navegando para `prescription`, ou "Voltar ao Atendimento").
     - Garantir que a troca de abas de documentos dentro do `PrintPreview` não corrompa o histórico de navegação.

5. `src/App.tsx`:
   - Passar os callbacks de navegação sequencial entre as views:
     - `onNavigateToExams={() => handleSelectTab('exams')}`
     - `onNavigateToDocuments={() => handleSelectTab('certificate')}`
     - `onNavigateToPrescription={() => handleSelectTab('prescription')}`
   - Garantir preservação estrita de contexto de paciente (`patient`) em todas as transições de tela.

Regras Clínicas e Sanitárias Invioláveis:
- Preservar rigorosamente a segregação de Antimicrobianos (RDC 20/2011) e Controle Especial C1 (Portaria 344/98).
- Respeitar a exigência de consentimento do paciente para CID no atestado (Res. CFM 1.658/2002).
- Garantir que a folha A4 continue 100% branca com texto escuro nos dois temas.

Validação obrigatória:
- Executar `npm run lint` (`tsc --noEmit`) e garantir 0 erros de TypeScript.
- Executar `npm run build` e garantir compilação com sucesso no Vite.
- Documentar detalhadamente todas as mudanças e saídas dos comandos em `c:\Users\melki\projetos\pcm\.agents\worker_m2\handoff.md`.
- Atualizar `progress.md` e enviar mensagem com `send_message` ao concluir.
