import React, { useState } from 'react';
import { DoctorProfile, SusDocumentItem, SusFilledFormData } from '../../types';
import { medicoConfigurado } from '../../utils/medicoConfigurado';
import { Icon } from '../Icon';

export const CAMPO_SUS =
  'w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info focus-visible:ring-2 focus-visible:ring-sky-500/30 transition clinical-tabular-nums';
export const ROTULO_SUS = 'text-xs font-semibold text-[var(--text-muted)] block mb-1';

const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface SusCommonIdentityFieldsProps {
  darkMode: boolean;
  doctor: DoctorProfile;
  currentDocItem: SusDocumentItem;
  formData: SusFilledFormData;
  hasOfficialForm: boolean;
  onFieldChange: <K extends keyof SusFilledFormData>(field: K, value: SusFilledFormData[K] | string) => void;
}

export const SusCommonIdentityFields: React.FC<SusCommonIdentityFieldsProps> = ({
  darkMode,
  doctor,
  currentDocItem,
  formData,
  hasOfficialForm,
  onFieldChange,
}) => {
  const isDoctorReady = medicoConfigurado(doctor);
  const [isDoctorExpanded, setIsDoctorExpanded] = useState<boolean>(() => !isDoctorReady);

  return (
    <>
      <datalist id="sus-ufs-datalist">
        {UFS_BRASIL.map((uf) => (
          <option key={uf} value={uf} />
        ))}
      </datalist>

      {/* CARD 1: DADOS DO MÉDICO / ESTABELECIMENTO (AUTOFILLED & RETRÁTIL QUANDO CONFIGURADO) */}
      <div
        className="tactile-card p-4 rounded-2xl border"
        style={{
          backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="verified_user" className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              1. Identificação do Médico & Unidade Solicitante
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {isDoctorReady ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Icon name="check" className="w-3 h-3 stroke-[3]" />
                Importado do Perfil
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Icon name="error" className="w-3 h-3" />
                Complete os dados
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsDoctorExpanded((prev) => !prev)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] hover:bg-[var(--surface-hover)] text-[var(--text-main)] flex items-center gap-1 cursor-pointer transition"
            >
              <Icon name={isDoctorExpanded ? 'expand_less' : 'expand_more'} size={15} />
              <span>{isDoctorExpanded ? 'Recolher' : 'Editar emitente'}</span>
            </button>
          </div>
        </div>

        {!isDoctorExpanded && (
          <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span className="truncate">
              <strong className="text-[var(--text-main)]">{formData.doctorName || 'Médico não informado'}</strong>
              {' • '}
              CRM-{formData.doctorCrmState || 'SP'} {formData.doctorCrm || '—'}
              {' • '}
              {formData.doctorClinicName || 'Unidade Básica de Saúde'}
              {formData.doctorCnes ? ` (CNES: ${formData.doctorCnes})` : ''}
            </span>
          </div>
        )}

        {isDoctorExpanded && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label htmlFor="sus-doc-name" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Nome do Médico(a)
              </label>
              <input
                id="sus-doc-name"
                type="text"
                value={formData.doctorName}
                onChange={(e) => onFieldChange('doctorName', e.target.value)}
                placeholder="Dr(a). Médico(a)"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="sus-doc-crm" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  CRM
                </label>
                <input
                  id="sus-doc-crm"
                  type="text"
                  value={formData.doctorCrm}
                  onChange={(e) => onFieldChange('doctorCrm', e.target.value)}
                  placeholder="000000"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="sus-doc-uf" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                  UF CRM
                </label>
                <input
                  id="sus-doc-uf"
                  type="text"
                  list="sus-ufs-datalist"
                  maxLength={2}
                  value={formData.doctorCrmState}
                  onChange={(e) => onFieldChange('doctorCrmState', e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info uppercase"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sus-doc-specialty" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Especialidade / CBO
              </label>
              <input
                id="sus-doc-specialty"
                type="text"
                value={formData.doctorSpecialty}
                onChange={(e) => onFieldChange('doctorSpecialty', e.target.value)}
                placeholder="Clínica Médica"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>

            <div>
              <label htmlFor="sus-doc-cnes" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                CNES da Unidade Solicitante
              </label>
              <input
                id="sus-doc-cnes"
                type="text"
                inputMode="numeric"
                value={formData.doctorCnes}
                onChange={(e) => onFieldChange('doctorCnes', e.target.value)}
                placeholder="CNES (7 dígitos)"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="sus-doc-cpf" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                CPF do Médico (APAC cpo. 44)
              </label>
              <input
                id="sus-doc-cpf"
                type="text"
                inputMode="numeric"
                value={formData.doctorCpf || ''}
                onChange={(e) => onFieldChange('doctorCpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="sus-doc-cns" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                CNS do Médico (LME cpo. 15 / APAC)
              </label>
              <input
                id="sus-doc-cns"
                type="text"
                inputMode="numeric"
                value={formData.doctorCns || ''}
                onChange={(e) => onFieldChange('doctorCns', e.target.value)}
                placeholder="700 0000 0000 0000 (15 dígitos)"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sus-doc-clinic" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Nome da Unidade / Estabelecimento Solicitante
              </label>
              <input
                id="sus-doc-clinic"
                type="text"
                value={formData.doctorClinicName}
                onChange={(e) => onFieldChange('doctorClinicName', e.target.value)}
                placeholder="Unidade Básica de Saúde / Policlínica"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: DADOS DO PACIENTE COM DESTAQUE EM CAMPOS FALTANTES */}
      <div
        className="tactile-card p-4 rounded-2xl border"
        style={{
          backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <Icon name="person" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              2. Identificação do Paciente
            </h3>
          </div>
          {formData.patientName?.trim() && formData.patientAddress?.trim() && formData.patientCns?.trim() && formData.patientCity?.trim() ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Icon name="check" className="w-3 h-3 stroke-[3]" />
              Dados do Paciente Completos
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#27354A] px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-white/10">
              Faltante:{' '}
              {[
                !formData.patientName?.trim() && 'Nome',
                !formData.patientCns?.trim() && 'Cartão SUS (CNS)',
                !formData.patientAddress?.trim() && 'Endereço',
                !formData.patientCity?.trim() && 'Cidade',
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label htmlFor="sus-patient-name" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome Completo do Paciente
            </label>
            <input
              id="sus-patient-name"
              type="text"
              value={formData.patientName}
              onChange={(e) => onFieldChange('patientName', e.target.value)}
              placeholder="Ex.: Maria de Oliveira Santos"
              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-semibold"
            />
          </div>

          <div>
            <label htmlFor="sus-patient-cns" className="text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between mb-1">
              <span>Cartão SUS (CNS)</span>
              {!formData.patientCns?.trim() && (
                <span className="text-xs text-amber-500 font-bold uppercase">Faltante</span>
              )}
            </label>
            <input
              id="sus-patient-cns"
              type="text"
              inputMode="numeric"
              value={formData.patientCns}
              onChange={(e) => onFieldChange('patientCns', e.target.value)}
              placeholder="000 0000 0000 0000 (15 dígitos)"
              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500 font-mono clinical-tabular-nums"
            />
          </div>

          <div>
            <label htmlFor="sus-patient-cpf" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              CPF / Documento
            </label>
            <input
              id="sus-patient-cpf"
              type="text"
              value={formData.patientCpf}
              onChange={(e) => onFieldChange('patientCpf', e.target.value)}
              placeholder="000.000.000-00"
              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="sus-patient-birth" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Nascimento
              </label>
              <input
                id="sus-patient-birth"
                type="text"
                value={formData.patientBirthDate}
                onChange={(e) => onFieldChange('patientBirthDate', e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
              />
            </div>
            <div>
              <label htmlFor="sus-patient-age" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Idade
              </label>
              <input
                id="sus-patient-age"
                type="text"
                value={formData.patientAge}
                onChange={(e) => onFieldChange('patientAge', e.target.value)}
                placeholder="Ex.: 45 anos"
                className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
          </div>

          <div>
            <label htmlFor="sus-patient-phone" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Telefone de Contato (DDD + Número)
            </label>
            <input
              id="sus-patient-phone"
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => onFieldChange('patientPhone', e.target.value)}
              placeholder="(69) 90000-0000"
              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="sus-patient-mother" className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome Completo da Mãe
            </label>
            <input
              id="sus-patient-mother"
              type="text"
              value={formData.patientMotherName}
              onChange={(e) => onFieldChange('patientMotherName', e.target.value)}
              placeholder="Nome completo da mãe do paciente"
              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>

          {/* Sexo e raça/cor: campos dos impressos oficiais; só saem marcados se escolhidos aqui */}
          {hasOfficialForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:col-span-2">
              <div>
                <label htmlFor="sus-sexo" className={ROTULO_SUS}>
                  Sexo (campo do impresso)
                </label>
                <select
                  id="sus-sexo"
                  value={formData.patientSex || ''}
                  onChange={(e) => onFieldChange('patientSex', e.target.value)}
                  className={CAMPO_SUS}
                >
                  <option value="">Deixar em branco</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
              <div>
                <label htmlFor="sus-raca-cor" className={ROTULO_SUS}>
                  Raça/cor informada pelo paciente
                </label>
                <select
                  id="sus-raca-cor"
                  value={formData.patientRaceColor || ''}
                  onChange={(e) => onFieldChange('patientRaceColor', e.target.value)}
                  className={CAMPO_SUS}
                >
                  <option value="">Deixar em branco</option>
                  <option value="branca">Branca</option>
                  <option value="preta">Preta</option>
                  <option value="parda">Parda</option>
                  <option value="amarela">Amarela</option>
                  <option value="indigena">Indígena</option>
                </select>
              </div>
              {formData.patientRaceColor === 'indigena' &&
                currentDocItem.id === 'lme_medicamentos' && (
                  <div className="sm:col-span-2">
                    <label htmlFor="sus-etnia" className={ROTULO_SUS}>
                      Etnia Indígena (campo 19 da LME)
                    </label>
                    <input
                      id="sus-etnia"
                      type="text"
                      value={formData.patientEthnicity || ''}
                      onChange={(e) => onFieldChange('patientEthnicity', e.target.value)}
                      placeholder="Informe a etnia indígena"
                      className={CAMPO_SUS}
                    />
                  </div>
                )}
            </div>
          )}

          {/* CAMPOS DE ENDEREÇO RESIDENCIAL (MANDATÓRIO NO SUS) */}
          <div className="sm:col-span-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Endereço Residencial do Paciente (Obrigatório para SISREG / APAC / GAL):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <label htmlFor="sus-patient-address" className="text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between mb-0.5">
                  <span>Logradouro, Número e Complemento</span>
                  {!formData.patientAddress?.trim() && (
                    <span className="text-xs text-amber-500 font-bold uppercase">Faltante</span>
                  )}
                </label>
                <input
                  id="sus-patient-address"
                  type="text"
                  value={formData.patientAddress}
                  onChange={(e) => onFieldChange('patientAddress', e.target.value)}
                  placeholder="Ex.: Rua das Flores, 450, Apto 12"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500"
                />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="sus-patient-neighborhood" className="text-xs font-semibold text-[var(--text-muted)] block mb-0.5">
                  Bairro / Distrito
                </label>
                <input
                  id="sus-patient-neighborhood"
                  type="text"
                  value={formData.patientNeighborhood}
                  onChange={(e) => onFieldChange('patientNeighborhood', e.target.value)}
                  placeholder="Ex.: Centro"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500"
                />
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="sus-patient-city" className="text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between mb-0.5">
                  <span>Município de Residência</span>
                  {!formData.patientCity?.trim() && (
                    <span className="text-xs text-amber-500 font-bold uppercase">Faltante</span>
                  )}
                </label>
                <input
                  id="sus-patient-city"
                  type="text"
                  value={formData.patientCity}
                  onChange={(e) => onFieldChange('patientCity', e.target.value)}
                  placeholder="Cidade do paciente"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sus-patient-state" className="text-xs font-semibold text-[var(--text-muted)] block mb-0.5">
                  UF
                </label>
                <input
                  id="sus-patient-state"
                  type="text"
                  list="sus-ufs-datalist"
                  maxLength={2}
                  value={formData.patientState}
                  onChange={(e) => onFieldChange('patientState', e.target.value.toUpperCase())}
                  placeholder="UF"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info uppercase text-center"
                />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="sus-patient-cep" className="text-xs font-semibold text-[var(--text-muted)] block mb-0.5">
                  CEP
                </label>
                <input
                  id="sus-patient-cep"
                  type="text"
                  inputMode="numeric"
                  value={formData.patientCep}
                  onChange={(e) => onFieldChange('patientCep', e.target.value)}
                  placeholder="00000-000"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono clinical-tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
