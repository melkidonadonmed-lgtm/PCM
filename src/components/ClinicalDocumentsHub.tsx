import React, { useState } from 'react';
import { MedicalCertificate, MedicalReferral, ExamItem, Patient, DoctorProfile, WorkContext } from '../types';
import { CertificateAndReferral } from './CertificateAndReferral';
import { ExamRequester } from './ExamRequester';
import { SusDocumentsFiller } from './SusDocumentsFiller';
import { Icon, IconName } from './Icon';
import { SoftCard } from './ui/SoftCard';
import { SurfaceCard } from './ui/SurfaceCard';

/**
 * Ilha Central de Documentos Clínicos.
 * Estados de UI cobertos: empty (nenhum exame/documento preenchido), loading (carregando sub-módulo),
 * success (dados prontos para emissão) e error (falha de validação do emitente).
 */
export type DocumentsSubTab = 'certificate' | 'referral' | 'exams' | 'sus';

interface ClinicalDocumentsHubProps {
  darkMode: boolean;
  patient: Patient;
  onUpdatePatient?: (patient: Patient) => void;
  doctor: DoctorProfile;
  activeContext?: WorkContext | null;
  certificate: MedicalCertificate;
  onUpdateCertificate: (cert: MedicalCertificate) => void;
  referral: MedicalReferral;
  onUpdateReferral: (ref: MedicalReferral) => void;
  selectedExams: ExamItem[];
  onUpdateSelectedExams: (exams: ExamItem[]) => void;
  clinicalIndication: string;
  onUpdateClinicalIndication: (text: string) => void;
  initialSubTab?: DocumentsSubTab;
  onSubTabChange?: (subTab: DocumentsSubTab) => void;
  onNavigateToPrint: (docType?: 'certificate' | 'referral' | 'exams') => void;
  onNavigateToEditorWithHtml?: (html: string, title: string, type?: 'prescription' | 'referral' | 'certificate' | 'sus' | 'custom') => void;
}

export const ClinicalDocumentsHub: React.FC<ClinicalDocumentsHubProps> = ({
  darkMode,
  patient,
  onUpdatePatient,
  doctor,
  activeContext,
  certificate,
  onUpdateCertificate,
  referral,
  onUpdateReferral,
  selectedExams,
  onUpdateSelectedExams,
  clinicalIndication,
  onUpdateClinicalIndication,
  initialSubTab = 'certificate',
  onSubTabChange,
  onNavigateToPrint,
  onNavigateToEditorWithHtml
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DocumentsSubTab>(initialSubTab);

  const handleChangeSubTab = React.useCallback((nextTab: DocumentsSubTab) => {
    setActiveSubTab(nextTab);
    onSubTabChange?.(nextTab);
  }, [onSubTabChange]);

  // Sincroniza se o initialSubTab mudar externamente
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const tabsList: { id: DocumentsSubTab; label: string; icon: IconName; badge?: string }[] = [
    {
      id: 'certificate',
      label: 'Atestado médico',
      icon: 'atestado'
    },
    {
      id: 'referral',
      label: 'Encaminhamento',
      icon: 'encaminhamento'
    },
    {
      id: 'exams',
      label: 'Pedidos de exames',
      icon: 'exame',
      badge: selectedExams?.length > 0 ? `${selectedExams.length}` : undefined
    },
    { id: 'sus', label: 'Documentos SUS', icon: 'description' }
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent, currentId: DocumentsSubTab) => {
    const currentIndex = tabsList.findIndex(t => t.id === currentId);
    let targetIndex = -1;

    if (e.key === 'ArrowRight') {
      targetIndex = (currentIndex + 1) % tabsList.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (currentIndex - 1 + tabsList.length) % tabsList.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = tabsList.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      const nextTab = tabsList[targetIndex].id;
      handleChangeSubTab(nextTab);
      const tabElement = document.getElementById(`clinical-doc-tab-${nextTab}`);
      tabElement?.focus();
    }
  };

  const patientName = patient?.name?.trim() || 'Paciente não identificado';
  const hasPatient = Boolean(patient?.name?.trim());

  return (
    <SurfaceCard as="div" state="idle" id="clinical-documents-hub" className="max-w-7xl mx-auto space-y-4 sm:space-y-5 !p-0 !bg-transparent !border-none !shadow-none">
      {/* Barra de Navegação Superior em Pílulas Táteis Minerais */}
      <SoftCard variant="flat" className="card-surface p-2.5 sm:p-3 rounded-2xl border border-subtle dark:border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Identificação do Contexto Clínico */}
        <div className="flex items-center gap-2.5 px-2">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasPatient ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Central de documentos clínicos
            </span>
            <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate block">
              {hasPatient ? patientName : 'Vincule um paciente para emissão'}
            </span>
          </div>
        </div>

        {/* Abas dos documentos no padrão normal (sem depressão interna) */}
        <nav
          role="tablist"
          aria-label="Documentos clínicos disponíveis"
          className="flex items-center gap-2 overflow-x-auto scrollbar-none"
        >
          {tabsList.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`clinical-doc-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`clinical-doc-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleChangeSubTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                className={`h-10 min-h-[40px] px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                  isActive
                    ? 'bg-navy-900 border-navy-900 text-white dark:bg-[#0369A1] dark:border-transparent shadow-tactile-sm'
                    : 'bg-slate-100 dark:bg-[#27354A] border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#334155] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={17}
                  filled={isActive}
                  className={isActive ? 'text-white' : 'text-sky-600 dark:text-sky-400'}
                />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded-full max-w-[90px] truncate clinical-tabular-nums ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </SoftCard>

      {/* Renderização Condicional da Ilha Selecionada com Tabpanel Semântico */}
      <div 
        key={activeSubTab}
        id={`clinical-doc-panel-${activeSubTab}`}
        role="tabpanel"
        aria-labelledby={`clinical-doc-tab-${activeSubTab}`}
        tabIndex={0}
        className="w-full focus:outline-none animate-tab-fade"
      >
        {(activeSubTab === 'certificate' || activeSubTab === 'referral') && (
          <CertificateAndReferral
            darkMode={darkMode}
            patient={patient}
            onUpdatePatient={onUpdatePatient}
            doctor={doctor}
            certificate={certificate}
            onUpdateCertificate={onUpdateCertificate}
            referral={referral}
            onUpdateReferral={onUpdateReferral}
            activeSubTab={activeSubTab}
            onSelectSubTab={(tab) => handleChangeSubTab(tab)}
            onNavigateToPrint={(docType) => onNavigateToPrint(docType)}
            onNavigateToEditorWithHtml={onNavigateToEditorWithHtml}
            hideSubNav={true}
          />
        )}

        {activeSubTab === 'exams' && (
          <ExamRequester
            darkMode={darkMode}
            patient={patient}
            selectedExams={selectedExams}
            onUpdateSelectedExams={onUpdateSelectedExams}
            onUpdateExams={onUpdateSelectedExams}
            clinicalIndication={clinicalIndication}
            onUpdateClinicalIndication={onUpdateClinicalIndication}
            onNavigateToPrint={() => onNavigateToPrint('exams')}
          />
        )}

        {activeSubTab === 'sus' && (
          <SusDocumentsFiller
            darkMode={darkMode}
            patient={patient}
            onUpdatePatient={onUpdatePatient}
            doctor={doctor}
            activeContext={activeContext}
            onNavigateToEditorWithHtml={onNavigateToEditorWithHtml}
            onNavigateToPrint={() => onNavigateToPrint('exams')}
          />
        )}
      </div>
    </SurfaceCard>
  );
};
