import React, { Suspense } from 'react';
import { PrescriptionBuilder } from '../PrescriptionBuilder';
import type { DocumentsSubTab } from '../ClinicalDocumentsHub';
import {
  ActiveTab,
  DoctorProfile,
  ExamItem,
  LgpdConsentPreferences,
  MedicalCertificate,
  MedicalReferral,
  Patient,
  PrescriptionItem,
  SusDocumentId,
  WorkContext,
} from '../../types';
import type {
  HospitalBedPatientRecord,
  HospitalBedScoreEntry,
} from '../../core/domain/clinicalEntities';
import type { HospitalSubViewId } from '../hospital/HospitalWardModuleView';
import type { DashboardMetricSource } from '../hospital/HospitalLabsAndAnalyticsPanel';
import { UnifiedMedication } from '../../data/medicationDatabase';
import { ConsultationReadinessBar } from '../bento/ConsultationReadinessBar';
import { AsyncErrorBoundary } from '../AsyncErrorBoundary';
import { LgpdLocalModeNotice } from '../lgpd/LgpdLocalModeNotice';
import type { DoctorUserProfile } from '../../services/cloud/cloudAuthService';
import type { TipoDocumento } from '../../utils/documentoClinico';
import {
  AppGlobalModalsAndOverlays,
  AppGlobalModalsAndOverlaysProps,
  useAppLgpdAndCloudGovernance,
  UseAppLgpdAndCloudGovernanceParams,
  useAppThemeAndSidebarViewport,
} from './AppGlobalModalsAndOverlays';

export {
  AppGlobalModalsAndOverlays,
  useAppLgpdAndCloudGovernance,
  useAppThemeAndSidebarViewport,
};
export type { AppGlobalModalsAndOverlaysProps, UseAppLgpdAndCloudGovernanceParams };

// Carregamento sob demanda com retry resiliente contra falhas de rede ou cache antigo
export const loadDocumentEditor = (): Promise<typeof import('../DocumentEditorView')> =>
  import('../DocumentEditorView').catch((err) => {
    console.warn('[PresCMed] Tentando carregar Editor novamente após falha inicial:', err);
    return new Promise<typeof import('../DocumentEditorView')>((resolve) =>
      setTimeout(() => resolve(import('../DocumentEditorView')), 400)
    );
  });

const DocumentEditorView = React.lazy(loadDocumentEditor);
const PrintPreview = React.lazy(() => import('../PrintPreview'));
const PediatricCalculator = React.lazy(() =>
  import('../PediatricCalculator').then((m) => ({ default: m.PediatricCalculator }))
);
const ClinicalDocumentsHub = React.lazy(() =>
  import('../ClinicalDocumentsHub').then((m) => ({ default: m.ClinicalDocumentsHub }))
);
const ClinicalProtocolsView = React.lazy(() =>
  import('../ClinicalProtocolsView').then((m) => ({ default: m.ClinicalProtocolsView }))
);
const ScoreboardModuleView = React.lazy(() =>
  import('../scores/ScoreboardModuleView').then((m) => ({ default: m.ScoreboardModuleView }))
);
const HospitalWardModuleView = React.lazy(() =>
  import('../hospital/HospitalWardModuleView').then((m) => ({ default: m.HospitalWardModuleView }))
);

const ONCOLOGY_SCREENING_EXAM_LABELS: Record<string, string> = {
  mamografia: 'Mamografia Bilateral para Rastreamento (SIGTAP 02.04.03.018-8)',
  'usg-mamas': 'Ultrassonografia de Mamas Bilateral (SIGTAP 02.05.02.009-7)',
  papanicolaou: 'Exame Citopatológico Cervicovaginal / Papanicolaou (SIGTAP 02.03.01.008-6)',
  psa: 'Dosagem de PSA Total e Livre (SIGTAP 02.02.03.010-5)',
};

export function buildOncologyScreeningExamItem(examId: string): ExamItem | null {
  const cleanId = (examId || '').trim().toLowerCase();
  const examName = ONCOLOGY_SCREENING_EXAM_LABELS[cleanId];
  if (!examName) return null;

  return {
    id: cleanId,
    category: 'Rastreamento Oncológico (INCA/SUS)',
    name: examName,
    selected: true,
    urgency: 'routine',
  };
}

export function resolveActiveDocumentsSubTab(
  activeTab: ActiveTab,
  documentsSubTab: DocumentsSubTab
): DocumentsSubTab {
  if (activeTab === 'certificate') return 'certificate';
  if (activeTab === 'referral') return 'referral';
  if (activeTab === 'exams') return 'exams';
  if (activeTab === 'sus') return 'sus';
  return documentsSubTab;
}

export interface AppModuleWorkspaceSectionProps {
  darkMode: boolean;
  activeTab: ActiveTab;
  documentsSubTab: DocumentsSubTab;
  returnNavigationTab: ActiveTab;
  printDocType: TipoDocumento;
  doctor: DoctorProfile;
  setDoctor: React.Dispatch<React.SetStateAction<DoctorProfile>>;
  patient: Patient;
  setPatient: React.Dispatch<React.SetStateAction<Patient>>;
  activeContext: WorkContext | null;
  saveContext: (ctx: WorkContext) => Promise<void>;
  prescriptionItems: PrescriptionItem[];
  setPrescriptionItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
  selectedExams: ExamItem[];
  setSelectedExams: React.Dispatch<React.SetStateAction<ExamItem[]>>;
  examIndication: string;
  setExamIndication: React.Dispatch<React.SetStateAction<string>>;
  certificate: MedicalCertificate;
  setCertificate: React.Dispatch<React.SetStateAction<MedicalCertificate>>;
  referral: MedicalReferral;
  setReferral: React.Dispatch<React.SetStateAction<MedicalReferral>>;
  lgpdConsent: LgpdConsentPreferences;
  cloudUser: DoctorUserProfile | null;
  documentsBadgeCount: number;
  initialSusDocId: SusDocumentId | null;
  susCatalogResetTrigger: number;
  editorInitialSyncTrigger: number;
  editorCustomDoc: {
    html: string;
    title: string;
    type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom';
  } | null;
  selectedScoreboardId: string | null;
  medicamentoPendente: UnifiedMedication | null;
  setMedicamentoPendente: React.Dispatch<React.SetStateAction<UnifiedMedication | null>>;
  protocolSearchQuery: string | null;
  hospitalBeds: HospitalBedPatientRecord[];
  activeHospitalBedId: string;
  setActiveHospitalBedId: React.Dispatch<React.SetStateAction<string>>;
  hospitalSubView: HospitalSubViewId;
  setHospitalSubView: React.Dispatch<React.SetStateAction<HospitalSubViewId>>;
  hospitalDashboardMetricSource: DashboardMetricSource;
  hospitalDashboardScoreAcronym: string | null;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  handleSelectTab: (tab: ActiveTab) => void;
  handleDocumentsSubTabChange: (subTab: DocumentsSubTab) => void;
  handleNavigateToPrint: (type?: TipoDocumento) => void;
  handleNavigateToEditor: () => void;
  handleNavigateToCertificate: () => void;
  handleNavigateToReferral: () => void;
  handleNavigateToExams: () => void;
  handleNavigateToSus: () => void;
  handleNavigateToEditorWithHtml: (
    html: string,
    title: string,
    type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom'
  ) => void;
  handleOpenDoctorModal: () => void;
  handleOpenPatientModal: () => void;
  handleOpenBackupModal: () => void;
  handleOpenLgpdModal: () => void;
  handleOpenCommandPalette: () => void;
  handleSanitizeShiftData: () => void;
  handleDismissNoLoginNotice: () => void;
  handleToggleWeightCalc: (enabled: boolean) => void;
  handleUpdatePatientWeight: (newWeight: number) => void;
  handleAddPrescriptionItem: (newItem: PrescriptionItem) => void;
  handleClearPrescription: () => void;
  handleClearPatient: () => void;
  handleUsarMedicamento: (med: UnifiedMedication) => void;
  handleAddExamFromScoreboard: (examId: string) => void;
  handleUpdateHospitalBed: (updatedBed: HospitalBedPatientRecord) => void;
  handleCreateHospitalBed: (newBed: HospitalBedPatientRecord) => void;
  handleDeleteHospitalBed: (bedId: string) => void;
  handleRecordScoreToHospitalBed: (
    bedId: string,
    entry: HospitalBedScoreEntry,
    options?: { appendConductToBed?: boolean }
  ) => void;
  handleNavigateToHospitalDashboardFromScore: (bedId: string, scoreAcronym: string) => void;
  handleOpenScoreboardForBed: (bed: HospitalBedPatientRecord, calculatorId?: string) => void;
  onShowToast: (msg: string) => void;
}

export const AppModuleWorkspaceSection: React.FC<AppModuleWorkspaceSectionProps> = ({
  darkMode,
  activeTab,
  documentsSubTab,
  returnNavigationTab,
  printDocType,
  doctor,
  setDoctor,
  patient,
  setPatient,
  activeContext,
  saveContext,
  prescriptionItems,
  setPrescriptionItems,
  selectedExams,
  setSelectedExams,
  examIndication,
  setExamIndication,
  certificate,
  setCertificate,
  referral,
  setReferral,
  lgpdConsent,
  cloudUser,
  documentsBadgeCount,
  initialSusDocId,
  susCatalogResetTrigger,
  editorInitialSyncTrigger,
  editorCustomDoc,
  selectedScoreboardId,
  medicamentoPendente,
  setMedicamentoPendente,
  protocolSearchQuery,
  hospitalBeds,
  activeHospitalBedId,
  setActiveHospitalBedId,
  hospitalSubView,
  setHospitalSubView,
  hospitalDashboardMetricSource,
  hospitalDashboardScoreAcronym,
  setActiveTab,
  handleSelectTab,
  handleDocumentsSubTabChange,
  handleNavigateToPrint,
  handleNavigateToEditor,
  handleNavigateToCertificate,
  handleNavigateToReferral,
  handleNavigateToExams,
  handleNavigateToSus,
  handleNavigateToEditorWithHtml,
  handleOpenDoctorModal,
  handleOpenPatientModal,
  handleOpenBackupModal,
  handleOpenLgpdModal,
  handleOpenCommandPalette,
  handleSanitizeShiftData,
  handleDismissNoLoginNotice,
  handleToggleWeightCalc,
  handleUpdatePatientWeight,
  handleAddPrescriptionItem,
  handleClearPrescription,
  handleClearPatient,
  handleUsarMedicamento,
  handleAddExamFromScoreboard,
  handleUpdateHospitalBed,
  handleCreateHospitalBed,
  handleDeleteHospitalBed,
  handleRecordScoreToHospitalBed,
  handleNavigateToHospitalDashboardFromScore,
  handleOpenScoreboardForBed,
  onShowToast,
}) => {
  return (
    <main className="flex-1 min-w-0 pb-20 lg:pb-6">
      <LgpdLocalModeNotice
        isCloudAuthenticated={Boolean(cloudUser)}
        sharedComputerMode={lgpdConsent.sharedComputerMode}
        isDismissed={Boolean(lgpdConsent.dismissedNoLoginNotice)}
        hasActiveClinicalData={
          Boolean(patient?.name?.trim()) ||
          prescriptionItems.length > 0 ||
          selectedExams.length > 0
        }
        onOpenLgpdModal={handleOpenLgpdModal}
        onOpenBackupModal={handleOpenBackupModal}
        onSanitizeShiftData={handleSanitizeShiftData}
        onDismiss={handleDismissNoLoginNotice}
      />
      <ConsultationReadinessBar
        doctor={doctor}
        patient={patient}
        prescriptionCount={prescriptionItems.length}
        documentsCount={documentsBadgeCount}
        onOpenDoctorModal={handleOpenDoctorModal}
        onOpenPatientModal={handleOpenPatientModal}
        onOpenCommandPalette={handleOpenCommandPalette}
        compactOnDesktop={true}
      />
      <div
        key={activeTab === 'documents' && documentsSubTab === 'sus' ? 'documents-sus' : activeTab}
        className="animate-tab-fade"
      >
        {activeTab === 'prescription' && (
          <PrescriptionBuilder
            darkMode={darkMode}
            doctor={doctor}
            onUpdateDoctor={setDoctor}
            patient={patient}
            onUpdatePatient={setPatient}
            activeContext={activeContext}
            items={prescriptionItems}
            onUpdateItems={setPrescriptionItems}
            weightCalcEnabled={patient.weightCalcEnabled}
            onToggleWeightCalc={handleToggleWeightCalc}
            onClearPrescription={handleClearPrescription}
            onClearPatient={handleClearPatient}
            onNavigateToPrint={(type) => handleNavigateToPrint(type || 'prescription')}
            onNavigateToPediatricCalc={() => setActiveTab('pediatric_calc')}
            onNavigateToEditor={handleNavigateToEditor}
            onNavigateToCertificate={handleNavigateToCertificate}
            onNavigateToReferral={handleNavigateToReferral}
            onNavigateToExams={handleNavigateToExams}
            onNavigateToSus={handleNavigateToSus}
            onOpenDoctorModal={handleOpenDoctorModal}
            onOpenPatientModal={handleOpenPatientModal}
            medicamentoPendente={medicamentoPendente}
            onConsumirMedicamentoPendente={() => setMedicamentoPendente(null)}
            onAbrirPerfilMedico={handleOpenDoctorModal}
          />
        )}

        {activeTab === 'pediatric_calc' && (
          <Suspense fallback={null}>
            <PediatricCalculator
              darkMode={darkMode}
              patient={patient}
              onUpdatePatientWeight={handleUpdatePatientWeight}
              onAddPrescriptionItem={handleAddPrescriptionItem}
              onNavigateToPrescription={() => setActiveTab('prescription')}
            />
          </Suspense>
        )}

        {(activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams' || activeTab === 'sus') && (
          <Suspense fallback={null}>
            <ClinicalDocumentsHub
              darkMode={darkMode}
              patient={patient}
              onUpdatePatient={setPatient}
              doctor={doctor}
              activeContext={activeContext}
              certificate={certificate}
              onUpdateCertificate={setCertificate}
              referral={referral}
              onUpdateReferral={setReferral}
              selectedExams={selectedExams}
              onUpdateSelectedExams={setSelectedExams}
              clinicalIndication={examIndication}
              onUpdateClinicalIndication={setExamIndication}
              onNavigateToEditorWithHtml={handleNavigateToEditorWithHtml}
              initialSubTab={resolveActiveDocumentsSubTab(activeTab, documentsSubTab)}
              initialSusDocId={initialSusDocId}
              susCatalogResetTrigger={susCatalogResetTrigger}
              onSubTabChange={handleDocumentsSubTabChange}
              onNavigateToPrint={(type) => handleNavigateToPrint(type)}
            />
          </Suspense>
        )}

        {activeTab === 'protocols' && (
          <Suspense fallback={null}>
            <ClinicalProtocolsView
              darkMode={darkMode}
              patient={patient}
              initialSearchQuery={protocolSearchQuery}
              onUpdatePatientWeight={handleUpdatePatientWeight}
              onAddPrescriptionItem={handleAddPrescriptionItem}
              onNavigateToPrescription={() => setActiveTab('prescription')}
              onNavigateToScores={() => handleSelectTab('scores')}
              onUsarMedicamento={handleUsarMedicamento}
            />
          </Suspense>
        )}

        {activeTab === 'scores' && (
          <Suspense fallback={null}>
            <ScoreboardModuleView
              patient={patient}
              initialCalculatorId={selectedScoreboardId}
              onUpdatePatientWeight={handleUpdatePatientWeight}
              onAddPrescriptionItem={(item) => {
                handleAddPrescriptionItem(item);
                onShowToast(`Item "${item.name}" adicionado à receita.`);
              }}
              onAddExamById={handleAddExamFromScoreboard}
              onSendToA4Editor={(html, title) =>
                handleNavigateToEditorWithHtml(html, title || 'Escore Clínico', 'custom')
              }
              hospitalBeds={hospitalBeds}
              activeHospitalBedId={activeHospitalBedId}
              onSelectHospitalBed={setActiveHospitalBedId}
              onRecordScoreToBed={handleRecordScoreToHospitalBed}
              onNavigateToHospitalDashboard={handleNavigateToHospitalDashboardFromScore}
              onReturnToHospitalBed={(bedId) => {
                setActiveHospitalBedId(bedId);
                setHospitalSubView('evolution_form');
                setActiveTab('hospital');
              }}
            />
          </Suspense>
        )}

        {activeTab === 'hospital' && (
          <Suspense fallback={null}>
            <HospitalWardModuleView
              darkMode={darkMode}
              doctor={doctor}
              patient={patient}
              onSendToA4Editor={(html, title) => handleNavigateToEditorWithHtml(html, title, 'custom')}
              beds={hospitalBeds}
              activeBedId={activeHospitalBedId}
              onSelectBedId={setActiveHospitalBedId}
              onUpdateBed={handleUpdateHospitalBed}
              onCreateBed={handleCreateHospitalBed}
              onDeleteBed={handleDeleteHospitalBed}
              initialSubView={hospitalSubView}
              initialDashboardMetricSource={hospitalDashboardMetricSource}
              initialDashboardScoreAcronym={hospitalDashboardScoreAcronym}
              onOpenScoreboardForBed={handleOpenScoreboardForBed}
            />
          </Suspense>
        )}

        {activeTab === 'editor' && (
          <AsyncErrorBoundary moduleName="o Editor de Prescrições e Documentos">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  data-state="loading"
                  className="flex flex-col items-center justify-center p-12 text-center text-sm opacity-80 gap-3.5"
                >
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Carregando processador de texto clínico e canvas A4...
                  </span>
                </div>
              }
            >
              <DocumentEditorView
                darkMode={darkMode}
                doctor={doctor}
                patient={patient}
                prescriptionItems={prescriptionItems}
                onUpdatePrescriptionItems={setPrescriptionItems}
                referral={referral}
                certificate={certificate}
                initialDocumentToLoad={editorCustomDoc}
                activeContext={activeContext}
                onSaveContext={saveContext}
                onNavigateToPrint={() => handleNavigateToPrint('prescription')}
                onOpenDoctorModal={handleOpenDoctorModal}
                editorInitialSyncTrigger={editorInitialSyncTrigger}
                onNavigateBack={() => setActiveTab(returnNavigationTab)}
              />
            </Suspense>
          </AsyncErrorBoundary>
        )}

        {activeTab === 'print_preview' && (
          <AsyncErrorBoundary moduleName="a Prévia de Impressão">
            <Suspense
              fallback={
                <div
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                  data-state="loading"
                  className="flex flex-col items-center justify-center p-12 text-center text-sm opacity-80 gap-3.5"
                >
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Carregando visualização médica e módulos de exportação...
                  </span>
                </div>
              }
            >
              <PrintPreview
                doctor={doctor}
                patient={patient}
                prescriptionItems={prescriptionItems}
                exams={selectedExams}
                examIndication={examIndication}
                certificate={certificate}
                referral={referral}
                activeContext={activeContext}
                initialDocType={printDocType}
                onBack={() => setActiveTab(returnNavigationTab)}
                onAbrirPerfilMedico={handleOpenDoctorModal}
              />
            </Suspense>
          </AsyncErrorBoundary>
        )}
      </div>
    </main>
  );
};
