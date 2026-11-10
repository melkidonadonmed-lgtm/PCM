import React, { useState } from 'react';
import { Icon } from '../Icon';
import { HospitalAdmissionIdentitySection } from './HospitalAdmissionIdentitySection';
import { HospitalPhysicalExamAndConductSection } from './HospitalPhysicalExamAndConductSection';
import type {
  HospitalBedPatientRecord,
  HospitalEvolutionSnapshot,
  MedicationOrDeviceEntry,
} from '../../core/domain/clinicalEntities';
import type { DoctorProfile } from '../../types';
import {
  buildHospitalEvolutionHtmlForA4,
  calculateHospitalStayDays,
  formatStandardHospitalEvolutionText,
} from '../../utils/hospital/hospitalEvolutionFormatter';

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

  return (
    <div data-state="idle" aria-busy={false} className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
      <div className="xl:col-span-7 flex flex-col gap-3">
        {/* Seção 1 (Acordeão Inteligente): Dados de Admissão, Identificação, HDA e Antecedentes */}
        <HospitalAdmissionIdentitySection
          bedRecord={bedRecord}
          stayDays={stayDays}
          onUpdateBedRecord={onUpdateBedRecord}
          onOpenMultimodalModal={onOpenMultimodalModal}
        />

        {/* Seção 2: Medicações e Dispositivos — EM USO e FEZ USO com Lista Visual e Chips */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
            <div className="flex items-center gap-2">
              <Icon name="medication" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                2. Medicações e Dispositivos — EM USO e FEZ USO
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] clinical-tabular-nums">
                {bedRecord.currentMedicationsAndDevices.length} em uso •{' '}
                {bedRecord.previousMedicationsAndDevices.length} prévios
              </span>
              {(newMedName || newMedDuration) && (
                <button
                  type="button"
                  onClick={() => {
                    setNewMedName('');
                    setNewMedDuration('');
                  }}
                  className="chip-neutral h-7 px-2 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                  title="Limpar campos de nova medicação"
                >
                  <Icon name="close" size={12} />
                  <span>Limpar</span>
                </button>
              )}
            </div>
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
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
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
                            className="px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] cursor-pointer"
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
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
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
        <HospitalPhysicalExamAndConductSection
          bedRecord={bedRecord}
          onUpdateBedRecord={onUpdateBedRecord}
        />
      </div>

      {/* Coluna Direita (5 cols): Espelho do Modelo Padronizado Ao Vivo */}
      <div className="xl:col-span-5 xl:sticky xl:top-20 card-surface rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="description" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
              <h3 className="text-sm font-semibold text-[var(--text-main)]">
                Modelo Padronizado de Evolução / Admissão
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
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
          className="w-full max-h-96 overflow-y-auto p-3.5 sm:p-4 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap clinical-tabular-nums"
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
