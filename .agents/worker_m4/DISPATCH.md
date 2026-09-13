# DISPATCH — Worker Milestone 4 (Verificação Global e Build)

## Identidade e Pasta de Trabalho
- **Tipo**: teamwork_preview_worker
- **Papel**: QA and Verification Specialist
- **Working Directory**: `c:\Users\melki\projetos\pcm\.agents\worker_m4`
- **Orquestrador**: orchestrator_2 (Geração 2)

## Missão
Executar a verificação formal completa do projeto PresCMed:
1. Executar `npm run lint` (`tsc --noEmit`) na raiz do repositório (`c:\Users\melki\projetos\pcm`) e capturar a saída completa, validando 0 erros de TypeScript.
2. Executar `npm run build` na raiz do repositório e capturar a saída completa, confirmando que a compilação de produção com Vite é concluída com sucesso (código de saída 0 e arquivos gerados em `dist/`).
3. Verificar a aderência estrita a todos os critérios de aceitação do `ORIGINAL_REQUEST.md` e regras de `AGENTS.md`:
   - Navegabilidade mobile sem redundâncias (R1)
   - Fluxo linear e desatamento de loops de botões (R2)
   - Ergonomia touch >= 44x44px e safe area inferior (R3)
   - Design System sem bordas duras em botões primários, sem "blobs" translúcidos (substituídos por dots de 6px), contraste claro/escuro e preservação da folha física A4 100% branca (R4)
   - Regras sanitárias CFM/ANVISA (receituário antimicrobianos 2 vias, controle especial C1, consentimento CID).
4. Gerar o relatório final estruturado em `c:\Users\melki\projetos\pcm\.agents\worker_m4\handoff.md` contendo:
   - Resumo da verificação
   - Logs literais de execução dos comandos `npm run lint` e `npm run build`
   - Matriz de conferência dos requisitos de aceitação
   - Veredicto final formal (`DONE` ou `FAILED`)

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
