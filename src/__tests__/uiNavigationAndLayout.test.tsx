import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { PrescriptionBuilder, resolveMedicationKeyAction } from '../components/PrescriptionBuilder';
import { ClinicalDocumentsHub } from '../components/ClinicalDocumentsHub';
import { PediatricCalculator } from '../components/PediatricCalculator';
import { ClinicalProtocolsView } from '../components/ClinicalProtocolsView';
import { ExamRequester } from '../components/ExamRequester';
import { CommandPaletteModal } from '../components/layout/CommandPaletteModal';
import { ConsultationReadinessBar } from '../components/bento/ConsultationReadinessBar';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { ActionButton } from '../components/ui/ActionButton';
import { Badge } from '../components/ui/Badge';
import { PRESCMED_TOKENS } from '../config/tokens';
import { runTabViewTransition } from '../hooks/useNavigationSync';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import { SUS_DOCUMENTS_CATALOG } from '../data/susDocumentsCatalog';
import { SusInteractiveVectorSheet } from '../components/sus/SusInteractiveVectorSheet';
import { PrescriptionModelsModal } from '../components/prescription/PrescriptionModelsModal';
import { PrescribedItemsList } from '../components/prescription/PrescribedItemsList';
import { PatientQuickCard } from '../components/prescription/PatientQuickCard';
import { LogoGeneratorModal } from '../components/LogoGeneratorModal';
import { EditorModelsAndStylesDrawer } from '../components/editor/EditorModelsAndStylesDrawer';
import { EditorTopActionsBar } from '../components/editor/EditorTopActionsBar';
import { EditorTextFormattingToolbar } from '../components/editor/EditorTextFormattingToolbar';
import { SusCatalogListView } from '../components/sus/SusCatalogListView';
import { CidSearchBar } from '../components/CidSearchBar';
import { registerModalInStack, getActiveModalStackSize } from '../hooks/useModalAccessibility';
import { clinicalRepository } from '../core/storage/clinicalRepository';
import type { DoctorProfile, Patient, PrescriptionItem, ExamItem, MedicalCertificate, MedicalReferral } from '../types';

const emptyDoctor: DoctorProfile = {
  name: '',
  crm: '',
  crmState: 'SP',
  specialty: '',
  clinicName: '',
  address: '',
  cityState: '',
  phone: '',
  email: '',
  showSignature: true
};

const configuredDoctor: DoctorProfile = {
  name: 'Dra. Helena Costa',
  crm: '54321',
  crmState: 'SP',
  specialty: 'Clínica Médica',
  clinicName: 'UBS Jardim Europa',
  address: 'Av. Brasil, 100',
  cityState: 'São Paulo - SP',
  phone: '(11) 99999-0000',
  email: 'helena@exemplo.med.br',
  showSignature: true
};

const emptyPatient: Patient = {
  id: 'pat-empty',
  name: '',
  weightKg: 0,
  gender: 'other',
  allergies: []
};

const activePatient: Patient = {
  id: 'pat-1',
  name: 'Carlos Eduardo Lima',
  documentNumber: '111.222.333-44',
  weightKg: 18.5,
  gender: 'male',
  allergies: []
};

const sampleItems: PrescriptionItem[] = [
  {
    id: 'rx-1',
    name: 'Dipirona 500 mg',
    presentation: 'comprimido',
    route: 'Uso Oral',
    quantity: '20 comprimidos',
    doseCalculatedText: '1 comprimido',
    frequencyText: 'Tomar 1 comprimido de 6 em 6 horas se dor ou febre.',
    scheduleInterval: '6/6h',
    scheduleTimes: [],
    instructions: 'Tomar 1 comprimido de 6 em 6 horas se dor ou febre.',
    isContinuous: false,
    isSpecialControl: false,
    regimeReceita: 'simples'
  }
];

const sampleExams: ExamItem[] = [
  { id: 'ex-1', name: 'Hemograma Completo', category: 'hematologia', selected: true, urgency: 'routine' },
  { id: 'ex-2', name: 'Glicemia de Jejum', category: 'bioquimica', selected: true, urgency: 'routine' }
];

const defaultCertificate: MedicalCertificate = {
  patientName: 'Carlos Eduardo Lima',
  documentNumber: '111.222.333-44',
  daysOff: 2,
  startDate: '2026-10-13',
  endDate: '2026-10-14',
  periodText: 'por motivo de saúde',
  includeCID: false,
  cid10Code: '',
  cid10Description: '',
  observations: ''
};

const defaultReferral: MedicalReferral = {
  patientName: 'Carlos Eduardo Lima',
  documentNumber: '111.222.333-44',
  destinationSpecialty: 'Cardiologia',
  reason: 'Avaliação especializada',
  clinicalSummary: '',
  relevantExams: '',
  hypothesisCID: '',
  priority: 'eletivo'
};

describe('UI/UX Minimalista, Organização e Navegação Fluida', () => {
  it('Header exibe botão Início unificado, barra de módulos visível a partir de lg (1024px) com atalhos Alt+1..6 e mantém frente limpa sem duplicar Paciente e CRM', () => {
    // 1. Estado inicial sem médico nem paciente configurados
    const htmlUnconfigured = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        onGoHome={vi.fn()}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        patient={emptyPatient}
        onOpenPatientModal={vi.fn()}
        doctor={emptyDoctor}
        onOpenDoctorModal={vi.fn()}
        prescriptionCount={0}
        selectedExamsCount={0}
      />
    );

    expect(htmlUnconfigured).toContain('aria-label="Início"');
    expect(htmlUnconfigured).toContain('aria-label="Navegação rápida entre áreas clínicas"');
    expect(htmlUnconfigured).toContain('hidden lg:flex');
    expect(htmlUnconfigured).toContain('nav-segmented-track');
    expect(htmlUnconfigured).toContain('nav-segmented-pill-active');
    expect(htmlUnconfigured).toContain('Alt+1');
    expect(htmlUnconfigured).toContain('Alt+6');
    expect(htmlUnconfigured).toContain('Guias SUS');
    expect(htmlUnconfigured).not.toContain('id="header-patient-chip"');
    expect(htmlUnconfigured).not.toContain('id="header-doctor-chip"');

    // 2. Estado com paciente com peso, contadores ativos e botão Instalar visível
    const htmlConfigured = renderToStaticMarkup(
      <Header
        darkMode={true}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        onGoHome={vi.fn()}
        activeTab="documents"
        onSelectTab={vi.fn()}
        patient={activePatient}
        onOpenPatientModal={vi.fn()}
        doctor={configuredDoctor}
        onOpenDoctorModal={vi.fn()}
        prescriptionCount={3}
        selectedExamsCount={2}
        isInstallable={true}
        onInstallApp={vi.fn()}
      />
    );

    expect(htmlConfigured).toContain('18.5kg');
    expect(htmlConfigured).toContain('clinical-unit');
    expect(htmlConfigured).toContain('aria-current="page"');
    expect(htmlConfigured).toContain('id="btn-header-install-pwa"');
    expect(htmlConfigured).toContain('aria-label="Instalar Aplicativo PresCMed"');
    expect(htmlConfigured).not.toContain('id="header-doctor-chip"');
  });

  it('Sidebar mantém acabamento Deep Navy (.panel-navy), cards de Médico e Paciente (#sidebar-patient-chip), barra luminosa vertical (.sidebar-active-bar), tooltips no modo recolhido e botão PWA', () => {
    const htmlExpanded = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        onClose={vi.fn()}
        doctor={configuredDoctor}
        patient={activePatient}
        prescriptionCount={1}
        selectedExamsCount={2}
        onOpenDoctorModal={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onClearPrescription={vi.fn()}
        onClearPatient={vi.fn()}
        onResetAll={vi.fn()}
        onAplicarKit={vi.fn()}
        isInstallable={true}
        onInstallApp={vi.fn()}
      />
    );

    expect(htmlExpanded).toContain('panel-navy');
    expect(htmlExpanded).toContain('sidebar-active-surface');
    expect(htmlExpanded).toContain('sidebar-active-bar');
    expect(htmlExpanded).toContain('id="sidebar-patient-chip"');
    expect(htmlExpanded).toContain('Carlos Eduardo Lima');
    expect(htmlExpanded).toContain('18,5 kg');
    expect(htmlExpanded).toContain('Guias Oficiais SUS');
    expect(htmlExpanded).toContain('MOD-01 Ativo');
    expect(htmlExpanded).toContain('Novo Atendimento');
    expect(htmlExpanded).toContain('Backup (.pcm)');
    expect(htmlExpanded).toContain('id="btn-sidebar-install-pwa"');
    expect(htmlExpanded).toContain('Instalar App');
    expect(htmlExpanded).toContain('Recolher Menu');
    expect(htmlExpanded).not.toContain('Paciente em Atendimento');

    const htmlCollapsed = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={false}
        onToggleOpen={vi.fn()}
        onClose={vi.fn()}
        doctor={configuredDoctor}
        patient={emptyPatient}
        prescriptionCount={1}
        selectedExamsCount={2}
        onOpenDoctorModal={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onClearPrescription={vi.fn()}
        onClearPatient={vi.fn()}
        onResetAll={vi.fn()}
        onAplicarKit={vi.fn()}
        isInstallable={true}
        onInstallApp={vi.fn()}
      />
    );

    expect(htmlCollapsed).toContain('lg:w-16');
    expect(htmlCollapsed).toContain('overflow-visible');
    expect(htmlCollapsed).toContain('id="sidebar-patient-chip"');
    expect(htmlCollapsed).toContain('Identificar paciente');
    expect(htmlCollapsed).toContain('Instalar App');
  });

  it('PrescriptionBuilder unifica a busca e seleção em um único combobox (#med-search-input), inclui atalho de Exames e bancada A4 sticky', () => {
    const html = renderToStaticMarkup(
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

    // Combobox único de fármaco sem o antigo input duplicado #presc-farmaco-input
    expect(html).toContain('id="med-search-input"');
    expect(html).toContain('role="combobox"');
    expect(html).not.toContain('id="presc-farmaco-input"');

    // Atalhos rápidos para outros documentos do paciente (Atestado, Encaminhamento e Exames)
    expect(html).toContain('Atestado');
    expect(html).toContain('Encaminhamento');
    expect(html).toContain('Exames');

    // Bancada A4 sticky no desktop e superfície padronizada
    expect(html).toContain('xl:sticky xl:top-20');
    expect(html).toContain('card-surface');

    // Formulário limpo: sem seletor manual de tipo de receita, sem pílulas de quantidade quebrada e sem dropdown de posologia padrão
    expect(html).not.toContain('Tipo de receita:');
    expect(html).not.toContain('Atalhos de dispensação');
    expect(html).not.toContain('Selecionar posologia padrão');
    expect(html).not.toContain('comp (comprimido)');
    expect(html).not.toContain('8/8h (3x/dia)');
    expect(html).toContain('id="presc-duration-input"');
    expect(html).toContain('id="presc-quantity-input"');
    expect(html).toContain('>Comprimido<');
    expect(html).toContain('>8/8h<');
    expect(html).toContain('>3x ao dia<');
  });

  it('resolveMedicationKeyAction protege medicamentos personalizados contra sobrescrita acidental no Enter quando nenhuma opção foi destacada', () => {
    const suggestions = UNIFIED_MEDICATIONS.slice(0, 3);

    // 1. Médico digita "Dipirona 1 g" (dose livre fora do catálogo) e aperta Enter sem usar ArrowDown (highlightedIndex = -1)
    const enterWithoutHighlight = resolveMedicationKeyAction('Enter', true, suggestions, -1, 'Dipirona 1 g');
    expect(enterWithoutHighlight).toEqual({ type: 'dismiss' });

    // 2. Se o médico pressionar ArrowDown, destaca o índice 0
    const arrowDownFirst = resolveMedicationKeyAction('ArrowDown', true, suggestions, -1, 'Dipirona');
    expect(arrowDownFirst).toEqual({ type: 'highlight', nextIndex: 0 });

    // 3. Com índice 0 destacado, Enter seleciona explicitamente a sugestão destacada
    const enterWithHighlight = resolveMedicationKeyAction('Enter', true, suggestions, 0, 'Dipirona');
    expect(enterWithHighlight).toEqual({ type: 'select', medication: suggestions[0] });

    // 4. Se o nome digitado for idêntico ao nome de um item do catálogo, Enter seleciona mesmo sem seta
    const exactName = suggestions[1].name;
    const enterExactMatch = resolveMedicationKeyAction('Enter', true, suggestions, -1, exactName);
    expect(enterExactMatch).toEqual({ type: 'select', medication: suggestions[1] });

    // 5. Escape fecha a lista
    const escapeAction = resolveMedicationKeyAction('Escape', true, suggestions, 0, 'Dipirona');
    expect(escapeAction).toEqual({ type: 'dismiss' });
  });

  it('ClinicalDocumentsHub, MobileBottomNav, PediatricCalculator, ClinicalProtocolsView e ExamRequester seguem DESIGN.md e usam <Icon />', () => {
    const hubHtml = renderToStaticMarkup(
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
        clinicalIndication="Check-up"
        onUpdateClinicalIndication={vi.fn()}
        initialSubTab="exams"
        onNavigateToPrint={vi.fn()}
      />
    );

    expect(hubHtml).toContain('material-symbols-outlined');
    expect(hubHtml).toContain('id="clinical-doc-tab-certificate"');
    expect(hubHtml).toContain('id="clinical-doc-tab-referral"');
    expect(hubHtml).toContain('id="clinical-doc-tab-exams"');
    expect(hubHtml).toContain('id="clinical-doc-tab-sus"');
    expect(hubHtml).toContain('Central de documentos clínicos');
    expect(hubHtml).toContain('placeholder="Ex.: Hemograma, PCR, Dengue, Ureia, Raio-X, ECG..."');

    const pediaHtml = renderToStaticMarkup(
      <PediatricCalculator
        darkMode={false}
        patient={activePatient}
        onUpdatePatientWeight={vi.fn()}
        onAddPrescriptionItem={vi.fn()}
        onNavigateToPrescription={vi.fn()}
      />
    );
    expect(pediaHtml).toContain('Calculadora de doses pediátricas');
    expect(pediaHtml).toContain('placeholder="Ex.: Paracetamol, Amoxicilina, Dipirona, Ondansetrona..."');

    const protocolsHtml = renderToStaticMarkup(
      <ClinicalProtocolsView
        darkMode={false}
        patient={activePatient}
        onUpdatePatientWeight={vi.fn()}
        onAddPrescriptionItem={vi.fn()}
        onNavigateToPrescription={vi.fn()}
        onUsarMedicamento={vi.fn()}
      />
    );
    expect(protocolsHtml).toContain('Protocolos clínicos por patologia');
    expect(protocolsHtml).toContain('btn-tactile-secondary');
    expect(protocolsHtml).not.toContain('tactile-card-interactive');

    const examsHtml = renderToStaticMarkup(
      <ExamRequester
        darkMode={false}
        patient={activePatient}
        selectedExams={sampleExams}
        onUpdateSelectedExams={vi.fn()}
        clinicalIndication=""
        onUpdateClinicalIndication={vi.fn()}
        onNavigateToPrint={vi.fn()}
      />
    );
    expect(examsHtml).toContain('Solicitação de exames complementares');
    expect(examsHtml).toContain('Seleção de exames individuais');
    expect(examsHtml).toContain('id="btn-exam-packages-menu"');
    expect(examsHtml).toContain('aria-haspopup="dialog"');
    expect(examsHtml).toContain('Kits e painéis prontos');
    expect(examsHtml).toContain('Exames no pedido (2)');
    expect(examsHtml).not.toContain('Painéis e pacotes clínicos:');

    const mobileHtml = renderToStaticMarkup(
      <MobileBottomNav
        activeTab="prescription"
        sidebarOpen={false}
        onSelectTab={vi.fn()}
        prescriptionCount={1}
        selectedExamsCount={2}
        onOpenMenu={vi.fn()}
      />
    );

    expect(mobileHtml).toContain('panel-navy');
    expect(mobileHtml).toContain('material-symbols-outlined');
  });

  it('Arquitetura Atômica v5.0 (SurfaceCard, ActionButton, Badge, ConsultationReadinessBar, CommandPaletteModal e useNavigationSync) opera com estados FSM e tabular-nums', () => {
    expect(PRESCMED_TOKENS.purpose).toBe('medtech_clinico');
    const mockCallback = vi.fn();
    runTabViewTransition(mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    const readinessHtml = renderToStaticMarkup(
      <ConsultationReadinessBar
        patient={activePatient}
        doctor={configuredDoctor}
        prescriptionCount={2}
        documentsCount={3}
        onOpenPatientModal={vi.fn()}
        onOpenDoctorModal={vi.fn()}
        onOpenCommandPalette={vi.fn()}
      />
    );
    expect(readinessHtml).toContain('Resumo rápido de prontidão da consulta');
    expect(readinessHtml).toContain('18,5 kg');
    expect(readinessHtml).toContain('Ctrl+K');

    const paletteHtml = renderToStaticMarkup(
      <CommandPaletteModal
        isOpen={true}
        onClose={vi.fn()}
        onSelectTab={vi.fn()}
        onAplicarKit={vi.fn()}
        onUsarMedicamento={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenDoctorModal={vi.fn()}
      />
    );
    expect(paletteHtml).toContain('Busca Rápida e Navegação Global');
    expect(paletteHtml).toContain('id="global-command-palette-input"');

    const primitivesHtml = renderToStaticMarkup(
      <SurfaceCard title="Bloco Clínico" eyebrow="Status" state="idle">
        <Badge tone="clinical" tabular>15 comp</Badge>
        <ActionButton variant="primary" isLoading={false}>Confirmar</ActionButton>
      </SurfaceCard>
    );
    expect(primitivesHtml).toContain('data-state="idle"');
    expect(primitivesHtml).toContain('clinical-tabular-nums');
    expect(primitivesHtml).toContain('Confirmar');

    // Validação da Grade Vetorial Interativa SUS (.sus-grid 12 colunas) e Fundação Multi-Módulo
    const modules = clinicalRepository.listModules();
    expect(modules.map((m) => m.id)).toEqual(['prescription', 'evolution_pep', 'hospital']);
    expect(clinicalRepository.getActiveModule()).toBe('prescription');

    const apacComp = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'apac_complementar')!;
    const vectorHtml = renderToStaticMarkup(
      <SusInteractiveVectorSheet
        docItem={apacComp}
        formData={{
          doctorName: configuredDoctor.name,
          doctorCrm: configuredDoctor.crm,
          doctorCrmState: configuredDoctor.crmState,
          doctorSpecialty: configuredDoctor.specialty,
          doctorClinicName: configuredDoctor.clinicName,
          doctorCnes: '1234567',
          patientName: activePatient.name,
          patientCns: '700000000000001',
          patientCpf: '111.222.333-44',
          patientBirthDate: '1990-01-01',
          patientAge: '36',
          patientGender: 'male',
          patientMotherName: 'Maria Lima',
          patientPhone: '(11) 99999-0000',
          patientAddress: 'Rua A, 10',
          patientNeighborhood: 'Centro',
          patientCity: 'São Paulo',
          patientState: 'SP',
          patientCep: '01000-000',
        }}
        onFieldChange={vi.fn()}
      />
    );
    expect(vectorHtml).toContain('1 - Nome do Estabelecimento de Saúde Solicitante');
    expect(vectorHtml).toContain('16 - Código SIGTAP');
    expect(vectorHtml).toContain('21 - Creatinina Sérica (mg/dL)');
    expect(vectorHtml).toContain('Carlos Eduardo Lima');
  });

  it('valida casos de borda de acessibilidade (WAI-ARIA), FSM data-state canônico e invariante Sem peso, sem dose (weightKg = 0)', () => {
    const zeroWeightPatient: Patient = {
      ...activePatient,
      weightKg: 0,
    };

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
      {
        ...sampleItems[0],
        id: 'rx-2',
        name: 'Paracetamol 500 mg',
      },
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
    expect(populatedListHtml).not.toContain('py-0.2');

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
    expect(patientCardHtml).not.toContain('data-state="pressed"');

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

    // 1. Usuário foca botão na página e abre modal pai (ex.: DoctorProfileModal)
    pageTriggerBtn.focus();
    const cleanupParent = registerModalInStack({
      getOnClose: () => onCloseParent,
      getContainer: () => parentContainer,
      getInitialFocus: () => parentFirstInput,
      doc: fakeDoc,
      win: fakeWin,
    });
    expect(getActiveModalStackSize()).toBe(1);

    // 2. Usuário foca botão interno do modal pai e abre submodal (ex.: LogoGeneratorModal / ConfirmationModal)
    parentSubModalBtn.focus();
    const cleanupChild = registerModalInStack({
      getOnClose: () => onCloseChild,
      getContainer: () => childContainer,
      getInitialFocus: () => childFirstBtn,
      doc: fakeDoc,
      win: fakeWin,
    });
    expect(getActiveModalStackSize()).toBe(2);

    // 3. Ciclo de Tab e Shift+Tab no modal filho (Focus Trap)
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

    // 4. Pressionar Escape com submodal aberto fecha APENAS o submodal (não o modal pai)
    const escape1 = {
      key: 'Escape',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
    } as unknown as KeyboardEvent;
    keydownListeners.forEach((fn) => fn(escape1));
    expect(onCloseChild).toHaveBeenCalledTimes(1);
    expect(onCloseParent).not.toHaveBeenCalled();

    // 5. Desmontar submodal restaura o foco para o botão dentro do modal pai
    cleanupChild();
    expect(getActiveModalStackSize()).toBe(1);
    expect(currentActive).toBe(parentSubModalBtn);

    // 6. Pressionar Escape novamente fecha o modal pai e restaura o foco para o botão original da página
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
      <LogoGeneratorModal
        isOpen={true}
        onClose={vi.fn()}
        activeContext={null}
        doctor={configuredDoctor}
      />
    );
    expect(logoModalHtml).toContain('role="dialog"');
    expect(logoModalHtml).toContain('aria-modal="true"');
    expect(logoModalHtml).toContain('aria-labelledby="logo-modal-title"');
    expect(logoModalHtml).toContain('aria-label="Fechar gerador de logotipo"');

    const editorDrawerHtml = renderToStaticMarkup(
      <EditorModelsAndStylesDrawer
        isModelsDrawerOpen={true}
        setIsModelsDrawerOpen={vi.fn()}
        drawerTab="padrao"
        setDrawerTab={vi.fn()}
        savedTemplates={[]}
        filteredSavedTemplates={[]}
        customStyles={[]}
        templateSearch=""
        setTemplateSearch={vi.fn()}
        applyPresetTemplate={vi.fn()}
        currentModel={{
          id: 'doc-1',
          title: 'Rascunho',
          isPreset: false,
        }}
        setNewModelTitle={vi.fn()}
        setIsSaveModelModalOpen={vi.fn()}
        editingTemplateId={null}
        editingTemplateTitle=""
        setEditingTemplateTitle={vi.fn()}
        handleSaveRename={vi.fn()}
        setEditingTemplateId={vi.fn()}
        handleStartRename={vi.fn()}
        handleDeleteTemplate={vi.fn()}
        handleApplyTemplate={vi.fn()}
        setNewStyleTitle={vi.fn()}
        setIsSaveStyleModalOpen={vi.fn()}
        handleDeleteCustomStyle={vi.fn()}
        handleApplyStyle={vi.fn()}
        isSaveModelModalOpen={true}
        handleSaveAsTemplate={vi.fn()}
        newModelTitle=""
        activeContext={null}
        saveAsGlobal={true}
        setSaveAsGlobal={vi.fn()}
        isSaveStyleModalOpen={true}
        handleSaveCustomStyle={vi.fn()}
        newStyleTitle=""
        fontFamilyId="inter"
        baseFontSize={11}
        pageOrientation="portrait"
        viaLayout="1-via"
        headerConfig={{
          showHeader: true,
          showFooter: true,
          showPatientBanner: true,
          clinicName: '',
          clinicAddress: '',
          doctorName: '',
          doctorCrm: '',
          doctorSpecialty: '',
          badgeText: 'RECEITUÁRIO',
          dateText: '',
          footerDocName: '',
          footerCrm: '',
          footerSpecialty: '',
          footerSubtext: '',
          patientCustomText: '',
        }}
      />
    );
    expect(editorDrawerHtml).toContain('aria-labelledby="editor-models-drawer-title"');
    expect(editorDrawerHtml).toContain('aria-labelledby="editor-save-model-modal-title"');
    expect(editorDrawerHtml).toContain('aria-labelledby="editor-save-style-modal-title"');
    expect(editorDrawerHtml).toContain('placeholder="Ex.: Relatório médico, atestado, encaminhamento..."');
    expect(editorDrawerHtml).toContain('placeholder="Ex.: Laudo Cardiológico - Policlínica"');
    expect(editorDrawerHtml).toContain('placeholder="Ex.: Minha Clínica • 2 Vias Azul"');
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
    expect(susCatalogHtml).toContain('aria-label="Buscar exame ou documento SUS"');
    expect(susCatalogHtml).toContain('placeholder="Ex.: APAC, LME, Tomografia, Mamografia, Dengue..."');
    expect(susCatalogHtml).toContain('APAC Laudo Principal');
    expect(susCatalogHtml).toContain('Impresso MS');
    expect(susCatalogHtml).not.toContain('line-clamp-3');

    const cidSearchHtml = renderToStaticMarkup(
      <CidSearchBar
        darkMode={false}
        onSelectCid={vi.fn()}
      />
    );
    expect(cidSearchHtml).toContain('placeholder="Ex.: Asma, Lombalgia, J00, Dengue, A09, Cefaleia, ITU..."');
  });

  it('previne sobreposição no Header (shrink-0 + min-w-0), vazamento horizontal no rodapé da Sidebar, fonte incorreta no + CPF e Peso e desalinhamento de altura na posologia (h-11 min-h-[44px])', () => {
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
    // Nav central deve permitir encolhimento seguro (min-w-0 overflow-x-auto) e o cluster direito nunca deve encolher sobre as abas (shrink-0 justify-end)
    expect(headerHtml).toContain('nav-segmented-track min-w-0 max-w-full overflow-x-auto');
    expect(headerHtml).toContain('flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end');
    expect(headerHtml).not.toContain('min-w-0 flex-1 lg:flex-initial justify-end');

    // Quando a Sidebar está aberta no desktop (isSidebarOpen={true}), CRM e Instalar App ficam ocultos no Header (lg:hidden) para liberar espaço para as 6 abas centrais
    const headerWithOpenSidebarHtml = renderToStaticMarkup(
      <Header
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={true}
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
    expect(headerWithOpenSidebarHtml).toContain('lg:hidden');

    // Rodapé da Sidebar aberta deve conter min-w-0 flex-1 nos botões Backup e Instalar App para nunca vazar da borda direita
    const sidebarHtml = renderToStaticMarkup(
      <Sidebar
        darkMode={false}
        onToggleDarkMode={vi.fn()}
        activeTab="prescription"
        onSelectTab={vi.fn()}
        isOpen={true}
        onToggleOpen={vi.fn()}
        onClose={vi.fn()}
        doctor={configuredDoctor}
        patient={activePatient}
        prescriptionCount={1}
        selectedExamsCount={0}
        onOpenDoctorModal={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onOpenBackupModal={vi.fn()}
        onClearPrescription={vi.fn()}
        onClearPatient={vi.fn()}
        onResetAll={vi.fn()}
        onAplicarKit={vi.fn()}
        isInstallable={true}
        onInstallApp={vi.fn()}
      />
    );
    expect(sidebarHtml).toContain('flex-1 min-w-0 h-8 px-1 rounded-xl');
    expect(sidebarHtml).toContain('lg:w-64');

    // PatientQuickCard com campos extras recolhidos e paciente sem peso: botão "+ CPF e Peso" usa fonte sans-serif (clinical-tabular-nums) e não monospace (clinical-unit), e input do paciente possui largura mínima garantida (min-w-48)
    const patientNoWeightHtml = renderToStaticMarkup(
      <PatientQuickCard
        patient={emptyPatient}
        showExtraPatientFields={false}
        onToggleExtraFields={vi.fn()}
        onUpdatePatient={vi.fn()}
        onOpenPatientModal={vi.fn()}
      />
    );
    expect(patientNoWeightHtml).toContain('+ CPF e Peso');
    expect(patientNoWeightHtml).toContain('whitespace-nowrap clinical-tabular-nums');
    expect(patientNoWeightHtml).not.toContain('clinical-unit">+ CPF e Peso');
    expect(patientNoWeightHtml).toContain('flex-1 min-w-48');

    // MedicationComposerCard via PrescriptionBuilder: textarea #presc-posology-textarea e botão + Inserir na receita compartilham h-11 min-h-[44px] sem barra de rolagem interna (overflow-hidden)
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
    expect(builderHtml).toContain('overflow-hidden');
  });

  it('previne encavalamento de textos no PatientQuickCard, corte das abas na Central de Documentos e excesso de pílulas de CID-10 no mobile', () => {
    // 1. Central de Documentos: grade 2x2 no mobile (grid grid-cols-2 sm:flex) para exibir todas as 4 abas sem cortar "Pedidos de exames" ou ocultar "Documentos SUS"
    const hubHtml = renderToStaticMarkup(
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
        initialSubTab="certificate"
        onNavigateToPrint={vi.fn()}
      />
    );
    expect(hubHtml).toContain('grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 rounded-2xl nav-segmented-track');

    // 2. PatientQuickCard: cabeçalho com flex-wrap (evita colisão entre badge "Sincronizado" e "Ocultar CPF / Peso") e atalhos em grid-cols-2 sm:flex sem shrink-0 estourando o card
    const patientSyncHtml = renderToStaticMarkup(
      <PatientQuickCard
        patient={activePatient}
        showExtraPatientFields={true}
        onToggleExtraFields={vi.fn()}
        onUpdatePatient={vi.fn()}
        onOpenPatientModal={vi.fn()}
        onRequestClearPatient={vi.fn()}
        onNavigateToCertificate={vi.fn()}
        onNavigateToReferral={vi.fn()}
        onNavigateToExams={vi.fn()}
        onNavigateToSus={vi.fn()}
      />
    );
    expect(patientSyncHtml).toContain('flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5');
    expect(patientSyncHtml).toContain('grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto min-w-0');
    expect(patientSyncHtml).toContain('Sincronizado');
    expect(patientSyncHtml).toContain('Ocultar CPF / Peso');

    // 3. CidSearchBar: substitui o bloco de 10 pílulas soltas pelo botão compacto que abre pop-up em lista (#btn-cid-frequent-popup)
    const cidHtml = renderToStaticMarkup(
      <CidSearchBar
        darkMode={false}
        onSelectCid={vi.fn()}
        showQuickChips={true}
      />
    );
    expect(cidHtml).toContain('id="btn-cid-frequent-popup"');
    expect(cidHtml).toContain('aria-haspopup="dialog"');
    expect(cidHtml).toContain('Diagnósticos frequentes');
    expect(cidHtml).not.toContain('Diagnósticos Mais Frequentes (1 clique):');

    // 4. Editor A4 (Google Docs Mobile-First): barra superior compacta em 1 linha (#btn-editor-actions-menu) e ajustes de folha retráteis (#btn-toggle-sheet-config)
    const editorTopHtml = renderToStaticMarkup(
      <EditorTopActionsBar
        doctor={configuredDoctor}
        currentModel={{ id: 'doc-1', title: 'Receituário Clínico', isPreset: false }}
        isEditingModelTitle={false}
        setIsEditingModelTitle={vi.fn()}
        tempModelTitle="Receituário Clínico"
        setTempModelTitle={vi.fn()}
        handleSaveCurrentModelTitle={vi.fn()}
        saveStatus="saved"
        lastSavedTime="12:30"
        isExportingPdf={false}
        savedTemplates={[]}
        onNavigateBack={vi.fn()}
        syncWithActivePrescription={vi.fn()}
        handlePrint={vi.fn()}
        handleDownloadPdf={vi.fn()}
        handleLoadActivePrescription={vi.fn()}
        handleLoadActiveReferral={vi.fn()}
        handleLoadActiveCertificate={vi.fn()}
        handleStartNewDocument={vi.fn()}
        handleSaveModelDirectly={vi.fn()}
        setNewModelTitle={vi.fn()}
        setIsSaveModelModalOpen={vi.fn()}
        setIsModelsDrawerOpen={vi.fn()}
      />
    );
    expect(editorTopHtml).toContain('id="btn-editor-actions-menu"');
    expect(editorTopHtml).toContain('Receituário Clínico');

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
    expect(editorToolbarHtml).toContain('Folha &amp; Timbrado');
    expect(editorToolbarHtml).toContain('1 Via');
  });
});
