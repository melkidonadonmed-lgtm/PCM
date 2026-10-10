# PresCMed PRO — Sistema de Prescrição Médica & Cálculos Pediátricos

[![Produção Cloud Run](https://img.shields.io/badge/Produção-Cloud%20Run%20(SP)-0ea5e9?style=flat-square&logo=googlecloud)](https://prescmed-syqnqsm4iq-rj.a.run.app)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Testes-23%20passed-22c55e?style=flat-square&logo=vitest)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-8b5cf6?style=flat-square)](https://web.dev/progressive-web-apps/)

Sistema corporativo de prescrição médica digital, cálculo inteligente de doses pediátricas por peso, solicitação de exames, atestados médicos e geração de documentos clínicos em PDF (padrão A4) no contexto sanitário e regulatório brasileiro (pt-BR).

**Acesse a versão oficial de produção:** [https://prescmed-syqnqsm4iq-rj.a.run.app](https://prescmed-syqnqsm4iq-rj.a.run.app)

---

## 1. Filosofia de Arquitetura: Local-First & Nuvem Híbrida

O PresCMed foi concebido para atuar em cenários clínicos de alta exigência (Prontos-Socorros, UBS, Ambulatórios e áreas com sinal instável ou sem internet), seguindo a arquitetura **Local-First**:

* **Operação 100% Offline (PWA):** Todo o núcleo da aplicação roda integralmente no navegador do médico. Service Worker via Workbox realiza o precache de 29 assets estáticos (2.36 MB), permitindo carregamento instantâneo e instalação como aplicativo nativo no Windows, macOS, Android e iOS.
* **Persistência Primária em IndexedDB (Dexie.js v2):** Dados locais gravados sem latência nas tabelas `workContexts` e `savedDocuments`.
* **Sincronização Híbrida Opcional (Zero-Knowledge / Firebase):** A nuvem atua estritamente como réplica periférica assíncrona. Quando conectado com conta Google, o motor `cloudSyncManager` sincroniza em lote postos de trabalho e modelos de receitas reutilizáveis via Firestore.
* **Sigilo Médico e LGPD (Lei 13.709/2018):** Prontuários, nomes de pacientes, CPF/RG, diagnósticos e rascunhos de consultas **nunca saem do dispositivo**. Apenas metadados institucionais e modelos vazios trafegam na nuvem sob regras estritas de isolamento por `request.auth.uid`.
* **Isolamento Absoluto de Chunks:** Todo o SDK do Firebase (`firebase/app`, `firebase/auth`, `firebase/firestore`) reside em um chunk segregado (`vendor-firebase`), carregado via `import()` dinâmico exclusivamente após o clique em "Nuvem". O bundle principal permanece cravado em **294 kB** (< 295 kB).

---

## 2. Funcionalidades Clínicas

* **Calculadora de Doses Pediátricas por Peso:**
  * Regras clínicas brasileiras consagradas (Paracetamol gotas: 1 gota/kg/dose; Dipirona gotas: 20 mg/kg/dose; Amoxicilina suspensão por mg/kg/dia).
  * Normalização e travas de segurança contra entradas extremas ou anômalas (piso seguro de 0,5 kg; teto seguro de 120 kg).
  * Gerador automatizado de posologia com cálculo de tomadas de 4/4h, 6/6h, 8/8h, 12/12h e 24/24h.
* **Receituário de Controle Especial (Portaria SVS/MS nº 344/98 e RDC 784/2023):**
  * Detecção de substâncias controladas das listas C1 e B1 (Clonazepam, Zolpidem, Sertralina, Fluoxetina, Tramadol, etc.).
  * Partição automática em 2 vias (1ª Via Farmácia / 2ª Via Paciente) com blocos regulamentares de Identificação do Comprador e Fornecedor/Dispensador.
* **Atestados Médicos & Consentimento de CID-10 (Resoluções CFM nº 1.658/2002 e 1.819/2007):**
  * Preservação constitucional do sigilo de diagnóstico.
  * Inclusão de CID-10 condicionada a aceite explícito do paciente, com inserção automática do aviso legal mandatório.
* **Encaminhamentos & Solicitações de Exames:**
  * Referência e contrarreferência com especialidade de destino, justificativa e hipótese diagnóstica.
  * Catálogo com mais de 40 exames laboratoriais e de imagem com preparo do paciente.
* **Editor Livre de Documentos A4:**
  * Processador de texto clínico baseado em Tiptap com simulação de folha A4 em tempo real, suporte a timbrados institucionais e cabeçalhos/rodapés personalizados.
* **Portabilidade de Dados (`.pcm.json`):**
  * Exportação e restauração completa de postos de trabalho e modelos em arquivo JSON seguro e auditável.

---

## 3. Stack Tecnológica

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Framework & UI** | React 19, TypeScript ~5.8, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide Icons, Motion |
| **Editor de Texto** | Tiptap v3 Starter Kit (`@tiptap/pm`, `@tiptap/react`, text-align, placeholder) |
| **Banco Local** | Dexie.js v4 (IndexedDB) com hooks nativos de sincronização |
| **Exportação PDF** | jsPDF, jsPDF-AutoTable, html2canvas |
| **PWA & Offline** | Vite Plugin PWA, Workbox (precache estrito com `globIgnores` para chunks lazy) |
| **Infraestrutura Cloud** | Google Cloud Run (São Paulo / `southamerica-east1`), Docker Multi-Stage (`node:20-alpine` + `nginx:alpine`) |
| **Nuvem & Auth** | Firebase Auth (Google Sign-In OAuth2) + Cloud Firestore (`firestore.rules` com Zero-Knowledge) |
| **Testes Automatizados** | Vitest 5.0.2 com suítes de segurança clínica e conformidade sanitária |

---

## 4. Estrutura do Código

```plaintext
PCM/
├── .dockerignore                            # Exclusão de caches, logs e node_modules
├── Dockerfile                               # Multi-stage: Node.js 20 build + Nginx Alpine (< 25 MB)
├── nginx.conf                               # Porta dinâmica $PORT, Gzip, SPA fallback, CSP e PWA cache
├── firestore.rules                          # Regras de segurança Firestore com isolamento por usuário
├── deploy-cloudrun.ps1                      # Automação de deploy para PowerShell 7 / Windows
├── deploy-cloudrun.sh                       # Automação de deploy para ambientes Bash / Linux / CI
├── vitest.config.ts                         # Configuração do Vitest com aliases de projeto
├── src/
│   ├── __tests__/                           # Suíte de testes automatizados (23 testes clínicos)
│   │   ├── doseCalculator.test.ts           # Testes de cálculo pediátrico e horários de posologia
│   │   ├── sanitaryCompliancePortaria344.test.ts # Testes de controle especial e Portaria 344/98
│   │   └── cfmConsentCid10.test.ts          # Testes de sigilo médico e Resolução CFM 1.658/2002
│   ├── components/                          # Componentes funcionais modulares
│   │   ├── Header.tsx                       # Cabeçalho com CloudAuthButton (Status dinâmico)
│   │   ├── Sidebar.tsx                      # Navegação lateral com troca rápida de postos
│   │   ├── PrescriptionBuilder.tsx          # Construtor de receituário comum e especial
│   │   ├── PediatricCalculator.tsx          # Calculadora de dose mg/kg → mL/gotas
│   │   ├── DocumentEditorView.tsx           # Processador de laudos clínicos e canvas A4
│   │   ├── PrintPreview.tsx                 # Visualização de impressão médica e exportação PDF
│   │   ├── ExamRequester.tsx                # Solicitação de exames complementares
│   │   └── CertificateAndReferral.tsx       # Atestados médicos e encaminhamentos
│   ├── data/                                # Catálogos clínicos estáticos em pt-BR
│   │   ├── medicationDatabase.ts            # Medicamentos adultos e substâncias de controle especial
│   │   ├── pediatricMeds.ts                 # Medicamentos pediátricos com concentrações de referência
│   │   ├── cidCatalog.ts                    # Catálogo CID-10 com busca inteligente
│   │   └── examCatalog.ts                   # Catálogo de exames laboratoriais e de imagem
│   ├── services/                            # Camada de serviços e persistência
│   │   ├── db.ts                            # Banco Dexie.js v2 (workContexts e savedDocuments)
│   │   ├── backupService.ts                 # Exportação e restauração de dados (.pcm.json)
│   │   └── cloud/                           # Camada de nuvem híbrida (carregamento lazy)
│   │       ├── firebaseClient.ts            # Inicialização dinâmica sob demanda do Firebase SDK
│   │       ├── cloudAuthService.ts          # Google Sign-In com detecção de sessão local
│   │       └── cloudSyncManager.ts          # Sincronizador assíncrono bidirecional (Last-Write-Wins)
│   ├── utils/                               # Utilitários de domínio
│   │   ├── doseCalculator.ts                # Motor matemático de doses pediátricas
│   │   └── pdfGenerator.ts                  # Montador programático de PDFs médicos
│   ├── types.ts                             # Contratos e interfaces de domínio médico
│   └── index.css                            # Design System em Tailwind v4 (Tokens de luz óptica)
```

---

## 5. Como Executar Localmente

### Pré-requisitos
* Node.js 20+ LTS
* npm 10+
* Git

### Instalação e Execução

```powershell
# Clone o repositório
git clone git@github.com:melkidonadonmed-lgtm/PCM.git
cd PCM

# Instalação reprodutível a partir do lockfile
npm ci

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev
```

Abra `http://localhost:3000` no seu navegador.

---

## 6. Governança e Testes Automatizados

O projeto conta com suíte de testes unitários automatizados via **Vitest**, cobrindo regras críticas de domínio clínico e sanitário (YMYL):

```powershell
# Execução da suíte completa de testes (23 testes)
npm run test

# Modo contínuo (Watch Mode para desenvolvimento)
npm run test:watch

# Checagem estrita de tipagem TypeScript
npm run lint

# Build de produção otimizado
npm run build
```

---

## 7. Deploy em Produção (Google Cloud Run)

O deploy é 100% automatizado através do **Google Cloud Build**, compilando a imagem Docker remotamente e provisionando o container Nginx no Cloud Run:

```powershell
# Deploy nativo no Windows (PowerShell 7)
.\deploy-cloudrun.ps1 -Region southamerica-east1

# Deploy via ambientes Unix / Bash / Cloud Shell
./deploy-cloudrun.sh
```

### Métricas de Produção
* **URL de Produção:** [https://prescmed-syqnqsm4iq-rj.a.run.app](https://prescmed-syqnqsm4iq-rj.a.run.app)
* **Região:** `southamerica-east1` (São Paulo / baixa latência no Brasil)
* **Bundle Principal:** `294.25 kB` (gzip: `69.55 kB`)
* **Chunk Satélite Firebase:** `910.59 kB` isolado em `vendor-firebase` (carregado sob demanda, fora do precache do Service Worker)
* **Container:** Nginx Alpine com Gzip, `/health`, CSP estrita e cache imutável de 1 ano para assets versionados.

---

## 8. Licença e Responsabilidade Clínica

Este software é um instrumento de produtividade e apoio à tomada de decisão médica. O cálculo de doses e a emissão de documentos são baseados em literatura clínica de referência no Brasil, mas a conduta final, a prescrição e a conferência dos dados são de responsabilidade técnica e legal exclusiva do médico assistente habilitado no CRM.
