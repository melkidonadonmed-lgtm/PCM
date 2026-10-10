# PresCMed: confiabilidade do Editor e correcoes prioritarias de UI

**Data:** 2026-09-29  
**Status:** proposta para revisao; nenhuma implementacao autorizada por este documento ainda  
**Escopo:** Editor de documentos, navegacao mobile, semantica/acessibilidade das telas auditadas e polimento visual localizado.

## Contexto e evidencias

A aplicacao e uma SPA React 19/Vite client-side. A suite atual passou com 48 testes; `npm run lint`, `npm run build` e `npm run design:lint` tambem passaram. O build avisa que o bundle principal excede 500 kB.

A falha relatada no Editor foi reproduzida no site publicado e no preview de producao local. A captura do runtime instrumentado mostra `Uncaught Error: [tiptap error]: The editor view is not available. Cannot access view['dom']. The editor may not be mounted yet.`; em seguida, `#root` fica vazio. A leitura de `editor.view.dom` em `DocumentEditorView.tsx` ocorre num efeito de sincronizacao executado antes de a view do Tiptap estar disponivel. O componente tambem adiciona `CustomUnderline` junto de `StarterKit`; a versao instalada do StarterKit ja inclui `Underline`, confirmando a duplicacao que gerou warnings.

A varredura com Chrome 154, Playwright Core e axe-core 4.13 cobriu os estados principais em 320, 390, 768, 1024 e 1440 px; os temas claro e escuro foram verificados na tela inicial. Oito estados abriram; o Editor falhou em cinco execucoes. Achados relevantes:

- O backdrop mobile e um `div` clicavel com `aria-label`, atributo proibido sem role.
- O atestado tem texto azul com contraste medido de 3,84:1 para texto normal.
- A pre-visualizacao insere um segundo `main` dentro do landmark `main` da aplicacao.
- Ao selecionar destinos pela Sidebar em mobile, o estado de gaveta nao e fechado; o foco pode continuar em conteudo coberto.
- Filtros de categoria de calculadora e exames excedem seus containers rolaveis em cerca de 23-25 px a 390 px; a raiz esconde o overflow horizontal da pagina.
- O axe reporta falta de `h1`, labels unicas em navs e acessibilidade de regiao rolavel na pre-visualizacao.

As capturas e os artefatos completos da varredura estao em `%TEMP%/prescmed-audit-20260929/runtime/`; nao sao arquivos do repositorio.

## Objetivos

1. Abrir o Editor sem erro de runtime em desktop e mobile, em tema claro e escuro.
2. Manter a aplicacao utilizavel se uma falha futura do Editor ocorrer, sem desmontar toda a SPA.
3. Preservar o fluxo de sincronizacao da receita ativa, rascunho local, modelos, cabecalho e folha A4.
4. Corrigir os problemas confirmados de navegação mobile, semantica, landmarks, contraste e filtros, sem alterar regras clinicas.
5. Verificar visualmente e por automacao os fluxos afetados em larguras representativas.

## Fora de escopo

- Alterar doses, concentracoes, medicamentos, protocolos, CID, consentimento, posologias ou texto legal.
- Emitir ou compartilhar documentos de teste.
- Redesenhar a identidade visual ou substituir o design system.
- Refatorar a divisao geral de bundles ou a fonte de icones de 4 MB; registrar para etapa futura apos medir impacto.
- Declarar conformidade WCAG com base apenas em axe.

## Design proposto

### 1. Inicializacao resiliente do Tiptap

Remover a leitura prematura de `editor.view.dom` do efeito geral de sincronizacao. Sincronizar o DOM em callbacks do ciclo de vida do Tiptap que so executam com a view montada, preservando `onUpdate` e as atualizacoes de conteudo externo. Usar o `Underline` ja fornecido pelo `StarterKit` ou, se a verificacao de comportamento mostrar diferenca, desabilitar o built-in explicitamente antes de manter a extensao customizada; nao manter duas extensoes com o mesmo nome.

Envolver apenas o painel lazy do Editor em um Error Boundary com fallback pt-BR, acao para voltar a Receitas e tentativa explicita de remontar o Editor. Uma falha do Editor nao deve remover Header, Sidebar nem o restante da aplicacao. O fallback nao deve mostrar stack traces nem dados clinicos.

### 2. Navegacao mobile e semantica

Fechar a gaveta mobile ao escolher qualquer destino; manter os itens da gaveta fora da ordem de foco quando fechada. Tornar o backdrop decorativo para tecnologia assistiva e manter uma acao de fechamento acessivel dentro da Sidebar. Revisar Escape/foco ao abrir e fechar sem alterar a navegacao desktop.

Dar nome acessivel distinto aos landmarks de navegacao secundarios. Remover o `main` aninhado da pre-visualizacao, usando uma secao com nome acessivel dentro do `main` existente. Garantir um unico `h1` significativo por aplicacao/tela, mantendo os titulos de secao atuais em niveis subordinados.

### 3. Contraste, alvos e filtros

Trocar a cor de texto reprovada por token semantico existente, medindo o contraste nos dois temas. Ajustar filtros de categoria em mobile para que os itens nao sejam cortados sem indicacao; preferir quebra de linha ou manter rolagem horizontal com indicacao visual clara e foco acessivel, de acordo com o espaco medido nas capturas. Priorizar alvos de toque frequentes para 44 px quando isso nao criar sobreposicao nem alterar a folha A4.

O polimento visual sera localizado: hierarquia consistente, controles mais faceis de tocar, e melhor descoberta de filtros; sem troca de paleta, fontes ou layout global.

## Alternativas consideradas

- **Apenas remover `CustomUnderline`:** elimina warnings, mas nao corrige o getter da view antes da montagem nem impede a SPA de colapsar em futuras falhas. Rejeitada como solucao completa.
- **Error Boundary global:** protege a arvore toda, mas um problema localizado no Editor nao justifica introduzir um estado de erro global. Preferida a fronteira local no Editor.
- **Reprojetar a interface inteira:** ampliaria risco e revisao sem necessidade. Preferidas correcoes pontuais compatíveis com `DESIGN.md`.

## Validacao e criterios de aceite

1. `npm run test`, `npm run lint`, `npm run build` e `npm run design:lint` passam.
2. Navegar para o Editor, aguardar o carregamento, editar texto ficticio, sair e voltar; a view permanece montada, a sincronizacao e o rascunho continuam funcionando e nao ha erro de console nem warning de `underline` duplicado.
3. Simular uma falha controlada do painel do Editor em teste de runtime; o fallback local aparece, as outras telas continuam acessiveis e a acao de retorno funciona.
4. Em 390 px, abrir a gaveta, navegar para atestado, exames e protocolos: a gaveta fecha, o foco nao fica atras do overlay e a navegação inferior permanece utilizavel.
5. Em 320/390 px, verificar filtros de exames e categorias; nenhuma pagina ganha overflow horizontal oculto e todos os filtros ficam descobríveis e acionaveis por teclado/toque.
6. axe nao reporta as falhas corrigidas de ARIA proibido, contraste do texto ajustado, landmark main duplicado, regiao rolavel sem teclado ou landmark de navegacao sem nome. Outros avisos remanescentes devem ser reportados com evidencias.
7. Revalidar os documentos na tela de impressao em tema claro/escuro: folha A4 branca, texto escuro, sem alteracao de conteudo clinico/legal.
8. Repetir capturas e verificacoes nos dois temas e em pelo menos 390/1440 px para os fluxos alterados; executar a varredura completa em 320, 390, 768, 1024 e 1440 px.

## Plano de trabalho apos aprovacao

1. Corrigir o ciclo de vida do Editor e a duplicacao de underline; acrescentar Error Boundary local.
2. Corrigir navegacao mobile, backdrop, landmarks e labels.
3. Ajustar contraste, filtros e alvos de toque com base nas capturas.
4. Rodar testes, lint, build, design lint, verificacao de UI/PDF e varredura runtime; comparar as novas capturas e relatar defeitos que permanecerem.
5. Atualizar a skill Modern Web Guidance no cache de plugin VS Code a partir da fonte oficial `2026_09_04-7de96777`. O updater oficial nao reconheceu a instalacao gerenciada pelo plugin; preservar o destino instalado e evitar criar uma segunda skill concorrente.

## Decisoes pendentes

- Aprovar esta especificacao antes de criar o plano de implementacao.
- Confirmar se filtros de categoria devem quebrar em multiplas linhas no mobile ou continuar em faixa rolavel com indicador visual; recomendacao: quebra em mobile, faixa rolavel somente se as capturas mostrarem que a altura adicional prejudica a tela.
- Confirmar que a atualizacao da skill deve substituir a copia no cache do plugin VS Code, em vez de instalar uma copia separada.
