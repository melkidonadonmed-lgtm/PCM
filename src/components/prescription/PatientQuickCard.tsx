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
          <Icon name="person" size={18} className="text-[var(--ink-clinical)] shrink-0" />
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
              className="touch-target min-h-[44px] min-w-[44px] px-3 rounded-lg border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 text-xs text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/70 font-semibold inline-flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition duration-150 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Limpar paciente e reiniciar consulta"
            >
              <Icon name="delete" size={14} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPatientModal}
            className="touch-target chip-neutral min-h-[44px] min-w-[44px] px-3 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 transition duration-150"
            title="Abrir cadastro clínico detalhado (CPF, endereço, alergias)"
          >
            <Icon name="person_add" size={14} className="text-[var(--ink-clinical)] shrink-0" />
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
            className="w-full h-11 min-h-[44px] px-3 bg-[var(--surface-inset)] border border-[var(--border-control)] rounded-lg text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 shadow-tactile-sm transition"
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
            className="w-full h-11 min-h-[44px] pl-2.5 pr-8 bg-[var(--surface-inset)] border border-[var(--border-control)] rounded-lg text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-400 shadow-tactile-sm clinical-tabular-nums transition"
          />
          <span className="absolute right-2.5 text-[11px] font-semibold text-[var(--text-muted)] pointer-events-none clinical-unit">
            kg
          </span>
        </div>
      </div>
    </section>
  );
};
