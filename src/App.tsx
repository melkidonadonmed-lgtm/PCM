import React, { useState, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PediatricCalculator } from './components/PediatricCalculator';
import { PrescriptionBuilder } from './components/PrescriptionBuilder';
import { ExamRequester } from './components/ExamRequester';
import { CertificateAndReferral } from './components/CertificateAndReferral';
import { ClinicalProtocolsView } from './components/ClinicalProtocolsView';
import { PuxarParaAtualizar } from './components/PuxarParaAtualizar';
import { ActiveTab, PrescriptionItem, Patient } from './types';
import { ClinicalKit } from './data/clinicalKits';
import { montarItensDoKit } from './utils/montarItensDoKit';
import { UnifiedMedication } from './data/medicationDatabase';
import { usePrescriptionSession, DEFAULT_PATIENT } from './hooks/usePrescriptionSession';
import { useWorkContext } from './hooks/useWorkContext';
import { usePwaInstall } from './hooks/usePwaInstall';
import { AsyncErrorBoundary } from './components/AsyncErrorBoundary';

// Carregamento sob demanda com retry resiliente contra falhas de rede ou cache antigo
const loadDocumentEditor = () =>
  import('./components/DocumentEditorView').catch((err) => {
    console.warn('[PresCMed] Tentando carregar Editor novamente após falha inicial:', err);
    return new Promise<{ default: React.ComponentType<any> }>((resolve) =>
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
    localStorage.setItem('prescmed_theme', darkMode ? 'dark' : 'light');
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

  // Fechamento automático da barra lateral ao rolar (apenas abaixo de lg / mobile)
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.innerWidth >= 1024) return;
      const currentScrollY = window.scrollY;
      if (currentScrollY > 30 && currentScrollY > lastScrollY + 5) {
        setSidebarOpen(false);
      }
      lastScrollY = currentScrollY;
    };

    const handleTouchMove = () => {
      if (window.innerWidth >= 1024) return;
      if (window.scrollY > 20) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Pré-carregamento silencioso do Editor de Documentos em background após inicialização
  useEffect(() => {
    const triggerPreload = () => {
      loadDocumentEditor().catch(() => {});
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(triggerPreload, { timeout: 2500 });
      } else {
        setTimeout(triggerPreload, 1200);
      }
    }
  }, []);

  // Navegação entre abas
  const [activeTab, setActiveTab] = useState<ActiveTab>('prescription');
  const [certSubTab, setCertSubTab] = useState<'certificate' | 'referral'>('certificate');
  const [printDocType, setPrintDocType] = useState<'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral'>('prescription');

  const handleNavigateToPrint = (type?: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral') => {
    if (type) {
      setPrintDocType(type);
    }
    setActiveTab('print_preview');
  };

  // Modais
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

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
  const { isInstallable, installApp } = usePwaInstall();

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

  const handleNavigateToEditor = () => {
    setEditorInitialSyncTrigger(prev => prev + 1);
    setActiveTab('editor');
  };

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      className="min-h-screen font-sans antialiased flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      {/* Puxar para atualizar (pull to refresh) desativado com menu ou modal aberto */}
      <PuxarParaAtualizar
        desativado={
          (sidebarOpen && (typeof window !== 'undefined' ? window.innerWidth < 1024 : false)) ||
          isPatientModalOpen ||
          isDoctorModalOpen ||
          isBackupModalOpen
        }
      />

      {/* Top Application Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onGoHome={handleGoHome}
        patient={patient}
        onOpenPatientModal={handleOpenPatientModal}
        onNavigateToEditor={handleNavigateToEditor}
        isInstallable={isInstallable}
        onInstallApp={installApp}
      />

      {/* Main Responsive Body Layout */}
      <div className="flex-1 w-full max-w-screen-2xl container mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 flex gap-4 lg:gap-6 relative min-h-0">
        {/* Desktop & Tablet Persistent Sidebar */}
        <Sidebar
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'patients') {
              handleOpenPatientModal();
              return;
            }
            if (tab === 'editor') {
              handleNavigateToEditor();
              return;
            }
            if (tab === 'certificate') {
              setCertSubTab('certificate');
            } else if (tab === 'referral') {
              setCertSubTab('referral');
            }
            setActiveTab(tab);
          }}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
          onClose={() => setSidebarOpen(false)}
          doctor={doctor}
          patient={patient}
          prescriptionCount={prescriptionItems.length}
          selectedExamsCount={selectedExams.length}
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
          {activeTab === 'prescription' && (
            <PrescriptionBuilder
              darkMode={darkMode}
              doctor={doctor}
              onUpdateDoctor={setDoctor}
              patient={patient}
              onUpdatePatient={setPatient}
              items={prescriptionItems}
              onUpdateItems={setPrescriptionItems}
              weightCalcEnabled={patient.weightCalcEnabled}
              onToggleWeightCalc={handleToggleWeightCalc}
              onClearPrescription={handleClearPrescription}
              onClearPatient={handleClearPatient}
              onNavigateToPrint={() => handleNavigateToPrint('prescription')}
              onNavigateToPediatricCalc={() => setActiveTab('pediatric_calc')}
              onNavigateToEditor={handleNavigateToEditor}
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

          {activeTab === 'exams' && (
            <ExamRequester
              darkMode={darkMode}
              patient={patient}
              selectedExams={selectedExams}
              onUpdateSelectedExams={setSelectedExams}
              onUpdateExams={setSelectedExams}
              clinicalIndication={examIndication}
              onUpdateClinicalIndication={setExamIndication}
              onNavigateToPrint={() => handleNavigateToPrint('exams')}
            />
          )}

          {(activeTab === 'certificate' || activeTab === 'referral') && (
            <CertificateAndReferral
              darkMode={darkMode}
              patient={patient}
              onUpdatePatient={setPatient}
              doctor={doctor}
              certificate={certificate}
              onUpdateCertificate={setCertificate}
              referral={referral}
              onUpdateReferral={setReferral}
              initialSubTab={certSubTab}
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
              onUsarMedicamento={handleUsarMedicamento}
            />
          )}

          {activeTab === 'editor' && (
            <AsyncErrorBoundary moduleName="o Editor de Prescrições e Documentos">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 text-center text-sm opacity-80 gap-3.5">
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
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
                <div className="flex flex-col items-center justify-center p-12 text-center text-sm opacity-80 gap-3.5">
                  <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    Carregando visualização médica e módulos de exportação...
                  </span>
                </div>
              }>
                <PrintPreview
                  darkMode={darkMode}
                  doctor={doctor}
                  patient={patient}
                  prescriptionItems={prescriptionItems}
                  exams={selectedExams}
                  selectedExams={selectedExams}
                  examIndication={examIndication}
                  certificate={certificate}
                  referral={referral}
                  activeContext={activeContext}
                  initialDocType={printDocType}
                  onNavigateBack={() => setActiveTab('prescription')}
                  onBack={() => setActiveTab('prescription')}
                  onClearPrescription={handleClearPrescription}
                  onResetAll={handleResetAll}
                  onOpenDoctorModal={handleOpenDoctorModal}
                  onAbrirPerfilMedico={handleOpenDoctorModal}
                />
              </Suspense>
            </AsyncErrorBoundary>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onSelectTab={(tab) => {
          if (tab === 'editor') {
            handleNavigateToEditor();
            return;
          }
          if (tab === 'certificate') {
            setCertSubTab('certificate');
          } else if (tab === 'referral') {
            setCertSubTab('referral');
          }
          setActiveTab(tab);
        }}
        prescriptionCount={prescriptionItems.length}
        selectedExamsCount={selectedExams.length}
        onOpenMenu={() => setSidebarOpen(true)}
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
