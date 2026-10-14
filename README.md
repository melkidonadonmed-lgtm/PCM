# PresCMed — Prescrição Médica e Documentos Clínicos

[![Produção Cloud Run](https://img.shields.io/badge/Produção-Cloud%20Run%20(SP)-0ea5e9?style=flat-square&logo=googlecloud)](https://prescmed-syqnqsm4iq-rj.a.run.app)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Testes-Vitest-22c55e?style=flat-square&logo=vitest)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-8b5cf6?style=flat-square)](https://web.dev/progressive-web-apps/)

Sistema de prescrição médica digital para o contexto clínico e ambulatorial brasileiro (pt-BR): receitas, cálculo de doses pediátricas por peso, pedidos de exames, atestados, encaminhamentos e documentos do SUS, todos emitidos em folha A4.

**Produção:** [https://prescmed-syqnqsm4iq-rj.a.run.app](https://prescmed-syqnqsm4iq-rj.a.run.app)

> Quem for alterar o código (pessoa ou agente) deve ler o [AGENTS.md](AGENTS.md): ele traz as regras clínicas, sanitárias e de emissão de documentos que este README só resume.

---

## 1. Arquitetura: local primeiro, nuvem opcional

O PresCMed é uma **SPA 100% client-side**, pensada para pronto-socorro, UBS e ambulatório, inclusive com internet instável.

* **Funciona offline (PWA):** o aplicativo roda inteiro no navegador. O Service Worker (Workbox) guarda os arquivos estáticos e permite instalar como aplicativo no Windows, macOS, Android e iOS.
* **Dados no dispositivo:** médico, paciente, receita, exames, atestado e encaminhamento ficam em `localStorage`; postos de trabalho e documentos salvos ficam no IndexedDB (Dexie.js, tabelas `workContexts` e `savedDocuments`).
* **Nuvem opcional (Firebase):** com login Google, o `cloudSyncManager` sincroniza postos de trabalho e modelos reutilizáveis pelo Firestore, com regras de isolamento por `request.auth.uid` (`firestore.rules`). Dados de paciente e de consulta não fazem parte dessa sincronização.
* **Firebase fora do carregamento inicial:** o SDK fica no chunk `vendor-firebase`, carregado só depois do clique em "Nuvem" e fora do cache offline. O Editor A4 (Tiptap) e o motor de PDF também são carregados sob demanda.
* **Sem telemetria:** nada é enviado a terceiros sem ação explícita do usuário.

---

## 2. Funcionalidades

* **Receita médica (A4 paisagem — padrão PEC do SUS)**
  * Combobox único de busca (`Ctrl+K`) por nome e classe SUS/RENAME com proteção contra sobrescrita acidental no `Enter`, modo rápido de posologia (cálculo automático do total de comprimidos a dispensar), kits de plantão (6) e protocolos por patologia (8) com "Usar na receita".
  * Três regimes em folha A4 horizontal (`1123×794 px`), cada um no seu documento:
    * **Simples:** 1 via na metade esquerda da folha, linha de corte central (`✂`) e metade direita livre.
    * **Antimicrobiano (RDC Anvisa nº 471/2021):** 2 vias lado a lado no mesmo modelo limpo, válida por 10 dias (retenção da 2ª via na farmácia), incluindo sexo do paciente quando informado.
    * **Controle especial (Portaria SVS/MS nº 344/98):** 2 vias lado a lado (retenção da 1ª via na farmácia), com endereço do paciente e quadros de comprador e fornecedor.
  * Aviso de tela (`.no-print`) e ressalva automática no WhatsApp/área de transferência quando o controlado exige **Notificação de Receita** em talonário próprio (listas A1, A3, B1, B2 e C2). O app não emite o talonário.
* **Calculadora pediátrica por peso (aba dedicada e gaveta lateral)**
  * Converte mg/kg em mL ou gotas, com regras usadas no Brasil (ex.: paracetamol gotas a 1 gota/kg/dose) e inserção em 1 toque direto na receita.
  * "Sem peso, sem dose": sem peso cadastrado, nenhuma dose é calculada. O peso aceito vai de 0,5 kg a 120 kg.
* **Central de Documentos**
  * **Atestado médico:** o CID-10 só entra com consentimento explícito do paciente (Resoluções CFM nº 1.658/2002 e 1.819/2007).
  * **Encaminhamento:** especialidade de destino, justificativa e hipótese diagnóstica.
  * **Pedido de exames:** catálogo de exames laboratoriais e de imagem, com 14 rotinas prontas (pré-natal por trimestre, saúde da mulher, do homem e do idoso, HAS, diabetes, IST, pré-operatório, entre outras).
  * **Documentos SUS (9):** a APAC (laudo principal de 55 campos) e a LME (23 campos) saem sobre o **impresso oficial**, com cada dado no campo numerado (incluindo preenchimento automático de CNS, CPF e CNES do médico quando cadastrados). Os demais (APAC complementar, guia SISREG, GAL/LACEN, SISCAN, TRM-TB) saem no modelo do app, com o logo do órgão e o do SUS, sem códigos SIGTAP ou CID-10 presumidos por padrão.
* **Editor A4:** editor de texto (Tiptap) para laudos e documentos livres, com alternância entre os 3 regimes de receita, timbre institucional duplo (órgão + SUS) e conversão de volta para itens estruturados da receita.
* **Ergonomia e navegação rápida:** barra segmentada no cabeçalho desktop com atalhos globais `Alt+1` a `Alt+5` (Receitas, Documentos, Doses, Protocolos e Editor), `Sidebar` recolhível (`68px`) com tooltips flutuantes e abas com navegação por setas (`roving tabindex`).
* **Backup portátil:** exportação e restauração em arquivo `.pcm.json`.

### Como os documentos são emitidos

* **O que aparece na folha é o que sai.** A prévia, a impressão e o PDF usam o mesmo componente (`src/components/documento/`). O PDF é uma fotografia da folha exibida; para texto selecionável, use Imprimir → "Salvar como PDF".
* **Nada inventado.** Não há QR code, "validação digital" nem "assinatura eletrônica", porque o app não assina digitalmente. Campo vazio não é impresso, e dado clínico nunca vem preenchido por padrão.
* **Médico identificado.** Imprimir, gerar PDF, enviar por WhatsApp e copiar o texto exigem nome e CRM cadastrados.

---

## 3. Stack

| Camada | Tecnologias |
| :--- | :--- |
| **Interface** | React 19, TypeScript ~5.8, Tailwind CSS v4 (`@tailwindcss/vite`), Material Symbols (offline) e `lucide-react` |
| **Build** | Vite 6 |
| **Editor de texto** | Tiptap 3 |
| **Banco local** | Dexie.js 4 (IndexedDB) e `localStorage` |
| **PDF** | `html2canvas-pro` + jsPDF |
| **PWA** | `vite-plugin-pwa` (Workbox) |
| **Nuvem (opcional)** | Firebase 12: Auth (Google) e Cloud Firestore |
| **Testes** | Vitest 5 |
| **Produção** | Google Cloud Run (`southamerica-east1`), imagem Docker em dois estágios (`node:24-alpine` + `nginx:alpine`) |

---

## 4. Estrutura do código

```plaintext
PCM/
├── AGENTS.md                      # Regras do projeto para quem altera o código (leitura obrigatória)
├── DESIGN.md                      # Sistema de design (validado por `npm run design:lint`)
├── Dockerfile                     # Type-check e testes, depois build; Nginx serve dist/
├── cloudbuild.yaml                # Build, push, deploy e teste de fumaça (gatilho: push em main)
├── nginx.conf                     # Porta $PORT, SPA fallback, cache e /health
├── nginx-security-headers.conf    # Cabeçalhos de segurança incluídos em cada location
├── firestore.rules                # Regras do Firestore com isolamento por usuário
├── deploy-cloudrun.ps1 / .sh      # Deploy manual (submete o mesmo cloudbuild.yaml)
├── public/
│   ├── formularios-sus/           # Impressos oficiais da APAC e da LME (fundo da folha)
│   └── logos/, watermarks/        # Logos de órgãos e marcas d'água
└── src/
    ├── App.tsx                    # Estado da aplicação e navegação por abas
    ├── types.ts                   # Tipos de domínio
    ├── index.css                  # Tailwind v4 e tokens de design
    ├── components/
    │   ├── PrescriptionBuilder.tsx    # Tela de receitas
    │   ├── PediatricCalculator.tsx    # Calculadora de dose por peso
    │   ├── ClinicalDocumentsHub.tsx   # Central de Documentos (atestado, encaminhamento, exames, SUS)
    │   ├── SusDocumentsFiller.tsx     # Preenchimento dos documentos SUS
    │   ├── ClinicalProtocolsView.tsx  # Protocolos clínicos
    │   ├── DocumentEditorView.tsx     # Editor A4
    │   ├── PrintPreview.tsx           # Tela de emissão (PDF, imprimir, WhatsApp, copiar)
    │   └── documento/                 # Folha A4 única: receita, exames, atestado, encaminhamento e impresso oficial
    ├── data/                      # Catálogos: medicamentos, doses pediátricas, exames, CID-10, kits, protocolos, SUS
    ├── hooks/                     # Sessão da receita, posto de trabalho, instalação do PWA
    ├── services/                  # IndexedDB, localStorage, backup e nuvem (services/cloud/)
    ├── utils/                     # Cálculo de dose, regime da receita, regras da folha, PDF
    └── __tests__/                 # Testes de regras clínicas, sanitárias e de emissão
```

A lista completa, arquivo por arquivo, está no [AGENTS.md](AGENTS.md).

---

## 5. Como executar localmente

### Pré-requisitos
* Node.js 24 ou mais recente (a imagem de produção usa Node 24)
* npm
* Git

### Instalação e execução

```powershell
git clone https://github.com/melkidonadonmed-lgtm/PCM.git
cd PCM

# Instalação reproduzível a partir do package-lock.json
npm ci

# Servidor de desenvolvimento
npm run dev
```

Abra `http://localhost:3001` no navegador.

O login na nuvem é opcional. As variáveis `VITE_FIREBASE_*` estão documentadas em `.env.example` e têm valores padrão no código.

---

## 6. Testes e verificações

```powershell
npm run test         # Suíte completa (Vitest)
npm run test:watch   # Modo contínuo
npm run lint         # Type-check: tsc --noEmit
npm run design:lint  # Conformidade com o DESIGN.md
npm run build        # Build de produção em dist/
```

A suíte cobre as regras críticas do domínio médico e da interface:

* Cálculo de dose pediátrica, formatação numérica e horários de tomada.
* Kits de plantão, com snapshots, e posologia estruturada (total de comprimidos a dispensar).
* Regime da receita em A4 paisagem (simples, antimicrobiano, controle especial), as 2 vias da Portaria 344/98 e o aviso de Notificação de Receita (tela e texto exportado).
* Consentimento do paciente para o CID-10 no atestado.
* Folha única dos documentos: cabeçalho institucional, ausência de selos de validação, nenhum texto clínico inventado e retorno do HTML do Editor A4 para itens tipados.
* Documentos SUS: nenhum dado presumido; APAC e LME com cada dado no campo certo do impresso oficial.
* Catálogo de exames: todo exame de um painel existe no catálogo.
* Navegação, acessibilidade e fluxo de consulta: atalhos globais (`Alt+1..5`), `roving tabindex` por setas, combobox único sem sobrescrita acidental, gaveta pediátrica e higienização de sessão ao trocar de paciente.

Qualquer alteração em cálculo de dose, kits, catálogos de medicamentos ou conformidade sanitária exige rodar `npm run test`, `npm run lint` e `npm run design:lint`, além de revisão clínica.

---

## 7. Deploy em produção (Google Cloud Run)

**Um push em `main` publica em produção.** O gatilho do Cloud Build executa o `cloudbuild.yaml`: build da imagem, push, deploy e teste de fumaça.

* **Portão de qualidade:** o `Dockerfile` roda `npm run lint` e `npm run test` antes do build. Se algo falhar, a imagem não é gerada e nada é publicado.
* **Deploy manual:** publica o que está na pasta local, pelo mesmo `cloudbuild.yaml`.

```powershell
# Windows (PowerShell 7)
pwsh -File .\deploy-cloudrun.ps1

# Bash / Cloud Shell
bash deploy-cloudrun.sh
```

* **Serviço:** `prescmed`, região `southamerica-east1` (São Paulo).
* **Verificação de saúde:** `/health`.
* **Cabeçalhos de segurança:** definidos em `nginx-security-headers.conf`. A CSP está em modo `Report-Only` até ser validada com o login Google/Firebase.

---

## 8. Responsabilidade clínica

Este software é um instrumento de produtividade e de apoio à decisão médica. O cálculo de doses e a emissão de documentos seguem referências clínicas e normas sanitárias brasileiras, mas a conduta, a prescrição e a conferência dos dados são de responsabilidade técnica e legal exclusiva do médico assistente habilitado no CRM.

Os kits de plantão e algumas doses pediátricas fixas ainda aguardam revisão clínica formal; os detalhes estão no [AGENTS.md](AGENTS.md).
