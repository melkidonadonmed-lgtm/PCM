# Relatório de Handoff — Auditoria Arquitetural Frontend & Ciclo de Vida React 19 (PresCMed)

**Agente**: Explorer 1 (`explorer_m5_1`)  
**Especialidade**: Arquitetura Frontend e Ciclo de Vida do React 19  
**Data**: 2026-09-15T02:05:00Z  
**Repositório**: `c:\Users\melki\projetos\pcm`  
**Escopo**: M5 (Auditoria Holística Frontend & Design System)  

---

## 1. Observações (Observations)

A investigação do código-fonte inspecionou exaustivamente `src/App.tsx`, `src/utils/storage.ts`, `src/utils/navigation.ts`, `src/utils/prescriptionRules.ts`, `src/utils/prescriptionPdf.ts` e todos os componentes das views centrais (`PrescriptionBuilder`, `PediatricCalculator`, `ExamRequester`, `CertificateAndReferral`, `PrintPreview`, `PrescriptionReview`, `Sidebar`, `Header`, `MobileBottomNav`, `CidSearchBar`, `PatientModal`, `DoctorProfileModal`).

### 1.1 Gerenciamento de Estado Centralizado e Ciclo de Vida no `App.tsx`
* **Localização**: `src/App.tsx:61-115` e `src/App.tsx:210-308`.
* **Constatação**: Todo o estado clínico e de sessão reside no componente raiz `App`:
  - `darkMode`: lazy init via `safeStorage.getItem('prescmed_theme')`.
  - `sidebarOpen`: inicializado e sincronizado via listener de `resize` (`App.tsx:78-93`).
  - `activeTab` e `certSubTab`: inicializados do hash da URL via `hashToTab(window.location.hash)`.
  - `doctor`, `patient`, `prescriptionItems`, `selectedExams`, `examIndication`, `certificate`, `referral`: inicializados de chaves no `safeStorage`.
  - `consultationVersion`: incrementado no reset de atendimento para forçar desmontagem limpa do `PrescriptionBuilder` (`App.tsx:494`: `key={consultationVersion}`).

### 1.2 Cascatas de Re-render e Sincronização de Estado
* **Localização**: `src/App.tsx:323-335`:
  ```tsx
  useEffect(() => {
    safeStorage.setItem('prescmed_patient', JSON.stringify(patient));
    setCertificate(prev => ({
      ...prev,
      patientName: patient.name || '',
      documentNumber: patient.documentNumber || ''
    }));
    setReferral(prev => ({
      ...prev,
      patientName: patient.name || '',
      documentNumber: patient.documentNumber || ''
    }));
  }, [patient]);
  ```
  E em `src/components/CertificateAndReferral.tsx:64-78`:
  ```tsx
  const handlePatientNameChange = (newName: string) => {
    onUpdateCertificate({ ...certificate, patientName: newName });
    onUpdateReferral({ ...referral, patientName: newName });
    if (onUpdatePatient) {
      onUpdatePatient({ ...patient, name: newName });
    }
  };
  ```
* **Constatação**: Quando o usuário digita o nome do paciente na tela de atestados/encaminhamentos (`CertificateAndReferral`), o handler `handlePatientNameChange` dispara `setCertificate`, `setReferral` e `setPatient`. Após o commit, o `useEffect([patient])` é executado e chama novamente `setCertificate(prev => ({ ... }))` e `setReferral(prev => ({ ... }))`. Como novas referências de objetos são geradas, o React 19 agenda um segundo ciclo de renderização no mesmo frame e dispara os efeitos `useEffect([certificate])` e `useEffect([referral])`, gerando gravações síncronas redundantes no `localStorage`.

### 1.3 Estratégia de Montagem de Views e Prop Drilling
* **Localização**: `src/App.tsx:492-590`.
* **Constatação**:
  - `PrescriptionBuilder` permanece montado no DOM mesmo inativo (`<div hidden={activeTab !== 'prescription'}>`), preservando o estado transiente de digitação e formulários de posologia. Porém, como não utiliza `React.memo` e recebe closures anônimas em suas props a cada render (`onNavigateToPrint={() => handleNavigateToPrint('prescription')}`), ele é re-renderizado em qualquer mutação no `App`.
  - As demais views (`PediatricCalculator`, `ExamRequester`, `CertificateAndReferral`, `ClinicalProtocolsView`, `PrintPreview`) são desmontadas quando inativas (`{activeTab === 'xyz' && <Xyz />}`).
  - Redundância de props legadas identificada:
    - Em `ExamRequester`: recebe tanto `onUpdateSelectedExams={setSelectedExams}` quanto `onUpdateExams={setSelectedExams}` (`App.tsx:529-530`).
    - Em `PrintPreview`: recebe tanto `exams={selectedExams}` quanto `selectedExams={selectedExams}`, além de `onNavigateBack` e `onBack` (`App.tsx:573-581`).

### 1.4 Timers Assíncronos sem Cleanup em Componentes que Desmontam
* **Localizações**:
  - `src/components/PediatricCalculator.tsx:236-238`, `262-264`, `319-321`, `374-376`:
    ```tsx
    setAddedMedsMap(prev => ({ ...prev, [med.id]: true }));
    setTimeout(() => {
      setAddedMedsMap(prev => ({ ...prev, [med.id]: false }));
    }, 1800);
    ```
  - `src/components/ClinicalProtocolsView.tsx:133-135`, `160-162`:
    ```tsx
    setAddedProtocolsMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedProtocolsMap(prev => ({ ...prev, [key]: false }));
    }, 1800);
    ```
  - `src/components/CidSearchBar.tsx:64`, `72`, `93`, `110`:
    ```tsx
    setTimeout(() => setJustAddedCode(null), 2000);
    ```
  - `src/components/PrintPreview.tsx:267`, `341`:
    ```tsx
    setTimeout(() => setExportSuccess(false), 3000);
    setTimeout(() => setCopiedLink(false), 2000);
    ```
* **Constatação**: Os IDs de retorno de `setTimeout` não são armazenados em `useRef` e nenhuma função de limpeza (`clearTimeout`) é executada no desmonte (`useEffect`). Se o usuário adiciona um item e navega rapidamente para outra aba, os callbacks dos timers são executados após o desmonte da visualização, mantendo fechamentos em memória.

### 1.5 Ausência de Click-Outside e Escape no `CidSearchBar` e no Modal de Kits do `ExamRequester`
* **Localização**: `src/components/CidSearchBar.tsx:44-45` e `src/components/CidSearchBar.tsx:132`.
  - `containerRef = useRef<HTMLDivElement>(null)` é declarado e associado ao elemento DOM, mas nenhum listener `mousedown` ou `keydown` foi implementado para fechar `isOpen(false)` ao clicar fora ou teclar Escape.
* **Localização**: `src/components/ExamRequester.tsx:503-600`.
  - O modal granular de seleção de kits (`activeKitModal`) é renderizado como overlay `div` simples com `z-50`, sem captura de tecla `Escape`, sem light-dismiss nativo e sem focus-trap, dependendo unicamente de clique no botão 'X'.

### 1.6 Componentes Órfãos / Código Morto
* **Localizações**:
  - `src/components/MedicationSelectionModal.tsx` (374 linhas, 15KB) — 0 referências de importação no projeto.
  - `src/components/MedicationPresentationModal.tsx` (215 linhas, 8KB) — 0 referências de importação no projeto.
* **Constatação**: Ambos foram suplantados por `MedicationSearchDialog.tsx` e lógica inline, mas permanecem no diretório `src/components/`.

### 1.7 Navegação e Prevenção de Loops
* **Localização**: `src/utils/navigation.ts:45-62` e `src/App.tsx:122-185`.
* **Constatação**: O mecanismo de histórico e URL está completamente desacoplado e protegido contra loops:
  - Mapeamento bidirecional unívoco: `tabToHash` (`#/prescricao`, `#/calculadora`, `#/exames`, `#/atestado`, `#/encaminhamento`, `#/protocolos`, `#/exportar`).
  - Guarda `if (hashMatchesTab(window.location.hash, tab)) return;` em `App.tsx:166` evita reenvios ao histórico do navegador.
  - O fluxo entre as telas (`PrescriptionBuilder` -> `ExamRequester` -> `CertificateAndReferral` -> `PrintPreview`) possui botões de avanço contextual e retorno linear (`handleSmartBack`), eliminando ciclos circulares.
  - `MobileBottomNav` opera com 5 rotas primárias bem definidas, com estados visuais ativos (`aria-current="page"`).

---

## 2. Cadeia Lógica (Logic Chain)

1. **Da Centralização de Estado à Preservação de Dados**:
   - Como o estado do paciente, médico, receitas, exames e documentos reside exclusivamente em `App.tsx` (Observação 1.1), qualquer alternância de abas pelo menu superior, lateral ou barra inferior (`MobileBottomNav`) nunca destrói nem reinicializa os dados clínicos já preenchidos.

2. **Do Efeito em `patient` à Cascata de Re-renderizações**:
   - O `useEffect` monitorando `[patient]` em `App.tsx` (Observação 1.2) sincroniza o nome e documento para `certificate` e `referral`. Ao atualizar o estado com novos objetos literais dentro do efeito após a mutação pelo input, cria-se uma cascata de dois renders por digitação. Isso não quebra a aplicação, mas causa computação duplicada desnecessária e serialização redundante no `localStorage`.

3. **Dos Timers Assíncronos sem Cleanup aos Vazamentos em Transições Rápidas**:
   - Em dispositivos móveis, transições rápidas do usuário logo após ações como "Adicionar à receita" ou "Copiar texto" causam o desmonte imediato de `PediatricCalculator` ou `ClinicalProtocolsView` antes do término de 1800ms (Observação 1.4). Como não há `clearTimeout`, o timer fica pendurado na fila de eventos do browser e tenta disparar o setter em componente desmontado.

4. **Da Quarentena de Armazenamento ao Bloqueio de Sessão**:
   - O `src/utils/storage.ts` adota uma política de quarentena estrita: caso um dado no `localStorage` falhe no validador `validStoredValue`, o `blocked.add(key)` trava permanentemente as operações `setItem` e `removeItem` daquela chave na sessão. Isso protege dados corrompidos contra sobrescrita cega, mas exige que a validação seja rigorosamente tolerante a campos opcionais legítimos para não bloquear o usuário injustamente.

5. **Da Integridade da Navegação**:
   - O roteamento via hash com `startViewTransition` e verificação de correspondência antes do `pushState` (Observação 1.7) garante que a pilha de histórico do navegador permaneça síncrona com `activeTab`, sem gerar loops de redirecionamento ou travamento do botão "Voltar".

---

## 3. Ressalvas e Limitações (Caveats)

1. **Ambiente READ-ONLY**: Por determinação da missão M5, nenhuma alteração nos arquivos de código foi aplicada nesta etapa. As correções e limpezas propostas devem ser executadas na etapa de implementação/refinamento.
2. **Execução de `npm run lint`**: O comando interativo no shell disparou prompt de confirmação de permissão que expirou por timeout de segurança. A análise estática de tipos foi realizada via inspeção detalhada de `src/types.ts` e contratos de interfaces nos componentes.
3. **Desempenho de `localStorage`**: O volume de dados manipulado (receitas, exames, cadastros) é pequeno (< 100KB), de modo que o impacto das gravações redundantes é imperceptível em desktop, manifestando-se apenas potencialmente como pequenos frames perdidos em dispositivos móveis de baixo custo durante digitação ultrarrápida.

---

## 4. Conclusões (Conclusions)

1. **Arquitetura Geral Saudável e Conforme**: O PresCMed segue fielmente as diretrizes canônicas de `AGENTS.md`: SPA 100% client-side, estado centralizado no `App.tsx`, sem dependência de back-end ou APIs externas, e com prop drilling limpo e previsível.
2. **Ausência de Loops de Navegação**: O sistema de navegação mobile e desktop é linear, determinístico e não apresenta loops circulares. A barra inferior (`MobileBottomNav`), a `Sidebar` e os botões contextuais de avanço/retorno atuam em harmonia.
3. **Pontos de Otimização Prioritários Identificados**:
   - **Otimização de Re-render**: Evitar a chamada redundante de `setCertificate` e `setReferral` dentro do `useEffect([patient])` quando os valores forem idênticos aos já armazenados, ou derivar esses campos diretamente para evitar a cascata.
   - **Limpeza de Timers**: Encapsular feedbacks visuais temporizados em hooks com cancelamento no desmonte (`clearTimeout`) ou utilizar refs de timer.
   - **Acessibilidade do CID Search**: Adicionar listener de clique-fora (`mousedown`) e fechamento por `Escape` no `CidSearchBar.tsx` usando a `containerRef` já existente.
   - **Higiene de Código**: Remover com segurança os arquivos órfãos `MedicationSelectionModal.tsx` e `MedicationPresentationModal.tsx` para reduzir a base de código em ~600 linhas e ~23KB.

---

## 5. Método de Verificação Independente (Verification Method)

Para validar de forma independente os achados deste relatório:

1. **Inspeção de Código e Referências Cruzadas**:
   - Verificar ausência de importação de `MedicationSelectionModal` e `MedicationPresentationModal`:
     ```powershell
     rg "MedicationSelectionModal" src/
     rg "MedicationPresentationModal" src/
     ```
   - Verificar ausência de `clearTimeout` nos componentes:
     ```powershell
     rg "setTimeout" src/components/PediatricCalculator.tsx
     rg "setTimeout" src/components/ClinicalProtocolsView.tsx
     rg "setTimeout" src/components/CidSearchBar.tsx
     ```
   - Verificar ausência de listener de clique-fora em `CidSearchBar.tsx`:
     Inspecionar `src/components/CidSearchBar.tsx:44` e linhas 132-135; constatar que `containerRef` é declarado mas não associado a listeners de eventos.

2. **Verificação de Compilação TypeScript**:
   - Executar no terminal do projeto:
     ```powershell
     npm run lint
     ```
     Verificar que `tsc --noEmit` conclui com 0 erros.

3. **Verificação de Build Vite**:
   - Executar no terminal do projeto:
     ```powershell
     npm run build
     ```
     Confirmar a geração correta do pacote estático em `dist/`.
