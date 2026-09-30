# PresCMed — CURRENT STATE (.context)

## Fase Atual: v2.0.1 (Unificação de Visualização e Resiliência do Editor)

Sistema otimizado com fluxo contínuo e desobstruído:
- **Visualização Direta no Editor:** O botão primário "Visualizar" na prescrição e o atalho da folha A4 abrem diretamente a folha oficial no Editor de Prescrições e Documentos, permitindo leitura fiel à impressão e edição livre em tempo real sem redundâncias.
- **Ação Rápida de Impressão Direta:** Botão "Imprimir Direto" preservado como secundário para disparo imediato de impressão física ou PDF sem passar pela edição.
- **Resiliência contra Travamento de Chunks:** Criado `AsyncErrorBoundary` com recuperação automática e recarga forçada, aliado ao pré-carregamento inteligente do chunk do Editor em tempo ocioso (`requestIdleCallback`), eliminando o bloqueio de tela no Suspense fallback.
- **Sincronização Prioritária da Consulta:** Ao entrar no Editor, a receita ativa da consulta é automaticamente carregada na folha A4 com paciente, via, posologia, horários e formato de vias correspondente (inclusive 2 vias paisagem para controle especial).
- **Usabilidade Mobile do Editor:** Toolbar e grupos de ferramentas otimizados com rolagem horizontal suave (`touch-pan-x`) e botão de retorno rápido "Receitas".
- **Higiene de Rotas:** Rota órfã legada `models` eliminada da união canônica `ActiveTab`.

---

## Decisões Tomadas
1. **Unificação da Folha A4:** O Editor passa a ser a visualização oficial e editável da receita; a mini-folha do prescritor funciona como espelho de entrada e atalho direto para o Editor.
2. **Prioridade de Consulta sobre Rascunhos:** Se houver medicamentos na consulta ativa, o Editor sempre prioriza a receita em andamento.
3. **Pré-Carregamento Idle:** O módulo pesado do Tiptap/Editor é baixado silenciosamente após a montagem do App, garantindo abertura em 0 ms.

---

## Débitos Técnicos e Blockers
- **Nenhum blocker ativo.** 54/54 testes unitários e clínicos aprovados com 100% de sucesso.
- **Tipagem estrita:** `tsc --noEmit` limpo com 0 erros.
- **Design System:** Conformidade com DESIGN.md 100% validada (0 erros, 0 avisos).

---

## Próximo Ponto de Entrada
- Testar a interação do médico no Editor com diferentes volumes de medicamentos e validar a exportação/impressão direta a partir da folha A4.
