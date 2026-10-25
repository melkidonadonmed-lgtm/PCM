import React, { useMemo, useState } from 'react';
import { Icon } from '../Icon';
import type { PrescriptionItem } from '../../types';
import type {
  HospitalBedPatientRecord,
  HospitalBedScoreEntry,
} from '../../core/domain/clinicalEntities';
import type {
  Calculator,
  RiskSeverityLevel,
  ScoreInputRecord,
} from '../../utils/scores/scoreTypes';
import { calculateScore } from '../../utils/scores/calculationEngine';
import { calculateInfusionRate } from '../../utils/scores/infusionEngine';
import {
  buildScoreHtmlForA4,
  convertPharmacologicalActionToPrescriptionItem,
  generatePepNote,
  generateSbarNote,
  summarizePositiveFindings,
} from '../../utils/scores/pepExportEngine';
import { ScoreParameterGroupInput } from './ScoreParameterGroupInput';
import { ScorePhysiologicalRadar } from './ScorePhysiologicalRadar';
import { ScoreBicInfusionCard } from './ScoreBicInfusionCard';

interface ScoreCalculatorDetailViewProps {
  calculator: Calculator;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  patientWeightKg: number;
  onWeightChange: (w: number) => void;
  bedIdentifier: string;
  onBedIdentifierChange: (b: string) => void;
  onAddPrescriptionItem?: (item: PrescriptionItem) => void;
  onSendToA4Editor?: (html: string, title?: string) => void;
  onOpenScoreBySlug?: (slugOrId: string) => void;
  hospitalBeds?: HospitalBedPatientRecord[];
  activeHospitalBedId?: string;
  onSelectHospitalBed?: (bedId: string) => void;
  onRecordScoreToBed?: (
    bedId: string,
    entry: HospitalBedScoreEntry,
    options?: { appendConductToBed?: boolean }
  ) => void;
  onNavigateToHospitalDashboard?: (bedId: string, scoreAcronym: string) => void;
}

const SEVERITY_BADGE_CLASSES: Record<RiskSeverityLevel, string> = {
  low: 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300',
  intermediate:
    'border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300',
  high: 'border-orange-500/40 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300',
  critical:
    'border-red-500/50 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300',
};

export const ScoreCalculatorDetailView: React.FC<
  ScoreCalculatorDetailViewProps
> = ({
  calculator,
  isFavorite,
  onToggleFavorite,
  patientWeightKg,
  onWeightChange,
  bedIdentifier,
  onBedIdentifierChange,
  onAddPrescriptionItem,
  onSendToA4Editor,
  onOpenScoreBySlug,
  hospitalBeds = [],
  activeHospitalBedId,
  onSelectHospitalBed,
  onRecordScoreToBed,
  onNavigateToHospitalDashboard,
}) => {
  const [inputs, setInputs] = useState<ScoreInputRecord>(() => {
    const initial: ScoreInputRecord = {};
    for (const group of calculator.parameterGroups) {
      const baseline =
        group.options.find((o) => o.isNormalBaseline) ?? group.options[0];
      if (baseline) {
        initial[group.id] = baseline.id;
      } else {
        initial[group.id] = group.normalBaselineValue;
      }
    }
    return initial;
  });

  const [openBicDrugId, setOpenBicDrugId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<
    'PEP' | 'SBAR' | 'A4' | 'BED_RECORDED' | null
  >(null);
  const [appendConductToBed, setAppendConductToBed] = useState<boolean>(true);
  const [prescribedIds, setPrescribedIds] = useState<Record<string, boolean>>(
    {}
  );

  const selectedHospitalBed = useMemo(
    () =>
      hospitalBeds.find((b) => b.id === activeHospitalBedId) ?? hospitalBeds[0],
    [hospitalBeds, activeHospitalBedId]
  );

  const result = useMemo(
    () => calculateScore(calculator, inputs),
    [calculator, inputs]
  );

  const activeTier = result.activeRiskTier;
  const sortedGroups = useMemo(
    () =>
      [...calculator.parameterGroups].sort(
        (a, b) => a.sortOrder - b.sortOrder
      ),
    [calculator.parameterGroups]
  );

  const handleInputChange = (
    groupId: string,
    value: string | number | boolean
  ) => {
    setInputs((prev) => ({ ...prev, [groupId]: value }));
  };

  const handleResetBaseline = () => {
    const reset: ScoreInputRecord = {};
    for (const group of calculator.parameterGroups) {
      const baseline =
        group.options.find((o) => o.isNormalBaseline) ?? group.options[0];
      reset[group.id] = baseline ? baseline.id : group.normalBaselineValue;
    }
    setInputs(reset);
  };

  const buildExportContext = () => {
    const activeInfusions = activeTier.pharmacologicalActions
      .filter((rx) => rx.infusionProtocol)
      .map((rx) => {
        const proto = rx.infusionProtocol!;
        const calc = calculateInfusionRate({
          protocol: proto,
          weightKg: patientWeightKg > 0 ? patientWeightKg : 70,
          dose: proto.defaultDose,
        });
        return { protocol: proto, calculation: calc };
      });

    return {
      calculator,
      result,
      inputs,
      bedIdentifier,
      patientWeightKg: patientWeightKg > 0 ? patientWeightKg : 70,
      activeInfusions,
    };
  };

  const handleCopyText = async (mode: 'PEP' | 'SBAR') => {
    const ctx = buildExportContext();
    const noteText =
      mode === 'PEP' ? generatePepNote(ctx) : generateSbarNote(ctx);
    try {
      await navigator.clipboard.writeText(noteText);
      setCopyFeedback(mode);
      setTimeout(() => setCopyFeedback(null), 2200);
    } catch {
      setCopyFeedback(mode);
      setTimeout(() => setCopyFeedback(null), 2200);
    }
  };

  const handleSendScoreToA4 = () => {
    if (!onSendToA4Editor) return;
    const ctx = buildExportContext();
    const html = buildScoreHtmlForA4(ctx, 'SOAP');
    onSendToA4Editor(html, `Escore ${calculator.acronym}`);
    setCopyFeedback('A4');
    setTimeout(() => setCopyFeedback(null), 2200);
  };

  const handleRecordScoreInHospitalBed = () => {
    if (!onRecordScoreToBed || !selectedHospitalBed) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');

    const dateIso = `${yyyy}-${mm}-${dd}`;
    const dateBr = `${dd}/${mm}/${yyyy}`;
    const recordedAtIso = `${dateIso}T${hh}:${min}:${sec}`;

    const findings = summarizePositiveFindings(calculator, inputs);
    const recommendedConducts: string[] = [
      ...activeTier.nonPharmacologicalActions.map(
        (a) => `[${calculator.acronym} -> ${a.dispositionTarget}] ${a.recommendationTitle}: ${a.monitoringPlan}`
      ),
      ...activeTier.pharmacologicalActions.map(
        (rx) => `[${calculator.acronym}] ${rx.drugName} ${rx.dosage} (${rx.route}, ${rx.frequency})`
      ),
    ];

    const scoreNumeric = Number(result.score ?? result.rawScore ?? 0);
    const entry: HospitalBedScoreEntry = {
      id: `score-${selectedHospitalBed.id}-${calculator.slug}-${Date.now()}`,
      dateBr,
      dateIso,
      recordedAtIso,
      calculatorId: calculator.id,
      acronym: calculator.acronym,
      calculatorName: calculator.name,
      scoreNumeric: Number.isFinite(scoreNumeric) ? scoreNumeric : 0,
      scoreFormatted: result.scoreFormatted,
      minPossibleScore: calculator.minPossibleScore,
      maxPossibleScore: calculator.maxPossibleScore,
      severityLevel: activeTier.severityLevel,
      riskLabel: activeTier.label,
      findingsSummary: findings.slice(0, 4).join(' | '),
      recommendedConducts,
    };

    onRecordScoreToBed(selectedHospitalBed.id, entry, {
      appendConductToBed,
    });
    setCopyFeedback('BED_RECORDED');
    setTimeout(() => setCopyFeedback(null), 2800);
  };

  const handlePrescribeDrug = (
    rx: typeof activeTier.pharmacologicalActions[number]
  ) => {
    if (!onAddPrescriptionItem) return;
    const item = convertPharmacologicalActionToPrescriptionItem(
      rx,
      calculator.acronym
    );
    onAddPrescriptionItem(item);
    setPrescribedIds((prev) => ({ ...prev, [rx.id]: true }));
  };

  return (
    <div className="space-y-4" data-state="idle">
      {/* Banner de Cabeçalho e Pontuação em Tempo Real */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-600/10 dark:bg-blue-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                {calculator.acronym}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {calculator.categoryName ?? calculator.category} •{' '}
                {calculator.moduleName ?? calculator.subcategory}
              </span>
              <button
                type="button"
                onClick={() => onToggleFavorite(calculator.id)}
                title={
                  isFavorite
                    ? 'Remover dos Favoritos Rápidos'
                    : 'Fixar nos Favoritos Rápidos'
                }
                aria-label={
                  isFavorite
                    ? `Remover ${calculator.acronym} dos favoritos`
                    : `Fixar ${calculator.acronym} nos favoritos`
                }
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isFavorite
                    ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon name="star" className="text-xs" />
                {isFavorite ? 'Fixado' : 'Fixar'}
              </button>
              <button
                type="button"
                onClick={handleResetBaseline}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Icon name="restart_alt" className="text-xs" />
                Zerar Basal
              </button>
            </div>

            <h2 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
              {calculator.name}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {calculator.summary}
            </p>
          </div>

          <div
            className={`flex min-w-56 flex-col items-end justify-between rounded-xl border px-4 py-3 ${SEVERITY_BADGE_CLASSES[activeTier.severityLevel]}`}
          >
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">
                Escore Calculado
              </span>
              <span className="rounded bg-black/10 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] uppercase clinical-tabular-nums">
                Faixa: {calculator.minPossibleScore} a{' '}
                {calculator.maxPossibleScore}
              </span>
            </div>
            <div className="my-1 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-black tracking-tight clinical-tabular-nums">
                {result.scoreFormatted}
              </span>
              <span className="font-mono text-xs opacity-80 clinical-unit">
                pts
              </span>
            </div>
            <div className="text-right text-xs font-bold leading-tight">
              {activeTier.label}
            </div>
          </div>
        </div>

        {/* Alerta Mandatório SSC 2021 (qSOFA) */}
        {result.sscWarning ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs text-amber-950 dark:text-amber-200">
            <div className="flex items-start gap-2.5">
              <Icon
                name="warning"
                className="mt-0.5 text-base shrink-0 text-amber-600 dark:text-amber-400"
              />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-300">
                  Diretriz Surviving Sepsis Campaign (SSC 2021):{' '}
                </span>
                {result.sscWarning}
              </div>
            </div>
            {onOpenScoreBySlug && calculator.slug === 'qsofa' ? (
              <button
                type="button"
                onClick={() => onOpenScoreBySlug('sofa')}
                className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
              >
                Abrir SOFA Completo
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Grid Principal: Parâmetros + Condutas (Esquerda) | Radar + Exportação (Direita) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {/* Parâmetros Clínicos */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Parâmetros Clínicos à Beira do Leito ({sortedGroups.length}{' '}
                domínios)
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Cálculo determinístico instantâneo
              </span>
            </div>

            {sortedGroups.map((group) => (
              <ScoreParameterGroupInput
                key={group.id}
                group={group}
                selectedValue={inputs[group.id]}
                onChange={handleInputChange}
              />
            ))}
          </div>

          {/* Conduta e Intervenção */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  2. Estratificação de Risco e Plano Terapêutico Imediato
                </h3>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${SEVERITY_BADGE_CLASSES[activeTier.severityLevel]}`}
                >
                  {activeTier.label}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                <strong>Desfecho / Evidência:</strong>{' '}
                {activeTier.statisticalOutcome}
              </p>
            </div>

            {/* Medidas Não Farmacológicas */}
            {activeTier.nonPharmacologicalActions.length > 0 ? (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Icon
                    name="shield_with_heart"
                    className="text-sm text-emerald-600"
                  />
                  Destinação, Monitorização e Suporte Não-Farmacológico
                </h4>
                {activeTier.nonPharmacologicalActions.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {act.recommendationTitle}
                      </span>
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        Destino: {act.dispositionTarget}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>Plano de Monitorização:</strong>{' '}
                      {act.monitoringPlan}
                    </p>
                    {act.ventilatorySupport ? (
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong>Suporte Ventilatório:</strong>{' '}
                        {act.ventilatorySupport}
                      </p>
                    ) : null}
                    {act.vascularAccess ? (
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong>Acesso Vascular:</strong> {act.vascularAccess}
                      </p>
                    ) : null}
                    {act.interventionalProcedure ? (
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong>Procedimento / Intervenção:</strong>{' '}
                        {act.interventionalProcedure}
                      </p>
                    ) : null}
                    {act.laboratoryPanel ? (
                      <p className="text-slate-600 dark:text-slate-400">
                        <strong>Painel Laboratorial:</strong>{' '}
                        {act.laboratoryPanel}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Condutas Farmacológicas + Prescrição Direta / BIC */}
            {activeTier.pharmacologicalActions.length > 0 ? (
              <div className="space-y-2.5">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Icon name="medication" className="text-sm text-blue-600" />
                  Prescrição Farmacológica Guiada pelo Escore
                </h4>
                {activeTier.pharmacologicalActions.map((rx) => {
                  const hasBic = Boolean(rx.infusionProtocol);
                  const isBicOpen = openBicDrugId === rx.id;
                  const alreadyPrescribed = Boolean(prescribedIds[rx.id]);

                  return (
                    <div
                      key={rx.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {rx.drugName}
                          </span>
                          <div className="mt-0.5 font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 clinical-tabular-nums">
                            {rx.dosage} • {rx.route} • {rx.frequency}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {onAddPrescriptionItem ? (
                            <button
                              type="button"
                              onClick={() => handlePrescribeDrug(rx)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                                alreadyPrescribed
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <Icon
                                name={
                                  alreadyPrescribed ? 'check' : 'add_circle'
                                }
                                className="text-sm"
                              />
                              {alreadyPrescribed
                                ? 'Adicionado à Receita'
                                : 'Prescrever na Receita'}
                            </button>
                          ) : null}

                          {hasBic ? (
                            <button
                              type="button"
                              onClick={() =>
                                setOpenBicDrugId(isBicOpen ? null : rx.id)
                              }
                              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                                isBicOpen
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                              }`}
                            >
                              <Icon name="calculate" className="text-sm" />
                              {isBicOpen
                                ? 'Ocultar BIC'
                                : 'Calcular BIC (mL/h)'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {rx.dilutionInstructions &&
                      rx.dilutionInstructions !== 'Não aplicável' ? (
                        <p className="text-slate-600 dark:text-slate-300">
                          <strong>Preparo / Diluição:</strong>{' '}
                          {rx.dilutionInstructions}
                        </p>
                      ) : null}
                      {rx.renalAdjustment ? (
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Ajuste Renal:</strong> {rx.renalAdjustment}
                        </p>
                      ) : null}
                      {rx.contraindications ? (
                        <p className="text-amber-700 dark:text-amber-300">
                          <strong>Cautelas / Contraindicações:</strong>{' '}
                          {rx.contraindications}
                        </p>
                      ) : null}

                      {hasBic && isBicOpen && rx.infusionProtocol ? (
                        <div className="pt-2">
                          <ScoreBicInfusionCard
                            protocol={rx.infusionProtocol}
                            patientWeightKg={patientWeightKg}
                            onWeightChange={onWeightChange}
                            onAddPrescriptionItem={onAddPrescriptionItem}
                            onSendToA4Editor={onSendToA4Editor}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Coluna Direita: Radar Fisiológico + Faixas + Exportação PEP/SBAR/A4 */}
        <div className="space-y-4 lg:col-span-5">
          <div className="sticky top-4 space-y-4">
            <ScorePhysiologicalRadar
              axes={calculator.radarAxes}
              values={result.radarValues}
              severityLevel={activeTier.severityLevel}
              size={290}
            />

            {/* Matriz de Faixas de Risco */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3.5">
              <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matriz de Estratificação do Escore
              </h4>
              <div className="space-y-1.5">
                {calculator.riskTiers.map((tier) => {
                  const isActive = tier.id === activeTier.id;
                  return (
                    <div
                      key={tier.id}
                      className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
                        isActive
                          ? SEVERITY_BADGE_CLASSES[tier.severityLevel]
                          : 'border-slate-200 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-medium">{tier.label}</span>
                      <span className="font-mono text-[11px] font-bold clinical-tabular-nums">
                        {tier.minScore === tier.maxScore
                          ? `${tier.minScore} pt`
                          : `${tier.minScore} a ${tier.maxScore} pts`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hub de Exportação SOAP / SBAR / Editor A4 */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Exportação Prontuário (PEP / SBAR / Editor A4)
                </h4>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Zero-PII / LGPD
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="score-bed-id"
                    className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                  >
                    Identificador de Leito
                  </label>
                  <input
                    id="score-bed-id"
                    type="text"
                    placeholder="Ex.: UTI-04, Sala Vermelha"
                    value={bedIdentifier}
                    onChange={(e) => onBedIdentifierChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="score-patient-weight"
                    className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                  >
                    Peso p/ BIC (<span className="clinical-unit">kg</span>)
                  </label>
                  <input
                    id="score-patient-weight"
                    type="number"
                    min={1}
                    max={300}
                    placeholder="Ex.: 70"
                    value={patientWeightKg > 0 ? patientWeightKg : 70}
                    onChange={(e) =>
                      onWeightChange(
                        Math.max(1, parseFloat(e.target.value) || 70)
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none clinical-tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleCopyText('PEP')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Icon
                    name={copyFeedback === 'PEP' ? 'check' : 'content_copy'}
                    className="text-sm text-emerald-600"
                  />
                  {copyFeedback === 'PEP'
                    ? 'SOAP Copiado!'
                    : 'Copiar Evolução SOAP'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyText('SBAR')}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Icon
                    name={copyFeedback === 'SBAR' ? 'check' : 'share'}
                    className="text-sm text-blue-600"
                  />
                  {copyFeedback === 'SBAR' ? 'SBAR Copiado!' : 'Copiar SBAR'}
                </button>
              </div>

              {onSendToA4Editor ? (
                <button
                  type="button"
                  onClick={handleSendScoreToA4}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                >
                  <Icon
                    name={copyFeedback === 'A4' ? 'check' : 'description'}
                    className="text-base"
                  />
                  {copyFeedback === 'A4'
                    ? 'Enviado para o Editor A4!'
                    : 'Enviar Relatório Estruturado para o Editor A4'}
                </button>
              ) : null}

              {/* Ponte Direta: Registrar Escore no Módulo de Internação (MOD-03) e Dashboard */}
              {onRecordScoreToBed && selectedHospitalBed ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      <Icon name="local_hospital" size={14} />
                      Integração Internação & Dashboard (MOD-03)
                    </span>
                    <span className="rounded bg-sky-500/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300 clinical-tabular-nums">
                      EF/LT {selectedHospitalBed.wardAndBed}
                    </span>
                  </div>

                  {hospitalBeds.length > 1 && onSelectHospitalBed ? (
                    <div>
                      <label
                        htmlFor="score-hospital-bed-select"
                        className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
                      >
                        Leito Hospitalar Alvo (MOD-03)
                      </label>
                      <select
                        id="score-hospital-bed-select"
                        value={selectedHospitalBed.id}
                        onChange={(e) => {
                          onSelectHospitalBed(e.target.value);
                          const chosen = hospitalBeds.find(
                            (b) => b.id === e.target.value
                          );
                          if (chosen) {
                            onBedIdentifierChange(chosen.wardAndBed);
                          }
                        }}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 clinical-tabular-nums"
                      >
                        {hospitalBeds.map((b) => (
                          <option key={b.id} value={b.id}>
                            EF/LT {b.wardAndBed} —{' '}
                            {b.patientNameOrInitials || 'Leito sem ID'}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appendConductToBed}
                      onChange={(e) => setAppendConductToBed(e.target.checked)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>
                      Sincronizar conduta sugerida na lista <strong>CD</strong> do leito
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleRecordScoreInHospitalBed}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 cursor-pointer"
                    >
                      <Icon
                        name={
                          copyFeedback === 'BED_RECORDED' ? 'check' : 'add_chart'
                        }
                        size={15}
                      />
                      <span>
                        {copyFeedback === 'BED_RECORDED'
                          ? `Registrado no Leito ${selectedHospitalBed.wardAndBed}!`
                          : `Registrar no Leito ${selectedHospitalBed.wardAndBed} (Dashboard)`}
                      </span>
                    </button>

                    {onNavigateToHospitalDashboard ? (
                      <button
                        type="button"
                        onClick={() =>
                          onNavigateToHospitalDashboard(
                            selectedHospitalBed.id,
                            calculator.acronym
                          )
                        }
                        className="flex items-center justify-center gap-1 rounded-lg border border-sky-500/40 bg-white dark:bg-slate-900 px-2.5 py-2 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Icon name="monitor_heart" size={14} />
                        <span>Ver no Dashboard</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>Fonte Científica:</strong> {calculator.evidenceSource}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
