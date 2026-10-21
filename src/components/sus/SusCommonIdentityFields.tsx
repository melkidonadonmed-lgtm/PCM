import React from 'react';
import { DoctorProfile, SusDocumentItem, SusFilledFormData } from '../../types';
import { medicoConfigurado } from '../../utils/medicoConfigurado';
import { Icon } from '../Icon';

export const CAMPO_SUS =
  'w-full px-3 py-1.5 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info clinical-tabular-nums';
export const ROTULO_SUS = 'text-xs font-semibold text-[var(--text-muted)] block mb-1';

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
  return (
    <>
      {/* CARD 1: DADOS DO MÉDICO / ESTABELECIMENTO (AUTOFILLED) */}
      <div
        className="tactile-card p-4 rounded-2xl border"
        style={{
          backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <Icon name="verified_user" className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              1. Identificação do Médico & Unidade Solicitante
            </h3>
          </div>
          {medicoConfigurado(doctor) ? (
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome do Médico(a)
            </label>
            <input
              type="text"
              value={formData.doctorName}
              onChange={(e) => onFieldChange('doctorName', e.target.value)}
              placeholder="Dr(a). Médico(a)"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                CRM
              </label>
              <input
                type="text"
                value={formData.doctorCrm}
                onChange={(e) => onFieldChange('doctorCrm', e.target.value)}
                placeholder="000000"
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                UF CRM
              </label>
              <input
                type="text"
                value={formData.doctorCrmState}
                onChange={(e) => onFieldChange('doctorCrmState', e.target.value)}
                placeholder="SP"
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Especialidade
            </label>
            <input
              type="text"
              value={formData.doctorSpecialty}
              onChange={(e) => onFieldChange('doctorSpecialty', e.target.value)}
              placeholder="Clínica Médica"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                CNES Unidade
              </label>
              <input
                type="text"
                value={formData.doctorCnes}
                onChange={(e) => onFieldChange('doctorCnes', e.target.value)}
                placeholder="CNES (7 dígitos)"
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                CPF do Médico (LME)
              </label>
              <input
                type="text"
                value={formData.doctorCpf || ''}
                onChange={(e) => onFieldChange('doctorCpf', e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome da Unidade / Estabelecimento Solicitante
            </label>
            <input
              type="text"
              value={formData.doctorClinicName}
              onChange={(e) => onFieldChange('doctorClinicName', e.target.value)}
              placeholder="Unidade Básica de Saúde / Policlínica"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: DADOS DO PACIENTE COM DESTAQUE EM CAMPOS FALTANTES (AUTOFILLED) */}
      <div
        className="tactile-card p-4 rounded-2xl border"
        style={{
          backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <Icon name="person" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              2. Identificação do Paciente
            </h3>
          </div>
          {formData.patientAddress && formData.patientCns && formData.patientCity ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Icon name="check" className="w-3 h-3 stroke-[3]" />
              Dados do Paciente Completos
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#27354A] px-2.5 py-0.5 rounded-md border border-slate-300 dark:border-white/10">
              Faltante:{' '}
              {[
                !formData.patientAddress && 'Endereço',
                !formData.patientCns && 'Cartão SUS (CNS)',
                !formData.patientCity && 'Cidade',
              ]
                .filter(Boolean)
                .join(', ')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome Completo do Paciente
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => onFieldChange('patientName', e.target.value)}
              placeholder="Nome completo do paciente"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between mb-1">
              <span>Cartão SUS (CNS)</span>
              {!formData.patientCns && (
                <span className="text-xs text-amber-500 font-bold uppercase">Faltante</span>
              )}
            </label>
            <input
              type="text"
              value={formData.patientCns}
              onChange={(e) => onFieldChange('patientCns', e.target.value)}
              placeholder="000 0000 0000 0000 (15 dígitos)"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              CPF / Documento
            </label>
            <input
              type="text"
              value={formData.patientCpf}
              onChange={(e) => onFieldChange('patientCpf', e.target.value)}
              placeholder="000.000.000-00"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Nascimento
              </label>
              <input
                type="text"
                value={formData.patientBirthDate}
                onChange={(e) => onFieldChange('patientBirthDate', e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
                Idade
              </label>
              <input
                type="text"
                value={formData.patientAge}
                onChange={(e) => onFieldChange('patientAge', e.target.value)}
                placeholder="Ex: 45 anos"
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Nome da Mãe
            </label>
            <input
              type="text"
              value={formData.patientMotherName}
              onChange={(e) => onFieldChange('patientMotherName', e.target.value)}
              placeholder="Nome da mãe do paciente"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
              Telefone de Contato
            </label>
            <input
              type="text"
              value={formData.patientPhone}
              onChange={(e) => onFieldChange('patientPhone', e.target.value)}
              placeholder="(69) 90000-0000"
              className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
            />
          </div>

          {/* Sexo e raça/cor: campos dos impressos oficiais; só saem marcados se escolhidos aqui */}
          {hasOfficialForm && (
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
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
                  <div className="col-span-2">
                    <label htmlFor="sus-etnia" className={ROTULO_SUS}>
                      Etnia
                    </label>
                    <input
                      id="sus-etnia"
                      type="text"
                      value={formData.patientEthnicity || ''}
                      onChange={(e) => onFieldChange('patientEthnicity', e.target.value)}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between mb-0.5">
                  <span>Logradouro e Número</span>
                  {!formData.patientAddress && (
                    <span className="text-xs text-amber-500 font-bold uppercase">Faltante</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.patientAddress}
                  onChange={(e) => onFieldChange('patientAddress', e.target.value)}
                  placeholder="Rua / Avenida, Número e Complemento"
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-0.5">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.patientNeighborhood}
                  onChange={(e) => onFieldChange('patientNeighborhood', e.target.value)}
                  placeholder="Bairro"
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center justify-between mb-0.5">
                  <span>Município</span>
                  {!formData.patientCity && (
                    <span className="text-xs text-amber-500 font-bold uppercase">Faltante</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.patientCity}
                  onChange={(e) => onFieldChange('patientCity', e.target.value)}
                  placeholder="Cidade do paciente"
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-0.5">
                  UF
                </label>
                <input
                  type="text"
                  value={formData.patientState}
                  onChange={(e) => onFieldChange('patientState', e.target.value)}
                  placeholder="UF"
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info uppercase"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-0.5">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.patientCep}
                  onChange={(e) => onFieldChange('patientCep', e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-info"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
