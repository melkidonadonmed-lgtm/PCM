import type {
  CalculationResult,
  Calculator,
  ParameterGroup,
  ParameterOption,
  RiskTier,
  ScoreInputRecord,
} from './scoreTypes';
import {
  SSC_2021_QSOFA_WARNING,
  calculateQsofa,
  calculateFullSofa,
  calculateWellsPe,
} from './clinicalSpecialtyScores';
import {
  calculateSagittalBalance,
  calculateNomsFramework,
  calculateLawtonYoung,
  calculatePhasesScore,
  calculateVasograde,
} from './neuroSpineEngine';

export {
  SSC_2021_QSOFA_WARNING,
  calculateQsofa,
  calculateFullSofa,
  calculateWellsPe,
  calculateSagittalBalance,
  calculateNomsFramework,
  calculateLawtonYoung,
  calculatePhasesScore,
  calculateVasograde,
};

/**
 * Executa o cálculo determinístico para qualquer definição `Calculator` das 114 monografias.
 */
export function calculateScore(
  calculator: Calculator,
  inputs: ScoreInputRecord = {}
): CalculationResult {
  const rawBaseScore = calculator.baseScore ?? 0;
  let rawScore = typeof rawBaseScore === 'number' ? rawBaseScore : Number(rawBaseScore) || 0;
  const radarValues: Record<string, number> = {};

  for (const axis of calculator.radarAxes) {
    radarValues[axis.id] = 0;
  }

  if (calculator.id === 'calc_glasgow_p' || calculator.slug === 'glasgow-p') {
    return calculateGlasgowPFromCalculator(calculator, inputs);
  }

  if (
    calculator.id === 'calc_sagittal_balance' ||
    calculator.slug === 'balanco-sagital' ||
    calculator.slug === 'sagittal-balance' ||
    calculator.id === 'calc_spinopelvic_balance'
  ) {
    return calculateSagittalBalance(calculator, inputs);
  }

  if (
    calculator.id === 'calc_noms' ||
    calculator.id === 'calc_noms_bilsky' ||
    calculator.slug === 'noms' ||
    calculator.slug === 'noms-bilsky' ||
    calculator.slug === 'noms-framework'
  ) {
    return calculateNomsFramework(calculator, inputs);
  }

  if (
    calculator.id === 'calc_lawton_young' ||
    calculator.slug === 'lawton-young' ||
    calculator.slug === 'spetzler-martin-suplementar' ||
    calculator.id === 'calc_spetzler_martin_suplementar'
  ) {
    return calculateLawtonYoung(calculator, inputs);
  }

  if (
    calculator.id === 'calc_phases' ||
    calculator.id === 'calc_phases_score' ||
    calculator.slug === 'phases' ||
    calculator.slug === 'phases-score'
  ) {
    return calculatePhasesScore(calculator, inputs);
  }

  if (
    calculator.id === 'calc_vasograde' ||
    calculator.slug === 'vasograde' ||
    calculator.slug === 'vasograde-dci'
  ) {
    return calculateVasograde(calculator, inputs);
  }

  const mappedAxisIds = new Set<string>();
  let maxOptionNorm = 0;

  for (const group of calculator.parameterGroups) {
    const selectedOption = resolveSelectedOption(group, inputs);

    if (selectedOption) {
      rawScore += selectedOption.pointValue;
      const optNorm = Math.min(1, Math.max(0, selectedOption.radarNormalizedValue ?? 0));
      maxOptionNorm = Math.max(maxOptionNorm, optNorm);
      if (group.radarAxisId) {
        mappedAxisIds.add(group.radarAxisId);
        radarValues[group.radarAxisId] = Math.max(
          radarValues[group.radarAxisId] ?? 0,
          optNorm
        );
      }
    } else {
      const numericVal = resolveNumericInputValue(group, inputs);
      if (numericVal !== undefined) {
        rawScore += numericVal;
        if (group.maxAxisValue > group.normalBaselineValue) {
          const norm = Math.min(
            1,
            Math.max(
              0,
              (numericVal - group.normalBaselineValue) /
                (group.maxAxisValue - group.normalBaselineValue)
            )
          );
          maxOptionNorm = Math.max(maxOptionNorm, norm);
          if (group.radarAxisId) {
            mappedAxisIds.add(group.radarAxisId);
            radarValues[group.radarAxisId] = Math.max(
              radarValues[group.radarAxisId] ?? 0,
              norm
            );
          }
        }
      }
    }
  }

  for (const axis of calculator.radarAxes) {
    if (!mappedAxisIds.has(axis.id)) {
      radarValues[axis.id] = maxOptionNorm;
    }
  }

  if (calculator.minPossibleScore !== undefined && rawScore < calculator.minPossibleScore) {
    rawScore = calculator.minPossibleScore;
  }
  if (calculator.maxPossibleScore !== undefined && rawScore > calculator.maxPossibleScore) {
    rawScore = calculator.maxPossibleScore;
  }

  const activeRiskTier = matchRiskTier(calculator.riskTiers, rawScore);
  const warnings: string[] = [];

  let sscWarning: string | undefined;
  if (
    calculator.ssc2021Warning ||
    calculator.id === 'calc_qsofa' ||
    calculator.slug === 'qsofa'
  ) {
    sscWarning = SSC_2021_QSOFA_WARNING;
    warnings.push(SSC_2021_QSOFA_WARNING);
  }

  const clinicalWarning = calculator.clinicalWarning;
  if (clinicalWarning && !warnings.includes(clinicalWarning)) {
    warnings.push(clinicalWarning);
  }

  const scoreFormatted = Number.isInteger(rawScore)
    ? rawScore.toString()
    : rawScore.toFixed(1);

  return {
    score: rawScore,
    rawScore,
    scoreFormatted,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning,
    sscWarning,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function resolveSelectedOption(
  group: ParameterGroup,
  inputs: ScoreInputRecord
): ParameterOption | undefined {
  const inputValue = inputs[group.id] ?? inputs[group.slug];

  if (typeof inputValue === 'string') {
    const match = group.options.find((opt) => opt.id === inputValue);
    if (match) return match;
  }

  if (typeof inputValue === 'boolean') {
    if (inputValue) {
      return (
        group.options.find((opt) => opt.pointValue > 0 || !opt.isNormalBaseline) ??
        group.options[group.options.length - 1]
      );
    }
    return (
      group.options.find((opt) => opt.isNormalBaseline || opt.pointValue === 0) ??
      group.options[0]
    );
  }

  if (typeof inputValue === 'number') {
    const pointMatch = group.options.find((opt) => opt.pointValue === inputValue);
    if (pointMatch) return pointMatch;
  }

  for (const opt of group.options) {
    if (inputs[opt.id] === true) {
      return opt;
    }
  }

  return group.options.find((opt) => opt.isNormalBaseline) ?? group.options[0];
}

function resolveNumericInputValue(
  group: ParameterGroup,
  inputs: ScoreInputRecord
): number | undefined {
  const val = inputs[group.id] ?? inputs[group.slug];
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return val;
  }
  return undefined;
}

export function matchRiskTier(riskTiers: RiskTier[], score: number): RiskTier {
  if (riskTiers.length === 0) {
    throw new Error('Calculator does not have any risk tiers defined.');
  }

  const matched = riskTiers.find(
    (tier) => score >= tier.minScore && score <= tier.maxScore
  );
  if (matched) {
    return matched;
  }

  for (let i = 0; i < riskTiers.length; i += 1) {
    const tier = riskTiers[i];
    const nextTier = riskTiers[i + 1];
    if (score >= tier.minScore && nextTier && score < nextTier.minScore) {
      return tier;
    }
  }

  if (score < riskTiers[0].minScore) {
    return riskTiers[0];
  }
  return riskTiers[riskTiers.length - 1];
}

function calculateGlasgowPFromCalculator(
  calculator: Calculator,
  inputs: ScoreInputRecord
): CalculationResult {
  const radarValues: Record<string, number> = {};
  for (const axis of calculator.radarAxes) {
    radarValues[axis.id] = 0;
  }

  let eyeScore = 4;
  let verbScore = 5;
  let motScore = 6;
  let pupilSubtract = 0;

  for (const group of calculator.parameterGroups) {
    const option = resolveSelectedOption(group, inputs);
    if (!option) continue;

    if (group.radarAxisId) {
      radarValues[group.radarAxisId] = option.radarNormalizedValue;
    }

    if (group.id.includes('eye') || group.slug.includes('ocular')) {
      eyeScore = option.pointValue;
    } else if (group.id.includes('verb') || group.slug.includes('verbal')) {
      verbScore = option.pointValue;
    } else if (group.id.includes('mot') || group.slug.includes('motora')) {
      motScore = option.pointValue;
    } else if (group.id.includes('pup') || group.slug.includes('pupil')) {
      pupilSubtract = option.pointValue;
    }
  }

  const gcs = eyeScore + verbScore + motScore;
  const rawScore = Math.max(1, Math.min(15, gcs - pupilSubtract));
  const activeRiskTier = matchRiskTier(calculator.riskTiers, rawScore);

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: rawScore.toString(),
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning: calculator.clinicalWarning,
    warnings: calculator.clinicalWarning ? [calculator.clinicalWarning] : undefined,
  };
}
