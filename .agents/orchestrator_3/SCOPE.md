# Scope: Auditoria Profunda, Validação em Navegador Real e Refinamento do Frontend — PresCMed (PCM)

## Architecture
PresCMed é uma SPA 100% client-side desenvolvida em React 19 + TypeScript + Vite 6 + Tailwind CSS v4, com persistência local via `localStorage`.
A navegação opera por estado centralizado (`activeTab: ActiveTab`) em `App.tsx`.
A interface é composta por:
1. **Chrome de Aplicação**: Header fixo superior, Sidebar recolhível e MobileBottomNav.
2. **Views de Atendimento**: PrescriptionBuilder, PediatricCalculator, ExamRequester, CertificateAndReferral, ClinicalProtocolsView.
3. **Mecanismo de Emissão e Visualização**: PrintPreview e PrescriptionReview, folha A4 com fundo branco e tipografia escura, PDF via jsPDF/html2canvas.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 19 | Auditoria Holística de Qualidade Frontend | Análise de ciclo de vida React 19, reatividade, Tailwind v4 e Design System | M5 | Follow-up R1 |
| 20 | Teste Seriado de Componentes e Simulação de Jornada | Teste das jornadas de prescrição, cálculo pediátrico, exames, atestados e CID-10 | M6 | Follow-up R2 |
| 21 | Validação em Navegador Real com DevTools | Inspeção de console, DOM, acessibilidade e renderização em http://localhost:3000 | M7 | Follow-up R3 |
| 22 | Relatório de Vitória e Aceite Final | Validação de ausência de loops, compilação limpa (`npm run lint`), entrega ao Sentinel | M7 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M5 | Auditoria Holística Frontend & Design System | Ciclo de vida, reatividade, conformidade cromática e tátil | M4 | DONE |
| M6 | Teste Seriado de Componentes & Simulação de Jornada | PrescriptionBuilder, PediatricCalculator, CidSearchBar, ExamRequester, CertificateAndReferral, PrintPreview | M5 | DONE |
| M7 | Validação em Navegador Real (DevTools) & Vitória | http://localhost:3000, DOM, console, acessibilidade, VICTORY_REPORT.md | M6 | DONE |

## Interface Contracts
- `ActiveTab`: `'prescription' | 'pediatric_calc' | 'exams' | 'certificate' | 'referral' | 'protocols' | 'print_preview'`
- `npm run lint`: `tsc --noEmit` deve retornar exit code 0.
- `npm run build`: Vite build deve gerar bundle sem erros.
- CID Search: Responsivo, sem cortes por taskbar, navegação por teclado e feedback imediato.
