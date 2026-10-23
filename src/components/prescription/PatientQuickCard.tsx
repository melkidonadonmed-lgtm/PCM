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
  const patientName = patient?.name?.trim() || '';
  const hasExtraData =
    (patient.weightKg && patient.weightKg > 0) ||
    Boolean(patient.documentNumber && patient.documentNumber.trim());

  return (
    <section
      data-state={patientName ? 'pressed' : 'idle'}
      aria-busy={false}
      aria-label="Identificação rápida do paciente"
      className="card-surface surface-card-minimal rounded-2xl p-4 sm:p-5 space-y-3 border border-subtle dark:border-strong"
    >
      {/* Cabeçalho compacto em linha única */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="person" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <label
            htmlFor="quick-patient-name"
            className="text-sm font-semibold text-slate-900 dark:text-white cursor-pointer truncate"
          >
            Identificação do paciente
          </label>
          {patientName && (
            <Badge tone="clinical" tabular={false}>
              Sincronizado
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleExtraFields}
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg px-2 py-1 clinical-unit clinical-tabular-nums transition"
            title="Alternar exibição de CPF e Peso"
          >
            <Icon name={showExtraPatientFields ? 'expand_less' : 'expand_more'} size={15} />
            <span>
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
              className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer transition px-2 py-1 rounded-lg focus-visible:ring-2 focus-visible:ring-rose-500"
              title="Limpar paciente e reiniciar consulta"
            >
              <Icon name="delete" size={15} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPatientModal}
            className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer px-2 py-1 rounded-lg focus-visible:ring-2 focus-visible:ring-sky-500 transition"
            title="Abrir cadastro clínico detalhado"
          >
            <span>Cadastro completo</span>
          </button>
        </div>
      </div>

      {/* Linha combinada: Input do Nome + Atalhos discretos em pílulas neutras (98/2) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 min-w-0">
          <input
            id="quick-patient-name"
            type="text"
            value={patient.name || ''}
            onChange={(e) => onUpdatePatient({ ...patient, name: e.target.value })}
            placeholder="Ex.: Maria de Oliveira Santos"
            className="w-full h-9 px-3 bg-slate-50/80 dark:bg-slate-950 border border-subtle dark:border-strong rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap shrink-0" aria-label="Atalhos de documentos do paciente">
          {onNavigateToCertificate && (
            <button
              type="button"
              onClick={onNavigateToCertificate}
              className="chip-neutral h-8 text-xs px-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
              title="Abrir formulário de Atestado Médico para este paciente"
            >
              <Icon name="atestado" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Atestado</span>
            </button>
          )}
          {onNavigateToReferral && (
            <button
              type="button"
              onClick={onNavigateToReferral}
              className="chip-neutral h-8 text-xs px-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
              title="Abrir Encaminhamento Médico para este paciente"
            >
              <Icon name="encaminhamento" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Encaminhamento</span>
            </button>
          )}
          {onNavigateToExams && (
            <button
              type="button"
              onClick={onNavigateToExams}
              className="chip-neutral h-8 text-xs px-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
              title="Abrir Solicitação de Exames para este paciente"
            >
              <Icon name="exame" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Exames</span>
            </button>
          )}
          {onNavigateToSus && (
            <button
              type="button"
              onClick={onNavigateToSus}
              className="chip-neutral h-8 text-xs px-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500"
              title="Abrir Formulários SUS (LME, APAC, SISREG) para este paciente"
            >
              <Icon name="sus" size={15} className="text-sky-600 dark:text-sky-400" />
              <span>Guias SUS</span>
            </button>
          )}
        </div>
      </div>

      {/* Campos Extras Retráteis Lado a Lado: CPF e Peso */}
      {showExtraPatientFields && (
        <div className="grid grid-cols-12 gap-2 pt-2 border-t border-subtle dark:border-strong">
          <div className="col-span-7 sm:col-span-8">
            <label htmlFor="quick-patient-doc" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              CPF / RG
            </label>
            <input
              id="quick-patient-doc"
              type="text"
              value={patient.documentNumber || ''}
              onChange={(e) => onUpdatePatient({ ...patient, documentNumber: e.target.value })}
              placeholder="Ex.: 000.000.000-00"
              className="w-full h-9 px-2.5 bg-slate-50/80 dark:bg-slate-950 border border-subtle dark:border-strong rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
            />
          </div>

          <div className="col-span-5 sm:col-span-4">
            <label htmlFor="quick-patient-weight" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Peso (kg)
            </label>
            <input
              id="quick-patient-weight"
              type="number"
              step="0.1"
              min="0"
              value={patient.weightKg > 0 ? patient.weightKg : ''}
              onChange={(e) => onUpdatePatient({ ...patient, weightKg: parseFloat(e.target.value) || 0 })}
              placeholder="Ex.: 14.5"
              className="w-full h-9 px-2.5 bg-slate-50/80 dark:bg-slate-950 border border-subtle dark:border-strong rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shadow-tactile-sm clinical-tabular-nums"
            />
          </div>
        </div>
      )}
    </section>
  );
};
