# Plano de Execução — orchestrator_3

## Contexto e Missão
Execução do ciclo de auditoria profunda, validação em navegador real e refinamento de excelência do frontend PresCMed (PCM), com base no follow-up `2026-09-15T01:54:20Z` registrado em `ORIGINAL_REQUEST.md`.

---

## Marcos de Execução

### Marco 5 (M5): Auditoria Holística de Qualidade Frontend (Modern Web Guidance & Design System)
1. **Investigação Paralela (3 Explorers)**:
   - **Explorer 1 (Arquitetura & Ciclo de Vida React 19)**: Inspecionar `App.tsx`, gerenciamento de estado via `useState`/`useEffect`, persistência no `localStorage`, possíveis vazamentos de memória ou re-renderizações desnecessárias.
   - **Explorer 2 (Design System & Tailwind v4)**: Avaliar aderência às regras visuais do `AGENTS.md` (Hospitalar Límpido no Claro, Grafite Ardósia Aveludado no Escuro, zero contornos grosseiros em botões táteis primários, erradicação de blobs translúcidos, contraste e hierarquia).
   - **Explorer 3 (Integridade Sanitária & Interfaces de Documentos)**: Revisar conformidade clínica e sanitária (RDC 20/2011 para antimicrobianos, Portaria 344/98 para C1, Res. CFM 1.658/2002 para CID-10, folha A4 em branco puro).
2. **Implementação de Refinamentos (Worker)**:
   - Se os explorers apontarem oportunidades de ajuste de estado ou estilo, o Worker aplica as correções garantindo `npm run lint` com 0 erros e `npm run build` limpo.
3. **Revisão e Desafio**:
   - 2 Reviewers independentes analisam conformidade de código e ausência de regressões.
   - 2 Challengers testam casos de estresse e integridade clínica.
4. **Auditoria Forense de Integridade (Auditor)**:
   - Auditor checa integridade e ausência de atalhos/fraudes.
5. **Gate M5**: Passagem estrita se todos aprovarem.

### Marco 6 (M6): Teste Seriado de Componentes e Simulação de Fluxo do Usuário
1. **Simulação Determinística de Fluxos**:
   - Testar o fluxo completo de atendimento médico:
     1. Adição/seleção de paciente (idade, peso, alergias).
     2. Prescrição de medicamentos adultos e pediátricos (cálculo por kg, gotas, mL).
     3. Pedidos de exames laboratoriais e de imagem no `ExamRequester`.
     4. Emissão de atestados e guias de encaminhamento com CID no `CertificateAndReferral`.
     5. Busca em tempo real no `CidSearchBar` com teclado e clique.
     6. Visualização no `PrintPreview` e conferência de segregação de vias.
2. **Avaliação de Casos de Borda**:
   - Pacientes com pesos extremos na calculadora pediátrica.
   - Busca de CID com termos inexistentes ou acentuados.
   - Exclusão e reordenação de itens sem quebra de estado.
3. **Gate M6**: Verificação de ausência de loops e estabilidade de estado.

### Marco 7 (M7): Validação em Navegador Real (Chrome DevTools) & Vitória
1. **Validação E2E no Chrome DevTools**:
   - Acessar `http://localhost:3000` via Chrome DevTools MCP.
   - Inspecionar console de erros e warnings.
   - Inspecionar layout visual e DOM em desktop e viewport mobile (< 1024px).
   - Testar interatividade real do `CidSearchBar`, alternância de temas (Claro/Escuro) e navegação entre abas.
2. **Relatório de Vitória (VICTORY_REPORT.md)**:
   - Documentar resultados, logs do DevTools e status de aceitação.
3. **Comunicação Final**:
   - Enviar mensagem ao Sentinel solicitando auditoria de vitória independente.
