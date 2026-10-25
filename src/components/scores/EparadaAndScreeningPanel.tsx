import React, { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { escapeHtml } from '../../utils/sanitizeHtml';
import {
  type BiradsCategory,
  type CervicalCytologyResult,
  type PcrRhythmType,
  REVERSIBLE_CAUSES_5H5T,
  buildPcrSummaryHtmlForA4,
  calculateEparadaDoses,
  evaluateBreastScreening,
  evaluateCervicalScreening,
  evaluateProstateScreening,
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

  // Estado Rastreio Oncológico
  const [screeningAge, setScreeningAge] = useState<number>(
    patientAgeYears > 0 ? patientAgeYears : 54
  );
  const [birads, setBirads] = useState<BiradsCategory>('SEM_EXAME_PREVIO');
  const [breastHighRisk, setBreastHighRisk] = useState<boolean>(false);
  const [breastRedFlag, setBreastRedFlag] = useState<boolean>(false);

  const [cervicalResult, setCervicalResult] =
    useState<CervicalCytologyResult>('NORMAL_BENIGNO');
  const [twoConsecutiveNormals, setTwoConsecutiveNormals] =
    useState<boolean>(true);
  const [cervicalImmunosuppressed, setCervicalImmunosuppressed] =
    useState<boolean>(false);

  const [psaTotal, setPsaTotal] = useState<number>(1.8);
  const [psaFreeRatio, setPsaFreeRatio] = useState<number>(22);
  const [prostateHighRisk, setProstateHighRisk] = useState<boolean>(false);
  const [abnormalDre, setAbnormalDre] = useState<boolean>(false);

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

  const breastRec = evaluateBreastScreening({
    ageYears: screeningAge,
    highFamilyOrGeneticRisk: breastHighRisk,
    palpableNoduleOrRedFlag: breastRedFlag,
    birads,
  });

  const cervicalRec = evaluateCervicalScreening({
    ageYears: screeningAge,
    twoConsecutiveAnnualNormals: twoConsecutiveNormals,
    immunosuppressedOrHiv: cervicalImmunosuppressed,
    cytologyResult: cervicalResult,
  });

  const prostateRec = evaluateProstateScreening({
    ageYears: screeningAge,
    highRiskFamilyOrAncestry: prostateHighRisk,
    psaTotalNgMl: psaTotal,
    freeToTotalRatioPct: psaFreeRatio,
    abnormalDigitalRectalExam: abnormalDre,
  });

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
        /* Modo Rastreio Oncológico Rápido (Mama, Colo do Útero e Próstata) */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bancada de Rastreio Oncológico Rápido (Diretrizes INCA / Ministério da Saúde & SIGTAP SUS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Classificação imediata de BI-RADS Mamário, Citopatológico do Colo do Útero e PSA/Próstata com adição de exame em 1 clique.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="onco-screening-age"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Idade do(a) Paciente:
              </label>
              <input
                id="onco-screening-age"
                type="number"
                min={18}
                max={105}
                placeholder="Ex.: 54"
                value={screeningAge}
                onChange={(e) =>
                  setScreeningAge(Math.max(18, parseInt(e.target.value, 10) || 50))
                }
                className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
              />
              <span className="font-mono text-xs text-slate-500 clinical-unit">
                anos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* 1. Câncer de Mama (BI-RADS) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-400">
                    1. Mama (Mamografia / BI-RADS)
                  </span>
                  <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                    {breastRec.sigtapCode}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="birads-select"
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Categoria BI-RADS Atual
                  </label>
                  <select
                    id="birads-select"
                    aria-label="Categoria BI-RADS"
                    value={birads}
                    onChange={(e) =>
                      setBirads(e.target.value as BiradsCategory)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="SEM_EXAME_PREVIO">Sem exame prévio (Rastreio inicial)</option>
                    <option value="1">BI-RADS 1 (Negativo / Normal)</option>
                    <option value="2">BI-RADS 2 (Achado Benigno)</option>
                    <option value="0">BI-RADS 0 (Incompleto — Requer USG/Incidências)</option>
                    <option value="3">BI-RADS 3 (Provavelmente Benigno — 6 meses)</option>
                    <option value="4">BI-RADS 4 (Suspeito — Biópsia Obrigatória)</option>
                    <option value="5">BI-RADS 5 (Altamente Suspeito — Biópsia)</option>
                    <option value="6">BI-RADS 6 (Malignidade já comprovada)</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breastHighRisk}
                      onChange={(e) => setBreastHighRisk(e.target.checked)}
                    />
                    <span>Alto risco familiar/genético (parente 1º grau &lt; 50a / BRCA)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breastRedFlag}
                      onChange={(e) => setBreastRedFlag(e.target.checked)}
                    />
                    <span>Nódulo palpável endurecido / descarga papilar / retração</span>
                  </label>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {breastRec.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {breastRec.conductSummary}
                  </p>
                  <div className="pt-1 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Intervalo: {breastRec.followUpInterval}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {onAddExamById ? (
                  <button
                    type="button"
                    onClick={() => onAddExamById(breastRec.presetExamId)}
                    className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    + Solicitar Exame ({breastRec.presetExamId})
                  </button>
                ) : null}
                {onSendToA4Editor ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSendToA4Editor(
                        `<p>${escapeHtml(breastRec.soapSnippet)}</p>`,
                        'Rastreio Mamário'
                      )
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Enviar A4
                  </button>
                ) : null}
              </div>
            </div>

            {/* 2. Colo do Útero (Citopatológico / Papanicolaou) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    2. Colo do Útero (25–64 anos)
                  </span>
                  <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                    {cervicalRec.sigtapCode}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="cervical-select"
                    className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Resultado Citopatológico (Papanicolaou)
                  </label>
                  <select
                    id="cervical-select"
                    aria-label="Resultado do exame citopatológico"
                    value={cervicalResult}
                    onChange={(e) =>
                      setCervicalResult(
                        e.target.value as CervicalCytologyResult
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="NORMAL_BENIGNO">Normal / Alteração Benigna</option>
                    <option value="SEM_EXAME_PREVIO">Sem exame prévio</option>
                    <option value="ASC_US">ASC-US (Atipias de significado indeterminado)</option>
                    <option value="LSIL">LSIL / NIC I (Lesão de baixo grau)</option>
                    <option value="ASC_H">ASC-H (Não podendo excluir alto grau)</option>
                    <option value="HSIL">HSIL / NIC II-III (Lesão de alto grau)</option>
                    <option value="AGC">AGC (Atipias em células glandulares)</option>
                    <option value="CARCINOMA">Suspeita de Carcinoma Invasor</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoConsecutiveNormals}
                      onChange={(e) =>
                        setTwoConsecutiveNormals(e.target.checked)
                      }
                    />
                    <span>Possui 2 exames anuais consecutivos anteriores normais</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cervicalImmunosuppressed}
                      onChange={(e) =>
                        setCervicalImmunosuppressed(e.target.checked)
                      }
                    />
                    <span>Imunossuprimida / Vivendo com HIV</span>
                  </label>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {cervicalRec.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {cervicalRec.conductSummary}
                  </p>
                  <div className="pt-1 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Seguimento: {cervicalRec.followUpInterval}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {onAddExamById ? (
                  <button
                    type="button"
                    onClick={() => onAddExamById(cervicalRec.presetExamId)}
                    className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    + Solicitar Papanicolaou
                  </button>
                ) : null}
                {onSendToA4Editor ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSendToA4Editor(
                        `<p>${escapeHtml(cervicalRec.soapSnippet)}</p>`,
                        'Rastreio Cervical'
                      )
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Enviar A4
                  </button>
                ) : null}
              </div>
            </div>

            {/* 3. Próstata (Decisão Compartilhada PSA Total / Livre) */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    3. Próstata (PSA & Decisão Compartilhada)
                  </span>
                  <span className="rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                    {prostateRec.sigtapCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor="psa-total-input"
                      className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      PSA Total (<span className="clinical-unit">ng/mL</span>)
                    </label>
                    <input
                      id="psa-total-input"
                      type="number"
                      step={0.1}
                      min={0}
                      placeholder="Ex.: 1.8"
                      value={psaTotal}
                      onChange={(e) =>
                        setPsaTotal(parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="psa-ratio-input"
                      className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      Relação L/T (<span className="clinical-unit">%</span>)
                    </label>
                    <input
                      id="psa-ratio-input"
                      type="number"
                      step={1}
                      min={1}
                      max={100}
                      placeholder="Ex.: 22"
                      value={psaFreeRatio}
                      onChange={(e) =>
                        setPsaFreeRatio(parseFloat(e.target.value) || 20)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:text-white clinical-tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prostateHighRisk}
                      onChange={(e) => setProstateHighRisk(e.target.checked)}
                    />
                    <span>História familiar 1º grau (&lt; 65a) ou homem negro (&gt;= 45a)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={abnormalDre}
                      onChange={(e) => setAbnormalDre(e.target.checked)}
                    />
                    <span>Toque retal suspeito (nódulo / endurecimento)</span>
                  </label>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {prostateRec.title}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {prostateRec.conductSummary}
                  </p>
                  <div className="pt-1 font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                    Conduta: {prostateRec.followUpInterval}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {onAddExamById ? (
                  <button
                    type="button"
                    onClick={() => onAddExamById(prostateRec.presetExamId)}
                    className="flex-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    + Solicitar PSA ({prostateRec.presetExamId})
                  </button>
                ) : null}
                {onSendToA4Editor ? (
                  <button
                    type="button"
                    onClick={() =>
                      onSendToA4Editor(
                        `<p>${escapeHtml(prostateRec.soapSnippet)}</p>`,
                        'Avaliação Prostática'
                      )
                    }
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    Enviar A4
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
