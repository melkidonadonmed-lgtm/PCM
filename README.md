# PresCMed (PCM) — Sistema de Prescrição Médica Digital & Cálculos Clínicos

[![Versão](https://img.shields.io/badge/vers%C3%A3o-2.0.0-blue.svg)](package.json)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com)
[![Testes Unitários](https://img.shields.io/badge/Testes-15%20passando-emerald.svg)](src/utils/prescriptionRules.test.ts)
[![Privacidade](https://img.shields.io/badge/Privacidade-100%25%20Client--Side-success.svg)](#-segurança--privacidade-zero-knowledge)

O **PresCMed (PCM)** é um sistema progressivo e completo de prescrição médica digital, cálculo de doses clínicas/pediátricas e emissão de documentos ambulatoriais e hospitalares, adaptado às diretrizes sanitárias e práticas médicas do Brasil (**pt-BR**).

Desenvolvido como uma **Single Page Application (SPA) 100% client-side**, o PresCMed opera totalmente no navegador do profissional, sem dependência de servidores de backend ou tráfego de dados de saúde na nuvem, garantindo sigilo médico e conformidade estrita com a LGPD.

---

## 📋 Sumário

- [Visão Geral & Diferenciais](#-visão-geral--diferenciais)
- [Funcionalidades Principais](#-funcionalidades-principais)
  - [1. Receituário Inteligente & Segregação Sanitária (YMYL)](#1-receituário-inteligente--segregação-sanitária-ymyl)
  - [2. Assistente de Quantidade & Embalagens](#2-assistente-de-quantidade--embalagens)
  - [3. Calculadora Clínica & Pediátrica por Peso](#3-calculadora-clínica--pediátrica-por-peso)
  - [4. Solicitação de Exames Laboratoriais e de Imagem](#4-solicitação-de-exames-laboratoriais-e-de-imagem)
  - [5. Atestados Médicos & Encaminhamentos Padrão CFM](#5-atestados-médicos--encaminhamentos-padrão-cfm)
  - [6. Decks de Protocolos Clínicos Ambulatoriais](#6-decks-de-protocolos-clínicos-ambulatoriais)
  - [7. Busca Rápida, Acessibilidade & Entrada por Voz](#7-busca-rápida-acessibilidade--entrada-por-voz)
  - [8. Visualização & Emissão de Documentos (PDF / Impressão)](#8-visualização--emissão-de-documentos-pdf--impressão)
- [Segurança & Privacidade (Zero-Knowledge)](#-segurança--privacidade-zero-knowledge)
- [Design System Hospitalar Tátil](#-design-system-hospitalar-tátil)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)
- [Qualidade & Testes Automatizados](#-qualidade--testes-automatizados)
- [Normas Regulatórias de Referência](#-normas-regulatórias-de-referência)

---

## 🌟 Visão Geral & Diferenciais

| Pilar | Descrição |
| :--- | :--- |
| **Proteção Sanitária Ativa** | Classificação e separação automática dos tipos de receita (Simples, Antimicrobianos e Controle Especial C1) com regras estritas da Anvisa. |
| **Doses Pediátricas Seguras** | Cálculo automático por mg/kg com conversão direta para gotas ou mL, respeitando tetos máximos de segurança. |
| **100% Offline-First / Client-Side** | Funciona sem internet após o carregamento inicial; nenhum dado de paciente ou prescrição trafega pela rede. |
| **Pronto para Atendimento Rápido** | Protocolos clínicos prontos, busca rápida tolerante a erros de digitação e comando de voz para prescrição ágil. |
| **Impressão Médica Calibrada** | Layout A4 médico impecável, numeração de vias legalmente apropriada e paginação contínua que nunca corta carimbos ou rodapés. |

---

## 🚀 Funcionalidades Principais

### 1. Receituário Inteligente & Segregação Sanitária (YMYL)

O sistema conta com um motor de classificação farmacológica que analisa ativamente os medicamentos prescritos e aplica as normas legais vigentes:

- **Receita Simples (1 via):** Destinada a analgésicos, anti-inflamatórios, antialérgicos, anti-hipertensivos e sintomáticos de uso geral.
- **Receituário de Antimicrobianos (2 vias):** 
  - Em conformidade com a **RDC Anvisa nº 20/2011** e **IN nº 471/2021**.
  - Emissão automática de **1ª via (Farmácia/Dispensação)** e **2ª via (Paciente/Orientações)**.
  - **Barreira Sanitária:** Bloqueia automaticamente a emissão de antibióticos misturados em receitas simples.
- **Receituário de Controle Especial — Lista C1 (2 vias):**
  - Em conformidade com a **Portaria SVS/MS nº 344/98**.
  - **Teto Legal de Substâncias:** Limita a no máximo **3 substâncias controladas por folha**. Caso haja mais de 3, o sistema particiona a prescrição automaticamente em múltiplos receituários de 2 vias.
  - **Transcrição por Extenso:** Quantidades totais em dígitos são automaticamente convertidas e grafadas por extenso (ex.: *2 (dois) frascos*).
- **Alerta Sanitário para Notificações de Receita (Listas A e B):**
  - Detecta e alerta sobre substâncias que exigem notificação de receita física oficial em talonário especial (ex.: benzodiazepínicos, estimulantes centrais e opioides fortes).

### 2. Assistente de Quantidade & Embalagens

- Determina o quantitativo exato de frascos ou caixas a dispensar a partir da dose unitária, posologia diária e dias de tratamento.
- Conversão precisa de gotas para mililitros ($gotas/mL$).
- Arredondamento seguro para cima para assegurar que o paciente complete o ciclo terapêutico sem interrupções.
- Gera justificativa clara de cálculo em linguagem natural pt-BR.

### 3. Calculadora Clínica & Pediátrica por Peso

- Cálculo em tempo real de doses pediátricas a partir do peso corporal informado do paciente ($mg/kg \to mL$ ou gotas).
- Catálogo especializado pediátrico com dosagens padronizadas, limites de dose teto (dose máxima por tomada ou dia) e vias de administração usuais no Brasil.
- Cálculo de fluidoterapia, hidratação de manutenção e regras clínicas para suporte em emergência e urgência.

### 4. Solicitação de Exames Laboratoriais e de Imagem

- Catálogo de exames categorizado: Hematologia, Bioquímica, Sorologias, Urina/Fezes, Radiologia, Tomografia, Ressonância Magnética e Ultrassonografia.
- Classificação por nível de prioridade: **Rotina** ou **Urgência**.
- Inclusão rápida de justificativas clínicas ou hipóteses diagnósticas para operadoras de saúde e SUS.

### 5. Atestados Médicos & Encaminhamentos Padrão CFM

- **Atestados Médicos:**
  - Cálculo automático do período e datas de vigência com base na quantidade de dias de afastamento informados.
  - **Proteção Legal de CID-10:** Cumprimento da **Resolução CFM nº 1.658/2002**, garantindo a inserção do código CID-10 apenas mediante autorização expressa do paciente.
  - Busca inteligente no catálogo CID-10 integrado por código ou termo clínico.
- **Encaminhamentos Especializados:**
  - Definição de prioridade clínica: **Eletivo**, **Prioritário** ou **Urgente**.
  - Seções estruturadas para resumo clínico, histórico da doença atual, exames relevantes anexados e hipótese diagnóstica.

### 6. Decks de Protocolos Clínicos Ambulatoriais

- Guias rápidos para patologias frequentes da prática clínica (Faringoamigdalite, Otite Média Aguda, Pneumonia Comunitária, ITU, Asma, Anafilaxia, Crise Convulsiva, etc.).
- Prescrição imediata em **1 clique**: os medicamentos do protocolo são transportados diretamente para o construtor de receitas, ajustando as doses caso o paciente seja pediátrico.

### 7. Busca Rápida, Acessibilidade & Entrada por Voz

- **Fuzzy Search:** Busca tolerante a pequenos erros de digitação e acentuação no banco unificado de medicamentos.
- **Pesquisa por Voz:** Integração com a Web Speech API para ditar medicamentos e posologias diretamente na interface.
- **Acessibilidade Completa (WCAG 2.2):** Navegação por teclado, foco controlado em modais (`useModalA11y`), suporte a leitores de tela com regiões vivas (`aria-live`) e botões de confirmação para ações críticas.

### 8. Visualização & Emissão de Documentos (PDF / Impressão)

- **Preview em Folha A4:** Visualização idêntica ao documento impresso, sempre sobre fundo branco com tipografia clínica em ambos os temas de interface.
- **Exportação em PDF:** Geração vetorial ultra-nítida utilizando `jspdf` e `jspdf-autotable`, com suporte a captura de layout visual via `html2canvas`.
- **Impressão Nativa:** Configuração otimizada para impressoras térmicas ou jato de tinta/laser via folha A4 completa ou meio sulfite (A5).
- **Proteção contra Cortes:** Paginação automática que impede o transbordamento de texto e a sobreposição de cabeçalhos e carimbos médicos.

---

## 🔒 Segurança & Privacidade (Zero-Knowledge)

O PresCMed foi construído sob o princípio de **privacidade por design**:

1. **Armazenamento 100% Local:** Os dados do médico cadastrado, do paciente em atendimento, das prescrições e dos exames residem exclusivamente no `localStorage` do navegador do usuário.
2. **Zero Telemetria de Saúde:** Nenhuma informação clínica, nome de paciente, CPF, histórico médico ou prescrição é transmitida para a nuvem.
3. **Resiliência de Dados:** Tratamento automático de cotas de armazenamento local com alertas proativos e botão para **Download de Backup JSON** da sessão.
4. **Sigilo Médico & LGPD:** Total aderência às normas éticas do Conselho Federal de Medicina (CFM) e à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

---

## 🎨 Design System Hospitalar Tátil

A interface do PresCMed foi concebida para longos plantões médicos, oferecendo conforto visual e rapidez de manuseio:

- **Tema Claro (Canvas Hospitalar Límpido):** Fundo suave em `--bg-app: #F8FAFC`, cartões em branco puro (`#FFFFFF`) e bandejas embutidas neutras (`#F1F5F9`), eliminando fadiga visual.
- **Tema Escuro (Grafite Ardósia Aveludado):** Fundo relaxante em `--bg-app: #121824` com cartões em grafite elevado (`#192130`), eliminando contrastes agressivos ou pretos absolutos.
- **Física de Botões Táteis:** Botões primários com elevação sutil e acabamento refinado **sem contornos rígidos ou bordas duras**, com retorno tátil ao toque.
- **Responsividade Multiplataforma:** Navegação ergonômica com menu lateral expansível (Desktop), gaveta deslizante (Tablets) e barra de navegação inferior tátil (Smartphones).

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Framework UI** | [React 19](https://react.dev/) | Renderização rápida com hooks modernos e gerenciamento de estado direto |
| **Linguagem** | [TypeScript ~5.8](https://www.typescriptlang.org/) | Tipagem estrita de modelos clínicos e interfaces de domínio |
| **Build & Bundler** | [Vite 6](https://vitejs.dev/) | HMR ultra-rápido e otimização de bundle |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com/) | Nova engine baseada em `@theme` e variáveis CSS nativas |
| **Ícones** | [Lucide React](https://lucide.dev/) | Conjunto de ícones médicos e de utilidade de alta densidade |
| **Animações** | [Motion](https://motion.dev/) | Transições táteis e feedback visual suave |
| **Geração de PDF** | [jsPDF](https://github.com/parallax/jsPDF) + [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Emissão programática vetorial de documentos A4 |
| **Captura Visual** | [html2canvas](https://html2canvas.hertzen.com/) | Renderização fiel para pré-visualização e impressão |
| **Testes** | Node.js Test Runner + [tsx](https://github.com/privatenumber/tsx) | Execução rápida de testes clínicos sem overhead de configuração |

---

## 📂 Estrutura do Projeto

```
prescmed-pcm/
├── index.html                     # Ponto de entrada HTML (viewport, fontes, root)
├── package.json                   # Dependências e scripts npm
├── vite.config.ts                 # Configuração do Vite e plugins React/Tailwind
├── tsconfig.json                  # Configurações do compilador TypeScript
├── AGENTS.md                      # Regras arquiteturais e convenções para agentes
└── src/
    ├── main.tsx                   # Inicialização do React (StrictMode)
    ├── App.tsx                    # Estado central da consulta e roteador de abas
    ├── types.ts                   # Interfaces de domínio clínico e tipos TypeScript
    ├── index.css                  # Tokens de cor, temas (Light/Dark) e Tailwind v4
    ├── components/                # Componentes modulares da interface
    │   ├── Header.tsx             # Barra superior com status do paciente e ações
    │   ├── Sidebar.tsx            # Navegação lateral principal (Desktop / Drawer)
    │   ├── MobileBottomNav.tsx    # Barra de navegação inferior para dispositivos móveis
    │   ├── PrescriptionBuilder.tsx# Construtor principal de receitas médicas
    │   ├── PrescriptionPages.tsx  # Divisão visual dos documentos (Simples, Anti, C1)
    │   ├── PrescriptionReview.tsx # Revisão de pendências e conferência sanitária
    │   ├── PediatricCalculator.tsx# Calculadora de doses por peso e fluidos
    │   ├── QuantityAssistant.tsx  # Assistente de cálculo de frascos e embalagens
    │   ├── ExamRequester.tsx      # Módulo de solicitação de exames
    │   ├── CertificateAndReferral.tsx # Atestados médicos e encaminhamentos
    │   ├── ClinicalProtocolsView.tsx  # Decks de protocolos e condutas de 1ª linha
    │   ├── PrintPreview.tsx       # Pré-visualização de impressão e download em PDF
    │   ├── PatientModal.tsx       # Cadastro e seleção de dados do paciente
    │   ├── DoctorProfileModal.tsx # Configuração do perfil médico e assinatura/carimbo
    │   ├── CidSearchBar.tsx       # Barra de busca no catálogo CID-10
    │   └── ConfirmationModal.tsx  # Modal de confirmação para ações destrutivas
    ├── data/                      # Catálogos clínicos estáticos em pt-BR
    │   ├── medicationDatabase.ts  # Catálogo unificado de medicamentos (adulto e pediátrico)
    │   ├── pediatricMeds.ts       # Medicamentos pediátricos e parâmetros por kg
    │   ├── adultMeds.ts           # Medicamentos adultos com posologias padrão
    │   ├── clinicalProtocols.ts   # Protocolos ambulatoriais categorizados
    │   ├── examCatalog.ts         # Catálogo de exames laboratoriais e imagem
    │   └── cidCatalog.ts          # Banco de dados de códigos CID-10
    ├── hooks/                     # Custom hooks reutilizáveis
    │   └── useModalA11y.ts        # Gestão de acessibilidade e foco em modais
    └── utils/                     # Lógica de negócio, regras sanitárias e utilitários
        ├── prescriptionRules.ts   # Motor de classificação sanitária (RDC 20/Portaria 344)
        ├── prescriptionRules.test.ts # Suíte com 15 testes de regras clínicas
        ├── doseCalculator.ts      # Cálculo de dose por peso e intervalos horários
        ├── prescriptionPdf.ts     # Geração vetorial do PDF de prescrições
        ├── pdfGenerator.ts        # Geração de PDF para exames, atestados e encaminhamentos
        ├── fuzzySearch.ts         # Algoritmo de busca por aproximação fonética/texto
        ├── quantityWords.ts       # Conversão de números para escrita por extenso
        ├── navigation.ts          # Sincronização de abas com hash de URL
        └── storage.ts             # Armazenamento seguro e resiliente em localStorage
```

---

## 💻 Como Rodar Localmente (Setup & Execução)

### Pré-requisitos
- **Node.js** (versão 20 ou superior recomendada)
- Gerenciador de pacotes: **npm** ou **bun**

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/melkidonadonmed-lgtm/PCM.git
cd pcm
npm install
```

### 2. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em: `http://localhost:3000`

### 3. Validação Unificada e Build
```bash
# Executar verificação completa (lint + test + build)
npm run check

# Ou apenas gerar o bundle estático
npm run build
```
Os arquivos estáticos otimizados serão gerados na pasta `dist/`.

### 4. Pré-visualizar o build de produção
```bash
npm run preview
```

---

## 🚢 Como Fazer Deploy

Sendo uma SPA 100% estática e client-side, o build de produção (`dist/`) pode ser hospedado em qualquer servidor HTTP estático ou CDN:

- **GitHub Pages / Vercel / Netlify / Cloudflare Pages:** Basta apontar o diretório de publicação para `dist/`.
- **Nginx / Apache / Docker:** Servir a pasta `dist/` com fallback para `index.html`.

---

## 🔐 Variáveis de Ambiente

O PresCMed opera em modo **Zero-Knowledge / 100% Client-Side**, não requerendo banco de dados em nuvem ou tráfego de dados sensíveis. As variáveis opcionais estão descritas no arquivo `.env.example`:

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor de desenvolvimento | `3000` |
| `NODE_ENV` | Modo de execução (`development` / `production`) | `development` |

---

## 🧪 Qualidade & Testes Automatizados

O PresCMed inclui uma suíte de testes focada na integridade das regras regulatórias e de segurança farmacológica:

```bash
# Executar a suíte de testes clínicos
npm test

# Executar a verificação estática de tipos
npm run lint
```

### O que a suíte de testes valida:
- **Segregação Sanitária:** Separação precisa de antimicrobianos, substâncias C1 e receitas simples.
- **Teto da Portaria 344/98:** Garantia de que nenhuma receita C1 contenha mais de 3 substâncias ativas distintas por documento.
- **Conferência de Quantidades:** Arredondamento exato de frascos/caixas inteiras e geração de quantidades por extenso.
- **Bloqueio de Ambiguidade:** Impede emissão de prescrições com dados pendentes, apresentações ausentes ou posologias incompletas.
- **Resiliência de Armazenamento:** Preservação de dados locais e integridade contra registros corrompidos.

---

## 📜 Normas Regulatórias de Referência

- **RDC Anvisa nº 20/2011 & IN nº 471/2021:** Controle de medicamentos antimicrobianos e emissão em 2 vias com retenção de receita.
- **Portaria SVS/MS nº 344/1998:** Regulamento técnico sobre substâncias e medicamentos sujeitos a controle especial (Lista C1 e Notificações).
- **Resolução CFM nº 1.658/2002 & Resolução CFM nº 1.851/2008:** Normas para emissão de atestados médicos e consentimento explícito do paciente para inclusão de CID.
- **Lei nº 13.709/2018 (LGPD):** Lei Geral de Proteção de Dados Pessoais e garantia de privacidade de dados sensíveis de saúde.

---

<div align="center">
  <p><strong>PresCMed</strong> — Prescrição Médica Rápida, Segura e em Conformidade.</p>
</div>

