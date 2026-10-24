import type { CalculationResult, RiskTier } from './scoreTypes';

export const SSC_2021_QSOFA_WARNING =
  'O Surviving Sepsis Campaign (SSC 2021) desaconselha formalmente o uso isolado do qSOFA como ferramenta única de triagem ou exclusão de sepse, devido à sua sensibilidade insuficiente (< 60%). Pacientes sépticos graves podem apresentar qSOFA de 0 ou 1 ponto. Recomenda-se a triagem multimodal associando critérios de SIRS, NEWS ou MEWS, e o cálculo obrigatório do SOFA completo diante de qualquer suspeita clínica persistente.';

export interface QsofaInputs {
  respiratoryRateGte22?: boolean;
  gcsLessThan15?: boolean;
  sbpLte100?: boolean;
  respiratoryRate?: number;
  gcs?: number;
  sbp?: number;
}

export interface QsofaResult {
  score: number;
  isHighRisk: boolean;
  riskStratification: string;
  mortalityEstimate: string;
  sscWarning: string;
  warnings: string[];
  criteria: {
    respiratoryRateGte22: boolean;
    gcsLessThan15: boolean;
    sbpLte100: boolean;
  };
}

export function calculateQsofa(inputs: QsofaInputs): QsofaResult {
  const respGte22 =
    inputs.respiratoryRateGte22 ??
    (inputs.respiratoryRate !== undefined ? inputs.respiratoryRate >= 22 : false);
  const gcsLt15 =
    inputs.gcsLessThan15 ??
    (inputs.gcs !== undefined ? inputs.gcs < 15 : false);
  const sbpLte100 =
    inputs.sbpLte100 ??
    (inputs.sbp !== undefined ? inputs.sbp <= 100 : false);

  let score = 0;
  if (respGte22) score += 1;
  if (gcsLt15) score += 1;
  if (sbpLte100) score += 1;

  const isHighRisk = score >= 2;
  return {
    score,
    isHighRisk,
    riskStratification: isHighRisk
      ? 'Alto Risco de Sepse / Deterioração Aguda (2 a 3 pontos)'
      : 'Baixo Risco pelo qSOFA (0 a 1 ponto)',
    mortalityEstimate: isHighRisk
      ? 'Mortalidade intra-hospitalar estimada entre 10% e 25% (aumento de 3 a 14 vezes). Acionar Protocolo de Sepse 1h.'
      : 'Mortalidade intra-hospitalar estimada < 3%. Não exclui sepse: manter monitorização clínica seriada.',
    sscWarning: SSC_2021_QSOFA_WARNING,
    warnings: [SSC_2021_QSOFA_WARNING],
    criteria: {
      respiratoryRateGte22: respGte22,
      gcsLessThan15: gcsLt15,
      sbpLte100,
    },
  };
}

export interface SofaInputs {
  pao2Fio2Ratio: number;
  onMechanicalVentilation: boolean;
  plateletsThousands: number;
  bilirubinMgDl: number;
  mapMmHg: number;
  vasopressorSupport: 'none' | 'dopamine_low_or_dobutamine' | 'epi_norepi_low' | 'epi_norepi_high';
  glasgowComaScale: number;
  creatinineMgDl: number;
  urineOutputMlDay?: number;
}

export function calculateFullSofa(inputs: SofaInputs): CalculationResult {
  const respPoints =
    inputs.pao2Fio2Ratio < 100 && inputs.onMechanicalVentilation ? 4
      : inputs.pao2Fio2Ratio < 200 && inputs.onMechanicalVentilation ? 3
      : inputs.pao2Fio2Ratio < 300 ? 2
      : inputs.pao2Fio2Ratio < 400 ? 1 : 0;

  const coagPoints =
    inputs.plateletsThousands < 20 ? 4
      : inputs.plateletsThousands < 50 ? 3
      : inputs.plateletsThousands < 100 ? 2
      : inputs.plateletsThousands < 150 ? 1 : 0;

  const liverPoints =
    inputs.bilirubinMgDl >= 12.0 ? 4
      : inputs.bilirubinMgDl >= 6.0 ? 3
      : inputs.bilirubinMgDl >= 2.0 ? 2
      : inputs.bilirubinMgDl >= 1.2 ? 1 : 0;

  const cvPoints =
    inputs.vasopressorSupport === 'epi_norepi_high' ? 4
      : inputs.vasopressorSupport === 'epi_norepi_low' ? 3
      : inputs.vasopressorSupport === 'dopamine_low_or_dobutamine' ? 2
      : inputs.mapMmHg < 70 ? 1 : 0;

  const cnsPoints =
    inputs.glasgowComaScale < 6 ? 4
      : inputs.glasgowComaScale <= 9 ? 3
      : inputs.glasgowComaScale <= 12 ? 2
      : inputs.glasgowComaScale <= 14 ? 1 : 0;

  const renalPoints =
    inputs.creatinineMgDl >= 5.0 || (inputs.urineOutputMlDay !== undefined && inputs.urineOutputMlDay < 200) ? 4
      : inputs.creatinineMgDl >= 3.5 || (inputs.urineOutputMlDay !== undefined && inputs.urineOutputMlDay < 500) ? 3
      : inputs.creatinineMgDl >= 2.0 ? 2
      : inputs.creatinineMgDl >= 1.2 ? 1 : 0;

  const rawScore = respPoints + coagPoints + liverPoints + cvPoints + cnsPoints + renalPoints;
  const severityLevel = rawScore <= 1 ? 'low' : rawScore <= 6 ? 'intermediate' : rawScore <= 11 ? 'high' : 'critical';

  const activeRiskTier: RiskTier = {
    id: `tier_sofa_${severityLevel}`,
    label:
      rawScore <= 1
        ? 'Sem Disfunção Orgânica Significativa (0-1 pt)'
        : rawScore <= 6
          ? 'Disfunção Orgânica Estabelecida — Critério Sepsis-3 Positivo (2-6 pts)'
          : rawScore <= 11
            ? 'Disfunção de Múltiplos Órgãos Grave (7-11 pts)'
            : 'Falência Orgânica Multissistêmica Crítica (>= 12 pts)',
    severityLevel,
    minScore: rawScore <= 1 ? 0 : rawScore <= 6 ? 2 : rawScore <= 11 ? 7 : 12,
    maxScore: rawScore <= 1 ? 1 : rawScore <= 6 ? 6 : rawScore <= 11 ? 11 : 24,
    statisticalOutcome:
      rawScore <= 1
        ? 'Mortalidade na UTI < 3%.'
        : rawScore <= 6
          ? 'Mortalidade estimada entre 10% e 20%. Delta SOFA >= 2 define Sepse.'
          : rawScore <= 11
            ? 'Mortalidade estimada entre 40% e 50%.'
            : 'Mortalidade estimada > 80%.',
    colorHex: rawScore <= 1 ? '#10b981' : rawScore <= 6 ? '#f59e0b' : '#ef4444',
    pharmacologicalActions: [],
    nonPharmacologicalActions: [
      {
        id: 'nonrx_sofa_1',
        recommendationTitle: 'Suporte Orgânico Guiado por Metas',
        dispositionTarget: rawScore >= 2 ? 'Unidade de Terapia Intensiva (UTI)' : 'Enfermaria / Observação',
        monitoringPlan: 'Monitorização de PAM >= 65 mmHg, diurese >= 0,5 mL/kg/h e clearance de lactato.',
      },
    ],
  };

  const radarValues: Record<string, number> = {
    axis_sofa_resp: respPoints / 4,
    axis_sofa_coag: coagPoints / 4,
    axis_sofa_liver: liverPoints / 4,
    axis_sofa_cv: cvPoints / 4,
    axis_sofa_cns: cnsPoints / 4,
    axis_sofa_renal: renalPoints / 4,
  };

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: `${rawScore} pts`,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
  };
}

export interface WellsPeInputs {
  clinicalSignsDvt: boolean;
  peMostLikelyDiagnosis: boolean;
  heartRateOver100: boolean;
  immobilizationOrSurgery4Weeks: boolean;
  previousDvtOrPe: boolean;
  hemoptysis: boolean;
  activeMalignancy: boolean;
}

export function calculateWellsPe(inputs: WellsPeInputs): CalculationResult {
  const rawScore =
    (inputs.clinicalSignsDvt ? 3.0 : 0) +
    (inputs.peMostLikelyDiagnosis ? 3.0 : 0) +
    (inputs.heartRateOver100 ? 1.5 : 0) +
    (inputs.immobilizationOrSurgery4Weeks ? 1.5 : 0) +
    (inputs.previousDvtOrPe ? 1.5 : 0) +
    (inputs.hemoptysis ? 1.0 : 0) +
    (inputs.activeMalignancy ? 1.0 : 0);

  const isLikely = rawScore > 4.0;
  const severityLevel = rawScore <= 1.5 ? 'low' : rawScore <= 6.0 ? 'intermediate' : 'critical';

  const activeRiskTier: RiskTier = {
    id: `tier_wells_pe_${severityLevel}`,
    label:
      rawScore <= 1.5
        ? 'Baixa Probabilidade Clínica — TEP Improvável (<= 1,5 pts)'
        : rawScore <= 4.0
          ? 'Probabilidade Intermediária — TEP Improvável (2,0 a 4,0 pts)'
          : rawScore <= 6.0
            ? 'Probabilidade Intermediária-Alta — TEP Provável (4,5 a 6,0 pts)'
            : 'Alta Probabilidade Clínica — TEP Provável (>= 6,5 pts)',
    severityLevel,
    minScore: rawScore <= 1.5 ? 0 : rawScore <= 6.0 ? 2 : 6.5,
    maxScore: rawScore <= 1.5 ? 1.5 : rawScore <= 6.0 ? 6.0 : 12.5,
    statisticalOutcome: isLikely
      ? 'TEP Provável (> 4 pts): D-dímero NÃO exclui TEP; realizar Angio-TC de artérias pulmonares imediatamente.'
      : 'TEP Improvável (<= 4 pts): avaliar regra PERC ou solicitar D-dímero ajustado pela idade.',
    colorHex: rawScore <= 1.5 ? '#10b981' : isLikely ? '#ef4444' : '#f59e0b',
    pharmacologicalActions: [],
    nonPharmacologicalActions: [],
  };

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: rawScore.toFixed(1),
    activeRiskTier,
    radarValues: {},
  };
}
