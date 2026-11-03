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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubMode('EPARADA')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
              subMode === 'EPARADA'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Icon name="emergency" className="text-base" />
            Painel EPARADA (PCR ACLS / PALS & 5H/5T)
          </button>
          <button
            type="button"
            onClick={() => setSubMode('ONCO_SCREENING')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
              subMode === 'ONCO_SCREENING'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Icon name="fact_check" className="text-base" />
            Rastreio Oncológico Rápido (Mama, Colo e Próstata — INCA/MS)
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Cálculo determinístico com tetos de segurança e exportação direta A4
        </span>
      </div>

      {subMode === 'EPARADA' ? (
        <div className="space-y-4">
          {/* Painel Superior: Cronômetro de Ciclo 2:00 + Contadores + Ritmo + Peso */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="rounded-xl border border-red-500/40 bg-white dark:bg-slate-800/90 p-4 lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Cronômetro de Ciclo RCP (2:00 min)
                </span>
                <span className="rounded bg-red-500/10 px-2 py-0.5 font-mono text-xs font-bold text-red-700 dark:text-red-300 clinical-tabular-nums">
                  Ciclo #{cyclesCount}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
                <div>
                  <span className="block text-[11px] uppercase text-slate-500">
                    Tempo Total
                  </span>
                  <span className="font-mono text-2xl font-black text-slate-900 dark:text-white clinical-tabular-nums">
                    {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:
                    {String(elapsedSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] uppercase text-slate-500">
                    Próx. Checagem Ritmo
                  </span>
                  <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-400 clinical-tabular-nums">
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
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold text-white cursor-pointer ${
                    isTimerRunning
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isTimerRunning ? 'Pausar RCP' : 'Iniciar / Retomar RCP'}
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
                  className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Zerar
                </button>
              </div>

              {/* Contadores Rápidos de Eventos */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShocksCount((c) => c + 1)}
                  className="flex flex-col items-center rounded-lg border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/30 p-2 text-center hover:bg-amber-100 cursor-pointer"
                >
                  <span className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300">
                    Choques
                  </span>
                  <span className="font-mono text-lg font-black text-amber-900 dark:text-white clinical-tabular-nums">
                    {shocksCount}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    +1 Choque
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setEpinephrineCount((c) => c + 1)}
                  className="flex flex-col items-center rounded-lg border border-red-500/40 bg-red-50/70 dark:bg-red-950/30 p-2 text-center hover:bg-red-100 cursor-pointer"
                >
                  <span className="text-[11px] font-bold uppercase text-red-800 dark:text-red-300">
                    Adrenalina
                  </span>
                  <span className="font-mono text-lg font-black text-red-900 dark:text-white clinical-tabular-nums">
                    {epinephrineCount}
                  </span>
                  <span className="text-[11px] text-red-700 dark:text-red-400">
                    +1 Dose (3-5m)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAmiodaroneCount((c) => c + 1)}
                  className="flex flex-col items-center rounded-lg border border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/30 p-2 text-center hover:bg-blue-100 cursor-pointer"
                >
                  <span className="text-[11px] font-bold uppercase text-blue-800 dark:text-blue-300">
                    Amiodarona
                  </span>
                  <span className="font-mono text-lg font-black text-blue-900 dark:text-white clinical-tabular-nums">
                    {amiodaroneCount}
                  </span>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400">
                    +1 Bolus
                  </span>
                </button>
              </div>
            </div>

            {/* Configuração de Ritmo, Peso e Modo Adulto/PALS */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Parâmetros da Reanimação (ACLS Adulto & PALS Pediátrico)
                </h3>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPediatricMode(false)}
                    className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                      !isPediatricMode
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Adulto (ACLS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPediatricMode(true)}
                    className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                      isPediatricMode
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
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
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold text-slate-900 dark:text-white clinical-tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="eparada-rhythm-select"
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Ritmo Inicial / Atual
                  </label>
                  <select
                    id="eparada-rhythm-select"
                    aria-label="Ritmo cardíaco na PCR"
                    value={rhythm}
                    onChange={(e) => setRhythm(e.target.value as PcrRhythmType)}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
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
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="EM_ANDAMENTO">RCP em Andamento</option>
                    <option value="RCE_ATINGIDO">RCE Atingido (Cuidados Pós-PCR)</option>
                    <option value="OBITO_CONSTATADO">Óbito Constatado</option>
                  </select>
                </div>
              </div>

              {/* Trava Sem Peso Sem Dose ou Tabela de Doses Calculadas */}
              {!eparadaCalc.isValidWeight ? (
                <div className="rounded-xl border border-red-500/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-bold text-red-800 dark:text-red-200">
                  {eparadaCalc.validationMessage}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {eparadaCalc.doses.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {d.drugOrAction}
                        </span>
                        {d.ceilingApplied ? (
                          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            Teto Máx
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-extrabold text-blue-700 dark:text-blue-300 clinical-tabular-nums">
                        {d.calculatedDose}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  <Icon
                    name={
                      copiedFeedback === 'PCR_SOAP' ? 'check' : 'content_copy'
                    }
                    className="text-sm"
                  />
                  {copiedFeedback === 'PCR_SOAP'
                    ? 'Resumo Copiado!'
                    : 'Copiar Resumo PCR (PEP)'}
                </button>
                {onSendToA4Editor ? (
                  <button
                    type="button"
                    onClick={handleExportPcrToA4}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    <Icon name="description" className="text-sm" />
                    Enviar Registro de PCR ao Editor A4
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Checklist Interativo 5H e 5T */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4">
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Checklist de Causas Reversíveis de PCR (5H e 5T) — Marque as causas revisadas/tratadas
            </h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {REVERSIBLE_CAUSES_5H5T.map((cause) => {
                const checked = checkedCausesIds.includes(cause.id);
                return (
                  <button
                    key={cause.id}
                    type="button"
                    onClick={() => toggleCause(cause.id)}
                    className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                      checked
                        ? 'border-emerald-500/60 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[11px] font-bold ${
                        checked
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-400'
                      }`}
                    >
                      {checked ? (
                        <Icon name="check" className="text-[11px]" />
                      ) : (
                        cause.group
                      )}
                    </span>
                    <div>
                      <div className="font-bold">
                        [{cause.group}] {cause.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>Pista:</strong> {cause.diagnosticClue}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
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
