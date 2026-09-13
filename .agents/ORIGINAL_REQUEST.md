# Original User Request

## Initial Request — 2026-09-13T00:45:16Z

# Otimização de Navegabilidade Mobile e Consistência Visual — PresCMed

Aperfeiçoar a navegabilidade e ergonomia mobile do PresCMed, desfazendo loops circulares e redundâncias de botões entre a barra inferior, menus e fluxos internos de atendimento, além de harmonizar inconsistências visuais entre os modos Claro e Escuro.

Working directory: c:/Users/melki/projetos/pcm
Integrity mode: development

## Requirements

### R1. Navegabilidade Mobile Unificada e Sem Redundâncias
Eliminar atritos de navegação entre a barra inferior (`MobileBottomNav`), o cabeçalho (`Header`) e o menu lateral (`Sidebar`). As opções de acesso mais frequentes do plantonista (Prescrição, Exames, Atestados/Documentos, Calculadoras e Finalização/PDF) devem ser claras, sem duplicação conflitante de papéis entre a barra fixa e os cabeçalhos.

### R2. Fluxo de Atendimento Linear e Desatamento de Loops de Botões
Reorganizar a hierarquia dos botões de ação nas telas (`PrescriptionBuilder`, `ExamRequester`, `CertificateAndReferral`, etc.) para que a próxima ação recomendada seja autoevidente. Eliminar botões que geram ciclos redundantes de navegação (ex.: botões internos de avançar/voltar que competem com abas ou que desorientam o usuário) e garantir uma progressão clara até a emissão do documento.

### R3. Ergonomia Touch e Acessibilidade Mobile
Garantir que todos os controles interativos mobile possuam dimensões táteis mínimas adequadas (área de toque >= 44x44px), espaçamentos ergonômicos confortáveis para uso com o polegar, respeito à safe-area inferior (`pb-safe`) e contraste legível em ambientes hospitalares com iluminação adversa.

### R4. Consistência Visual do Design System (Claro e Escuro)
Padronizar superfícies e componentes de acordo com as diretrizes do PresCMed:
- Eliminar contornos duros e bordas grosseiras nos botões principais (`border: none` nos botões táteis primários).
- Erradicar pílulas translúcidas excessivamente saturadas ("blobs"), substituindo-as por tipografia limpa com micro-pontos (dots) de status.
- Manter o contraste nobre entre o tema Claro (Hospitalar Límpido / Creme Suave) e o tema Escuro (Grafite Ardósia Aveludado).
- Preservar a folha de documento A4 estritamente em fundo branco com texto escuro em ambos os temas.

## Acceptance Criteria

### Compilação e Qualidade de Tipos
- [ ] `npm run lint` executa via `tsc --noEmit` e conclui com 0 erros de TypeScript.
- [ ] `npm run build` compila a aplicação com sucesso sem erros de build no Vite.

### Validação de Navegabilidade e UX Mobile
- [ ] Em resolução mobile (< 1024px), a barra de navegação inferior (`MobileBottomNav`) oferece atalhos diretos e inequívocos para as etapas centrais do atendimento, sem sobreposição visual ou botões que causem loops circulares.
- [ ] As telas principais de atendimento apresentam botões de ação primária (CTA) claros e destacados no rodapé ou posição de fácil alcance, diferenciados de ações secundárias e sem botões redundantes.
- [ ] Nenhuma transição de tela resulta em perda de contexto do paciente ou desorientação de rota.
- [ ] Todos os elementos interativos mobile possuem área de toque de no mínimo 44x44px e respeitam a safe area do dispositivo.

### Fidelidade do Design System
- [ ] Nenhum botão primário exibe bordas duras contrastantes ou acabamento grosseiro.
- [ ] O visual no modo escuro utiliza a paleta ardósia/grafite aveludada sem pretos absolutos opressivos e sem blobs saturados.
- [ ] A folha de visualização de impressão e emissão de PDF permanece íntegra (fundo branco, tipografia escura, regras sanitárias CFM/ANVISA preservadas).
