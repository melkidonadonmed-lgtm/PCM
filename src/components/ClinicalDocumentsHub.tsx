import React, { useState } from 'react';
import { MedicalCertificate, MedicalReferral, ExamItem, Patient, DoctorProfile, WorkContext, SusDocumentId } from '../types';
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
  initialSusDocId?: SusDocumentId | null;
  susCatalogResetTrigger?: number;
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
  initialSusDocId = null,
  susCatalogResetTrigger = 0,
  onSubTabChange,
  onNavigateToPrint,
  onNavigateToEditorWithHtml
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DocumentsSubTab>(initialSubTab);
  const [localSusResetTrigger, setLocalSusResetTrigger] = useState(0);

  const handleChangeSubTab = React.useCallback((nextTab: DocumentsSubTab) => {
    if (nextTab === 'sus' && activeSubTab === 'sus') {
      setLocalSusResetTrigger((prev) => prev + 1);
    }
    setActiveSubTab(nextTab);
    onSubTabChange?.(nextTab);
  }, [activeSubTab, onSubTabChange]);

  // Sincroniza se o initialSubTab mudar externamente
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const certificateBadge =
    certificate?.includeCID && certificate?.cid10Code?.trim()
      ? certificate.cid10Code.trim()
      : certificate?.daysOff && certificate.daysOff > 0
        ? `${certificate.daysOff}d`
        : undefined;

  const referralBadge = referral?.destinationSpecialty?.trim()
    ? referral.destinationSpecialty.trim().split(' ')[0]
    : undefined;

  const tabsList: { id: DocumentsSubTab; label: string; regulatoryTag: string; icon: IconName; badge?: string }[] = [
    {
      id: 'certificate',
      label: 'Atestado médico',
      regulatoryTag: 'Res. CFM 1.658/2002',
      icon: 'atestado',
      badge: certificateBadge
    },
    {
      id: 'referral',
      label: 'Encaminhamento',
      regulatoryTag: 'Regulação Clínica',
      icon: 'encaminhamento',
      badge: referralBadge
    },
    {
      id: 'exams',
      label: 'Pedidos de exames',
      regulatoryTag: 'SADT • Lab & Imagem',
      icon: 'exame',
      badge: selectedExams?.length > 0 ? `${selectedExams.length}` : undefined
    },
    {
      id: 'sus',
      label: 'Documentos SUS',
      regulatoryTag: 'APAC • LME • SISREG • GAL • SISCAN',
      icon: 'description',
      badge: '9'
    }
  ];

  const activeTabInfo = tabsList.find(t => t.id === activeSubTab) || tabsList[0];

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
      {/* Barra de Navegação Superior em Trilho Segmentado Esculpido */}
      <SoftCard variant="flat" className="card-surface p-2.5 sm:p-3.5 rounded-2xl border border-subtle dark:border-strong flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Identificação do Contexto Clínico em 3 Níveis (Squint Test) */}
        <div className="flex items-center gap-3 px-1.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            hasPatient
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-muted)]'
          }`}>
            <Icon name={activeTabInfo.icon} size={18} filled />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Central de documentos clínicos
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 clinical-tabular-nums">
                {activeTabInfo.regulatoryTag}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${hasPatient ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                {hasPatient ? patientName : 'Vincule um paciente para emissão'}
              </span>
              {hasPatient && patient.weightKg > 0 && (
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 clinical-unit clinical-tabular-nums shrink-0">
                  • {patient.weightKg.toLocaleString('pt-BR')} kg
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Abas dos documentos em Trilho Segmentado Esculpido (.nav-segmented-track) */}
        <nav
          role="tablist"
          aria-label="Documentos clínicos disponíveis"
          className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 rounded-2xl nav-segmented-track w-full lg:w-auto"
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
                className={`h-9 min-h-[40px] w-full sm:w-auto min-w-0 px-2.5 sm:px-4 rounded-xl border text-xs flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 transition cursor-pointer sm:shrink-0 whitespace-nowrap active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                  isActive
                    ? 'bg-navy-900 border-navy-900 text-white dark:bg-[#0369A1] dark:border-sky-400/30 font-bold shadow-tactile-sm'
                    : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] font-semibold'
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                  filled={isActive}
                  className={`shrink-0 ${isActive ? 'text-sky-300 dark:text-white' : 'text-sky-600 dark:text-sky-400 opacity-85'}`}
                />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full max-w-[96px] truncate shrink-0 clinical-unit clinical-tabular-nums ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[var(--surface-card)] text-[var(--text-main)] border border-[var(--border-subtle)]'
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
            initialDocId={initialSusDocId}
            catalogResetTrigger={susCatalogResetTrigger + localSusResetTrigger}
            onNavigateToEditorWithHtml={onNavigateToEditorWithHtml}
            onNavigateToPrint={() => onNavigateToPrint('exams')}
          />
        )}
      </div>
    </SurfaceCard>
  );
};
