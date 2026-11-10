import React from 'react';
import { SusFilledFormData } from '../../types';
import { CAMPO_SUS, ROTULO_SUS } from './SusCommonIdentityFields';

export const MESES_DA_LME = ['1º', '2º', '3º', '4º', '5º', '6º'];
export const linhaVaziaDaLme = () => ({ name: '', quantities: MESES_DA_LME.map(() => '') });
export type LmeMedicationRow = ReturnType<typeof linhaVaziaDaLme>;

export interface SusLmeMedicationFieldsSectionProps {
  formData: SusFilledFormData;
  linhasDaLme: LmeMedicationRow[];
  onFieldChange: <K extends keyof SusFilledFormData>(field: K, value: SusFilledFormData[K] | string) => void;
  onAlterarLinhaDaLme: (indice: number, alterar: (linha: LmeMedicationRow) => LmeMedicationRow) => void;
}

export const SusLmeMedicationFieldsSection: React.FC<SusLmeMedicationFieldsSectionProps> = ({
  formData,
  linhasDaLme,
  onFieldChange,
  onAlterarLinhaDaLme,
}) => {
  return (
    <div className="space-y-3 p-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10">
      <div className="space-y-2">
        <span className={ROTULO_SUS}>7 e 8 — Medicamento(s) e quantidade solicitada por mês</span>
        {linhasDaLme.map((linha, indice) => (
          <div key={indice} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-4 text-xs font-bold text-[var(--text-muted)]">
                {indice + 1}
              </span>
              <input
                type="text"
                aria-label={`Medicamento ${indice + 1}`}
                value={linha.name}
                onChange={(e) =>
                  onAlterarLinhaDaLme(indice, (l) => ({ ...l, name: e.target.value }))
                }
                placeholder="Ex.: Atorvastatina 40 mg comprimido"
                className={`${CAMPO_SUS} font-semibold`}
              />
              {linhasDaLme.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onFieldChange(
                      'lmeMedications',
                      linhasDaLme.filter((_, i) => i !== indice)
                    )
                  }
                  className="h-8 px-2 rounded-lg border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                  aria-label={`Remover medicamento ${indice + 1}`}
                >
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-6 gap-1 pl-5">
              {MESES_DA_LME.map((mes, m) => (
                <input
                  key={mes}
                  type="text"
                  inputMode="numeric"
                  aria-label={`Quantidade do ${mes} mês, medicamento ${indice + 1}`}
                  value={linha.quantities[m] || ''}
                  onChange={(e) =>
                    onAlterarLinhaDaLme(indice, (l) => ({
                      ...l,
                      quantities: MESES_DA_LME.map((_, i) =>
                        i === m ? e.target.value : l.quantities[i] || ''
                      ),
                    }))
                  }
                  placeholder={`Ex.: ${mes}`}
                  className="w-full px-1.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-center outline-none focus:border-info clinical-tabular-nums"
                />
              ))}
            </div>
            {linha.quantities[0]?.trim() && (
              <button
                type="button"
                onClick={() =>
                  onAlterarLinhaDaLme(indice, (l) => ({
                    ...l,
                    quantities: MESES_DA_LME.map(() => l.quantities[0]),
                  }))
                }
                className="ml-5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Repetir a quantidade do 1º mês nos 6 meses
              </button>
            )}
          </div>
        ))}
        {linhasDaLme.length < 6 && (
          <button
            type="button"
            onClick={() =>
              onFieldChange('lmeMedications', [...linhasDaLme, linhaVaziaDaLme()])
            }
            className="h-8 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-xs font-semibold text-[var(--text-main)] cursor-pointer"
          >
            Adicionar medicamento
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label htmlFor="lme-peso" className={ROTULO_SUS}>
            5 — Peso (kg)
          </label>
          <input
            id="lme-peso"
            type="text"
            inputMode="decimal"
            value={formData.patientWeightKg || ''}
            onChange={(e) => onFieldChange('patientWeightKg', e.target.value)}
            className={`${CAMPO_SUS} clinical-tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="lme-altura" className={ROTULO_SUS}>
            6 — Altura (cm)
          </label>
          <input
            id="lme-altura"
            type="text"
            inputMode="numeric"
            value={formData.patientHeightCm || ''}
            onChange={(e) => onFieldChange('patientHeightCm', e.target.value)}
            className={`${CAMPO_SUS} clinical-tabular-nums`}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="lme-cns-medico" className={ROTULO_SUS}>
            15 — CNS do médico solicitante
          </label>
          <input
            id="lme-cns-medico"
            type="text"
            inputMode="numeric"
            value={formData.doctorCns || ''}
            onChange={(e) => onFieldChange('doctorCns', e.target.value)}
            placeholder="Ex.: 700 0000 0000 0000"
            className={`${CAMPO_SUS} font-mono clinical-tabular-nums`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label htmlFor="lme-tratamento" className={ROTULO_SUS}>
            12 — Tratamento prévio?
          </label>
          <select
            id="lme-tratamento"
            value={formData.lmePreviousTreatment || ''}
            onChange={(e) => onFieldChange('lmePreviousTreatment', e.target.value)}
            className={CAMPO_SUS}
          >
            <option value="">Deixar em branco</option>
            <option value="nao">Não</option>
            <option value="sim">Sim (relatar)</option>
          </select>
        </div>
        {formData.lmePreviousTreatment === 'sim' && (
          <div className="sm:col-span-2">
            <label htmlFor="lme-tratamento-relato" className={ROTULO_SUS}>
              Relato do tratamento prévio
            </label>
            <input
              id="lme-tratamento-relato"
              type="text"
              value={formData.lmePreviousTreatmentReport || ''}
              onChange={(e) => onFieldChange('lmePreviousTreatmentReport', e.target.value)}
              className={CAMPO_SUS}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label htmlFor="lme-incapaz" className={ROTULO_SUS}>
            13 — Paciente incapaz?
          </label>
          <select
            id="lme-incapaz"
            value={formData.lmeIncapable || ''}
            onChange={(e) => onFieldChange('lmeIncapable', e.target.value)}
            className={CAMPO_SUS}
          >
            <option value="">Deixar em branco</option>
            <option value="nao">Não</option>
            <option value="sim">Sim (indicar responsável)</option>
          </select>
        </div>
        {formData.lmeIncapable === 'sim' && (
          <div className="sm:col-span-2">
            <label htmlFor="lme-responsavel" className={ROTULO_SUS}>
              Nome do responsável
            </label>
            <input
              id="lme-responsavel"
              type="text"
              value={formData.lmeResponsibleName || ''}
              onChange={(e) => onFieldChange('lmeResponsibleName', e.target.value)}
              className={CAMPO_SUS}
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="lme-email" className={ROTULO_SUS}>
          22 — Correio eletrônico do paciente (opcional)
        </label>
        <input
          id="lme-email"
          type="email"
          value={formData.patientEmail || ''}
          onChange={(e) => onFieldChange('patientEmail', e.target.value)}
          className={CAMPO_SUS}
        />
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Os campos 18 e 23 (quem preencheu os dados complementares e assinatura) ficam em branco para preenchimento à mão. A LME não tem campo de posologia: ela vai na receita que acompanha o laudo.
      </p>
    </div>
  );
};
