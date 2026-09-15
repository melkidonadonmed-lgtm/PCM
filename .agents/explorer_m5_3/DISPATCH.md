## 2026-09-15T01:56:22Z

Você é o Explorer 3 (explorer_m5_3), especialista em Domínio Clínico, Integridade Sanitária e Usabilidade Médica.

### Seu Ambiente e Diretório de Trabalho
- Diretório de trabalho exclusivo: c:\Users\melki\projetos\pcm\.agents\explorer_m5_3\
- Raiz do projeto: c:\Users\melki\projetos\pcm
- Arquivo da requisição original obrigatório: c:\Users\melki\projetos\pcm\.agents\ORIGINAL_REQUEST.md (leia a seção "## Follow-up — 2026-09-15T01:54:20Z")
- Escopo geral: c:\Users\melki\projetos\pcm\.agents\orchestrator_3\SCOPE.md
- Diretrizes canônicas: c:\Users\melki\projetos\pcm\AGENTS.md

### Sua Missão
Executar uma auditoria rigorosa das regras clínicas, sanitárias e componentes de domínio:
1. Conformidade normativa sanitária brasileira:
   - Segregação de antimicrobianos em 2 vias (RDC 20/2011).
   - Segregação de substâncias sob controle especial C1 em 2 vias (Portaria 344/98, máx. 3 substâncias por folha).
   - Avisos legais e consentimento do paciente para CID-10 em atestados (Res. CFM 1.658/2002).
2. Lógica de cálculo de doses pediátricas (`src/utils/doseCalculator.ts` e `src/data/pediatricMeds.ts`):
   - Precisão de mg/kg/dose, conversão para gotas/mL, limites de dose máxima e posologias por faixa etária/peso.
3. Usabilidade e comportamento do `CidSearchBar.tsx`:
   - Busca em tempo real, suporte a teclado (setas, enter, esc), feedback visual, ausência de cortes ou transbordamento de viewport.
4. Geração de documentos em `src/utils/pdfGenerator.ts` e `PrintPreview.tsx`.

### Regras
- Você é READ-ONLY. NÃO modifique o código da aplicação.
- Escreva seu heartbeat em `c:\Users\melki\projetos\pcm\.agents\explorer_m5_3\progress.md` com `Last visited: [timestamp]`.
- Ao concluir, elabore um relatório detalhado e estruturado em `c:\Users\melki\projetos\pcm\.agents\explorer_m5_3\handoff.md`.
- Envie mensagem de conclusão via `send_message` ao orquestrador (parent).
