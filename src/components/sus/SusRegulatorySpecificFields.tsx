import React from 'react';
import { SusDocumentItem, SusFilledFormData } from '../../types';
import { CAMPO_SUS, ROTULO_SUS } from './SusCommonIdentityFields';
import { COMMON_CID10 } from '../../data/cidCatalog';
import { Icon } from '../Icon';

export const MESES_DA_LME = ['1º', '2º', '3º', '4º', '5º', '6º'];
export const linhaVaziaDaLme = () => ({ name: '', quantities: MESES_DA_LME.map(() => '') });
export type LmeMedicationRow = ReturnType<typeof linhaVaziaDaLme>;

/** Descrições canônicas dos códigos CID-10 habituais do catálogo SUS. */
const DESCRICOES_CID_PADRAO: Record<string, string> = {
  'M54.5': 'Dor lombar baixa (Lombalgia)',
  I10: 'Hipertensão essencial (primária)',
  'M05.8': 'Outras artrites reumatoides soropositivas',
  'Z12.4': 'Exame especial de rastreamento de neoplasia do colo do útero',
  A90: 'Dengue (dengue clássico)',
  'N87.2': 'Displasia cervical grave, não classificada em outra parte',
  'Z12.3': 'Exame especial de rastreamento de neoplasia da mama',
  'A15.0': 'Tuberculose pulmonar, com confirmação por exame microscópico da expectoração',
};

function buscarDescricaoCid(codigo?: string): string {
  const limpo = (codigo || '').trim().toUpperCase();
  if (!limpo) return '';
  if (DESCRICOES_CID_PADRAO[limpo]) return DESCRICOES_CID_PADRAO[limpo];
  const encontrado = COMMON_CID10.find((c) => c.code.toUpperCase() === limpo);
  return encontrado?.description || '';
}

interface SusRegulatorySpecificFieldsProps {
  darkMode: boolean;
  currentDocItem: SusDocumentItem;
  formData: SusFilledFormData;
  linhasDaLme: LmeMedicationRow[];
  onFieldChange: <K extends keyof SusFilledFormData>(field: K, value: SusFilledFormData[K] | string) => void;
  onAlterarLinhaDaLme: (indice: number, alterar: (linha: LmeMedicationRow) => LmeMedicationRow) => void;
  onResetDoc?: () => void;
}

export const SusRegulatorySpecificFields: React.FC<SusRegulatorySpecificFieldsProps> = ({
  darkMode,
  currentDocItem,
  formData,
  linhasDaLme,
  onFieldChange,
  onAlterarLinhaDaLme,
  onResetDoc,
}) => {
  const handleCidCodeChange = (rawCode: string) => {
    onFieldChange('cid10Code', rawCode);
    const descSugerida = buscarDescricaoCid(rawCode);
    if (descSugerida && !formData.cid10Description?.trim()) {
      onFieldChange('cid10Description', descSugerida);
    }
  };

  const handleApplyDefaultCid = () => {
    const defaultCode = currentDocItem.defaultCid10 || '';
    if (!defaultCode) return;
    onFieldChange('cid10Code', defaultCode);
    const descSugerida = buscarDescricaoCid(defaultCode);
    if (descSugerida && !formData.cid10Description?.trim()) {
      onFieldChange('cid10Description', descSugerida);
    }
  };

  return (
    <div
      className="tactile-card p-4 rounded-2xl border"
      style={{
        backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
      }}
    >
      <datalist id="sus-cid10-datalist">
        {COMMON_CID10.map((item) => (
          <option key={item.code} value={item.code}>
            {item.description}
          </option>
        ))}
      </datalist>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
            3. Dados Regulatórios • {currentDocItem.shortTitle}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-inset)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            {currentDocItem.complexity}
          </span>
          {onResetDoc && (
            <button
              type="button"
              onClick={onResetDoc}
              className="text-xs font-semibold px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-rose-600 cursor-pointer transition"
              title="Limpar os dados clínicos deste documento"
            >
              Limpar campos
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {/* A LME não tem campo de procedimento SIGTAP */}
        <div
          className={`grid grid-cols-12 gap-2 ${
            currentDocItem.id === 'lme_medicamentos' ? 'hidden' : ''
          }`}
        >
          <div className={currentDocItem.id === 'apac_principal' ? 'col-span-4 sm:col-span-3' : 'col-span-4'}>
            <label htmlFor="sus-sigtap-code" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              Código SIGTAP
            </label>
            <input
              id="sus-sigtap-code"
              type="text"
              value={formData.sigtapCode || ''}
              onChange={(e) => onFieldChange('sigtapCode', e.target.value)}
              placeholder="00.00.00.000-0"
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
            />
          </div>
          <div className={currentDocItem.id === 'apac_principal' ? 'col-span-5 sm:col-span-7' : 'col-span-8'}>
            <label htmlFor="sus-sigtap-name" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              Descrição do Procedimento SIGTAP
            </label>
            <input
              id="sus-sigtap-name"
              type="text"
              value={formData.procedureName || ''}
              onChange={(e) => onFieldChange('procedureName', e.target.value)}
              placeholder="Nome do procedimento oficial"
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-semibold"
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
                className="w-full min-h-[38px] px-2 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] text-center outline-none focus:border-info clinical-tabular-nums"
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
                  if (currentDocItem.id === 'apac_principal' && !formData.procedureQuantity?.trim())
                    onFieldChange('procedureQuantity', '01');
                }}
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Usar o procedimento habitual deste documento ({currentDocItem.defaultSigtap})
              </button>
            </p>
          )}

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4 sm:col-span-3">
            <label htmlFor="sus-cid10-code" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              CID-10 Principal
            </label>
            <input
              id="sus-cid10-code"
              type="text"
              list="sus-cid10-datalist"
              value={formData.cid10Code || ''}
              onChange={(e) => handleCidCodeChange(e.target.value)}
              placeholder="Código"
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info uppercase font-mono font-bold"
            />
          </div>
          <div className="col-span-8 sm:col-span-9">
            <label htmlFor="sus-cid10-desc" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
              Descrição do Diagnóstico (CID-10)
            </label>
            <input
              id="sus-cid10-desc"
              type="text"
              value={formData.cid10Description || ''}
              onChange={(e) => onFieldChange('cid10Description', e.target.value)}
              placeholder="Descrição diagnóstica (ex.: Dor lombar baixa)"
              className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>
        </div>

        {!formData.cid10Code?.trim() && currentDocItem.defaultCid10 && (
          <p className="text-xs text-[var(--text-muted)]">
            CID-10 em branco.{' '}
            <button
              type="button"
              onClick={handleApplyDefaultCid}
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Usar o código habitual deste documento ({currentDocItem.defaultCid10}
              {buscarDescricaoCid(currentDocItem.defaultCid10)
                ? ` — ${buscarDescricaoCid(currentDocItem.defaultCid10)}`
                : ''}
              )
            </button>
          </p>
        )}

        {/* Campos Específicos para GAL / LACEN (Geral e TRM-TB) */}
        {currentDocItem.category === 'gal' && (
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label htmlFor="sus-sinan" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                  Nº da Notificação SINAN (Obrigatório GAL)
                </label>
                <input
                  id="sus-sinan"
                  type="text"
                  inputMode="numeric"
                  value={formData.sinanNumber || ''}
                  onChange={(e) => onFieldChange('sinanNumber', e.target.value)}
                  placeholder="Número SINAN (7 dígitos)"
                  className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="sus-symptoms-date" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                  Início dos Primeiros Sintomas (D1)
                </label>
                <input
                  id="sus-symptoms-date"
                  type="text"
                  value={formData.symptomsStartDate || ''}
                  onChange={(e) => onFieldChange('symptomsStartDate', e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
                />
              </div>
            </div>

            <div className={currentDocItem.id === 'gal_trm_tb' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : ''}>
              <div>
                <label htmlFor="sus-specimen" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                  Material Biológico / Amostra Coletada
                </label>
                <input
                  id="sus-specimen"
                  type="text"
                  value={formData.specimenType || ''}
                  onChange={(e) => onFieldChange('specimenType', e.target.value)}
                  placeholder={currentDocItem.id === 'gal_trm_tb' ? 'Ex.: Escarro (1ª amostra), LBA...' : 'Ex.: Soro, Sangue Total, Swab, LCR...'}
                  className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(currentDocItem.id === 'gal_trm_tb'
                    ? ['Escarro espontâneo', 'Escarro induzido', 'Lavado broncoalveolar (LBA)', 'Líquido pleural']
                    : ['Soro', 'Sangue Total', 'Plasma', 'Swab Nasofaríngeo', 'LCR', 'Urina']
                  ).map((amostra) => (
                    <button
                      key={amostra}
                      type="button"
                      onClick={() => onFieldChange('specimenType', amostra)}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] cursor-pointer transition"
                    >
                      {amostra}
                    </button>
                  ))}
                </div>
              </div>

              {currentDocItem.id === 'gal_trm_tb' && (
                <div>
                  <label htmlFor="sus-tb-duration" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                    Duração da Tosse / Sintomas Respiratórios
                  </label>
                  <input
                    id="sus-tb-duration"
                    type="text"
                    value={formData.tuberculosisSymptomsDuration || ''}
                    onChange={(e) => onFieldChange('tuberculosisSymptomsDuration', e.target.value)}
                    placeholder="Ex.: 3 semanas, 1 mês..."
                    className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campos Específicos para SISCAN (Citopatológico, Mamografia e Histopatológico) */}
        {currentDocItem.category === 'siscan' && (
          <div className="space-y-2.5 p-3 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10">
            {currentDocItem.id === 'siscan_citopatologico' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label htmlFor="sus-dum" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                    Data da Última Menstruação (DUM)
                  </label>
                  <input
                    id="sus-dum"
                    type="text"
                    value={formData.gynecologyDum || ''}
                    onChange={(e) => onFieldChange('gynecologyDum', e.target.value)}
                    placeholder="DD/MM/AAAA ou Menopausa"
                    className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                  />
                </div>
                <div>
                  <label htmlFor="sus-prev-cito" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                    Exame Citopatológico Anterior (Ano / Resultado)
                  </label>
                  <input
                    id="sus-prev-cito"
                    type="text"
                    value={formData.gynecologyPreviousExam || ''}
                    onChange={(e) => onFieldChange('gynecologyPreviousExam', e.target.value)}
                    placeholder="Ex.: 2024 (Normal)"
                    className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                  />
                </div>
              </div>
            )}

            {currentDocItem.id === 'siscan_mamografia' && (
              <div>
                <label htmlFor="sus-prev-mamo" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                  Mamografia Anterior (Ano / BI-RADS)
                </label>
                <input
                  id="sus-prev-mamo"
                  type="text"
                  value={formData.gynecologyPreviousExam || ''}
                  onChange={(e) => onFieldChange('gynecologyPreviousExam', e.target.value)}
                  placeholder="Ex.: 2024 — BI-RADS 2"
                  className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                />
              </div>
            )}

            {currentDocItem.id === 'siscan_histopatologico' && (
              <div>
                <label htmlFor="sus-histo-specimen" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                  Topografia / Lateralidade da Amostra (Biópsia)
                </label>
                <input
                  id="sus-histo-specimen"
                  type="text"
                  value={formData.specimenType || ''}
                  onChange={(e) => onFieldChange('specimenType', e.target.value)}
                  placeholder="Ex.: Colo uterino (12h), Mama direita (QSE)..."
                  className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                />
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {[
                    'Colo do útero — Biópsia',
                    'Colo do útero — CAF / LEEP',
                    'Endométrio',
                    'Mama Direita — Core Biopsy',
                    'Mama Esquerda — Core Biopsy',
                  ].map((sitio) => (
                    <button
                      key={sitio}
                      type="button"
                      onClick={() => onFieldChange('specimenType', sitio)}
                      className="px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] cursor-pointer transition"
                    >
                      {sitio}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campos Específicos para APAC Complementar */}
        {currentDocItem.id === 'apac_complementar' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-100 dark:bg-[#27354A] border border-slate-300 dark:border-white/10">
            <div>
              <label htmlFor="sus-creatinina" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Creatinina Sérica (mg/dL)
              </label>
              <input
                id="sus-creatinina"
                type="text"
                inputMode="decimal"
                value={formData.renalCreatinine || ''}
                onChange={(e) => onFieldChange('renalCreatinine', e.target.value)}
                placeholder="Ex.: 0,9"
                className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="sus-etfg" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Taxa de Filtração (eTFG)
              </label>
              <input
                id="sus-etfg"
                type="text"
                value={formData.renalEtfg || ''}
                onChange={(e) => onFieldChange('renalEtfg', e.target.value)}
                placeholder="mL/min/1,73m²"
                className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="sus-contraste" className="text-xs font-semibold text-[var(--text-muted)] block mb-1 truncate">
                Meio de Contraste EV
              </label>
              <select
                id="sus-contraste"
                value={formData.isContrastNeeded === false ? 'nao' : 'sim'}
                onChange={(e) => onFieldChange('isContrastNeeded', e.target.value === 'sim')}
                className={CAMPO_SUS}
              >
                <option value="sim">Sim (Indicado)</option>
                <option value="nao">Não indicado</option>
              </select>
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
