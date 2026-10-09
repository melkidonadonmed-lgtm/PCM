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
    { id: 'certificate', label: 'Atestado Médico', icon: Award },
    { id: 'referral', label: 'Encaminhamento', icon: Share2 },
    { id: 'exams', label: 'Pedidos de Exames', icon: FlaskConical },
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
          backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
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

        {/* Grupo de Pílulas Táteis (WAI-ARIA APG Tabs & Roving Tabindex) */}
        <nav 
          role="tablist" 
          aria-label="Documentos clínicos disponíveis"
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] overflow-x-auto scrollbar-none"
        >
          {/* Pílula: Atestado Médico */}
          <button
            id="clinical-doc-tab-certificate"
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'certificate'}
            aria-controls="clinical-doc-panel-certificate"
            tabIndex={activeSubTab === 'certificate' ? 0 : -1}
            onClick={() => setActiveSubTab('certificate')}
            onKeyDown={(e) => handleTabKeyDown(e, 'certificate')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              activeSubTab === 'certificate'
                ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border border-navy-800 dark:border-blue-400/30 shadow-tactile-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Atestado Médico</span>
            {certificate?.daysOff > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {certificate.daysOff}d
              </span>
            )}
          </button>

          {/* Pílula: Encaminhamento */}
          <button
            id="clinical-doc-tab-referral"
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'referral'}
            aria-controls="clinical-doc-panel-referral"
            tabIndex={activeSubTab === 'referral' ? 0 : -1}
            onClick={() => setActiveSubTab('referral')}
            onKeyDown={(e) => handleTabKeyDown(e, 'referral')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              activeSubTab === 'referral'
                ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border border-navy-800 dark:border-blue-400/30 shadow-tactile-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Encaminhamento</span>
            {referral?.destinationSpecialty && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 max-w-[90px] truncate">
                {referral.destinationSpecialty.split(' ')[0]}
              </span>
            )}
          </button>

          {/* Pílula: Solicitação de Exames */}
          <button
            id="clinical-doc-tab-exams"
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'exams'}
            aria-controls="clinical-doc-panel-exams"
            tabIndex={activeSubTab === 'exams' ? 0 : -1}
            onClick={() => setActiveSubTab('exams')}
            onKeyDown={(e) => handleTabKeyDown(e, 'exams')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              activeSubTab === 'exams'
                ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border border-navy-800 dark:border-blue-400/30 shadow-tactile-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Pedidos de Exames</span>
            {selectedExams?.length > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {selectedExams.length}
              </span>
            )}
          </button>

          {/* Pílula: Documentos Oficiais do SUS */}
          <button
            id="clinical-doc-tab-sus"
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'sus'}
            aria-controls="clinical-doc-panel-sus"
            tabIndex={activeSubTab === 'sus' ? 0 : -1}
            onClick={() => setActiveSubTab('sus')}
            onKeyDown={(e) => handleTabKeyDown(e, 'sus')}
            className={`min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              activeSubTab === 'sus'
                ? 'bg-navy-900 text-white dark:bg-blue-600 dark:text-white border border-navy-800 dark:border-blue-400/30 shadow-tactile-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Documentos SUS</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
              9
            </span>
          </button>
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
