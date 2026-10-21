import React from 'react';
import { SusDocumentItem, SusFilledFormData } from '../../types';
import { CAMPO_SUS, ROTULO_SUS } from './SusCommonIdentityFields';
import { Icon } from '../Icon';

export const MESES_DA_LME = ['1º', '2º', '3º', '4º', '5º', '6º'];
export const linhaVaziaDaLme = () => ({ name: '', quantities: MESES_DA_LME.map(() => '') });
export type LmeMedicationRow = ReturnType<typeof linhaVaziaDaLme>;

interface SusRegulatorySpecificFieldsProps {
  darkMode: boolean;
  currentDocItem: SusDocumentItem;
  formData: SusFilledFormData;
  linhasDaLme: LmeMedicationRow[];
  onFieldChange: <K extends keyof SusFilledFormData>(field: K, value: SusFilledFormData[K] | string) => void;
  onAlterarLinhaDaLme: (indice: number, alterar: (linha: LmeMedicationRow) => LmeMedicationRow) => void;
}

export const SusRegulatorySpecificFields: React.FC<SusRegulatorySpecificFieldsProps> = ({
  darkMode,
  currentDocItem,
  formData,
  linhasDaLme,
  onFieldChange,
  onAlterarLinhaDaLme,
}) => {
  return (
    <div
      className="tactile-card p-4 rounded-2xl border"
      style={{
        backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
            3. Dados Regulatórios • {currentDocItem.shortTitle}
          </h3>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
          {currentDocItem.complexity}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* A LME não tem campo de procedimento SIGTAP */}
        <div
          className={`grid grid-cols-12 gap-2 ${
            currentDocItem.id === 'lme_medicamentos' ? 'hidden' : ''
          }`}
        >
          <div className={currentDocItem.id === 'apac_principal' ? 'col-span-4 sm:col-span-3' : 'col-span-4'}>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              Código SIGTAP
            </label>
            <input
              type="text"
              value={formData.sigtapCode}
              onChange={(e) => onFieldChange('sigtapCode', e.target.value)}
              placeholder="00.00.00.000-0"
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
            />
          </div>
          <div className={currentDocItem.id === 'apac_principal' ? 'col-span-5 sm:col-span-7' : 'col-span-8'}>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              Descrição do Procedimento SIGTAP
            </label>
            <input
              type="text"
              value={formData.procedureName}
              onChange={(e) => onFieldChange('procedureName', e.target.value)}
              placeholder="Nome do procedimento oficial"
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-semibold"
            />
          </div>
          {currentDocItem.id === 'apac_principal' && (
            <div className="col-span-3 sm:col-span-2">
              <label htmlFor="sus-qtde" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Qtde (cpo. 20)
              </label>
              <input
                id="sus-qtde"
                type="text"
                inputMode="numeric"
                value={formData.procedureQuantity || ''}
                onChange={(e) => onFieldChange('procedureQuantity', e.target.value)}
                placeholder="Ex.: 01"
                className="w-full px-2 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] text-center outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
          )}
        </div>

        {currentDocItem.id !== 'lme_medicamentos' &&
          (!formData.sigtapCode?.trim() || !formData.procedureName?.trim()) &&
          (currentDocItem.defaultSigtap || currentDocItem.defaultProcedure) && (
            <p className="text-xs text-[var(--text-muted)]">
              Procedimento em branco.{' '}
              <button
                type="button"
                onClick={() => {
                  if (currentDocItem.defaultSigtap)
                    onFieldChange('sigtapCode', currentDocItem.defaultSigtap);
                  if (currentDocItem.defaultProcedure)
                    onFieldChange('procedureName', currentDocItem.defaultProcedure);
                }}
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Usar o procedimento habitual deste documento ({currentDocItem.defaultSigtap})
              </button>
            </p>
          )}

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4 sm:col-span-3">
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              CID-10 Principal
            </label>
            <input
              type="text"
              value={formData.cid10Code}
              onChange={(e) => onFieldChange('cid10Code', e.target.value)}
              placeholder="Código"
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info uppercase font-mono font-bold"
            />
          </div>
          <div className="col-span-8 sm:col-span-9">
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              Descrição do Diagnóstico (CID-10)
            </label>
            <input
              type="text"
              value={formData.cid10Description || ''}
              onChange={(e) => onFieldChange('cid10Description', e.target.value)}
              placeholder="Descrição diagnóstica"
              className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>
        </div>

        {!formData.cid10Code?.trim() && currentDocItem.defaultCid10 && (
          <p className="text-xs text-[var(--text-muted)]">
            CID-10 em branco.{' '}
            <button
              type="button"
              onClick={() => onFieldChange('cid10Code', currentDocItem.defaultCid10 || '')}
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Usar o código habitual deste documento ({currentDocItem.defaultCid10})
            </button>
          </p>
        )}

        {/* Campos Específicos para GAL / LACEN */}
        {currentDocItem.category === 'gal' && (
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Nº da Notificação SINAN (Obrigatório GAL)
              </label>
              <input
                type="text"
                value={formData.sinanNumber || ''}
                onChange={(e) => onFieldChange('sinanNumber', e.target.value)}
                placeholder="Número SINAN (7 dígitos)"
                className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Início dos Primeiros Sintomas (D1)
              </label>
              <input
                type="text"
                value={formData.symptomsStartDate || ''}
                onChange={(e) => onFieldChange('symptomsStartDate', e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
          </div>
        )}

        {/* Campos Específicos para APAC Complementar */}
        {currentDocItem.id === 'apac_complementar' && (
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Creatinina Sérica (mg/dL)
              </label>
              <input
                type="text"
                value={formData.renalCreatinine || ''}
                onChange={(e) => onFieldChange('renalCreatinine', e.target.value)}
                placeholder="Ex.: 0,9"
                className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Taxa de Filtração Glomerular (eTFG)
              </label>
              <input
                type="text"
                value={formData.renalEtfg || ''}
                onChange={(e) => onFieldChange('renalEtfg', e.target.value)}
                placeholder="mL/min/1,73m²"
                className="w-full px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
          </div>
        )}

        {/* Campos Específicos para LME Farmácia de Alto Custo (numeração do impresso oficial) */}
        {currentDocItem.id === 'lme_medicamentos' && (
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
                      placeholder="Medicamento, concentração e forma (como no PCDT)"
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
                        placeholder={`${mes} mês`}
                        className="w-full px-1.5 py-1 rounded-lg bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-center outline-none focus:border-info"
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
                  className={CAMPO_SUS}
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
                  className={CAMPO_SUS}
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
                  placeholder="15 dígitos"
                  className={`${CAMPO_SUS} font-mono`}
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
        )}

        <div>
          <label
            htmlFor="sus-justificativa"
            className="text-xs font-semibold text-[var(--text-muted)] block mb-1"
          >
            Justificativa clínica e indicação técnica
          </label>
          <textarea
            id="sus-justificativa"
            rows={4}
            value={formData.clinicalJustification}
            onChange={(e) => onFieldChange('clinicalJustification', e.target.value)}
            placeholder="Descreva o quadro do paciente: história, exame físico e o que já foi tentado."
            className="w-full p-3 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info leading-relaxed font-sans"
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                onFieldChange('clinicalJustification', currentDocItem.defaultJustification || '')
              }
              className="h-8 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-xs font-semibold text-[var(--text-main)] cursor-pointer transition active:scale-95"
              title="Preenche o campo com um texto-modelo deste documento, para você adaptar ao caso"
            >
              {formData.clinicalJustification?.trim()
                ? 'Substituir pelo texto-modelo'
                : 'Inserir texto-modelo'}
            </button>
            <span className="text-xs text-[var(--text-muted)]">
              O modelo é um ponto de partida: ajuste ao caso antes de emitir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
