import React from 'react';
import { SoftCard } from '../ui/SoftCard';
import { Badge } from '../ui/Badge';
import { Icon } from '../Icon';
import { DoctorProfile, Patient } from '../../types';
import { medicoConfigurado } from '../../utils/medicoConfigurado';

export interface ConsultationReadinessBarProps {
  doctor: DoctorProfile;
  patient: Patient;
  prescriptionCount: number;
  documentsCount: number;
  onOpenDoctorModal: () => void;
  onOpenPatientModal: () => void;
  onOpenCommandPalette: () => void;
  compactOnDesktop?: boolean;
}

/**
 * Organismo Bento de Prontidão Clínica Anti-TDAH (Camada bento/).
 * Exibe em linha única o status determinístico do atendimento (Emitente, Paciente/Peso, Conduta e Busca Ctrl+K).
 */
export const ConsultationReadinessBar: React.FC<ConsultationReadinessBarProps> = ({
  doctor,
  patient,
  prescriptionCount,
  documentsCount,
  onOpenDoctorModal,
  onOpenPatientModal,
  onOpenCommandPalette,
  compactOnDesktop = false,
}) => {
  const isDoctorOk = medicoConfigurado(doctor);
  const hasPatient = Boolean(patient?.name?.trim());
  const weightKg = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const totalConductItems = prescriptionCount + documentsCount;
  const hideRedundantDesktop = compactOnDesktop;

  return (
    <SoftCard
      variant="flat"
      state="idle"
      aria-label="Resumo rápido de prontidão da consulta"
      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 mb-2.5 sm:mb-3 rounded-2xl flex items-center justify-between gap-2 no-print overflow-x-auto scrollbar-none ${
        hideRedundantDesktop ? 'lg:hidden' : ''
      }`}
    >
      <div data-state="idle" aria-busy={false} className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        <button
          type="button"
          onClick={onOpenDoctorModal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg px-1.5 py-1 shrink-0"
        >
          <Icon
            name={isDoctorOk ? 'verified_user' : 'warning'}
            size={15}
            className={isDoctorOk ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}
          />
          <span className="truncate max-w-28 sm:max-w-44">
            {isDoctorOk ? `Dr(a). ${doctor.name.split(' ')[0]}` : 'CRM pendente'}
          </span>
          {isDoctorOk && (
            <Badge tone="clinical" tabular className="hidden sm:inline-flex">
              {doctor.crm}/{doctor.crmState || 'UF'}
            </Badge>
          )}
        </button>

        <span className="text-[var(--border-strong)] select-none shrink-0" aria-hidden="true">
          •
        </span>

        <button
          type="button"
          onClick={onOpenPatientModal}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg px-1.5 py-1 min-w-0"
        >
          <Icon
            name={hasPatient ? 'person' : 'person_add'}
            size={15}
            className={hasPatient ? 'text-sky-600 dark:text-sky-400' : 'text-[var(--text-muted)]'}
          />
          <span className="truncate max-w-28 sm:max-w-44">
            {hasPatient ? patient.name : 'Sem paciente'}
          </span>
          {weightKg > 0 && (
            <Badge tone="info" tabular className="unit-badge">
              {weightKg.toLocaleString('pt-BR')} kg
            </Badge>
          )}
        </button>

        {totalConductItems > 0 && (
          <>
            <span className="text-[var(--border-strong)] select-none hidden sm:inline" aria-hidden="true">
              •
            </span>
            <Badge tone="neutral" tabular className="hidden sm:inline-flex">
              {prescriptionCount} itens • {documentsCount} docs
            </Badge>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenCommandPalette}
        aria-label="Abrir busca rápida e navegação global (Ctrl+K)"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded-xl border border-subtle dark:border-strong bg-[var(--bg-app)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none shrink-0"
      >
        <Icon name="search" size={15} className="text-sky-600 dark:text-sky-400" />
        <span className="hidden md:inline">Busca rápida (Medicamentos, SUS, Kits)</span>
        <span className="md:hidden">Buscar</span>
        <Badge tone="neutral" tabular className="hidden sm:inline-flex">
          Ctrl+K
        </Badge>
      </button>
    </SoftCard>
  );
};
