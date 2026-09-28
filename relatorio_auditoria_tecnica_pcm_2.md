# RELATÓRIO EXECUTIVO DE AUDITORIA TÉCNICA E DIAGNÓSTICO ESTRUTURAL
## PresCMed (PCM) — Sistema de Prescrição Médica Digital & Cálculos Pediátricos

**Data da Auditoria:** 28 de Setembro de 2026  
**Auditor:** Arquiteto de Software Frontend Sênior & Especialista em Design Systems Hospitalares  
**Ambiente:** Windows 11 (`pwsh`), Node.js v24.19.0, Vite 6.2.3, React 19.0.1  
**Repositório Inspecionado:** `https://github.com/melkidonadonmed-lgtm/PCM.git`  
**Branch Auditada:** `main`  
**Commit Hash:** `eba0a71bf9180c1fa8659014ffd44ad20d88694b`  
**Status do Repositório:** Build limpo (`dist/` gerado com sucesso), Type Check aprovado (`tsc --noEmit` sem erros).

---

## 1. RESUMO EXECUTIVO DA STACK E SAÚDE DO REPOSITÓRIO

### 1.1 Tabela de Versões e Diagnóstico de Dependências

| Componente / Biblioteca | Versão Declarada (`package.json`) | Versão em Execução Real | Status / Diagnóstico |
| :--- | :--- | :--- | :--- |
| **Framework UI** | `react: ^19.0.1`, `react-dom: ^19.0.1` | React 19.0.1 | [CONFORME] Operando em StrictMode nativo. |
| **Bundler / Dev Server** | `vite: ^6.2.3` | Vite 6.4.3 | [CONFORME] Inicializa em ~400ms na porta 3000. |
| **Linguagem & Tipagem** | `typescript: ~5.8.2` | TypeScript 5.8.2 | [PARCIAL] `tsc --noEmit` passa com 0 erros, porém `strict: true` **não está habilitado** no `tsconfig.json`. |
| **Estilização & Engine** | `@tailwindcss/vite: ^4.1.14` | Tailwind CSS v4.1.14 | [CONFORME] Configuração moderna sem `tailwind.config.js`, usando `@import "tailwindcss"` e `@theme` em `src/index.css`. |
| **Animação** | `motion: ^12.23.24` | Motion 12.23.24 | [CONFORME] Animações e micro-transições táteis. |
| **Ícones** | `lucide-react: ^0.546.0` | Lucide React 0.546.0 | [CONFORME] Ícones médicos e funcionais consistentes. |
| **Geração de PDF** | `jspdf: ^4.2.1`, `jspdf-autotable: ^5.0.8` | jsPDF 4.2.1 | [PARCIAL] Funcional, mas importado de forma monolítica sem dynamic import (gera chunk > 970 kB). |
| **Captura de Tela A4** | `html2canvas: ^1.4.1` | html2canvas 1.4.1 | [PARCIAL] Exige helper de conversão de cores CSS modernas (`convertColorToRgb`). Chunk de 202 kB. |
| **SDK Gemini AI** | `@google/genai: ^2.4.0` | **Inexistente no runtime** | [DIVERGENTE / FANTASMA] Declarado no `package.json`, mas **zero imports em `src/`**. O app é 100% offline. |
| **Servidor Backend** | `express: ^4.21.2`, `dotenv: ^17.2.3` | **Inexistente** | [DIVERGENTE / FANTASMA] Herança do template Google AI Studio; não há backend nem `server.js`. |

### 1.2 Métricas de Build de Produção (`vite build`)
* **Duração do Build:** 8.05 segundos (1.942 módulos transformados).
* **Bundle CSS:** `dist/assets/index-Btaz9_go.css` (96.08 kB / gzip 16.52 kB).
* **Bundle JS Principal:** `dist/assets/index-BZmU38Nr.js` (**973.59 kB** / gzip 280.06 kB).
* **Alerta do Vite:** *Chunk > 500 kB detectado*. Falta de *code-splitting* via `React.lazy()` / `import()` dinâmico para os componentes pesados de impressão (`html2canvas`, `jspdf`) e catálogos de medicamentos.

---

## 2. MATRIZ DE CONFRONTO: DOCUMENTAÇÃO vs. REALIDADE DO CÓDIGO

| Item Documentado (README / Sumário / AI Studio) | Situação Real no Código Inspecionado | Status | Arquivo(s) de Evidência |
| :--- | :--- | :--- | :--- |
| **Integração com API Gemini (`GEMINI_API_KEY`)** | O aplicativo é uma **SPA 100% client-side offline**. Não existe nenhuma chamada HTTP, fetch ou inicialização do SDK `@google/genai` em todo o código-fonte de `src/`. | **DIVERGENTE** | [package.json](file:///c:/Users/melki/Projetos/PCM/package.json), [README.md](file:///c:/Users/melki/Projetos/PCM/README.md) |
| **Backend Express & Script `clean`** | Não existe servidor Node/Express em execução. O script `"clean": "rm -rf dist server.js"` no `package.json` é um comando de sintaxe Unix que falha em ambientes Windows PowerShell puro. | **DIVERGENTE** | [package.json#L10](file:///c:/Users/melki/Projetos/PCM/package.json#L10) |
| **Gerenciador de Pacotes Bun (`bun.lock`)** | O arquivo `bun.lock` presente na raiz é legado do template AI Studio. A instalação e governança real é gerida por `package-lock.json` via `npm ci`. | **PARCIAL** | [bun.lock](file:///c:/Users/melki/Projetos/PCM/bun.lock), [package-lock.json](file:///c:/Users/melki/Projetos/PCM/package-lock.json) |
| **Roteamento Baseado em Hash / URLs (`navigation.ts`)** | Não há roteador por hash nem biblioteca `react-router`. Toda a troca de telas é feita através de **State Switch condicional puro** no `App.tsx` (`activeTab`). | **DIVERGENTE** | [src/App.tsx#L111](file:///c:/Users/melki/Projetos/PCM/src/App.tsx#L111) |
| **Calculadora Pediátrica Inteligente por Peso** | Implementação com cálculo em tempo real (mg/kg → mL ou gotas), teto de dose máxima e posologia clínica brasileira. | **CONFORME** | [src/utils/doseCalculator.ts](file:///c:/Users/melki/Projetos/PCM/src/utils/doseCalculator.ts), [src/components/PediatricCalculator.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/PediatricCalculator.tsx) |
| **Conformidade Sanitária CFM (Atestados com CID-10)** | Exige consentimento explícito e cita expressamente a Resolução CFM 1.658/2002 antes de carregar o código CID na via final. | **CONFORME** | [src/components/CertificateAndReferral.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/CertificateAndReferral.tsx) |
| **Receituário de Controle Especial (Portaria 344/C1)** | Gera documento com campos regulamentares de Identificação do Emitente, Paciente, Medicamento e Comprador/Fornecedor em 2 vias. | **CONFORME** | [src/components/PrintPreview.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/PrintPreview.tsx), [src/utils/pdfGenerator.ts](file:///c:/Users/melki/Projetos/PCM/src/utils/pdfGenerator.ts) |
| **Fonte Serifada Garamond em Documentos A4** | `index.html` carrega a fonte `Cormorant Garamond` do Google Fonts, mas **ela nunca é aplicada** em nenhum estilo do CSS ou nas folhas de impressão. | **DIVERGENTE** | [index.html#L25](file:///c:/Users/melki/Projetos/PCM/index.html#L25), [src/index.css#L70](file:///c:/Users/melki/Projetos/PCM/src/index.css#L70) |
| **Módulo de Modelos de Receita (`models`)** | O tipo `ActiveTab` em `src/types.ts` prevê `'models'`, mas não existe componente nem lógica implementada em `App.tsx`. | **AUSENTE** | [src/types.ts#L168](file:///c:/Users/melki/Projetos/PCM/src/types.ts#L168), [src/App.tsx](file:///c:/Users/melki/Projetos/PCM/src/App.tsx) |

---

## 3. INVENTÁRIO ARQUITETURAL E DIAGNÓSTICO DE ACOPLAMENTO

### 3.1 O "God Component" `App.tsx`
* **Localização:** [src/App.tsx](file:///c:/Users/melki/Projetos/PCM/src/App.tsx) (517 linhas).
* **Diagnóstico de Centralização Excessiva:**
  * Mantém 7 estados clínicos fundamentais em memória: `doctor`, `patient`, `prescriptionItems`, `selectedExams`, `examIndication`, `certificate` e `referral`.
  * Possui **8 `useEffect`s individuais** dedicados unicamente a serializar cada entidade em chaves separadas do `localStorage`.
  * Pratica *prop drilling* severo, passando callbacks de navegação (`onNavigateToPrint`, `onNavigateToPediatricCalc`) e flags de layout (`darkMode`, `sidebarOpen`) por múltiplos níveis.
  * **Risco Clínico:** Uma alteração não tratada no estado de `patient` propaga efeitos colaterais em cadeia para atestados e encaminhamentos (`setCertificate` e `setReferral` reativos no `App.tsx`).

### 3.2 O Componente Monolítico `PrescriptionBuilder.tsx`
* **Localização:** [src/components/PrescriptionBuilder.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/PrescriptionBuilder.tsx) (1.383 linhas).
* **Responsabilidades Acumuladas:**
  1. Filtro e busca textual com ranking próprio de fármacos (`UNIFIED_MEDICATIONS`).
  2. Gerenciamento de kits de emergência médica (6 kits embutidos).
  3. Calculadora rápida de doses pediátricas simplificada dentro de um accordion.
  4. Renderização da folha A4 em mini-preview no desktop.
  5. Gerador de mensagem formatada para envio via WhatsApp (`https://wa.me/?text=...`).
  6. Disparo programático de exportação em PDF via `generateMedicalPDF`.

### 3.3 A Descoberta do "Subsistema Zumbi" (Código Órfão)
A auditoria identificou um módulo completo de catálogo e busca fuzzy que está **100% desconectado do restante da aplicação**:
* [src/components/MedicationSelectionModal.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/MedicationSelectionModal.tsx) (20.5 kB)
* [src/components/MedicationPresentationModal.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/MedicationPresentationModal.tsx) (30.4 kB)
* [src/utils/medicationCatalog.ts](file:///c:/Users/melki/Projetos/PCM/src/utils/medicationCatalog.ts) (18.0 kB)
* [src/utils/fuzzySearch.ts](file:///c:/Users/melki/Projetos/PCM/src/utils/fuzzySearch.ts) (22.7 kB)
* [src/data/adultMeds.ts](file:///c:/Users/melki/Projetos/PCM/src/data/adultMeds.ts) (44.1 kB)

> [!WARNING]
> **Mais de 135 kB de código TypeScript de alta complexidade** (algoritmos de similaridade Levenshtein, agrupamento de apresentações farmacêuticas e catálogo de adultos com 32 medicamentos) existem no repositório, compilam no bundle, mas **nunca são importados nem exibidos ao usuário**, pois o `PrescriptionBuilder` optou por usar uma base paralela monolítica (`src/data/medicationDatabase.ts` com 1.697 linhas).

---

## 4. DIAGNÓSTICO DO DESIGN SYSTEM (CORES, TIPOGRAFIA E TOKENS)

### 4.1 Arquitetura dos Tokens
* **Arquivo Central:** [src/index.css](file:///c:/Users/melki/Projetos/PCM/src/index.css) (1.092 linhas).
* **Light Mode:** Canvas Baunilha/Creme (`--bg-app: #F5EFE6`), superfícies hospitalares brancas (`--bg-surface: #FFFFFF`), chrome e sidebar em Deep Navy Nobre (`--nav-bg: #142032`).
* **Dark Mode:** Canvas Obsidian Ardósia (`--bg-app: #0E1420`), superfícies em grafite azulado (`--bg-surface: #151E2C`), botões primários transformados em Baunilha Nobre (`#FFFFFF` a `#EFE7DA`) com texto invertido escuro.
* **Física Óptica:** Direcionamento de luz a 135° com micro-bisel tátil (`--tactile-bevel`), sombreamento em camadas (`--elevation-z0` a `--elevation-z4`).

### 4.2 Inconsistências de Cores Hardcoded Detectadas
Foram mapeadas mais de **40 cores hexadecimais soltas** fora dos tokens semânticos:
1. `src/index.css`: Linha 447 e 461 — `.tactile-input:focus` aplica `border-color: #0077B6` (azul ciano alienígena aos tokens `--accent-*` ou `--color-navy-*`).
2. `CertificateAndReferral.tsx`: Uso repetido de `#1E4F7A`, `#0F6292`, `#155730`, `#15803D`, `#F4FBF7`.
3. `PediatricCalculator.tsx`: Uso de `#155730`, `#15803D`, `#F4F7FC`, `#0B132B`, `#388EE6`.
4. `DoctorProfileModal.tsx`, `PatientModal.tsx` e `Header.tsx`: Estilos inline com ternários manuais (`style={{ backgroundColor: darkMode ? '#0E1420' : '#FFFFFF' }}`) em vez de classes utilitárias baseadas em tokens (`bg-[var(--surface-card)]`).

### 4.3 Auditoria Tipográfica
1. **Desperdício de Payload:** O `index.html` realiza o download de `Cormorant Garamond` (pesos 500, 600, 700 e itálico), porém no `src/index.css`:
   ```css
   --font-main: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, ...;
   --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, ...;
   --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, ...;
   ```
   A fonte Garamond não é aplicada em **nenhum** seletor de classe.
2. **Folha A4 Médica:** Promete "fontes serifadas de alta fidelidade", mas aplica classes genéricas `font-sans` nos cabeçalhos e recai na fonte serifada padrão do sistema operacional no corpo dos itens prescritos.
3. **Corrupção de Encoding:** Foram identificadas strings no [src/components/PrintPreview.tsx](file:///c:/Users/melki/Projetos/PCM/src/components/PrintPreview.tsx) com caracteres corrompidos em tempo de compilação: `"Observaes Mdicas:"`, `"Resumo Clnico / Evoluo:"`, `"Hiptese Diagnstica (CID-10):"`.

---

## 5. ANÁLISE DE NAVEGAÇÃO E RESPONSIVIDADE

### 5.1 Matriz de Comportamento dos Menus

| Componente | Desktop (≥ 1024px) | Tablet (768px - 1023px) | Mobile (< 768px) |
| :--- | :--- | :--- | :--- |
| **`Header.tsx`** | Exibe Logo, Chip de Paciente, Input Rápido de Peso e Toggle de Tema. | Esconde input rápido de peso e subtítulo do logo. | Compacto. Esconde peso solto; chip do paciente abre modal. |
| **`Sidebar.tsx`** | Fixa com 280px ou colapsada para 72px com ícones rápidos. | Recolhida por padrão; abre como drawer com backdrop escuro. | Drawer lateral acionado pelo botão hambúrguer ou aba "Mais". |
| **`MobileBottomNav.tsx`** | Oculto (`md:hidden`). | Oculto (`md:hidden`). | Fixo no rodapé com 5 atalhos principais + botão "Mais". |

### 5.2 Defeitos Ergonômicos Detectados
* **Overflow no Bottom Nav Mobile:** Em viewports de 375px (iPhone padrão), o botão "Prescrição" sofre de corte lateral na borda esquerda (`padding` insuficiente com corte no indicador tátil).
* **Contraste no Dark Mode do Header:** O chip de paciente e o chip de peso mantêm fundo esbranquiçado no modo escuro, gerando quebra na uniformidade visual hospitalar.

---

## 6. GALERIA DE EVIDÊNCIAS VISUAIS (CAPTURA DINÂMICA VIA BROWSER)

As evidências foram capturadas através de automação via Chrome DevTools Protocol (CDP) em resolução Retina 2x e estão armazenadas no diretório de artefatos:

```
C:\Users\melki\.gemini\antigravity\brain\5944a45c-3f35-4db3-9bc1-0628fc0d33a6\screenshots\
```

### 6.1 Telas Principais do Sistema

1. **Dashboard / Construtor de Receitas (Tema Claro):**
   * *Evidência:* `01_dashboard_prescription_light.png`
   * *Análise:* Excelente clareza visual. Painel de navegação em Deep Navy, formulário tátil no centro e pré-visualização A4 da receita na coluna direita com badges dos horários de tomada (06:00, 12:00, 18:00, 00:00).
2. **Dashboard / Construtor de Receitas (Tema Escuro):**
   * *Evidência:* `01_dashboard_prescription_dark.png`
   * *Análise:* Os botões primários convertem-se perfeitamente para Baunilha Nobre com alto contraste. Detectada inconsistência de contraste nos chips do Header.
3. **Calculadora Pediátrica Inteligente:**
   * *Evidência:* `02_pediatric_calculator_light.png` e `02_pediatric_calculator_dark.png`
   * *Análise:* Ajuste de peso em tempo real com botões de passo (-1, -0.5, +0.5, +1) e faixas etárias. Tabela com 49 fármacos recalculando volumes (mL), gotas e dosagem total com teto de segurança.
4. **Módulo de Exames e Atestados / Encaminhamentos:**
   * *Evidência:* `03_exam_requester_light.png`, `04_certificate_referral_light.png` e `04_referral_subtab_light.png`
   * *Análise:* Buscador de CID-10 ágil com sugestões em 1 clique. Sinalização legal CFM presente.
5. **Decks de Protocolos Clínicos Ambulatoriais:**
   * *Evidência:* `05_clinical_protocols_light.png`
   * *Análise:* Tratamentos de 1ª linha categorizados (Infectologia, Gastro, etc.) com prescrição de combo em 1 clique ajustada ao peso da criança.
6. **Modais de Configuração (Médico e Paciente):**
   * *Evidência:* `07_modal_doctor_profile_light.png` e `08_modal_patient_light.png`
   * *Análise:* Diálogos com foco acessível, suporte a `Escape` e campos regulamentares (CRM, RQE, CPF, Alergias).
7. **Documento A4 Final (PrintPreview):**
   * *Evidência:* `09_print_preview_a4_light.png` e `09_print_preview_a4_dark.png`
   * *Análise:* Folha A4 sempre branca nos dois temas, preservando integridade para impressão e geração de PDF.
8. **Responsividade Mobile & Drawer Lateral:**
   * *Evidência:* `10_mobile_prescription_light.png`, `11_mobile_sidebar_drawer_light.png` e `12_tablet_view_light.png`
   * *Análise:* Drawer lateral fluído e layout adaptado para telas de toque.

---

## 7. LISTA DE DÉBITOS TÉCNICOS E RECOMENDAÇÕES PRIORIZADAS

### Prioridade P0 (Imediata — Risco de Regressão e Quebra)
1. **Correção do Script `clean` no `package.json`:**
   * *Problema:* `"clean": "rm -rf dist server.js"` falha no Windows PowerShell.
   * *Ação:* Substituir por um script compatível com Node ou rimraf (`node -e "fs.rmSync('dist', {recursive: true, force: true})"`).
2. **Remoção de Dependências Fantasma:**
   * *Problema:* `@google/genai`, `express`, `dotenv`, `@types/express` poluem o `node_modules` e o bundle sem uso.
   * *Ação:* Desinstalar dependências que não pertencem a uma SPA 100% offline.
3. **Correção de Encoding em Textos Sanitários:**
   * *Problema:* Caracteres acentuados corrompidos em `PrintPreview.tsx` aparecem nos cabeçalhos impressos de atestados e encaminhamentos.
   * *Ação:* Corrigir as strings para UTF-8 válido.

### Prioridade P1 (Modularidade e Performance)
4. **Code-Splitting dos Módulos de Documento:**
   * *Problema:* Bundle único de 973 kB.
   * *Ação:* Aplicar `React.lazy()` no `PrintPreview`, `html2canvas` e `jspdf`, reduzindo o *initial load* para menos de 300 kB.
5. **Decisão Arquitetural sobre o "Subsistema Zumbi":**
   * *Problema:* Duplicidade entre `medicationDatabase.ts` (ativo) e o trio `adultMeds.ts` / `fuzzySearch.ts` / `MedicationSelectionModal.tsx` (inativo).
   * *Ação:* Escolher a estratégia definitiva: integrar a busca fuzzy superior de `fuzzySearch.ts` ao `PrescriptionBuilder` ou remover o código morto para reduzir o repositório em 135 kB.

### Prioridade P2 (Consistência do Design System e Acessibilidade)
6. **Eliminação de Cores Hexadecimais Hardcoded:**
   * *Problema:* `#0077B6`, `#1E4F7A`, `#155730` espalhadas no código.
   * *Ação:* Substituir pelas variáveis oficiais (`var(--color-navy-*)`, `var(--accent-*)`).
7. **Correção do Bug Visual de Contraste no Header (Dark Mode):**
   * *Problema:* Chips de paciente e peso permanecem claros no modo escuro.
   * *Ação:* Aplicar classes semânticas `bg-surface-card` e `text-main` nos chips do Header.
8. **Saneamento Tipográfico:**
   * *Problema:* Download desnecessário de `Cormorant Garamond` no `index.html`.
   * *Ação:* Ou aplicar a Garamond oficialmente nos títulos das folhas A4 de impressão médica, ou remover a requisição do Google Fonts para otimizar o Core Web Vitals.
