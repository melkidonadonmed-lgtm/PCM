import React from 'react';
import { Patient } from '../../types';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';

export interface PatientQuickCardProps {
  patient: Patient;
  showExtraPatientFields?: boolean;
  onToggleExtraFields?: () => void;
  onUpdatePatient: (patient: Patient) => void;
  onOpenPatientModal: () => void;
  onRequestClearPatient?: () => void;
  onNavigateToCertificate?: () => void;
  onNavigateToReferral?: () => void;
  onNavigateToExams?: () => void;
  onNavigateToSus?: () => void;
}

/**
 * Ilha Compacta de Identificação Rápida do Paciente (Camada prescription/).
 * Exibe apenas Nome e Peso (kg) lado a lado na mesma linha, com espaçamento enxuto e superfície fosca mineral.
 */
export const PatientQuickCard: React.FC<PatientQuickCardProps> = ({
  patient,
  onUpdatePatient,
  onOpenPatientModal,
  onRequestClearPatient,
}) => {
  const [weightDraft, setWeightDraft] = React.useState<string | null>(null);
  const patientName = patient?.name?.trim() || '';

  return (
    <section
      data-state="idle"
      aria-busy={false}
      aria-label="Identificação rápida do paciente"
      className="cq-card card-surface surface-card-minimal rounded-2xl p-3.5 sm:p-4 space-y-2 border border-subtle dark:border-strong"
    >
      {/* Cabeçalho compacto com quebra responsiva limpa */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="person" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <label
            htmlFor="quick-patient-name"
            className="text-sm font-semibold text-[var(--text-main)] cursor-pointer whitespace-nowrap"
          >
            Identificação do paciente
          </label>
          {patientName && (
            <Badge tone="clinical" tabular={false}>
              Sincronizado
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
          {patientName && onRequestClearPatient && (
            <button
              type="button"
              onClick={onRequestClearPatient}
              className="h-8 min-h-[32px] px-2.5 rounded-lg border border-rose-200/80 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-100/80 dark:hover:bg-rose-500/20 font-medium inline-flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition duration-150 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Limpar paciente e reiniciar consulta"
            >
              <Icon name="delete" size={14} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPatientModal}
            className="chip-neutral h-8 min-h-[32px] px-2.5 rounded-xl text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 transition duration-150"
            title="Abrir cadastro clínico detalhado (CPF, endereço, alergias)"
          >
            <Icon name="person_add" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Cadastro completo</span>
          </button>
        </div>
      </div>

      {/* Linha única lado a lado: Nome do Paciente (esquerda) + Peso em kg (direita) */}
      <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-center">
        <div className="col-span-8 sm:col-span-9 min-w-0">
          <input
            id="quick-patient-name"
            name="patientName"
            type="text"
            autoComplete="name"
            value={patient.name || ''}
            onChange={(e) => onUpdatePatient({ ...patient, name: e.target.value })}
            placeholder="Ex.: Maria de Oliveira Santos"
            className="w-full h-9 px-3 bg-[var(--surface-inset)] border border-subtle dark:border-strong rounded-xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm transition"
          />
        </div>

        <div className="col-span-4 sm:col-span-3 relative flex items-center min-w-0">
          <label htmlFor="quick-patient-weight" className="sr-only">
            Peso do paciente em quilogramas
          </label>
          <input
            id="quick-patient-weight"
            name="patientWeightKg"
            type="number"
            step="0.1"
            min="0"
            aria-label="Peso do paciente em quilogramas"
            value={weightDraft !== null ? weightDraft : patient.weightKg > 0 ? String(patient.weightKg) : ''}
            onChange={(e) => {
              const raw = e.target.value;
              setWeightDraft(raw);
              const parsed = parseFloat(raw.replace(',', '.'));
              onUpdatePatient({ ...patient, weightKg: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed });
            }}
            onBlur={() => setWeightDraft(null)}
            placeholder="Ex.: Peso"
            className="w-full h-9 pl-2.5 pr-8 bg-[var(--surface-inset)] border border-subtle dark:border-strong rounded-xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums transition"
          />
          <span className="absolute right-2.5 text-[11px] font-semibold text-[var(--text-muted)] pointer-events-none clinical-unit">
            kg
          </span>
        </div>
      </div>
    </section>
  );
};
