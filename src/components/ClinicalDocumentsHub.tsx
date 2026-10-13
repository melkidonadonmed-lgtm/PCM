import React, { useState } from 'react';
import { Award, Share2, FlaskConical, FileText } from 'lucide-react';
import { MedicalCertificate, MedicalReferral, ExamItem, Patient, DoctorProfile, WorkContext } from '../types';
import { CertificateAndReferral } from './CertificateAndReferral';
import { ExamRequester } from './ExamRequester';
import { SusDocumentsFiller } from './SusDocumentsFiller';

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
  onNavigateToPrint,
  onNavigateToEditorWithHtml
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DocumentsSubTab>(initialSubTab);

  // Sincroniza se o initialSubTab mudar externamente
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const tabsList: { id: DocumentsSubTab; label: string; icon: typeof Award; badge?: string }[] = [
    {
      id: 'certificate',
      label: 'Atestado Médico',
      icon: Award,
      badge: certificate?.daysOff > 0 ? `${certificate.daysOff}d` : undefined
    },
    {
      id: 'referral',
      label: 'Encaminhamento',
      icon: Share2,
      badge: referral?.destinationSpecialty ? referral.destinationSpecialty.split(' ')[0] : undefined
    },
    {
      id: 'exams',
      label: 'Pedidos de Exames',
      icon: FlaskConical,
      badge: selectedExams?.length > 0 ? `${selectedExams.length}` : undefined
    },
    { id: 'sus', label: 'Documentos SUS', icon: FileText, badge: '9' }
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
      setActiveSubTab(nextTab);
      const tabElement = document.getElementById(`clinical-doc-tab-${nextTab}`);
      tabElement?.focus();
    }
  };

  const patientName = patient?.name?.trim() || 'Paciente não identificado';
  const hasPatient = Boolean(patient?.name?.trim());

  return (
    <div id="clinical-documents-hub" className="space-y-4 sm:space-y-5 animate-tab-fade">
      {/* Barra de Navegação Superior em Pílulas Táteis Minerais */}
      <div 
        className="tactile-card p-2 sm:p-2.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'
        }}
      >
        {/* Identificação do Contexto Clínico */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Central de Documentos Clínicos
            </span>
            <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate block">
              {hasPatient ? patientName : 'Vincule um paciente para emissão'}
            </span>
          </div>
        </div>

        {/* Abas dos documentos (WAI-ARIA APG Tabs com roving tabindex). A aba inativa tem cara de botão — fundo, borda e sombra — para ficar claro que é clicável. */}
        <nav
          role="tablist"
          aria-label="Documentos clínicos disponíveis"
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-inset)] overflow-x-auto scrollbar-none"
        >
          {tabsList.map((tab) => {
            const TabIcon = tab.icon;
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
                onClick={() => setActiveSubTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                className={`min-h-[42px] px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                  isActive
                    ? 'bg-navy-900 border-navy-900 text-white dark:bg-blue-600 dark:border-blue-600'
                    : 'bg-[var(--surface-card)] border-[var(--border-medium)] text-[var(--text-secondary)] shadow-tactile-sm hover:border-[var(--border-strong)] hover:text-[var(--text-main)]'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full max-w-[90px] truncate ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[var(--surface-inset)] text-[var(--text-muted)]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Renderização Condicional da Ilha Selecionada com Tabpanel Semântico */}
      <div 
        id={`clinical-doc-panel-${activeSubTab}`}
        role="tabpanel"
        aria-labelledby={`clinical-doc-tab-${activeSubTab}`}
        tabIndex={0}
        className="w-full focus:outline-none"
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
            onSelectSubTab={(tab) => setActiveSubTab(tab)}
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
    </div>
  );
};
