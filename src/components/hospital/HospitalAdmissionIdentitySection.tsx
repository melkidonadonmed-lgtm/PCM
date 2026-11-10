import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type {
  HospitalBedPatientRecord,
  HospitalSpecialtyTemplate,
} from '../../core/domain/clinicalEntities';
import { calculatePatientAgeYearsFromDate } from '../../utils/hospital/hospitalEvolutionFormatter';
import { HOSPITAL_SPECIALTY_OPTIONS } from './HospitalQuickAdmissionModal';

export interface HospitalAdmissionIdentitySectionProps {
  bedRecord: HospitalBedPatientRecord;
  stayDays: number;
  onUpdateBedRecord: (updated: HospitalBedPatientRecord) => void;
  onOpenMultimodalModal: () => void;
}

export const HospitalAdmissionIdentitySection: React.FC<
  HospitalAdmissionIdentitySectionProps
> = ({
  bedRecord,
  stayDays,
  onUpdateBedRecord,
  onOpenMultimodalModal,
}) => {
  const [isAdmissionSectionOpen, setIsAdmissionSectionOpen] = useState(true);

  const updateField = <K extends keyof HospitalBedPatientRecord>(
    key: K,
    value: HospitalBedPatientRecord[K]
  ) => {
    onUpdateBedRecord({ ...bedRecord, [key]: value, updatedAt: Date.now() });
  };

  const handleBirthDateChange = (val: string) => {
    const calculatedAge = calculatePatientAgeYearsFromDate(val);
    onUpdateBedRecord({
      ...bedRecord,
      birthDateBr: val,
      ageYearsText: calculatedAge || bedRecord.ageYearsText,
      updatedAt: Date.now(),
    });
  };

  const primaryHdSummary =
    bedRecord.diagnosticHypotheses[0]?.diseaseAndDate ||
    'Sem HD principal registrada';

  return (
    <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          type="button"
          onClick={() => setIsAdmissionSectionOpen((prev) => !prev)}
          aria-expanded={isAdmissionSectionOpen}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <Icon
            name={isAdmissionSectionOpen ? 'expand_less' : 'expand_more'}
            size={18}
            className="text-sky-600 dark:text-sky-400"
          />
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              1. Identificação do Leito, Admissão, HDA e Antecedentes
            </h3>
            {!isAdmissionSectionOpen && (
              <p className="text-[11px] text-[var(--text-muted)] clinical-tabular-nums truncate max-w-md">
                EF/LT {bedRecord.wardAndBed} •{' '}
                {bedRecord.patientNameOrInitials || 'Sem ID'} •{' '}
                {primaryHdSummary}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-2">
          {stayDays > 0 && (
            <Badge tone="clinical" tabular>
              D{stayDays} de Internação
            </Badge>
          )}
          <button
            type="button"
            onClick={onOpenMultimodalModal}
            className="btn-tactile-secondary h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Icon
              name="auto_awesome"
              size={14}
              className="text-sky-600 dark:text-sky-400"
            />
            <span>Importar via IA / Documento</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAdmissionSectionOpen((prev) => !prev)}
            className="h-8 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-[11px] font-bold text-[var(--text-secondary)] cursor-pointer"
          >
            {isAdmissionSectionOpen ? 'Recolher' : 'Expandir'}
          </button>
        </div>
      </div>

      {isAdmissionSectionOpen && (
        <div className="space-y-3.5 pt-1">
          {/* Identificação do Leito e Paciente */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <div className="col-span-1 sm:col-span-2">
              <label
                htmlFor="hosp-ef-lt"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                EF / LT (Enfermaria e Leito)
              </label>
              <input
                id="hosp-ef-lt"
                type="text"
                value={bedRecord.wardAndBed}
                onChange={(e) => updateField('wardAndBed', e.target.value)}
                placeholder="Ex.: 110-15"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold clinical-tabular-nums"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label
                htmlFor="hosp-specialty"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Especialidade / Unidade
              </label>
              <select
                id="hosp-specialty"
                value={bedRecord.specialtyTemplate}
                onChange={(e) =>
                  updateField(
                    'specialtyTemplate',
                    e.target.value as HospitalSpecialtyTemplate
                  )
                }
                className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold"
              >
                {HOSPITAL_SPECIALTY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label
                htmlFor="hosp-dih"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                DIH (Data de Internação)
              </label>
              <input
                id="hosp-dih"
                type="text"
                value={bedRecord.dihDateBr}
                onChange={(e) => updateField('dihDateBr', e.target.value)}
                placeholder="Ex.: 20/10/2026"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label
                htmlFor="hosp-patient-id"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                ID (Nome, Iniciais ou Prontuário)
              </label>
              <input
                id="hosp-patient-id"
                type="text"
                value={bedRecord.patientNameOrInitials}
                onChange={(e) =>
                  updateField('patientNameOrInitials', e.target.value)
                }
                placeholder="Ex.: M. A. S. (Pront. 48291)"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold"
              />
            </div>
            <div className="col-span-1 sm:col-span-1">
              <label
                htmlFor="hosp-dn"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                DN ({bedRecord.ageYearsText || 'Idade'})
              </label>
              <input
                id="hosp-dn"
                type="text"
                value={bedRecord.birthDateBr}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                placeholder="Ex.: 14/05/1962"
                className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label
                htmlFor="hosp-cns"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                CNS (Cartão SUS)
              </label>
              <input
                id="hosp-cns"
                type="text"
                value={bedRecord.cns}
                onChange={(e) => updateField('cns', e.target.value)}
                placeholder="Ex.: 704801239481029"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>
          </div>

          {/* QP, Hipóteses Diagnósticas, HDA e Antecedentes com Rótulos Explícitos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-[var(--border-subtle)] pt-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="hosp-qp"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                QP (Queixa Principal — palavras do paciente)
              </label>
              <input
                id="hosp-qp"
                type="text"
                value={bedRecord.chiefComplaintQp}
                onChange={(e) =>
                  updateField('chiefComplaintQp', e.target.value)
                }
                placeholder="Ex.: Falta de ar aos pequenos esforços e tosse produtiva há 4 dias"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                  Hipóteses Diagnósticas (HD 1, 2... + Data)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateField('diagnosticHypotheses', [
                      ...bedRecord.diagnosticHypotheses,
                      {
                        id: `hd-${Date.now()}`,
                        codeNumber: String(
                          bedRecord.diagnosticHypotheses.length + 1
                        ),
                        diseaseAndDate: '',
                        subItems: [],
                      },
                    ])
                  }
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 cursor-pointer"
                >
                  + Adicionar HD
                </button>
              </div>
              {bedRecord.diagnosticHypotheses.map((hd, idx) => (
                <div key={hd.id} className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-1 rounded bg-[var(--surface-inset)] clinical-tabular-nums">
                    {hd.codeNumber} -
                  </span>
                  <input
                    type="text"
                    value={hd.diseaseAndDate}
                    onChange={(e) => {
                      const next = [...bedRecord.diagnosticHypotheses];
                      next[idx] = { ...hd, diseaseAndDate: e.target.value };
                      updateField('diagnosticHypotheses', next);
                    }}
                    placeholder="Ex.: Pneumonia Adquirida na Comunidade (20/10/2026)"
                    aria-label={`Hipótese diagnóstica ${hd.codeNumber}`}
                    className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
                  />
                  {bedRecord.diagnosticHypotheses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = bedRecord.diagnosticHypotheses
                          .filter((item) => item.id !== hd.id)
                          .map((item, i) => ({
                            ...item,
                            codeNumber: String(i + 1),
                          }));
                        updateField('diagnosticHypotheses', next);
                      }}
                      aria-label={`Remover hipótese diagnóstica ${hd.codeNumber}`}
                      className="h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="hosp-hda"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                HDA (História da Doença Atual em ordem cronológica)
              </label>
              <textarea
                id="hosp-hda"
                rows={3}
                value={bedRecord.historyPresentIllnessHda}
                onChange={(e) =>
                  updateField('historyPresentIllnessHda', e.target.value)
                }
                placeholder="Ex.: 20/10/2026: Admitido com febre... 22/10/2026: Afebril..."
                className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-allergies"
                className="block text-[11px] font-bold text-rose-700 dark:text-rose-300 mb-1"
              >
                Alergias Medicamentosas
              </label>
              <input
                id="hosp-allergies"
                type="text"
                value={bedRecord.allergiesText}
                onChange={(e) => updateField('allergiesText', e.target.value)}
                placeholder="Ex.: Dipirona ou Nega alergias"
                aria-label="Alergias"
                className="w-full h-9 px-3 rounded-xl border border-rose-500/40 bg-rose-500/5 text-xs font-semibold"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-serologies"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Sorologias (HIV, VDRL, HBsAg, Anti-HCV)
              </label>
              <input
                id="hosp-serologies"
                type="text"
                value={bedRecord.serologiesText}
                onChange={(e) => updateField('serologiesText', e.target.value)}
                placeholder="Ex.: HIV NR | VDRL NR | HBsAg NR"
                aria-label="Sorologias"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-hpp"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                HPP (História Patológica Pregressa)
              </label>
              <input
                id="hosp-hpp"
                type="text"
                value={bedRecord.pastMedicalHistoryHpp}
                onChange={(e) =>
                  updateField('pastMedicalHistoryHpp', e.target.value)
                }
                placeholder="Ex.: HAS há 12 anos, DM2"
                aria-label="História Patológica Pregressa"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-hf-social"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                HF / História Social (separar por ;)
              </label>
              <input
                id="hosp-hf-social"
                type="text"
                value={bedRecord.familyAndSocialHistory.join('; ')}
                onChange={(e) =>
                  updateField(
                    'familyAndSocialHistory',
                    e.target.value
                      .split(';')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Ex.: Nega tabagismo; Mora com esposa"
                aria-label="História familiar e social"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
