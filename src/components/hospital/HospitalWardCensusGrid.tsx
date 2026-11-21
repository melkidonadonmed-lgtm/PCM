import React, { useState, useMemo } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type {
  HospitalBedPatientRecord,
  HospitalSpecialtyTemplate,
} from '../../core/domain/clinicalEntities';
import { calculateHospitalStayDays } from '../../utils/hospital/hospitalEvolutionFormatter';
import {
  HOSPITAL_SPECIALTY_OPTIONS,
  type QuickAdmissionMode,
} from './HospitalQuickAdmissionModal';

export interface HospitalWardCensusGridProps {
  beds: HospitalBedPatientRecord[];
  activeBedId: string;
  onOpenBedSubView: (
    bedId: string,
    targetView: 'evolution_form' | 'longitudinal_labs' | 'analytics_dashboard' | 'science_and_chat'
  ) => void;
  onOpenQuickAdmissionModal: (mode?: QuickAdmissionMode) => void;
  onDeleteBed?: (bedId: string) => void;
}

const SPECIALTY_LABELS_MAP: Record<HospitalSpecialtyTemplate, string> = {
  enfermaria_clinica: 'Enfermaria Clínica',
  uti: 'UTI Adulto / Intensiva',
  ortopedia: 'Ortopedia e Traumatologia',
  cirurgia_geral: 'Cirurgia Geral',
  pediatria: 'Pediatria',
  gineco_obstetricia: 'Ginecologia e Obstetrícia',
};

export const HospitalWardCensusGrid: React.FC<HospitalWardCensusGridProps> = ({
  beds,
  activeBedId,
  onOpenBedSubView,
  onOpenQuickAdmissionModal,
  onDeleteBed,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<HospitalSpecialtyTemplate | 'all'>(
    'all'
  );

  const filteredBeds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return beds.filter((bed) => {
      if (selectedSpecialty !== 'all' && bed.specialtyTemplate !== selectedSpecialty) {
        return false;
      }
      if (!q) return true;
      const hdText = bed.diagnosticHypotheses
        .map((h) => h.diseaseAndDate)
        .join(' ')
        .toLowerCase();
      return (
        bed.wardAndBed.toLowerCase().includes(q) ||
        bed.patientNameOrInitials.toLowerCase().includes(q) ||
        hdText.includes(q) ||
        bed.chiefComplaintQp.toLowerCase().includes(q)
      );
    });
  }, [beds, searchQuery, selectedSpecialty]);

  return (
    <section
      id="hospital-ward-census-grid"
      data-state="idle"
      aria-busy={false}
      aria-label="Mapa de Leitos e Censo da Enfermaria"
      className="flex flex-col gap-3"
    >
      {/* Barra de Filtro por Setor e Busca Rápida no Censo */}
      <div className="cq-card card-surface surface-card-minimal rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 max-w-md min-w-0">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none flex items-center">
              <Icon name="search" size={16} />
            </span>
            <input
              id="hospital-census-search"
              name="hospitalCensusSearch"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por leito (110-15), paciente ou diagnóstico..."
              aria-label="Buscar leito por código, paciente ou diagnóstico"
              className="w-full h-11 min-h-[44px] pl-9 pr-3 rounded-lg border border-[var(--border-control)] bg-[var(--surface-inset)] text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400"
            />
          </div>
          {(searchQuery || selectedSpecialty !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('all');
              }}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] px-3 rounded-xl border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 text-xs font-semibold text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 transition"
              title="Limpar busca e filtro de setor"
            >
              <Icon name="close" size={14} />
              <span>Limpar</span>
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filtrar leitos por setor ou especialidade"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none"
        >
          <button
            type="button"
            onClick={() => setSelectedSpecialty('all')}
            className={`touch-target min-h-[44px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedSpecialty === 'all'
                ? 'bg-[var(--surface-clinical-subtle)] border border-[var(--border-clinical-subtle)] text-[var(--ink-clinical)]'
                : 'bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Todos ({beds.length})
          </button>
          {HOSPITAL_SPECIALTY_OPTIONS.map((spec) => {
            const count = beds.filter((b) => b.specialtyTemplate === spec.id).length;
            if (count === 0 && selectedSpecialty !== spec.id) return null;
            const isActive = selectedSpecialty === spec.id;
            return (
              <button
                key={spec.id}
                type="button"
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`touch-target min-h-[44px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer clinical-tabular-nums ${
                  isActive
                    ? 'bg-[var(--surface-clinical-subtle)] border border-[var(--border-clinical-subtle)] text-[var(--ink-clinical)] font-bold'
                    : 'bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {spec.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade de Cards de Leitos + Card de Nova Admissão */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${filteredBeds.length >= 3 ? 'xl:grid-cols-3' : ''} gap-3 items-stretch`}>
        {/* Cards Clínicos dos Leitos Ocupados */}
        {filteredBeds.map((bed) => {
          const stayDays = calculateHospitalStayDays(bed.dihDateBr);
          const isSelected = bed.id === activeBedId;
          const mainHd =
            bed.diagnosticHypotheses[0]?.diseaseAndDate || 'Sem hipótese diagnóstica informada';
          const hasDocumentedAllergy =
            Boolean(bed.allergiesText.trim()) &&
            !/^nega\b/i.test(bed.allergiesText.trim());
          const latestScore =
            bed.scoreEntries && bed.scoreEntries.length > 0
              ? bed.scoreEntries[bed.scoreEntries.length - 1]
              : null;

          return (
            <article
              key={bed.id}
              aria-label={`Leito ${bed.wardAndBed} — ${bed.patientNameOrInitials || 'Sem identificação'}`}
              className={`cq-card card-surface surface-card-minimal rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between gap-3 transition ${
                isSelected
                  ? 'border-[var(--border-clinical-subtle)] border-l-[3px] border-l-[var(--clinical)] shadow-elevation-medium'
                  : 'border-subtle dark:border-strong'
              }`}
            >
              <div className="space-y-2.5">
                {/* Topo: EF/LT, Especialidade e Dias de Internação */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-chip-muted)] border border-[var(--border-subtle)] text-xs font-extrabold text-[var(--text-main)] clinical-tabular-nums whitespace-nowrap">
                      EF/LT {bed.wardAndBed}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate">
                      {SPECIALTY_LABELS_MAP[bed.specialtyTemplate] || bed.wardName}
                    </span>
                  </div>
                  {stayDays > 0 && (
                    <Badge tone="clinical" tabular>
                      D{stayDays}
                    </Badge>
                  )}
                </div>

                {/* Identificação do Paciente */}
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-main)] truncate">
                    {bed.patientNameOrInitials || 'Leito sem identificação'}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] clinical-tabular-nums mt-0.5">
                    {bed.ageYearsText ? `${bed.ageYearsText}` : 'Idade não informada'}
                    {bed.birthDateBr ? ` (DN ${bed.birthDateBr})` : ''}
                    {bed.dihDateBr ? ` • DIH ${bed.dihDateBr}` : ''}
                  </p>
                </div>

                {/* Hipótese Diagnóstica Principal */}
                <div className="p-2.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] space-y-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Hipótese Diagnóstica Principal (HD 1)
                  </span>
                  <p className="text-xs font-semibold text-[var(--text-main)] line-clamp-2">
                    {mainHd}
                  </p>
                </div>

                {/* Pílulas de Segurança Clínica: Alergias, Medicações em Uso, Escores e Pendências */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {hasDocumentedAllergy ? (
                    <span className="w-full flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--accent-rose-subtle)] border border-[var(--accent-rose-border)] text-[11px] font-bold text-rose-800 dark:text-rose-200 leading-snug">
                      <Icon name="warning" size={14} className="shrink-0 mt-0.5" />
                      <span className="break-words">Alergia: {bed.allergiesText}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-muted)]">
                      {bed.allergiesText || 'Alergias não registradas'}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-secondary)] clinical-tabular-nums">
                    <Icon name="medication" size={13} />
                    <span>{bed.currentMedicationsAndDevices.length} em uso</span>
                  </span>

                  {latestScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-clinical-subtle)] border border-[var(--border-clinical-subtle)] text-[11px] font-bold text-[var(--ink-clinical)] clinical-tabular-nums">
                      <Icon name="monitor_heart" size={13} />
                      <span>
                        {latestScore.acronym}: {latestScore.scoreFormatted} pts
                      </span>
                    </span>
                  )}

                  {bed.pendingItemsList.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] text-[11px] font-bold text-amber-800 dark:text-amber-200 clinical-tabular-nums">
                      <span>{bed.pendingItemsList.length} pendência(s)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Ações Rápidas do Card */}
              <div className="pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => onOpenBedSubView(bed.id, 'evolution_form')}
                className={`touch-target ${isSelected ? 'btn-tactile-clinical' : 'btn-tactile-secondary'} flex-1 min-h-[44px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0`}
              >
                <Icon name="clinical_notes" size={15} />
                <span>Evoluir Leito</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenBedSubView(bed.id, 'longitudinal_labs')}
                title="Ver curva de exames laboratoriais"
                className="touch-target btn-tactile-secondary min-h-[44px] px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer clinical-tabular-nums whitespace-nowrap shrink-0"
              >
                <Icon name="biotech" size={14} />
                <span>Exames ({bed.labPanels.length})</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenBedSubView(bed.id, 'analytics_dashboard')}
                title="Abrir Dashboard e Conduta × Evolução"
                aria-label={`Abrir Dashboard do leito ${bed.wardAndBed}`}
                className="touch-target btn-tactile-secondary min-h-[44px] min-w-[44px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Icon name="monitor_heart" size={14} />
              </button>

              {onDeleteBed && (
                <button
                  type="button"
                  onClick={() => onDeleteBed(bed.id)}
                  title="Dar alta ou remover este leito do mapa"
                  aria-label={`Dar alta ou remover leito ${bed.wardAndBed}`}
                  className="touch-target min-h-[44px] min-w-[44px] px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--accent-rose-subtle)] hover:border-[var(--accent-rose-border)] text-[var(--text-muted)] hover:text-rose-800 dark:hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Icon name="delete" size={14} />
                </button>
              )}
              </div>
            </article>
          );
        })}

        {/* Estado vazio de Admissão Guiada quando nenhum leito corresponde ao filtro */}
        {filteredBeds.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 card-surface rounded-2xl border border-[var(--border-subtle)] p-4 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="w-10 h-10 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] flex items-center justify-center">
                  <Icon name="person_add" size={20} />
                </span>
                <Badge tone="neutral">Novo Leito</Badge>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-main)]">
                + Admitir Novo Paciente
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Adicione um paciente à enfermaria informando os dados essenciais (EF/LT, Nome, DN e
                Diagnóstico) ou cole a nota de admissão para extração estruturada automática.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenQuickAdmissionModal('manual')}
                className="touch-target btn-tactile-secondary min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Icon name="add" size={16} />
                <span>Cadastro Rápido</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenQuickAdmissionModal('multimodal')}
                className="touch-target btn-tactile-secondary min-h-[44px] px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Icon name="upload" size={15} className="text-[var(--text-muted)]" />
                <span>Colar Prontuário / IA</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Faixa silenciosa de admissão quando já existem leitos ocupados no censo */}
      {filteredBeds.length > 0 && (
        <div className="mt-1 px-4 py-2.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="person_add" size={16} className="text-[var(--ink-clinical)] shrink-0" />
            <h2 className="text-xs font-bold text-[var(--text-main)]">+ Admitir Novo Paciente</h2>
            <span className="hidden sm:inline text-xs text-[var(--text-muted)]">
              • Adicione um novo leito ou extraia dados de prontuário
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenQuickAdmissionModal('manual')}
              className="touch-target btn-tactile-secondary min-h-[44px] px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Icon name="add" size={15} />
              <span>Cadastro Rápido</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenQuickAdmissionModal('multimodal')}
              className="touch-target btn-tactile-secondary min-h-[44px] px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Icon name="upload" size={14} className="text-[var(--text-muted)]" />
              <span>Colar Prontuário / IA</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
