import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_TAB,
  TAB_TITLES,
  hashMatchesTab,
  hashToTab,
  tabToHash,
  type RouteTab
} from './utils/navigation';
import { safeStorage, getStorageMessages, downloadLocalBackup } from './utils/storage';
import { normalizePrescriptionItem } from './utils/prescriptionRules';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PediatricCalculator } from './components/PediatricCalculator';
import { PrescriptionBuilder } from './components/PrescriptionBuilder';
import { ExamRequester } from './components/ExamRequester';
import { CertificateAndReferral } from './components/CertificateAndReferral';
import { ClinicalProtocolsView } from './components/ClinicalProtocolsView';
import { PrintPreview } from './components/PrintPreview';
import { PatientModal } from './components/PatientModal';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { 
  ActiveTab, 
  DoctorProfile, 
  Patient, 
  PrescriptionItem, 
  ExamItem, 
  MedicalCertificate, 
  MedicalReferral 
} from './types';

const DEFAULT_DOCTOR: DoctorProfile = {
  name: '',
  crm: '',
  crmState: 'SP',
  specialty: 'Clínica Médica',
  rqe: '',
  clinicName: '',
  address: '',
  cityState: '',
  phone: '',
  email: '',
  showSignature: true,
  stampText: ''
};

const DEFAULT_PATIENT: Patient = {
  id: '',
  name: '',
  weightKg: 0,
  birthDate: '',
  ageText: '',
  gender: 'male',
  documentNumber: '',
  phone: '',
  allergies: []
};

export default function App() {
  // Theme state (Tema Claro como padrão preferido pelo usuário)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = safeStorage.getItem('prescmed_theme');
    return saved !== null ? saved === 'dark' : false;
  });

  // Responsive sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Keep sidebar in sync with the desktop/mobile breakpoint (covers cases where the
  // initial width check races with the viewport still settling on first paint)
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

  // Navigation state
  const [consultationVersion, setConsultationVersion] = useState(0);
  const [printOrigin, setPrintOrigin] = useState<ActiveTab>('prescription');
  const [storageWarnings, setStorageWarnings] = useState<string[]>(getStorageMessages);
  useEffect(() => {
    const update = () => setStorageWarnings(getStorageMessages());
    window.addEventListener('prescmed-storage-warning', update); update();
    return () => window.removeEventListener('prescmed-storage-warning', update);
  }, []);
  // A tela inicial vem da URL: recarregar, favoritar ou compartilhar um link
  // passa a devolver o usuario ao mesmo lugar.
  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    typeof window === 'undefined' ? DEFAULT_TAB : hashToTab(window.location.hash)
  );
  const [certSubTab, setCertSubTab] = useState<'certificate' | 'referral'>(() =>
    typeof window !== 'undefined' && hashToTab(window.location.hash) === 'referral'
      ? 'referral'
      : 'certificate'
  );
  const [printDocType, setPrintDocType] = useState<'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral'>('prescription');

  // Regiao viva que anuncia a troca de tela e destino do foco apos navegar.
  const mainRef = useRef<HTMLElement>(null);
  const primeiroRenderRef = useRef(true);

  // Aplica um destino sem tocar no historico. Usado tanto pela navegacao do
  // usuario quanto pelos botoes Voltar/Avancar do navegador.
  const applyTab = useCallback((tab: RouteTab) => {
    if (tab === 'certificate') {
      setCertSubTab('certificate');
    } else if (tab === 'referral') {
      setCertSubTab('referral');
    }
    setActiveTab(tab);

    // Auto-close sidebar on mobile/tablet viewports
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    // Always scroll to top when navigating between clinical areas
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Centralized tab navigation. `patients` nao e um destino: abre um modal.
  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'patients') {
      setIsPatientModalOpen(true);
      return;
    }
    applyTab(tab as RouteTab);
  };

  // activeTab -> URL. Cada destino vira uma entrada de historico, entao o
  // botao Voltar do navegador passa a voltar de tela em vez de sair do app.
  useEffect(() => {
    if (activeTab === 'patients' || activeTab === 'models') return;
    const tab = activeTab as RouteTab;
    if (hashMatchesTab(window.location.hash, tab)) return;
    if (primeiroRenderRef.current) {
      // Normaliza a URL de entrada sem empilhar uma entrada extra.
      window.history.replaceState(null, "", tabToHash(tab));
    } else {
      window.history.pushState(null, "", tabToHash(tab));
    }
  }, [activeTab]);

  // URL -> activeTab. popstate cobre Voltar/Avancar; hashchange cobre a URL
  // editada na mao ou um link colado na barra de enderecos.
  useEffect(() => {
    const sincronizar = () => applyTab(hashToTab(window.location.hash));
    window.addEventListener('popstate', sincronizar);
    window.addEventListener('hashchange', sincronizar);
    return () => {
      window.removeEventListener('popstate', sincronizar);
      window.removeEventListener('hashchange', sincronizar);
    };
  }, [applyTab]);

  // Troca de tela move o foco para o conteudo e anuncia o destino. Sem isso a
  // navegacao e silenciosa: o foco ficava parado no botao da barra lateral.
  useEffect(() => {
    if (primeiroRenderRef.current) {
      primeiroRenderRef.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [activeTab, certSubTab]);

  const handleNavigateToPrint = (type?: 'prescription' | 'special_prescription' | 'exams' | 'certificate' | 'referral') => {
    if (type) {
      setPrintDocType(type);
    }
    setPrintOrigin(activeTab === 'print_preview' ? printOrigin : activeTab);
    applyTab('print_preview');
  };

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // Doctor profile state
  const [doctor, setDoctor] = useState<DoctorProfile>(() => {
    try {
      const saved = safeStorage.getItem('prescmed_doctor');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_DOCTOR, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading doctor from localStorage:', e);
    }
    return DEFAULT_DOCTOR;
  });

  // Patient state (starts clean)
  const [patient, setPatient] = useState<Patient>(() => {
    try {
      const saved = safeStorage.getItem('prescmed_patient');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_PATIENT, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading patient from localStorage:', e);
    }
    return DEFAULT_PATIENT;
  });

  // Prescription items state (starts clean)
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>(() => {
    const saved = safeStorage.getItem('prescmed_prescription');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(normalizePrescriptionItem);
      } catch (e) {}
    }
    return [];
  });

  // Selected exams state
  const [selectedExams, setSelectedExams] = useState<ExamItem[]>(() => {
    const saved = safeStorage.getItem('prescmed_exams');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Clinical indication for exams
  const [examIndication, setExamIndication] = useState<string>(() => {
    return safeStorage.getItem('prescmed_exam_indication') || 'Investigação clínica de rotina e controle metabólico.';
  });

  // Medical certificate state
  const [certificate, setCertificate] = useState<MedicalCertificate>(() => {
    const saved = safeStorage.getItem('prescmed_certificate');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    return {
      id: 'cert-1',
      patientName: '',
      documentType: 'CPF',
      documentNumber: '',
      daysOff: 2,
      startDate: today,
      endDate: tomorrow,
      periodText: 'por motivo de doença e necessidade de repouso',
      includeCID: false,
      cid10Code: 'J00',
      cid10Description: 'Nasofaringite aguda (resfriado comum)',
      observations: 'Paciente necessita de repouso e hidratação domiciliar durante o período estipulado.',
      cityDateText: (doctor.cityState || 'Brasil') + ', ' + new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  });

  // Medical referral state
  const [referral, setReferral] = useState<MedicalReferral>(() => {
    const saved = safeStorage.getItem('prescmed_referral');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'ref-1',
      patientName: '',
      documentNumber: '',
      destinationSpecialty: 'Cardiologia Ambulatorial',
      destinationInstitution: 'Ambulatório de Especialidades',
      priority: 'prioritario',
      reason: 'Investigação diagnóstica e acompanhamento especializado.',
      clinicalSummary: 'Paciente com indicação de avaliação especializada.',
      relevantExams: '',
      hypothesisCID: '',
      date: new Date().toISOString().split('T')[0]
    };
  });

  // Sync to localStorage
  useEffect(() => {
    safeStorage.setItem('prescmed_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    safeStorage.setItem('prescmed_doctor', JSON.stringify(doctor));
  }, [doctor]);

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

  useEffect(() => {
    safeStorage.setItem('prescmed_prescription', JSON.stringify(prescriptionItems));
  }, [prescriptionItems]);

  useEffect(() => {
    safeStorage.setItem('prescmed_exams', JSON.stringify(selectedExams));
  }, [selectedExams]);

  useEffect(() => {
    safeStorage.setItem('prescmed_exam_indication', examIndication);
  }, [examIndication]);

  useEffect(() => {
    safeStorage.setItem('prescmed_certificate', JSON.stringify(certificate));
  }, [certificate]);

  useEffect(() => {
    safeStorage.setItem('prescmed_referral', JSON.stringify(referral));
  }, [referral]);

  // Handler to update patient weight from anywhere
  const handleUpdatePatientWeight = (newWeight: number) => {
    setPatient(prev => ({ ...prev, weightKg: newWeight }));
  };

  // Handler to toggle weight calculation mode
  const handleToggleWeightCalc = (enabled: boolean) => {
    setPatient(prev => ({ ...prev, weightCalcEnabled: enabled }));
  };

  // Add prescription item handler
  const handleAddPrescriptionItem = (newItem: PrescriptionItem) => {
    setPrescriptionItems(prev => [...prev, normalizePrescriptionItem(newItem)]);
  };

  // Clear prescription items (zerar receita)
  const handleClearPrescription = () => {
    setPrescriptionItems([]);
    safeStorage.removeItem('prescmed_prescription');
  };

  // Clear patient data (limpar dados do paciente globalmente)
  const handleClearPatient = () => {
    const emptyPatient: Patient = {
      id: 'patient-' + Date.now(),
      name: '',
      weightKg: 0,
      birthDate: '',
      ageText: '',
      gender: 'male',
      documentNumber: '',
      phone: '',
      allergies: [],
      motherName: '',
      notes: ''
    };
    setPatient(emptyPatient);
    setCertificate(prev => ({
      ...prev,
      patientName: '',
      documentNumber: ''
    }));
    setReferral(prev => ({
      ...prev,
      patientName: '',
      documentNumber: ''
    }));
    safeStorage.setItem('prescmed_patient', JSON.stringify(emptyPatient));
  };

  // Clear doctor profile
  const handleClearDoctor = () => {
    setDoctor(DEFAULT_DOCTOR);
    safeStorage.setItem('prescmed_doctor', JSON.stringify(DEFAULT_DOCTOR));
  };

  // Reset entire consultation (Zerar tudo: paciente + receitas + exames + documentos)
  const handleResetAll = () => {
    if (!window.confirm('Iniciar novo atendimento? Os dados e documentos do atendimento atual serão limpos.')) return;
    handleClearPatient();
    handleClearPrescription();
    setConsultationVersion(v => v + 1);
    setExamIndication('');
    setCertificate(prev => ({ ...prev, patientName: '', documentNumber: '', includeCID: false, cid10Code: '', cid10Description: '', observations: '', daysOff: 1, startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10) }));
    setReferral(prev => ({ ...prev, patientName: '', documentNumber: '', destinationSpecialty: '', destinationInstitution: '', reason: '', clinicalSummary: '', relevantExams: '', hypothesisCID: '', date: new Date().toISOString().slice(0, 10) }));
    setSelectedExams([]);
    safeStorage.removeItem('prescmed_exams');
    setActiveTab('prescription');
  };

  return (
    <div 
      className="min-h-screen font-sans antialiased flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
      {/* Atalho de teclado para pular a navegacao: 12+ paradas de tabulacao
          separavam o inicio da pagina do conteudo no desktop. */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:px-4 focus:py-3 focus:min-h-[44px] focus:inline-flex focus:items-center focus:rounded-xl focus:bg-navy-900 focus:text-white focus:font-bold focus:text-sm focus:shadow-tactile-lg focus:outline-3 focus:outline-sky-400 focus:outline-offset-2"
        onClick={() => mainRef.current?.focus({ preventScroll: true })}
      >
        Pular para o conteúdo
      </a>

      {/* Anuncio de troca de tela para leitores de tela. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {activeTab === 'patients' || activeTab === 'models'
          ? ''
          : TAB_TITLES[activeTab as RouteTab]}
      </p>

      {/* Top Application Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        patient={patient}
        onOpenPatientModal={() => setIsPatientModalOpen(true)}
        prescriptionCount={prescriptionItems.length}
        selectedExamsCount={selectedExams.length}
        onQuickWeightChange={handleUpdatePatientWeight}
      />

      {/* Main Responsive Body Layout */}
      <div className="flex-1 w-full max-w-screen-2xl container mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 flex gap-4 lg:gap-6 relative min-h-0">
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
          selectedExamsCount={selectedExams.length}
          onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
          onOpenPatientModal={() => setIsPatientModalOpen(true)}
          onClearPrescription={handleClearPrescription}
          onClearPatient={handleClearPatient}
          onResetAll={handleResetAll}
        />

        {/* Main Content Area */}
        <main
          id="conteudo-principal"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 min-w-0 pb-20 lg:pb-6 outline-none"
        >
          {storageWarnings.length > 0 && <aside role="alert" className="clinical-card m-4 p-4 no-print"><p className="font-semibold">Atenção ao salvamento local</p>{storageWarnings.map(w => <p key={w} className="text-sm mt-1">{w}</p>)}<button className="clinical-button secondary mt-3" onClick={downloadLocalBackup}>Baixar backup dos dados originais</button></aside>}
          <div hidden={activeTab !== 'prescription'}>
            <PrescriptionBuilder
              key={consultationVersion}
              isActive={activeTab === 'prescription'}
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
              onNavigateToPrint={() => handleNavigateToPrint('prescription')}
              onNavigateToPediatricCalc={() => handleSelectTab('pediatric_calc')}
              onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
              onOpenPatientModal={() => setIsPatientModalOpen(true)}
            />
          </div>

          {activeTab === 'pediatric_calc' && (
            <PediatricCalculator
              darkMode={darkMode}
              patient={patient}
              onUpdatePatientWeight={handleUpdatePatientWeight}
              onAddPrescriptionItem={handleAddPrescriptionItem}
              onNavigateToPrescription={() => handleSelectTab('prescription')}
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
              activeSubTab={certSubTab}
              onSelectSubTab={handleSelectTab}
              onNavigateToPrint={(type) => handleNavigateToPrint(type)}
            />
          )}

          {activeTab === 'protocols' && (
            <ClinicalProtocolsView
              darkMode={darkMode}
              patient={patient}
              onAddPrescriptionItem={handleAddPrescriptionItem}
              onNavigateToPrescription={() => handleSelectTab('prescription')}
            />
          )}

          {activeTab === 'print_preview' && (
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
              initialDocType={printDocType}
              onNavigateBack={() => handleSelectTab(printOrigin)}
              onOpenPatientModal={() => setIsPatientModalOpen(true)}
              onBack={() => handleSelectTab(printOrigin)}
              onClearPrescription={handleClearPrescription}
              onResetAll={handleResetAll}
              onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        onSelectTab={handleSelectTab}
        prescriptionCount={prescriptionItems.length}
        selectedExamsCount={selectedExams.length}
        onOpenMenu={() => setSidebarOpen(true)}
      />

      {/* Modals */}
      {isPatientModalOpen && (
        <PatientModal
          darkMode={darkMode}
          patient={patient}
          onSavePatient={setPatient}
          onClearPatient={handleClearPatient}
          onClose={() => setIsPatientModalOpen(false)}
        />
      )}

      {isDoctorModalOpen && (
        <DoctorProfileModal
          darkMode={darkMode}
          doctor={doctor}
          onSaveDoctor={setDoctor}
          onClearDoctor={handleClearDoctor}
          onClose={() => setIsDoctorModalOpen(false)}
        />
      )}
    </div>
  );
}
