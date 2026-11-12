import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import type { DocumentsSubTab } from './components/ClinicalDocumentsHub';
import { PuxarParaAtualizar } from './components/PuxarParaAtualizar';
import { ActiveTab, PrescriptionItem, SusDocumentId } from './types';
import { ClinicalKit } from './data/clinicalKits';
import { montarItensDoKit } from './utils/montarItensDoKit';
import { UnifiedMedication } from './data/medicationDatabase';
import { usePrescriptionSession } from './hooks/usePrescriptionSession';
import { useWorkContext } from './hooks/useWorkContext';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useNavigationSync, runTabViewTransition } from './hooks/useNavigationSync';
import { useModalAccessibility } from './hooks/useModalAccessibility';
import { useHospitalWardSession } from './hooks/useHospitalWardSession';
import {
  AppModuleWorkspaceSection,
  AppGlobalModalsAndOverlays,
  useAppLgpdAndCloudGovernance,
  useAppThemeAndSidebarViewport,
  loadDocumentEditor,
  buildOncologyScreeningExamItem,
} from './components/layout/AppWorkspaceAndModals';
import type { TipoDocumento } from './utils/documentoClinico';

const preloadDocumentEditorSilently = () => {
  loadDocumentEditor().catch(() => {});
};

export default function App() {
  const { darkMode, setDarkMode, sidebarOpen, setSidebarOpen } =
    useAppThemeAndSidebarViewport(preloadDocumentEditorSilently);

  // Navegação entre abas
  const [activeTab, setActiveTab] = useState<ActiveTab>('prescription');
  const [documentsSubTab, setDocumentsSubTab] = useState<DocumentsSubTab>('certificate');
  const [lastClinicalDocSubTab, setLastClinicalDocSubTab] = useState<'certificate' | 'referral' | 'exams'>('certificate');
  const [initialSusDocId, setInitialSusDocId] = useState<SusDocumentId | null>(null);
  const [susCatalogResetTrigger, setSusCatalogResetTrigger] = useState<number>(0);
  const [returnNavigationTab, setReturnNavigationTab] = useState<ActiveTab>('prescription');
  const [printDocType, setPrintDocType] = useState<TipoDocumento>('prescription');

  const handleNavigateToPrint = (type?: TipoDocumento) => {
    if (type) {
      setPrintDocType(type);
    }
    if (activeTab !== 'print_preview' && activeTab !== 'editor') {
      setReturnNavigationTab(activeTab);
    }
    setActiveTab('print_preview');
  };

  // Modais
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);

  // Hook desacoplado de sessão clínica e persistência
  const {
    doctor,
    setDoctor,
    patient,
    setPatient,
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
    startNewConsultation
  } = usePrescriptionSession();

  // Governança institucional multi-esfera (Local-First via Dexie/IndexedDB)
  const doctorCredentials = React.useMemo(() => ({
    crm: doctor.crm,
    uf: doctor.crmState,
    rqe: doctor.rqe,
    specialty: doctor.specialty,
  }), [doctor.crm, doctor.crmState, doctor.rqe, doctor.specialty]);

  const {
    contexts: workContexts,
    activeContext,
    switchContext,
    saveContext,
    loadContexts
  } = useWorkContext(doctorCredentials);

  // Capacidade de instalação do PWA
  const { isInstallable, installApp, showInstallHelp, closeInstallHelp } = usePwaInstall();

  // Callbacks estáveis para modais
  const handleOpenDoctorModal = React.useCallback(() => setIsDoctorModalOpen(true), []);
  const handleCloseDoctorModal = React.useCallback(() => setIsDoctorModalOpen(false), []);
  const handleOpenPatientModal = React.useCallback(() => setIsPatientModalOpen(true), []);
  const handleClosePatientModal = React.useCallback(() => setIsPatientModalOpen(false), []);
  const handleOpenBackupModal = React.useCallback(() => setIsBackupModalOpen(true), []);
  const handleCloseBackupModal = React.useCallback(() => setIsBackupModalOpen(false), []);
  const handleOpenLgpdModal = React.useCallback(() => setIsLgpdModalOpen(true), []);
  const handleCloseLgpdModal = React.useCallback(() => setIsLgpdModalOpen(false), []);

  const [editorInitialSyncTrigger, setEditorInitialSyncTrigger] = useState(0);
  const [editorCustomDoc, setEditorCustomDoc] = useState<{ html: string; title: string; type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' } | null>(null);
  const [selectedScoreboardId, setSelectedScoreboardId] = useState<string | null>(null);

  // Toast de notificação de kit aplicado
  const [kitToast, setKitToast] = useState<string | null>(null);

  const {
    hospitalBeds,
    activeHospitalBedId,
    setActiveHospitalBedId,
    hospitalSubView,
    setHospitalSubView,
    hospitalDashboardMetricSource,
    hospitalDashboardScoreAcronym,
    reloadHospitalBedsFromStorage,
    handleUpdateHospitalBed,
    handleCreateHospitalBed,
    handleDeleteHospitalBed,
    handleRecordScoreToHospitalBed,
    handleNavigateToHospitalDashboardFromScore,
    handleOpenScoreboardForBed,
  } = useHospitalWardSession({
    setActiveTab,
    setSelectedScoreboardId,
    onShowToast: setKitToast,
  });

  const {
    lgpdConsent,
    cloudUser,
    handleAcceptEssentialCookies,
    handleAcceptAllCookies,
    handleSaveLgpdPreferences,
    handleSanitizeShiftData,
    handleEraseAllLocalData,
    handleDismissNoLoginNotice,
  } = useAppLgpdAndCloudGovernance({
    startNewConsultation,
    setDoctor,
    loadContexts,
    reloadHospitalBedsFromStorage,
    onShowToast: setKitToast,
  });

  const handleBackupRestored = React.useCallback(async () => {
    await loadContexts();
    await reloadHospitalBedsFromStorage();
  }, [loadContexts, reloadHospitalBedsFromStorage]);

  // Manipuladores de ação
  const handleUpdatePatientWeight = (newWeight: number) => {
    setPatient((prev) => ({ ...prev, weightKg: newWeight }));
  };

  const handleToggleWeightCalc = (enabled: boolean) => {
    setPatient((prev) => ({ ...prev, weightCalcEnabled: enabled }));
  };

  const handleAddPrescriptionItem = (newItem: PrescriptionItem) => {
    setPrescriptionItems((prev) => [...prev, newItem]);
  };

  const handleClearPrescription = () => {
    setPrescriptionItems([]);
  };

  const handleClearPatient = () => {
    startNewConsultation();
  };

  const handleResetAll = () => {
    startNewConsultation();
    setActiveTab('prescription');
  };

  const handleSelectScoreFromPalette = React.useCallback((calculatorId: string) => {
    setSelectedScoreboardId(calculatorId);
    setActiveTab('scores');
  }, [setActiveTab]);

  const handleAddExamFromScoreboard = React.useCallback((examId: string) => {
    const nextExam = buildOncologyScreeningExamItem(examId);
    if (!nextExam) return;
    setSelectedExams(prev => {
      if (prev.some(ex => ex.id === nextExam.id)) return prev;
      return [...prev, nextExam];
    });
    setKitToast('Exame de rastreio adicionado à Solicitação de Exames.');
  }, [setSelectedExams]);

  const handleDocumentsSubTabChange = React.useCallback((subTab: DocumentsSubTab) => {
    setDocumentsSubTab(subTab);
    if (subTab !== 'sus') {
      setLastClinicalDocSubTab(subTab);
      setInitialSusDocId(null);
    }
  }, []);

  const handleSelectSusDocFromPalette = React.useCallback((docId: SusDocumentId) => {
    runTabViewTransition(() => {
      setInitialSusDocId(docId);
      setDocumentsSubTab('sus');
      setActiveTab('documents');
    });
  }, []);

  const handleSelectTab = React.useCallback((tab: ActiveTab) => {
    runTabViewTransition(() => {
      if (tab === 'editor') {
        setEditorCustomDoc(null);
        setEditorInitialSyncTrigger(prev => prev + 1);
        if (activeTab !== 'editor' && activeTab !== 'print_preview') {
          setReturnNavigationTab(activeTab);
        }
        setActiveTab('editor');
        return;
      }
      if (tab === 'sus') {
        setInitialSusDocId(null);
        setSusCatalogResetTrigger(prev => prev + 1);
        setDocumentsSubTab('sus');
        setActiveTab('documents');
        return;
      }
      if (tab === 'certificate' || tab === 'referral' || tab === 'exams') {
        setInitialSusDocId(null);
        setLastClinicalDocSubTab(tab);
        setDocumentsSubTab(tab);
        setActiveTab('documents');
        return;
      }
      if (tab === 'documents') {
        setInitialSusDocId(null);
        setDocumentsSubTab(prev => (prev === 'sus' ? lastClinicalDocSubTab : prev));
        setActiveTab('documents');
        return;
      }
      setActiveTab(tab);
    });
  }, [activeTab, lastClinicalDocSubTab]);

  const handleNavigateToEditor = React.useCallback(() => handleSelectTab('editor'), [handleSelectTab]);
  const handleNavigateToCertificate = React.useCallback(() => handleSelectTab('certificate'), [handleSelectTab]);
  const handleNavigateToReferral = React.useCallback(() => handleSelectTab('referral'), [handleSelectTab]);
  const handleNavigateToExams = React.useCallback(() => handleSelectTab('exams'), [handleSelectTab]);
  const handleNavigateToSus = React.useCallback(() => handleSelectTab('sus'), [handleSelectTab]);
  const handleOpenCommandPalette = React.useCallback(() => setIsCommandPaletteOpen(true), []);
  const handleCloseCommandPalette = React.useCallback(() => setIsCommandPaletteOpen(false), []);

  const handleNavigateToEditorWithHtml = (html: string, title: string, type: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' = 'custom') => {
    if (activeTab !== 'editor' && activeTab !== 'print_preview') {
      setReturnNavigationTab(activeTab);
    }
    setEditorCustomDoc({ html, title, type });
    setActiveTab('editor');
  };

  // Rolagem para o topo ao trocar de módulo respeitando preferência vestibular
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }, [activeTab]);

  // Sincronização de navegação, hash leve e atalhos rápidos (Alt+1..6 e Ctrl+K)
  useNavigationSync({
    activeTab,
    documentsSubTab,
    onSelectTab: handleSelectTab,
    onOpenCommandPalette: handleOpenCommandPalette,
    isAnyModalOpen:
      isPatientModalOpen ||
      isDoctorModalOpen ||
      isBackupModalOpen ||
      isLgpdModalOpen ||
      isCommandPaletteOpen ||
      showInstallHelp,
  });

  const installHelpModalRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: showInstallHelp,
    onClose: closeInstallHelp,
    containerRef: installHelpModalRef,
  });

  const documentsBadgeCount = selectedExams.length;

  // Medicamento pendente vindo de outras telas (ex: Protocolos)
  const [medicamentoPendente, setMedicamentoPendente] = useState<UnifiedMedication | null>(null);
  const [protocolSearchQuery, setProtocolSearchQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!kitToast) return;
    const timer = setTimeout(() => {
      setKitToast(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [kitToast]);

  const handleGoHome = () => {
    setActiveTab('prescription');
    if (typeof window !== 'undefined') {
      const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    }
  };

  const handleAplicarKit = (kit: ClinicalKit) => {
    const novosItens = montarItensDoKit(kit, patient);
    setPrescriptionItems(prev => [...prev, ...novosItens]);
    setActiveTab('prescription');
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      const reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    setKitToast(`Kit ${kit.name} adicionado à receita.`);
  };

  const handleUsarMedicamento = (med: UnifiedMedication) => {
    setMedicamentoPendente(med);
    setActiveTab('prescription');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      data-state="idle"
      aria-busy={false}
      className="min-h-screen font-sans antialiased flex flex-col transition-colors duration-300 surface-raised"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      <PuxarParaAtualizar
        desativado={
          (sidebarOpen && (typeof window !== 'undefined' ? window.innerWidth < 1024 : false)) ||
          isPatientModalOpen ||
          isDoctorModalOpen ||
          isBackupModalOpen ||
          isLgpdModalOpen ||
          isCommandPaletteOpen ||
          showInstallHelp
        }
      />

      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        onGoHome={handleGoHome}
        activeTab={activeTab}
        documentsSubTab={documentsSubTab}
        onSelectTab={handleSelectTab}
        patient={patient}
        onOpenPatientModal={handleOpenPatientModal}
        doctor={doctor}
        onOpenDoctorModal={handleOpenDoctorModal}
        onNavigateToEditor={handleNavigateToEditor}
        prescriptionCount={prescriptionItems.length}
        selectedExamsCount={documentsBadgeCount}
        isInstallable={isInstallable}
        onInstallApp={installApp}
        onOpenCommandPalette={handleOpenCommandPalette}
        onOpenLgpdModal={handleOpenLgpdModal}
      />

      <div className="flex-1 w-full max-w-screen-2xl container mx-auto px-2.5 sm:px-4 lg:px-4 xl:px-6 py-2.5 sm:py-3 flex gap-3 lg:gap-4 xl:gap-5 relative min-h-0">
        <Sidebar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          activeTab={activeTab}
          documentsSubTab={documentsSubTab}
          onSelectTab={handleSelectTab}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
          onClose={() => setSidebarOpen(false)}
          doctor={doctor}
          patient={patient}
          prescriptionCount={prescriptionItems.length}
          selectedExamsCount={documentsBadgeCount}
          contexts={workContexts}
          activeContext={activeContext}
          onSwitchContext={switchContext}
          onOpenDoctorModal={handleOpenDoctorModal}
          onOpenPatientModal={handleOpenPatientModal}
          onOpenBackupModal={handleOpenBackupModal}
          onOpenLgpdModal={handleOpenLgpdModal}
          isInstallable={isInstallable}
          onInstallApp={installApp}
          onClearPrescription={handleClearPrescription}
          onClearPatient={handleClearPatient}
          onResetAll={handleResetAll}
          onAplicarKit={handleAplicarKit}
        />

        <AppModuleWorkspaceSection
          darkMode={darkMode}
          activeTab={activeTab}
          documentsSubTab={documentsSubTab}
          returnNavigationTab={returnNavigationTab}
          printDocType={printDocType}
          doctor={doctor}
          setDoctor={setDoctor}
          patient={patient}
          setPatient={setPatient}
          activeContext={activeContext}
          saveContext={saveContext}
          prescriptionItems={prescriptionItems}
          setPrescriptionItems={setPrescriptionItems}
          selectedExams={selectedExams}
          setSelectedExams={setSelectedExams}
          examIndication={examIndication}
          setExamIndication={setExamIndication}
          certificate={certificate}
          setCertificate={setCertificate}
          referral={referral}
          setReferral={setReferral}
          lgpdConsent={lgpdConsent}
          cloudUser={cloudUser}
          documentsBadgeCount={documentsBadgeCount}
          initialSusDocId={initialSusDocId}
          susCatalogResetTrigger={susCatalogResetTrigger}
          editorInitialSyncTrigger={editorInitialSyncTrigger}
          editorCustomDoc={editorCustomDoc}
          selectedScoreboardId={selectedScoreboardId}
          medicamentoPendente={medicamentoPendente}
          setMedicamentoPendente={setMedicamentoPendente}
          protocolSearchQuery={protocolSearchQuery}
          hospitalBeds={hospitalBeds}
          activeHospitalBedId={activeHospitalBedId}
          setActiveHospitalBedId={setActiveHospitalBedId}
          hospitalSubView={hospitalSubView}
          setHospitalSubView={setHospitalSubView}
          hospitalDashboardMetricSource={hospitalDashboardMetricSource}
          hospitalDashboardScoreAcronym={hospitalDashboardScoreAcronym}
          setActiveTab={setActiveTab}
          handleSelectTab={handleSelectTab}
          handleDocumentsSubTabChange={handleDocumentsSubTabChange}
          handleNavigateToPrint={handleNavigateToPrint}
          handleNavigateToEditor={handleNavigateToEditor}
          handleNavigateToCertificate={handleNavigateToCertificate}
          handleNavigateToReferral={handleNavigateToReferral}
          handleNavigateToExams={handleNavigateToExams}
          handleNavigateToSus={handleNavigateToSus}
          handleNavigateToEditorWithHtml={handleNavigateToEditorWithHtml}
          handleOpenDoctorModal={handleOpenDoctorModal}
          handleOpenPatientModal={handleOpenPatientModal}
          handleOpenBackupModal={handleOpenBackupModal}
          handleOpenLgpdModal={handleOpenLgpdModal}
          handleOpenCommandPalette={handleOpenCommandPalette}
          handleSanitizeShiftData={handleSanitizeShiftData}
          handleDismissNoLoginNotice={handleDismissNoLoginNotice}
          handleToggleWeightCalc={handleToggleWeightCalc}
          handleUpdatePatientWeight={handleUpdatePatientWeight}
          handleAddPrescriptionItem={handleAddPrescriptionItem}
          handleClearPrescription={handleClearPrescription}
          handleClearPatient={handleClearPatient}
          handleUsarMedicamento={handleUsarMedicamento}
          handleAddExamFromScoreboard={handleAddExamFromScoreboard}
          handleUpdateHospitalBed={handleUpdateHospitalBed}
          handleCreateHospitalBed={handleCreateHospitalBed}
          handleDeleteHospitalBed={handleDeleteHospitalBed}
          handleRecordScoreToHospitalBed={handleRecordScoreToHospitalBed}
          handleNavigateToHospitalDashboardFromScore={handleNavigateToHospitalDashboardFromScore}
          handleOpenScoreboardForBed={handleOpenScoreboardForBed}
          onShowToast={setKitToast}
        />
      </div>

      <MobileBottomNav
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onSelectTab={handleSelectTab}
        prescriptionCount={prescriptionItems.length}
        selectedExamsCount={documentsBadgeCount}
        patientWeight={patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0}
        onOpenMenu={() => setSidebarOpen(true)}
      />

      <AppGlobalModalsAndOverlays
        darkMode={darkMode}
        doctor={doctor}
        setDoctor={setDoctor}
        patient={patient}
        setPatient={setPatient}
        activeContext={activeContext}
        saveContext={saveContext}
        hospitalBeds={hospitalBeds}
        setActiveHospitalBedId={setActiveHospitalBedId}
        setHospitalSubView={setHospitalSubView}
        setProtocolSearchQuery={setProtocolSearchQuery}
        setActiveTab={setActiveTab}
        isCommandPaletteOpen={isCommandPaletteOpen}
        handleCloseCommandPalette={handleCloseCommandPalette}
        handleSelectTab={handleSelectTab}
        handleSelectSusDocFromPalette={handleSelectSusDocFromPalette}
        handleSelectScoreFromPalette={handleSelectScoreFromPalette}
        handleAplicarKit={handleAplicarKit}
        handleUsarMedicamento={handleUsarMedicamento}
        isPatientModalOpen={isPatientModalOpen}
        handleOpenPatientModal={handleOpenPatientModal}
        handleClosePatientModal={handleClosePatientModal}
        handleClearPatient={handleClearPatient}
        isDoctorModalOpen={isDoctorModalOpen}
        handleOpenDoctorModal={handleOpenDoctorModal}
        handleCloseDoctorModal={handleCloseDoctorModal}
        isBackupModalOpen={isBackupModalOpen}
        handleOpenBackupModal={handleOpenBackupModal}
        handleCloseBackupModal={handleCloseBackupModal}
        handleBackupRestored={handleBackupRestored}
        isLgpdModalOpen={isLgpdModalOpen}
        handleOpenLgpdModal={handleOpenLgpdModal}
        handleCloseLgpdModal={handleCloseLgpdModal}
        lgpdConsent={lgpdConsent}
        cloudUser={cloudUser}
        handleSaveLgpdPreferences={handleSaveLgpdPreferences}
        handleAcceptEssentialCookies={handleAcceptEssentialCookies}
        handleAcceptAllCookies={handleAcceptAllCookies}
        handleSanitizeShiftData={handleSanitizeShiftData}
        handleEraseAllLocalData={handleEraseAllLocalData}
        showInstallHelp={showInstallHelp}
        closeInstallHelp={closeInstallHelp}
        installHelpModalRef={installHelpModalRef}
        kitToast={kitToast}
      />
    </div>
  );
}
