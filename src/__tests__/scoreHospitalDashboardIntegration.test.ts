import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { HospitalBedScoreEntry } from '../core/domain/clinicalEntities';
import { clinicalRepository } from '../core/storage/clinicalRepository';
import {
  analyzeConductVsEvolution,
  buildHospitalEvolutionHtmlForA4,
  computeLongitudinalScoreDeltas,
  formatScoreEntryCompactLine,
  formatStandardHospitalEvolutionText,
  sortScoreEntriesChronologically,
} from '../utils/hospital/hospitalEvolutionFormatter';
import {
  DEFAULT_HOSPITAL_BEDS_SEED,
  createEmptyHospitalBedRecord,
} from '../utils/hospital/hospitalMultimodalIngestor';
import { generateBedCopilotResponse } from '../utils/hospital/hospitalAiAssistantService';
import { HospitalLabsAndAnalyticsPanel } from '../components/hospital/HospitalLabsAndAnalyticsPanel';
import { ScoreboardModuleView } from '../components/scores/ScoreboardModuleView';
import { DEFAULT_PATIENT } from '../hooks/usePrescriptionSession';

describe('Integração Scoreboard CDSS <-> Internação Hospitalar (MOD-03) & Dashboard', () => {
  it('ordena scoreEntries cronologicamente e formata linha compacta com vírgula decimal', () => {
    const entries: HospitalBedScoreEntry[] = [
      {
        id: 's-2',
        dateBr: '24/10/2026',
        dateIso: '2026-10-24',
        recordedAtIso: '2026-10-24T10:00:00',
        calculatorId: 'calc_sofa',
        acronym: 'SOFA',
        calculatorName: 'Sequential Organ Failure Assessment',
        scoreNumeric: 1,
        scoreFormatted: '1',
        minPossibleScore: 0,
        maxPossibleScore: 24,
        severityLevel: 'low',
        riskLabel: 'Disfunção Orgânica Mínima',
      },
      {
        id: 's-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        recordedAtIso: '2026-10-20T08:00:00',
        calculatorId: 'calc_sofa',
        acronym: 'SOFA',
        calculatorName: 'Sequential Organ Failure Assessment',
        scoreNumeric: 4,
        scoreFormatted: '4',
        minPossibleScore: 0,
        maxPossibleScore: 24,
        severityLevel: 'intermediate',
        riskLabel: 'Disfunção Moderada',
      },
    ];

    const sorted = sortScoreEntriesChronologically(entries);
    expect(sorted.map((s) => s.id)).toEqual(['s-1', 's-2']);

    const compact = formatScoreEntryCompactLine(sorted[0]);
    expect(compact).toBe(
      '20/10/2026: SOFA 4 pts [Escala 0..24] — Disfunção Moderada'
    );
  });

  it('calcula deltas longitudinais de escores diferenciando escalas diretas (CURB-65/SOFA) e inversas (Glasgow-P)', () => {
    const entries: HospitalBedScoreEntry[] = [
      {
        id: 'curb-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        recordedAtIso: '2026-10-20T09:00:00',
        calculatorId: 'calc_curb65',
        acronym: 'CURB-65',
        calculatorName: 'CURB-65',
        scoreNumeric: 3,
        scoreFormatted: '3',
        minPossibleScore: 0,
        maxPossibleScore: 5,
        severityLevel: 'high',
        riskLabel: 'PAC Grave',
      },
      {
        id: 'curb-2',
        dateBr: '24/10/2026',
        dateIso: '2026-10-24',
        recordedAtIso: '2026-10-24T09:00:00',
        calculatorId: 'calc_curb65',
        acronym: 'CURB-65',
        calculatorName: 'CURB-65',
        scoreNumeric: 1,
        scoreFormatted: '1',
        minPossibleScore: 0,
        maxPossibleScore: 5,
        severityLevel: 'low',
        riskLabel: 'Baixo Risco',
      },
      {
        id: 'gcs-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        recordedAtIso: '2026-10-20T09:00:00',
        calculatorId: 'calc_glasgow_p',
        acronym: 'Glasgow-P',
        calculatorName: 'Escala de Coma de Glasgow com Reatividade Pupilar',
        scoreNumeric: 11,
        scoreFormatted: '11',
        minPossibleScore: 1,
        maxPossibleScore: 15,
        severityLevel: 'intermediate',
        riskLabel: 'TCE Moderado',
      },
      {
        id: 'gcs-2',
        dateBr: '24/10/2026',
        dateIso: '2026-10-24',
        recordedAtIso: '2026-10-24T09:00:00',
        calculatorId: 'calc_glasgow_p',
        acronym: 'Glasgow-P',
        calculatorName: 'Escala de Coma de Glasgow com Reatividade Pupilar',
        scoreNumeric: 15,
        scoreFormatted: '15',
        minPossibleScore: 1,
        maxPossibleScore: 15,
        severityLevel: 'low',
        riskLabel: 'Alerta / Normal',
      },
    ];

    const deltas = computeLongitudinalScoreDeltas(entries);
    expect(deltas).toHaveLength(2);

    const curbDelta = deltas.find((d) => d.acronym === 'CURB-65');
    expect(curbDelta).toBeDefined();
    expect(curbDelta?.previousValue).toBe(3);
    expect(curbDelta?.latestValue).toBe(1);
    expect(curbDelta?.deltaNumeric).toBe(-2);
    expect(curbDelta?.direction).toBe('down');
    expect(curbDelta?.clinicalTrendStatus).toBe('favorable');

    const gcsDelta = deltas.find((d) => d.acronym === 'Glasgow-P');
    expect(gcsDelta).toBeDefined();
    expect(gcsDelta?.previousValue).toBe(11);
    expect(gcsDelta?.latestValue).toBe(15);
    expect(gcsDelta?.deltaNumeric).toBe(4);
    expect(gcsDelta?.direction).toBe('up');
    expect(gcsDelta?.clinicalTrendStatus).toBe('favorable');
  });

  it('inclui o eixo escores_clinicos no cruzamento Conduta x Evolução do Dashboard e no texto padronizado', () => {
    const bed110 = DEFAULT_HOSPITAL_BEDS_SEED[0];
    const correlations = analyzeConductVsEvolution(bed110);

    const scoreAxis = correlations.find((c) => c.domain === 'escores_clinicos');
    expect(scoreAxis).toBeDefined();
    expect(scoreAxis?.efficacyStatus).toBe('favorable');
    expect(scoreAxis?.evolutionResponseText).toContain('CURB-65');
    expect(scoreAxis?.evolutionResponseText).toContain('qSOFA');

    const standardText = formatStandardHospitalEvolutionText(bed110);
    expect(standardText).toContain('ESCORES CLÍNICOS:');
    expect(standardText).toContain('24/10/2026: CURB-65 0 pts');

    const htmlA4 = buildHospitalEvolutionHtmlForA4(bed110);
    expect(htmlA4).toContain('<strong>ESCORES CLÍNICOS:</strong>');

    const copilotMsg = generateBedCopilotResponse(
      'Qual a evolução dos escores deste leito?',
      bed110,
      'bed_copilot'
    );
    expect(copilotMsg.content).toContain(
      'Tendência Longitudinal de Escores Clínicos (Scoreboard CDSS):'
    );
    expect(copilotMsg.content).toContain('CURB-65');
  });

  it('persiste novos scoreEntries no leito via clinicalRepository', async () => {
    const bed = createEmptyHospitalBedRecord('301-04', 'uti');
    const newScore: HospitalBedScoreEntry = {
      id: 'score-uti-sofa-1',
      dateBr: '24/10/2026',
      dateIso: '2026-10-24',
      recordedAtIso: '2026-10-24T11:30:00',
      calculatorId: 'calc_sofa',
      acronym: 'SOFA',
      calculatorName: 'SOFA Score',
      scoreNumeric: 6,
      scoreFormatted: '6',
      minPossibleScore: 0,
      maxPossibleScore: 24,
      severityLevel: 'high',
      riskLabel: 'Disfunção Orgânica Significativa',
      recommendedConducts: ['Noradrenalina em BIC para PAM >= 65 mmHg'],
    };

    const updated = {
      ...bed,
      scoreEntries: [newScore],
      conductList: ['Noradrenalina em BIC para PAM >= 65 mmHg'],
    };

    await clinicalRepository.saveHospitalBed?.(updated);
    const allBeds = await clinicalRepository.listHospitalBeds?.();
    const loaded = allBeds?.find((b) => b.id === bed.id);

    expect(loaded).toBeDefined();
    expect(loaded?.scoreEntries).toHaveLength(1);
    expect(loaded?.scoreEntries?.[0].acronym).toBe('SOFA');
    expect(loaded?.scoreEntries?.[0].scoreNumeric).toBe(6);

    await clinicalRepository.deleteHospitalBed?.(bed.id);
  });

  it('renderiza a métrica de Escores Clínicos CDSS no Dashboard Hospitalar e a ponte de integração no ScoreboardModuleView', () => {
    const dashboardScoresHtml = renderToStaticMarkup(
      React.createElement(HospitalLabsAndAnalyticsPanel, {
        mode: 'analytics_dashboard',
        bedRecord: DEFAULT_HOSPITAL_BEDS_SEED[0],
        onUpdateBedRecord: vi.fn(),
        initialMetricSource: 'scores',
        initialScoreAcronym: 'CURB-65',
        onOpenScoreboardForBed: vi.fn(),
      })
    );

    expect(dashboardScoresHtml).toContain('Escores Clínicos CDSS (2)');
    expect(dashboardScoresHtml).toContain('Curva Seriada de Escore Clínico:');
    expect(dashboardScoresHtml).toContain('CURB-65');
    expect(dashboardScoresHtml).toContain('Eixo: escores clinicos');
    expect(dashboardScoresHtml).toContain('+ Calcular Escore p/ Leito');

    const scoreboardBridgeHtml = renderToStaticMarkup(
      React.createElement(ScoreboardModuleView, {
        patient: DEFAULT_PATIENT,
        initialCalculatorId: 'calc_curb65',
        hospitalBeds: DEFAULT_HOSPITAL_BEDS_SEED,
        activeHospitalBedId: DEFAULT_HOSPITAL_BEDS_SEED[0].id,
        onSelectHospitalBed: vi.fn(),
        onRecordScoreToBed: vi.fn(),
        onNavigateToHospitalDashboard: vi.fn(),
      })
    );

    expect(scoreboardBridgeHtml).toContain('Integração Internação &amp; Dashboard (MOD-03)');
    expect(scoreboardBridgeHtml).toContain('Registrar no Leito 110-15 (Dashboard)');
    expect(scoreboardBridgeHtml).toContain('Ver no Dashboard');
  });
});
