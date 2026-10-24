import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ALL_SCOREBOARD_CALCULATORS,
  SCOREBOARD_BLOCKS_META,
  SCOREBOARD_MANIFEST,
  getCalculatorByIdOrSlug,
  searchScoreboardCatalog,
} from '../data/scores/scoreboardCatalog';
import {
  SSC_2021_QSOFA_WARNING,
  calculateFullSofa,
  calculateLawtonYoung,
  calculateNomsFramework,
  calculatePhasesScore,
  calculateQsofa,
  calculateSagittalBalance,
  calculateScore,
  calculateVasograde,
  calculateWellsPe,
} from '../utils/scores/calculationEngine';
import {
  DOBUTAMINE_PROTOCOL,
  NITROGLYCERIN_PROTOCOL,
  NOREPINEPHRINE_PROTOCOL,
  VASOPRESSIN_PROTOCOL,
  calculateDoseFromRate,
  calculateInfusionRate,
  generateTitrationMatrix,
} from '../utils/scores/infusionEngine';
import {
  generateAxisSpokes,
  generateBaselinePolygon,
  generateGridRings,
  generatePatientPolygon,
  normalizeRadarValues,
} from '../utils/scores/radarEngine';
import {
  buildScoreHtmlForA4,
  convertPharmacologicalActionToPrescriptionItem,
  generatePepNote,
  generateSbarNote,
  sanitizeBedIdentifier,
} from '../utils/scores/pepExportEngine';
import {
  calculateEparadaDoses,
  evaluateBreastScreening,
  evaluateCervicalScreening,
  evaluateProstateScreening,
  formatPcrSummaryNote,
} from '../utils/scores/eparadaAndScreeningEngine';
import { ScoreboardModuleView } from '../components/scores/ScoreboardModuleView';
import { ScoreCalculatorDetailView } from '../components/scores/ScoreCalculatorDetailView';
import { ScoreBicInfusionCard } from '../components/scores/ScoreBicInfusionCard';
import { EparadaAndScreeningPanel } from '../components/scores/EparadaAndScreeningPanel';
import { DEFAULT_PATIENT } from '../hooks/usePrescriptionSession';

describe('Scoreboard CDSS & Ferramentas de Apoio Clínico Integradas ao PCM', () => {
  it('carrega as 114 calculadoras monográficas nos 9 blocos de especialidades', () => {
    expect(SCOREBOARD_MANIFEST.length).toBe(114);
    expect(ALL_SCOREBOARD_CALCULATORS.length).toBe(114);
    expect(SCOREBOARD_BLOCKS_META.length).toBe(10); // ALL + 9 blocos

    const qsofa = getCalculatorByIdOrSlug('qsofa');
    expect(qsofa).toBeDefined();
    expect(qsofa?.acronym).toBe('qSOFA');

    const results = searchScoreboardCatalog('sepse', 'ALL');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.slug === 'qsofa')).toBe(true);
  });

  it('calcula deterministicamente todas as 114 calculadoras em linha de base sem lançar exceções', () => {
    for (const calc of ALL_SCOREBOARD_CALCULATORS) {
      const res = calculateScore(calc, {});
      expect(typeof res.rawScore).toBe('number');
      expect(Number.isNaN(res.rawScore)).toBe(false);
      expect(res.activeRiskTier).toBeDefined();
      expect(res.activeRiskTier.label.length).toBeGreaterThan(0);
    }
  });

  it('valida motores clínicos específicos: qSOFA (SSC 2021), SOFA, Wells TEP, Glasgow-P e Neuro/Coluna', () => {
    const qsofaHigh = calculateQsofa({
      respiratoryRate: 26,
      gcs: 13,
      sbp: 88,
    });
    expect(qsofaHigh.score).toBe(3);
    expect(qsofaHigh.isHighRisk).toBe(true);
    expect(qsofaHigh.sscWarning).toBe(SSC_2021_QSOFA_WARNING);

    const sofaRes = calculateFullSofa({
      pao2Fio2Ratio: 150,
      onMechanicalVentilation: true,
      plateletsThousands: 80,
      bilirubinMgDl: 2.5,
      mapMmHg: 60,
      vasopressorSupport: 'epi_norepi_low',
      glasgowComaScale: 11,
      creatinineMgDl: 2.4,
    });
    expect(sofaRes.rawScore).toBe(14);
    expect(sofaRes.activeRiskTier.severityLevel).toBe('critical');

    const wellsHigh = calculateWellsPe({
      clinicalSignsDvt: true,
      peMostLikelyDiagnosis: true,
      heartRateOver100: true,
      immobilizationOrSurgery4Weeks: false,
      previousDvtOrPe: false,
      hemoptysis: false,
      activeMalignancy: false,
    });
    expect(wellsHigh.rawScore).toBe(7.5);
    expect(wellsHigh.activeRiskTier.severityLevel).toBe('critical');

    const glasgowCalc = getCalculatorByIdOrSlug('glasgow-p')!;
    const glasgowRes = calculateScore(glasgowCalc, {});
    expect(glasgowRes.rawScore).toBe(15);

    const sagittal = calculateSagittalBalance({
      pi: 60,
      pt: 28,
      ss: 32,
      ll: 30,
      sva: 110,
    });
    expect(sagittal.rawScore).toBe(30);
    expect(sagittal.activeRiskTier.severityLevel).toBe('critical');

    const noms = calculateNomsFramework({
      neurologic: '3',
      oncologic: 'radioresistant',
      mechanical: 'unstable',
      systemic: 'eligible',
    });
    expect(noms.scoreFormatted).toContain('Separation Surgery + SBRT');

    const lawton = calculateLawtonYoung({
      spetzlerMartin: 2,
      age: 30,
      unruptured: false,
      compactness: 'compact',
    });
    expect(lawton.rawScore).toBe(4);
    expect(lawton.activeRiskTier.severityLevel).toBe('low');

    const phases = calculatePhasesScore({
      population: 'finland',
      hypertension: true,
      age: 74,
      size: 12,
      earlierSah: true,
      site: 'posterior',
    });
    expect(phases.rawScore).toBeGreaterThanOrEqual(15);
    expect(phases.activeRiskTier.severityLevel).toBe('critical');

    const vaso = calculateVasograde({ wfns: 4, modified_fisher: 4 });
    expect(vaso.rawScore).toBe(3);
    expect(vaso.scoreFormatted).toContain('Vasograde-Red');
  });

  it('calcula infusões contínuas em BIC (Noradrenalina, Vasopressina, Dobutamina, Nitroglicerina) e alertas', () => {
    const norepi = calculateInfusionRate({
      protocol: NOREPINEPHRINE_PROTOCOL,
      weightKg: 70,
      dose: 0.3,
    });
    // (0.3 * 70 * 60) / 64 = 19.6875 -> 19.7 mL/h
    expect(norepi.rateMlPerHour).toBe(19.7);
    expect(
      norepi.safetyAlerts.some((a) => a.includes('CHOQUE REFRATÁRIO'))
    ).toBe(true);

    const reverseDose = calculateDoseFromRate({
      rateMlPerHour: 19.7,
      weightKg: 70,
      concentrationMcgPerMl: 64,
    });
    expect(reverseDose).toBeCloseTo(0.3, 2);

    const vasopressin = calculateInfusionRate({
      protocol: VASOPRESSIN_PROTOCOL,
      weightKg: 95,
      dose: 0.03,
    });
    // (0.03 * 60) / 0.2 = 9.0 mL/h (dose fixa independente do peso)
    expect(vasopressin.rateMlPerHour).toBe(9.0);

    const tridil = calculateInfusionRate({
      protocol: NITROGLYCERIN_PROTOCOL,
      dose: 10,
    });
    expect(tridil.rateMlPerHour).toBe(3.0);
    expect(tridil.containerAlert).toContain('PVC');

    const matrix = generateTitrationMatrix({
      protocol: DOBUTAMINE_PROTOCOL,
      weightKg: 80,
    });
    expect(matrix.length).toBeGreaterThan(4);
  });

  it('gera geometria SVG do Radar Fisiológico e notas PEP/SBAR/A4 sanitizadas (LGPD e XSS-safe)', () => {
    const qsofa = getCalculatorByIdOrSlug('qsofa')!;
    const res = calculateScore(qsofa, {
      grp_qsofa_resp: 'opt_resp_high',
      grp_qsofa_sbp: 'opt_sbp_low',
    });

    const norm = normalizeRadarValues(qsofa.radarAxes, res.radarValues);
    expect(norm.axis_qsofa_resp).toBe(1);
    expect(generateBaselinePolygon(qsofa.radarAxes).length).toBeGreaterThan(10);
    expect(
      generatePatientPolygon(qsofa.radarAxes, res.radarValues).length
    ).toBeGreaterThan(10);
    expect(generateGridRings(qsofa.radarAxes).length).toBe(4);
    expect(generateAxisSpokes(qsofa.radarAxes).length).toBe(3);

    const sanitizedBed = sanitizeBedIdentifier(
      'UTI-02 CPF: 123.456.789-00 CNS: 123456789012345'
    );
    expect(sanitizedBed).not.toContain('123.456.789-00');
    expect(sanitizedBed).toContain('[CPF OMITIDO]');

    const pepNote = generatePepNote({
      calculator: qsofa,
      result: res,
      bedIdentifier: sanitizedBed,
      patientWeightKg: 75,
    });
    expect(pepNote).toContain('EVOLUÇÃO ESTRUTURADA (SOAP)');
    expect(pepNote).toContain('SSC 2021');

    const sbarNote = generateSbarNote({
      calculator: qsofa,
      result: res,
      bedIdentifier: sanitizedBed,
    });
    expect(sbarNote).toContain('[S] SITUATION');

    const htmlA4 = buildScoreHtmlForA4({
      calculator: qsofa,
      result: res,
      bedIdentifier: '<script>alert(1)</script>UTI-03',
    });
    expect(htmlA4).not.toContain('<script>');
    expect(htmlA4).toContain('&lt;script&gt;');

    const rxAction = res.activeRiskTier.pharmacologicalActions[0];
    const rxItem = convertPharmacologicalActionToPrescriptionItem(
      rxAction,
      qsofa.acronym
    );
    expect(rxItem.name).toBe(rxAction.drugName);
  });

  it('valida motor EPARADA (trava Sem peso sem dose e tetos PALS) e Rastreio Oncológico INCA/MS', () => {
    const noWeight = calculateEparadaDoses(0, true);
    expect(noWeight.isValidWeight).toBe(false);
    expect(noWeight.doses.length).toBe(0);
    expect(noWeight.validationMessage).toContain('Sem peso, sem dose');

    const ped15kg = calculateEparadaDoses(15, true);
    expect(ped15kg.isValidWeight).toBe(true);
    expect(ped15kg.doses[0].calculatedDose).toContain('0.15 mg');
    expect(ped15kg.doses[1].calculatedDose).toContain('1º Choque: 30 J');

    const pcrText = formatPcrSummaryNote({
      rhythm: 'FV',
      weightKg: 70,
      elapsedSeconds: 240,
      cyclesCount: 2,
      shocksCount: 2,
      epinephrineCount: 1,
      amiodaroneCount: 0,
      checkedCausesIds: ['5h_hypoxia'],
      outcome: 'RCE_ATINGIDO',
    });
    expect(pcrText).toContain('Hipóxia');
    expect(pcrText).toContain('RCE');

    const birads4 = evaluateBreastScreening({
      ageYears: 56,
      highFamilyOrGeneticRisk: false,
      palpableNoduleOrRedFlag: false,
      birads: '4',
    });
    expect(birads4.riskLevel).toBe('critical');
    expect(birads4.conductSummary).toContain('Core Biopsy');

    const cervicalHsil = evaluateCervicalScreening({
      ageYears: 34,
      twoConsecutiveAnnualNormals: false,
      immunosuppressedOrHiv: false,
      cytologyResult: 'HSIL',
    });
    expect(cervicalHsil.riskLevel).toBe('critical');
    expect(cervicalHsil.followUpInterval).toContain('Colposcopia');

    const prostateHigh = evaluateProstateScreening({
      ageYears: 62,
      highRiskFamilyOrAncestry: true,
      psaTotalNgMl: 6.2,
      freeToTotalRatioPct: 11,
      abnormalDigitalRectalExam: false,
    });
    expect(prostateHigh.riskLevel).toBe('high');
  });

  it('renderiza ScoreboardModuleView, ScoreCalculatorDetailView, ScoreBicInfusionCard e EparadaAndScreeningPanel sem erros ou classes inválidas', () => {
    const qsofa = getCalculatorByIdOrSlug('qsofa')!;
    const moduleHtml = renderToStaticMarkup(
      <ScoreboardModuleView patient={{ ...DEFAULT_PATIENT, weightKg: 72 }} />
    );
    expect(moduleHtml).toContain('Scoreboard CDSS');
    expect(moduleHtml).toContain('114 Escores Monográficos');
    expect(moduleHtml).not.toContain('py-0.2');

    const detailHtml = renderToStaticMarkup(
      <ScoreCalculatorDetailView
        calculator={qsofa}
        isFavorite={true}
        onToggleFavorite={() => {}}
        patientWeightKg={70}
        onWeightChange={() => {}}
        bedIdentifier="UTI-01"
        onBedIdentifierChange={() => {}}
      />
    );
    expect(detailHtml).toContain('qSOFA');
    expect(detailHtml).toContain('Radar Fisiológico');

    const bicHtml = renderToStaticMarkup(
      <ScoreBicInfusionCard
        protocol={NOREPINEPHRINE_PROTOCOL}
        patientWeightKg={70}
      />
    );
    expect(bicHtml).toContain('Noradrenalina');
    expect(bicHtml).toContain('mL/h');

    const eparadaHtml = renderToStaticMarkup(
      <EparadaAndScreeningPanel
        patientWeightKg={70}
        patientAgeYears={55}
        onWeightChange={() => {}}
      />
    );
    expect(eparadaHtml).toContain('EPARADA');
    expect(eparadaHtml).toContain('5H e 5T');
  });
});
