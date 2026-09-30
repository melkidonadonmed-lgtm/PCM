# GEMINI.md — Memória do Projeto PresCMed (PCM)

Este arquivo serve como **memória persistente, diretrizes de arquitetura e base de conhecimento** para o desenvolvimento do **PresCMed**. Todos os agentes e modelos que atuam neste repositório devem seguir estritamente as diretrizes aqui documentadas.

---

## 1. Identificação do Projeto

- **Nome**: PresCMed (PCM)
- **Versão**: 2.0.0
- **Natureza**: Sistema de Prescrição Médica Digital ambulatorial voltado ao ecossistema de saúde brasileiro.
- **Domínio**: Clínico / Saúde (YMYL — *Your Money or Your Life*). Qualquer alteração de dose, posologia ou conformidade regulatória exige precisão cirúrgica e validação de testes.
- **Arquitetura**: **SPA 100% Client-Side** (React 19 + Vite 6). Não há backend ativo em Node/Express no código de produção; dados sensíveis residem estritamente no navegador do médico (localStorage e Dexie.js / IndexedDB).

---

## 2. Perfil do Desenvolvedor e Ambiente de Execução

- **Desenvolvedor**: Melki
- **Sistema Operacional**: Windows 11 Pro
- **Shell**: PowerShell 7 (`pwsh`).
  - **Regra**: Nunca use sintaxe Bash/Linux exclusiva (`export`, `rm -rf`, `grep`, `cat`, etc.) sem fornecer a alternativa funcional em cmdlets do PowerShell (`Set-Item`, `Remove-Item`, `Select-String`, `Get-Content`).
- **Google Drive**: Montado em `G:\Meu Drive`.
- **Pasta Raiz Dev**: `C:\Users\melki\dev\`
- **Notas Pessoais**: `C:\Users\melki\Documents\Obsidian Vault\`
- **Status do Sistema**: Telemetria do Data Agent Kit (`googlecloudtools.datacloud_telemetry`) foi desarmada e travada como Read-Only em `C:\Users\melki\.gemini\config\plugins\googlecloudtools.datacloud_telemetry\hooks.json` para evitar travamentos de hooks no Windows.

---

## 3. Stack Tecnológica

| Camada | Tecnologia | Detalhes |
|---|---|---|
| **Frontend** | React 19 + TypeScript | Modo funcional com hooks. Sem React Router (roteamento por aba `activeTab` em `App.tsx`). |
| **Bundler** | Vite 6 | `@vitejs/plugin-react` e `@tailwindcss/vite`. |
| **Estilos** | Tailwind CSS v4 | Configurado diretamente via CSS em `src/index.css` (`@import "tailwindcss"` e `@theme`). |
| **UI & Ícones** | Google Material Symbols (`material-symbols`), `lucide-react`, `motion` | Sistema canônico `<Icon />` com Google Material Design Icons offline + suporte legado Lucide. |
| **Documentos / PDF** | `jspdf`, `jspdf-autotable`, `html2canvas` | Geração vetorial programática e visualização de folha A4. |
| **Testes** | Vitest 5 | Testes unitários para cálculos de dose e conformidade sanitária/CFM. |
| **Persistência** | `localStorage` + `Dexie.js` v2 | Persistência local segura + backup e restauração portátil (`.pcm.json`). |

---

## 4. Diretrizes Clínicas e Regulatórias Inegociáveis

1. **Portaria SVS/MS 344/98 (Receituário de Controle Especial)**:
   - Obrigatório formato em **2 vias** (1ª via: Retenção da Farmácia / 2ª via: Orientação do Paciente).
   - Obrigatoriedade dos campos de identificação do emitente (médico/CRM/UF), do paciente, do comprador (se terceiro) e do fornecedor/farmácia.
2. **Resoluções CFM 1.658/2002 e 1.819/2007 (Consentimento de CID-10)**:
   - A inclusão do diagnóstico ou código CID-10 em atestados médicos é **vedada sem a expressa concordância e solicitação do paciente**.
   - A interface do PresCMed exige a marcação explícita de consentimento (`authorizedByPatient = true`) antes de emitir atestado com CID visível.
3. **Calculadora Pediátrica de Doses (`src/utils/doseCalculator.ts`)**:
   - Cálculos por peso (mg/kg) convertidos em volumes práticos (mL ou gotas) baseados nas apresentações farmacêuticas reais do mercado brasileiro.
   - Paracetamol gotas: 1 gota/kg/dose (máximo 35 gotas por dose).
   - Dipirona gotas: 0,5 a 1 gota/kg/dose (apresentação 500 mg/mL).
   - Formatação numérica sempre com vírgula no padrão brasileiro (`toLocaleString('pt-BR')`).

---

## 5. Design System e Regras de Interface

- **Chrome de Navegação** (`Header`, `Sidebar`, `MobileBottomNav`):
  - **Sempre Deep Navy** (`#0B132B` / `#1C2541` via `.panel-navy`) em **ambos os temas** (Claro e Escuro).
  - Tipografia sobre o navy sempre em tons claros (`#F1F5F9`, `#CBD5E1`, `#94A3B8`).
- **Tema Claro**:
  - Fundo da aplicação: Canvas creme suave (`--bg-app: #F9F6F0`).
  - Cards e superfícies: Branco-quente (`--surface-card: #FFFDF9`).
  - Tipografia: Azul-marinho profundo (`#0F172A`).
- **Tema Escuro**:
  - Fundo da aplicação: Obsidian profundo (`--bg-app: #0D0F12`).
  - Cards e superfícies: Grafite translúcido (`--surface-card: #1A1D24`).
- **Folha de Impressão A4 (`printable-a4-sheet`)**:
  - **Sempre fundo branco puro (`#FFFFFF`) e texto preto/escuro**, independentemente do tema ativo na UI.
  - A impressão e o preview simulam papel físico real. Nunca aplique classes de modo escuro dentro da folha do documento.

### 5.1 Sistema Canônico de Ícones (Google Material Design Icons / Anti-Mutação)
- **Pacote**: `material-symbols` (Google Material Design Icons oficial, 100% offline via woff2 empacotado no PWA).
- **Componente**: `<Icon name="..." />` (`src/components/Icon.tsx`).
- **Prevenção de Mutação**: Qualquer novo componente, tela ou funcionalidade gerada por IA deve usar o `<Icon />`. O componente possui resolução de aliases clínicos em português (`receita`, `medicamento`, `gotas`, `vacina`, `estetoscopio`, `balanca`, `exame`, `atestado`, etc.) e tipagem estrita com autocompletação para os símbolos do Google.
- **Proibição**: Não invente ícones arbitrários ou instale pacotes paralelos.

---

## 6. Comandos Essenciais

```powershell
# Execução e desenvolvimento local
npm run dev        # Inicia dev server na porta 3000

# Qualidade e Testes (executar sempre após alterações clínicas)
npm run test        # Roda a suíte completa de testes no Vitest
npm run lint        # Validação de tipagem TypeScript (tsc --noEmit)
npm run design:lint # Validação de conformidade da especificação DESIGN.md (Google Labs)

# Produção
npm run build       # Compilação otimizada para a pasta dist/
npm run preview     # Pré-visualização do bundle compilado
```

---

## 7. Registro de Decisões e Histórico Técnico

- **28/09/2026**:
  - Diagnosticado e corrigido o bloqueio geral do Node.js causado pelo hook de telemetria com aspas escapadas incorretamente no Windows.
  - O arquivo `hooks.json` da telemetria foi esvaziado e marcado como Read-Only.
  - Validados 23/23 testes clínicos Vitest com 100% de sucesso.
  - Criada a base de memória persistente `GEMINI.md` e pasta `.gemini/` para governança do projeto.
  - **Google Material Design Icons Integrado**: Instalado `material-symbols` com suporte offline, ajustado Workbox para precache de woff2 (5 MB) e criado componente canônico anti-mutação `<Icon />` com mapa de aliases clínicos e 29/29 testes Vitest aprovados.
- **29/09/2026**:
  - **Google Labs DESIGN.md Integrado**: Adicionado arquivo canônico [`DESIGN.md`](./DESIGN.md) segundo a especificação oficial de design tokens e rationale para coding agents do Google Labs (`@google/design.md`).
  - Adicionado script `npm run design:lint` no `package.json`, validado com 0 erros e 0 avisos.
  - **Redesenho Minimalista, Simétrico e Tátil (Opção A — Cirúrgico Minimalista)**:
    - Paleta canônica: Branco `#F8FAFC`, Slate `#334155` e Navy Equilibrado `#1E3A8A` / `#0F172A` no Light; Deep Slate acetinado `#0F172A` / `#1E293B` no Dark (eliminando pretos profundos e cegueira de contraste).
    - Simetria estrita: Header (68px) e Sidebar colapsada (68px) com alinhamento visual idêntico; chip de paciente remodelado com status tátil integrado; botão CRM integrado sem quebra de paleta.
    - Física tátil e descongestionamento: Padronizados botões em 3 estilos canônicos (`.btn-tactile-primary`, `.btn-tactile-clinical`, `.btn-tactile-secondary`), inputs em microcavidade côncava e bancada da folha A4 flutuante (`.paper-sheet-floating`).
    - Eliminação completa de classes legadas (`dark:bg-cream-100`, `shadow-tactile-cream`, `tactile-btn-success`).
    - Validação total: `npm run design:lint` (0 erros / 0 avisos), `npm run lint` (tsc limpo), `npm run test` (29/29 testes Vitest aprovados) e `npm run build` (dist gerado com sucesso).
  - **MODO A — Execução Direta (Refinamento Prático & Simetria 64px)**:
    - `src/index.css`: Tokens canônicos `--canvas`, `--surface`, `--border`, `--text-primary`, `--primary`, `--clinical` no `:root` e `.dark`, mais utilitários `.tactile-btn`, `.card-surface`, `.folha-a4-shadow`.
    - `Header.tsx`: Altura fixada em `h-16` (64px) com alinhamento vertical rigoroso.
    - `Sidebar.tsx`: Posicionamento `top-16` e `h-[calc(100dvh-4rem)]`, botões de toque padronizados em 44x44px com tooltips flutuantes imediatos (`group-hover:opacity-100`) para navegação, CRM e utilitários.
    - `PrescriptionBuilder.tsx`: Formulário de prescrição rápida descongestionado com cabeçalho limpo "SUS / RENAME", busca rápida com atalho `Ctrl+K`, grid proporcional de 2 colunas e atalhos de posologia em pílulas táteis discretas.
    - Validação: `npm run design:lint` (0 erros / 0 avisos), `npm run lint` (0 erros), `npm run test` (29/29 testes aprovados) e `npm run build` (sucesso).
  - **Upload GitHub & Deploy Google Cloud Run**:
    - Push concluído com sucesso para o branch `main` no repositório GitHub (`melkidonadonmed-lgtm/PCM.git`). Commits: `50d7f45` (redesign e DESIGN.md) e `033a7cf` (`.gcloudignore`).
    - Build e Deploy executados com sucesso via Google Cloud Build (`agent-md-506215`), gerando a imagem Docker no Artifact Registry (`southamerica-east1-docker.pkg.dev/agent-md-506215/prescmed-repo/prescmed:033a7cf`).
    - Serviço ativo e validado no Google Cloud Run (São Paulo - `southamerica-east1`): `https://prescmed-1044179901556.southamerica-east1.run.app` (HTTP 200 OK com PWA e assets cacheados com sucesso).
- **30/09/2026**:
  - **Auditoria, Emissão em Paisagem e Sincronização**:
    - Receita de Controle Especial (Portaria SVS/MS 344/98) adaptada para folha única A4 Paisagem (297×210 mm) com 2 vias lado a lado (1ª Via Farmácia com dados do comprador/fornecedor, linha de corte central e 2ª Via Paciente).
    - Card de Identificação Rápida do Paciente adicionado no topo da receita com propagação instantânea para todos os documentos e atalho para a calculadora pediátrica.
    - Implementada higiene de consulta estrita (`startNewConsultation()`) para resetar simultaneamente receitas, exames, atestados e laudos ao trocar ou limpar o paciente.
    - `MobileBottomNav` migrado 100% para o componente canônico `<Icon name="..." />` com Material Symbols offline.
    - Base de testes Vitest expandida para 51/51 testes aprovados com 100% de sucesso.


