# Plano de Ação — Otimização de Navegabilidade Mobile e Consistência Visual (PresCMed)

## 1. Fase de Survey (Mapeamento Abrangente)
- Spawn de 3 Explorers em paralelo:
  - **Explorer 1 (Navegação & Layout Mobile)**: Analisar `src/components/MobileBottomNav.tsx`, `src/components/Header.tsx`, `src/components/Sidebar.tsx`, `src/App.tsx`. Identificar redundâncias de botões, duplicações de opções entre bottom nav e header/sidebar, comportamento em breakpoints (< 1024px) e safe areas (`pb-safe`).
  - **Explorer 2 (Fluxo de Telas & Ações/Loops)**: Analisar `src/components/PrescriptionBuilder.tsx`, `src/components/ExamRequester.tsx`, `src/components/CertificateAndReferral.tsx`, `src/components/ClinicalProtocolsView.tsx`, `src/components/PrintPreview.tsx`. Identificar botões que criam loops de navegação circulares, ausência de CTA principal claro, concorrência entre abas e botões internos de avançar/voltar.
  - **Explorer 3 (Design System & Ergonomia Touch)**: Analisar `src/index.css`, componentes com pílulas saturadas ("blobs"), botões primários com bordas duras, áreas de toque inferiores a 44x44px, e paletas nos modos claro e escuro. Mapear respeito às diretrizes do AGENTS.md (zero contornos grosseiros em primários, dots de status de 6px, folha A4 intocada).

## 2. Consolidação e Definição de Milestones em PROJECT.md
- Sintetizar os relatórios dos 3 Explorers.
- Criar `PROJECT.md` na raiz com:
  - Arquitetura e Code Layout
  - Feature Inventory mapeado
  - Interface Contracts
  - Decomposição em Milestones claros

## 3. Execução dos Milestones
- **Milestone 1**: Navegabilidade Mobile Unificada (MobileBottomNav, Header, Sidebar).
- **Milestone 2**: Fluxo Linear de Atendimento e Desatamento de Loops de Ação.
- **Milestone 3**: Ergonomia Touch e Consistência Visual do Design System (Claro/Escuro).
- Cada milestone segue o ciclo rigoroso:
  - Worker implementa as alterações e executa `npm run lint` (`tsc --noEmit`) e `npm run build`.
  - 2 Reviewers revisam o código, integridade visual e funcional.
  - 2 Challengers realizam testes de estresse adversariais e conferência clínica/ergonômica.
  - Gate check formal em `GATE_STATUS.md`.

## 4. Verificação Final e Fechamento
- Checagem completa de requisitos de aceitação (0 erros TS, build limpo, conformidade com CFM/ANVISA).
- Handoff formal e relatório de vitória para o Sentinel.
