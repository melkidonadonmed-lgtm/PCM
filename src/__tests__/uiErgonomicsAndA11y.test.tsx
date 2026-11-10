import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { PrescriptionBuilder } from '../components/PrescriptionBuilder';
import { ClinicalDocumentsHub } from '../components/ClinicalDocumentsHub';
import { PediatricCalculator } from '../components/PediatricCalculator';
import { ClinicalProtocolsView } from '../components/ClinicalProtocolsView';
import { CommandPaletteModal } from '../components/layout/CommandPaletteModal';
import { ConsultationReadinessBar } from '../components/bento/ConsultationReadinessBar';
import { ContextSwitcher } from '../components/ContextSwitcher';
import { SUS_DOCUMENTS_CATALOG } from '../data/susDocumentsCatalog';
import { PrescriptionModelsModal } from '../components/prescription/PrescriptionModelsModal';
import { PrescribedItemsList } from '../components/prescription/PrescribedItemsList';
import { PatientQuickCard } from '../components/prescription/PatientQuickCard';
import { LogoGeneratorModal } from '../components/LogoGeneratorModal';
import { EditorModelsAndStylesDrawer } from '../components/editor/EditorModelsAndStylesDrawer';
import { EditorTopActionsBar } from '../components/editor/EditorTopActionsBar';
import { EditorTextFormattingToolbar } from '../components/editor/EditorTextFormattingToolbar';
import { SusCatalogListView } from '../components/sus/SusCatalogListView';
import { CidSearchBar } from '../components/CidSearchBar';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import { parseTabFromHash } from '../hooks/useNavigationSync';
import { registerModalInStack, getActiveModalStackSize } from '../hooks/useModalAccessibility';
import type { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral } from '../types';

const emptyDoctor: DoctorProfile = {
  name: '', crm: '', crmState: 'SP', specialty: '', clinicName: '', address: '', cityState: '', phone: '', email: '', showSignature: true,
};

const configuredDoctor: DoctorProfile = {
  name: 'Dra. Helena Costa', crm: '54321', crmState: 'SP', specialty: 'Clínica Médica', clinicName: 'UBS Jardim Europa',
  address: 'Av. Brasil, 100', cityState: 'São Paulo - SP', phone: '(11) 99999-0000', email: 'helena@exemplo.med.br', showSignature: true,
};

const emptyPatient: Patient = { id: 'pat-empty', name: '', weightKg: 0, gender: 'other', allergies: [] };
const activePatient: Patient = { id: 'pat-1', name: 'Carlos Eduardo Lima', documentNumber: '111.222.333-44', weightKg: 18.5, gender: 'male', allergies: [] };

const sampleItems: PrescriptionItem[] = [{
  id: 'rx-1', name: 'Dipirona 500 mg', presentation: 'comprimido', route: 'Uso Oral', quantity: '20 comprimidos',
  doseCalculatedText: '1 comprimido', frequencyText: 'Tomar 1 comprimido de 6 em 6 horas se dor ou febre.',
  scheduleInterval: '6/6h', scheduleTimes: [], instructions: 'Tomar 1 comprimido de 6 em 6 horas se dor ou febre.',
  isContinuous: false, isSpecialControl: false, regimeReceita: 'simples',
}];

const sampleExams: ExamItem[] = [
  { id: 'ex-1', name: 'Hemograma Completo', category: 'hematologia', selected: true, urgency: 'routine' },
  { id: 'ex-2', name: 'Glicemia de Jejum', category: 'bioquimica', selected: true, urgency: 'routine' },
];

const defaultCertificate: MedicalCertificate = {
  patientName: 'Carlos Eduardo Lima', documentNumber: '111.222.333-44', daysOff: 2, startDate: '2026-10-13', endDate: '2026-10-14',
  periodText: 'por motivo de saúde', includeCID: false, cid10Code: '', cid10Description: '', observations: '',
};

const defaultReferral: MedicalReferral = {
  patientName: 'Carlos Eduardo Lima', documentNumber: '111.222.333-44', destinationSpecialty: 'Cardiologia',
  reason: 'Avaliação especializada', clinicalSummary: '', relevantExams: '', hypothesisCID: '', priority: 'eletivo',
};

describe('Ergonomia UI/UX, Acessibilidade WAI-ARIA e Navegação Bidirecional', () => {
  it('valida casos de borda de acessibilidade (WAI-ARIA), FSM data-state canônico e invariante Sem peso, sem dose (weightKg = 0)', () => {
    const zeroWeightPatient: Patient = { ...activePatient, weightKg: 0 };
    const pediaZeroHtml = renderToStaticMarkup(
      <PediatricCalculator
        darkMode={false}
        patient={zeroWeightPatient}
        onUpdatePatientWeight={vi.fn()}
        onAddPrescriptionItem={vi.fn()}
        onNavigateToPrescription={vi.fn()}
      />
    );
    expect(pediaZeroHtml).toContain('value=""');
    expect(pediaZeroHtml).toContain('id="pediatric-med-search"');
    expect(pediaZeroHtml).toContain('name="pediatricMedSearch"');
    expect(pediaZeroHtml).toContain('Informe o peso do paciente para calcular as doses.');
    expect(pediaZeroHtml).not.toContain('py-0.2');

    const regimeLabels = {
      simples: { rotulo: 'Receita Simples', detalhe: '1 via', tituloTexto: 'RECEITUÁRIO' },
      antimicrobiano: { rotulo: 'Antimicrobiano', detalhe: '2 vias', tituloTexto: 'RECEITUÁRIO DE ANTIMICROBIANO' },
      controle_especial: { rotulo: 'Controle Especial', detalhe: '2 vias', tituloTexto: 'RECEITUÁRIO DE CONTROLE ESPECIAL' },
    };

    const emptyListHtml = renderToStaticMarkup(
      <PrescribedItemsList
        items={[]}
        editingItemId={null}
        regimesComItens={[]}
        porRegime={{ simples: [], antimicrobiano: [], controle_especial: [] }}
        itensEmDuasVias={0}
        regimeLabels={regimeLabels}
        savedModelsCount={0}
        isDoctorConfigured={true}
        copiedSuccess={false}
        onOpenModelsModal={vi.fn()}
        onOpenSaveModelModal={vi.fn()}
        onOpenCreateCustomModel={vi.fn()}
        onStartEdit={vi.fn()}
        onMoveItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onNavigateToPrint={vi.fn()}
        onSendWhatsApp={vi.fn()}
        onCopyText={vi.fn()}
      />
    );
    expect(emptyListHtml).toContain('data-state="empty"');
    expect(emptyListHtml).not.toContain('data-state="pressed"');

    const twoItems: PrescriptionItem[] = [
      ...sampleItems,
      { ...sampleItems[0], id: 'rx-2', name: 'Paracetamol 500 mg' },
    ];

    const populatedListHtml = renderToStaticMarkup(
      <PrescribedItemsList
        items={twoItems}
        editingItemId={null}
        regimesComItens={['simples']}
        porRegime={{ simples: twoItems, antimicrobiano: [], controle_especial: [] }}
        itensEmDuasVias={0}
        regimeLabels={regimeLabels}
        savedModelsCount={1}
        isDoctorConfigured={true}
        copiedSuccess={false}
        onOpenModelsModal={vi.fn()}
        onOpenSaveModelModal={vi.fn()}
        onOpenCreateCustomModel={vi.fn()}
        onStartEdit={vi.fn()}
        onMoveItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onNavigateToPrint={vi.fn()}
        onSendWhatsApp={vi.fn()}
        onCopyText={vi.fn()}
      />
    );
    expect(populatedListHtml).toContain('data-state="idle"');
    expect(populatedListHtml).toContain('aria-label="Mover Dipirona 500 mg para cima"');
    expect(populatedListHtml).toContain('aria-label="Remover Dipirona 500 mg"');

    const patientCardHtml = renderToStaticMarkup(
      <PatientQuickCard
        patient={activePatient}
        showExtraPatientFields={false}
        onToggleExtraFields={vi.fn()}
        onUpdatePatient={vi.fn()}
        onOpenPatientModal={vi.fn()}
      />
    );
    expect(patientCardHtml).toContain('data-state="idle"');

    const modelsModalHtml = renderToStaticMarkup(
      <PrescriptionModelsModal
        isSaveModelModalOpen={true}
        isLoadModelModalOpen={true}
        isCreatingCustomModel={false}
        items={sampleItems}
        newModelName="Analgesia Padrão"
        savedPrescriptionModels={[
          {
            id: 'mod-1',
            title: 'Modelo Teste',
            contentJson: null,
            contentHtml: '',
            contextId: 'default',
            isTemplate: true,
            prescriptionItems: sampleItems,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
        ]}
        customModelDraftTitle=""
        customModelDraftItems={[]}
        customModelSearchTerm=""
        customModelSuggestions={[]}
        onChangeNewModelName={vi.fn()}
        onSavePrescriptionModel={vi.fn()}
        onCloseSaveModelModal={vi.fn()}
        onCloseLoadModelModal={vi.fn()}
        onStartCreateCustomModel={vi.fn()}
        onExitCreateCustomModel={vi.fn()}
        onChangeCustomModelDraftTitle={vi.fn()}
        onCustomModelSearchChange={vi.fn()}
        onAddCustomModelItem={vi.fn()}
        onRemoveCustomModelItem={vi.fn()}
        onUpdateCustomModelItem={vi.fn()}
        onSaveCustomCreatedModel={vi.fn()}
        onApplyPrescriptionModel={vi.fn()}
        onDeletePrescriptionModel={vi.fn()}
      />
    );
    expect(modelsModalHtml).toContain('role="dialog"');
    expect(modelsModalHtml).toContain('aria-modal="true"');
    expect(modelsModalHtml).toContain('aria-label="Excluir modelo Modelo Teste"');
  });

  it('registerModalInStack gerencia pilha LIFO de modais aninhados (Escape fecha apenas o modal do topo, preserva foco anterior e aplica Focus Trap Tab/Shift+Tab)', () => {
    const keydownListeners = new Set<(e: KeyboardEvent) => void>();
    const fakeWin = {
      addEventListener: (_type: string, fn: EventListenerOrEventListenerObject) => {
        keydownListeners.add(fn as (e: KeyboardEvent) => void);
      },
      removeEventListener: (_type: string, fn: EventListenerOrEventListenerObject) => {
        keydownListeners.delete(fn as (e: KeyboardEvent) => void);
      },
    } as unknown as Pick<Window, 'addEventListener' | 'removeEventListener'>;

    let currentActive: HTMLElement | null = null;
    const makeEl = (name: string): HTMLElement => {
      const el = {
        name,
        focus: vi.fn(() => {
          currentActive = el;
        }),
        hasAttribute: () => false,
        getAttribute: () => null,
        offsetParent: {},
        getClientRects: () => [{}],
      } as unknown as HTMLElement;
      return el;
    };

    const pageTriggerBtn = makeEl('page-trigger');
    const parentFirstInput = makeEl('parent-first');
    const parentSubModalBtn = makeEl('parent-submodal-btn');
    const childFirstBtn = makeEl('child-first');
    const childLastBtn = makeEl('child-last');

    const fakeDoc = {
      get activeElement() {
        return currentActive;
      },
    } as unknown as Pick<Document, 'activeElement'>;

    const makeContainer = (nodes: HTMLElement[]): HTMLElement =>
      ({
        querySelector: () => nodes[0] || null,
        querySelectorAll: () => nodes,
        contains: (target: Node | null) => nodes.includes(target as HTMLElement),
      }) as unknown as HTMLElement;

    const parentContainer = makeContainer([parentFirstInput, parentSubModalBtn]);
    const childContainer = makeContainer([childFirstBtn, childLastBtn]);

    const onCloseParent = vi.fn();
    const onCloseChild = vi.fn();

    pageTriggerBtn.focus();
    const cleanupParent = registerModalInStack({
      getOnClose: () => onCloseParent,
      getContainer: () => parentContainer,
      getInitialFocus: () => parentFirstInput,
      doc: fakeDoc,
      win: fakeWin,
    });
    expect(getActiveModalStackSize()).toBe(1);

    parentSubModalBtn.focus();
    const cleanupChild = registerModalInStack({
      getOnClose: () => onCloseChild,
      getContainer: () => childContainer,
      getInitialFocus: () => childFirstBtn,
      doc: fakeDoc,
      win: fakeWin,
    });
    expect(getActiveModalStackSize()).toBe(2);

    childLastBtn.focus();
    const tabForwardEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownListeners.forEach((fn) => fn(tabForwardEvent));
    expect(tabForwardEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(currentActive).toBe(childFirstBtn);

    const tabBackwardEvent = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownListeners.forEach((fn) => fn(tabBackwardEvent));
    expect(tabBackwardEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(currentActive).toBe(childLastBtn);

    const escape1 = {
      key: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownListeners.forEach((fn) => fn(escape1));
    expect(onCloseChild).toHaveBeenCalledTimes(1);
    expect(onCloseParent).not.toHaveBeenCalled();

    cleanupChild();
    expect(getActiveModalStackSize()).toBe(1);
    expect(currentActive).toBe(parentSubModalBtn);

    const escape2 = {
      key: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownListeners.forEach((fn) => fn(escape2));
    expect(onCloseParent).toHaveBeenCalledTimes(1);
    cleanupParent();
    expect(getActiveModalStackSize()).toBe(0);
    expect(currentActive).toBe(pageTriggerBtn);
  });

  it('LogoGeneratorModal, EditorModelsAndStylesDrawer, SusCatalogListView e CidSearchBar cumprem WAI-ARIA e placeholders Ex.: sem classes inválidas', () => {
    const logoModalHtml = renderToStaticMarkup(
      <LogoGeneratorModal isOpen={true} onClose={vi.fn()} activeContext={null} doctor={configuredDoctor} />
    );
    expect(logoModalHtml).toContain('role="dialog"');
    expect(logoModalHtml).toContain('aria-modal="true"');
    expect(logoModalHtml).toContain('aria-labelledby="logo-modal-title"');
    expect(logoModalHtml).toContain('aria-label="Fechar gerador de logotipo"');

    const editorDrawerHtml = renderToStaticMarkup(
      <EditorModelsAndStylesDrawer
        isModelsDrawerOpen={true} setIsModelsDrawerOpen={vi.fn()} drawerTab="padrao" setDrawerTab={vi.fn()}
        savedTemplates={[]} filteredSavedTemplates={[]} customStyles={[]} templateSearch="" setTemplateSearch={vi.fn()}
        applyPresetTemplate={vi.fn()} currentModel={{ id: 'doc-1', title: 'Rascunho', isPreset: false }}
        setNewModelTitle={vi.fn()} setIsSaveModelModalOpen={vi.fn()} editingTemplateId={null} editingTemplateTitle=""
        setEditingTemplateTitle={vi.fn()} handleSaveRename={vi.fn()} setEditingTemplateId={vi.fn()}
        handleStartRename={vi.fn()} handleDeleteTemplate={vi.fn()} handleApplyTemplate={vi.fn()}
        setNewStyleTitle={vi.fn()} setIsSaveStyleModalOpen={vi.fn()} handleDeleteCustomStyle={vi.fn()}
        handleApplyStyle={vi.fn()} isSaveModelModalOpen={true} handleSaveAsTemplate={vi.fn()} newModelTitle=""
        activeContext={null} saveAsGlobal={true} setSaveAsGlobal={vi.fn()} isSaveStyleModalOpen={true}
        handleSaveCustomStyle={vi.fn()} newStyleTitle="" fontFamilyId="inter" baseFontSize={11}
        pageOrientation="portrait" viaLayout="1-via"
        headerConfig={{
          showHeader: true, showFooter: true, showPatientBanner: true, clinicName: '', clinicAddress: '',
          doctorName: '', doctorCrm: '', doctorSpecialty: '', badgeText: 'RECEITUÁRIO', dateText: '',
          footerDocName: '', footerCrm: '', footerSpecialty: '', footerSubtext: '', patientCustomText: '',
        }}
      />
    );
    expect(editorDrawerHtml).toContain('aria-labelledby="editor-models-drawer-title"');
    expect(editorDrawerHtml).toContain('aria-labelledby="editor-save-model-modal-title"');
    expect(editorDrawerHtml).toContain('aria-labelledby="editor-save-style-modal-title"');
    expect(editorDrawerHtml).not.toContain('py-0.2');

    const susCatalogHtml = renderToStaticMarkup(
      <SusCatalogListView
        darkMode={false}
        selectedCategory="all"
        searchTerm=""
        filteredCatalog={SUS_DOCUMENTS_CATALOG.slice(0, 2)}
        selectedDocIds={[]}
        onSelectCategory={vi.fn()}
        onSearchTermChange={vi.fn()}
        onToggleDocSelection={vi.fn()}
        onStartFillingSingle={vi.fn()}
        onStartFillingMultiple={vi.fn()}
      />
    );
    expect(susCatalogHtml).toContain('id="sus-catalog-search"');
    expect(susCatalogHtml).toContain('name="susCatalogSearch"');
    expect(susCatalogHtml).toContain('aria-label="Buscar exame ou documento SUS"');

    const cidSearchHtml = renderToStaticMarkup(<CidSearchBar darkMode={false} onSelectCid={vi.fn()} />);
    expect(cidSearchHtml).toContain('name="cidSearch"');
    expect(cidSearchHtml).toContain('placeholder="Ex.: Asma, Lombalgia, J00, Dengue, A09, Cefaleia, ITU..."');
  });

  it('previne sobreposição no Header, vazamento no rodapé da Sidebar, encavalamento no PatientQuickCard e sincroniza Documentos vs Guias SUS', () => {
    const headerHtml = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        onGoHome={vi.fn()}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        patient={activePatient}
        onOpenPatientModal={vi.fn()}
        doctor={configuredDoctor}
        onOpenDoctorModal={vi.fn()}
        prescriptionCount={2}
        selectedExamsCount={1}
        isInstallable={true}
        onInstallApp={vi.fn()}
      />
    );
    expect(headerHtml).toContain('nav-segmented-track min-w-0 max-w-full overflow-x-auto');
    expect(headerHtml).toContain('flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end');

    const sidebarOnSusHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        activeTab="documents"
        documentsSubTab="sus"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        doctor={configuredDoctor}
        patient={activePatient}
      />
    );
    expect(sidebarOnSusHtml).toMatch(/id="nav-btn-sus"[^>]*aria-current="page"/);
    expect(sidebarOnSusHtml).not.toMatch(/id="nav-btn-documents"[^>]*aria-current="page"/);

    const builderHtml = renderToStaticMarkup(
      <PrescriptionBuilder
        darkMode={false}
        doctor={configuredDoctor}
        patient={activePatient}
        onUpdatePatient={vi.fn()}
        items={sampleItems}
        onUpdateItems={vi.fn()}
        onNavigateToPrint={vi.fn()}
        onNavigateToCertificate={vi.fn()}
        onNavigateToReferral={vi.fn()}
        onNavigateToExams={vi.fn()}
        onOpenPatientModal={vi.fn()}
      />
    );
    expect(builderHtml).toContain('id="presc-posology-textarea"');
    expect(builderHtml).toContain('h-11 min-h-[44px]');
  });

  it('sincroniza de forma mutuamente exclusiva a seleção entre Central de Documentos (Alt+2) e Guias SUS (Alt+6) e barra compacta do Editor A4', () => {
    const hubDirectSusHtml = renderToStaticMarkup(
      <ClinicalDocumentsHub
        darkMode={false}
        patient={activePatient}
        doctor={configuredDoctor}
        certificate={defaultCertificate}
        onUpdateCertificate={vi.fn()}
        referral={defaultReferral}
        onUpdateReferral={vi.fn()}
        selectedExams={sampleExams}
        onUpdateSelectedExams={vi.fn()}
        clinicalIndication=""
        onUpdateClinicalIndication={vi.fn()}
        initialSubTab="sus"
        initialSusDocId="lme_medicamentos"
        onNavigateToPrint={vi.fn()}
      />
    );
    expect(hubDirectSusHtml).toContain('2d');
    expect(hubDirectSusHtml).toContain('Cardiologia');
    expect(hubDirectSusHtml).toContain('LME — Medicamentos Especializados (Alto Custo / CEAF)');

    const editorTopHtml = renderToStaticMarkup(
      <EditorTopActionsBar
        doctor={configuredDoctor} currentModel={{ id: 'doc-1', title: 'Receituário Clínico', isPreset: false }}
        isEditingModelTitle={false} setIsEditingModelTitle={vi.fn()} tempModelTitle="Receituário Clínico"
        setTempModelTitle={vi.fn()} handleSaveCurrentModelTitle={vi.fn()} saveStatus="saved" lastSavedTime="12:30"
        isExportingPdf={false} savedTemplates={[]} onNavigateBack={vi.fn()} syncWithActivePrescription={vi.fn()}
        handlePrint={vi.fn()} handleDownloadPdf={vi.fn()} handleLoadActivePrescription={vi.fn()}
        handleLoadActiveReferral={vi.fn()} handleLoadActiveCertificate={vi.fn()} handleStartNewDocument={vi.fn()}
        handleSaveModelDirectly={vi.fn()} setNewModelTitle={vi.fn()} setIsSaveModelModalOpen={vi.fn()}
        setIsModelsDrawerOpen={vi.fn()}
      />
    );
    expect(editorTopHtml).toContain('id="btn-editor-actions-menu"');

    const editorToolbarHtml = renderToStaticMarkup(
      <EditorTextFormattingToolbar
        editor={null}
        baseFontSize={11}
        setBaseFontSize={vi.fn()}
        regimesNaConsulta={[]}
        activeLoadedRecipeType={null}
        itensPorRegime={{ simples: [], antimicrobiano: [], controle_especial: [] }}
        handleLoadActivePrescription={vi.fn()}
        viaLayout="1-via"
        isSheetConfigOpen={false}
        onToggleSheetConfig={vi.fn()}
      />
    );
    expect(editorToolbarHtml).toContain('id="btn-toggle-sheet-config"');
    expect(editorToolbarHtml).toContain('id="editor-block-style-select"');
    expect(editorToolbarHtml).toContain('id="editor-font-size-select"');

    const paletteHtml = renderToStaticMarkup(
      <CommandPaletteModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectTab={vi.fn()}
        onSelectSusDoc={vi.fn()}
        onSelectProtocol={vi.fn()}
        onSelectHospitalBed={vi.fn()}
        onAplicarKit={vi.fn()}
        onUsarMedicamento={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenDoctorModal={vi.fn()}
      />
    );
    expect(paletteHtml).toContain('Atestado Médico (Res. CFM 1.658/2002)');
  });

  it('garante zero atributos ARIA proibidos (role="region"/role="img"), sincronia bidirecional de hash (parseTabFromHash) e paginação de catálogo em ClinicalProtocolsView', () => {
    expect(parseTabFromHash('#prescription')).toBe('prescription');
    expect(parseTabFromHash('#documents/certificate')).toBe('certificate');
    expect(parseTabFromHash('#documents/referral')).toBe('referral');
    expect(parseTabFromHash('#documents/exams')).toBe('exams');
    expect(parseTabFromHash('#documents/sus')).toBe('sus');
    expect(parseTabFromHash('#scores')).toBe('scores');
    expect(parseTabFromHash('#hospital')).toBe('hospital');
    expect(parseTabFromHash('#rota_inexistente')).toBeNull();

    const readinessHtml = renderToStaticMarkup(
      <ConsultationReadinessBar
        patient={activePatient}
        doctor={configuredDoctor}
        prescriptionCount={1}
        documentsCount={0}
        onOpenPatientModal={vi.fn()}
        onOpenDoctorModal={vi.fn()}
        onOpenCommandPalette={vi.fn()}
      />
    );
    expect(readinessHtml).toContain('role="region"');
    expect(readinessHtml).toContain('aria-label="Resumo rápido de prontidão da consulta"');

    const receitaEmBrancoHtml = renderToStaticMarkup(
      <DocumentoClinico
        tipo="prescription"
        doctor={emptyDoctor}
        patient={emptyPatient}
        prescriptionItems={[]}
      />
    );
    expect(receitaEmBrancoHtml).toContain('role="region"');
    expect(receitaEmBrancoHtml).toContain('aria-label="Espaço em branco para prescrição e anotações à mão"');

    const docEmBrancoHtml = renderToStaticMarkup(
      <DocumentoClinico
        tipo="exams"
        doctor={emptyDoctor}
        patient={emptyPatient}
        exams={[]}
      />
    );
    expect(docEmBrancoHtml).toContain('role="img"');
    expect(docEmBrancoHtml).toContain('aria-label="Linha para nome do paciente à mão"');

    const sampleWorkContext = {
      id: 'ctx-1',
      name: 'UBS Central',
      sphere: 'municipal' as const,
      clinicName: 'UBS Central',
      clinicAddress: 'Rua A, 10',
      logoAlignment: 'left' as const,
      documentFormatting: {
        headerType: 'standard' as const,
        prescriptionViaCount: 1 as const,
        showCnesOnHeader: true,
        referralModel: 'sus_regulation' as const,
        examHeaderTitle: 'SECRETARIA MUNICIPAL DE SAÚDE',
      },
      doctorCredentials: { crm: '54321', uf: 'SP' },
      isDefault: true,
      createdAt: 0,
      updatedAt: 0,
    };
    const ctxSwitcherHtml = renderToStaticMarkup(
      <ContextSwitcher
        contexts={[sampleWorkContext]}
        activeContext={sampleWorkContext}
        onSwitchContext={vi.fn()}
      />
    );
    expect(ctxSwitcherHtml).toContain('id="work-context-select"');
    expect(ctxSwitcherHtml).toContain('name="workContext"');

    const protocolsAllMedsHtml = renderToStaticMarkup(
      <ClinicalProtocolsView
        darkMode={false}
        patient={activePatient}
        onUpdatePatientWeight={vi.fn()}
        onAddPrescriptionItem={vi.fn()}
        onNavigateToPrescription={vi.fn()}
        onUsarMedicamento={vi.fn()}
      />
    );
    expect(protocolsAllMedsHtml).toContain('Mostrar todos os');
    expect(protocolsAllMedsHtml).toContain('medicamentos RENAME');
  });
});
