# Relatório Técnico de Investigação (Handoff) — Explorer 1

**Data de Conclusão**: 2026-09-13T00:51:00Z  
**Autor**: Explorer 1 (Survey Phase — Requisito R1)  
**Projeto**: PresCMed (PCM)  
**Alvo da Investigação**: Arquitetura de Navegação & Chrome Mobile (`MobileBottomNav.tsx`, `Header.tsx`, `Sidebar.tsx`, `App.tsx`)

---

## 1. Observações Diretas e Evidências Clínico-Técnicas

A investigação detalhada do código-fonte revelou um conjunto consistente de achados estruturais, comportamentais e estilísticos:

### 1.1 Mapeamento de Itens por Componente

| Destino / Aba (`ActiveTab`) | Presente na `MobileBottomNav` | Presente no `Header` | Presente na `Sidebar` | Tratamento em `App.tsx` |
|---|---|---|---|---|
| `prescription` | ✅ Sim ("Prescrever", ícone `Pill`, badge com contagem) | ❌ Não (apenas chip de paciente) | ✅ Sim ("Receitas Médicas", ícone `FileEdit`, badge) | Renderiza `<PrescriptionBuilder />` |
| `pediatric_calc` | ✅ Sim ("Calculadoras", ícone `Calculator`) | ❌ Não (apenas input de peso desktop) | ✅ Sim ("Calculadora Clínica", ícone `Calculator`, badge peso) | Renderiza `<PediatricCalculator />` |
| `exams` | ✅ Sim ("Exames", ícone `FlaskConical`, badge) | ❌ Não | ✅ Sim ("Exames", ícone `FlaskConical`, badge) | Renderiza `<ExamRequester />` |
| `certificate` | ✅ Sim ("Documentos", ícone `FileText`) | ❌ Não | ✅ Sim ("Atestados", ícone `Award`) | Renderiza `<CertificateAndReferral />` com subTab `certificate` |
| `referral` | ⚠️ Agrupado em "Documentos" (`certificate`) | ❌ Não | ✅ Sim ("Encaminhamentos", ícone `Building2`) | Renderiza `<CertificateAndReferral />` com subTab `referral` |
| `protocols` | ⚠️ Oculto (acessível apenas pelo menu "Mais") | ❌ Não | ✅ Sim ("Protocolos Clínicos", ícone `HeartPulse`) | Renderiza `<ClinicalProtocolsView />` |
| `print_preview` | ❌ **TOTALMENTE AUSENTE** | ❌ Não | ✅ Sim ("Exportar & Baixar PDF", ícone `Download`) | Renderiza `<PrintPreview />` |
| `patients` | ❌ Não é aba (abre modal) | ✅ Chip do Paciente (`header-patient-chip`) | ✅ Card do Paciente na base | Abre `<PatientModal />` |

### 1.2 Evidências em Código com Localização Exata

1. **Ausência da Aba de Finalização/PDF na Barra Inferior Mobile**:
   - `src/components/MobileBottomNav.tsx:31-36`:
     ```tsx
     const items = [
       { id: 'prescription' as ActiveTab, label: 'Prescrever', icon: Pill, badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined },
       { id: 'exams' as ActiveTab, label: 'Exames', icon: FlaskConical, badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined },
       { id: 'certificate' as ActiveTab, label: 'Documentos', icon: FileText },
       { id: 'pediatric_calc' as ActiveTab, label: 'Calculadoras', icon: Calculator },
     ];
     ```
   - `src/components/MobileBottomNav.tsx:7`: `import { Download } from 'lucide-react';` está importado, mas **não é utilizado**, evidenciando que a intenção de incluir a finalização/exportação na barra existiu, mas ficou incompleta.
   - O Requisito R1 estipula expressamente: *"As opções de acesso mais frequentes do plantonista (Prescrição, Exames, Atestados/Documentos, Calculadoras e Finalização/PDF) devem ser claras"*. Atualmente, o plantonista em celular não tem atalho na barra inferior para chegar ao preview/emissão de PDF.

2. **Desorientação Visual de Aba Ativa em `print_preview`**:
   - `src/components/MobileBottomNav.tsx:37`: `const isMoreActive = activeTab === 'protocols';`
   - `src/components/MobileBottomNav.tsx:50`: `const isActive = activeTab === item.id || (item.id === 'certificate' && activeTab === 'referral');`
   - Quando o usuário está em `activeTab === 'print_preview'`, **nenhum botão** da barra inferior recebe a classe `nav-item-active` nem o fundo ativo. A barra fica em estado "órfão", sem indicar onde o usuário está.

3. **Duplicação e Conflito de Botões de Menu no Mobile**:
   - `src/components/Header.tsx:55-65`:
     ```tsx
     <button id="btn-toggle-sidebar" onClick={onToggleSidebar} aria-label="Abrir ou fechar menu lateral" className="w-10 h-10 ...">
       <Menu className="w-5 h-5" strokeWidth={1.75} /><span className="text-[9px]">Menu</span>
     </button>
     ```
   - `src/components/MobileBottomNav.tsx:92-123`:
     ```tsx
     <button id="mobile-nav-more" type="button" onClick={onOpenMenu} aria-haspopup="dialog" ...>
       <Menu className="w-5 h-5" ... />
       <span>Mais</span>
     </button>
     ```
   - Ambos os botões têm o mesmo ícone (`Menu`), acionam o mesmo modal/gaveta (`Sidebar`) e disputam a atenção do usuário no topo esquerdo e no canto inferior direito da tela simultaneamente.

4. **Props Mortas em `Header.tsx`**:
   - `src/components/Header.tsx:20-21, 32-33`:
     ```tsx
     prescriptionCount?: number;
     selectedExamsCount?: number;
     // ...
     prescriptionCount = 0,
     selectedExamsCount = 0,
     ```
   - Nenhuma dessas contagens é renderizada no Header (código morto).

5. **Violação do Design System em `Header.tsx` (Blobs Translúcidos Saturados)**:
   - `src/components/Header.tsx:121`:
     `hasPatient ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/10 text-cream-100 border-white/20'`
   - Viola diretamente a regra canônica em `AGENTS.md`: *"Erradicação de 'Blobs' de Texto Translúcidos: Proibido o uso de pílulas/caixas com fundos semi-transparentes saturados e bordas destacadas (`bg-emerald-500/15 border-emerald-500/30`, etc.). Substituir sempre por tipografia limpa acompanhada de micro-pontos de status (dots de 6px)"*.

6. **Inconsistência de Z-Index entre Sidebar e MobileBottomNav**:
   - `src/components/Sidebar.tsx:302-316`: O backdrop possui `fixed inset-0 z-40 bg-black/70` e o container `<aside>` possui `z-40`.
   - `src/components/MobileBottomNav.tsx:43`: A barra possui `z-50`.
   - No mobile, ao abrir a gaveta da Sidebar, a barra inferior fixa fica **por cima** da gaveta lateral, cortando os botões inferiores da Sidebar. Em `Sidebar.tsx:326-328` foi inserido um comentário admitindo a sobreposição:
     `// pb-24 no mobile: a bottom nav fixa (h-16 + safe-area, z-50) cobre o fim do drawer; sem esse respiro o "Novo Atendimento Completo" fica inclicavel.`

7. **Inexistência de Definição de `pb-safe` e Falta de `viewport-fit=cover`**:
   - `src/components/MobileBottomNav.tsx:43`: usa `pb-safe`.
   - Varredura por `pb-safe` e `safe-area` em todo o projeto demonstrou que `pb-safe` **não existe** nem no Tailwind nem no CSS (`src/index.css`). É uma classe fantasma.
   - `index.html:5`: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` não contém `viewport-fit=cover`. Sem essa propriedade no `<meta viewport>`, navegadores WebKit/iOS não alimentam as variáveis CSS `env(safe-area-inset-*)`.

8. **Oclusão de Conteúdo de Tela por Altura Insuficiente de Padding**:
   - `src/components/MobileBottomNav.tsx:43`: `h-16` força 64px de altura fixa.
   - `src/App.tsx:479`: `<main ... className="flex-1 min-w-0 pb-20 lg:pb-6 outline-none">` aplica `pb-20` (80px).
   - Em dispositivos com barra de gestos / safe-area de 34px (iPhones recentes), a barra inferior precisa de 64px + 34px = 98px. Com apenas 80px de padding inferior no `<main>`, **18px do final de cada página ficam ocultos atrás da barra fixa inferior**.
   - Em `src/components/PrintPreview.tsx:347`: o container possui apenas `pb-12` (48px), sendo menor até que a própria barra de 64px.

9. **Toast Oculto sob a Barra Inferior**:
   - `src/components/PrescriptionBuilder.tsx:1850-1855`:
     ```tsx
     {itemAddedToast && (
       <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 ...">
         <Check className="w-4 h-4" />
         <span>Medicamento inserido na receita com sucesso!</span>
       </div>
     )}
     ```
   - O toast é fixado em `bottom-6` (24px do fundo da tela). Como a `MobileBottomNav` tem 64px de altura e também possui `z-50`, no mobile o toast de sucesso é renderizado **atrás da barra de navegação inferior**, invisível para o usuário!

10. **Ações Enganosas e Loops Circulares de Navegação**:
    - `src/components/PrescriptionBuilder.tsx:567-568`:
      ```tsx
      const handleCopyText = onNavigateToPrint;
      const handleSendWhatsApp = onNavigateToPrint;
      ```
    - `src/components/PrescriptionBuilder.tsx:1630`: O botão com ícone de cópia e rótulo `"Copiar Texto"` executa `handleCopyText`, o que desvia imediatamente o usuário para a tela de impressão (`onNavigateToPrint`), em vez de copiar o texto para o clipboard!
    - Em `PrescriptionBuilder.tsx`, existem pelo menos 5 botões competindo para ir para `print_preview`:
      - Linha 765: Stepper Etapa 3 ("Revisar e exportar")
      - Linha 1640: Botão "Revisar e exportar"
      - Linha 1674: Link "Abrir tela cheia"
      - Linha 1826: Botão "Imprimir / PDF A4"
      - Linha 1835: Botão "Revisar para compartilhar" (chama `handleSendWhatsApp`, que chama `onNavigateToPrint`)
      - Linha 1630: Botão "Copiar Texto" (chama `handleCopyText`, que chama `onNavigateToPrint`)

11. **Perda de Contexto e Origem ao Navegar para `print_preview` via Sidebar**:
    - Em `src/App.tsx:183-189`:
      ```tsx
      const handleNavigateToPrint = (type?: ...) => {
        if (type) setPrintDocType(type);
        setPrintOrigin(activeTab === 'print_preview' ? printOrigin : activeTab);
        applyTab('print_preview');
      };
      ```
    - Quando o usuário navega para `print_preview` clicando na Sidebar (`Sidebar.tsx:193` -> `onSelectTab('print_preview')`), a função `handleNavigateToPrint` não é chamada. O estado `printDocType` e `printOrigin` permanece obsoleto. Se o usuário estava em `exams` e clica em "Exportar & Baixar PDF" na sidebar, o sistema abre a visualização de receita (`prescription`) e o botão "Voltar" devolve para uma tela descontextualizada.

12. **Desconexão da Calculadora Pediátrica**:
    - `src/components/PediatricCalculator.tsx:28, 154`: recebe `onAddPrescriptionItem`, mas a prop é ignorada. Não há botão para injetar o medicamento calculado de volta na receita; apenas o botão genérico `Ir para Receita` (`onNavigateToPrescription`).

---

## 2. Cadeia Lógica de Dedução (Logic Chain)

1. **Premissa de Ergonomia do Plantonista (Requisito R1)**: O atendimento em pronto-socorro ou ambulatório médico mobile opera em turnos intensos onde cada toque conta. O fluxo canônico consiste em:
   - Identificar paciente → Prescrever medicamentos (ou Calcular dose pediátrica) → Solicitar exames complementares → Emitir atestados/documentos → **Finalizar e Gerar PDF A4**.
2. **Falha da Barra Inferior Mobile Atual**:
   - Da Observação 1.1 e 1.2(1), a barra inferior mobile possui 4 botões de entrada (`prescription`, `exams`, `certificate`, `pediatric_calc`), mas **omite o passo crucial de conclusão**: `print_preview` ("Finalizar / PDF").
   - Para emitir o documento no mobile hoje, o médico precisa abrir o menu drawer (botão "Mais") ou procurar botões espalhados pelo corpo de cada tela.
   - Da Observação 1.2(2), quando o médico está na tela de PDF, a barra inferior não reflete o estado ativo, gerando desorientação visual.
3. **Conflito Arquitetural entre Header e Bottom Nav**:
   - Da Observação 1.2(3), a coexistência do botão de Menu no canto superior esquerdo do Header e o botão "Mais" com ícone de menu no canto inferior direito da Bottom Nav é redundante e confusa no mobile (< 1024px).
   - Solução lógica: no mobile (< 1024px), a barra inferior de 5 posições deve conter os 5 pilares clínicos inequívocos:
     1. **Prescrever** (`prescription`)
     2. **Calculadora** (`pediatric_calc`)
     3. **Exames** (`exams`)
     4. **Atestados/Docs** (`certificate`)
     5. **Emitir PDF** (`print_preview`)
   - O menu hambúrguer do Header permanece no topo para abrir configurações secundárias (perfil médico, novo atendimento, zerar receita, protocolos), eliminando o botão redundante "Mais" da barra inferior ou transformando a navegação em um modelo totalmente unificado e sem duplicações.
4. **Vulnerabilidade de Safe Area e Sobreposição no iOS / Android Modernos**:
   - Das Observações 1.2(7), 1.2(8) e 1.2(9), `pb-safe` é inexistente, `viewport-fit=cover` está ausente no `<meta name="viewport">`, `h-16` força uma caixa rígida de 64px, e `pb-20` (80px) no `<main>` é menor do que a barra expandida com safe area (98px).
   - Conclusão direta: elementos do rodapé das telas e toasts de confirmação estão sendo renderizados embaixo da barra inferior, inacessíveis ao toque do usuário.
5. **Conflito de Z-Index**:
   - Da Observação 1.2(6), a barra inferior (`z-50`) flutua por cima do menu lateral aberto (`z-40`), causando sobreposição grotesca no mobile. O backdrop e a drawer da sidebar móvel precisam ter `z-50` ou `z-[60]` para encobrir adequadamente a barra de navegação quando ativados, ou a barra de navegação inferior deve respeitar a hierarquia da modalidade.
6. **Desatamento de Loops de Navegação**:
   - Da Observação 1.2(10), botões internos nomeados como "Copiar Texto" ou "Revisar para compartilhar" que redirecionam para a rota de impressão quebram o princípio da menor surpresa e geram loops de navegação circulares.
   - Da Observação 1.2(11), a transição para `print_preview` via Sidebar precisa registrar corretamente o `printOrigin` e contextualizar o `docType` com base na aba de onde o usuário partiu.

---

## 3. Ressalvas (Caveats)

- **Testes Automatizados Unitários/E2E**: O projeto não possui suite de testes automatizados (Vitest, Jest ou Cypress/Playwright). A verificação técnica estrita depende de `npm run lint` (`tsc --noEmit`) e `npm run build`.
- **Compatibilidade com Telas Ultrawide / Desktop**: As alterações no breakpoint `< 1024px` não devem alterar o comportamento no desktop (`>= 1024px`), onde a `Sidebar` atua como rail recolhível (72px) ou expandida (288px) e a `MobileBottomNav` é escondida por `lg:hidden`.
- **Mapeamento de Rotas por Hash (`src/utils/navigation.ts`)**: Qualquer alteração nas abas suportadas ou na sincronização de URL deve manter os slugs amigáveis em português (`#/prescricao`, `#/calculadora`, `#/exames`, `#/atestado`, `#/encaminhamento`, `#/protocolos`, `#/exportar`).

---

## 4. Conclusão e Propostas Arquiteturais para o Requisito R1

### 4.1 Proposta de Redesenho da Barra Inferior Mobile (`MobileBottomNav.tsx`)
1. **Estrutura Canônica de 5 Itens**:
   - Substituir o botão "Mais" (que abre a mesma Sidebar que o Header já abre) pelo atalho direto de **"Emitir PDF"** (`print_preview`), que utiliza o ícone `Download` já importado:
     1. `prescription` — **Prescrever** (`Pill`, badge de itens)
     2. `pediatric_calc` — **Calculadora** (`Calculator`, badge de peso)
     3. `exams` — **Exames** (`FlaskConical`, badge de exames)
     4. `certificate` — **Docs / Atestados** (`FileText`)
     5. `print_preview` — **Emitir PDF** (`Download`, highlight se ativo)
2. **Tratamento de Estado Ativo Perfeito**:
   - Reconhecer `activeTab === 'print_preview'` como ativo no 5º botão.
   - Reconhecer `activeTab === 'referral'` como ativo no botão de Docs.
3. **Erradicação do Conflito de Menus**:
   - O menu lateral continua acessível de forma inequívoca pelo botão "Menu" no `Header.tsx`, que já está presente no topo esquerdo e possui área de toque de 44x44px (`min-w-[44px] min-h-[44px]`).

### 4.2 Proposta de Correção de Safe Area e Viewport
1. **No `index.html`**:
   - Atualizar a meta tag para:
     ```html
     <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
     ```
2. **No `src/index.css`**:
   - Adicionar utilitários explícitos para safe area:
     ```css
     @utility pb-safe {
       padding-bottom: env(safe-area-inset-bottom, 0px);
     }
     @utility h-mobile-nav {
       height: calc(4rem + env(safe-area-inset-bottom, 0px));
     }
     ```
3. **No `src/components/MobileBottomNav.tsx`**:
   - Ajustar a classe do `<nav>` de `h-16` para suportar safe area flexível:
     ```tsx
     className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 border-t backdrop-blur-md no-print isolate panel-navy panel-projected-top pb-[env(safe-area-inset-bottom,0px)] h-[calc(4rem+env(safe-area-inset-bottom,0px))]"
     ```
4. **No `src/App.tsx`**:
   - Atualizar o padding inferior do container `<main>` para acomodar a barra com safe area:
     ```tsx
     className="flex-1 min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-6 outline-none"
     ```
5. **Correção de Toasts**:
   - Em `PrescriptionBuilder.tsx:1851`, mudar o toast de `bottom-6` para `bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6`.

### 4.3 Proposta de Correção de Z-Index da Sidebar
- Ajustar a `Sidebar` mobile (backdrop e aside) para `z-50` e a `MobileBottomNav` para `z-40`, garantindo que ao abrir a gaveta lateral a barra inferior não sobreponha nem dispute toques com a gaveta.

### 4.4 Proposta de Correção de Design System no Header
- Substituir o blob translúcido saturado de `Header.tsx:121` por tipografia limpa em tom suave acompanhada de micro-ponto (dot de 6px), conforme as diretrizes do PresCMed.

---

## 5. Método de Verificação Independente

Para verificar de forma reproduzível e independente os achados deste relatório:

1. **Checagem Estática de Tipos TypeScript**:
   ```bash
   npm run lint
   ```
   *Critério de sucesso*: Saída com código 0 (`tsc --noEmit` sem erros).

2. **Compilação de Produção**:
   ```bash
   npm run build
   ```
   *Critério de sucesso*: Build do Vite finalizado com sucesso em `dist/`.

3. **Inspeção de Código das Evidências**:
   - Inspecionar `src/components/MobileBottomNav.tsx` linhas 31-37 e linha 7 para verificar a ausência de `print_preview` e o import não utilizado de `Download`.
   - Inspecionar `src/components/MobileBottomNav.tsx` linha 43 para verificar `h-16` e `pb-safe`.
   - Inspecionar `src/index.css` para verificar a ausência de definição da classe `pb-safe`.
   - Inspecionar `index.html` linha 5 para verificar a ausência de `viewport-fit=cover`.
   - Inspecionar `src/components/PrescriptionBuilder.tsx` linhas 567-568 e 1630 para verificar o falso botão "Copiar Texto" navegando para `onNavigateToPrint`.
   - Inspecionar `src/components/Sidebar.tsx` linhas 302-328 comparando o z-index (`z-40`) com `MobileBottomNav.tsx` (`z-50`).

4. **Condição de Invalidação**:
   - O diagnóstico seria invalidado caso a `MobileBottomNav` já possuísse botão funcional para `print_preview`, caso o CSS já contivesse regras ativas para `pb-safe` e caso os z-indexes não gerassem sobreposição visual. A inspeção confirmou todos os 14 itens como válidos.
