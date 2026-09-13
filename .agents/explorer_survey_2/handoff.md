# Relatório de Handoff — Explorer 2 (Survey R2)
**Projeto:** PresCMed (PCM)  
**Fase:** Survey — Requisito R2 (Fluxo de Atendimento Linear e Desatamento de Loops de Botões)  
**Data:** 2026-09-12  
**Agente:** Explorer 2 (`.agents/explorer_survey_2`)  

---

## 1. Observation (Evidências Diretas de Código e Análise Arquitetural)

### 1.1. Arquitetura de Navegação Global e Roteamento por Estado
* **Arquivo:** `src/types.ts` (linhas 193-202)
  ```typescript
  export type ActiveTab = 
    | 'prescription' 
    | 'pediatric_calc' 
    | 'exams' 
    | 'certificate' 
    | 'referral' 
    | 'protocols'
    | 'models'
    | 'print_preview' 
    | 'patients';
  ```
* **Arquivo:** `src/utils/navigation.ts` (linhas 16-24)
  As rotas reais de tela (`RouteTab`) excluem `patients` e `models`:
  ```typescript
  const TAB_TO_SLUG: Record<RouteTab, string> = {
    prescription: 'prescricao',
    pediatric_calc: 'calculadora',
    exams: 'exames',
    certificate: 'atestado',
    referral: 'encaminhamento',
    protocols: 'protocolos',
    print_preview: 'exportar'
  };
  ```
* **Arquivo:** `src/App.tsx` (linhas 96, 183-189, 564-566)
  O estado de origem da impressão é controlado por `printOrigin`:
  ```typescript
  const [printOrigin, setPrintOrigin] = useState<ActiveTab>('prescription');
  ...
  const handleNavigateToPrint = (type?: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral') => {
    if (type) {
      setPrintDocType(type);
    }
    setPrintOrigin(activeTab === 'print_preview' ? printOrigin : activeTab);
    applyTab('print_preview');
  };
  ...
  // Renderização do PrintPreview:
  <PrintPreview
    ...
    onNavigateBack={() => handleSelectTab(printOrigin)}
    onBack={() => handleSelectTab(printOrigin)}
  />
  ```

---

### 1.2. Mapeamento de Botões e Loops em `src/components/PrescriptionBuilder.tsx`
No `PrescriptionBuilder.tsx`, foram identificados **7 botões de ação distintos** que executam o callback `onNavigateToPrint`, além de reatribuições enganosas de funções de compartilhamento:

1. **Reatribuição Falsa de Handlers (Linhas 567-568):**
   ```typescript
   // Sharing always goes through the same document review and validation.
   const handleCopyText = onNavigateToPrint;
   const handleSendWhatsApp = onNavigateToPrint;
   ```
2. **Stepper Superior Interno (Linhas 720-774):**
   - Etapa 1 (`linhas 721-736`): Rótulo *"1. Paciente"* → aciona `onOpenPatientModal()`.
   - Etapa 2 (`linhas 738-755`): Rótulo *"2. Medicamento (X)"* → executa scroll suave para `composerRef`.
   - Etapa 3 (`linhas 757-774`): Rótulo *"3. Revisar e exportar (X)"* → executa `onClick={onNavigateToPrint}`.
3. **Barra de Alternância Mobile Interna (Linhas 857-879):**
   - Cria uma subcamada de abas concorrente à `MobileBottomNav`:
     - *"Prescrever"* (`setMobileSection('composer')`)
     - *"Receita (X)"* (`setMobileSection('preview')`)
4. **Footer de Ações da Lista de Medicamentos (Linhas 1614-1647):**
   - Botão 1 (`linhas 1618-1626`): *"Revisar para compartilhar"* (ícone `Send` / WhatsApp) → chama `handleSendWhatsApp` (que aponta para `onNavigateToPrint`).
   - Botão 2 (`linhas 1628-1635`): *"Copiar Texto"* (ícone `Copy`) → chama `handleCopyText` (que aponta para `onNavigateToPrint`). Embora tenha código de feedback `copiedSuccess`, o clique muda a rota do usuário para `print_preview`.
   - Botão 3 (`linhas 1638-1645`): *"Revisar e exportar"* (ícone `Printer`) → chama `onNavigateToPrint`.
5. **Ações na Folha A4 Simulada (Coluna Direita / Aba Mobile 'Receita') (Linhas 1672-1679 e 1823-1842):**
   - Botão 4 (`linhas 1673-1679`): *"Abrir tela cheia"* → chama `onNavigateToPrint`.
   - Botão 5 (`linhas 1824-1832`): *"Imprimir / PDF A4"* → chama `onNavigateToPrint`.
   - Botão 6 (`linhas 1833-1841`): *"Revisar para compartilhar"* → chama `handleSendWhatsApp` (`onNavigateToPrint`).
6. **Prop Ignorada / Inutilizada (Linhas 62 e 77):**
   - `onNavigateToPediatricCalc` é recebida nas props de `PrescriptionBuilderProps`, mas **nunca é chamada** em nenhum botão da tela. A calculadora clínica fica acessível exclusivamente pelo menu/sidebar ou bottom nav.

---

### 1.3. Mapeamento de Botões em `src/components/ExamRequester.tsx`
* **Botão no Cabeçalho Superior (Linhas 156-169):**
  ```tsx
  <button
    type="button"
    onClick={onNavigateToPrint}
    disabled={selectedExams.length === 0}
    className="..."
  >
    <Download className="w-4 h-4" strokeWidth={1.75} />
    <span>Visualizar & Baixar PDF ({selectedExams.length})</span>
  </button>
  ```
* **Botão no Rodapé dos Exames Selecionados (Linhas 428-439):**
  ```tsx
  {selectedExams.length > 0 && (
    <div className="pt-2 border-t" ...>
      <button
        type="button"
        onClick={onNavigateToPrint}
        className="tactile-btn-success w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download className="w-4 h-4" strokeWidth={1.75} />
        <span>Gerar & Baixar PDF</span>
      </button>
    </div>
  )}
  ```
* **Ausência de Fluxo Sequencial:** Não há qualquer botão de avanço para a próxima etapa médica (ex.: Atestados) ou de retorno contextual para a prescrição. A única saída oferecida na interface é emitir o PDF de exames isoladamente.

---

### 1.4. Mapeamento de Botões em `src/components/CertificateAndReferral.tsx`
* **Subabas Internas (Linhas 53-55):** O componente controla `internalSubTab` ('certificate' | 'referral') em paralelo com o estado de `App.tsx` (`certSubTab`).
* **Botões de Cabeçalho do Atestado (Linhas 341-361):**
  - *"Enviar no WhatsApp"* (`handleSendCertificateWhatsApp`)
  - *"Visualizar & Baixar PDF"* (`onClick={() => onNavigateToPrint('certificate')}`)
* **Botões de Cabeçalho do Encaminhamento (Linhas 647-667):**
  - *"Enviar no WhatsApp"* (`handleSendReferralWhatsApp`)
  - *"Visualizar & Baixar PDF"* (`onClick={() => onNavigateToPrint('referral')}`)
* **Ausência de Continuidade:** Ambas as telas encerram suas ações disparando para `PrintPreview`, sem integração linear com as receitas ou exames gerados para o mesmo paciente.

---

### 1.5. Mapeamento em `src/components/PediatricCalculator.tsx` e `ClinicalProtocolsView.tsx`
* Em `PediatricCalculator.tsx` (linha 601): Botão *"Ir para Receita"* (`onClick={onNavigateToPrescription}`). Quando o usuário clica em "Adicionar à prescrição" em um fármaco pediátrico, o item é adicionado ao estado global de itens, mas não há transição automática nem indicação de avanço.
* Em `ClinicalProtocolsView.tsx`:
  - Linha 207: Botão de cabeçalho *"Ir para Receita"*.
  - Linha 396: Botão contextual em card com item já adicionado *"Ver receita"*.

---

### 1.6. O Loop Crítico de Redirecionamento em `src/components/PrintPreview.tsx` e `PrescriptionReview.tsx`
* **Desvio Condicional em `PrintPreview.tsx` (Linhas 342-344):**
  ```tsx
  if (['prescription', 'special_prescription'].includes(docType)) {
    return <PrescriptionReview items={prescriptionItems} doctor={doctor} patient={patient} onBack={handleBack} onEditPatient={onOpenPatientModal || handleBack} onEditDoctor={onOpenDoctorModal || handleBack} />;
  }
  ```
* **Seletor de Abas de Documentos em `PrintPreview.tsx` (Linhas 453-531):**
  - Exibe 5 abas: `Receita Simples`, `Controle Especial`, `Exames`, `Atestados`, `Encaminhamentos`.
* **Mecanismo de Desorientação de Rota (Bug de Loop de Retorno):**
  1. O usuário está em `exams` e clica em *"Visualizar & Baixar PDF"*.
  2. `App.tsx` define `printOrigin = 'exams'`, `printDocType = 'exams'` e exibe `PrintPreview`.
  3. No `PrintPreview`, o usuário clica na aba *"Receita Simples"* (`docType = 'prescription'`).
  4. O componente re-renderiza e entra na condição da linha 342, renderizando `PrescriptionReview`.
  5. `PrescriptionReview` **não possui** o seletor de abas (`Exames`, `Atestados`, etc.); ele só exibe as receitas.
  6. No cabeçalho de `PrescriptionReview`, há o botão *"Voltar aos medicamentos"* (`onClick={onBack}`).
  7. `onBack` executa `handleSelectTab(printOrigin)`.
  8. Como `printOrigin` foi gravado como `'exams'`, o usuário é jogado de volta para a tela de **Exames**, e **não** para a Prescrição de Medicamentos!
  9. Resultado: **Quebra da previsibilidade de navegação e perda da coerência contextual.**

---

## 2. Logic Chain (Raciocínio Diagnóstico e Análise de Causa-Raiz)

1. **Premissa de UX Clínica:** Em um ambiente de pronto atendimento (UPA, PS ou ambulatório), o plantonista atende dezenas de pacientes em ritmo acelerado. O modelo mental do médico segue um fluxo natural e progressivo:
   $$\text{Identificação / Peso} \longrightarrow \text{Prescrição / Doses} \longrightarrow \text{Exames Complementares} \longrightarrow \text{Atestado / Encaminhamento} \longrightarrow \text{Emissão / Impressão Final}$$

2. **Diagnóstico da Fragmentação Atual:**
   - Cada tela foi desenvolvida como um "silo independente" que compete com as demais e que tenta finalizar o atendimento individualmente gerando um PDF próprio.
   - O `PrescriptionBuilder` assume prematuramente que a consulta acabou assim que se inclui o primeiro medicamento, apresentando múltiplos CTAs para "Revisar e exportar".
   - Não há condução do médico caso ele queira pedir exames laboratoriais ou emitir um atestado para aquele paciente. O médico precisa "abandonar" a tela usando a `MobileBottomNav` ou a `Sidebar`.

3. **Diagnóstico dos Botões Redundantes e Falsos:**
   - Em `PrescriptionBuilder.tsx`, 7 botões distintos apontam para a mesma função `onNavigateToPrint`.
   - A reatribuição `handleCopyText = onNavigateToPrint` e `handleSendWhatsApp = onNavigateToPrint` engana o usuário: botões rotulados como "Copiar Texto" e "Revisar para compartilhar" mudam a rota da aplicação para `print_preview`, causando estranheza e cliques frustrados.
   - O Stepper interno ("1. Paciente", "2. Medicamento", "3. Revisar e exportar") não representa as etapas do atendimento clínico, mas sim microetapas da própria prescrição, entrando em conflito com o stepper de atendimento do sistema e com a `MobileBottomNav`.

4. **Diagnóstico do Desatamento do Loop `PrintPreview` / `PrescriptionReview`:**
   - A coexistência de `PrintPreview` (que trata exames, atestados e encaminhamentos) com `PrescriptionReview` (que trata receitas simples, antimicrobianos e C1) cria uma bifurcação artificial.
   - O salvamento ingênuo de `printOrigin` em `App.tsx` não rastreia trocas de abas feitas *dentro* do preview. A navegação de volta fica corrompida se o usuário alternar o tipo de documento na visualização.

5. **Conformidade Sanitária (CFM / ANVISA):**
   - Qualquer linearização do fluxo **deve preservar intactas** as exigências legais:
     - **RDC 20/2011 (ANVISA):** Antimicrobianos em receituário segregado de 2 vias (1ª via paciente, 2ª via farmácia/retenção).
     - **Portaria SVS/MS 344/98 (ANVISA):** Substâncias sujeitas a controle especial C1 em 2 vias (máximo 3 substâncias por folha, identificação de emitente, comprador e fornecedor).
     - **Resolução CFM 1.658/2002 e 1.851/2008:** Inclusão de CID-10 no atestado médico condicionada à autorização expressa do paciente.
     - **Receituário Simples:** Folha médica padrão sem mistura indevida de substâncias controladas.

---

## 3. Caveats (Limitações, Premissas e Hipóteses Alternativas)

1. **Arquitetura 100% Client-Side:** Toda a persistência é mantida em `localStorage` e nos estados do React em `App.tsx`. A linearização deve ocorrer puramente no roteamento de estados (`activeTab`) e passagem de callbacks, sem introduzir bibliotecas externas (como `react-router`).
2. **Independência dos Documentos:** Embora o fluxo recomendado seja linear, o plantonista deve manter a liberdade de pular etapas ou emitir *apenas* um atestado, ou *apenas* uma receita, caso o paciente venha apenas para renovação ou declaração. O fluxo linear deve ser **orientador (paved road)**, nunca **bloqueante (straightjacket)**.
3. **Padrão de Cores e Impressão:** A folha A4 e as páginas de receitas devem permanecer rigorosamente brancas com tipografia escura (#000000 / #0F172A), respeitando a compatibilidade com `html2canvas` e as restrições de CSS já mapeadas.

---

## 4. Conclusion (Proposta de Arquitetura Linear para o Requisito R2)

### 4.1. Estrutura do Novo Stepper Linear de Atendimento
Substituir o micro-stepper interno do `PrescriptionBuilder` por um **Stepper Clínico Unificado de Atendimento**, compartilhado ou espelhado de forma coerente nas etapas:

```
[ 1. Prescrição & Doses ] ──▶ [ 2. Exames ] ──▶ [ 3. Documentos ] ──▶ [ 4. Emissão Consolidada (PDF) ]
```

- **Etapa 1 (Prescrição):**
  - Paciente e peso no topo.
  - Composer de medicamentos com acesso direto e contextual à Calculadora Pediátrica (`onNavigateToPediatricCalc`).
  - **Hierarquia de Botões de Rodapé (Desatamento de Redundâncias):**
    - *Ação Secundária (Esquerda):* "Zerar Receita" / "Copiar Texto" (com implementação real na área de transferência via `navigator.clipboard`, sem mudar de tela!).
    - *Ação Secundária (Centro):* "Revisar Receita" (acesso rápido à visualização da folha de medicamentos).
    - *CTA Primário Recomendado (Direita - Destaque Tátil):* **"Avançar para Exames ➔"** (ou "Ir para Exames").

- **Etapa 2 (Exames):**
  - Seleção ágil de kits ou exames individuais + indicação clínica.
  - **Hierarquia de Botões de Rodapé:**
    - *Ação Secundária (Esquerda):* "◀ Voltar para Prescrição".
    - *Ação Secundária (Centro):* "Visualizar Pedido de Exames".
    - *CTA Primário Recomendado (Direita - Destaque Tátil):* **"Avançar para Atestado / Documentos ➔"** (se não houver exames selecionados, o botão permite avançar diretamente).

- **Etapa 3 (Atestados & Encaminhamentos):**
  - Emissão de atestado médico (com respeito à Res. CFM 1.658/2002 para CID) ou guia de referência.
  - **Hierarquia de Botões de Rodapé:**
    - *Ação Secundária (Esquerda):* "◀ Voltar para Exames".
    - *CTA Primário Recomendado (Direita - Destaque Tátil):* **"Finalizar Atendimento & Emitir Documentos ➔"** (leva diretamente ao `print_preview` consolidado).

- **Etapa 4 (Emissão Consolidada / PrintPreview & PrescriptionReview):**
  - Eliminar o descompasso entre `PrintPreview` e `PrescriptionReview`.
  - O visualizador final deve apresentar **todas as abas de documentos gerados no atendimento**:
    - `Receitas` (Simples, Antimicrobianos RDC 20/2011, Controle Especial C1 Portaria 344/98 com paginação de até 3 itens).
    - `Exames` (se houver exames selecionados).
    - `Atestado` (se houver atestado emitido).
    - `Encaminhamento` (se houver guia preenchida).
  - O botão de "Voltar" deve ser inequívoco:
    - Botão "Voltar ao Atendimento" que retorna para a última etapa clínica de edição (`prescription`, `exams` ou `certificate`), sem prender o usuário em loop circular.

### 4.2. Matriz de Correções Pontuais Recomendadas

| Componente | Linha Atual | Problema Identificado | Correção Proposta para Implementação |
|---|---|---|---|
| `PrescriptionBuilder.tsx` | 567 | `handleCopyText = onNavigateToPrint` | Implementar cópia real para clipboard com feedback visual inline ("Copiado!"). |
| `PrescriptionBuilder.tsx` | 568 | `handleSendWhatsApp = onNavigateToPrint` | Abrir modal ou formatar texto direto para WhatsApp, ou direcionar com mensagem clara. |
| `PrescriptionBuilder.tsx` | 720-774 | Stepper interno redundante e confuso | Alinhar ao Stepper Global do Atendimento (Prescrição ➔ Exames ➔ Documentos ➔ Finalizar). |
| `PrescriptionBuilder.tsx` | 1618-1647 | 3 botões competindo no rodapé da lista | Manter apenas: 1 botão secundário de apoio + 1 CTA primário ("Avançar para Exames" / "Revisar"). |
| `PrescriptionBuilder.tsx` | 1823-1842 | Botões duplicados na folha A4 direita | Unificar em um único CTA de exportação/revisão. |
| `ExamRequester.tsx` | 156-169 e 428-439 | 2 botões de PDF e nenhum de progressão | Adicionar CTA de avanço: "Avançar para Documentos ➔" e "◀ Voltar à Prescrição". |
| `CertificateAndReferral.tsx` | 341-361 e 647-667 | Botões desconectados do fluxo global | Adicionar CTA no rodapé: "Finalizar Atendimento e Emitir (PDF) ➔". |
| `PrintPreview.tsx` / `App.tsx` | 342-344 e 183-189 | Loop de retorno corrompendo `printOrigin` | Unificar o retorno ou atualizar `printOrigin` dinamicamente conforme a aba de documento inspecionada. |

---

## 5. Verification Method (Método de Verificação Independente)

Para validar a implementação do Requisito R2 sem regressões funcionais ou de tipos:

1. **Verificação de Tipos e Integridade TypeScript:**
   ```bash
   npm run lint
   ```
   *Condição de Sucesso:* Conclusão com `0 errors`. Nenhuma quebra em props de callbacks ou assinaturas de interfaces em `types.ts`.

2. **Compilação de Produção com Vite:**
   ```bash
   npm run build
   ```
   *Condição de Sucesso:* Geração dos artefatos estáticos em `dist/` sem alertas de imports circulares ou falhas de bundling.

3. **Verificação do Fluxo Linear na UI (Checklist Funcional):**
   - Iniciar novo atendimento: preencher nome do paciente e peso (ex.: "Lucas Silva", 18 kg).
   - Na tela de Prescrição, adicionar um medicamento (ex.: "Dipirona gotas").
   - Verificar se o botão "Copiar Texto" copia efetivamente o texto sem trocar de tela.
   - Clicar no CTA de avanço: transição suave e direta para a tela de **Exames**.
   - Na tela de Exames, selecionar 1 kit (ex.: "Check-up Básico").
   - Clicar no CTA de avanço: transição direta para a tela de **Documentos** (Atestado/Encaminhamento).
   - Preencher atestado de 2 dias.
   - Clicar no CTA de finalização: transição direta para a tela de **Emissão e Impressão (PDF)**.
   - Na visualização de impressão, verificar se todas as abas normativas (Receita Simples, Pedido de Exames, Atestado) estão disponíveis para visualização e download em PDF individual ou consolidado.
   - Clicar em "Voltar": certificar-se de que a rota retorna para a tela esperada sem loops circulares nem travamento no `PrescriptionReview`.
