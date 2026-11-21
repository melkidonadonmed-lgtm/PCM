```yaml
round_id: round-2
persist_path: .context/visual-audits/round-2.md
audit_mode: code-blind-visual-judge
verdict: REJECTED
aesthetic_quality_score: 81/100
plan_contract: C:\Users\melki\dev\repos\PCM\DESIGN.md
previous_audit: C:\Users\melki\dev\repos\PCM\.context\visual-audits\round-1.md
media_audited:
  - steps/929/media_0.png   # Desktop Light 1440x900 — Receitas (#prescription)
  - steps/934/media_0.png   # Desktop Dark 1440x900 — Receitas (#prescription)
  - steps/945/media_0.png   # Desktop Light 1440x900 — Escores CDSS (#scores)
  - steps/941/media_0.png   # Desktop Dark 1440x900 — Escores CDSS (#scores)
  - steps/952/media_0.png   # Desktop Light 1440x900 — Hospitalar (#hospital)
  - steps/956/media_0.png   # Desktop Dark 1440x900 — Hospitalar (#hospital)
  - steps/1014/media_0.png  # Mobile Light 390x844 — Receitas (#prescription)
  - steps/1019/media_0.png  # Mobile Dark 390x844 — Receitas (#prescription)
  - scratch/round2-transitions.mp4  # Vídeo de Transições, Breakpoint 975px & Modal (00:00–02:14)
motion_video_coverage: VERIFIED (com apontamentos no breakpoint 975px, contenção modal e flashes de transição)
```

# Auditoria Visual Code-Blind — PresCMed (`PCM`) — Round 2

> **`verdict`:** **`REJECTED`**
> **`aesthetic_quality_score`:** **`81 / 100`** *(salto expressivo de `+26` pontos sobre os `55/100` do Round 1, porém ainda barrado por apontamentos `P1_HIGH` na barra lateral, no breakpoint `975px`, no modal de admissão e em transições do vídeo)*
> **`persist_path`:** `.context/visual-audits/round-2.md`

---

## 1. Veredito Geral & Análise de Qualidade Estética (Direção A — Instrumento Suíço + Papel Editorial)

O salto visual do **Round 1 → Round 2** é inegável. O PresCMed deixou de parecer "três aplicativos desconexos costurados juntos" e finalmente apresenta uma **gramática autoral coesa de Instrumento Médico Suíço + Papel Editorial** nas 3 rotas principais (`#prescription`, `#scores` e `#hospital`):

- **Assinatura de Marca (`BrandMark` + Tipografia):** O novo emblema geométrico (cruz clínica arquitetônica com acento Mineral Sage Teal dentro de squircle Slate Navy) + wordmark **`PresCMed`** (`PresC` em Slate/Branco + `Med` em Sage Teal) e sua forma compacta **`+ PCM`** no mobile criam reconhecimento imediato em Light e Dark Mode.
- **Harmonia Cromática Mineral (`#243447` + `#115E59` / `#2DD4BF`):** O azul cobalto elétrico, o laranja gritante do botão SOFA, o verde neon, o halo azul-bebê de `Hospitalar`, as estrelas amarelas (`★`) e os brilhos de IA (`✨`) foram eliminados. A paleta agora respira sob a disciplina `90/8/2`: superfícies minerais calmas, **Mineral Sage Teal** como pulso clínico vivo (`+ Inserir na receita`, `Evoluir Leito` no leito ativo, `0 pts`, `qSOFA`, indicador da `MobileBottomNav`) e **Mineral Slate Navy** para emissão/ação estrutural (`Imprimir / Gerar PDF`, `+ Admitir Paciente`).
- **Editorial A4 & Bancada (`a4-bench-stage`):** A introdução do cabeçalho editorial (`Prescrição Médica — Instrumento clínico • prévia simultânea em folha A4`) e da bancada rebaixada emoldurando a folha física A4 (com zoom `35% | 100%` integrado no canto do palco e zero corte no aviso de CRM) transformou o lado direito de `Receitas` em um estúdio de impressão convincente nos dois temas.
- **Paridade Light/Dark e Primeira Dobra Mobile:** Todos os inputs em Dark Mode (`934`, `941`, `956`, `1019`) agora compartilham a mesma cavidade escura coerente (fim do mosaico entre campos vazios e preenchidos), com elevação por camadas e *catch-light* sutil no topo dos cartões. No Mobile `390×844` (`1014`, `1019`), a remoção do banner LGPD e o enxugamento do header para 4 itens permitiram que todo o formulário de `Prescrição` e o botão **`+ Inserir na receita`** apareçam integralmente acima da dobra.

### Por que ainda é `REJECTED` (`81/100`) e não `PASSED` (`>= 85/100` e zero `P1`)?
Apesar da excelência estética alcançada nas telas estáticas de Desktop (`1440px`) e Mobile (`390px`), a inspeção rigorosa do **Round 2** identificou **4 bloqueadores `P1_HIGH`** que impedem a aprovação imediata:
1. **Quebra severa de contenção modal e flashes no vídeo (`round2-transitions.mp4`):** ao abrir o modal `Nova Admissão` (`01:43–01:58`), a `MobileBottomNav` permanece totalmente iluminada em primeiro plano fora do backdrop escuro e o subtítulo do modal é cortado (`...completo sem deu...`); além disso, há um **flash branco de tela vazia** na troca de rota (`02:06`) e **flickers pálidos/ghosting** em transições no Dark Mode (`01:26`, `01:37`).
2. **Regressão visual no breakpoint intermediário (`975px` no vídeo `00:44–02:14`):** o botão `Baixar App` reaparece no header junto com duplicação direta de duas barras `Ctrl+K` empilhadas, as abas internas do `Hospitalar` quebram em **3 linhas** (`01:24`, `01:59`), os chips do `Mapa de Leitos` truncam, e a barra inferior de ações em `Receitas` (`02:07–02:14`) deixa `Copiar texto` isolado à direita e encobre parte do aviso de CRM atrás dela.
3. **Barra lateral estática inalterada quanto à densidade (`V-06` `UNCHANGED`):** na Sidebar esquerda (`929`, `934`, `945`, `941`, `952`, `956`), persistem as múltiplas bordas "caixa dentro de caixa" (`LOCAL DE ATUAÇÃO`, `Configurar médico`, `Identificar paciente`) e a pilha pesada de 3 linhas no rodapé (`Baixar / Instalar App` sólido + `Novo Atendimento` + `Backup (.pcm)` / `LGPD` duplicando o Header).
4. **Botão `Copiar texto` órfão em Desktop `#prescription` (`929`, `934`):** permanece isolado sozinho numa 2ª linha sob os botões da prévia A4.

---

## 2. Matriz de Avaliação Estética (Evolução Round 1 → Round 2)

| Pilar Visual | Round 1 | Round 2 | Diagnóstico Objetivo (Pixels e Vídeo Observados) |
| :--- | :---: | :---: | :--- |
| **1. Identidade de Marca & Memorabilidade** | 48 | **86** | Novo monograma `+ PresCMed` / `+ PCM` e linguagem suíço-editorial unificada nas 3 rotas; identidade autoral imediatamente reconhecível. |
| **2. Harmonia Cromática & Disciplina `90/8/2`** | 52 | **89** | Azul cobalto, laranja vibrante, neon e estrelas amarelas eliminados. Mineral Slate Navy + Mineral Sage Teal governam o sistema inteiro com sobriedade clínica. |
| **3. Hierarquia Visual & Squint Test** | 54 | **80** | H1 editorial em Receitas, Sage Teal vs Slate Navy distintos e primeira dobra mobile impecável; penalizado pela Sidebar com "caixa dentro de caixa" + rodapé em 3 linhas e card redundante de admissão no Hospitalar. |
| **4. Composição, Espaço Negativo & Ritmo** | 58 | **76** | Remoção do banner LGPD e bancada A4 trouxeram respiro no Desktop 1440px e Mobile 390px; porém `Copiar texto` órfão em Receitas, `ICH Score` órfão em Scores e layout quebrado em `975px` derrubam a nota. |
| **5. Acabamento Tátil, Movimento & Paridade Light/Dark** | 60 | **78** | Inputs escuros unificados, *catch-light* zenital e `MobileBottomNav` refinada; porém o vídeo expôs `MobileBottomNav` fora do backdrop do modal, flash branco em `02:06` e flicker em `01:26`/`01:37`. |
| **6. Polimento Tipográfico & Integridade Óptica** | 56 | **79** | Alergia, Radar Fisiológico, aviso de CRM, campo de fármaco mobile e botões de `Hospitalar` em 1 linha 100% corrigidos; restam truncagens no subtítulo do modal, chips em `975px`, unidade na sidebar e seletor/subtítulo no CDSS. |
| **MÉDIA GERAL (`aesthetic_quality_score`)** | **55** | **81** | **Falta apenas 1 passe cirúrgico de refinamento (Round 3) para ultrapassar `90/100` com zero `P1`.** |

---

## 3. Tabela Delta Explícita (`V-01..V-14` do Round 1 → Round 2)

| ID Round 1 | Severidade R1 | Estado no Round 2 | Evidência Visual Observada nas Capturas & Vídeo de Round 2 |
| :--- | :---: | :--- | :--- |
| **`V-01`** Fragmentação cromática e violação `90/8/2` | `P0_BLOCKER` | **`RESOLVED` (Resolvido)** | `steps/945`, `941`, `952`, `956`, `929`, `934`: zero cobalto elétrico, zero laranja sólido no SOFA, zero neon/estrelas/sparkles; Mineral Sage Teal e Slate Navy consistentes nas 3 rotas. |
| **`V-02`** Truncagens críticas de segurança e clippings | `P0_BLOCKER` | **`PARTIAL` (Parcial)** | **Corrigidos:** alergia integral em `952`/`956`, Radar Fisiológico integral e `ICH Score` inteiro em `945`/`941`, item fatiado no rodapé da sidebar eliminado, aviso de CRM completo em `929`/`934`, input mobile completo em `1014`/`1019`, `Documentos` sem corte. **Restantes:** `[Municipal] USF Osvaldo Piana ...` na sidebar; `Leito 110–15 — M. A. S...` e subtítulo `...Disfunção Orgâ...` em `945`/`941`; subtítulo do modal (`...sem deu...`) e chips `Mapa de Leitos` no vídeo (`01:24`, `01:43`). |
| **`V-03`** Contraste falho secundário e inputs mosaico no Dark Mode | `P0_BLOCKER` | **`RESOLVED` (Resolvido)** | `steps/934`, `941`, `956`, `1019`: todos os inputs vazios e preenchidos usam a mesma cavidade escura coerente; `WhatsApp`/`Copiar texto` desabilitados ganharam legibilidade; cartões com elevação progressiva e *catch-light* sutil; CTAs sólidos nítidos. |
| **`V-04`** Identidade de marca genérica | `P1_HIGH` | **`RESOLVED` (Resolvido)** | `steps/929`, `934`, `1014`, `1019`: novo símbolo geométrico de cruz médica com detalhe Sage Teal + wordmark `PresCMed` (`PresC` + `Med`) e assinatura mobile `+ PCM` legíveis nos dois temas. |
| **`V-05`** Ruído burocrático e triplicação LGPD / Backup | `P1_HIGH` | **`PARTIAL` (Parcial)** | Banner `Modo Local • Sem Login (LGPD)` removido de todas as vistas (`929`–`1019`). Porém `Backup (.pcm)` e `LGPD` permanecem duplicados na base da sidebar (`929`–`956`) junto aos ícones do Header, e no vídeo `975px` (`01:24`, `01:59`, `02:07`) há dois gatilhos `Ctrl+K` empilhados no topo. |
| **`V-06`** Desequilíbrio da sidebar escura e "caixa dentro de caixa" | `P1_HIGH` | **`UNCHANGED` (Não mudou)** | `steps/929`, `945`, `952`, `934`, `941`, `956`: a sidebar mantém bordas individuais em todos os blocos internos (`LOCAL DE ATUAÇÃO`, `Configurar médico`, `Identificar paciente`) e conserva os 3 blocos pesados no rodapé (`Baixar / Instalar App` sólido + `Novo Atendimento` + `Backup (.pcm) \| LGPD`). |
| **`V-07`** Colapso da primeira dobra Mobile (`390×844`) | `P1_HIGH` | **`RESOLVED` (Resolvido)** | `steps/1014`, `1019`: Header enxuto com 4 controles (`Menu`, `+ PCM`, `Busca`, `Tema`), faixa de status compacta, e formulário `Prescrição` + CTA **`+ Inserir na receita`** inteiramente visíveis acima da `MobileBottomNav`. |
| **`V-08`** Falta de H1 e bancada A4 desarticulada em Receitas | `P1_HIGH` | **`PARTIAL` (Parcial)** | H1 `Prescrição Médica` com subtítulo editorial + bancada rebaixada (`a4-bench-stage`) + zoom `35% \| 100%` integrado no canto da bancada resolvidos em `929`/`934`. Porém o botão **`Copiar texto`** continua órfão sozinho numa 2ª linha abaixo dos botões principais (`929`, `934`) e esticado com vão vazio em `975px` (`02:07`). |
| **`V-09`** Sobrecarga de 4 camadas no topo do Scoreboard CDSS | `P1_HIGH` | **`PARTIAL` (Parcial)** | Remoção do banner LGPD e eliminação de `★` aliviaram o topo (`945`, `941`). Porém `← Voltar ao Leito 110–15` segue em linha própria separada do trilho segmentado e `ICH Score` quebra sozinho como chip órfão na 2ª linha da barra `RÁPIDO:`. |
| **`V-10`** CTAs concorrentes e botões em 2 linhas no Hospitalar | `P1_HIGH` | **`PARTIAL` (Parcial)** | `steps/952`, `956`: `Evoluir Leito` e `Colar Prontuário / IA` agora cabem em 1 única linha e há hierarquia clara entre leito selecionado vs secundários; contudo o card `+ Admitir Novo Paciente` permanece na 3ª coluna mesmo com 2 leitos ocupados, duplicando o topo. |
| **`V-11`** Inputs "bolha", alinhamento numérico e selects | `P2_MEDIUM` | **`RESOLVED` (Resolvido)** | `steps/929`, `934`, `1014`, `1019`: raios cirúrgicos coerentes nos inputs, `1` (Dose) e `5` (Duração) uniformemente centralizados, chevrons com respiro interno e remoção do badge `Ctrl+K` redundante dentro do campo de fármaco. |
| **`V-12`** Microcopy contraditória em `Medicamentos prescritos` | `P2_MEDIUM` | **`PARTIAL` (Parcial)** | `Kits de plantão (6)` ficou visível no rodapé da sidebar em Desktop (`929`, `934`), mas em resoluções sem sidebar (`975px` no vídeo `02:07` e Mobile) a frase *"aplique um kit clínico na barra lateral"* continua sem barra lateral visível e sem pílulas rápidas inline no estado vazio. |
| **`V-13`** Inconsistência cromática de ícones (`★` e `✨`) | `P2_MEDIUM` | **`RESOLVED` (Resolvido)** | Todas as capturas Round 2: ícones disciplinados em tinta tonal neutra/Sage, com Âmbar restrito a alertas clínicos e Carmim a alergias; zero `★` ou `✨`. |
| **`V-14`** `MobileBottomNav` pesada/encaixotada | `P3_NIT` | **`RESOLVED` (Resolvido)** | `steps/1014`, `1019` e vídeo `00:44–02:14`: substituída por pílula suave translúcida com filete superior de 2px em Sage Teal e respiro vertical limpo. |

---

## 4. Lista Consolidada de Apontamentos para o Round 3 (`V-15` a `V-21`)

### `V-15` — Quebra de Contenção Modal (`MobileBottomNav` Acesa Sobre o Backdrop) e Clippings do Modal
- **Severidade:** `P1_HIGH` *(Novo achado no vídeo — `[NEW_DEFECT]`)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `scratch/round2-transitions.mp4 :: 01:43–01:58 (rodapé e cabeçalho do modal Nova Admissão) :: DESIGN.md > Elevation & Depth (isolation e z-index de modais) & Adendo H` — Quando o modal `Nova Admissão de Paciente no Mapa de Leitos` abre sobre o backdrop escurecido em `975px`, toda a `MobileBottomNav` inferior permanece totalmente acesa em primeiro plano sobre o fundo escurecido, competindo com os botões do modal. Adicionalmente, o subtítulo do modal é cortado com reticências (`...ou cole um prontuário completo sem deu...`).
- **Resultado Visual Esperado:** O overlay/backdrop modal deve cobrir 100% da viewport (acima inclusive da navegação inferior), escurecendo e bloqueando visualmente tudo atrás da janela de diálogo; o subtítulo do modal deve caber integralmente sem truncagem.

### `V-16` — Flashes Visuais Durante Transições de Rota e Tema no Vídeo
- **Severidade:** `P1_HIGH` *(Novo achado no vídeo — `[NEW_DEFECT]`)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `scratch/round2-transitions.mp4 :: 01:26, 01:37, 01:40 e 02:06 :: DESIGN.md > Adendo H (View Transitions API)` — Em `02:06`, durante a navegação para `#prescription` no modo claro, a área inteira entre Header e `MobileBottomNav` pisca como um **canvas branco completamente vazio**; em `01:26` e `01:37` (em modo escuro), surgem quadros intermediários com **ghosting pálido/translúcido** sobre os painéis escuros.
- **Resultado Visual Esperado:** Transições suaves e opacas entre rotas, abas e temas sem frame branco vazio nem flash claro momentâneo durante navegações no modo escuro.

### `V-17` — Regressão no Breakpoint Intermediário (`975px`): Abas em 3 Linhas, Controles Duplicados e Barra Inferior Sobreposta
- **Severidade:** `P1_HIGH` *(Novo achado no vídeo — `[NEW_DEFECT]`)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `scratch/round2-transitions.mp4 :: 00:44–02:14 (Header, Hospitalar e barra inferior em 975px) :: DESIGN.md > Layout & Spacing & Components` — Abaixo de `1024px` (quando a `Sidebar` já recolheu para `MobileBottomNav`), o Header volta a exibir `Baixar App` e empilha `Buscar Ctrl+K` diretamente acima de `Busca rápida ... Ctrl+K`; em `Hospitalar` (`01:24`, `01:59`), as 5 sub-abas quebram em **3 linhas** com `Assistente IA` sozinho na 3ª linha e a faixa `Mapa de Leitos` trunca ambos os chips de pacientes; em `Receitas` (`02:07–02:14`), a barra de ações fixa empurra `Copiar texto` para a extrema direita com um vão vazio e cobre parte do card/aviso de CRM atrás dela.
- **Resultado Visual Esperado:** Alinhar o ponto de corte do Header e da barra de busca ao mesmo limiar da `Sidebar` (sem ressuscitar `Baixar App` ou duplicar `Ctrl+K` em `975px`); manter as sub-abas de `Hospitalar` em **1 única linha rolável** (`tabsOverflowContainer` com fade discreto) e acomodar os botões da barra de ações de `Receitas` sem vão artificial nem sobreposição do formulário/aviso.

### `V-18` — Sidebar com "Caixa Dentro de Caixa", Rodapé em 3 Linhas e Duplicação de `Backup`/`LGPD`
- **Severidade:** `P1_HIGH` *(Herdado de `V-05` / `V-06` — `UNCHANGED`)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/929/media_0.png, 934/media_0.png, 945/media_0.png, 941/media_0.png, 952/media_0.png, 956/media_0.png :: Sidebar esquerda :: DESIGN.md > Overview & Elevation & Depth` — Na barra lateral, `LOCAL DE ATUAÇÃO (SUS)`, `Configurar médico` e `Identificar paciente` continuam encapsulados em caixas bordadas separadas dentro do painel escuro, e o rodapé mantém 3 faixas sobrepostas (`Baixar / Instalar App` sólido verde + `Novo Atendimento` em caixa + `Backup (.pcm)` e `LGPD` que já existem no Header). Além disso, `[Municipal] USF Osvaldo Piana ...` segue truncado.
- **Resultado Visual Esperado:** Remover as bordas individuais dos itens internos (unificando em blocos silenciosos separados por respiro ou divisórias hairline sutis), consolidar o rodapé da sidebar em **1 linha silenciosa** (`Novo Atendimento` discreto + controle de recolher), mover `Baixar / Instalar App` e `Backup`/`LGPD` para o menu de utilidades/popover do Header (ou só exibir instalar quando acionado pelo usuário) e ajustar o rótulo da unidade para não cortar com `...`.

### `V-19` — Botão `Copiar texto` Órfão na Coluna da Prévia A4 (`#prescription`)
- **Severidade:** `P1_HIGH` *(Herdado de `V-08` — `PARTIAL`)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/929/media_0.png & 934/media_0.png :: rodapé da coluna direita de Receitas :: DESIGN.md > Components (Isolamento de Acento & Layout)` — O botão `Copiar texto` quebra sozinho para uma 2ª linha órfã abaixo de `Imprimir / Gerar PDF`, `Editor de Folha A4` e `WhatsApp`, quebrando a simetria da bancada.
- **Resultado Visual Esperado:** Unificar todos os controles de saída da prévia A4 em **1 única linha limpa e equilibrada** (ex.: `Imprimir / Gerar PDF` como CTA sólido + `Editor A4` + botões compactos de ícone+rótulo ou grupo secundário `WhatsApp` / `Copiar` cabendo confortavelmente na mesma linha).

### `V-20` — Chips Órfãos, Linha Extra de Navegação e Truncagens Secundárias em `#scores` e `#hospital`
- **Severidade:** `P2_MEDIUM` *(Herdado de `V-02`, `V-09`, `V-10` — `PARTIAL`)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/945/media_0.png & 941/media_0.png :: faixa superior e barra RÁPIDO de Scoreboard CDSS :: DESIGN.md > Layout & Typography` — `← Voltar ao Leito 110–15` fica em linha separada do título; na barra `RÁPIDO:`, `ICH Score` cai sozinho para a 2ª linha; e `Leito 110–15 — M. A. S...` + `...Disfunção Orgâ...` apresentam reticências.
  - `[OBSERVED VISUAL FACT]` `steps/952/media_0.png & 956/media_0.png :: 3ª coluna do grid de leitos :: DESIGN.md > Components (Isolamento de Acento)` — O card `+ Admitir Novo Paciente` segue ocupando um slot completo no grid mesmo com censo ativo, repetindo as ações `+ Admitir Paciente` e `Importação Multimodal IA` do cabeçalho.
- **Resultado Visual Esperado:** Integrar `← Voltar ao Leito` na mesma linha do título `Scoreboard CDSS` (ganhando 1 faixa vertical), alinhar todos os chips `RÁPIDO:` em 1 única linha limpa (com rolagem horizontal suave + fade ou seleção enxuta dos principais sem deixar `ICH Score` órfão) e suprimir o card redundante `+ Admitir Novo Paciente` do grid quando já houver leitos admitidos (mantendo-o como estado vazio quando o censo estiver zerado).

### `V-21` — Microcopy do Estado Vazio Sem Sidebar e Botão `Buscar` Duplicado no Mobile
- **Severidade:** `P3_NIT` *(Herdado de `V-12` e refinamento Mobile)*
- **Evidência:**
  - `[OBSERVED VISUAL FACT]` `steps/1014/media_0.png & 1019/media_0.png :: faixa superior de status :: DESIGN.md > Overview` — O botão `Buscar` na faixa `CRM pendente • Sem paciente` duplica imediatamente o ícone de lupa no canto superior direito do Header.
  - `[OBSERVED VISUAL FACT]` `scratch/round2-transitions.mp4 :: 02:07–02:14 (Medicamentos prescritos vazio em 975px) :: DESIGN.md > Components (UIState empty)` — Quando a barra lateral está recolhida (`< 1024px`), a instrução *"aplique um kit clínico na barra lateral"* aponta para um painel ausente na tela.
- **Resultado Visual Esperado:** Remover o botão duplicado `Buscar` da faixa de status no mobile (mantendo a lupa no Header ou abrindo a seleção de paciente ao tocar em `Sem paciente`) e adicionar 2–3 pílulas discretas de kits/modelos diretamente no estado vazio de `Medicamentos prescritos` (ou ajustar a instrução para apontar para `Modelos (3)`).

---

> **Conclusão de Gate (Stage 3B):** Assim que `V-15` a `V-19` forem corrigidos (eliminando os `P1_HIGH` de contenção modal/transições, breakpoint `975px`, poluição da barra lateral e `Copiar texto` órfão) e capturados no **Round 3** (incluindo um frame do breakpoint intermediário `~960–975px` e re-gravação limpa do vídeo de modal/transições), o projeto tem plenas condições de atingir **`>= 90/100` e `PASSED`**.
