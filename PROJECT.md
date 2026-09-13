# Project: PresCMed — Otimização de Navegabilidade Mobile e Consistência Visual

## Architecture
PresCMed é uma SPA 100% client-side desenvolvida em React 19 + TypeScript + Vite 6 + Tailwind CSS v4, com persistência local via `localStorage`.
A navegação opera por estado centralizado (`activeTab: ActiveTab`) em `App.tsx`.
A interface do usuário é estruturada em três camadas:
1. **Chrome de Aplicação**: Header fixo superior, Sidebar recolhível (drawer no mobile < 1024px, rail/painel no desktop >= 1024px) e MobileBottomNav fixa na base no mobile (< 1024px).
2. **Views de Atendimento**: PrescriptionBuilder (prescrição de medicamentos), PediatricCalculator (cálculo de doses pediátricas mg/kg), ExamRequester (pedidos de exames laboratoriais e imagem), CertificateAndReferral (atestados e guias de encaminhamento) e ClinicalProtocolsView (protocolos clínicos).
3. **Mecanismo de Emissão e Visualização**: PrintPreview e PrescriptionReview, renderizando documentos em folha A4 com fundo branco e tipografia escura (#0F172A), gerando PDFs normativos via jsPDF e captura html2canvas em conformidade estrita com CFM e ANVISA.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | MobileBottomNav Canônica de 5 Acessos | 5 acessos clínicos diretos (Prescrever, Calculadora, Exames, Docs/Atestados, Emitir PDF) com highlight correto do estado ativo | M1 | Survey R1 |
| 2 | Resolução de Conflito de Menus no Mobile | Manter menu hambúrguer no Header e remover o botão concorrente "Mais" da barra inferior móvel | M1 | Survey R1 |
| 3 | Safe Area Dinâmica e Viewport-fit | Suporte real a `viewport-fit=cover`, declaração de `@utility pb-safe` no Tailwind CSS e padding dinâmico no container `<main>` | M1 | Survey R1 |
| 4 | Hierarquia de Z-Index de Navegação | Backdrop e drawer da Sidebar móvel em `z-50` e barra inferior em `z-40`, eliminando sobreposições grotescas | M1 | Survey R1 |
| 5 | Correção de Posicionamento de Toasts | Toast de medicamento inserido com offset dinâmico acima da barra inferior mobile | M1 | Survey R1 |
| 6 | Cópia Real para Área de Transferência | Substituir desvio falso de `handleCopyText` para cópia real via `navigator.clipboard.writeText` com feedback visual inline | M2 | Survey R2 |
| 7 | Ação Coerente de WhatsApp | Substituir falso redirecionamento de `handleSendWhatsApp` por compartilhamento contextual | M2 | Survey R2 |
| 8 | Desatamento de Botões Redundantes na Prescrição | Unificar os 7 botões de impressão de `PrescriptionBuilder` em ações secundárias limpas e CTA primário inequívoco | M2 | Survey R2 |
| 9 | Stepper Clínico Linear de Atendimento | Progressão guiada e autoevidente: Prescrição -> Exames -> Documentos/Atestados -> Emissão/PDF | M2 | Survey R2 |
| 10 | Progressão Linear no ExamRequester | Botão "Voltar para Prescrição" e CTA primário "Avançar para Documentos ➔" | M2 | Survey R2 |
| 11 | Progressão Linear no CertificateAndReferral | CTA primário "Finalizar Atendimento & Emitir Documentos ➔" direcionando ao preview | M2 | Survey R2 |
| 12 | Desatamento de Loop no PrintPreview / Review | Prevenir perda de contexto e corrupção de `printOrigin` ao navegar entre abas de documentos no preview | M2 | Survey R2 |
| 13 | Ergonomia Touch Mobile (Área >= 44x44px) | Expansão de alvos de toque em botões de toolbar, ações em lote, reordenação de itens, paginação e botões "X" de modais | M3 | Survey R3 |
| 14 | Erradicação de Bordas Duras em Botões Primários | Remoção de contornos grosseiros (`border: ...`) em botões táteis primários e chips selecionados | M3 | Survey R4 |
| 15 | Erradicação de "Blobs" Translúcidos | Substituição de pílulas saturadas por tipografia limpa com micro-pontos (dots de 6px) de status em 11 componentes | M3 | Survey R4 |
| 16 | Harmonização Cromática Claro e Escuro | Eliminar gradientes amarelados/terrosos no claro e pretos densos no escuro em `src/index.css` e modais | M3 | Survey R4 |
| 17 | Preservação da Folha A4 de Impressão | Garantir folha A4 100% branca com texto escuro e respeito às normas sanitárias CFM/ANVISA (RDC 20/2011, Portaria 344/98, Res. CFM 1.658/2002) | M3/M4 | AGENTS.md |
| 18 | Verificação de Integridade e Build | 0 erros em `npm run lint` (`tsc --noEmit`) e build de produção bem-sucedido em `npm run build` | M4 | Critérios Aceite |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Navegabilidade Mobile Unificada e Chrome | `index.html`, `src/index.css`, `MobileBottomNav.tsx`, `Header.tsx`, `Sidebar.tsx`, `App.tsx` | Survey Concluído | DONE |
| M2 | Fluxo Linear de Atendimento e Desatamento de Loops | `PrescriptionBuilder.tsx`, `ExamRequester.tsx`, `CertificateAndReferral.tsx`, `PediatricCalculator.tsx`, `PrintPreview.tsx`, `PrescriptionReview.tsx` | M1 | DONE |
| M3 | Ergonomia Touch e Consistência do Design System | `src/index.css`, componentes com alvos < 44px, remoção de blobs translúcidos, botões primários sem bordas duras, paleta cromática | M2 | DONE |
| M4 | Verificação Global, Build e Validação de Aceite | Validação estrita de TypeScript (`tsc --noEmit`), build de produção Vite, testes de integridade e handoff de vitória | M3 | DONE |

## Interface Contracts

### Navegação & Rotas (`src/types.ts` & `src/utils/navigation.ts`)
- `ActiveTab`: `'prescription' | 'pediatric_calc' | 'exams' | 'certificate' | 'referral' | 'protocols' | 'print_preview'`
- `MobileBottomNavProps`:
  - `activeTab: ActiveTab`
  - `onSelectTab: (tab: ActiveTab) => void`
  - `prescriptionCount: number`
  - `selectedExamsCount: number`
  - `hasPatient: boolean`

### Fluxo de Atendimento Linear
- Cada tela de atendimento oferece:
  - Callback de retorno (opcional para a primeira etapa)
  - Callback de avanço para a etapa seguinte
  - Prop `onNavigateToPrint` reservada exclusivamente para visualização e emissão de PDF

### Design System Tokens (`src/index.css`)
- `@utility pb-safe`: `padding-bottom: env(safe-area-inset-bottom, 0px)`
- `@utility h-mobile-nav`: `height: calc(4rem + env(safe-area-inset-bottom, 0px))`
- Botões primários: `.btn-tactile-primary`, `border: none`
- Micro-pontos de status: `w-1.5 h-1.5 rounded-full inline-block mr-1.5`

## Code Layout
- `index.html`: Entry point e viewport
- `src/index.css`: Tokens de design, utilities e temas
- `src/App.tsx`: Estado central e layout raiz
- `src/types.ts`: Interfaces de dados de domínio
- `src/components/`:
  - `Header.tsx`, `Sidebar.tsx`, `MobileBottomNav.tsx`: Chrome de navegação
  - `PrescriptionBuilder.tsx`: Elaboração de receita
  - `ExamRequester.tsx`: Pedidos de exames
  - `CertificateAndReferral.tsx`: Atestados e encaminhamentos
  - `PediatricCalculator.tsx`: Calculadora clínica por peso
  - `PrintPreview.tsx`, `PrescriptionReview.tsx`: Visualização e exportação PDF
  - Modais: `PatientModal.tsx`, `DoctorProfileModal.tsx`, etc.
