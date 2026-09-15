# Dispatch — worker_m6

## 2026-09-15T02:26:15Z

Você é o Worker especializado em Testes Seriados, Engenharia de Componentes e Simulação de Fluxo do Usuário (worker_m6).

### Ambiente e Diretório de Trabalho
- Diretório de trabalho exclusivo: c:\Users\melki\projetos\pcm\.agents\worker_m6\
- Raiz do projeto: c:\Users\melki\projetos\pcm
- Arquivo da requisição original obrigatório: c:\Users\melki\projetos\pcm\.agents\ORIGINAL_REQUEST.md
- Escopo do Milestone M6: c:\Users\melki\projetos\pcm\.agents\orchestrator_3\SCOPE.md
- Diretrizes canônicas: c:\Users\melki\projetos\pcm\AGENTS.md

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Arquivos sob Sua Propriedade Exclusiva
- `src/utils/prescriptionRules.test.ts`
- `src/components/PrescriptionBuilder.tsx`

### Sua Missão
1. **Sincronização de Asserção Legada no Teste Unitário**:
   - Em `src/utils/prescriptionRules.test.ts:72-73`, atualizar as asserções do teste de antimicrobianos para refletir com exatidão a ordem correta da RDC ANVISA nº 20/2011:
     - 1ª via: `1ª via — Farmácia`
     - 2ª via: `2ª via — Paciente`
2. **Sincronização de Chip Informativo no `PrescriptionBuilder.tsx`**:
   - Na linha 2068 de `src/components/PrescriptionBuilder.tsx`, atualizar o texto visual do chip informativo para:
     `1ª Via: Farmácia (retenção) • 2ª Via: Paciente (RDC 20/2011)`
3. **Execução e Verificação de Testes Unitários e Build**:
   - Execute o comando de teste do projeto via `run_command`:
     `npm test` (ou `node --import tsx --test src/utils/*.test.ts`)
     Comprove que todos os testes unitários passam com exit code 0 e 100% de sucesso.
   - Execute `npm run build` e confirme que o build Vite compila com sucesso absoluto (exit code 0).
4. **Bateria de Simulação Seriada de Componentes (Jornada Completa do Prescritor)**:
   - Execute testes e simulações determinísticas de ponta a ponta cobrindo os 6 componentes centrais:
     a) `PrescriptionBuilder`: inserção de medicamentos comuns, antimicrobianos e controle especial C1, cálculo de embalagens e verificação de segregação de vias.
     b) `PediatricCalculator`: cálculo de doses por peso (1kg a 120kg), conversão para gotas/mL e verificação das travas de dose máxima.
     c) `CidSearchBar`: busca em tempo real, suporte a teclado (ArrowDown, ArrowUp, Enter, Escape), clique-fora e feedback visual com micro-dot.
     d) `ExamRequester`: seleção de exames laboratoriais e imagem, indicação clínica e separação por tipo de laboratório.
     e) `CertificateAndReferral`: emissão de atestado com/sem CID, consentimento do paciente (Res. CFM 1.658/2002) e guia de encaminhamento com especialidade e prioridade.
     f) `PrintPreview`: renderização da folha A4 em ambos os temas, ausência de contaminação por dark mode, preservação de `printOrigin` e retorno contextual.

### Handoff
Grave seu relatório completo em `c:\Users\melki\projetos\pcm\.agents\worker_m6\handoff.md` contendo todos os comandos executados, logs dos testes, matriz de simulação de componentes e resultados obtidos.
Ao concluir, envie mensagem de notificação via `send_message` ao orquestrador.
