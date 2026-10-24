import React, { useState, useEffect } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type { HospitalBedPatientRecord } from '../../core/domain/clinicalEntities';
import type { DoctorProfile, Patient } from '../../types';
import { clinicalRepository } from '../../core/storage/clinicalRepository';
import {
  DEFAULT_HOSPITAL_BEDS_SEED,
  createEmptyHospitalBedRecord,
  mergeExtractedHospitalDataIntoBed,
  type MultimodalExtractionResult,
} from '../../utils/hospital/hospitalMultimodalIngestor';
import { calculateHospitalStayDays } from '../../utils/hospital/hospitalEvolutionFormatter';
import { HospitalEvolutionFormPanel } from './HospitalEvolutionFormPanel';
import { HospitalLabsAndAnalyticsPanel } from './HospitalLabsAndAnalyticsPanel';
import { HospitalBedChatAndSciencePanel } from './HospitalBedChatAndSciencePanel';
import { HospitalMultimodalImportModal } from './HospitalMultimodalImportModal';

export type HospitalSubViewId =
  | 'evolution_form'
  | 'longitudinal_labs'
  | 'analytics_dashboard'
  | 'science_and_chat';

export interface HospitalWardModuleViewProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  patient: Patient;
  onSendToA4Editor: (html: string, title: string) => void;
}

export const HospitalWardModuleView: React.FC<HospitalWardModuleViewProps> = ({
  doctor,
  onSendToA4Editor,
}) => {
  const [beds, setBeds] = useState<HospitalBedPatientRecord[]>(DEFAULT_HOSPITAL_BEDS_SEED);
  const [activeBedId, setActiveBedId] = useState<string>(DEFAULT_HOSPITAL_BEDS_SEED[0].id);
  const [activeSubView, setActiveSubView] = useState<HospitalSubViewId>('evolution_form');
  const [isMultimodalModalOpen, setIsMultimodalModalOpen] = useState(false);
  const [newBedCodeInput, setNewBedCodeInput] = useState('');

  useEffect(() => {
    let mounted = true;
    if (clinicalRepository.listHospitalBeds) {
      clinicalRepository.listHospitalBeds().then((stored) => {
        if (!mounted) return;
        if (stored && stored.length > 0) {
          setBeds(stored);
          setActiveBedId(stored[0].id);
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
  }, []);

  const activeBed = beds.find((b) => b.id === activeBedId) || beds[0];

  const handleUpdateBedRecord = (updated: HospitalBedPatientRecord) => {
    setBeds((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    clinicalRepository.saveHospitalBed?.(updated);
  };

  const handleCreateNewBed = () => {
    const code = newBedCodeInput.trim() || `110-${beds.length + 16}`;
    const created = createEmptyHospitalBedRecord(code, 'enfermaria_clinica');
    setBeds((prev) => [...prev, created]);
    setActiveBedId(created.id);
    setNewBedCodeInput('');
    clinicalRepository.saveHospitalBed?.(created);
  };

  const handleApplyMultimodalExtraction = (extraction: MultimodalExtractionResult) => {
    const merged = mergeExtractedHospitalDataIntoBed(activeBed, extraction);
    handleUpdateBedRecord(merged);
  };

  const subNavItems: ReadonlyArray<{ id: HospitalSubViewId; label: string; icon: string }> = [
    { id: 'evolution_form', label: 'Evolução & Admissão (EF/LT)', icon: 'clinical_notes' },
    { id: 'longitudinal_labs', label: 'Monitoramento de Exames', icon: 'biotech' },
    { id: 'analytics_dashboard', label: 'Dashboard & Conduta × Evolução', icon: 'monitor_heart' },
    { id: 'science_and_chat', label: 'Assistente Live & Agente Science', icon: 'science' },
  ];

  return (
    <div id="hospital-ward-module-root" data-state="idle" className="space-y-4">
      {/* Cabeçalho do Módulo Hospitalar + Seletor Instantâneo de Leitos */}
      <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-sky-600/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Icon name="local_hospital" size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[var(--text-main)]">
                  Módulo Hospitalar e Gestão de Pacientes
                </h1>
                <Badge tone="clinical" tabular>
                  MOD-03 Ativo
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Admissão manual e multimodal via IA sem alucinação, evolução padronizada, curva longitudinal de exames, Conduta × Evolução e Agente Science
              </p>
            </div>
          </div>

          {/* Ações Rápidas: Nova Admissão e Importação Multimodal */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newBedCodeInput}
                onChange={(e) => setNewBedCodeInput(e.target.value)}
                placeholder="Ex.: 110-18 ou UTI-02"
                aria-label="Código da enfermaria e leito para nova admissão"
                className="w-36 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold clinical-tabular-nums"
              />
              <button
                type="button"
                onClick={handleCreateNewBed}
                className="btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Icon name="add" size={15} />
                <span>Admitir Leito</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMultimodalModalOpen(true)}
              className="btn-tactile-primary h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="auto_awesome" size={15} />
              <span>Importação Multimodal IA</span>
            </button>
          </div>
        </div>

        {/* Seletor Instantâneo de Leitos da Unidade */}
        <div
          role="tablist"
          aria-label="Seletor instantâneo de leitos da unidade"
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
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
                onClick={() => setActiveBedId(bed.id)}
                className={`px-4 py-2 rounded-xl border text-left transition cursor-pointer shrink-0 min-w-44 ${
                  isSelected
                    ? 'bg-sky-600/15 border-sky-500/50 text-[var(--text-main)] shadow-tactile-sm'
                    : 'bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-sky-700 dark:text-sky-300 clinical-tabular-nums">
                    EF/LT {bed.wardAndBed}
                  </span>
                  {stayDays > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] clinical-tabular-nums">
                      D{stayDays}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold truncate mt-0.5">
                  {bed.patientNameOrInitials || 'Leito sem identificação'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Trilho Segmentado das 4 Sub-Bancadas Hospitalares */}
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
                <Icon name={tab.icon} size={15} filled={isActive} className={isActive ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Área Ativa da Sub-Bancada */}
      {activeSubView === 'evolution_form' && (
        <HospitalEvolutionFormPanel
          bedRecord={activeBed}
          doctor={doctor}
          onUpdateBedRecord={handleUpdateBedRecord}
          onOpenMultimodalModal={() => setIsMultimodalModalOpen(true)}
          onSendToA4Editor={onSendToA4Editor}
        />
      )}

      {(activeSubView === 'longitudinal_labs' || activeSubView === 'analytics_dashboard') && (
        <HospitalLabsAndAnalyticsPanel
          mode={activeSubView}
          bedRecord={activeBed}
          onUpdateBedRecord={handleUpdateBedRecord}
        />
      )}

      {activeSubView === 'science_and_chat' && (
        <HospitalBedChatAndSciencePanel
          allBeds={beds}
          activeBed={activeBed}
          onSelectBed={(id) => setActiveBedId(id)}
          onUpdateBed={handleUpdateBedRecord}
        />
      )}

      {/* Modal de Importação Multimodal via IA (Rigor Terapêutico) */}
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
