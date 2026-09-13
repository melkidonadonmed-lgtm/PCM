# Plano de Execução — Milestone 4: Verificação Final e Homologação de Aceite

## Objetivo
Validar globalmente o PresCMed após as implementações dos Milestones 1, 2 e 3, confirmando 0 erros em compilação TypeScript (`npm run lint`), compilação bem-sucedida de produção com Vite (`npm run build`) e conformidade estrita com todos os critérios de aceitação do `ORIGINAL_REQUEST.md` e diretrizes de `AGENTS.md`.

## Etapas

### Etapa 1: Consolidação do Estado e Inicialização de Monitoramento
- [x] Ingestão de `ORIGINAL_REQUEST.md`, `AGENTS.md`, `PROJECT.md`, `orchestrator_1/GATE_STATUS.md` e `reviewer_m3_1/handoff.md`.
- [x] Criação de `DISPATCH.md`, `BRIEFING.md` e `progress.md` na pasta `.agents/orchestrator_2/`.
- [ ] Inicialização do heartbeat cron via `schedule(CronExpression="*/10 * * * *")`.
- [ ] Atualização de `PROJECT.md` refletindo M3 como DONE e M4 como IN_PROGRESS.

### Etapa 2: Despacho do Subagente de Verificação (Worker M4)
- [ ] Criar diretório `.agents/worker_m4/`.
- [ ] Despachar subagente `teamwork_preview_worker` com instruções precisas:
  - Executar comando `npm run lint` (`tsc --noEmit`) no diretório do projeto.
  - Executar comando `npm run build` no diretório do projeto.
  - Verificar código de saída (exit code 0), ausência de warnings críticos e geração de assets em `dist/`.
  - Checar conformidade dos 18 itens do inventário de features e critérios de aceitação R1-R4.
  - Redigir relatório conclusivo em `.agents/worker_m4/handoff.md`.

### Etapa 3: Coleta, Gate e Síntese dos Resultados
- [ ] Aguardar conclusão e analisar relatório `handoff.md` do worker.
- [ ] Registrar veredicto no portão final em `.agents/orchestrator_2/GATE_STATUS.md`.
- [ ] Atualizar `PROJECT.md` com status de M4 como DONE.

### Etapa 4: Homologação Final e Emissão do Claim of Victory
- [ ] Elaborar `VICTORY_REPORT.md` detalhado consolidando as conquistas de M1 a M4.
- [ ] Elaborar `handoff.md` final do Orchestrator G2.
- [ ] Enviar mensagem formal de Claim of Victory para o Sentinel (parent) via `send_message`.
