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
import { ScoreExportAndBedBridgeCard } from './ScoreExportAndBedBridgeCard';

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
  low: 'border-[var(--border-clinical-subtle)] bg-[var(--surface-clinical-subtle)] text-[var(--ink-clinical)]',
  intermediate:
    'border-[var(--accent-amber-border)] bg-[var(--accent-amber-subtle)] text-amber-800 dark:text-amber-200',
  high: 'border-orange-600/35 bg-orange-50 dark:bg-orange-950/35 text-orange-900 dark:text-orange-200',
  critical:
    'border-[var(--accent-rose-border)] bg-[var(--accent-rose-subtle)] text-rose-800 dark:text-rose-200',
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
  const buildBaselineInputs = (): ScoreInputRecord => {
    const initial: ScoreInputRecord = {};
    for (const group of calculator.parameterGroups) {
      const baseline = group.options.find((o) => o.isNormalBaseline) ?? group.options[0];
      initial[group.id] = baseline ? baseline.id : group.normalBaselineValue;
    }
    return initial;
  };

  const [inputs, setInputs] = useState<ScoreInputRecord>(buildBaselineInputs);
  const [openBicDrugId, setOpenBicDrugId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<'PEP' | 'SBAR' | 'A4' | 'BED_RECORDED' | null>(null);
  const [appendConductToBed, setAppendConductToBed] = useState<boolean>(true);
  const [prescribedIds, setPrescribedIds] = useState<Record<string, boolean>>({});

  const selectedHospitalBed = useMemo(
    () => hospitalBeds.find((b) => b.id === activeHospitalBedId) ?? hospitalBeds[0],
    [hospitalBeds, activeHospitalBedId]
  );

  const result = useMemo(() => calculateScore(calculator, inputs), [calculator, inputs]);
  const activeTier = result.activeRiskTier;
  const sortedGroups = useMemo(
    () => [...calculator.parameterGroups].sort((a, b) => a.sortOrder - b.sortOrder),
    [calculator.parameterGroups]
  );

  const handleInputChange = (groupId: string, value: string | number | boolean) => {
    setInputs((prev) => ({ ...prev, [groupId]: value }));
  };

  const handleResetBaseline = () => setInputs(buildBaselineInputs());

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
        (a) =>
          `[${calculator.acronym} -> ${a.dispositionTarget}] ${a.recommendationTitle}: ${a.monitoringPlan}`
      ),
      ...activeTier.pharmacologicalActions.map(
        (rx) =>
          `[${calculator.acronym}] ${rx.drugName} ${rx.dosage} (${rx.route}, ${rx.frequency})`
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
    rx: (typeof activeTier.pharmacologicalActions)[number]
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
    <div className="flex flex-col gap-3" data-state="idle" aria-busy={false}>
      {/* Banner de Cabeçalho e Pontuação em Tempo Real */}
      <div className="cq-card card-surface surface-card-minimal rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--ink-primary)]">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" />
                {calculator.acronym}
              </span>
              <span className="text-[11px] font-medium text-[var(--text-muted)] leading-snug">
                {calculator.categoryName ?? calculator.category} •{' '}
                {calculator.moduleName ?? calculator.subcategory}
              </span>
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(calculator.id)}
                  title={isFavorite ? 'Remover dos Favoritos Rápidos' : 'Fixar nos Favoritos Rápidos'}
                  aria-label={isFavorite ? `Remover ${calculator.acronym} dos favoritos` : `Fixar ${calculator.acronym} nos favoritos`}
                  className={`touch-target min-h-[44px] inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-xs font-semibold cursor-pointer ${
                    isFavorite ? 'btn-tactile-primary' : 'btn-tactile-secondary'
                  }`}
                >
                  <Icon name="bookmark_add" size={13} filled={isFavorite} />
                  <span>{isFavorite ? 'Fixado' : 'Fixar'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetBaseline}
                  className="touch-target min-h-[44px] chip-neutral btn-tactile-secondary inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-xs font-semibold cursor-pointer"
                >
                  <Icon name="restart_alt" size={13} />
                  <span>Zerar Basal</span>
                </button>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <Icon
                name="calculate"
                size={18}
                className="text-[var(--ink-clinical)] shrink-0"
              />
              <h2 className="text-sm font-semibold tracking-tight text-[var(--text-main)]">
                {calculator.name}
              </h2>
            </div>
            <p className="mt-0.5 text-xs leading-snug text-[var(--text-muted)] line-clamp-2">
              {calculator.summary}
            </p>
          </div>

          <div
            className={`flex min-w-44 sm:min-w-48 flex-col items-end justify-between rounded-xl border px-3.5 py-2.5 shrink-0 ${SEVERITY_BADGE_CLASSES[activeTier.severityLevel]}`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                Escore Calculado
              </span>
              <span className="rounded bg-[oklch(0.20_0.02_255/0.10)] dark:bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase clinical-tabular-nums">
                Faixa: {calculator.minPossibleScore} a{' '}
                {calculator.maxPossibleScore}
              </span>
            </div>
            <div className="my-0.5 flex items-baseline gap-1">
              <span className="font-mono text-2xl font-extrabold tracking-tight clinical-tabular-nums">
                {result.scoreFormatted}
              </span>
              <span className="font-mono text-[11px] opacity-80 clinical-unit">
                pts
              </span>
            </div>
            <div className="text-right text-[11px] font-semibold leading-tight">
              {activeTier.label}
            </div>
          </div>
        </div>

        {/* Alerta Mandatório SSC 2021 (qSOFA) */}
        {result.sscWarning ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[var(--hairline)] border-l-[3px] border-l-[var(--accent-amber)] bg-[var(--surface-card-lit)] px-3.5 py-2.5 text-xs text-[var(--ink-secondary)]">
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <Icon
                name="warning"
                className="mt-0.5 text-base shrink-0 text-[var(--accent-amber)]"
              />
              <div className="leading-relaxed">
                <span className="font-semibold text-[var(--ink-primary)]">
                  Diretriz Surviving Sepsis Campaign (SSC 2021):{' '}
                </span>
                {result.sscWarning}
              </div>
            </div>
            {onOpenScoreBySlug && calculator.slug === 'qsofa' ? (
              <button
                type="button"
                onClick={() => onOpenScoreBySlug('sofa')}
                className="touch-target btn-tactile-secondary shrink-0 px-3 py-1.5 text-xs whitespace-nowrap"
              >
                Abrir SOFA Completo
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Grid Principal: Parâmetros + Condutas (Esquerda) | Radar + Exportação (Direita) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 items-start">
        <div className="flex flex-col gap-3 lg:col-span-7">
          {/* Parâmetros Clínicos */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                1. Parâmetros Clínicos à Beira do Leito ({sortedGroups.length}{' '}
                domínios)
              </h3>
              <span className="text-[11px] text-[var(--ink-muted)]">
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
          <div className="cq-card card-surface surface-card-minimal rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4 flex flex-col gap-3">
            <div className="border-b border-subtle dark:border-strong pb-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon
                    name="shield_with_heart"
                    size={18}
                    className="text-[var(--ink-clinical)] shrink-0"
                  />
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    2. Estratificação de Risco e Plano Terapêutico Imediato
                  </h3>
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${SEVERITY_BADGE_CLASSES[activeTier.severityLevel]}`}
                >
                  {activeTier.label}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                <strong className="text-[var(--ink-primary)]">Desfecho / Evidência:</strong>{' '}
                {activeTier.statisticalOutcome}
              </p>
            </div>

            {/* Medidas Não Farmacológicas */}
            {activeTier.nonPharmacologicalActions.length > 0 ? (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                  <Icon name="shield_with_heart" className="text-sm text-[var(--ink-clinical)]" />
                  Destinação, Monitorização e Suporte Não-Farmacológico
                </h4>
                {activeTier.nonPharmacologicalActions.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3 text-xs space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[var(--ink-primary)]">
                        {act.recommendationTitle}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--ink-primary)]">
                        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" />
                        Destino: {act.dispositionTarget}
                      </span>
                    </div>
                    <p className="text-[var(--ink-secondary)] leading-relaxed">
                      <strong className="text-[var(--ink-primary)]">Plano de Monitorização:</strong>{' '}
                      {act.monitoringPlan}
                    </p>
                    {act.ventilatorySupport ? (
                      <p className="text-[var(--ink-muted)]">
                        <strong>Suporte Ventilatório:</strong>{' '}
                        {act.ventilatorySupport}
                      </p>
                    ) : null}
                    {act.vascularAccess ? (
                      <p className="text-[var(--ink-muted)]">
                        <strong>Acesso Vascular:</strong> {act.vascularAccess}
                      </p>
                    ) : null}
                    {act.interventionalProcedure ? (
                      <p className="text-[var(--ink-muted)]">
                        <strong>Procedimento / Intervenção:</strong>{' '}
                        {act.interventionalProcedure}
                      </p>
                    ) : null}
                    {act.laboratoryPanel ? (
                      <p className="text-[var(--ink-muted)]">
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
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-secondary)]">
                  <Icon name="medication" className="text-sm text-[var(--ink-clinical)]" />
                  Prescrição Farmacológica Guiada pelo Escore
                </h4>
                {activeTier.pharmacologicalActions.map((rx) => {
                  const hasBic = Boolean(rx.infusionProtocol);
                  const isBicOpen = openBicDrugId === rx.id;
                  const alreadyPrescribed = Boolean(prescribedIds[rx.id]);

                  return (
                    <div
                      key={rx.id}
                      className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-card-lit)] p-3 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-[var(--ink-primary)]">
                            {rx.drugName}
                          </span>
                          <div className="mt-0.5 font-mono text-xs font-semibold text-[var(--ink-clinical)] clinical-tabular-nums">
                            {rx.dosage} • {rx.route} • {rx.frequency}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {onAddPrescriptionItem ? (
                            <button
                              type="button"
                              onClick={() => handlePrescribeDrug(rx)}
                              className={`touch-target min-h-[44px] inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-xs font-semibold cursor-pointer ${
                                alreadyPrescribed ? 'btn-tactile-clinical' : 'btn-tactile-primary'
                              }`}
                            >
                              <Icon name={alreadyPrescribed ? 'check' : 'add_circle'} className="text-sm" />
                              {alreadyPrescribed ? 'Adicionado à Receita' : 'Prescrever na Receita'}
                            </button>
                          ) : null}

                          {hasBic ? (
                            <button
                              type="button"
                              onClick={() => setOpenBicDrugId(isBicOpen ? null : rx.id)}
                              className={`touch-target min-h-[44px] inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1 text-xs font-semibold cursor-pointer ${
                                isBicOpen ? 'btn-tactile-primary' : 'btn-tactile-secondary'
                              }`}
                            >
                              <Icon name="calculate" className="text-sm" />
                              {isBicOpen ? 'Ocultar BIC' : 'Calcular BIC (mL/h)'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {rx.dilutionInstructions &&
                      rx.dilutionInstructions !== 'Não aplicável' ? (
                        <p className="text-[var(--ink-secondary)]">
                          <strong>Preparo / Diluição:</strong>{' '}
                          {rx.dilutionInstructions}
                        </p>
                      ) : null}
                      {rx.renalAdjustment ? (
                        <p className="text-[var(--ink-muted)]">
                          <strong>Ajuste Renal:</strong> {rx.renalAdjustment}
                        </p>
                      ) : null}
                      {rx.contraindications ? (
                        <p className="text-[var(--accent-amber)]">
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
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="sticky top-4 flex flex-col gap-3">
            <ScorePhysiologicalRadar
              axes={calculator.radarAxes}
              values={result.radarValues}
              severityLevel={activeTier.severityLevel}
              size={290}
            />

            <ScoreExportAndBedBridgeCard
              calculator={calculator}
              activeTier={activeTier}
              severityBadgeClasses={SEVERITY_BADGE_CLASSES}
              bedIdentifier={bedIdentifier}
              onBedIdentifierChange={onBedIdentifierChange}
              patientWeightKg={patientWeightKg}
              onWeightChange={onWeightChange}
              copyFeedback={copyFeedback}
              onCopyText={handleCopyText}
              onSendToA4Editor={onSendToA4Editor}
              onSendScoreToA4={handleSendScoreToA4}
              hospitalBeds={hospitalBeds}
              selectedHospitalBed={selectedHospitalBed}
              onSelectHospitalBed={onSelectHospitalBed}
              appendConductToBed={appendConductToBed}
              onToggleAppendConductToBed={setAppendConductToBed}
              onRecordScoreToBed={onRecordScoreToBed}
              onRecordScoreInHospitalBed={handleRecordScoreInHospitalBed}
              onNavigateToHospitalDashboard={onNavigateToHospitalDashboard}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
