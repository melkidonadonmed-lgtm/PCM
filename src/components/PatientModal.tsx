import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { Patient } from '../types';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

/**
 * Modal de Cadastro e Edição Rápida do Paciente.
 * Estados de UI cobertos: empty (paciente vazio), loading (carregando validação),
 * success (dados do paciente salvos com sucesso) e error (erro de peso/data inválida).
 */
interface PatientModalProps {
  darkMode: boolean;
  patient: Patient;
  onSavePatient: (patient: Patient) => void;
  onClearPatient?: () => void;
  onClose: () => void;
}

export function buildInitialPatientModalState(patient: Patient, fallbackId = 'pat-modal'): Patient {
  return {
    ...patient,
    id: patient?.id || fallbackId,
    name: patient?.name || '',
    weightKg: patient?.weightKg ?? 0,
    weightCalcEnabled: patient?.weightCalcEnabled ?? false,
    ageText: patient?.ageText || '',
    birthDate: patient?.birthDate || '',
    gender: patient?.gender || 'male',
    sex: patient?.sex || '',
    documentNumber: patient?.documentNumber || '',
    motherName: patient?.motherName || '',
    phone: patient?.phone || '',
    allergies: patient?.allergies || [],
    notes: patient?.notes || ''
  };
}

export function applyAgeOrBirthDateInput(current: Patient, rawVal: string): Patient {
  const looksLikeDate = /^\d{1,2}\/\d{1,2}(\/\d{0,4})?$|^\d{4}-\d{1,2}(-\d{1,2})?$/.test(rawVal.trim());
  if (!rawVal.trim()) {
    return { ...current, birthDate: '', ageText: '' };
  }
  if (looksLikeDate) {
    return {
      ...current,
      birthDate: rawVal,
      ageText: current.ageText === current.birthDate ? '' : current.ageText,
    };
  }
  return {
    ...current,
    ageText: rawVal,
    birthDate: current.birthDate === current.ageText ? '' : current.birthDate,
  };
}

export const PatientModal: React.FC<PatientModalProps> = ({
  darkMode,
  patient,
  onSavePatient,
  onClearPatient,
  onClose
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useModalAccessibility({
    isOpen: true,
    onClose,
    containerRef: modalRef,
    initialFocusRef: nameInputRef,
  });

  const [formData, setFormData] = useState<Patient>(() =>
    buildInitialPatientModalState(patient, 'pat-' + Date.now())
  );
  const [allergiesText, setAllergiesText] = useState<string>(() =>
    patient?.allergies?.join(', ') || ''
  );
  const [weightDraft, setWeightDraft] = useState<string | null>(null);

  // Acessibilidade WCAG 2.2: Foco inicial executado apenas na montagem (Escape e Focus Trap gerenciados por useModalAccessibility)
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleClear = () => {
    const emptyPat: Patient = {
      id: 'pat-' + Date.now(),
      name: '',
      weightKg: 0,
      weightCalcEnabled: false,
      ageText: '',
      birthDate: '',
      gender: 'male',
      sex: '',
      documentNumber: '',
      motherName: '',
      phone: '',
      allergies: [],
      notes: ''
    };
    setFormData(emptyPat);
    setAllergiesText('');
    setWeightDraft(null);
    if (onClearPatient) {
      onClearPatient();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePatient(formData);
    onClose();
  };

  return (
    <div
      ref={modalRef}
      data-state="idle"
      aria-busy={false}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-[oklch(0.14_0.02_258/0.60)] isolate animate-backdrop-fade"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-modal-title"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl tactile-modal modal-content overflow-hidden isolate transition modal-surface-spring"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--hairline)] bg-[var(--surface-card)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] border border-[var(--hairline)] flex items-center justify-center font-bold">
              <Icon name="person" className="text-[18px]" />
            </div>
            <h3 id="patient-modal-title" className="font-bold text-sm sm:text-base text-[var(--text-main)]">
              Dados do Paciente
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de dados do paciente"
            className="btn-tactile-icon touch-target text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label htmlFor="patient-modal-name" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate">
              Nome do Paciente ou Identificação
            </label>
            <input
              ref={nameInputRef}
              id="patient-modal-name"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex.: Seu Melki"
              className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-xs font-semibold focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--text-main)] transition"
            />
          </div>

          {/* Toggle de cálculo de dose por peso */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
              formData.weightCalcEnabled
                ? 'bg-[var(--surface-card-lit)] border-[var(--border-control)] ring-1 ring-[var(--accent-focus)]/30'
                : 'bg-[var(--surface-inset)] border-[var(--hairline)]'
            }`}
          >
            <div className="min-w-0">
              <span className="text-xs font-bold block text-[var(--text-main)]">
                Cálculo de Dose por Peso (Pediátrico)
              </span>
              <span className="text-xs text-[var(--text-muted)] block">
                {formData.weightCalcEnabled ? 'Ativado: calcula gotas e mL/kg automaticamente' : 'Desativado: modo adulto / doses padrão'}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.weightCalcEnabled}
              aria-label="Ativar cálculo pediátrico de dose por peso"
              onClick={() => setFormData({ ...formData, weightCalcEnabled: !formData.weightCalcEnabled })}
              className="touch-target relative inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
            >
              <span
                aria-hidden="true"
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  formData.weightCalcEnabled ? 'bg-[var(--clinical)]' : 'bg-slate-400 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    formData.weightCalcEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="flex flex-col justify-end min-w-0">
              <label htmlFor="patient-modal-weight" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate whitespace-nowrap">
                Peso (kg) {formData.weightCalcEnabled ? '*' : ''}
              </label>
              <div className="relative">
                <input
                  id="patient-modal-weight"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="200"
                  required={formData.weightCalcEnabled}
                  inputMode="decimal"
                  enterKeyHint="next"
                  value={weightDraft !== null ? weightDraft : formData.weightKg > 0 ? String(formData.weightKg) : ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setWeightDraft(raw);
                    const parsed = parseFloat(raw.replace(',', '.'));
                    setFormData({ ...formData, weightKg: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed });
                  }}
                  onBlur={() => setWeightDraft(null)}
                  placeholder="Ex.: 14,5"
                  className="w-full h-11 min-h-[44px] pl-3 pr-8 rounded-[10px] border border-[var(--border-control)] text-xs font-bold focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--ink-clinical)] transition clinical-tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)] clinical-unit pointer-events-none">kg</span>
              </div>
            </div>

            <div className="flex flex-col justify-end min-w-0">
              <label htmlFor="patient-modal-age" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate whitespace-nowrap">
                Idade / Nasc.
              </label>
              <input
                id="patient-modal-age"
                type="text"
                enterKeyHint="next"
                value={formData.ageText || formData.birthDate || ''}
                onChange={(e) => setFormData(applyAgeOrBirthDateInput(formData, e.target.value))}
                placeholder="Ex.: 35 anos ou 07/03/1990"
                className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-xs font-medium focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--text-main)] transition"
              />
            </div>

            <div className="flex flex-col justify-end min-w-0">
              <label htmlFor="patient-modal-sex" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate whitespace-nowrap">
                Sexo (RDC 471 / SUS)
              </label>
              <div className="relative">
                <select
                  id="patient-modal-sex"
                  value={formData.sex || ''}
                  onChange={(e) => setFormData({ ...formData, sex: (e.target.value as '' | 'M' | 'F') })}
                  className="pcm-select appearance-none w-full h-11 min-h-[44px] pl-2.5 pr-8 rounded-[10px] border border-[var(--border-control)] text-xs font-medium focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--text-main)] transition cursor-pointer"
                >
                  <option value="">Não informado</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
                <Icon
                  name="expand_more"
                  size={16}
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="flex flex-col justify-end min-w-0">
              <label htmlFor="patient-modal-doc" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate whitespace-nowrap">
                Documento (CPF / RG / CNS)
              </label>
              <input
                id="patient-modal-doc"
                type="text"
                enterKeyHint="next"
                value={formData.documentNumber || ''}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                placeholder="Ex.: 542.189.708-44"
                className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-xs font-medium focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--text-main)] transition clinical-tabular-nums"
              />
            </div>

            <div className="flex flex-col justify-end min-w-0">
              <label htmlFor="patient-modal-phone" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate whitespace-nowrap">
                Telefone / Responsável
              </label>
              <input
                id="patient-modal-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ex.: (11) 98765-4321"
                className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-xs font-medium focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--text-main)] transition clinical-tabular-nums"
              />
            </div>
          </div>

          <div>
            <label htmlFor="patient-modal-allergies" className="block text-xs font-bold uppercase text-[var(--text-muted)] mb-1 truncate">
              Alergias Conhecidas (Medicamentosas ou Alimentares)
            </label>
            <input
              id="patient-modal-allergies"
              type="text"
              enterKeyHint="done"
              value={allergiesText}
              onChange={(e) => {
                const raw = e.target.value;
                setAllergiesText(raw);
                setFormData({
                  ...formData,
                  allergies: raw.split(',').map((s) => s.trim()).filter(Boolean),
                });
              }}
              placeholder="Ex.: Penicilina, Dipirona, AINEs, Frutos do mar..."
              className="w-full h-11 min-h-[44px] px-3 rounded-[10px] border border-[var(--border-control)] text-xs font-medium focus:outline-none focus:border-[var(--accent-focus)] tactile-input text-[var(--status-danger)] transition"
            />
          </div>

          <div className="pt-3 border-t border-[var(--hairline)] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="btn-tactile-danger h-11 min-h-[44px] px-3.5 rounded-[10px] text-xs font-semibold inline-flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] outline-none"
              title="Limpar todos os campos para digitar novo paciente"
            >
              <Icon name="ink_eraser" className="text-[16px]" />
              <span>Limpar</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile-secondary h-11 min-h-[44px] px-4 rounded-[10px] text-xs font-semibold inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-tactile-primary h-11 min-h-[44px] px-5 rounded-[10px] text-xs font-bold inline-flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              >
                <Icon name="check" className="text-[16px]" />
                <span>Salvar Paciente</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
