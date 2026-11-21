```yaml
round_id: round-1
persist_path: .context/visual-audits/round-1.md
audit_mode: code-blind-visual-judge
verdict: REJECTED
aesthetic_quality_score: 55/100
plan_contract: C:\Users\melki\dev\repos\PCM\DESIGN.md
media_audited:
  - steps/562/media_0.png  # Desktop Light 1440x900 — Receitas (#prescription)
  - steps/567/media_0.png  # Desktop Dark 1440x900 — Receitas (#prescription)
  - steps/574/media_0.png  # Desktop Dark 1440x900 — Escores CDSS (#scores)
  - steps/581/media_0.png  # Desktop Light 1440x900 — Hospitalar (#hospital)
  - steps/587/media_0.png  # Mobile Light 390x844 — Receitas (#prescription)
motion_video_coverage: UNVERIFIED (apenas capturas estáticas submetidas; transições, modais e drawers exigem vídeo/screencast no Round 2)
```

# Auditoria Visual Code-Blind — PresCMed (`PCM`) — Round 1

> **Veredito (`verdict`):** **`REJECTED`**
> **Nota de Qualidade Estética e Beleza (`aesthetic_quality_score`):** **`55 / 100`**
> **Caminho de Persistência (`persist_path`):** `.context/visual-audits/round-1.md`

---

## 1. Diagnóstico Brutalmente Honesto: Por que "Sempre Parece Faltar Algo" na Identidade Visual do PCM

Sua intuição está **100% correta**. O PresCMed hoje tem cara de **software funcional bem montado por engenheiros**, mas **não tem cara de produto clínico autoral e memorável**. Se taparmos o nome "PresCMed" no canto superior esquerdo, nada na tela diz de forma inconfundível *"isto é o PresCMed"*.

Olhando exclusivamente para os pixels das 5 telas, existem **5 causas-raiz estéticas** que geram essa sensação permanente de algo inacabado ou genérico:

1. **Marca e Assinatura Visual Fracas (Falta um Símbolo Memorável):**
   O logotipo atual (um círculo/squircle azul-marinho escuro genérico com linha de ECG + texto `PresCMed` comum) remete a um ícone genérico de app de monitoramento fitness de 2015. No Dark Mode, o ícone escuro praticamente se funde ao cabeçalho; no Mobile, o nome desaparece e sobra apenas uma bolinha escura anônima ao lado do menu hambúrguer. Não existe assinatura tipográfica, monograma clínico proprietário nem personalidade editorial de marca.
2. **Esquizofrenia Cromática — O PCM Parece 3 Aplicativos Diferentes Costurados Juntos:**
   O `DESIGN.md` promete um sistema mineral sóbrio e autoral (**Mineral Slate Navy `#243447` + Mineral Sage Teal `#115E59` + Carmim `#9F1239`**, com regra `90/8/2` e **zero azul cobalto elétrico ou neon**). Na prática, cada rota fala um idioma visual incompatível:
   - **Receitas (`562`/`567`)**: estéril, monocromática e anêmica — o verde clínico signature (`#115E59`) simplesmente **sumiu** do fluxo principal, deixando botões todos iguais em azul-ardósia opaco.
   - **Escores CDSS (`574`)**: vira subitamente um painel de telemetria/cripto estilo Grafana — explode em **azul cobalto elétrico**, **laranja vibrante** (`Abrir SOFA Completo`), **verde esmeralda neon** (`0 pts` + radar) e **amarelo-ouro** (`★ Fixado`), quebrando frontalmente o `DESIGN.md`.
   - **Hospitalar (`581`)**: adota um terceiro dialeto — SaaS genérico de cartões pastel com card azul-gelo (`+ Admitir Novo Paciente`), brilho azul-bebê em volta do card selecionado, confete de pílulas coloridas (rosa, azul-claro, menta, pêssego) e clichês de "estrelinhas de IA" (`✨`).
3. **Desequilíbrio de Massa no Light Mode + "Sopa de Caixas":**
   No modo claro (`562`, `581`), a barra lateral Deep Navy flutua como um **monólito quase preto com sombra pesada**, abarrotado de 10+ retângulos escuros com bordas brilhantes uns dentro dos outros. No *Squint Test* (semicerrar os olhos), a sidebar escura rouba 100% da atenção do espaço de trabalho médico, fazendo a área de prescrição parecer pálida e secundária.
4. **Ruído Burocrático Acima do Ato Médico (Redundância Crônica de Chrome):**
   Em **todas** as 5 telas, o topo nobre da interface é sequestrado pelo banner permanente `Modo Local • Sem Login (LGPD)` com botões `Backup (.pcm)` e `Cookies & LGPD` — exatamente os mesmos controles que **já aparecem no Header** (ícones de nuvem e escudo) e **de novo no rodapé da Sidebar** (`Backup (.pcm)` e `LGPD`). No Mobile (`587`), o cabeçalho + banner LGPD + faixa de status + abas consomem **~41% da tela** antes do primeiro campo de prescrição. Em `Escores CDSS` (`574`), 4 faixas empilhadas de navegação/atalhos consomem ~340px antes da calculadora começar.
5. **Falta dos 20% Finais de Refinamento Tátil e Editorial ("Craft"):**
   Ausência de título âncora (H1) em Receitas, campos numéricos em "bolhas" excessivamente arredondadas com alinhamento inconsistente (`1` à esquerda vs. `5` centralizado), folha A4 solta sem "bancada/mesa" de enquadramento (no Dark Mode parece um retângulo branco vazado sem profundidade), botões quebrando em 2 linhas (`Evoluir / Leito`), texto órfão quase invisível (`Copiar texto`) e uma epidemia de truncagens com reticências — inclusive em **alergia medicamentosa** e no **radar fisiológico**.

---

## 2. Matriz de Avaliação Estética e Qualidade Visual (6 Pilares)

| Pilar Visual | Nota | Diagnóstico Objetivo (Pixels Observados) |
| :--- | :---: | :--- |
| **1. Identidade de Marca & Memorabilidade** | **48/100** | Logo genérico de ECG em círculo escuro; ausência de assinatura visual proprietária; 3 linguagens visuais distintas entre rotas. |
| **2. Harmonia Cromática & Disciplina `90/8/2`** | **52/100** | Quebra severa do `DESIGN.md` em `Escores CDSS` (cobalto + laranja + neon + amarelo) e `Hospitalar` (brilho azul-bebê + confete pastel); ausência do Mineral Sage Teal (`#115E59`) em `Receitas`. |
| **3. Hierarquia Visual & Squint Test** | **54/100** | Sidebar escura esmaga o Light Mode; `Receitas` sem âncora de título; 4 CTAs sólidos competindo em `Hospitalar`; `Abrir SOFA Completo` laranja ofusca o escore clínico. |
| **4. Composição, Espaço Negativo & Ritmo** | **58/100** | Controles triplicados (`Backup`/`LGPD`); coluna da prévia A4 fragmentada (`40%\|100%` isolado + `Copiar texto` órfão); 41% de chrome acima do formulário no Mobile. |
| **5. Acabamento Tátil & Paridade Light/Dark** | **60/100** | Dark Mode com bordas wireframe uniformes sem Catch-Light zenital; polaridade inconsistente entre inputs vazios e preenchidos; folha A4 sem moldura de bancada no escuro; contraste crítico em ações secundárias. |
| **6. Polimento Tipográfico & Integridade Óptica** | **56/100** | Clippings graves (`Alergia: Dipirona (urticária docum...`, `Pressão Arterial Sistó...`, `ICH Sco`, `Central de Docume...`, item cortado na sidebar); botões em 2 linhas (`Evoluir / Leito`). |
| **MÉDIA GERAL (`aesthetic_quality_score`)** | **55/100** | **Reprovado — exige consolidação de identidade visual, limpeza de ruído estrutural e correção de defeitos ópticos.** |

---

## 3. Lista Numerada de Achados Visuais e Diretivas de Elevação (`V-01` a `V-14`)

### `V-01` — Fragmentação de Identidade Cromática e Violação da Paleta Mineral (`90/8/2`) entre Rotas
- **Severidade:** `P0_BLOCKER`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/574/media_0.png :: área completa do Scoreboard CDSS e Header :: DESIGN.md > Colors (zero azul cobalto elétrico / sem verde neon / 90-8-2)` — A rota `Escores CDSS` abandona a paleta Mineral Slate + Sage Teal e exibe simultaneamente **5 famílias saturadas**: azul cobalto elétrico (`qSOFA`, badge `114`, aba `Calculadora`), laranja vibrante (`Abrir SOFA Completo`), verde esmeralda neon (`0 pts` e radar), amarelo-ouro (`★ Fixado` e `★ RÁPIDO:`) e ciano na sidebar.
  - `[OBSERVED VISUAL FACT]` `steps/581/media_0.png :: grid de leitos e barra de filtros :: DESIGN.md > Colors & Components (Isolamento de Acento)` — A rota `Hospitalar` introduz card preenchido em azul-gelo (`+ Admitir Novo Paciente`), contorno externo azul-bebê brilhante no leito `M. A. S.`, confete de badges em 5 cores pastel e ícones de brilho de IA (`✨`).
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png & steps/567/media_0.png :: botões "+ Inserir na receita" e "Imprimir / Gerar PDF" :: DESIGN.md > Colors (Clinical #115E59) & Components (Isolamento de Acento)` — Em `Receitas`, o Mineral Sage Teal (`#115E59`) desaparece do fluxo principal; ambos os botões usam o mesmo preenchimento escuro, anulando o contraste semântico entre "incluir item" e "emitir/imprimir".
- **Resultado Visual Esperado:** Unificar **100% das rotas** sob uma única gramática cromática mineral e autoral:
  - Base neutra calma (`90%`), bordas e estrutura sutis (`8%`), e no máximo **2 acentos disciplinares**: **Mineral Slate Navy** para emissão/ação estrutural e **Mineral Sage Teal (`#115E59` no claro / versão luminosa refinada no escuro)** como **cor-assinatura clínica viva** (confirmação `+ Inserir na receita`, estados ativos e selos de prontidão).
  - Em `Escores CDSS`, substituir o azul cobalto elétrico pelo Slate/Teal da marca, conter o aviso SSC 2021 em âmbar mineral discreto com botão secundário contornado (não um bloco laranja berrante), e calibrar o escore/radar para esmeralda clínico refinado sem aspecto neon.
  - Em `Hospitalar`, eliminar o card azul-gelo e o halo azul-bebê brilhante; destacar o leito selecionado com borda nítida em Mineral Slate/Teal + marcador lateral sóbrio de 3px, e substituir os ícones de "estrelinha de IA" (`✨`) por símbolos clínicos sóbrios do Material Symbols.

### `V-02` — Truncagens Críticas de Segurança Clínica e Clippings Visuais em Múltiplas Rotas
- **Severidade:** `P0_BLOCKER`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/581/media_0.png :: card M. A. S. (Pront. 48291), badge rosa de alergia :: DESIGN.md > Overview (precisão cirúrgica YMYL) & Typography` — O alerta crítico de segurança do paciente está cortado ao meio: `▲ Alergia: Dipirona (urticária docum...`. Informação de alergia jamais pode ser decepada em pílula estreita.
  - `[OBSERVED VISUAL FACT]` `steps/574/media_0.png :: barra "RÁPIDO:" (centro-direita) e "RADAR FISIOLÓGICO" (canto inferior direito) :: DESIGN.md > Layout & Spacing` — O chip `ICH Sco` está **cortado abruptamente no meio da palavra** contra o seletor de leito, sem máscara de rolagem nem espaçamento; no radar fisiológico, o rótulo `Pressão Arterial Sistó...` está truncado e comprimido na borda inferior do card.
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png, 567/media_0.png, 574/media_0.png, 581/media_0.png :: Sidebar (acima de "Baixar / Instalar App" e itens de navegação) :: DESIGN.md > Layout & Spacing` — Há um **elemento/card parcialmente cortado espiando por baixo da linha divisória** acima do rodapé da sidebar em todas as telas desktop, além de truncagens permanentes em `LOCAL DE ATUAÇÃO (SU...`, `[Municipal] USF Osvaldo Piana ...` e `Central de Docume...`.
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png & 567/media_0.png :: rodapé da coluna da prévia A4 :: DESIGN.md > Typography` — Aviso `Configure nome e CRM do médico para emiti...` está cortado ao lado do botão `Configurar médico`.
  - `[OBSERVED VISUAL FACT]` `steps/587/media_0.png :: input "Fármaco ou princípio ativo *" :: DESIGN.md > Typography` — Placeholder cortado abruptamente em `Ex.: Dipirona 500 mg, Amo`.
- **Resultado Visual Esperado:** **Zero clipping acidental e zero truncagem de informação clínica.**
  - Alergias em `Hospitalar` devem ocupar faixa dedicada com quebra de linha legível (ex.: linha completa em Carmim suave com texto integral visível).
  - Na barra rápida do CDSS, aplicar rolagem limpa com fade lateral nítido ou limitar o número de atalhos visíveis sem decepar palavras; dar respiro generoso ao `Radar Fisiológico` com rótulos curtos e legíveis (`PA Sistólica`, `FR`, `Consciência`) sem encostar nas bordas.
  - Na sidebar, eliminar o vazamento/corte acima do rodapé (área rolável com separação limpa e fade) e ajustar os rótulos para caberem integralmente sem `...` (`Documentos`, `Unidade / Local`).
  - Redigir o aviso de CRM e placeholders de forma concisa para que caibam integralmente sem reticências em 1440px e 390px.

### `V-03` — Contraste Óptico Falho em Ações Secundárias e Polaridade Inconsistente no Dark Mode
- **Severidade:** `P0_BLOCKER`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/567/media_0.png :: coluna direita inferior ("WhatsApp" e "Copiar texto") :: DESIGN.md > Colors (APCA / WCAG AA)` — No Dark Mode, o botão `WhatsApp` e o botão órfão `Copiar texto` têm texto cinza-escuro sobre fundo azul-marinho escuro, ficando praticamente ilegíveis.
  - `[OBSERVED VISUAL FACT]` `steps/567/media_0.png :: card "Prescrição" (inputs vazios vs. inputs preenchidos) :: DESIGN.md > Colors (--surface-sunken) & Elevation & Depth` — Campos preenchidos (`30 comprimidos`, `1`, `Comprimido`, `8/8h`, `5`, `Uso Oral`) exibem fundo significativamente **mais claro** que o card, enquanto campos vazios (`Ex.: Maria...`, `Ex.: Dipirona...`, `Ex.: Tomar...`) ficam mais escuros — criando um mosaico visual incoerente no mesmo formulário.
  - `[OBSERVED VISUAL FACT]` `steps/567/media_0.png :: contornos de todos os cartões e botões primários :: DESIGN.md > Elevation & Depth (Catch-Light zenital e elevação L=0.14->0.18->0.22)` — Todos os cartões usam uma borda cinza uniforme nos 4 lados (efeito *wireframe* achatado) sem luminosidade especular superior (*catch-light*), e os botões primários (`+ Inserir na receita`, `Imprimir / Gerar PDF`) assumem um azul-acinzentado lavado que aparenta estado desabilitado.
- **Resultado Visual Esperado:**
  - Todos os campos de entrada no Dark Mode devem compartilhar **uma única superfície côncava coerente** (levemente mais funda que o card), diferenciando estado preenchido apenas pela nitidez da tinta do texto (`#F1F5F9` vs. placeholder legível), jamais mudando a cor de fundo do campo.
  - Ações secundárias e desabilitadas (`WhatsApp`, `Copiar texto`) devem manter legibilidade clara (contraste perceptível mesmo quando inativas, com indicação limpa de estado desabilitado e agrupamento em uma única barra de ações).
  - Aplicar elevação real por camadas de luminosidade + fio especular sutil no topo dos cartões (`catch-light`) e bordas laterais/inferiores discretas, trocando o azul lavado dos CTAs por um acento sólido nítido e autoritário.

### `V-04` — Identidade de Marca Genérica (Logotipo, Wordmark e Assinatura Editorial Ausentes)
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png, 567/media_0.png, 574/media_0.png, 581/media_0.png, 587/media_0.png :: canto superior esquerdo do Header :: DESIGN.md > Overview (Identidade Canônica)` — O ícone da marca é uma esfera/squircle azul-escura com brilho genérico e pulso de ECG, acompanhada de `PresCMed` sem tratamento tipográfico distintivo. No Dark Mode (`567`, `574`), o emblema escuro desaparece no cabeçalho; no Mobile (`587`), o nome some e resta uma bolinha escura irreconhecível.
- **Resultado Visual Esperado:** Elevar a assinatura de marca para o padrão de instrumento médico suíço contemporâneo:
  - Substituir o ícone genérico de ECG em círculo escuro por um **símbolo geométrico proprietário e nítido** em alta definição (ex.: monograma clínico minimalista combinando folha/Rx ou cruz arquitetônica precisa em **Mineral Slate + filete Mineral Sage Teal**), legível em fundo claro e escuro sem depender de halo neon.
  - Dar peso e ritmo tipográfico ao wordmark **`PresCMed`** (ex.: contraste de peso sutil `PresC` + `Med` ou assinatura com micro-etiqueta discreta de módulo/versão clínica) e preservar reconhecimento de marca no Mobile (`PCM` compacto ao lado do ícone).

### `V-05` — Excesso de Ruído Burocrático e Triplicação de Controles (`Banner LGPD` + `Backup` + Navegação Duplicada)
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png, 567/media_0.png, 574/media_0.png, 581/media_0.png, 587/media_0.png :: topo do workspace, canto direito do Header e rodapé da Sidebar :: DESIGN.md > Overview (ergonomia anti-TDAH)` — O banner `Modo Local • Sem Login (LGPD)` ocupa faixa de destaque no topo de TODAS as vistas e repete `Backup (.pcm)` e `Cookies & LGPD`, controles que já estão duplicados no Header (ícones nuvem + escudo) e na base da Sidebar (`Backup (.pcm)` + `LGPD`).
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png & 567/media_0.png :: Sidebar vs. Workspace :: DESIGN.md > Components (Navegação em 3 Camadas)` — `Configurar médico`, `Identificar paciente`, `Scores 114` e `Hospitalar` aparecem duplicados simultaneamente em dois lugares da mesma tela, gerando indecisão visual.
- **Resultado Visual Esperado:**
  - Remover o banner LGPD permanente do topo do fluxo clínico. Consolidar privacidade/modo local em um **selo compacto e elegante no Header** (ex.: escudo discreto com tooltip/popover `100% Local • LGPD` + acesso a Backup/Cookies), liberando imediatamente ~72px de respiro vertical no desktop e ~140px no mobile.
  - Eliminar a duplicação de `Backup` e `LGPD` na base da sidebar e definir hierarquia clara entre Header (alternância de macro-módulo + contexto de atendimento + busca global) e Sidebar (navegação interna do módulo ativo, sem repetir abas de outro nível).

### `V-06` — Desequilíbrio de Massa da Sidebar Escura Flutuante e "Caixa Dentro de Caixa"
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png & 581/media_0.png :: Sidebar esquerda no Modo Claro :: DESIGN.md > Overview & Elevation & Depth` — A sidebar Deep Navy flutua desconectada com cantos muito arredondados e sombra pesada sobre um canvas muito claro, abrigando mais de 10 blocos internos com bordas individuais (`LOCAL DE ATUAÇÃO`, `Configurar médico`, `Identificar paciente`, `Baixar / Instalar App`, `Novo Atendimento`, `Backup`, `LGPD`). No *Squint Test*, a sidebar pesa mais que o conteúdo médico inteiro.
- **Resultado Visual Esperado:**
  - Ancorar visualmente a sidebar com elegância arquitetônica (ou suavizar sua presença no Light Mode para um rail limpo e integrado ao perímetro, sem sombra "pesada" de cartão flutuante), removendo as bordas individuais de cada item de ação interno.
  - Trocar a pilha de 3 botões pesados no rodapé (`Baixar / Instalar App` + `Novo Atendimento` + `Backup/LGPD`) por um rodapé silencioso de 1 linha (`Novo Atendimento` discreto + ação de instalar app movida para menu/popover quando não instalado).

### `V-07` — Colapso da Primeira Dobra no Mobile (41% da Tela Consumida por Chrome)
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/587/media_0.png :: metade superior da viewport 390x844 :: DESIGN.md > Layout & Spacing & Overview (ergonomia anti-TDAH)` — Header abarrotado com 7 controles (incluindo pílula larga `Baixar App`) + banner LGPD de 2 blocos + card `CRM pendente • Sem paciente` + barra `Prescrever medicamentos | Visualizar receita (0)` consomem ~345px de altura antes do início do formulário. O botão principal `+ Inserir na receita` desaparece abaixo da dobra e o campo `Posologia` colide com a barra inferior.
- **Resultado Visual Esperado:**
  - Enxugar o Header mobile para no máximo 4 elementos limpos (`Menu`, `Logo + PCM`, `Busca`, `Tema/Status`), retirando `Baixar App`, `Nuvem` e `Escudo` da barra principal (levando-os para o menu lateral/status).
  - Remover o banner LGPD da primeira dobra e compactar o alerta `CRM pendente` em uma micro-faixa sutil integrável ao topo do formulário, trazendo o bloco `Prescrição` e o botão `+ Inserir na receita` para cima com folga confortável acima da `MobileBottomNav`.

### `V-08` — Falta de Âncora Tipográfica (`H1`) e Bancada A4 Desarticulada em `Receitas`
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png & 567/media_0.png :: coluna esquerda e coluna direita de Receitas :: DESIGN.md > Typography (Hierarquia em 3 Níveis — Squint Test) & Overview (Workbench Split-View)` — A vista `Receitas` não possui cabeçalho de contexto/âncora (`Nível 1`); começa direto em 3 cartões de mesmo peso visual. Na coluna direita, a prévia A4 aparece sem moldura de "mesa/bancada", com texto solto acima, um controle `40% | 100%` isolado desperdiçando uma linha inteira, o aviso de CRM truncado abaixo e o botão `Copiar texto` solto e órfão em uma linha separada. No Dark Mode (`567`), o papel A4 branco puro fica colado direto no fundo escuro sem moldura nem sombra de profundidade, parecendo um recorte abrupto.
- **Resultado Visual Esperado:**
  - Introduzir um **cabeçalho editorial enxuto e autoral** no topo da vista (título nítido + contexto ativo: unidade/via sanitária + status do paciente/CRM em 1 linha limpa).
  - Envolver toda a coluna direita em um **Estúdio/Bancada de Prévia A4 coeso**: topo unificado com as abas de tipo de receita (`Simples | Antimicrobiano | Controle especial`) + zoom compacto `40% | 100%` na **mesma linha**; palco sutil em tom neutro-mineral (rebaixado no claro e grafite macio no escuro) com sombra zenital realista emoldurando a folha A4 branca como papel físico de alta qualidade; e barra de ações unificada em 1 única linha limpa (`Imprimir / Gerar PDF` como único CTA sólido + `Editor A4` + menu/ícones limpos para `WhatsApp` e `Copiar texto`).

### `V-09` — Sobrecarga de 4 Camadas de Chrome no Topo do `Scoreboard CDSS` (`#scores`)
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/574/media_0.png :: faixa superior entre Header e card qSOFA :: DESIGN.md > Components (Navegação em 3 Camadas) & Overview` — Antes do escore clínico começar, o usuário enfrenta: (1) banner LGPD, (2) título `Scoreboard CDSS`, (3) `← Voltar ao Leito` + 4 abas grandes, (4) breadcrumb de texto e (5) barra `★ RÁPIDO:` com 10 pílulas + seletor de leito + busca. São ~340px (quase 40% da tela) só de cabeçalhos e navegação.
- **Resultado Visual Esperado:** Consolidar o topo do `Scoreboard CDSS` em **no máximo 2 faixas enxutas**:
  - Faixa 1: Breadcrumb discreto / retorno ao leito + título + trilho segmentado das 4 visões (`Calculadora`, `Catálogo 114`, `BIC`, `EPARADA & INCA`) + seletor de leito compacto na mesma barra.
  - Faixa 2: Barra de atalhos rápidos limpa com busca integrada (sem o ícone de estrela amarela `★ RÁPIDO:` que conflita com a iconografia clínica) e sem corte de texto.

### `V-10` — Duplicação de CTAs, 4 Botões Primários Concorrentes e Botões Quebrando em 2 Linhas no `Hospitalar`
- **Severidade:** `P1_HIGH`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/581/media_0.png :: barra superior e 3 cards do grid de leitos :: DESIGN.md > Components (Isolamento de Acento 90/8/2) & Typography` — A ação de admitir paciente aparece duas vezes (`+ Admitir Paciente` no cabeçalho e o card gigante `+ Admitir Novo Paciente` com `+ Cadastro Rápido` na 1ª coluna). Há **4 botões sólidos escuros simultâneos** competindo por atenção, e o botão `Evoluir Leito` nos dois cards de pacientes **quebra em 2 linhas (`Evoluir` / `Leito`)** apertadas, assim como `Colar Prontuário / IA`.
- **Resultado Visual Esperado:**
  - Manter apenas **1 ponto primário claro** para admissão (`+ Admitir Paciente` no cabeçalho — ou card compacto de entrada apenas quando o censo estiver vazio), liberando a grade para os leitos reais respirarem com amplitude.
  - Rebaixar `Evoluir Leito` nos cards para botão secundário/tonal elegante (ou elevar apenas o leito em foco), garantindo **rótulos em 1 única linha** com largura equilibrada (`Evoluir`, `Exames (3)`, ícones alinhados).

### `V-11` — Geometria Infantilizada ("Bolhas") em Inputs, Alinhamento Numérico Incoerente e Setas de Select Desalinhadas
- **Severidade:** `P2_MEDIUM`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png, 567/media_0.png, 587/media_0.png :: card "Prescrição" (linha Dose / Apresentação / Frequência / Duração / Via) :: DESIGN.md > Shapes (Raios Concêntricos: inputs 8-14px) & Typography (tabular-nums)` — Os inputs curtos (`Dose`, `Duração`, `Peso`) têm arredondamento excessivo que os deixa com aparência inchada/amadora em relação aos cards; o valor `1` em `Dose` está alinhado à esquerda enquanto `5` em `Duração (dias)` está centralizado; e as setas nativas (`v`) dos campos `<select>` ficam coladas na borda direita com traço agressivo.
- **Resultado Visual Esperado:**
  - Aplicar **geometria cirúrgica com raios concêntricos reais** (cards ~16px, inputs 8px–10px nítidos e proporcionais).
  - Padronizar alinhamento numérico tabular (`tabular-nums`) coerente em `Dose`, `Duração` e `Peso`, com chevrons vetoriais sutis e espaçamento interno uniforme à direita em todos os seletores.
  - Remover o badge duplicado `Ctrl+K` de dentro do campo `Fármaco` (já existe no Header), mantendo apenas um atalho visual limpo caso a busca do fármaco tenha gatilho próprio distinto.

### `V-12` — Contradição de Microcopy na Área Vazia de `Medicamentos prescritos`
- **Severidade:** `P2_MEDIUM`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/562/media_0.png & 567/media_0.png :: card "Medicamentos prescritos" (estado vazio) :: DESIGN.md > Components (UIState empty)` — O texto instrui *"Busque acima ou aplique um kit de plantão na barra lateral"*, porém nenhum "kit de plantão" está visível na barra lateral (o conteúdo inferior da sidebar está oculto/cortado acima do rodapé).
- **Resultado Visual Esperado:** Transformar o estado vazio de `Medicamentos prescritos` em um ponto de conveniência elegante e verdadeiro: exibir 2–3 pílulas discretas de acesso rápido a modelos/kits clínicos ali mesmo (ou alinhar o texto exatamente aos controles visíveis `Modelos (3)` e `+ Novo modelo` no cabeçalho do próprio card).

### `V-13` — Inconsistência de Ícones (Estrelas Amarelas, Brilhos "IA" e Cores Aleatórias de Ícones)
- **Severidade:** `P2_MEDIUM`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/574/media_0.png & 581/media_0.png & 562/media_0.png :: cabeçalhos de cards, botões IA e atalhos CDSS :: DESIGN.md > Iconography` — Os ícones oscilam entre azul-ciano vivo, verde-esmeralda, amarelo-ouro (`★ Fixado`, `★ RÁPIDO:`), azul-brilho de IA (`✨`) e cinza neutro, sem critério semântico unificado.
- **Resultado Visual Esperado:** Adotar disciplina iconográfica monocromática/tonal: ícones de estrutura sempre em tinta secundária neutra; cor nos ícones reservada exclusivamente a **status clínico real** (Verde Sage para prontidão/normalidade, Âmbar para atenção, Carmim para alergia/perigo) e eliminação de estrelas amarelas chamativas e clichês de "sparkles".

### `V-14` — Barra Inferior Mobile (`MobileBottomNav`) Pesada e Sem Foco Elegante
- **Severidade:** `P3_NIT`
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/587/media_0.png :: rodapé fixo 390x844 :: DESIGN.md > Components (MobileBottomNav)` — O item ativo `Receitas` usa uma caixa retangular pesada com borda cinza que quase encosta no limite superior da barra, dando aspecto "encaixotado".
- **Resultado Visual Esperado:** Substituir a caixa bordada por um indicador ativo minimalista e refinado (pílula suave translúcida ou barra superior luminosa de 2px em Sage/Ice + ícone preenchido nítido), garantindo respiro interno de pelo menos 6px nas bordas superior e inferior.

---

## 4. Direção Criativa Escolhida: Direção A ("Instrumento Suíço + Papel Editorial Médico")

1. **Assinatura de Marca "Precisão Suíça + Papel Editorial Médico":** Mineral Slate Navy `#243447` + pedra fria limpa (`#EFF3F8`/`#FFFFFF` no claro, `#141C27`/`#243042`/`#2C3B50` escalonado no escuro) + **Mineral Sage Teal (`#115E59` / `#2DD4BF`)** como *pulso único da marca* + bancada física emoldurando a folha A4 com *Cormorant Garamond*.
2. **Silêncio Visual (Menos Bordas, Mais Hierarquia e Espaço Negativo).**
3. **Um Só Sistema, Zero Clichês de Template** (banir azul cobalto elétrico, laranja berrante, halo azul-bebê e sparkles de IA).
