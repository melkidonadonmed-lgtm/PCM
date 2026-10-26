import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import type {
  HospitalBedPatientRecord,
  HospitalSpecialtyTemplate,
} from '../../core/domain/clinicalEntities';
import {
  createEmptyHospitalBedRecord,
  extractStructuredHospitalDataFromRawInput,
  mergeExtractedHospitalDataIntoBed,
  type MultimodalExtractionResult,
} from '../../utils/hospital/hospitalMultimodalIngestor';
import { calculatePatientAgeYearsFromDate } from '../../utils/hospital/hospitalEvolutionFormatter';

export type QuickAdmissionMode = 'manual' | 'multimodal';

export interface HospitalQuickAdmissionModalProps {
  isOpen: boolean;
  initialMode?: QuickAdmissionMode;
  suggestedBedCode?: string;
  onClose: () => void;
  onConfirmNewBed: (createdBed: HospitalBedPatientRecord) => void;
}

export const HOSPITAL_SPECIALTY_OPTIONS: ReadonlyArray<{
  id: HospitalSpecialtyTemplate;
  label: string;
}> = [
  { id: 'enfermaria_clinica', label: 'Enfermaria Clínica' },
  { id: 'uti', label: 'UTI Adulto / Intensiva' },
  { id: 'ortopedia', label: 'Ortopedia e Traumatologia' },
  { id: 'cirurgia_geral', label: 'Cirurgia Geral' },
  { id: 'pediatria', label: 'Pediatria' },
  { id: 'gineco_obstetricia', label: 'Ginecologia e Obstetrícia' },
];

function getTodayDateBrLocal(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

const SAMPLE_NEW_ADMISSION_TEXT = `EF/LT : 110-18
ID: L. M. S. (Pront. 88310)
DN: 22/07/1968
CNS: 704109827364510
DIH: 25/10/2026
QP: "Dor torácica ventilatório-dependente e febre há 2 dias"
HDA: 25/10/2026: Admitida via pronto-socorro com febre (38,4 °C), tosse produtiva e consolidação em base pulmonar esquerda. Iniciada antibioticoterapia empírica.
ALERGIAS: Nega alergias medicamentosas conhecidas
HPP: HAS em uso de Enalapril 10 mg 12/12h
25/10/2026: HB 12,4 | HT 37 | LEU 14800 | SEG 79 | PLQ 230000 | CR 1,1 | UR 44 | NA 138 | K 4,2 | PCR 96
EVOLUÇÃO 24H: Admitida na enfermaria clínica, lúcida e orientada, estável hemodinamicamente em ar ambiente.
DIETA: Dieta oral branda hipossódica`;

export const HospitalQuickAdmissionModal: React.FC<HospitalQuickAdmissionModalProps> = ({
  isOpen,
  initialMode = 'manual',
  suggestedBedCode = '110-18',
  onClose,
  onConfirmNewBed,
}) => {
  const [mode, setMode] = useState<QuickAdmissionMode>(initialMode);
  const [wardAndBed, setWardAndBed] = useState(suggestedBedCode);
  const [specialty, setSpecialty] = useState<HospitalSpecialtyTemplate>('enfermaria_clinica');
  const [patientNameOrInitials, setPatientNameOrInitials] = useState('');
  const [birthDateBr, setBirthDateBr] = useState('');
  const [ageYearsText, setAgeYearsText] = useState('');
  const [dihDateBr, setDihDateBr] = useState(() => getTodayDateBrLocal());
  const [cns, setCns] = useState('');
  const [primaryHd, setPrimaryHd] = useState('');
  const [chiefComplaintQp, setChiefComplaintQp] = useState('');
  const [allergiesText, setAllergiesText] = useState('');

  // Estado da aba Multimodal para Novo Leito
  const [rawClinicalText, setRawClinicalText] = useState('');
  const [extractionPreview, setExtractionPreview] = useState<MultimodalExtractionResult | null>(
    null
  );

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setWardAndBed(suggestedBedCode);
      setDihDateBr(getTodayDateBrLocal());
    }
  }, [isOpen, initialMode, suggestedBedCode]);

  useModalAccessibility(isOpen, onClose, modalRef, firstInputRef);

  if (!isOpen) return null;

  const handleBirthDateChange = (val: string) => {
    setBirthDateBr(val);
    const computedAge = calculatePatientAgeYearsFromDate(val);
    if (computedAge) {
      setAgeYearsText(computedAge);
    }
  };

  const handleConfirmManualAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    const code = wardAndBed.trim() || suggestedBedCode || '110-18';
    const baseRecord = createEmptyHospitalBedRecord(code, specialty);
    const dih = dihDateBr.trim() || getTodayDateBrLocal();
    const hdFormatted = primaryHd.trim()
      ? `${primaryHd.trim()}${primaryHd.includes('(') ? '' : ` (${dih})`}`
      : '';

    const newBed: HospitalBedPatientRecord = {
      ...baseRecord,
      id: `bed-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      wardAndBed: code,
      specialtyTemplate: specialty,
      patientNameOrInitials: patientNameOrInitials.trim(),
      birthDateBr: birthDateBr.trim(),
      ageYearsText: ageYearsText.trim() || calculatePatientAgeYearsFromDate(birthDateBr.trim()),
      dihDateBr: dih,
      cns: cns.trim(),
      chiefComplaintQp: chiefComplaintQp.trim(),
      allergiesText: allergiesText.trim(),
      diagnosticHypotheses: [
        {
          id: `hd-${Date.now()}`,
          codeNumber: '1',
          diseaseAndDate: hdFormatted,
          subItems: [],
        },
      ],
      updatedAt: Date.now(),
    };

    onConfirmNewBed(newBed);
    onClose();
  };

  const handlePreviewExtraction = (textToParse?: string) => {
    const target = textToParse !== undefined ? textToParse : rawClinicalText;
    if (!target.trim()) {
      setExtractionPreview(null);
      return;
    }
    const result = extractStructuredHospitalDataFromRawInput(
      target,
      'Admissão Estruturada de Novo Leito'
    );
    setExtractionPreview(result);
    if (result.partialRecord.wardAndBed) {
      setWardAndBed(result.partialRecord.wardAndBed);
    }
  };

  const handleConfirmMultimodalNewBed = () => {
    const extraction =
      extractionPreview ||
      extractStructuredHospitalDataFromRawInput(
        rawClinicalText,
        'Admissão Estruturada de Novo Leito'
      );
    const targetCode =
      extraction.partialRecord.wardAndBed || wardAndBed.trim() || suggestedBedCode || '110-18';
    const emptyBed = createEmptyHospitalBedRecord(targetCode, specialty);
    const merged = mergeExtractedHospitalDataIntoBed(
      {
        ...emptyBed,
        id: `bed-${targetCode.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`,
      },
      extraction
    );
    onConfirmNewBed(merged);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-quick-admission-title"
      data-state="idle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-backdrop-fade no-print"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-main)] shadow-2xl overflow-hidden modal-surface-spring"
      >
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 bg-[var(--surface-inset)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-sky-600/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Icon name="person_add" size={18} />
            </span>
            <div className="min-w-0">
              <h2 id="hospital-quick-admission-title" className="text-sm sm:text-base font-bold truncate">
                Nova Admissão de Paciente no Mapa de Leitos
              </h2>
              <p className="text-xs text-[var(--text-muted)] truncate">
                Cadastre um novo leito manualmente em segundos ou extraia de um prontuário colado sem sobrescrever outros pacientes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de nova admissão"
            className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)] cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Seletor de Modo: Cadastro Essencial vs. Colar Prontuário / IA */}
        <div className="px-5 pt-3.5">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl nav-segmented-track">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`min-h-9 px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'manual'
                  ? 'nav-segmented-pill-active font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold'
              }`}
            >
              <Icon name="edit_document" size={15} />
              <span>A. Cadastro Rápido Manual</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('multimodal')}
              className={`min-h-9 px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === 'multimodal'
                  ? 'nav-segmented-pill-active font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold'
              }`}
            >
              <Icon name="auto_awesome" size={15} />
              <span>B. Colar Prontuário / IA (Novo Leito)</span>
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === 'manual' ? (
            <form onSubmit={handleConfirmManualAdmission} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="quick-adm-ef-lt"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Enfermaria e Leito (EF / LT) *
                  </label>
                  <input
                    ref={firstInputRef}
                    id="quick-adm-ef-lt"
                    type="text"
                    required
                    value={wardAndBed}
                    onChange={(e) => setWardAndBed(e.target.value)}
                    placeholder="Ex.: 110-18 ou UTI-02"
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold clinical-tabular-nums"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label
                    htmlFor="quick-adm-specialty"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Setor / Especialidade Hospitalar
                  </label>
                  <select
                    id="quick-adm-specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value as HospitalSpecialtyTemplate)}
                    className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold"
                  >
                    {HOSPITAL_SPECIALTY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="quick-adm-dih"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Data da Internação (DIH)
                  </label>
                  <input
                    id="quick-adm-dih"
                    type="text"
                    value={dihDateBr}
                    onChange={(e) => setDihDateBr(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="quick-adm-patient-id"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Paciente (Nome, Iniciais ou Nº Prontuário) *
                  </label>
                  <input
                    id="quick-adm-patient-id"
                    type="text"
                    required
                    value={patientNameOrInitials}
                    onChange={(e) => setPatientNameOrInitials(e.target.value)}
                    placeholder="Ex.: J. P. S. (Pront. 55102)"
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="quick-adm-dn"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    DN {ageYearsText ? `(${ageYearsText})` : '(Data Nasc.)'}
                  </label>
                  <input
                    id="quick-adm-dn"
                    type="text"
                    value={birthDateBr}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    placeholder="Ex.: 14/05/1962"
                    className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="quick-adm-cns"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    CNS (Cartão SUS)
                  </label>
                  <input
                    id="quick-adm-cns"
                    type="text"
                    value={cns}
                    onChange={(e) => setCns(e.target.value)}
                    placeholder="Opcional"
                    className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label
                    htmlFor="quick-adm-hd"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Hipótese Diagnóstica Principal (HD 1)
                  </label>
                  <input
                    id="quick-adm-hd"
                    type="text"
                    value={primaryHd}
                    onChange={(e) => setPrimaryHd(e.target.value)}
                    placeholder="Ex.: Pneumonia Adquirida na Comunidade — CURB-65 2"
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
                  />
                </div>

                <div className="sm:col-span-7">
                  <label
                    htmlFor="quick-adm-qp"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Queixa Principal (QP — opcional)
                  </label>
                  <input
                    id="quick-adm-qp"
                    type="text"
                    value={chiefComplaintQp}
                    onChange={(e) => setChiefComplaintQp(e.target.value)}
                    placeholder="Ex.: Dispneia aos esforços e febre há 3 dias"
                    className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label
                    htmlFor="quick-adm-allergies"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Alergias Medicamentosas
                  </label>
                  <input
                    id="quick-adm-allergies"
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="Ex.: Dipirona ou Nega alergias"
                    className="w-full h-10 px-3 rounded-xl border border-rose-500/35 bg-rose-500/5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-tactile-secondary h-10 px-4 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-tactile-primary h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="check_circle" size={16} />
                  <span>Confirmar Admissão e Abrir Prontuário</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="quick-adm-mm-ef-lt"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Leito de Destino (EF / LT)
                  </label>
                  <input
                    id="quick-adm-mm-ef-lt"
                    type="text"
                    value={wardAndBed}
                    onChange={(e) => setWardAndBed(e.target.value)}
                    placeholder="Ex.: 110-18 (ou extraído do texto)"
                    className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold clinical-tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quick-adm-mm-specialty"
                    className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
                  >
                    Setor / Especialidade
                  </label>
                  <select
                    id="quick-adm-mm-specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value as HospitalSpecialtyTemplate)}
                    className="w-full h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold"
                  >
                    {HOSPITAL_SPECIALTY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="quick-adm-mm-textarea"
                  className="text-[11px] font-bold text-[var(--text-muted)]"
                >
                  Cole abaixo a nota de admissão, evolução prévia ou exames laboratoriais:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRawClinicalText(SAMPLE_NEW_ADMISSION_TEXT);
                    handlePreviewExtraction(SAMPLE_NEW_ADMISSION_TEXT);
                  }}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Carregar exemplo de admissão
                </button>
              </div>

              <textarea
                id="quick-adm-mm-textarea"
                rows={7}
                value={rawClinicalText}
                onChange={(e) => {
                  setRawClinicalText(e.target.value);
                  handlePreviewExtraction(e.target.value);
                }}
                placeholder="Ex.: EF/LT : 110-18 | ID: L. M. S. | DN: 22/07/1968 | DIH: 25/10/2026 | QP: ... | 25/10/2026: HB 12,4 | LEU 14800..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-3 text-xs font-mono leading-relaxed text-[var(--text-main)]"
              />

              {extractionPreview && (
                <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                      <Icon name="fact_check" size={15} />
                      <span>Extração Determinística (Zero Alucinação)</span>
                    </span>
                    <Badge tone="clinical" tabular>
                      {extractionPreview.partialRecord.labPanels?.length || 0} baterias de exames
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] clinical-tabular-nums">
                    Leito detectado:{' '}
                    <strong>{extractionPreview.partialRecord.wardAndBed || wardAndBed}</strong> •
                    Paciente:{' '}
                    <strong>
                      {extractionPreview.partialRecord.patientNameOrInitials || 'Não informado'}
                    </strong>{' '}
                    • Datas ordenadas:{' '}
                    {extractionPreview.chronologicalDatesFound.join(' → ') || 'Nenhuma data'}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-tactile-secondary h-10 px-4 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!rawClinicalText.trim()}
                  onClick={handleConfirmMultimodalNewBed}
                  className="btn-tactile-primary h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Icon name="auto_awesome" size={16} />
                  <span>Criar Novo Leito com Dados Extraídos</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
