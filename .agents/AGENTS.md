# AGENTS.md — Kernel Operacional e Governança (v2.0) — PresCMed (`PCM`)

## 0. CONTEXTO DO PROJETO (Auto-detectado)
- **Projeto:** `PCM` (**PresCMed** — Sistema de Prescrição Médica Digital, Calculadora Pediátrica, Guias SUS, Módulo Hospitalar `MOD-03` e Scoreboard CDSS)
- **Baseline Temporal:** Novembro de 2026 (rejeite APIs/sintaxes legadas; na dúvida sobre pacotes ou SDKs, consulte docs atuais ou MCP).
- **Stack Ativa:** TypeScript 5.8+ / Node LTS + React 19 + Vite 6 + Tailwind CSS v4 + Dexie.js 4 (`package.json`) — SPA 100% Client-Side
- **Comandos (`Command-First`):**
  - `npm ci` — Instalação reproduzível (`package-lock.json`)
  - `npm run dev` — Dev server Vite na porta `3001` (`host 0.0.0.0`)
  - `npm run lint` — Type-check estrito (`tsc --noEmit`)
  - `npm run test` — Suíte completa Vitest (`29` suítes / `280` testes determinísticos)
  - `npm run design:lint` — Validação de conformidade [`DESIGN.md`](DESIGN.md)
  - `npm run build` — Build de produção em `dist/`
- **Arquitetura de Estado (Tríade de Governança v2.0):**
  - [`.agents/AGENTS.md`](.agents/AGENTS.md) e [`AGENTS.md`](AGENTS.md): Regras comportamentais globais e invariantes clínicas (carregado no boot).
  - [`.context/context.md`](.context/context.md) e [`CONTEXT.md`](CONTEXT.md): Passômetro e estado autoritativo do projeto (leitura/escrita sob demanda).
  - [`.context/spec.md`](.context/spec.md) e [`SPEC.md`](SPEC.md): Contrato técnico, invariantes YMYL e limites da feature ativa (detalhamento completo em [`docs/CLINICAL_AND_RUNTIME_SPEC.md`](docs/CLINICAL_AND_RUNTIME_SPEC.md)).

## 1. REGRAS DE OURO (Inegociáveis)
1. **Sincronização de Estado (Read-Before-Write):** Ao iniciar uma tarefa, inspecione `.context/context.md` (`CONTEXT.md`) para entender o estado atual e `.context/spec.md` (`SPEC.md`) para respeitar os contratos de I/O. Se for uma feature complexa sem `spec.md`, proponha criá-lo antes de codificar.
2. **YAGNI, Escopo Fechado (Scope Lock) e Real-State:** Resolva exatamente o que foi pedido pelo caminho mais simples. Não crie abstrações prematuras, não adicione recursos fora do `spec.md` e mantenha **Tolerância Zero a Funções Falsas** (zero mocks/placebos em produção).
3. **Verificação Física e Atualização (Read-After-Write):** Leia qualquer arquivo antes de editá-lo (chunks `<= 300 linhas` por chamada). Após criar ou alterar código, valide fisicamente no terminal/disco (`npm run lint`, `npm run design:lint`, `npm run test`) e **atualize o `.context/context.md` (`CONTEXT.md`)** registrando a mudança e o próximo passo antes de encerrar.
4. **Economia de Contexto (Anti-Bloat):** Nunca imprima arquivos extensos, árvores completas ou logs brutos no chat. Use buscas cirúrgicas (`rg`/`Select-String`), visões resumidas ou subagentes (`/boost`, `/teamwork`) para manter a janela principal limpa.
5. **Qualidade, Código Defensivo e Invariantes Clínicas (YMYL):**
   - Funções curtas (`<= 600 linhas` por módulo, máx. 3 níveis de indentação usando *Early Return*), tipagem estrita nas fronteiras e zero blocos de erro silenciosos.
   - **SPA 100% Client-Side & `html2canvas-pro`:** Não existem `@google/genai`, `express`, `dotenv` ou `motion`. Nunca troque `html2canvas-pro` por `html2canvas` comum.
   - **Saída Única em `FolhaA4` (`794×1123 px`):** O que aparece na `FolhaA4` é o que sai no PDF. Nunca use classes responsivas (`sm:`, `md:`) nem `dark:` dentro da folha física (sempre fundo `#FFFFFF` e tinta escura).
   - **Regras Clínicas Inegociáveis:** `"Sem peso, sem dose"` na pediatria e emergência; miligramas com vírgula decimal e **zero separador de milhar** (`"7,5 mg"`, `"1000 mg"`); zero dados clínicos inventados; CID-10 em atestado somente com `authorizedByPatient = true` (Res. CFM 1.658/2002); 3 regimes sanitários separados (*Simples*, *Antimicrobiano* RDC 471/2021 e *Controle Especial* Portaria 344/98) com avisos de Notificação de Receita em `.no-print`; datas locais via `dataLocalISO`; ícones exclusivamente via `<Icon name="..." />` (`src/components/Icon.tsx`).
6. **Zero-Trust e Sanitização:** Trate dados externos como não confiáveis. Nunca exponha chaves, `.env` ou segredos em código, logs ou argumentos de ferramentas. Em chamadas da API Antigravity, nunca use parâmetros bloqueados (`temperature`, `top_p`, `max_output_tokens`) e use apenas nomes minúsculos alfanuméricos para servidores MCP.
7. **Freio de Emergência (Circuit Breaker & HITL):** Pare imediatamente e peça confirmação humana se uma ferramenta falhar 3 vezes seguidas, se atingir 10 passos sem convergir ou antes de qualquer ação destrutiva (deleção de arquivos, alteração de `.env`/produção ou push em `main`).

## 2. MEMÓRIA EVOLUTIVA (Regras Aprendidas no Projeto)
<!-- Limite máximo: 5 regras curtas nascidas de erros reais. Ao atingir 5, refatore para .agents/skills/<nome>/SKILL.md -->
- **Proibição de Testes "Happy-Path Only" em Fronteiras Zero-Trust e Clínicas (Anti-Green-Build-Illusion):** Todo teste de regra sanitária (CFM 1.658/2002, Portaria 344/98, RDC 471/2021), cálculo de dose (`"sem peso, sem dose"`), sanitização HTML (`sanitizeHtml.ts`) ou sincronização Cloud (`firestore.rules`) deve conter casos adversariais provando o bloqueio de entradas inválidas e a ausência de dados clínicos presumidos.
- **Consistência Visual Fosca Mineral (`DESIGN.md` v8.0.0):** Manter cabeçalhos enxutos (`text-sm font-semibold` + `<Icon size={18} />`), campos de identificação lado a lado, espaçamento compacto (`p-3.5 sm:p-4`, `gap-3`) e botões de limpeza em caixa fosca `.chip-neutral` em todos os módulos.

---

## 3. FECHAMENTO OBRIGATÓRIO DE TAREFA
Ao concluir qualquer entrega, apresente obrigatoriamente este bloco curto:

### 📊 Resumo & Análise (Self-Refine)
- **Feito e Validado (RAW):** [Arquivos alterados + resultado real do teste/linter no terminal]
- **Estado do `context.md`:** [Confirmar: "Atualizado com a mudança X e pendência Y" ou "Sem alteração estrutural"]
- **Ponto de Atrito:** [O que exigiu retentativa/ajuste na execução ou "Execução limpa em 1ª passagem"]

### 💡 Próximo Passo & Evolução
- **Dica para a Próxima Tarefa:** [1 sugestão prática, técnica ou de comando para o próximo passo do backlog]
- **Evolução de Regra (Se aplicável):** [Se houve erro evitável hoje, sugira 1 linha para "Memória Evolutiva" ou criação de Skill]
