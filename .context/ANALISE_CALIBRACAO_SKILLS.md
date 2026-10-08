# Análise Crítica: Descalibração de Habilidades Avaliadoras (Score 97,5% vs UX Real)

**Data de Registro:** 08/10/2026  
**Contexto:** Auditoria de fluxo clínico no PresCMed (Emissão de Receita & Sincronização com Editor A4)

---

## 1. O Problema Identificado

Durante a avaliação automatizada realizada por uma habilidade analítica prévia, o sistema obteve uma pontuação de **97,5%**. No entanto, ao submeter o sistema ao uso real pelo médico, foram constatados bloqueios severos de usabilidade e integridade de dados:

1. **Botão de Impressão Inacessível no Editor:** No topo do Editor de Documentos, não havia botão de imprimir. O controle estava escondido no final de uma barra horizontal de ferramentas com rolagem.
2. **Duas Fontes de Verdade Desconectadas:** O que era editado e salvo no Editor TipTap ficava preso no IndexedDB (`draft-current`) e **nunca** atualizava os medicamentos da consulta ativa (`prescriptionItems`).
3. **Falta de Edição Direta na Receita:** Na aba de prescrição, medicamentos só podiam ser movidos ou apagados; não era possível editar dose, posologia ou quantidade sem recriar o item do zero.
4. **Hierarquia Invertida de Botões:** O botão primário chamava-se "Visualizar" e jogava o médico no editor desconectado em vez de emitir diretamente o documento médico ("Imprimir / Gerar PDF").

---

## 2. Diagnóstico Técnico: Por que a Habilidade Marcou 97,5%?

### A. Avaliação Sintática vs Avaliação Semântica/Comportamental
A habilidade que pontuou 97,5% operou sob uma abordagem **estática e baseada em checklist de conformidade**:
- Checava se os componentes TypeScript compilavam (`strict` / tipos exportados).
- Checava se os tokens de Tailwind e Design System atendiam ao `DESIGN.md`.
- Checava se havia classes de acessibilidade (`focus-visible:ring-*`, ARIA labels).
- Checava se havia suíte de testes unitários passando.

Como todos esses itens estruturais existiam, o algoritmo somou os pesos e gerou um falso positivo estrondoso de **97,5%**.

### B. Falha de Malha Aberta (*Open-Loop Evaluation*)
O avaliador não executou testes de **malha fechada (*Closed-Loop User Journey*)**:
- ❌ **Não testou o ciclo de vida do dado:** `Prescrever -> Abrir Editor -> Alterar Texto -> Salvar -> Voltar à Receita -> Verificar se a Receita Reflete a Edição`.
- ❌ **Não testou viewport e ergonomia:** em telas comuns, o botão de imprimir desaparecia por overflow horizontal na toolbar secundária.
- ❌ **Não testou intenção clínica primária:** um receituário existe para ser **emitido** (impresso ou enviado em PDF). A ação primária não podia ser um "Visualizador de texto solto".

---

## 3. Diretrizes para Calibrar as Habilidades do Franklin / Melki

Para impedir que habilidades continuem apresentando notas irreais de 95%+ em sistemas com quebras críticas de fluxo:

1. **Penalidade Gravíssima para Estados Desconectados (-30%):** Se uma tela de edição permite ao usuário alterar dados de uma entidade sem persistir no estado global/origem da verdade da sessão, a nota máxima possível deve ser limitada a **60%**.
2. **Teste de Ciclo Completo (Roundtrip Assertion):** Todo fluxo com múltiplos módulos (ex: Construtor -> Editor -> Impressão) deve possuir asserção de ida e volta comprovada por testes unitários e de integração.
3. **Visibilidade Ergonômica de Ações Críticas (-20%):** Ações fundamentais (ex: Imprimir, Salvar, Emitir) devem residir no primeiro nível visual (cabeçalho/barra fixa) e não podem depender de scroll horizontal.
4. **Alinhamento com a Governança Anti-Teatro:** O score deve ser ponderado pela **eficácia real da tarefa** e não pela contagem de linhas ou conformidade sintática isolada.
