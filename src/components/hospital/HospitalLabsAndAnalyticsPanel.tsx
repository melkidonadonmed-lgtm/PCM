import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Badge } from '../ui/Badge';
import type {
  HospitalBedPatientRecord,
  HospitalImagingExamEntry,
  HospitalLabPanelEntry,
} from '../../core/domain/clinicalEntities';
import {
  CANONICAL_LAB_MARKERS,
  computeLongitudinalLabDeltas,
  formatLabPanelCompactLine,
  parseDateBrOrIsoToIso,
  sortImagingChronologically,
  sortLabPanelsChronologically,
} from '../../utils/hospital/hospitalEvolutionFormatter';
import { HospitalAnalyticsDashboardSection } from './HospitalAnalyticsDashboardSection';

export type DashboardMetricSource = 'labs' | 'scores';

export interface HospitalLabsAndAnalyticsPanelProps {
  mode: 'longitudinal_labs' | 'analytics_dashboard';
  bedRecord: HospitalBedPatientRecord;
  onUpdateBedRecord: (updated: HospitalBedPatientRecord) => void;
  initialMetricSource?: DashboardMetricSource;
  initialScoreAcronym?: string | null;
  onOpenScoreboardForBed?: (calculatorId?: string) => void;
}

export const HospitalLabsAndAnalyticsPanel: React.FC<HospitalLabsAndAnalyticsPanelProps> = ({
  mode,
  bedRecord,
  onUpdateBedRecord,
  initialMetricSource = 'labs',
  initialScoreAcronym = null,
  onOpenScoreboardForBed,
}) => {
  const [newLabDateBr, setNewLabDateBr] = useState('24/10/2026');
  const [newLabValues, setNewLabValues] = useState<Record<string, string>>({});
  const [newImgDateBr, setNewImgDateBr] = useState('24/10/2026');
  const [newImgModality, setNewImgModality] = useState('');
  const [newImgFindings, setNewImgFindings] = useState('');

  if (mode === 'analytics_dashboard') {
    return (
      <HospitalAnalyticsDashboardSection
        bedRecord={bedRecord}
        onUpdateBedRecord={onUpdateBedRecord}
        initialMetricSource={initialMetricSource}
        initialScoreAcronym={initialScoreAcronym}
        onOpenScoreboardForBed={onOpenScoreboardForBed}
      />
    );
  }

  const sortedLabs = sortLabPanelsChronologically(bedRecord.labPanels);
  const sortedImages = sortImagingChronologically(bedRecord.imagingExams);
  const labDeltas = computeLongitudinalLabDeltas(bedRecord.labPanels);

  const handleAddLabPanel = () => {
    const markers: Record<string, number | string> = {};
    for (const [k, raw] of Object.entries(newLabValues)) {
      const clean = raw.trim();
      if (!clean) continue;
      const num = Number(clean.replace(',', '.'));
      markers[k] = Number.isNaN(num) ? clean : num;
    }
    if (!newLabDateBr.trim() || Object.keys(markers).length === 0) return;

    const entry: HospitalLabPanelEntry = {
      id: `lab-${Date.now()}`,
      dateBr: newLabDateBr.trim(),
      dateIso: parseDateBrOrIsoToIso(newLabDateBr.trim()),
      markers,
    };
    onUpdateBedRecord({
      ...bedRecord,
      labPanels: sortLabPanelsChronologically([...bedRecord.labPanels, entry]),
      updatedAt: Date.now(),
    });
    setNewLabValues({});
  };

  const handleAddImagingExam = () => {
    if (!newImgDateBr.trim() || !newImgModality.trim() || !newImgFindings.trim()) return;
    const entry: HospitalImagingExamEntry = {
      id: `img-${Date.now()}`,
      dateBr: newImgDateBr.trim(),
      dateIso: parseDateBrOrIsoToIso(newImgDateBr.trim()),
      examModalityAndRegion: newImgModality.trim(),
      findingsSummary: newImgFindings.trim(),
    };
    onUpdateBedRecord({
      ...bedRecord,
      imagingExams: sortImagingChronologically([...bedRecord.imagingExams, entry]),
      updatedAt: Date.now(),
    });
    setNewImgModality('');
    setNewImgFindings('');
  };

  const hasLabDraft = Object.values(newLabValues).some((v) => v.trim().length > 0);
  const hasImgDraft = Boolean(newImgModality.trim() || newImgFindings.trim());

  return (
    <div data-state="idle" aria-busy={false} className="flex flex-col gap-3">
      {/* Monitoramento Longitudinal de Exames (Elevação, Queda ou Estabilidade) */}
      <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
          <div className="flex items-center gap-2">
            <Icon name="biotech" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Monitoramento Longitudinal de Exames — Leito {bedRecord.wardAndBed}
            </h3>
          </div>
          <Badge tone="info" tabular>
            {sortedLabs.length} coletas cronológicas
          </Badge>
        </div>

        {/* Cards de Delta (Elevação ↑, Queda ↓, Estabilidade =) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {labDeltas.map((d) => {
            const arrowSymbol =
              d.direction === 'up'
                ? '↑ Elevação'
                : d.direction === 'down'
                  ? '↓ Queda'
                  : '= Estável';
            return (
              <div
                key={d.key}
                className={`p-2.5 rounded-xl border space-y-1 ${
                  d.alertLevel === 'critical'
                    ? 'border-rose-500/50 bg-rose-500/10'
                    : d.alertLevel === 'abnormal'
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-inset)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-extrabold text-[var(--text-main)]">{d.label}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] clinical-tabular-nums">
                    {arrowSymbol}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-[var(--text-main)] clinical-unit clinical-tabular-nums">
                  {String(d.latestValue).replace('.', ',')}{' '}
                  <span className="text-[11px] font-normal text-[var(--text-muted)]">{d.unit}</span>
                </p>
                <p className="text-[11px] text-[var(--text-muted)] clinical-tabular-nums">
                  {d.previousValue !== null
                    ? `Ant: ${String(d.previousValue).replace('.', ',')} (${d.previousDateBr})`
                    : `Coleta: ${d.latestDateBr}`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Linhas Compactas Padronizadas (xx/xx/xxxx: HB | HT | LEU...) */}
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Linhas Cronológicas para Evolução (Padrão Enfermaria / UTI)
          </p>
          {sortedLabs.map((panel) => (
            <div
              key={panel.id}
              className="px-3 py-2 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-main)] clinical-tabular-nums flex items-center justify-between gap-2"
            >
              <span>{formatLabPanelCompactLine(panel)}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateBedRecord({
                    ...bedRecord,
                    labPanels: bedRecord.labPanels.filter((p) => p.id !== panel.id),
                    updatedAt: Date.now(),
                  })
                }
                aria-label={`Remover coleta de ${panel.dateBr}`}
                className="text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
              >
                <Icon name="delete" size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Adicionar Nova Coleta Laboratorial */}
        <div className="pt-2.5 border-t border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-[var(--text-main)]">
              Registrar Nova Coleta Laboratorial por Data
            </p>
            {hasLabDraft && (
              <button
                type="button"
                onClick={() => setNewLabValues({})}
                className="chip-neutral h-7 px-2 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Limpar valores digitados da nova coleta"
              >
                <Icon name="close" size={12} />
                <span>Limpar</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            <div>
              <label htmlFor="hospital-lab-date-input" className="block text-[11px] font-bold text-[var(--text-muted)] mb-0.5">
                Data (DD/MM/AAAA)
              </label>
              <input
                id="hospital-lab-date-input"
                name="labDateBr"
                type="text"
                value={newLabDateBr}
                onChange={(e) => setNewLabDateBr(e.target.value)}
                placeholder="Ex.: 24/10/2026"
                className="w-full h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>
            {CANONICAL_LAB_MARKERS.map((m) => (
              <div key={m.key}>
                <label htmlFor={`hospital-lab-marker-${m.key}`} className="block text-[11px] font-bold text-[var(--text-muted)] mb-0.5">
                  {m.label} ({m.unit})
                </label>
                <input
                  id={`hospital-lab-marker-${m.key}`}
                  name={`labMarker_${m.key}`}
                  type="text"
                  value={newLabValues[m.key] || ''}
                  onChange={(e) =>
                    setNewLabValues((prev) => ({ ...prev, [m.key]: e.target.value }))
                  }
                  placeholder={`Ex.: ${m.minNormal}`}
                  className="w-full h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddLabPanel}
            className="btn-tactile-primary h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="add" size={15} />
            <span>Inserir Coleta em Ordem Cronológica</span>
          </button>
        </div>
      </section>

      {/* Exames de Imagem */}
      <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
            <Icon name="radiology" size={18} className="text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Exames de Imagem Cronológicos ({sortedImages.length})</span>
          </h3>
          {hasImgDraft && (
            <button
              type="button"
              onClick={() => {
                setNewImgModality('');
                setNewImgFindings('');
              }}
              className="chip-neutral h-7 px-2 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
              title="Limpar campos de novo exame de imagem"
            >
              <Icon name="close" size={12} />
              <span>Limpar</span>
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {sortedImages.map((img) => (
            <div
              key={img.id}
              className="p-2.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-xs flex items-start justify-between gap-2"
            >
              <div>
                <strong className="text-sky-700 dark:text-sky-300 clinical-tabular-nums">
                  {img.dateBr} — {img.examModalityAndRegion}:
                </strong>{' '}
                <span className="text-[var(--text-secondary)]">{img.findingsSummary}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateBedRecord({
                    ...bedRecord,
                    imagingExams: bedRecord.imagingExams.filter((i) => i.id !== img.id),
                    updatedAt: Date.now(),
                  })
                }
                aria-label={`Remover exame ${img.examModalityAndRegion}`}
                className="text-[var(--text-muted)] hover:text-rose-500 cursor-pointer shrink-0"
              >
                <Icon name="delete" size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          <input
            id="hospital-img-date-input"
            name="imgDateBr"
            type="text"
            value={newImgDateBr}
            onChange={(e) => setNewImgDateBr(e.target.value)}
            placeholder="Ex.: 24/10/2026"
            aria-label="Data do exame de imagem"
            className="sm:col-span-2 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
          />
          <input
            id="hospital-img-modality-input"
            name="imgModality"
            type="text"
            value={newImgModality}
            onChange={(e) => setNewImgModality(e.target.value)}
            placeholder="Ex.: TC de Tórax sem contraste"
            aria-label="Modalidade do exame de imagem"
            className="sm:col-span-4 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
          <input
            id="hospital-img-findings-input"
            name="imgFindings"
            type="text"
            value={newImgFindings}
            onChange={(e) => setNewImgFindings(e.target.value)}
            placeholder="Ex.: Descrição objetiva dos achados ou conclusão do laudo"
            aria-label="Achados ou laudo do exame de imagem"
            className="sm:col-span-4 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
          <button
            type="button"
            onClick={handleAddImagingExam}
            className="sm:col-span-2 btn-tactile-secondary h-9 px-3 rounded-xl text-xs font-bold cursor-pointer"
          >
            + Imagem
          </button>
        </div>
      </section>
    </div>
  );
};
