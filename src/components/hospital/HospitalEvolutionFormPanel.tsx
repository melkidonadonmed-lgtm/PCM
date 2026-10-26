import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type {
  HospitalBedPatientRecord,
  HospitalEvolutionSnapshot,
  HospitalSpecialtyTemplate,
  MedicationOrDeviceEntry,
} from '../../core/domain/clinicalEntities';
import type { DoctorProfile } from '../../types';
import {
  buildHospitalEvolutionHtmlForA4,
  calculateHospitalStayDays,
  calculatePatientAgeYearsFromDate,
  formatStandardHospitalEvolutionText,
} from '../../utils/hospital/hospitalEvolutionFormatter';
import { HOSPITAL_SPECIALTY_OPTIONS } from './HospitalQuickAdmissionModal';

export interface HospitalEvolutionFormPanelProps {
  bedRecord: HospitalBedPatientRecord;
  doctor: DoctorProfile;
  onUpdateBedRecord: (updated: HospitalBedPatientRecord) => void;
  onOpenMultimodalModal: () => void;
  onSendToA4Editor: (html: string, title: string) => void;
}

export const HospitalEvolutionFormPanel: React.FC<HospitalEvolutionFormPanelProps> = ({
  bedRecord,
  doctor,
  onUpdateBedRecord,
  onOpenMultimodalModal,
  onSendToA4Editor,
}) => {
  const [isAdmissionSectionOpen, setIsAdmissionSectionOpen] = useState(true);
  const [newFreeCategoryTitle, setNewFreeCategoryTitle] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');
  const [newMedStatus, setNewMedStatus] = useState<'em_uso' | 'fez_uso'>('em_uso');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const formattedStandardText = formatStandardHospitalEvolutionText(bedRecord);
  const stayDays = calculateHospitalStayDays(bedRecord.dihDateBr);

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

  const handleAddFreeCategory = () => {
    if (!newFreeCategoryTitle.trim()) return;
    const customSections = [
      ...(bedRecord.physicalExam.customSections || []),
      { id: `custom-${Date.now()}`, title: newFreeCategoryTitle.trim(), content: '' },
    ];
    updateField('physicalExam', { ...bedRecord.physicalExam, customSections });
    setNewFreeCategoryTitle('');
  };

  const handleRemoveFreeCategory = (sectionId: string) => {
    const customSections = (bedRecord.physicalExam.customSections || []).filter(
      (s) => s.id !== sectionId
    );
    updateField('physicalExam', { ...bedRecord.physicalExam, customSections });
  };

  const handleAddMedicationOrDevice = () => {
    if (!newMedName.trim()) return;
    const item: MedicationOrDeviceEntry = {
      id: `med-dev-${Date.now()}`,
      nameAndDetails: newMedName.trim(),
      kind: /cateter|acesso|sonda|dreno|tubo|cânula/i.test(newMedName) ? 'device' : 'medication',
      durationAndDates: newMedDuration.trim(),
      status: newMedStatus,
    };
    if (newMedStatus === 'em_uso') {
      updateField('currentMedicationsAndDevices', [...bedRecord.currentMedicationsAndDevices, item]);
    } else {
      updateField('previousMedicationsAndDevices', [
        ...bedRecord.previousMedicationsAndDevices,
        item,
      ]);
    }
    setNewMedName('');
    setNewMedDuration('');
  };

  const handleMoveMedToPrevious = (medId: string) => {
    const target = bedRecord.currentMedicationsAndDevices.find((m) => m.id === medId);
    if (!target) return;
    const nextCurrent = bedRecord.currentMedicationsAndDevices.filter((m) => m.id !== medId);
    const nextPrev: MedicationOrDeviceEntry[] = [
      ...bedRecord.previousMedicationsAndDevices,
      { ...target, status: 'fez_uso' },
    ];
    onUpdateBedRecord({
      ...bedRecord,
      currentMedicationsAndDevices: nextCurrent,
      previousMedicationsAndDevices: nextPrev,
      updatedAt: Date.now(),
    });
  };

  const handleRemoveMedication = (medId: string, listType: 'em_uso' | 'fez_uso') => {
    if (listType === 'em_uso') {
      updateField(
        'currentMedicationsAndDevices',
        bedRecord.currentMedicationsAndDevices.filter((m) => m.id !== medId)
      );
    } else {
      updateField(
        'previousMedicationsAndDevices',
        bedRecord.previousMedicationsAndDevices.filter((m) => m.id !== medId)
      );
    }
  };

  const handleCopyEvolutionText = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formattedStandardText);
      }
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2200);
    } catch {
      setCopiedFeedback(false);
    }
  };

  const handleSaveSnapshotToTimeline = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getFullYear());
    const snap: HospitalEvolutionSnapshot = {
      id: `snap-${Date.now()}`,
      recordedAtIso: `${yyyy}-${mm}-${dd}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`,
      dateBr: `${dd}/${mm}/${yyyy}`,
      dayNumber: stayDays || 1,
      authorDoctorName: doctor.name || 'Médico Assistente',
      authorCrm: doctor.crm ? `${doctor.crm}/${doctor.crmState}` : '',
      formattedText: formattedStandardText,
      evolution24hSummary: bedRecord.evolution24h || 'Evolução registrada no leito.',
      conductSummary: bedRecord.conductList,
    };
    updateField('evolutionHistoryTimeline', [snap, ...bedRecord.evolutionHistoryTimeline]);
  };

  const primaryHdSummary =
    bedRecord.diagnosticHypotheses[0]?.diseaseAndDate || 'Sem HD principal registrada';

  return (
    <div data-state="idle" className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
      <div className="xl:col-span-7 space-y-4">
        {/* Seção 1 (Acordeão Inteligente): Dados de Admissão, Identificação, HDA e Antecedentes */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
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
                <h3 className="text-sm font-bold text-[var(--text-main)]">
                  1. Identificação do Leito, Admissão, HDA e Antecedentes
                </h3>
                {!isAdmissionSectionOpen && (
                  <p className="text-[11px] text-[var(--text-muted)] clinical-tabular-nums truncate max-w-md">
                    EF/LT {bedRecord.wardAndBed} • {bedRecord.patientNameOrInitials || 'Sem ID'} •{' '}
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
                <Icon name="auto_awesome" size={14} className="text-sky-600 dark:text-sky-400" />
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
                      updateField('specialtyTemplate', e.target.value as HospitalSpecialtyTemplate)
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
                    onChange={(e) => updateField('patientNameOrInitials', e.target.value)}
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
                    onChange={(e) => updateField('chiefComplaintQp', e.target.value)}
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
                            codeNumber: String(bedRecord.diagnosticHypotheses.length + 1),
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
                              .map((item, i) => ({ ...item, codeNumber: String(i + 1) }));
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
                    onChange={(e) => updateField('historyPresentIllnessHda', e.target.value)}
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
                    onChange={(e) => updateField('pastMedicalHistoryHpp', e.target.value)}
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

        {/* Seção 2: Medicações e Dispositivos — EM USO e FEZ USO com Lista Visual e Chips */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              2. Medicações e Dispositivos — EM USO e FEZ USO
            </h3>
            <span className="text-[11px] font-bold text-[var(--text-muted)] clinical-tabular-nums">
              {bedRecord.currentMedicationsAndDevices.length} em uso •{' '}
              {bedRecord.previousMedicationsAndDevices.length} prévios
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
            <div className="sm:col-span-3">
              <label
                htmlFor="hosp-med-status"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Status
              </label>
              <select
                id="hosp-med-status"
                value={newMedStatus}
                onChange={(e) => setNewMedStatus(e.target.value as 'em_uso' | 'fez_uso')}
                aria-label="Status de uso"
                className="w-full h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold"
              >
                <option value="em_uso">EM USO</option>
                <option value="fez_uso">FEZ USO</option>
              </select>
            </div>
            <div className="sm:col-span-5">
              <label
                htmlFor="hosp-med-name"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Medicação ou Dispositivo (Sonda, Acesso, O2)
              </label>
              <input
                id="hosp-med-name"
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="Ex.: Ceftriaxona 1 g EV 12/12h"
                aria-label="Medicação ou dispositivo"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <label
                htmlFor="hosp-med-duration"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Duração / Data
              </label>
              <input
                id="hosp-med-duration"
                type="text"
                value={newMedDuration}
                onChange={(e) => setNewMedDuration(e.target.value)}
                placeholder="Ex.: D4/D7 (20/10)"
                aria-label="Tempo e data"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMedicationOrDevice}
              aria-label="Adicionar medicação ou dispositivo"
              className="sm:col-span-1 btn-tactile-primary h-9 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Lista Visual de Medicações EM USO e FEZ USO */}
          {(bedRecord.currentMedicationsAndDevices.length > 0 ||
            bedRecord.previousMedicationsAndDevices.length > 0) && (
            <div className="space-y-2 pt-1">
              {bedRecord.currentMedicationsAndDevices.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Em Uso Atual ({bedRecord.currentMedicationsAndDevices.length})
                  </span>
                  <div className="space-y-1">
                    {bedRecord.currentMedicationsAndDevices.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-[var(--text-main)]">
                            {med.nameAndDetails}
                          </span>
                          {med.durationAndDates && (
                            <span className="ml-1.5 text-[11px] text-[var(--text-muted)] clinical-tabular-nums">
                              ({med.durationAndDates})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveMedToPrevious(med.id)}
                            title="Concluir ou suspender (mover para FEZ USO)"
                            className="px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
                          >
                            Suspender → Fez Uso
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(med.id, 'em_uso')}
                            aria-label={`Remover ${med.nameAndDetails}`}
                            className="p-1 text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bedRecord.previousMedicationsAndDevices.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    Fez Uso Prévio ({bedRecord.previousMedicationsAndDevices.length})
                  </span>
                  <div className="space-y-1">
                    {bedRecord.previousMedicationsAndDevices.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-inset)]/60 border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold">{med.nameAndDetails}</span>
                          {med.durationAndDates && (
                            <span className="ml-1.5 text-[11px] text-[var(--text-muted)] clinical-tabular-nums">
                              ({med.durationAndDates})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(med.id, 'fez_uso')}
                          aria-label={`Remover ${med.nameAndDetails}`}
                          className="p-1 text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Seção 3: Evolução 24h, Exame Físico e Conduta do Dia (CD) */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">
            3. Evolução 24h, Exame Físico e Conduta do Dia (CD)
          </h3>

          <div>
            <label
              htmlFor="hosp-evol-24h"
              className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
            >
              Evolução nas Últimas 24h (Subjetivo, Intercorrências, Curva Térmica e Diurese)
            </label>
            <textarea
              id="hosp-evol-24h"
              rows={2}
              value={bedRecord.evolution24h}
              onChange={(e) => updateField('evolution24h', e.target.value)}
              placeholder="Ex.: Paciente permaneceu afebril nas últimas 24h, SSVV estáveis, boa aceitação da dieta..."
              aria-label="Evolução 24 horas"
              className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="hosp-ef-geral"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Estado Geral (GERAL)
              </label>
              <input
                id="hosp-ef-geral"
                type="text"
                value={bedRecord.physicalExam.geral}
                onChange={(e) =>
                  updateField('physicalExam', { ...bedRecord.physicalExam, geral: e.target.value })
                }
                placeholder="Ex.: BEG, LOTE, corado, hidratado"
                aria-label="Exame físico geral"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-ef-ssvv"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Sinais Vitais (SSVV)
              </label>
              <input
                id="hosp-ef-ssvv"
                type="text"
                value={bedRecord.physicalExam.ssvv}
                onChange={(e) =>
                  updateField('physicalExam', { ...bedRecord.physicalExam, ssvv: e.target.value })
                }
                placeholder="Ex.: PA 120/80 mmHg | FC 76 bpm | SpO2 97%"
                aria-label="Sinais vitais"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-ef-ar"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Aparelho Respiratório (AR)
              </label>
              <input
                id="hosp-ef-ar"
                type="text"
                value={bedRecord.physicalExam.ar}
                onChange={(e) =>
                  updateField('physicalExam', { ...bedRecord.physicalExam, ar: e.target.value })
                }
                placeholder="Ex.: MV+ bilateral sem ruídos adventícios"
                aria-label="Aparelho respiratório"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-ef-ac"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Aparelho Cardiovascular (AC)
              </label>
              <input
                id="hosp-ef-ac"
                type="text"
                value={bedRecord.physicalExam.ac}
                onChange={(e) =>
                  updateField('physicalExam', { ...bedRecord.physicalExam, ac: e.target.value })
                }
                placeholder="Ex.: RCR 2T BNF sem sopros"
                aria-label="Aparelho cardiovascular"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-ef-abd"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Abdome (ABD)
              </label>
              <input
                id="hosp-ef-abd"
                type="text"
                value={bedRecord.physicalExam.abd}
                onChange={(e) =>
                  updateField('physicalExam', { ...bedRecord.physicalExam, abd: e.target.value })
                }
                placeholder="Ex.: Plano, flácido, RHA+, indolor"
                aria-label="Abdome"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-ef-membros"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Membros e Anexos
              </label>
              <input
                id="hosp-ef-membros"
                type="text"
                value={bedRecord.physicalExam.membrosEAnexos}
                onChange={(e) =>
                  updateField('physicalExam', {
                    ...bedRecord.physicalExam,
                    membrosEAnexos: e.target.value,
                  })
                }
                placeholder="Ex.: Panturrilhas livres, sem edema"
                aria-label="Membros e anexos"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>
          </div>

          {/* Categorias Livres de Exame Físico por Especialidade */}
          <div className="space-y-2 pt-1">
            {(bedRecord.physicalExam.customSections || []).map((sec, idx) => (
              <div key={sec.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                    {sec.title}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveFreeCategory(sec.id)}
                    aria-label={`Remover categoria ${sec.title}`}
                    className="text-[11px] text-[var(--text-muted)] hover:text-rose-600 cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
                <input
                  type="text"
                  value={sec.content}
                  onChange={(e) => {
                    const next = [...bedRecord.physicalExam.customSections];
                    next[idx] = { ...sec, content: e.target.value };
                    updateField('physicalExam', { ...bedRecord.physicalExam, customSections: next });
                  }}
                  placeholder={`Ex.: ${sec.title} — achados detalhados`}
                  aria-label={sec.title}
                  className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
                />
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFreeCategoryTitle}
                onChange={(e) => setNewFreeCategoryTitle(e.target.value)}
                placeholder="Adicionar seção específica (ex.: EXAME ORTOPÉDICO, NEUROLÓGICO, VM...)"
                aria-label="Título de nova categoria livre"
                className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
              <button
                type="button"
                onClick={handleAddFreeCategory}
                className="btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-bold cursor-pointer"
              >
                + Categoria Livre
              </button>
            </div>
          </div>

          {/* Dieta, Hidratação, Pendências e Conduta do Dia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-[var(--border-subtle)] pt-3">
            <div>
              <label
                htmlFor="hosp-diet"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Dieta
              </label>
              <input
                id="hosp-diet"
                type="text"
                value={bedRecord.dietDescription}
                onChange={(e) => updateField('dietDescription', e.target.value)}
                placeholder="Ex.: Dieta branda hipossódica via oral"
                aria-label="Dieta"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-hydration"
                className="block text-[11px] font-bold text-[var(--text-muted)] mb-1"
              >
                Hidratação Venosa
              </label>
              <input
                id="hosp-hydration"
                type="text"
                value={bedRecord.hydrationDescription}
                onChange={(e) =>
                  onUpdateBedRecord({
                    ...bedRecord,
                    hydrationApplicable: Boolean(e.target.value.trim()),
                    hydrationDescription: e.target.value,
                    updatedAt: Date.now(),
                  })
                }
                placeholder="Ex.: SF 0,9% 1000 mL EV 24/24h"
                aria-label="Hidratação"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-pendings"
                className="block text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1"
              >
                Pendências do Leito (separar por ;)
              </label>
              <input
                id="hosp-pendings"
                type="text"
                value={bedRecord.pendingItemsList.join('; ')}
                onChange={(e) =>
                  updateField(
                    'pendingItemsList',
                    e.target.value
                      .split(';')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Ex.: Avaliar switch oral; Checar cultura"
                aria-label="Pendências"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="hosp-conduct"
                className="block text-[11px] font-bold text-sky-700 dark:text-sky-300 mb-1"
              >
                Conduta do Dia — CD (separar por ;)
              </label>
              <input
                id="hosp-conduct"
                type="text"
                value={bedRecord.conductList.join('; ')}
                onChange={(e) =>
                  updateField(
                    'conductList',
                    e.target.value
                      .split(';')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Ex.: Manter ATB D4/D7; Manter profilaxia TEV"
                aria-label="Condutas"
                className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Coluna Direita (5 cols): Espelho do Modelo Padronizado Ao Vivo */}
      <div className="xl:col-span-5 xl:sticky xl:top-20 card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)]">
              Modelo Padronizado de Evolução / Admissão
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Cópia em 1 clique para prontuário ou impressão A4
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyEvolutionText}
              className="btn-tactile-primary h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Icon name={copiedFeedback ? 'check' : 'content_copy'} size={14} />
              <span>{copiedFeedback ? 'Copiado!' : 'Copiar Evolução'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onSendToA4Editor(
                  buildHospitalEvolutionHtmlForA4(bedRecord),
                  `Evolução Hospitalar — Leito ${bedRecord.wardAndBed}`
                )
              }
              className="btn-tactile-secondary h-8 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Icon name="editor" size={14} />
              <span>A4 / PDF</span>
            </button>
          </div>
        </div>

        <pre
          id="hospital-standard-evolution-preview"
          className="w-full max-h-96 overflow-y-auto p-4 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap clinical-tabular-nums"
        >
          {formattedStandardText}
        </pre>

        <button
          type="button"
          onClick={handleSaveSnapshotToTimeline}
          className="w-full btn-tactile-secondary h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Icon name="save" size={15} className="text-sky-600 dark:text-sky-400" />
          <span>
            Registrar Evolução no Histórico Auditável do Leito (
            {bedRecord.evolutionHistoryTimeline.length})
          </span>
        </button>
      </div>
    </div>
  );
};
