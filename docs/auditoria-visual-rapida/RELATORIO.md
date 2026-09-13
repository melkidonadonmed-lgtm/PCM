# Auditoria visual rápida — Prescrição

Data: 10/09/2026.

## Escopo e objetivo

Revisão do início do fluxo de prescrição em 390 × 844 px, nos temas claro e escuro, e em 1440 × 1000 px no tema claro. O objetivo é identificar ajustes pequenos de cor e posição que tornem a próxima ação mais evidente.

**Status:** as recomendações de baixo esforço abaixo foram aplicadas e verificadas novamente em 390 × 844 px e 1440 × 1000 px, nos temas claro e escuro.

## Etapas observadas

1. **Mobile claro — atenção necessária.** O stepper quebra em três linhas e ocupa muito espaço. O verde-menta de “Revisar e exportar” parece uma ação disponível apesar de o botão estar desabilitado. O compositor inteiro com opacidade reduzida parece indisponível ou com falha.
2. **Mobile escuro — atenção necessária.** O verde saturado do terceiro passo compete com o navy principal. Cinzas semelhantes representam etapa futura, botão bloqueado e conteúdo desabilitado, enfraquecendo a diferença entre esses estados.
3. **Desktop claro — saudável com oportunidades de simplificação.** A estrutura em duas colunas funciona, mas a folha A4 vazia chama mais atenção que a identificação do paciente. A ação “Novo Atendimento Completo” em ciano também ganha destaque maior que sua frequência de uso justifica.

## Pontos positivos

- Navy, branco e creme formam uma base coerente entre os temas.
- Cabeçalho e navegação móvel permanecem reconhecíveis.
- Campos do paciente aparecem antes da composição.
- Os filtros compactados preservam área de toque e cabem melhor na tela.

## Recomendações de baixo esforço

1. **Compactar o stepper mobile em uma única linha.** Usar três segmentos curtos: “Paciente”, “Medicamento” e “Receita”. Estado atual em navy/creme, concluído com um ponto esmeralda e futuro em slate neutro.
2. **Reservar esmeralda apenas para sucesso concluído.** Trocar o verde-menta do passo futuro por slate. Quando “Revisar e exportar” estiver disponível, usar o mesmo navy do botão primário no claro e creme com texto navy no escuro.
3. **Parar de reduzir a opacidade do compositor inteiro.** Manter título e estrutura legíveis; desabilitar somente os controles e exibir uma linha curta: “Confirme o paciente para liberar a prescrição”.
4. **Aproximar a confirmação dos dados do paciente.** Levar “Calcular dose por peso” e “Confirmar paciente” para dentro do card de identificação, abaixo dos campos. Isso reduz a área solta entre os cards e deixa clara a relação entre dados e confirmação.
5. **Simplificar o preview vazio no desktop.** Antes do primeiro medicamento, mostrar um card compacto com “A receita aparecerá aqui”. Renderizar a folha A4 completa após adicionar o primeiro item.
6. **Reduzir destaques secundários na sidebar.** Usar texto claro neutro em “Novo Atendimento Completo”; reservar ciano para foco ou informação, e vermelho apenas para ações destrutivas.
7. **Diminuir sombras internas.** Manter sombra nos cards principais e usar apenas fundo + borda sutil em campos, filtros e blocos internos.

## Direção de paleta

- Primário claro: navy `#142032` com texto branco.
- Primário escuro: creme/baunilha com texto navy, seguindo o design system existente.
- Sucesso: esmeralda somente após conclusão ou confirmação.
- Futuro/desabilitado claro: `#E2E8F0` com texto `#64748B`.
- Futuro/desabilitado escuro: `#263244` com texto `#94A3B8`.

## Limites

As capturas permitem avaliar hierarquia, cor, espaçamento e reflow. Contraste calculado, navegação por teclado, leitores de tela e zoom precisam de testes próprios; este relatório não declara conformidade integral com WCAG.

## Evidências

- [01-mobile-claro.png](01-mobile-claro.png)
- [02-mobile-escuro.png](02-mobile-escuro.png)
- [03-desktop-claro.png](03-desktop-claro.png)
