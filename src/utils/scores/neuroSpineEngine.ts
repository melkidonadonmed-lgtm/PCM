import type {
  CalculationResult,
  Calculator,
  RiskSeverityLevel,
  RiskTier,
  ScoreInputRecord,
} from './scoreTypes';
import {
  extractNumeric,
  resolveCalcAndInputs,
  calculateLawtonYoung,
  PHASES_5_YEAR_RISK_MAP,
  calculatePhasesScore,
  calculateVasograde,
} from './neurovascularEngine';

export {
  extractNumeric,
  resolveCalcAndInputs,
  calculateLawtonYoung,
  PHASES_5_YEAR_RISK_MAP,
  calculatePhasesScore,
  calculateVasograde,
};

export function calculateSagittalBalance(
  calcOrInputs: Calculator | ScoreInputRecord,
  maybeInputs?: ScoreInputRecord
): CalculationResult {
  const { calc, inputs } = resolveCalcAndInputs(calcOrInputs, maybeInputs);

  const pi = extractNumeric(inputs, ['pi', 'PI', 'pelvic_incidence', 'pelvicIncidence', 'input_pi', 'grp_sagittal_pi', 'grp_sb_pi'], 53);
  const pt = extractNumeric(inputs, ['pt', 'PT', 'pelvic_tilt', 'pelvicTilt', 'input_pt', 'grp_sagittal_pt', 'grp_sb_pt'], 13);
  const ss = extractNumeric(inputs, ['ss', 'SS', 'sacral_slope', 'sacralSlope', 'input_ss', 'grp_sagittal_ss', 'grp_sb_ss'], 40);
  const ll = extractNumeric(inputs, ['ll', 'LL', 'lumbar_lordosis', 'lumbarLordosis', 'input_ll', 'grp_sagittal_ll', 'grp_sb_ll'], 53);
  const sva = extractNumeric(inputs, ['sva', 'SVA', 'sagittal_vertical_axis', 'sagittalVerticalAxis', 'input_sva', 'grp_sagittal_sva', 'grp_sb_sva'], 20);

  const geometricSum = pt + ss;
  const geometricDiff = Math.abs(pi - geometricSum);
  const isGeometricConsistent = Math.round(geometricDiff * 10) / 10 <= 3.0;

  const warnings: string[] = [];
  if (!isGeometricConsistent) {
    warnings.push(
      `Inconsistência geométrica espinopélvica: |PI - (PT + SS)| = ${geometricDiff.toFixed(1)}° > 3°. Pela identidade de Duval-Beaupère (PI = PT + SS), confirme a aferição radiográfica.`
    );
  }

  const mismatchPiLl = Math.round((pi - ll) * 10) / 10;
  const targetLordosisMin = Math.round((pi - 9) * 10) / 10;
  const targetLordosisMax = Math.round((pi + 9) * 10) / 10;
  const targetLordosisIdeal = Math.round((pi + 5) * 10) / 10;

  const schwabMismatchModifier =
    mismatchPiLl < 10 ? 'Schwab 0' : mismatchPiLl <= 20 ? 'Schwab +' : 'Schwab ++';
  const schwabPtModifier =
    pt < 20 ? 'Normal' : pt <= 30 ? 'Moderate' : 'Severe retroversion';
  const schwabSvaModifier =
    sva < 40 ? 'Normal' : sva <= 95 ? 'Moderate' : 'Severe';

  const isSevere = mismatchPiLl > 20 || pt > 30 || sva > 95;
  const isModerate = !isSevere && (mismatchPiLl >= 10 || pt >= 20 || sva >= 40);

  const activeSeverity: RiskSeverityLevel = isSevere
    ? 'critical'
    : isModerate
      ? 'intermediate'
      : 'low';
  const tierId = isSevere
    ? 'tier_sagittal_severe'
    : isModerate
      ? 'tier_sagittal_moderate'
      : 'tier_sagittal_normal';
  const tierLabel = isSevere
    ? 'Deformidade Sagital Grave (SRS-Schwab ++) - Indicação de Osteotomia de Três Colunas'
    : isModerate
      ? 'Desbalanço Sagital Moderado (SRS-Schwab +) - Indicação de Osteotomias de Smith-Petersen'
      : 'Balanço Sagital Preservado (SRS-Schwab 0) - Artrodese In Situ sem Osteotomia Maior';
  const tierColor = isSevere ? '#dc2626' : isModerate ? '#f59e0b' : '#10b981';
  const osteotomyRecommendation = isSevere
    ? 'Deformidade sagital rígida grave (SRS-Schwab ++). Indicação de Osteotomia de Subtração Pedicular (PSO / Schwab Grau III) em L3 ou L4 (ganho de 30° a 35° de lordose focal) associada a cages hiperlordóticos (ALIF/OLIF) ou VCR.'
    : isModerate
      ? 'Desbalanço sagital moderado (SRS-Schwab +). Indicação de Osteotomias de Smith-Petersen (SPO / Schwab Grau II) em múltiplos níveis (~5° a 10° por nível) associadas a cages intersomáticos lordóticos.'
      : 'Balanço sagital preservado (SRS-Schwab 0). Artrodese in situ sem necessidade de osteotomias maiores.';
  const statisticalOutcome = isSevere
    ? 'Desalinhamento sagital severo associado a incapacidade funcional grave (ODI > 40-50) e alto risco de pseudartrose/falha mecânica.'
    : isModerate
      ? 'Desbalanço compensado por retroversão pélvica; risco de sobrecarga degenerativa adjacente.'
      : 'Alinhamento espinopélvico e sagital fisiológico.';

  const matched = calc?.riskTiers?.find((t) => t.severityLevel === activeSeverity) ?? calc?.riskTiers?.[0];
  const activeRiskTier: RiskTier = matched
    ? {
        ...matched,
        statisticalOutcome: `${matched.statisticalOutcome} ${statisticalOutcome}`,
        nonPharmacologicalActions: [
          {
            id: 'action_sagittal_osteotomy',
            recommendationTitle: 'Recomendação de Osteotomia e Correção Sagital',
            dispositionTarget: isSevere ? 'Centro Cirúrgico / UTI de Coluna' : 'Centro Cirúrgico / Enfermaria Especializada',
            monitoringPlan: 'Espinografia perfil pré e pós-operatória com mensuração de PI-LL, PT e SVA.',
            interventionalProcedure: osteotomyRecommendation,
          },
          ...matched.nonPharmacologicalActions,
        ],
      }
    : {
        id: tierId,
        label: tierLabel,
        severityLevel: activeSeverity,
        minScore: isSevere ? 21 : isModerate ? 10 : -50,
        maxScore: isSevere ? 100 : isModerate ? 20 : 9.9,
        statisticalOutcome,
        colorHex: tierColor,
        pharmacologicalActions: [
          {
            id: 'rx_sagittal_analgesia',
            drugName: 'Cefazolina Sódica (Profilaxia Cirúrgica de Coluna)',
            dosage: '2 g IV na indução (3 g se peso > 120 kg), repique de 1 g a cada 4h intraoperatórias',
            route: 'Intravenosa',
            frequency: 'Dose única pré-incisão com repiques',
          },
        ],
        nonPharmacologicalActions: [
          {
            id: 'action_sagittal_osteotomy',
            recommendationTitle: 'Recomendação de Osteotomia e Correção Sagital',
            dispositionTarget: isSevere ? 'Centro Cirúrgico / UTI de Coluna' : 'Centro Cirúrgico / Enfermaria Especializada',
            monitoringPlan: 'Espinografia perfil pós-operatória imediata.',
            interventionalProcedure: osteotomyRecommendation,
          },
        ],
      };

  const radarValues: Record<string, number> = {};
  if (calc?.radarAxes) {
    for (const axis of calc.radarAxes) radarValues[axis.id] = 0;
  }
  const normPiLl = Math.min(1, Math.max(0, mismatchPiLl / 30));
  const normPt = Math.min(1, Math.max(0, (pt - 10) / 30));
  const normSva = Math.min(1, Math.max(0, sva / 120));
  radarValues.axis_pi_ll = normPiLl;
  radarValues.axis_sb_pi_ll = normPiLl;
  radarValues.axis_pt = normPt;
  radarValues.axis_sb_pt = normPt;
  radarValues.axis_sva = normSva;
  radarValues.axis_sb_sva = normSva;
  radarValues.axis_sagittal_deformity = isSevere ? 1.0 : isModerate ? 0.6 : 0.1;

  const scoreFormatted = `${mismatchPiLl >= 0 ? '+' : ''}${mismatchPiLl.toFixed(1)}° (${schwabMismatchModifier}, PT: ${schwabPtModifier}, SVA: ${schwabSvaModifier}; Alvo: ${targetLordosisMin}° a ${targetLordosisMax}°, ideal: ${targetLordosisIdeal}°)`;
  if (calc?.clinicalWarning && !warnings.includes(calc.clinicalWarning)) {
    warnings.push(calc.clinicalWarning);
  }

  return {
    score: mismatchPiLl,
    rawScore: mismatchPiLl,
    scoreFormatted,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning: calc?.clinicalWarning,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function calculateNomsFramework(
  calcOrInputs: Calculator | ScoreInputRecord,
  maybeInputs?: ScoreInputRecord
): CalculationResult {
  const { calc, inputs } = resolveCalcAndInputs(calcOrInputs, maybeInputs);

  let bilskyStr = '0';
  const neuroVal = inputs.neurologic ?? inputs.bilsky ?? inputs.escc ?? inputs.grp_noms_neurologic ?? inputs.grp_noms_neuro ?? inputs.bilskyGrade;
  if (typeof neuroVal === 'string') {
    const match = neuroVal.match(/(0|1a|1b|1c|2|3)/i);
    if (match) bilskyStr = match[1].toLowerCase();
  } else if (typeof neuroVal === 'number') {
    bilskyStr = neuroVal.toString();
  } else {
    for (const b of ['3', '2', '1c', '1b', '1a', '0']) {
      if (inputs[`opt_bilsky_${b}`] || inputs[`bilsky_${b}`]) {
        bilskyStr = b;
        break;
      }
    }
  }
  const isHighGradeBilsky = bilskyStr === '2' || bilskyStr === '3';

  let isRadiosensitive = false;
  const oncoVal = inputs.oncologic ?? inputs.radiosensitivity ?? inputs.histology ?? inputs.grp_noms_oncologic ?? inputs.grp_noms_onco;
  if (typeof oncoVal === 'string') {
    const lower = oncoVal.toLowerCase();
    isRadiosensitive =
      lower.includes('sens') ||
      lower.includes('mieloma') ||
      lower.includes('myeloma') ||
      lower.includes('linfoma') ||
      lower.includes('lymphoma') ||
      lower.includes('pequenas') ||
      lower.includes('small') ||
      lower.includes('seminoma');
  } else if (typeof oncoVal === 'boolean') {
    isRadiosensitive = oncoVal;
  } else if (inputs.opt_radiosensitive || inputs.opt_onco_sens || inputs.radiosensitive === true) {
    isRadiosensitive = true;
  }

  let mechanicalCategory: 'stable' | 'potentially_unstable' | 'unstable' = 'stable';
  const mechVal = inputs.mechanical ?? inputs.sins ?? inputs.sins_score ?? inputs.grp_noms_mechanical ?? inputs.grp_noms_mech;
  if (typeof mechVal === 'number') {
    mechanicalCategory = mechVal >= 13 ? 'unstable' : mechVal >= 7 ? 'potentially_unstable' : 'stable';
  } else if (typeof mechVal === 'string') {
    const lower = mechVal.toLowerCase();
    if (lower.includes('poten') || lower.includes('_pot')) mechanicalCategory = 'potentially_unstable';
    else if (lower.includes('unstable') || lower.includes('instab') || lower.includes('_unst')) mechanicalCategory = 'unstable';
  } else if (inputs.opt_sins_unstable || inputs.opt_noms_sins_unst || inputs.unstable === true) {
    mechanicalCategory = 'unstable';
  } else if (inputs.opt_sins_potentially_unstable || inputs.opt_noms_sins_pot) {
    mechanicalCategory = 'potentially_unstable';
  }

  let isSystemicEligible = true;
  const sysVal = inputs.systemic ?? inputs.kps ?? inputs.kps_score ?? inputs.grp_noms_systemic ?? inputs.grp_noms_syst ?? inputs.eligibility;
  if (typeof sysVal === 'number') {
    isSystemicEligible = sysVal >= 70;
  } else if (typeof sysVal === 'boolean') {
    isSystemicEligible = sysVal;
  } else if (typeof sysVal === 'string') {
    const lower = sysVal.toLowerCase();
    if (lower.includes('unfit') || lower.includes('ineligible') || lower.includes('terminal') || lower.includes('hospice') || lower.includes('desfavoravel')) {
      isSystemicEligible = false;
    }
  } else if (inputs.opt_kps_lt70 || inputs.opt_syst_unfit || inputs.ineligible === true || inputs.terminal === true) {
    isSystemicEligible = false;
  }

  let pathwayName: string;
  let pathwayTitle: string;
  let severityLevel: RiskSeverityLevel;
  let tierId: string;
  let tierColor: string;
  let recommendation: string;
  let statisticalOutcome: string;
  let rawScore: number;

  if (!isSystemicEligible) {
    pathwayName = 'Palliative Hospice';
    pathwayTitle = 'Cuidados Paliativos / Radioterapia de Curso Curto (Palliative Hospice)';
    severityLevel = 'low';
    tierId = 'tier_noms_palliative';
    tierColor = '#6b7280';
    rawScore = 1;
    recommendation = 'Status de performance fragilizado (KPS < 70%). Indicação de Radioterapia Paliativa (8 Gy fração única ou 20 Gy/5 frações) + Dexametasona e controle álgico.';
    statisticalOutcome = 'Prioridade para conforto e prevenção de futilidade cirúrgica.';
  } else if (isHighGradeBilsky && !isRadiosensitive) {
    pathwayName = 'Separation Surgery + SBRT';
    pathwayTitle = 'Cirurgia de Separação + SBRT Pós-Operatória (Separation Surgery + SBRT)';
    severityLevel = 'critical';
    tierId = 'tier_noms_separation_sbrt';
    tierColor = '#dc2626';
    rawScore = 4;
    recommendation = 'Indicação Cirúrgica Mandatória de Cirurgia de Separação (descompressão circunferencial de 2-3 mm ao redor do saco dural + artrodese pedicular) seguida de SBRT (18-24 Gy).';
    statisticalOutcome = 'Controle local > 85-90% em 1 ano com preservação neurológica.';
  } else if (isHighGradeBilsky && isRadiosensitive) {
    pathwayName = 'cEBRT alone';
    pathwayTitle = mechanicalCategory === 'unstable'
      ? 'Radioterapia Convencional de Urgência + Estabilização Cirúrgica (cEBRT + Stabilization)'
      : 'Radioterapia Externa Convencional Exclusiva (cEBRT alone)';
    severityLevel = mechanicalCategory === 'unstable' ? 'high' : 'intermediate';
    tierId = mechanicalCategory === 'unstable' ? 'tier_noms_cebrt_stabilization' : 'tier_noms_cebrt_alone';
    tierColor = mechanicalCategory === 'unstable' ? '#ef4444' : '#f59e0b';
    rawScore = mechanicalCategory === 'unstable' ? 3 : 2;
    recommendation = mechanicalCategory === 'unstable'
      ? 'cEBRT de urgência (30 Gy/10 frações) + Dexametasona IV associada a Estabilização Cirúrgica Instrumentada pela instabilidade mecânica (SINS >= 13).'
      : 'Tumor radiossensível com coluna estável: cEBRT de urgência (30 Gy/10 frações) + corticoterapia sem necessidade de cirurgia aberta.';
    statisticalOutcome = 'Resposta descompressiva > 80-90% pela alta radiossensibilidade celular.';
  } else if (mechanicalCategory === 'unstable' || mechanicalCategory === 'potentially_unstable') {
    pathwayName = 'Percutaneous Stabilization';
    pathwayTitle = 'Estabilização Percutânea / Cifoplastia ± SBRT (Percutaneous Stabilization)';
    severityLevel = mechanicalCategory === 'unstable' ? 'high' : 'intermediate';
    tierId = 'tier_noms_percutaneous';
    tierColor = '#f97316';
    rawScore = 3;
    recommendation = 'Instabilidade mecânica tumoral sem compressão medular crítica: Estabilização Percutânea ou Cifoplastia associada a SBRT/cEBRT.';
    statisticalOutcome = 'Alívio álgico imediato (> 85%) e prevenção de colapso vertebral.';
  } else {
    pathwayName = isRadiosensitive ? 'cEBRT alone' : 'Primary SBRT';
    pathwayTitle = isRadiosensitive ? 'Radioterapia Convencional Eletiva (cEBRT alone)' : 'SBRT Primária Isolada (Primary SBRT)';
    severityLevel = isRadiosensitive ? 'low' : 'intermediate';
    tierId = isRadiosensitive ? 'tier_noms_cebrt_elective' : 'tier_noms_primary_sbrt';
    tierColor = isRadiosensitive ? '#10b981' : '#3b82f6';
    rawScore = 2;
    recommendation = isRadiosensitive
      ? 'cEBRT eletiva (20-30 Gy) e continuidade de terapia sistêmica.'
      : 'SBRT Primária Isolada (24-30 Gy em 3-5 frações) sem necessidade de cirurgia.';
    statisticalOutcome = 'Controle local de 90-95% com mínima toxicidade.';
  }

  const matched = calc?.riskTiers?.find((t) => t.severityLevel === severityLevel) ?? calc?.riskTiers?.[0];
  const activeRiskTier: RiskTier = matched
    ? {
        ...matched,
        label: `${matched.label}: ${pathwayTitle}`,
        statisticalOutcome: `${matched.statisticalOutcome} ${statisticalOutcome}`,
      }
    : {
        id: tierId,
        label: pathwayTitle,
        severityLevel,
        minScore: 1,
        maxScore: 4,
        statisticalOutcome,
        colorHex: tierColor,
        pharmacologicalActions: [
          {
            id: 'rx_noms_dexamethasone',
            drugName: 'Dexametasona (Controle de Edema Medular)',
            dosage: isHighGradeBilsky ? '10 a 16 mg IV em bolus + 4 mg IV/VO 6/6h' : '4 mg VO 12/12h',
            route: 'Intravenosa / Oral',
            frequency: '6/6h a 12/12h',
          },
        ],
        nonPharmacologicalActions: [
          {
            id: 'action_noms_pathway',
            recommendationTitle: pathwayTitle,
            dispositionTarget: severityLevel === 'critical' ? 'Centro Cirúrgico / UTI' : 'Radioterapia / Oncologia',
            monitoringPlan: 'Vigilância neurológica seriada.',
            interventionalProcedure: recommendation,
          },
        ],
      };

  const radarValues: Record<string, number> = {};
  if (calc?.radarAxes) {
    for (const axis of calc.radarAxes) radarValues[axis.id] = 0;
  }
  radarValues.axis_noms_neuro = bilskyStr === '3' ? 1.0 : bilskyStr === '2' ? 0.8 : bilskyStr === '1c' ? 0.6 : 0.2;
  radarValues.axis_noms_onco = isRadiosensitive ? 0.2 : 0.9;
  radarValues.axis_noms_mech = mechanicalCategory === 'unstable' ? 1.0 : mechanicalCategory === 'potentially_unstable' ? 0.6 : 0.1;
  radarValues.axis_noms_sys = isSystemicEligible ? 0.1 : 0.9;
  radarValues.axis_noms_syst = isSystemicEligible ? 0.1 : 0.9;

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: `${pathwayName} (Bilsky ${bilskyStr} / ${isRadiosensitive ? 'Sensível' : 'Resistente'} / SINS ${mechanicalCategory})`,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning: calc?.clinicalWarning,
    warnings: calc?.clinicalWarning ? [calc.clinicalWarning] : undefined,
  };
}
