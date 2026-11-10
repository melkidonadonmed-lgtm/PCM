import type {
  CalculationResult,
  Calculator,
  RiskSeverityLevel,
  RiskTier,
  ScoreInputRecord,
} from './scoreTypes';

export function extractNumeric(
  inputs: ScoreInputRecord,
  keys: string[],
  fallback: number
): number {
  for (const k of keys) {
    const val = inputs[k];
    if (val !== undefined && val !== '') {
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      if (!Number.isNaN(num)) return num;
    }
  }
  return fallback;
}

export function resolveCalcAndInputs(
  calcOrInputs: Calculator | ScoreInputRecord,
  maybeInputs?: ScoreInputRecord
): { calc: Calculator | undefined; inputs: ScoreInputRecord } {
  if (maybeInputs !== undefined) {
    return { calc: calcOrInputs as Calculator, inputs: maybeInputs };
  }
  if (
    calcOrInputs &&
    typeof calcOrInputs === 'object' &&
    'parameterGroups' in calcOrInputs &&
    Array.isArray((calcOrInputs as Calculator).parameterGroups)
  ) {
    return { calc: calcOrInputs as Calculator, inputs: {} };
  }
  return { calc: undefined, inputs: (calcOrInputs as ScoreInputRecord) || {} };
}

export function calculateLawtonYoung(
  calcOrInputs: Calculator | ScoreInputRecord,
  maybeInputs?: ScoreInputRecord
): CalculationResult {
  const { calc, inputs } = resolveCalcAndInputs(calcOrInputs, maybeInputs);

  let smScore = 1;
  const directSm = inputs.spetzlerMartin ?? inputs.smScore ?? inputs.spetzler_martin ?? inputs.sm ?? inputs.grp_ly_sm;
  if (typeof directSm === 'number' && directSm >= 1 && directSm <= 5) {
    smScore = Math.round(directSm);
  } else if (typeof directSm === 'string') {
    const match = directSm.match(/[1-5]/);
    if (match) smScore = parseInt(match[0], 10);
  } else {
    const sizeVal = inputs.sm_size ?? inputs.size ?? inputs.grp_sm_size;
    const sizePts = typeof sizeVal === 'number'
      ? (sizeVal > 6 ? 3 : sizeVal >= 3 ? 2 : 1)
      : typeof sizeVal === 'string' && (sizeVal.includes('>6') || sizeVal.includes('large'))
        ? 3
        : typeof sizeVal === 'string' && (sizeVal.includes('3-6') || sizeVal.includes('medium'))
          ? 2
          : inputs.opt_sm_size_large ? 3 : inputs.opt_sm_size_medium ? 2 : 1;
    const eloqPts = inputs.sm_eloquence === true || inputs.eloquence === true || inputs.opt_sm_eloq_yes ? 1 : 0;
    const drainPts = inputs.sm_drainage === true || inputs.deep_drainage === true || inputs.opt_sm_drain_deep ? 1 : 0;
    smScore = Math.max(1, Math.min(5, sizePts + eloqPts + drainPts));
  }

  let agePts = 2;
  const ageVal = inputs.age ?? inputs.lawton_age ?? inputs.grp_lawton_age ?? inputs.grp_ly_age;
  if (typeof ageVal === 'number') {
    agePts = ageVal > 40 ? 3 : ageVal >= 20 ? 2 : 1;
  } else if (typeof ageVal === 'string') {
    if (ageVal.includes('>40') || ageVal.includes('gt40')) agePts = 3;
    else if (ageVal.includes('<20') || ageVal.includes('lt20')) agePts = 1;
  } else if (inputs.opt_lawton_age_gt40 || inputs.opt_ly_age_gt40) {
    agePts = 3;
  } else if (inputs.opt_lawton_age_lt20 || inputs.opt_ly_age_lt20) {
    agePts = 1;
  }

  let bleedPts = 0;
  const bleedVal = inputs.unruptured ?? inputs.ruptured ?? inputs.bleed ?? inputs.grp_lawton_bleed ?? inputs.grp_ly_bleed ?? inputs.grp_ly_rupture;
  if (typeof bleedVal === 'boolean') {
    bleedPts = inputs.unruptured !== undefined ? (inputs.unruptured ? 1 : 0) : (bleedVal ? 0 : 1);
  } else if (typeof bleedVal === 'string') {
    const lower = bleedVal.toLowerCase();
    bleedPts = lower.includes('unruptured') || lower.includes('nao_roto') || lower.includes('bleed_no') || lower.includes('rup_no') ? 1 : 0;
  } else if (inputs.opt_lawton_bleed_no || inputs.opt_lawton_unruptured || inputs.opt_ly_bleed_no) {
    bleedPts = 1;
  }

  let compactPts = 0;
  const compactVal = inputs.compactness ?? inputs.nidus ?? inputs.diffuse ?? inputs.grp_lawton_compactness ?? inputs.grp_ly_compact;
  if (typeof compactVal === 'boolean') {
    compactPts = compactVal ? 1 : 0;
  } else if (typeof compactVal === 'string') {
    const lower = compactVal.toLowerCase();
    compactPts = lower.includes('diffuse') || lower.includes('difuso') || lower.includes('compact_no') || lower.includes('comp_diffuse') ? 1 : 0;
  } else if (inputs.opt_lawton_diffuse || inputs.opt_ly_compact_no) {
    compactPts = 1;
  }

  const lyScore = agePts + bleedPts + compactPts;
  const rawScore = smScore + lyScore;
  const severityLevel: RiskSeverityLevel = rawScore <= 4 ? 'low' : rawScore <= 6 ? 'intermediate' : 'critical';
  const tierLabel = rawScore <= 4
    ? 'Baixa Complexidade Cirúrgica / Baixo Risco (2 a 4 pontos)'
    : rawScore <= 6
      ? 'Complexidade Cirúrgica Intermediária / Caso Limítrofe (5 a 6 pontos)'
      : 'Alta Complexidade / Risco Cirúrgico Proibitivo (7 a 10 pontos)';
  const statisticalOutcome = rawScore <= 4
    ? 'Taxa de déficit permanente < 3-5%; cura microcirúrgica > 95%.'
    : rawScore <= 6
      ? 'Taxa de novos déficits permanentes de 10% a 25%.'
      : 'Risco de morbidade permanente > 35-50% (Manejo ARUBA / Radiocirurgia).';

  const matched = calc?.riskTiers?.find((t) => t.severityLevel === severityLevel) ?? calc?.riskTiers?.[0];
  const activeRiskTier: RiskTier = matched ?? {
    id: `tier_lawton_${severityLevel}`,
    label: tierLabel,
    severityLevel,
    minScore: rawScore <= 4 ? 2 : rawScore <= 6 ? 5 : 7,
    maxScore: rawScore <= 4 ? 4 : rawScore <= 6 ? 6 : 10,
    statisticalOutcome,
    colorHex: rawScore <= 4 ? '#10b981' : rawScore <= 6 ? '#f59e0b' : '#dc2626',
    pharmacologicalActions: [],
    nonPharmacologicalActions: [
      {
        id: 'action_lawton_plan',
        recommendationTitle: tierLabel,
        dispositionTarget: severityLevel === 'critical' ? 'Ambulatório Neurovascular' : 'Centro Cirúrgico Neurovascular',
        monitoringPlan: 'Angiografia cerebral de 6 vasos e controle pressórico em UTI.',
      },
    ],
  };

  const radarValues: Record<string, number> = {
    axis_mav_size: Math.min(1, Math.max(0, (smScore - 1) / 4)),
    axis_mav_eloquence: smScore >= 3 ? 0.7 : 0.2,
    axis_mav_surgical_risk: Math.min(1, Math.max(0, (rawScore - 2) / 8)),
    axis_ly_sm: Math.min(1, Math.max(0, (smScore - 1) / 4)),
    axis_ly_age: Math.min(1, Math.max(0, (agePts - 1) / 2)),
    axis_ly_rupture: bleedPts,
    axis_ly_compact: compactPts,
  };

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: `${rawScore} pontos (SM ${smScore} + LY ${lyScore})`,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning: calc?.clinicalWarning,
    warnings: calc?.clinicalWarning ? [calc.clinicalWarning] : undefined,
  };
}

export const PHASES_5_YEAR_RISK_MAP: Record<number, number> = {
  0: 0.4, 1: 0.4, 2: 0.7, 3: 0.7, 4: 0.9, 5: 1.3, 6: 1.7, 7: 2.4,
  8: 3.2, 9: 4.3, 10: 5.3, 11: 7.2, 12: 9.8, 13: 13.0, 14: 15.3,
};

export function calculatePhasesScore(
  calcOrInputs: Calculator | ScoreInputRecord,
  maybeInputs?: ScoreInputRecord
): CalculationResult {
  const { calc, inputs } = resolveCalcAndInputs(calcOrInputs, maybeInputs);

  const popVal = String(inputs.population ?? inputs.grp_phases_pop ?? inputs.pop ?? '').toLowerCase();
  const p = popVal.includes('finland') || popVal.includes('finlandia') || inputs.opt_phases_pop_finland
    ? 5
    : popVal.includes('japan') || popVal.includes('japao') || inputs.opt_phases_pop_japan
      ? 3
      : 0;

  const htnVal = inputs.hypertension ?? inputs.htn ?? inputs.grp_phases_htn;
  const h = htnVal === true || String(htnVal).toLowerCase().includes('yes') || String(htnVal).toLowerCase().includes('sim') || inputs.opt_phases_htn_yes ? 1 : 0;

  const ageVal = inputs.age ?? inputs.ageGte70 ?? inputs.grp_phases_age;
  const a = (typeof ageVal === 'number' && ageVal >= 70) || ageVal === true || String(ageVal).includes('ge70') || String(ageVal).includes('gte70') || inputs.opt_phases_age_gte70 || inputs.opt_ph_age_ge70 ? 1 : 0;

  let s = 0;
  const sizeVal = inputs.size ?? inputs.aneurysmSize ?? inputs.grp_phases_size;
  if (typeof sizeVal === 'number') {
    s = sizeVal >= 20 ? 10 : sizeVal >= 10 ? 6 : sizeVal >= 7 ? 3 : 0;
  } else {
    const lower = String(sizeVal ?? '').toLowerCase();
    if (lower.includes('20') || lower.includes('giant') || inputs.opt_phases_size_gte20) s = 10;
    else if (lower.includes('10') || inputs.opt_phases_size_10_19) s = 6;
    else if ((lower.includes('7') && !lower.includes('lt7') && !lower.includes('<7')) || inputs.opt_phases_size_7_9) s = 3;
  }

  const sahVal = inputs.earlierSah ?? inputs.earlier_sah ?? inputs.previousSah ?? inputs.grp_phases_earlier_sah;
  const e = sahVal === true || String(sahVal).toLowerCase().includes('yes') || String(sahVal).toLowerCase().includes('sim') || inputs.opt_phases_earlier_sah_yes ? 1 : 0;

  const siteStr = String(inputs.site ?? inputs.location ?? inputs.grp_phases_site ?? '').toLowerCase();
  const sitePts = siteStr.includes('post') || siteStr.includes('basilar') || siteStr.includes('acoa') || siteStr.includes('pcoa') || siteStr.includes('comunicante') || inputs.opt_phases_site_acoa_pcoa_post
    ? 4
    : siteStr.includes('mca') || siteStr.includes('acm') || siteStr.includes('media') || inputs.opt_phases_site_mca
      ? 2
      : 0;

  const rawScore = p + h + a + s + e + sitePts;
  const riskPercent = rawScore >= 15 ? 17.8 : (PHASES_5_YEAR_RISK_MAP[rawScore] ?? 0.4);
  const riskFormatted = rawScore >= 15 ? '> 17.8%' : `${riskPercent.toFixed(1)}%`;
  const severityLevel: RiskSeverityLevel = rawScore <= 3 ? 'low' : rawScore <= 7 ? 'intermediate' : 'critical';

  const matched = calc?.riskTiers?.find((t) => t.severityLevel === severityLevel) ?? calc?.riskTiers?.[0];
  const activeRiskTier: RiskTier = matched ?? {
    id: `tier_phases_${severityLevel}`,
    label: rawScore <= 3 ? 'Baixo Risco de Ruptura (0 a 3 pts)' : rawScore <= 7 ? 'Risco Intermediário (4 a 7 pts)' : 'Alto Risco de Ruptura (>= 8 pts)',
    severityLevel,
    minScore: rawScore <= 3 ? 0 : rawScore <= 7 ? 4 : 8,
    maxScore: rawScore <= 3 ? 3 : rawScore <= 7 ? 7 : 22,
    statisticalOutcome: `Risco de ruptura em 5 anos: ${riskFormatted}.`,
    colorHex: rawScore <= 3 ? '#10b981' : rawScore <= 7 ? '#f59e0b' : '#dc2626',
    pharmacologicalActions: [],
    nonPharmacologicalActions: [],
  };

  const radarValues: Record<string, number> = {
    axis_aneurysm_size: Math.min(1, Math.max(0, s / 10)),
    axis_aneurysm_site: sitePts / 4,
    axis_rupture_risk: Math.min(1, Math.max(0, riskPercent / 20)),
    axis_ph_morphology: Math.min(1, Math.max(0, s / 10)),
    axis_ph_site: sitePts / 4,
    axis_ph_demographic: Math.min(1, (p + a) / 5),
    axis_ph_clinical: Math.min(1, (h + e) / 2),
  };

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: `${rawScore} pontos (Risco 5 anos: ${riskFormatted})`,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning: calc?.clinicalWarning,
    warnings: calc?.clinicalWarning ? [calc.clinicalWarning] : undefined,
  };
}

export function calculateVasograde(
  calcOrInputs: Calculator | ScoreInputRecord,
  maybeInputs?: ScoreInputRecord
): CalculationResult {
  const { calc, inputs } = resolveCalcAndInputs(calcOrInputs, maybeInputs);

  let categoryChoice: 'green' | 'yellow' | 'red' | undefined;
  const directCat = String(inputs.grp_vasograde_category ?? inputs.vasograde_category ?? inputs.category ?? inputs.vasograde ?? '').toLowerCase();
  if (directCat.includes('green') || directCat.includes('verde') || inputs.opt_vaso_green) categoryChoice = 'green';
  else if (directCat.includes('yellow') || directCat.includes('amarelo') || directCat.includes('amber') || inputs.opt_vaso_yellow) categoryChoice = 'yellow';
  else if (directCat.includes('red') || directCat.includes('vermelho') || inputs.opt_vaso_red) categoryChoice = 'red';

  const rawWfns = inputs.wfns ?? inputs.wfnsGrade ?? inputs.wfns_grade ?? inputs.grp_wfns;
  const wfnsVal = typeof rawWfns === 'number' ? Math.round(rawWfns) : typeof rawWfns === 'string' && /[1-5]/.test(rawWfns) ? parseInt(rawWfns.match(/[1-5]/)![0], 10) : undefined;
  const rawFisher = inputs.modified_fisher ?? inputs.modifiedFisher ?? inputs.fisher ?? inputs.grp_modified_fisher;
  const fisherVal = typeof rawFisher === 'number' ? Math.round(rawFisher) : typeof rawFisher === 'string' && /[0-4]/.test(rawFisher) ? parseInt(rawFisher.match(/[0-4]/)![0], 10) : undefined;

  if (!categoryChoice && (wfnsVal !== undefined || fisherVal !== undefined)) {
    const w = wfnsVal ?? 1;
    const f = fisherVal ?? 0;
    categoryChoice = w >= 4 ? 'red' : w === 3 ? (f >= 3 ? 'red' : 'yellow') : (f >= 3 ? 'yellow' : 'green');
  }
  if (!categoryChoice) categoryChoice = 'green';

  const rawScore = categoryChoice === 'red' ? 3 : categoryChoice === 'yellow' ? 2 : 1;
  const severityLevel: RiskSeverityLevel = categoryChoice === 'red' ? 'critical' : categoryChoice === 'yellow' ? 'intermediate' : 'low';
  const tierId = `tier_vaso_${categoryChoice}`;
  const tierLabel = categoryChoice === 'red'
    ? 'Vasograde-Red: Alto Risco de DCI e Mau Prognóstico'
    : categoryChoice === 'yellow'
      ? 'Vasograde-Yellow: Risco Intermediário de DCI'
      : 'Vasograde-Green: Baixo Risco de DCI';

  const matched = calc?.riskTiers?.find((t) => t.id === tierId || t.severityLevel === severityLevel) ?? calc?.riskTiers?.[0];
  const activeRiskTier: RiskTier = matched ?? {
    id: tierId,
    label: tierLabel,
    severityLevel,
    minScore: rawScore,
    maxScore: rawScore,
    statisticalOutcome: categoryChoice === 'red' ? 'Incidência de DCI de 40% a 50%.' : categoryChoice === 'yellow' ? 'Incidência de DCI de 30% a 35%.' : 'Incidência de DCI de 15% a 20%.',
    colorHex: categoryChoice === 'red' ? '#ef4444' : categoryChoice === 'yellow' ? '#f59e0b' : '#10b981',
    pharmacologicalActions: [
      {
        id: 'rx_vaso_nimo',
        drugName: 'Nimodipino Oral / Enteral',
        dosage: '60 mg VO ou SNE a cada 4 horas por 21 dias contínuos',
        route: 'Oral / SNE exclusiva',
        frequency: '4/4h',
      },
    ],
    nonPharmacologicalActions: [],
  };

  const radarValues: Record<string, number> = {
    axis_vaso_clinical: wfnsVal !== undefined ? (wfnsVal - 1) / 4 : categoryChoice === 'red' ? 1.0 : categoryChoice === 'yellow' ? 0.4 : 0.0,
    axis_vaso_imaging: fisherVal !== undefined ? fisherVal / 4 : categoryChoice === 'red' ? 1.0 : categoryChoice === 'yellow' ? 0.75 : 0.2,
    axis_vaso_dci: categoryChoice === 'red' ? 1.0 : categoryChoice === 'yellow' ? 0.5 : 0.0,
  };

  return {
    score: rawScore,
    rawScore,
    scoreFormatted: wfnsVal !== undefined && fisherVal !== undefined ? `${tierLabel.split(':')[0]} (WFNS ${wfnsVal}, Fisher Mod ${fisherVal})` : tierLabel,
    activeRiskTier,
    radarValues,
    radarPoints: radarValues,
    clinicalWarning: calc?.clinicalWarning,
    warnings: calc?.clinicalWarning ? [calc.clinicalWarning] : undefined,
  };
}
