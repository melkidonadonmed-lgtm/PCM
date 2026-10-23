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
  it('Header exibe botão Início unificado, barra de módulos visível a partir de lg (1024px) com atalhos Alt+1..5 e chips de Paciente e CRM', () => {
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
    expect(htmlUnconfigured).toContain('Identificar paciente');
    expect(htmlUnconfigured).toContain('Configurar CRM');

    // 2. Estado com médico configurado, paciente com peso, contadores ativos e botão Instalar visível no mobile
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

    expect(htmlConfigured).toContain('Carlos Eduardo Lima');
    expect(htmlConfigured).toContain('18,5 kg');
    expect(htmlConfigured).toContain('clinical-unit');
    expect(htmlConfigured).toContain('CRM 54321/SP');
    expect(htmlConfigured).toContain('aria-current="page"');
    expect(htmlConfigured).toContain('id="btn-header-install-pwa"');
    expect(htmlConfigured).toContain('aria-label="Instalar Aplicativo PresCMed"');
  });

  it('Sidebar mantém acabamento Deep Navy (.panel-navy), barra luminosa vertical (.sidebar-active-bar), permite tooltips flutuantes no modo recolhido (overflow-visible) e preserva botão PWA', () => {
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

    expect(htmlCollapsed).toContain('lg:w-[68px]');
    expect(htmlCollapsed).toContain('overflow-visible');
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
    expect(examsHtml).toContain('Exames no pedido (2)');

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
});
