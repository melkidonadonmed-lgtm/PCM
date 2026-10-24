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
  analyzeConductVsEvolution,
  computeLongitudinalLabDeltas,
  formatLabPanelCompactLine,
  parseDateBrOrIsoToIso,
  sortImagingChronologically,
  sortLabPanelsChronologically,
} from '../../utils/hospital/hospitalEvolutionFormatter';

export interface HospitalLabsAndAnalyticsPanelProps {
  mode: 'longitudinal_labs' | 'analytics_dashboard';
  bedRecord: HospitalBedPatientRecord;
  onUpdateBedRecord: (updated: HospitalBedPatientRecord) => void;
}

export const HospitalLabsAndAnalyticsPanel: React.FC<HospitalLabsAndAnalyticsPanelProps> = ({
  mode,
  bedRecord,
  onUpdateBedRecord,
}) => {
  const [newLabDateBr, setNewLabDateBr] = useState('24/10/2026');
  const [newLabValues, setNewLabValues] = useState<Record<string, string>>({});
  const [newImgDateBr, setNewImgDateBr] = useState('24/10/2026');
  const [newImgModality, setNewImgModality] = useState('');
  const [newImgFindings, setNewImgFindings] = useState('');
  const [selectedTrendKey, setSelectedTrendKey] = useState<string>('PCR');

  const sortedLabs = sortLabPanelsChronologically(bedRecord.labPanels);
  const sortedImages = sortImagingChronologically(bedRecord.imagingExams);
  const labDeltas = computeLongitudinalLabDeltas(bedRecord.labPanels);
  const correlations = analyzeConductVsEvolution(bedRecord);

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

  if (mode === 'analytics_dashboard') {
    const trendPoints = sortedLabs
      .map((p) => {
        const raw = p.markers[selectedTrendKey];
        const num = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(',', '.'));
        return Number.isNaN(num) || raw === undefined ? null : { dateBr: p.dateBr, value: num };
      })
      .filter((pt): pt is { dateBr: string; value: number } => pt !== null);

    const maxVal = trendPoints.length > 0 ? Math.max(...trendPoints.map((p) => p.value), 1) : 100;
    const minVal = trendPoints.length > 0 ? Math.min(...trendPoints.map((p) => p.value), 0) : 0;
    const range = Math.max(maxVal - minVal, 1);

    return (
      <div data-state="idle" className="space-y-4">
        {/* Agente Analítico: Cruzamento Conduta x Evolução */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Icon name="monitor_heart" size={18} className="text-sky-600 dark:text-sky-400" />
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                Agente Analítico — Cruzamento Conduta × Evolução (Leito {bedRecord.wardAndBed})
              </h3>
            </div>
            <Badge tone="clinical" tabular>
              {correlations.length} eixos avaliados
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {correlations.map((corr) => (
              <div
                key={corr.id}
                className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Eixo: {corr.domain.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full clinical-tabular-nums ${
                      corr.efficacyStatus === 'favorable'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : corr.efficacyStatus === 'attention'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                          : 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                    }`}
                  >
                    {corr.efficacyStatus === 'favorable'
                      ? 'Resposta Favorável'
                      : corr.efficacyStatus === 'attention'
                        ? 'Atenção Terapêutica'
                        : 'Em Monitoramento'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-main)]">Conduta Ativa:</strong> {corr.activeConductText}
                </p>
                <p className="text-xs text-[var(--text-secondary)] clinical-tabular-nums">
                  <strong className="text-[var(--text-main)]">Resposta Evolutiva:</strong> {corr.evolutionResponseText}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Curva Longitudinal Vetorial SVG */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Dashboard Analítico de Tendência Laboratorial
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Selecione o marcador para inspecionar a curva longitudinal do leito
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {CANONICAL_LAB_MARKERS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedTrendKey(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer clinical-tabular-nums ${
                    selectedTrendKey === m.key
                      ? 'bg-sky-600 text-white'
                      : 'bg-[var(--surface-inset)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {trendPoints.length === 0 ? (
            <div className="p-6 rounded-xl bg-[var(--surface-inset)] text-center text-xs text-[var(--text-muted)]">
              Sem aferições seriadas para o marcador <strong>{selectedTrendKey}</strong> neste leito.
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)]">
              <svg viewBox="0 0 520 150" className="w-full h-36 overflow-visible" role="img" aria-label={`Curva de tendência de ${selectedTrendKey}`}>
                {trendPoints.map((pt, idx) => {
                  const x = trendPoints.length === 1 ? 260 : 50 + (idx / (trendPoints.length - 1)) * 420;
                  const y = 115 - ((pt.value - minVal) / range) * 80;
                  const nextPt = trendPoints[idx + 1];
                  const nextX = nextPt && trendPoints.length > 1 ? 50 + ((idx + 1) / (trendPoints.length - 1)) * 420 : null;
                  const nextY = nextPt ? 115 - ((nextPt.value - minVal) / range) * 80 : null;
                  return (
                    <g key={`${pt.dateBr}-${idx}`}>
                      {nextX !== null && nextY !== null && (
                        <line x1={x} y1={y} x2={nextX} y2={nextY} stroke="#0284c7" strokeWidth="2.5" />
                      )}
                      <circle cx={x} cy={y} r="5" fill="#0284c7" />
                      <text x={x} y={y - 10} textAnchor="middle" className="fill-current text-[11px] font-bold">
                        {String(pt.value).replace('.', ',')}
                      </text>
                      <text x={x} y={138} textAnchor="middle" className="fill-current text-[10px] opacity-75">
                        {pt.dateBr}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </section>

        {/* Histórico de Evolução por Leito (Linha do Tempo Auditável) */}
        <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
              <Icon name="history" size={18} className="text-sky-600 dark:text-sky-400" />
              <span>Histórico Auditável de Evoluções por Leito ({bedRecord.evolutionHistoryTimeline.length})</span>
            </h3>
          </div>
          {bedRecord.evolutionHistoryTimeline.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              Nenhuma evolução diária congelada ainda. Use o botão <strong>Registrar Evolução no Histórico do Leito</strong> na aba de Evolução Clínica para gravar snapshots diários auditáveis.
            </p>
          ) : (
            <div className="space-y-2">
              {bedRecord.evolutionHistoryTimeline.map((snap) => (
                <div key={snap.id} className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-sky-700 dark:text-sky-300 clinical-tabular-nums">
                      {snap.dateBr} • D{snap.dayNumber} — {snap.authorDoctorName || 'Médico Assistente'}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] clinical-tabular-nums">
                      {snap.recordedAtIso.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{snap.evolution24hSummary}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div data-state="idle" className="space-y-4">
      {/* Monitoramento Longitudinal de Exames (Elevação, Queda ou Estabilidade) */}
      <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Icon name="biotech" size={18} className="text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
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
            const arrowSymbol = d.direction === 'up' ? '↑ Elevação' : d.direction === 'down' ? '↓ Queda' : '= Estável';
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
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-card)] border border-[var(--border-subtle)] clinical-tabular-nums">
                    {arrowSymbol}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-[var(--text-main)] clinical-unit clinical-tabular-nums">
                  {String(d.latestValue).replace('.', ',')} <span className="text-[10px] font-normal text-[var(--text-muted)]">{d.unit}</span>
                </p>
                <p className="text-[10px] text-[var(--text-muted)] clinical-tabular-nums">
                  {d.previousValue !== null
                    ? `Ant: ${String(d.previousValue).replace('.', ',')} (${d.previousDateBr})`
                    : `Coleta: ${d.latestDateBr}`}
                </p>
              </div>
            );
          })}
        </div>

        {/* Linhas Compactas Padronizadas (xx/xx/xxxx: HB | HT | LEU...) */}
        <div className="space-y-1.5 pt-2">
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
        <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
          <p className="text-xs font-bold text-[var(--text-main)]">Registrar Nova Coleta Laboratorial por Data</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-0.5">Data (DD/MM/AAAA)</label>
              <input
                type="text"
                value={newLabDateBr}
                onChange={(e) => setNewLabDateBr(e.target.value)}
                placeholder="Ex.: 24/10/2026"
                className="w-full h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
              />
            </div>
            {CANONICAL_LAB_MARKERS.map((m) => (
              <div key={m.key}>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] mb-0.5">
                  {m.label} ({m.unit})
                </label>
                <input
                  type="text"
                  value={newLabValues[m.key] || ''}
                  onChange={(e) => setNewLabValues((prev) => ({ ...prev, [m.key]: e.target.value }))}
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
      <section className="card-surface rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
          <Icon name="radiology" size={18} className="text-sky-600 dark:text-sky-400" />
          <span>Exames de Imagem Cronológicos ({sortedImages.length})</span>
        </h3>
        <div className="space-y-1.5">
          {sortedImages.map((img) => (
            <div key={img.id} className="p-2.5 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-xs flex items-start justify-between gap-2">
              <div>
                <strong className="text-sky-700 dark:text-sky-300 clinical-tabular-nums">{img.dateBr} — {img.examModalityAndRegion}:</strong>{' '}
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
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2">
          <input
            type="text"
            value={newImgDateBr}
            onChange={(e) => setNewImgDateBr(e.target.value)}
            placeholder="Ex.: 24/10/2026"
            aria-label="Data do exame de imagem"
            className="sm:col-span-2 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs clinical-tabular-nums"
          />
          <input
            type="text"
            value={newImgModality}
            onChange={(e) => setNewImgModality(e.target.value)}
            placeholder="Ex.: TC de Tórax sem contraste"
            aria-label="Modalidade do exame de imagem"
            className="sm:col-span-4 h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-inset)] text-xs"
          />
          <input
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
