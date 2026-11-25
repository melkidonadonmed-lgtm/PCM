import React, { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { OncologyScreeningSubPanel } from './OncologyScreeningSubPanel';
import {
  type PcrRhythmType,
  REVERSIBLE_CAUSES_5H5T,
  buildPcrSummaryHtmlForA4,
  calculateEparadaDoses,
  formatPcrSummaryNote,
} from '../../utils/scores/eparadaAndScreeningEngine';

interface EparadaAndScreeningPanelProps {
  patientWeightKg: number;
  patientAgeYears: number;
  onWeightChange: (weightKg: number) => void;
  onAddExamById?: (examId: string) => void;
  onSendToA4Editor?: (html: string, title?: string) => void;
}

export const EparadaAndScreeningPanel: React.FC<
  EparadaAndScreeningPanelProps
> = ({
  patientWeightKg,
  patientAgeYears,
  onWeightChange,
  onAddExamById,
  onSendToA4Editor,
}) => {
  const [subMode, setSubMode] = useState<'EPARADA' | 'ONCO_SCREENING'>(
    'EPARADA'
  );

  // Estado EPARADA
  const [rhythm, setRhythm] = useState<PcrRhythmType>('FV');
  const [isPediatricMode, setIsPediatricMode] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [shocksCount, setShocksCount] = useState<number>(0);
  const [epinephrineCount, setEpinephrineCount] = useState<number>(0);
  const [amiodaroneCount, setAmiodaroneCount] = useState<number>(0);
  const [checkedCausesIds, setCheckedCausesIds] = useState<string[]>([]);
  const [pcrOutcome, setPcrOutcome] = useState<
    'EM_ANDAMENTO' | 'RCE_ATINGIDO' | 'OBITO_CONSTATADO'
  >('EM_ANDAMENTO');
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isTimerRunning]);

  const cyclesCount = Math.floor(elapsedSeconds / 120) + 1;
  const cycleRemainingSecs = 120 - (elapsedSeconds % 120);
  const eparadaCalc = calculateEparadaDoses(patientWeightKg, isPediatricMode);

  const toggleCause = (id: string) => {
    setCheckedCausesIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyText = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFeedback(tag);
      setTimeout(() => setCopiedFeedback(null), 2000);
    } catch {
      setCopiedFeedback(tag);
      setTimeout(() => setCopiedFeedback(null), 2000);
    }
  };

  const handleExportPcrToA4 = () => {
    if (!onSendToA4Editor) return;
    const html = buildPcrSummaryHtmlForA4({
      rhythm,
      weightKg: patientWeightKg,
      elapsedSeconds,
      cyclesCount,
      shocksCount,
      epinephrineCount,
      amiodaroneCount,
      checkedCausesIds,
      outcome: pcrOutcome,
    });
    onSendToA4Editor(html, 'Registro de PCR (EPARADA)');
  };

  return (
    <div className="space-y-4" data-state="idle">
      {/* Seletor entre EPARADA (PCR ACLS/PALS) e Rastreio Oncológico Rápido */}
      <div className="card-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--hairline)] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={subMode === 'EPARADA'}
            onClick={() => setSubMode('EPARADA')}
            className={`touch-target min-h-[44px] inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-xs font-bold cursor-pointer ${
              subMode === 'EPARADA'
                ? 'btn-tactile-primary'
                : 'btn-tactile-secondary'
            }`}
          >
            <Icon
              name="emergency"
              className={`text-base ${subMode === 'EPARADA' ? 'text-white' : 'text-[var(--status-danger)]'}`}
            />
            Painel EPARADA (PCR ACLS / PALS & 5H/5T)
          </button>
          <button
            type="button"
            aria-pressed={subMode === 'ONCO_SCREENING'}
            onClick={() => setSubMode('ONCO_SCREENING')}
            className={`touch-target min-h-[44px] inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-xs font-bold cursor-pointer ${
              subMode === 'ONCO_SCREENING'
                ? 'btn-tactile-primary'
                : 'btn-tactile-secondary'
            }`}
          >
            <Icon name="fact_check" className="text-base" />
            Rastreio Oncológico Rápido (Mama, Colo e Próstata — INCA/MS)
          </button>
        </div>

        <span className="text-xs text-[var(--ink-muted)]">
          Cálculo determinístico com tetos de segurança e exportação direta A4
        </span>
      </div>

      {subMode === 'EPARADA' ? (
        <div className="space-y-4">
          {/* Painel Superior: Cronômetro de Ciclo 2:00 + Contadores + Ritmo + Peso */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="card-surface rounded-2xl border border-[var(--hairline)] border-l-[3px] border-l-[var(--status-danger)] p-4 lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--status-danger)]">
                  Cronômetro de Ciclo RCP (2:00 min)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ink-primary)] clinical-tabular-nums">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--status-danger)] shrink-0" />
                  Ciclo #{cyclesCount}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3">
                <div>
                  <span className="block text-[11px] uppercase text-[var(--ink-muted)]">
                    Tempo Total
                  </span>
                  <span className="font-mono text-2xl font-black text-[var(--ink-primary)] clinical-tabular-nums">
                    {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:
                    {String(elapsedSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] uppercase text-[var(--ink-muted)]">
                    Próx. Checagem Ritmo
                  </span>
                  <span className="font-mono text-xl font-bold text-[var(--accent-amber)] clinical-tabular-nums">
                    {String(Math.floor(cycleRemainingSecs / 60)).padStart(
                      2,
                      '0'
                    )}
                    :{String(cycleRemainingSecs % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((prev) => !prev)}
                  className="touch-target btn-tactile-primary flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isTimerRunning ? 'bg-[var(--accent-amber)]' : 'bg-[var(--status-danger)]'
                    }`}
                  />
                  <span>{isTimerRunning ? 'Pausar RCP' : 'Iniciar / Retomar RCP'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setElapsedSeconds(0);
                    setShocksCount(0);
                    setEpinephrineCount(0);
                    setAmiodaroneCount(0);
                    setPcrOutcome('EM_ANDAMENTO');
                  }}
                  className="touch-target btn-tactile-danger min-h-[44px] px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  Zerar
                </button>
              </div>

              {/* Contadores Rápidos de Eventos */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShocksCount((c) => c + 1)}
                  className="touch-target btn-tactile-secondary flex flex-col items-center justify-center rounded-xl border-l-[3px] border-l-[var(--accent-amber)] p-2 text-center cursor-pointer"
                >
                  <span className="text-[11px] font-bold uppercase text-[var(--ink-secondary)]">
                    Choques
                  </span>
                  <span className="font-mono text-lg font-black text-[var(--ink-primary)] clinical-tabular-nums">
                    {shocksCount}
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    +1 Choque
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEpinephrineCount((c) => c + 1)}
                  className="touch-target btn-tactile-secondary flex flex-col items-center justify-center rounded-xl border-l-[3px] border-l-[var(--status-danger)] p-2 text-center cursor-pointer"
                >
                  <span className="text-[11px] font-bold uppercase text-[var(--ink-secondary)]">
                    Adrenalina
                  </span>
                  <span className="font-mono text-lg font-black text-[var(--ink-primary)] clinical-tabular-nums">
                    {epinephrineCount}
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    +1 Dose (3-5m)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAmiodaroneCount((c) => c + 1)}
                  className="touch-target btn-tactile-secondary flex flex-col items-center justify-center rounded-xl border-l-[3px] border-l-[var(--ink-clinical)] p-2 text-center cursor-pointer"
                >
                  <span className="text-[11px] font-bold uppercase text-[var(--ink-secondary)]">
                    Amiodarona
                  </span>
                  <span className="font-mono text-lg font-black text-[var(--ink-primary)] clinical-tabular-nums">
                    {amiodaroneCount}
                  </span>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    +1 Bolus
                  </span>
                </button>
              </div>
            </div>

            {/* Configuração de Ritmo, Peso e Modo Adulto/PALS */}
            <div className="card-surface rounded-2xl border border-[var(--hairline)] p-4 lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                  Parâmetros da Reanimação (ACLS Adulto & PALS Pediátrico)
                </h3>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    aria-pressed={!isPediatricMode}
                    onClick={() => setIsPediatricMode(false)}
                    className={`touch-target min-h-[44px] rounded-[10px] px-3 py-1.5 font-semibold cursor-pointer ${
                      !isPediatricMode
                        ? 'btn-tactile-primary'
                        : 'btn-tactile-secondary'
                    }`}
                  >
                    Adulto (ACLS)
                  </button>
                  <button
                    type="button"
                    aria-pressed={isPediatricMode}
                    onClick={() => setIsPediatricMode(true)}
                    className={`touch-target min-h-[44px] rounded-[10px] px-3 py-1.5 font-semibold cursor-pointer ${
                      isPediatricMode
                        ? 'btn-tactile-primary'
                        : 'btn-tactile-secondary'
                    }`}
                  >
                    Pediátrico (PALS)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="eparada-weight-input"
                    className="block text-[11px] font-semibold text-[var(--ink-muted)]"
                  >
                    Peso Corporal (<span className="clinical-unit">kg</span>)
                  </label>
                  <input
                    id="eparada-weight-input"
                    type="number"
                    min={0}
                    max={250}
                    placeholder="Ex.: 70"
                    value={patientWeightKg}
                    onChange={(e) =>
                      onWeightChange(parseFloat(e.target.value) || 0)
                    }
                    className="tactile-input mt-1 w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-3 py-1.5 font-mono text-sm font-bold text-[var(--ink-primary)] clinical-tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="eparada-rhythm-select"
                    className="block text-[11px] font-semibold text-[var(--ink-muted)]"
                  >
                    Ritmo Inicial / Atual
                  </label>
                  <select
                    id="eparada-rhythm-select"
                    aria-label="Ritmo cardíaco na PCR"
                    value={rhythm}
                    onChange={(e) => setRhythm(e.target.value as PcrRhythmType)}
                    className="tactile-input mt-1 w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
                  >
                    <option value="FV">FV — Fibrilação Ventricular (Chocável)</option>
                    <option value="TVSP">TVSP — TV sem Pulso (Chocável)</option>
                    <option value="AESP">AESP — Atividade Elétrica s/ Pulso</option>
                    <option value="ASSISTOLIA">Assistolia (Protocolo Linha Reta)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="eparada-outcome-select"
                    className="block text-[11px] font-semibold text-[var(--ink-muted)]"
                  >
                    Status / Desfecho
                  </label>
                  <select
                    id="eparada-outcome-select"
                    aria-label="Desfecho da reanimação"
                    value={pcrOutcome}
                    onChange={(e) =>
                      setPcrOutcome(
                        e.target.value as
                          | 'EM_ANDAMENTO'
                          | 'RCE_ATINGIDO'
                          | 'OBITO_CONSTATADO'
                      )
                    }
                    className="tactile-input mt-1 w-full h-11 min-h-[44px] rounded-[10px] border border-[var(--border-control)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-primary)]"
                  >
                    <option value="EM_ANDAMENTO">RCP em Andamento</option>
                    <option value="RCE_ATINGIDO">RCE Atingido (Cuidados Pós-PCR)</option>
                    <option value="OBITO_CONSTATADO">Óbito Constatado</option>
                  </select>
                </div>
              </div>

              {/* Trava Sem Peso Sem Dose ou Tabela de Doses Calculadas */}
              {!eparadaCalc.isValidWeight ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-[var(--hairline)] border-l-[3px] border-l-[var(--status-danger)] bg-[var(--surface-card-lit)] p-3 text-xs font-semibold text-[var(--ink-primary)]"
                >
                  <Icon name="warning" size={16} className="shrink-0 mt-0.5 text-[var(--status-danger)]" />
                  <span>{eparadaCalc.validationMessage}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {eparadaCalc.doses.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[var(--ink-primary)]">
                          {d.drugOrAction}
                        </span>
                        {d.ceilingApplied ? (
                          <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--ink-primary)]">
                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] shrink-0" />
                            Teto Máx
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-extrabold text-[var(--ink-clinical)] clinical-tabular-nums">
                        {d.calculatedDose}
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                        {d.preparationAndAdministration}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      formatPcrSummaryNote({
                        rhythm,
                        weightKg: patientWeightKg,
                        elapsedSeconds,
                        cyclesCount,
                        shocksCount,
                        epinephrineCount,
                        amiodaroneCount,
                        checkedCausesIds,
                        outcome: pcrOutcome,
                      }),
                      'PCR_SOAP'
                    )
                  }
                  className="touch-target btn-tactile-secondary min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer"
                >
                  <Icon
                    name={
                      copiedFeedback === 'PCR_SOAP' ? 'check' : 'content_copy'
                    }
                    className="text-sm text-[var(--ink-clinical)]"
                  />
                  {copiedFeedback === 'PCR_SOAP'
                    ? 'Resumo Copiado!'
                    : 'Copiar Resumo PCR (PEP)'}
                </button>
                {onSendToA4Editor ? (
                  <button
                    type="button"
                    onClick={handleExportPcrToA4}
                    className="touch-target btn-tactile-primary min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    <Icon name="description" className="text-sm" />
                    Enviar Registro de PCR ao Editor A4
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Checklist Interativo 5H e 5T */}
          <div className="card-surface rounded-2xl border border-[var(--hairline)] p-4">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
              Checklist de Causas Reversíveis de PCR (5H e 5T) — Marque as causas revisadas/tratadas
            </h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {REVERSIBLE_CAUSES_5H5T.map((cause) => {
                const checked = checkedCausesIds.includes(cause.id);
                return (
                  <button
                    key={cause.id}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => toggleCause(cause.id)}
                    className={`touch-target min-h-[44px] flex items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                      checked
                        ? 'border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] bg-[var(--surface-card-lit)] text-[var(--ink-primary)]'
                        : 'border-[var(--hairline)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:border-[var(--border-control)]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[11px] font-bold ${
                        checked
                          ? 'border-[var(--ink-clinical)] bg-[var(--clinical)] text-white'
                          : 'border-[var(--border-control)] text-[var(--ink-muted)]'
                      }`}
                    >
                      {checked ? (
                        <Icon name="check" className="text-[11px]" />
                      ) : (
                        cause.group
                      )}
                    </span>
                    <div>
                      <div className="font-bold text-[var(--ink-primary)]">
                        [{cause.group}] {cause.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
                        <strong>Pista:</strong> {cause.diagnosticClue}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-[var(--ink-clinical)]">
                        <strong>Conduta:</strong> {cause.immediateIntervention}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <OncologyScreeningSubPanel
          initialAgeYears={patientAgeYears}
          onAddExamById={onAddExamById}
          onSendToA4Editor={onSendToA4Editor}
        />
      )}
    </div>
  );
};
