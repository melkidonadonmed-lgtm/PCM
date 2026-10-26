import React, { useState, useEffect } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type { HospitalBedPatientRecord } from '../../core/domain/clinicalEntities';
import type { DoctorProfile, Patient } from '../../types';
import { clinicalRepository } from '../../core/storage/clinicalRepository';
import {
  DEFAULT_HOSPITAL_BEDS_SEED,
  mergeExtractedHospitalDataIntoBed,
  type MultimodalExtractionResult,
} from '../../utils/hospital/hospitalMultimodalIngestor';
import { calculateHospitalStayDays } from '../../utils/hospital/hospitalEvolutionFormatter';
import { HospitalWardCensusGrid } from './HospitalWardCensusGrid';
import {
  HospitalQuickAdmissionModal,
  type QuickAdmissionMode,
} from './HospitalQuickAdmissionModal';
import { HospitalEvolutionFormPanel } from './HospitalEvolutionFormPanel';
import {
  HospitalLabsAndAnalyticsPanel,
  type DashboardMetricSource,
} from './HospitalLabsAndAnalyticsPanel';
import { HospitalBedChatAndSciencePanel } from './HospitalBedChatAndSciencePanel';
import { HospitalMultimodalImportModal } from './HospitalMultimodalImportModal';

export type HospitalSubViewId =
  | 'ward_map'
  | 'evolution_form'
  | 'longitudinal_labs'
  | 'analytics_dashboard'
  | 'science_and_chat';

export interface HospitalWardModuleViewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  onSendToA4Editor: (html: string, title: string) => void;
  beds?: HospitalBedPatientRecord[];
  activeBedId?: string;
  onSelectBedId?: (bedId: string) => void;
  onUpdateBed?: (updated: HospitalBedPatientRecord) => void;
  onCreateBed?: (created: HospitalBedPatientRecord) => void;
  onDeleteBed?: (bedId: string) => void;
  initialSubView?: HospitalSubViewId;
  initialDashboardMetricSource?: DashboardMetricSource;
  initialDashboardScoreAcronym?: string | null;
  onOpenScoreboardForBed?: (bed: HospitalBedPatientRecord, calculatorId?: string) => void;
}

export const HospitalWardModuleView: React.FC<HospitalWardModuleViewProps> = ({
  doctor,
  onSendToA4Editor,
  beds: externalBeds,
  activeBedId: externalActiveBedId,
  onSelectBedId,
  onUpdateBed,
  onCreateBed,
  onDeleteBed,
  initialSubView = 'ward_map',
  initialDashboardMetricSource = 'labs',
  initialDashboardScoreAcronym = null,
  onOpenScoreboardForBed,
}) => {
  const [internalBeds, setInternalBeds] = useState<HospitalBedPatientRecord[]>(
    DEFAULT_HOSPITAL_BEDS_SEED
  );
  const [internalActiveBedId, setInternalActiveBedId] = useState<string>(
    DEFAULT_HOSPITAL_BEDS_SEED[0].id
  );
  const [activeSubView, setActiveSubView] = useState<HospitalSubViewId>(initialSubView);
  const [isMultimodalModalOpen, setIsMultimodalModalOpen] = useState(false);
  const [isQuickAdmissionOpen, setIsQuickAdmissionOpen] = useState(false);
  const [quickAdmissionMode, setQuickAdmissionMode] = useState<QuickAdmissionMode>('manual');

  const beds = externalBeds && externalBeds.length > 0 ? externalBeds : internalBeds;
  const activeBedId = externalActiveBedId || internalActiveBedId;

  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  useEffect(() => {
    if (externalBeds && externalBeds.length > 0) return;
    let mounted = true;
    if (clinicalRepository.listHospitalBeds) {
      clinicalRepository.listHospitalBeds().then((stored) => {
        if (!mounted) return;
        if (stored && stored.length > 0) {
          setInternalBeds(stored);
          setInternalActiveBedId(stored[0].id);
        } else if (clinicalRepository.saveHospitalBed) {
          DEFAULT_HOSPITAL_BEDS_SEED.forEach((b) => {
            clinicalRepository.saveHospitalBed?.(b);
          });
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [externalBeds]);

  const activeBed = beds.find((b) => b.id === activeBedId) || beds[0];

  const handleSelectBed = (id: string) => {
    if (onSelectBedId) {
      onSelectBedId(id);
    } else {
      setInternalActiveBedId(id);
    }
  };

  const handleOpenBedSubView = (
    bedId: string,
    targetView: 'evolution_form' | 'longitudinal_labs' | 'analytics_dashboard' | 'science_and_chat'
  ) => {
    handleSelectBed(bedId);
    setActiveSubView(targetView);
  };

  const handleUpdateBedRecord = (updated: HospitalBedPatientRecord) => {
    if (onUpdateBed) {
      onUpdateBed(updated);
    } else {
      setInternalBeds((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      clinicalRepository.saveHospitalBed?.(updated);
    }
  };

  const handleConfirmQuickAdmission = (created: HospitalBedPatientRecord) => {
    if (onCreateBed) {
      onCreateBed(created);
    } else {
      setInternalBeds((prev) => [...prev, created]);
      setInternalActiveBedId(created.id);
      clinicalRepository.saveHospitalBed?.(created);
    }
    handleSelectBed(created.id);
    setActiveSubView('evolution_form');
  };

  const handleDeleteBedRecord = (bedId: string) => {
    if (onDeleteBed) {
      onDeleteBed(bedId);
    } else {
      setInternalBeds((prev) => {
        const next = prev.filter((b) => b.id !== bedId);
        return next.length > 0 ? next : DEFAULT_HOSPITAL_BEDS_SEED;
      });
      clinicalRepository.deleteHospitalBed?.(bedId);
    }
  };

  const handleOpenQuickAdmissionModal = (mode: QuickAdmissionMode = 'manual') => {
    setQuickAdmissionMode(mode);
    setIsQuickAdmissionOpen(true);
  };

  const handleApplyMultimodalExtraction = (extraction: MultimodalExtractionResult) => {
    const merged = mergeExtractedHospitalDataIntoBed(activeBed, extraction);
    handleUpdateBedRecord(merged);
  };

  const subNavItems: ReadonlyArray<{ id: HospitalSubViewId; label: string; icon: string }> = [
    { id: 'ward_map', label: `Mapa de Leitos (${beds.length})`, icon: 'local_hospital' },
    { id: 'evolution_form', label: 'Evolução & Admissão (EF/LT)', icon: 'clinical_notes' },
    { id: 'longitudinal_labs', label: 'Monitoramento de Exames', icon: 'biotech' },
    { id: 'analytics_dashboard', label: 'Dashboard & Conduta × Evolução', icon: 'monitor_heart' },
    { id: 'science_and_chat', label: 'Assistente Live & Agente Science', icon: 'science' },
  ];

  const suggestedNextBedCode = `110-${beds.length + 15}`;

  return (
    <div id="hospital-ward-module-root" data-state="idle" className="space-y-4">
      {/* Cabeçalho Principal do Módulo Hospitalar */}
      <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-sky-600/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Icon name="local_hospital" size={20} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--text-main)]">
                  Módulo Hospitalar e Gestão de Pacientes
                </h1>
                <Badge tone="clinical" tabular>
                  MOD-03 Ativo
                </Badge>
                <span className="text-xs font-bold text-[var(--text-muted)] clinical-tabular-nums">
                  • {beds.length} leito(s) no censo
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Mapa de leitos da enfermaria, admissão rápida manual ou via IA sem alucinação, evolução padronizada e curva longitudinal
              </p>
            </div>
          </div>

          {/* Ações Globais de Admissão e Escores */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenQuickAdmissionModal('manual')}
              className="btn-tactile-primary h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="person_add" size={15} />
              <span>+ Admitir Paciente</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMultimodalModalOpen(true)}
              className="btn-tactile-secondary h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="auto_awesome" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Importação Multimodal IA</span>
            </button>

            {onOpenScoreboardForBed && (
              <button
                type="button"
                onClick={() => onOpenScoreboardForBed(activeBed)}
                className="btn-tactile-secondary h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer clinical-tabular-nums"
              >
                <Icon name="monitor_heart" size={15} className="text-blue-600 dark:text-blue-400" />
                <span>Escores do Leito ({activeBed.scoreEntries?.length || 0})</span>
              </button>
            )}
          </div>
        </div>

        {/* Trilho Segmentado das 5 Visões Hospitalares (iniciando no Mapa de Leitos) */}
        <div className="grid grid-cols-2 lg:flex lg:items-center gap-1 p-1 rounded-2xl nav-segmented-track">
          {subNavItems.map((tab) => {
            const isActive = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubView(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-h-10 px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'nav-segmented-pill-active font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold'
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={15}
                  filled={isActive}
                  className={isActive ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Barra de Contexto do Paciente Ativo e Troca Rápida (exibida ao entrar em um leito) */}
        {activeSubView !== 'ward_map' && (
          <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubView('ward_map')}
                className="btn-tactile-secondary h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Icon name="arrow_back" size={14} />
                <span>Mapa de Leitos</span>
              </button>

              <div className="min-w-0">
                <span className="text-xs font-extrabold text-sky-700 dark:text-sky-300 clinical-tabular-nums">
                  Leito Ativo: EF/LT {activeBed.wardAndBed}
                </span>
                <span className="text-xs font-semibold text-[var(--text-main)] ml-1.5">
                  — {activeBed.patientNameOrInitials || 'Sem identificação'}
                </span>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Seletor instantâneo de leitos da unidade"
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none"
            >
              {beds.map((bed) => {
                const isSelected = bed.id === activeBed.id;
                const stayDays = calculateHospitalStayDays(bed.dihDateBr);
                return (
                  <button
                    key={bed.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectBed(bed.id)}
                    className={`px-3 py-1.5 rounded-xl border text-left transition cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-sky-600/15 border-sky-500/50 text-[var(--text-main)] font-bold'
                        : 'bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] font-medium'
                    }`}
                  >
                    <span className="text-xs font-extrabold text-sky-700 dark:text-sky-300 clinical-tabular-nums">
                      EF/LT {bed.wardAndBed}
                    </span>
                    <span className="text-xs ml-1.5 truncate max-w-28 inline-block align-bottom">
                      {bed.patientNameOrInitials || 'Sem ID'}
                    </span>
                    {stayDays > 0 && (
                      <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] clinical-tabular-nums">
                        D{stayDays}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Visão 1 (Padrão): Mapa de Leitos / Censo da Enfermaria */}
      {activeSubView === 'ward_map' && (
        <HospitalWardCensusGrid
          beds={beds}
          activeBedId={activeBed.id}
          onOpenBedSubView={handleOpenBedSubView}
          onOpenQuickAdmissionModal={handleOpenQuickAdmissionModal}
          onDeleteBed={handleDeleteBedRecord}
        />
      )}

      {/* Visão 2: Prontuário de Evolução e Admissão do Leito */}
      {activeSubView === 'evolution_form' && (
        <HospitalEvolutionFormPanel
          bedRecord={activeBed}
          doctor={doctor}
          onUpdateBedRecord={handleUpdateBedRecord}
          onOpenMultimodalModal={() => setIsMultimodalModalOpen(true)}
          onSendToA4Editor={onSendToA4Editor}
        />
      )}

      {/* Visão 3 e 4: Monitoramento Longitudinal de Exames e Dashboard Conduta x Evolução */}
      {(activeSubView === 'longitudinal_labs' || activeSubView === 'analytics_dashboard') && (
        <HospitalLabsAndAnalyticsPanel
          mode={activeSubView}
          bedRecord={activeBed}
          onUpdateBedRecord={handleUpdateBedRecord}
          initialMetricSource={initialDashboardMetricSource}
          initialScoreAcronym={initialDashboardScoreAcronym}
          onOpenScoreboardForBed={
            onOpenScoreboardForBed
              ? (calcId) => onOpenScoreboardForBed(activeBed, calcId)
              : undefined
          }
        />
      )}

      {/* Visão 5: Assistente Live e Agente Science */}
      {activeSubView === 'science_and_chat' && (
        <HospitalBedChatAndSciencePanel
          allBeds={beds}
          activeBed={activeBed}
          onSelectBed={(id) => handleSelectBed(id)}
          onUpdateBed={handleUpdateBedRecord}
        />
      )}

      {/* Modal de Nova Admissão Rápida (Manual ou Prontuário Colado em Novo Leito) */}
      <HospitalQuickAdmissionModal
        isOpen={isQuickAdmissionOpen}
        initialMode={quickAdmissionMode}
        suggestedBedCode={suggestedNextBedCode}
        onClose={() => setIsQuickAdmissionOpen(false)}
        onConfirmNewBed={handleConfirmQuickAdmission}
      />

      {/* Modal de Importação Multimodal para Atualizar o Leito Ativo */}
      <HospitalMultimodalImportModal
        isOpen={isMultimodalModalOpen}
        activeBedCode={activeBed.wardAndBed}
        onClose={() => setIsMultimodalModalOpen(false)}
        onApplyExtraction={handleApplyMultimodalExtraction}
      />
    </div>
  );
};

export default HospitalWardModuleView;
