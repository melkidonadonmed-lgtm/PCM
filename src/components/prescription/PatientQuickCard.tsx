import React from 'react';
import { Patient } from '../../types';
import { Icon } from '../Icon';
import { ActionButton } from '../ui/ActionButton';
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
 * Compact Quick Patient Identification Island (prescription/ layer).
 * Displays Name and Weight (kg) side-by-side on a quiet mineral card surface.
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
      className="cq-card card-surface surface-card-minimal rounded-[16px] p-3.5 sm:p-4 space-y-2.5"
    >
      {/* Compact responsive header */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="person" size={18} className="text-[var(--ink-clinical)] shrink-0" />
          <label
            htmlFor="quick-patient-name"
            className="text-sm font-semibold text-[var(--ink-primary)] cursor-pointer whitespace-nowrap"
          >
            Identificação do paciente
          </label>
          {patientName && (
            <Badge tone="clinical" tabular={false}>
              Sincronizado
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {patientName && onRequestClearPatient && (
            <ActionButton
              variant="danger"
              size="sm"
              iconName="delete"
              onClick={onRequestClearPatient}
              aria-label="Limpar paciente e reiniciar consulta"
              className="whitespace-nowrap"
              title="Limpar paciente e reiniciar consulta"
            >
              <span className="hidden sm:inline">Limpar</span>
            </ActionButton>
          )}

          <ActionButton
            variant="secondary"
            size="sm"
            iconName="person_add"
            iconClassName="text-[var(--ink-clinical)]"
            onClick={onOpenPatientModal}
            className="whitespace-nowrap"
            title="Abrir cadastro clínico detalhado (CPF, endereço, alergias)"
          >
            Cadastro completo
          </ActionButton>
        </div>
      </div>

      {/* Single row: Patient Name (left) + Weight in kg (right) */}
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
            className="tactile-input w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
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
            className="tactile-input w-full h-11 min-h-[44px] pl-3 pr-8 rounded-[10px] border border-[var(--border-control)] text-[13px] font-medium text-[var(--ink-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] tabular-nums clinical-tabular-nums"
          />
          <span className="absolute right-2.5 text-xs font-semibold text-[var(--ink-muted)] pointer-events-none clinical-unit">
            kg
          </span>
        </div>
      </div>
    </section>
  );
};
