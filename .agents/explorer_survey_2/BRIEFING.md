# BRIEFING — 2026-09-12T20:53:00Z

## Mission
Mapear minuciosamente o Fluxo de Atendimento Linear e Desatamento de Loops de Botões para atender ao Requisito R2 do PresCMed (PCM).

## 🔒 My Identity
- Archetype: explorer
- Roles: [investigation, synthesis]
- Working directory: c:\Users\melki\projetos\pcm\.agents\explorer_survey_2
- Original parent: 67f6f76f-c28c-47d4-b806-61a8c2447fa6
- Milestone: Survey Phase - Explorer 2 (R2 Linear Flow & Action Hierarchy)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement / modify source code in src/
- Follow Brazilian clinical and sanitary guidelines (CFM, ANVISA RDC 20/2011, Portaria 344/98, Res. CFM 1.658/2002)
- Focus on PresCMed action button hierarchy, navigation loops, tab competition, and linear workflow design

## Current Parent
- Conversation ID: 67f6f76f-c28c-47d4-b806-61a8c2447fa6
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/App.tsx` (fluxo de navegação global, activeTab, printOrigin, sincronização hash)
  - `src/types.ts` (ActiveTab, interfaces de modelo)
  - `src/utils/navigation.ts` (rotas e slugs)
  - `src/components/PrescriptionBuilder.tsx` (stepper interno, CTAs redundantes, botões redirecionados)
  - `src/components/ExamRequester.tsx` (botões duplos de PDF, isolamento de fluxo)
  - `src/components/CertificateAndReferral.tsx` (botões de cabeçalho isolados, descompasso de subabas)
  - `src/components/PediatricCalculator.tsx` & `ClinicalProtocolsView.tsx` (fluxo de retorno com itens adicionados)
  - `src/components/PrintPreview.tsx` & `PrescriptionReview.tsx` (bifurcação que quebra retorno e seletor de tabs)
  - `src/components/Sidebar.tsx`, `MobileBottomNav.tsx`, `Header.tsx` (competição com navegação interna)
- **Key findings**:
  1. Identificados 7 botões distintos em `PrescriptionBuilder` que chamam `onNavigateToPrint`, incluindo ações com nomes enganosos (`handleCopyText = onNavigateToPrint` e `handleSendWhatsApp = onNavigateToPrint`).
  2. Identificado loop circular crítico em `PrintPreview`: ao alternar de Exames para Receita Simples, cai em `PrescriptionReview`, cujo botão voltar usa `printOrigin` (que é 'exams'), gerando desorientação de rota.
  3. Ausência de progressão linear no plantão: não há CTAs do tipo "Avançar para Exames" ou "Avançar para Atestado", forçando o médico a caçar abas no menu para um mesmo atendimento.
  4. Fragmentação da emissão: cada tela tenta emitir seu PDF de forma isolada, em vez de um fechamento consolidado do atendimento do paciente.
- **Unexplored areas**: Nenhuma pendência crítica para o escopo do R2.

## Key Decisions Made
- Estruturar proposta completa de fluxo linear em 4 etapas (Prescrição -> Exames -> Documentos -> Emissão Consolidada).
- Documentar todas as linhas exatas e propostas de refatoração para o implementador no handoff.md.

## Artifact Index
- c:\Users\melki\projetos\pcm\.agents\explorer_survey_2\DISPATCH.md — Dispatch instructions
- c:\Users\melki\projetos\pcm\.agents\explorer_survey_2\BRIEFING.md — Situational awareness and state
- c:\Users\melki\projetos\pcm\.agents\explorer_survey_2\progress.md — Progress tracking and heartbeat
- c:\Users\melki\projetos\pcm\.agents\explorer_survey_2\handoff.md — Relatório técnico final de 5 componentes
