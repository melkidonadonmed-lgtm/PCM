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

export interface HospitalEvolutionFormPanelProps {
  bedRecord: HospitalBedPatientRecord;
  doctor: DoctorProfile;
  onUpdateBedRecord: (updated: HospitalBedPatientRecord) => void;
  onOpenMultimodalModal: () => void;
  onSendToA4Editor: (html: string, title: string) => void;
}

const SPECIALTY_OPTIONS: ReadonlyArray<{ id: HospitalSpecialtyTemplate; label: string }> = [
  { id: 'enfermaria_clinica', label: 'Enfermaria Clínica' },
  { id: 'ortopedia', label: 'Ortopedia e Traumatologia' },
  { id: 'pediatria', label: 'Pediatria' },
  { id: 'uti', label: 'UTI Adulto / Intensiva' },
  { id: 'gineco_obstetricia', label: 'Ginecologia e Obstetrícia' },
  { id: 'cirurgia_geral', label: 'Cirurgia Geral' },
];

export const HospitalEvolutionFormPanel: React.FC<HospitalEvolutionFormPanelProps> = ({
  bedRecord,
  doctor,
  onUpdateBedRecord,
  onOpenMultimodalModal,
  onSendToA4Editor,
}) => {
  const [newFreeCategoryTitle, setNewFreeCategoryTitle] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');
  const [newMedStatus, setNewMedStatus] = useState<'em_uso' | 'fez_uso'>('em_uso');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const formattedStandardText = formatStandardHospitalEvolutionText(bedRecord);
  const stayDays = calculateHospitalStayDays(bedRecord.dihDateBr);

  const updateField = <K extends keyof HospitalBedPatientRecord>(key: K, value: HospitalBedPatientRecord[K]) => {
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
      updateField('previousMedicationsAndDevices', [...bedRecord.previousMedicationsAndDevices, item]);
    }
    setNewMedName('');
    setNewMedDuration('');
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
    const snap: HospitalEvolutionSnapshot = {
      id: `snap-${Date.now()}`,
      recordedAtIso: new Date().toISOString(),
      dateBr: new Date().toLocaleDateString('pt-BR'),
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
    <div data-state="idle" className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
      <div className="xl:col-span-7 space-y-4">
        {/* Bloco 1: Identificação do Leito e Admissão */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
            <div className="flex items-center gap-2">
              <Icon name="local_hospital" size={18} className="text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">1. Identificação do Leito (EF/LT, ID, DN, CNS, DIH)</h3>
            </div>
            <div className="flex items-center gap-2">
              {stayDays > 0 && <Badge tone="clinical" tabular>D{stayDays} de Internação</Badge>}
              <button type="button" onClick={onOpenMultimodalModal} className="btn-tactile-secondary h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Icon name="auto_awesome" size={14} className="text-sky-600 dark:text-sky-400" />
                <span>Importar via IA / Documento</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="hosp-ef-lt" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">EF / LT (Enfermaria e Leito)</label>
              <input id="hosp-ef-lt" type="text" value={bedRecord.wardAndBed} onChange={(e) => updateField('wardAndBed', e.target.value)} placeholder="Ex.: 110-15" className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold clinical-tabular-nums" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="hosp-specialty" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">Especialidade / Unidade</label>
              <select id="hosp-specialty" value={bedRecord.specialtyTemplate} onChange={(e) => updateField('specialtyTemplate', e.target.value as HospitalSpecialtyTemplate)} className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold">
                {SPECIALTY_OPTIONS.map((opt) => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <label htmlFor="hosp-dih" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">DIH (Data de Internação)</label>
              <input id="hosp-dih" type="text" value={bedRecord.dihDateBr} onChange={(e) => updateField('dihDateBr', e.target.value)} placeholder="Ex.: 20/10/2026" className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums" />
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label htmlFor="hosp-patient-id" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">ID (Nome, Iniciais ou Prontuário)</label>
              <input id="hosp-patient-id" type="text" value={bedRecord.patientNameOrInitials} onChange={(e) => updateField('patientNameOrInitials', e.target.value)} placeholder="Ex.: M. A. S. (Pront. 48291)" className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-semibold" />
            </div>
            <div className="col-span-1 sm:col-span-1">
              <label htmlFor="hosp-dn" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">DN ({bedRecord.ageYearsText || 'Idade'})</label>
              <input id="hosp-dn" type="text" value={bedRecord.birthDateBr} onChange={(e) => handleBirthDateChange(e.target.value)} placeholder="Ex.: 14/05/1962" className="w-full h-10 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="hosp-cns" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">CNS (Cartão SUS)</label>
              <input id="hosp-cns" type="text" value={bedRecord.cns} onChange={(e) => updateField('cns', e.target.value)} placeholder="Ex.: 704801239481029" className="w-full h-10 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums" />
            </div>
          </div>
        </section>

        {/* Bloco 2: QP, HD, HDA, Alergias, Sorologias, HPP e HF/Social */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">2. QP, Hipóteses Diagnósticas (HD), HDA Cronológica e Antecedentes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="sm:col-span-2">
              <label htmlFor="hosp-qp" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">QP (Queixa Principal — palavras do paciente)</label>
              <input id="hosp-qp" type="text" value={bedRecord.chiefComplaintQp} onChange={(e) => updateField('chiefComplaintQp', e.target.value)} placeholder="Ex.: Falta de ar aos pequenos esforços e tosse produtiva há 4 dias" className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-muted)]">HD (1 - Doença + Data / 1.1 - Subitem)</span>
                <button type="button" onClick={() => updateField('diagnosticHypotheses', [...bedRecord.diagnosticHypotheses, { id: `hd-${Date.now()}`, codeNumber: String(bedRecord.diagnosticHypotheses.length + 1), diseaseAndDate: '', subItems: [] }])} className="text-xs font-bold text-sky-600 dark:text-sky-400 cursor-pointer">+ Adicionar HD</button>
              </div>
              {bedRecord.diagnosticHypotheses.map((hd, idx) => (
                <div key={hd.id} className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2 py-1 rounded bg-[var(--surface-inset)] clinical-tabular-nums">{hd.codeNumber} -</span>
                  <input type="text" value={hd.diseaseAndDate} onChange={(e) => { const next = [...bedRecord.diagnosticHypotheses]; next[idx] = { ...hd, diseaseAndDate: e.target.value }; updateField('diagnosticHypotheses', next); }} placeholder="Ex.: Pneumonia Adquirida na Comunidade (20/10/2026)" aria-label={`Hipótese diagnóstica ${hd.codeNumber}`} className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
                </div>
              ))}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="hosp-hda" className="block text-[11px] font-bold text-[var(--text-muted)] mb-1">HDA (Ordem estritamente cronológica)</label>
              <textarea id="hosp-hda" rows={3} value={bedRecord.historyPresentIllnessHda} onChange={(e) => updateField('historyPresentIllnessHda', e.target.value)} placeholder="Ex.: 20/10/2026: Admitido com febre... 22/10/2026: Afebril..." className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            </div>

            <input type="text" value={bedRecord.allergiesText} onChange={(e) => updateField('allergiesText', e.target.value)} placeholder="Ex.: ALERGIAS: Dipirona ou Nega alergias" aria-label="Alergias" className="h-9 px-3 rounded-xl border border-rose-500/40 bg-rose-500/5 text-xs font-semibold" />
            <input type="text" value={bedRecord.serologiesText} onChange={(e) => updateField('serologiesText', e.target.value)} placeholder="Ex.: SOROLOGIAS: HIV NR | VDRL NR | HBsAg NR" aria-label="Sorologias" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.pastMedicalHistoryHpp} onChange={(e) => updateField('pastMedicalHistoryHpp', e.target.value)} placeholder="Ex.: HPP: HAS há 12 anos, DM2" aria-label="História Patológica Pregressa" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.familyAndSocialHistory.join('; ')} onChange={(e) => updateField('familyAndSocialHistory', e.target.value.split(';').map((s) => s.trim()).filter(Boolean))} placeholder="Ex.: HF/SOCIAL: Nega tabagismo; Mora com esposa" aria-label="História familiar e social" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
          </div>
        </section>

        {/* Bloco 3: FEZ USO e EM USO */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-2.5">
          <h3 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">3. Medicações e Dispositivos — FEZ USO e EM USO (Tempo e Data)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <select value={newMedStatus} onChange={(e) => setNewMedStatus(e.target.value as 'em_uso' | 'fez_uso')} aria-label="Status de uso" className="sm:col-span-3 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs font-bold">
              <option value="em_uso">EM USO</option>
              <option value="fez_uso">FEZ USO</option>
            </select>
            <input type="text" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder="Ex.: Ceftriaxona 1 g EV 12/12h ou Acesso Venoso" aria-label="Medicação ou dispositivo" className="sm:col-span-5 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={newMedDuration} onChange={(e) => setNewMedDuration(e.target.value)} placeholder="Ex.: D4/D7 (início 20/10/2026)" aria-label="Tempo e data" className="sm:col-span-3 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums" />
            <button type="button" onClick={handleAddMedicationOrDevice} className="sm:col-span-1 btn-tactile-primary h-9 rounded-xl text-xs font-bold cursor-pointer">+</button>
          </div>
        </section>

        {/* Bloco 4: Exame Físico + Categorias Livres, Evolução 24h, Dieta, Hidratação, Pendências e CD */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-2.5">
          <h3 className="text-sm font-bold text-[var(--text-main)] border-b border-[var(--border-subtle)] pb-2">4. Exame Físico (Fixo + Categorias Livres), Evolução 24h e Conduta (CD)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="text" value={bedRecord.physicalExam.geral} onChange={(e) => updateField('physicalExam', { ...bedRecord.physicalExam, geral: e.target.value })} placeholder="Ex.: GERAL: BEG, LOTE, corado, hidratado" aria-label="Exame físico geral" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.physicalExam.ssvv} onChange={(e) => updateField('physicalExam', { ...bedRecord.physicalExam, ssvv: e.target.value })} placeholder="Ex.: SSVV: PA 120/80 mmHg | FC 76 bpm | SpO2 97%" aria-label="Sinais vitais" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums" />
            <input type="text" value={bedRecord.physicalExam.ar} onChange={(e) => updateField('physicalExam', { ...bedRecord.physicalExam, ar: e.target.value })} placeholder="Ex.: AR: MV+ bilateral sem ruídos adventícios" aria-label="Aparelho respiratório" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.physicalExam.ac} onChange={(e) => updateField('physicalExam', { ...bedRecord.physicalExam, ac: e.target.value })} placeholder="Ex.: AC: RCR 2T BNF sem sopros" aria-label="Aparelho cardiovascular" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.physicalExam.membrosEAnexos} onChange={(e) => updateField('physicalExam', { ...bedRecord.physicalExam, membrosEAnexos: e.target.value })} placeholder="Ex.: MEMBROS E ANEXOS: Panturrilhas livres, sem edema" aria-label="Membros e anexos" className="sm:col-span-2 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="text" value={newFreeCategoryTitle} onChange={(e) => setNewFreeCategoryTitle(e.target.value)} placeholder="Ex.: EXAME ORTOPÉDICO, NEUROLÓGICO, VENTILAÇÃO MECÂNICA..." aria-label="Título de nova categoria livre" className="flex-1 h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <button type="button" onClick={handleAddFreeCategory} className="btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-bold cursor-pointer">+ Categoria Livre</button>
          </div>
          {(bedRecord.physicalExam.customSections || []).map((sec, idx) => (
            <input key={sec.id} type="text" value={sec.content} onChange={(e) => { const next = [...bedRecord.physicalExam.customSections]; next[idx] = { ...sec, content: e.target.value }; updateField('physicalExam', { ...bedRecord.physicalExam, customSections: next }); }} placeholder={`Ex.: ${sec.title} — achados detalhados`} aria-label={sec.title} className="w-full h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
          ))}

          <textarea rows={2} value={bedRecord.evolution24h} onChange={(e) => updateField('evolution24h', e.target.value)} placeholder="Ex.: EVOLUÇÃO 24H: Sinais vitais das 24h, comportamento, aspecto geral, visita e enfermaria" aria-label="Evolução 24 horas" className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="text" value={bedRecord.dietDescription} onChange={(e) => updateField('dietDescription', e.target.value)} placeholder="Ex.: DIETA: Branda hipossódica via oral" aria-label="Dieta" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.hydrationDescription} onChange={(e) => onUpdateBedRecord({ ...bedRecord, hydrationApplicable: Boolean(e.target.value.trim()), hydrationDescription: e.target.value, updatedAt: Date.now() })} placeholder="Ex.: HIDRATAÇÃO: SF 0,9% 1000 mL EV 24/24h" aria-label="Hidratação" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.pendingItemsList.join('; ')} onChange={(e) => updateField('pendingItemsList', e.target.value.split(';').map((s) => s.trim()).filter(Boolean))} placeholder="Ex.: PENDÊNCIAS: Avaliar switch oral; Checar cultura" aria-label="Pendências" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
            <input type="text" value={bedRecord.conductList.join('; ')} onChange={(e) => updateField('conductList', e.target.value.split(';').map((s) => s.trim()).filter(Boolean))} placeholder="Ex.: CD: Manter ATB D4/D7; Manter profilaxia TEV" aria-label="Condutas" className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs" />
          </div>
        </section>
      </div>

      {/* Coluna Direita (5 cols): Espelho do Modelo Padronizado Ao Vivo */}
      <div className="xl:col-span-5 xl:sticky xl:top-20 card-surface rounded-2xl border border-[var(--border-subtle)] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)]">Modelo Padronizado de Evolução / Admissão</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Cópia em 1 clique para prontuário ou impressão A4</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={handleCopyEvolutionText} className="btn-tactile-primary h-8 px-3 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
              <Icon name={copiedFeedback ? 'check' : 'content_copy'} size={14} />
              <span>{copiedFeedback ? 'Copiado!' : 'Copiar Evolução'}</span>
            </button>
            <button type="button" onClick={() => onSendToA4Editor(buildHospitalEvolutionHtmlForA4(bedRecord), `Evolução Hospitalar — Leito ${bedRecord.wardAndBed}`)} className="btn-tactile-secondary h-8 px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
              <Icon name="editor" size={14} />
              <span>A4 / PDF</span>
            </button>
          </div>
        </div>

        <pre id="hospital-standard-evolution-preview" className="w-full max-h-96 overflow-y-auto p-4 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap clinical-tabular-nums">
          {formattedStandardText}
        </pre>

        <button type="button" onClick={handleSaveSnapshotToTimeline} className="w-full btn-tactile-secondary h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
          <Icon name="save" size={15} className="text-sky-600 dark:text-sky-400" />
          <span>Registrar Evolução no Histórico Auditável do Leito</span>
        </button>
      </div>
    </div>
  );
};
