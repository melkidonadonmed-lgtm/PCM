import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Header } from './components/Header';
import { Icon } from './components/Icon';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PediatricCalculator } from './components/PediatricCalculator';
import { PrescriptionBuilder } from './components/PrescriptionBuilder';
import { ClinicalDocumentsHub, DocumentsSubTab } from './components/ClinicalDocumentsHub';
import { ClinicalProtocolsView } from './components/ClinicalProtocolsView';
import { HospitalWardModuleView } from './components/hospital/HospitalWardModuleView';
import { ScoreboardModuleView } from './components/scores/ScoreboardModuleView';
import { PuxarParaAtualizar } from './components/PuxarParaAtualizar';
import { ActiveTab, PrescriptionItem, Patient } from './types';
import { ClinicalKit } from './data/clinicalKits';
import { montarItensDoKit } from './utils/montarItensDoKit';
import { UnifiedMedication } from './data/medicationDatabase';
import { usePrescriptionSession, DEFAULT_PATIENT } from './hooks/usePrescriptionSession';
import { useWorkContext } from './hooks/useWorkContext';
import { usePwaInstall } from './hooks/usePwaInstall';
import { useNavigationSync, runTabViewTransition } from './hooks/useNavigationSync';
import { useModalAccessibility } from './hooks/useModalAccessibility';
import { CommandPaletteModal } from './components/layout/CommandPaletteModal';
import { ConsultationReadinessBar } from './components/bento/ConsultationReadinessBar';
import { AsyncErrorBoundary } from './components/AsyncErrorBoundary';
import { storageService } from './services/storageService';
import type { TipoDocumento } from './utils/documentoClinico';

// Carregamento sob demanda com retry resiliente contra falhas de rede ou cache antigo
const loadDocumentEditor = (): Promise<typeof import('./components/DocumentEditorView')> =>
  import('./components/DocumentEditorView').catch((err) => {
    console.warn('[PresCMed] Tentando carregar Editor novamente após falha inicial:', err);
    return new Promise<typeof import('./components/DocumentEditorView')>((resolve) =>
      setTimeout(() => resolve(import('./components/DocumentEditorView')), 400)
    );
  });

const DocumentEditorView = React.lazy(loadDocumentEditor);
const PrintPreview = React.lazy(() => import('./components/PrintPreview'));
const PatientModal = React.lazy(() => import('./components/PatientModal'));
const DoctorProfileModal = React.lazy(() => import('./components/DoctorProfileModal'));
const BackupModal = React.lazy(() => import('./components/BackupModal'));

export default function App() {
  // Tema visual (Claro como padrão oficial do sistema)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('prescmed_theme');
    return saved !== null ? saved === 'dark' : false;
  });

  // Estado responsivo da barra lateral
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Sincronização do tema no DOM e localStorage
  useEffect(() => {
    storageService.saveRawString('prescmed_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sincronização da barra lateral com o breakpoint desktop/mobile
  useEffect(() => {
    const DESKTOP_BREAKPOINT = 1024;
    let wasDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;

    const handleBreakpointChange = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      if (isDesktop !== wasDesktop) {
        wasDesktop = isDesktop;
        setSidebarOpen(isDesktop);
      }
    };

    handleBreakpointChange();
    window.addEventListener('resize', handleBreakpointChange);
    return () => window.removeEventListener('resize', handleBreakpointChange);
  }, []);

  // Trava a rolagem da página de fundo (body) enquanto o menu lateral mobile estiver aberto
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 1024;
    if (isMobile && sidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [sidebarOpen]);

  // Pré-carregamento silencioso do Editor de Documentos em background após inicialização
  useEffect(() => {
    const triggerPreload = () => {
      loadDocumentEditor().catch(() => {});
    };

    if (typeof window !== 'undefined') {
      const idleWin = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof idleWin.requestIdleCallback === 'function') {
        idleWin.requestIdleCallback(triggerPreload, { timeout: 2500 });
      } else {
        setTimeout(triggerPreload, 1200);
      }
    }
  }, []);

  // Navegação entre abas
  const [activeTab, setActiveTab] = useState<ActiveTab>('prescription');
  const [documentsSubTab, setDocumentsSubTab] = useState<DocumentsSubTab>('certificate');
  const [printDocType, setPrintDocType] = useState<TipoDocumento>('prescription');

  const handleNavigateToPrint = (type?: TipoDocumento) => {
    if (type) {
      setPrintDocType(type);
    }
    setActiveTab('print_preview');
  };

  // Modais
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
    rqe: doctor.rqe
  }), [doctor.crm, doctor.crmState, doctor.rqe]);

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

  // Manipuladores de ação
  const handleUpdatePatientWeight = (newWeight: number) => {
    setPatient(prev => ({ ...prev, weightKg: newWeight }));
  };

  const handleToggleWeightCalc = (enabled: boolean) => {
    setPatient(prev => ({ ...prev, weightCalcEnabled: enabled }));
  };

  const handleAddPrescriptionItem = (newItem: PrescriptionItem) => {
    setPrescriptionItems(prev => [...prev, newItem]);
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

  const [editorInitialSyncTrigger, setEditorInitialSyncTrigger] = useState(0);
  const [editorCustomDoc, setEditorCustomDoc] = useState<{ html: string; title: string; type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' } | null>(null);
  const [selectedScoreboardId, setSelectedScoreboardId] = useState<string | null>(null);

  const handleSelectScoreFromPalette = React.useCallback((calculatorId: string) => {
    setSelectedScoreboardId(calculatorId);
    setActiveTab('scores');
  }, [setActiveTab]);

  const handleAddExamFromScoreboard = React.useCallback((examId: string) => {
    setSelectedExams(prev => {
      if (prev.some(ex => ex.id === examId)) return prev;
      return [
        ...prev,
        {
          id: examId,
          category: 'Rastreamento Oncológico (INCA/SUS)',
          name: examId === 'mamografia'
            ? 'Mamografia Bilateral para Rastreamento (SIGTAP 02.04.03.018-8)'
            : examId === 'usg-mamas'
              ? 'Ultrassonografia de Mamas Bilateral (SIGTAP 02.05.02.009-7)'
              : examId === 'papanicolaou'
                ? 'Exame Citopatológico Cervicovaginal / Papanicolaou (SIGTAP 02.03.01.008-6)'
                : 'Dosagem de PSA Total e Livre (SIGTAP 02.02.03.010-5)',
          selected: true,
          urgency: 'routine',
        },
      ];
    });
    setKitToast('Exame de rastreio adicionado à Solicitação de Exames.');
  }, [setSelectedExams]);

  const handleSelectTab = React.useCallback((tab: ActiveTab) => {
    if (tab === 'patients') {
      handleOpenPatientModal();
      return;
    }
    runTabViewTransition(() => {
      if (tab === 'editor') {
        setEditorCustomDoc(null);
        setEditorInitialSyncTrigger(prev => prev + 1);
        setActiveTab('editor');
        return;
      }
      if (tab === 'certificate' || tab === 'referral' || tab === 'exams' || tab === 'sus') {
        setDocumentsSubTab(tab);
        setActiveTab('documents');
        return;
      }
      setActiveTab(tab);
    });
  }, [handleOpenPatientModal]);

  const handleNavigateToEditor = React.useCallback(() => handleSelectTab('editor'), [handleSelectTab]);
  const handleNavigateToCertificate = React.useCallback(() => handleSelectTab('certificate'), [handleSelectTab]);
  const handleNavigateToReferral = React.useCallback(() => handleSelectTab('referral'), [handleSelectTab]);
  const handleNavigateToExams = React.useCallback(() => handleSelectTab('exams'), [handleSelectTab]);
  const handleNavigateToSus = React.useCallback(() => handleSelectTab('sus'), [handleSelectTab]);
  const handleOpenCommandPalette = React.useCallback(() => setIsCommandPaletteOpen(true), []);
  const handleCloseCommandPalette = React.useCallback(() => setIsCommandPaletteOpen(false), []);

  const handleNavigateToEditorWithHtml = (html: string, title: string, type: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom' = 'custom') => {
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

  // Toast de notificação de kit aplicado
  const [kitToast, setKitToast] = useState<string | null>(null);

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
    <div data-state="idle" aria-busy={false} 
      className="min-h-screen font-sans antialiased flex flex-col transition-colors duration-300 surface-raised"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      {/* Puxar para atualizar (pull to refresh) desativado com menu ou modal aberto */}
      <PuxarParaAtualizar
        desativado={
          (sidebarOpen && (typeof window !== 'undefined' ? window.innerWidth < 1024 : false)) ||
          isPatientModalOpen ||
          isDoctorModalOpen ||
          isBackupModalOpen ||
          isCommandPaletteOpen ||
          showInstallHelp
        }
      />

      {/* Top Application Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        onGoHome={handleGoHome}
        activeTab={activeTab}
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
      />

      {/* Main Responsive Body Layout */}
      <div className="flex-1 w-full max-w-screen-2xl container mx-auto px-2.5 sm:px-4 lg:px-4 xl:px-6 py-3 sm:py-4 flex gap-3 lg:gap-4 xl:gap-5 relative min-h-0">
        {/* Desktop & Tablet Persistent Sidebar */}
        <Sidebar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          activeTab={activeTab}
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
          isInstallable={isInstallable}
          onInstallApp={installApp}
          onClearPrescription={handleClearPrescription}
          onClearPatient={handleClearPatient}
          onResetAll={handleResetAll}
          onAplicarKit={handleAplicarKit}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-6">
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
          <div key={activeTab} className="animate-tab-fade">
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
              <PediatricCalculator
                darkMode={darkMode}
                patient={patient}
                onUpdatePatientWeight={handleUpdatePatientWeight}
                onAddPrescriptionItem={handleAddPrescriptionItem}
                onNavigateToPrescription={() => setActiveTab('prescription')}
              />
            )}

            {(activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams' || activeTab === 'sus') && (
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
                initialSubTab={
                  activeTab === 'certificate' ? 'certificate' :
                  activeTab === 'referral' ? 'referral' :
                  activeTab === 'exams' ? 'exams' :
                  activeTab === 'sus' ? 'sus' : documentsSubTab
                }
                onSubTabChange={setDocumentsSubTab}
                onNavigateToPrint={(type) => handleNavigateToPrint(type)}
              />
            )}

            {activeTab === 'protocols' && (
              <ClinicalProtocolsView
                darkMode={darkMode}
                patient={patient}
                onUpdatePatientWeight={handleUpdatePatientWeight}
                onAddPrescriptionItem={handleAddPrescriptionItem}
                onNavigateToPrescription={() => setActiveTab('prescription')}
                onNavigateToScores={() => handleSelectTab('scores')}
                onUsarMedicamento={handleUsarMedicamento}
              />
            )}

            {activeTab === 'scores' && (
              <ScoreboardModuleView
                patient={patient}
                initialCalculatorId={selectedScoreboardId}
                onUpdatePatientWeight={handleUpdatePatientWeight}
                onAddPrescriptionItem={(item) => {
                  handleAddPrescriptionItem(item);
                  setKitToast(`Item "${item.name}" adicionado à receita.`);
                }}
                onAddExamById={handleAddExamFromScoreboard}
                onSendToA4Editor={(html, title) =>
                  handleNavigateToEditorWithHtml(html, title || 'Escore Clínico', 'custom')
                }
              />
            )}

            {activeTab === 'hospital' && (
              <HospitalWardModuleView
                darkMode={darkMode}
                doctor={doctor}
                patient={patient}
                onSendToA4Editor={(html, title) => handleNavigateToEditorWithHtml(html, title, 'custom')}
              />
            )}

            {activeTab === 'editor' && (
              <AsyncErrorBoundary moduleName="o Editor de Prescrições e Documentos">
                <Suspense fallback={
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
                }>
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
                    onNavigateBack={() => setActiveTab('prescription')}
                  />
                </Suspense>
              </AsyncErrorBoundary>
            )}

            {activeTab === 'print_preview' && (
              <AsyncErrorBoundary moduleName="a Prévia de Impressão">
                <Suspense fallback={
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
                }>
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
                    onBack={() => setActiveTab('prescription')}
                    onAbrirPerfilMedico={handleOpenDoctorModal}
                  />
                </Suspense>
              </AsyncErrorBoundary>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onSelectTab={handleSelectTab}
        prescriptionCount={prescriptionItems.length}
        selectedExamsCount={documentsBadgeCount}
        patientWeight={patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0}
        onOpenMenu={() => setSidebarOpen(true)}
      />

      {/* Command Palette Global (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={handleCloseCommandPalette}
        onSelectTab={handleSelectTab}
        onSelectScore={handleSelectScoreFromPalette}
        onAplicarKit={handleAplicarKit}
        onUsarMedicamento={handleUsarMedicamento}
        onOpenPatientModal={handleOpenPatientModal}
        onOpenDoctorModal={handleOpenDoctorModal}
      />

      {/* Modals */}
      {isPatientModalOpen && (
        <Suspense fallback={null}>
          <PatientModal
            darkMode={darkMode}
            patient={patient}
            onSavePatient={setPatient}
            onClearPatient={handleClearPatient}
            onClose={handleClosePatientModal}
          />
        </Suspense>
      )}

      {isDoctorModalOpen && (
        <Suspense fallback={null}>
          <DoctorProfileModal
            darkMode={darkMode}
            doctor={doctor}
            onSaveDoctor={setDoctor}
            onClose={handleCloseDoctorModal}
            activeContext={activeContext}
            onSaveContext={saveContext}
          />
        </Suspense>
      )}

      {isBackupModalOpen && (
        <Suspense fallback={null}>
          <BackupModal
            isOpen={isBackupModalOpen}
            darkMode={darkMode}
            doctor={doctor}
            onUpdateDoctor={setDoctor}
            onBackupRestored={loadContexts}
            onClose={handleCloseBackupModal}
          />
        </Suspense>
      )}

      {/* Modal de Instruções de Instalação PWA (Mobile / Navegadores sem prompt automático) */}
      {showInstallHelp && (
        <div
          role="dialog"
          aria-modal="true"
          data-state="idle"
          aria-busy={false}
          aria-labelledby="install-help-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 animate-backdrop-fade"
          onClick={closeInstallHelp}
        >
          <div
            ref={installHelpModalRef}
            className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-2xl space-y-4 text-[var(--text-main)] modal-surface-spring"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 id="install-help-modal-title" className="text-sm font-bold">Instalar PresCMed no Dispositivo</h3>
              <button
                type="button"
                onClick={closeInstallHelp}
                aria-label="Fechar instruções de instalação"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              <div className="p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] space-y-1">
                <p className="font-bold text-[var(--text-main)]">No Android (Chrome / Edge / Samsung):</p>
                <p>Toque no ícone de menu <strong>⋮</strong> (canto superior ou inferior do navegador) e selecione <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] space-y-1">
                <p className="font-bold text-[var(--text-main)]">No iPhone / iPad (Safari):</p>
                <p>Toque no botão <strong>Compartilhar</strong> na barra do navegador e escolha <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.</p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={closeInstallHelp}
                className="btn-tactile-primary h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:outline-none"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Confirmação de Kit Adicionado */}
      {kitToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-tactile-lg border border-slate-700/50"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{kitToast}</span>
        </div>
      )}
    </div>
  );
}
