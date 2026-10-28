import React from 'react';
import { Patient } from '../../types';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';

export interface PatientQuickCardProps {
  patient: Patient;
  showExtraPatientFields: boolean;
  onToggleExtraFields: () => void;
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
 * Aplica Compact Sizing e proporção 98/2 sem fugir do DESIGN.md.
 */
export const PatientQuickCard: React.FC<PatientQuickCardProps> = ({
  patient,
  showExtraPatientFields,
  onToggleExtraFields,
  onUpdatePatient,
  onOpenPatientModal,
  onRequestClearPatient,
  onNavigateToCertificate,
  onNavigateToReferral,
  onNavigateToExams,
  onNavigateToSus,
}) => {
  const [weightDraft, setWeightDraft] = React.useState<string | null>(null);
  const patientName = patient?.name?.trim() || '';
  const hasExtraData =
    (patient.weightKg && patient.weightKg > 0) ||
    Boolean(patient.documentNumber && patient.documentNumber.trim());

  return (
    <section
      data-state="idle"
      aria-busy={false}
      aria-label="Identificação rápida do paciente"
      className="cq-card card-surface surface-card-minimal rounded-2xl p-4 sm:p-5 space-y-3 border border-subtle dark:border-strong"
    >
      {/* Cabeçalho compacto com quebra responsiva limpa (evita colisão entre Sincronizado e ações no mobile) */}
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
          <button
            type="button"
            onClick={onToggleExtraFields}
            className="h-8 min-h-[32px] px-2.5 rounded-lg border border-subtle/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center justify-center gap-1 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 whitespace-nowrap clinical-tabular-nums transition duration-150"
            title="Alternar exibição de CPF e Peso"
          >
            <Icon name={showExtraPatientFields ? 'expand_less' : 'expand_more'} size={15} />
            <span className="truncate max-w-44 sm:max-w-none">
              {showExtraPatientFields
                ? 'Ocultar CPF / Peso'
                : hasExtraData
                  ? `Dados (${patient.weightKg > 0 ? `${patient.weightKg} kg` : ''}${patient.documentNumber ? ` • ${patient.documentNumber}` : ''})`
                  : '+ CPF e Peso'}
            </span>
          </button>

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
            className="h-8 min-h-[32px] px-2.5 rounded-lg border border-subtle/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center justify-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-sky-500 transition duration-150"
            title="Abrir cadastro clínico detalhado"
          >
            <Icon name="person_add" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Cadastro completo</span>
          </button>
        </div>
      </div>

      {/* Linha combinada: Input do Nome + Atalhos discretos com altura idêntica (h-9) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-48">
          <input
            id="quick-patient-name"
            type="text"
            value={patient.name || ''}
            onChange={(e) => onUpdatePatient({ ...patient, name: e.target.value })}
            placeholder="Ex.: Maria de Oliveira Santos"
            className="w-full h-9 px-3 bg-[var(--surface-inset)] border border-subtle dark:border-strong rounded-xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm transition"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 w-full sm:w-auto min-w-0" aria-label="Atalhos de documentos do paciente">
          {onNavigateToCertificate && (
            <button
              type="button"
              onClick={onNavigateToCertificate}
              className="chip-neutral h-9 text-[11px] sm:text-xs px-3 rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-px focus-visible:ring-2 focus-visible:ring-sky-500 min-w-0 whitespace-nowrap"
              title="Abrir formulário de Atestado Médico para este paciente"
            >
              <Icon name="atestado" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Atestado</span>
            </button>
          )}
          {onNavigateToReferral && (
            <button
              type="button"
              onClick={onNavigateToReferral}
              className="chip-neutral h-9 text-[11px] sm:text-xs px-3 rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-px focus-visible:ring-2 focus-visible:ring-sky-500 min-w-0 whitespace-nowrap"
              title="Abrir Encaminhamento Médico para este paciente"
            >
              <Icon name="encaminhamento" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Encaminhamento</span>
            </button>
          )}
          {onNavigateToExams && (
            <button
              type="button"
              onClick={onNavigateToExams}
              className="chip-neutral h-9 text-[11px] sm:text-xs px-3 rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-px focus-visible:ring-2 focus-visible:ring-sky-500 min-w-0 whitespace-nowrap"
              title="Abrir Solicitação de Exames para este paciente"
            >
              <Icon name="exame" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Exames</span>
            </button>
          )}
          {onNavigateToSus && (
            <button
              type="button"
              onClick={onNavigateToSus}
              className="chip-neutral h-9 text-[11px] sm:text-xs px-3 rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-px focus-visible:ring-2 focus-visible:ring-sky-500 min-w-0 whitespace-nowrap"
              title="Abrir Formulários SUS (LME, APAC, SISREG) para este paciente"
            >
              <Icon name="sus" size={14} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <span className="truncate">Guias SUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Campos Extras Retráteis Lado a Lado: CPF e Peso */}
      {showExtraPatientFields && (
        <div className="grid grid-cols-12 gap-2 pt-2 border-t border-subtle dark:border-strong">
          <div className="col-span-7 sm:col-span-8">
            <label htmlFor="quick-patient-doc" className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              CPF / RG
            </label>
            <input
              id="quick-patient-doc"
              type="text"
              value={patient.documentNumber || ''}
              onChange={(e) => onUpdatePatient({ ...patient, documentNumber: e.target.value })}
              placeholder="Ex.: 000.000.000-00"
              className="w-full h-9 px-2.5 bg-[var(--surface-inset)] border border-subtle dark:border-strong rounded-xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
            />
          </div>

          <div className="col-span-5 sm:col-span-4">
            <label htmlFor="quick-patient-weight" className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Peso (kg)
            </label>
            <input
              id="quick-patient-weight"
              type="number"
              step="0.1"
              min="0"
              value={weightDraft !== null ? weightDraft : patient.weightKg > 0 ? String(patient.weightKg) : ''}
              onChange={(e) => {
                const raw = e.target.value;
                setWeightDraft(raw);
                const parsed = parseFloat(raw.replace(',', '.'));
                onUpdatePatient({ ...patient, weightKg: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed });
              }}
              onBlur={() => setWeightDraft(null)}
              placeholder="Ex.: 14.5"
              className="w-full h-9 px-2.5 bg-[var(--surface-inset)] border border-subtle dark:border-strong rounded-xl text-xs font-medium text-[var(--text-main)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
            />
          </div>
        </div>
      )}
    </section>
  );
};
