import type { PrescriptionItem } from '../../types';
import { escapeHtml } from '../sanitizeHtml';
import type {
  CalculationResult,
  Calculator,
  InfusionCalculationResult,
  InfusionProtocol,
  PharmacologicalAction,
  ScoreInputRecord,
} from './scoreTypes';
import { resolveSelectedOption } from './calculationEngine';

export interface PepExportContext {
  calculator: Calculator;
  result: CalculationResult;
  inputs?: ScoreInputRecord;
  bedIdentifier?: string;
  patientWeightKg?: number;
  activeInfusions?: Array<{
    protocol: InfusionProtocol;
    calculation: InfusionCalculationResult;
    useConcentrated?: boolean;
  }>;
  timestampIso?: string;
}

export function sanitizeBedIdentifier(rawBed?: string): string {
  if (!rawBed) return 'Leito Não Informado';
  const cleaned = rawBed
    .replace(/CPF\s*[:=-]?\s*\d{3}\.?\d{3}\.?\d{3}-?\d{2}/gi, '[CPF OMITIDO]')
    .replace(/CNS\s*[:=-]?\s*\d{15}/gi, '[CNS OMITIDO]')
    .replace(/RG\s*[:=-]?\s*[\d.-]+/gi, '[RG OMITIDO]')
    .trim();
  return cleaned.slice(0, 64) || 'Leito Não Informado';
}

export function summarizeRadarDeviations(
  calculator: Calculator,
  radarValues: Record<string, number>
): string[] {
  const deviations: string[] = [];

  for (const axis of calculator.radarAxes) {
    const val = radarValues[axis.id] ?? 0;
    if (val > 0) {
      const severityPct = Math.round(val * 100);
      let grade = 'Leve';
      if (val >= 0.75) grade = 'Crítico';
      else if (val >= 0.5) grade = 'Moderado/Alto';
      deviations.push(
        `${axis.system} (${axis.label}): Desvio ${grade} (${severityPct}%)`
      );
    }
  }

  if (deviations.length === 0) {
    return [
      'Todos os eixos fisiológicos monitorados encontram-se na linha de base homeostática (0% de desvio).',
    ];
  }

  return deviations;
}

export function summarizePositiveFindings(
  calculator: Calculator,
  inputs?: ScoreInputRecord
): string[] {
  if (!inputs) return [];
  const findings: string[] = [];

  for (const group of calculator.parameterGroups) {
    const selectedOption = resolveSelectedOption(group, inputs);
    if (selectedOption) {
      findings.push(
        `${group.name}: ${selectedOption.label} (${selectedOption.pointValue >= 0 ? '+' : ''}${selectedOption.pointValue} pts)`
      );
    } else if (typeof inputs[group.id] === 'number') {
      findings.push(
        `${group.name}: ${inputs[group.id]} ${group.unit ?? ''}`.trim()
      );
    }
  }

  return findings;
}

export function generatePepNote(ctx: PepExportContext): string {
  const {
    calculator,
    result,
    inputs,
    bedIdentifier,
    patientWeightKg,
    activeInfusions,
  } = ctx;
  const bed = sanitizeBedIdentifier(bedIdentifier);
  const tier = result.activeRiskTier;
  const deviations = summarizeRadarDeviations(calculator, result.radarValues);
  const findings = summarizePositiveFindings(calculator, inputs);

  const lines: string[] = [];
  lines.push(
    '======================================================================'
  );
  lines.push(
    `EVOLUÇÃO ESTRUTURADA (SOAP) — ${calculator.acronym} (${calculator.name})`
  );
  lines.push(
    `Identificação de Leito (LGPD): ${bed}${patientWeightKg ? ` | Peso Estimado/Aferido: ${patientWeightKg} kg` : ''}`
  );
  lines.push(
    '======================================================================'
  );
  lines.push('');

  lines.push('[S / O] SUBJETIVO E DADOS OBJETIVOS À BEIRA DO LEITO:');
  lines.push(`- Ferramenta Aplicada: ${calculator.name} (${calculator.acronym})`);
  lines.push(
    `- Pontuação Calculada: ${result.scoreFormatted} pontos (Faixa de Escala: ${calculator.minPossibleScore} a ${calculator.maxPossibleScore})`
  );
  if (findings.length > 0) {
    lines.push('- Parâmetros Clínicos Selecionados:');
    findings.forEach((f) => lines.push(`  * ${f}`));
  }
  lines.push('- Perfil de Desvio Fisiológico (Radar Multissistêmico):');
  deviations.forEach((d) => lines.push(`  * ${d}`));
  lines.push('');

  lines.push('[A] AVALIAÇÃO E ESTRATIFICAÇÃO DE RISCO:');
  lines.push(
    `- Estratificação Atual: ${tier.label} [Severidade: ${tier.severityLevel.toUpperCase()}]`
  );
  lines.push(`- Prognóstico / Desfecho Estatístico: ${tier.statisticalOutcome}`);
  if (result.sscWarning) {
    lines.push(`- ALERTA DIRETRIZ SSC 2021: ${result.sscWarning}`);
  }
  if (result.clinicalWarning && result.clinicalWarning !== result.sscWarning) {
    lines.push(`- Alerta Clínico: ${result.clinicalWarning}`);
  }
  lines.push('');

  lines.push('[P] PLANO TERAPÊUTICO E CONDUTAS IMEDIATAS:');
  if (tier.nonPharmacologicalActions.length > 0) {
    lines.push('1. Medidas Não-Farmacológicas, Monitorização e Destino:');
    tier.nonPharmacologicalActions.forEach((act) => {
      lines.push(
        `   - [${act.dispositionTarget}] ${act.recommendationTitle}: ${act.monitoringPlan}`
      );
      if (act.ventilatorySupport)
        lines.push(`     * Suporte Ventilatório: ${act.ventilatorySupport}`);
      if (act.vascularAccess)
        lines.push(`     * Acesso Vascular: ${act.vascularAccess}`);
      if (act.interventionalProcedure)
        lines.push(
          `     * Procedimento / Intervenção: ${act.interventionalProcedure}`
        );
      if (act.laboratoryPanel)
        lines.push(`     * Painel Laboratorial: ${act.laboratoryPanel}`);
    });
  }

  if (tier.pharmacologicalActions.length > 0) {
    lines.push('2. Condutas Farmacológicas Recomendadas:');
    tier.pharmacologicalActions.forEach((rx) => {
      lines.push(
        `   - ${rx.drugName}: ${rx.dosage} | Via: ${rx.route} | Frequência: ${rx.frequency}`
      );
      if (rx.dilutionInstructions)
        lines.push(`     * Diluição/Preparo: ${rx.dilutionInstructions}`);
      if (rx.renalAdjustment)
        lines.push(`     * Ajuste Renal: ${rx.renalAdjustment}`);
      if (rx.contraindications)
        lines.push(
          `     * Contraindicações/Cautelas: ${rx.contraindications}`
        );
    });
  }

  if (activeInfusions && activeInfusions.length > 0) {
    lines.push('3. Prescrição de Infusão Contínua em Bomba (BIC):');
    activeInfusions.forEach((inf) => {
      const solLabel = inf.useConcentrated
        ? 'Solução Concentrada (2x)'
        : 'Solução Padrão';
      lines.push(
        `   - ${inf.protocol.drugName} [${solLabel}]: Dose ${inf.calculation.formattedDose} => Vazão em BIC: ${inf.calculation.rateMlPerHour} mL/h`
      );
      lines.push(`     * Preparo: ${inf.calculation.recommendedVehicle}`);
      inf.calculation.safetyAlerts.forEach((alert) => {
        lines.push(`     * [SEGURANÇA]: ${alert}`);
      });
    });
  }

  lines.push('');
  lines.push(`Referência Científica: ${calculator.evidenceSource}`);
  lines.push(
    'Nota gerada por suporte à decisão clínica determinístico (PresCMed Scoreboard CDSS — Sem armazenamento de dados pessoais / LGPD).'
  );

  return lines.join('\n');
}

export function generateSbarNote(ctx: PepExportContext): string {
  const {
    calculator,
    result,
    inputs,
    bedIdentifier,
    patientWeightKg,
    activeInfusions,
  } = ctx;
  const bed = sanitizeBedIdentifier(bedIdentifier);
  const tier = result.activeRiskTier;
  const deviations = summarizeRadarDeviations(calculator, result.radarValues);
  const findings = summarizePositiveFindings(calculator, inputs);

  const lines: string[] = [];
  lines.push(
    '======================================================================'
  );
  lines.push(
    `PASSAGEM DE PLANTÃO (SBAR) — ${calculator.acronym} | ${bed}`
  );
  lines.push(
    '======================================================================'
  );
  lines.push('');

  lines.push('[S] SITUATION (SITUAÇÃO ATUAL):');
  lines.push(
    `- Paciente em ${bed}${patientWeightKg ? ` (${patientWeightKg} kg)` : ''} avaliado pelo escore ${calculator.name} (${calculator.acronym}).`
  );
  lines.push(
    `- Escore Atual: ${result.scoreFormatted} pontos -> ${tier.label}.`
  );
  if (
    tier.nonPharmacologicalActions[0]?.dispositionTarget
  ) {
    lines.push(
      `- Destino/Alocação Recomendada: ${tier.nonPharmacologicalActions[0].dispositionTarget}.`
    );
  }
  lines.push('');

  lines.push('[B] BACKGROUND (CONTEXTO E PARÂMETROS):');
  lines.push(`- Objetivo Clínico: ${calculator.summary}`);
  if (findings.length > 0) {
    lines.push('- Critérios Pontuados:');
    findings.forEach((f) => lines.push(`  * ${f}`));
  }
  lines.push('');

  lines.push('[A] ASSESSMENT (AVALIAÇÃO E GRAVIDADE):');
  lines.push(`- Desfecho Esperado / Risco: ${tier.statisticalOutcome}`);
  lines.push('- Eixos Fisiológicos Alterados:');
  deviations.forEach((d) => lines.push(`  * ${d}`));
  if (result.sscWarning) {
    lines.push(`- Alerta SSC 2021: ${result.sscWarning}`);
  }
  lines.push('');

  lines.push('[R] RECOMMENDATION (RECOMENDAÇÕES E PLANO ATIVO):');
  tier.nonPharmacologicalActions.forEach((act) => {
    lines.push(`- Conduta e Monitorização: ${act.monitoringPlan}`);
  });
  tier.pharmacologicalActions.forEach((rx) => {
    lines.push(
      `- Terapia Farmacológica: ${rx.drugName} (${rx.dosage}, ${rx.route}, ${rx.frequency}).`
    );
  });
  if (activeInfusions && activeInfusions.length > 0) {
    activeInfusions.forEach((inf) => {
      lines.push(
        `- Infusão em BIC Ativa: ${inf.protocol.drugName} a ${inf.calculation.rateMlPerHour} mL/h (${inf.calculation.formattedDose}).`
      );
    });
  }

  return lines.join('\n');
}

/**
 * Gera HTML estruturado e sanitizado (escapeHtml) para inserção direta no Editor Clínico A4 do PresCMed.
 */
export function buildScoreHtmlForA4(
  ctx: PepExportContext,
  format: 'SOAP' | 'SBAR' = 'SOAP'
): string {
  const { calculator, result, inputs, bedIdentifier, patientWeightKg, activeInfusions } = ctx;
  const tier = result.activeRiskTier;
  const findings = summarizePositiveFindings(calculator, inputs);
  const deviations = summarizeRadarDeviations(calculator, result.radarValues);

  const findingsHtml =
    findings.length > 0
      ? `<ul>${findings.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`
      : '<p>Parâmetros em linha de base fisiológica.</p>';

  const deviationsHtml = `<ul>${deviations.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;

  const nonRxHtml =
    tier.nonPharmacologicalActions.length > 0
      ? `<ul>${tier.nonPharmacologicalActions
          .map(
            (act) =>
              `<li><strong>[${escapeHtml(act.dispositionTarget)}] ${escapeHtml(act.recommendationTitle)}:</strong> ${escapeHtml(act.monitoringPlan)}</li>`
          )
          .join('')}</ul>`
      : '';

  const rxHtml =
    tier.pharmacologicalActions.length > 0
      ? `<ul>${tier.pharmacologicalActions
          .map(
            (rx) =>
              `<li><strong>${escapeHtml(rx.drugName)}:</strong> ${escapeHtml(rx.dosage)} — Via: ${escapeHtml(rx.route)} — Freq.: ${escapeHtml(rx.frequency)}${rx.dilutionInstructions ? ` <em>(Preparo: ${escapeHtml(rx.dilutionInstructions)})</em>` : ''}</li>`
          )
          .join('')}</ul>`
      : '';

  const bicHtml =
    activeInfusions && activeInfusions.length > 0
      ? `<ul>${activeInfusions
          .map(
            (inf) =>
              `<li><strong>${escapeHtml(inf.protocol.drugName)}:</strong> ${escapeHtml(inf.calculation.formattedDose)} → <strong>Vazão BIC: ${escapeHtml(String(inf.calculation.rateMlPerHour))} mL/h</strong> (${escapeHtml(inf.calculation.recommendedVehicle)})</li>`
          )
          .join('')}</ul>`
      : '';

  return [
    `<h2>AVALIAÇÃO POR ESCORE CLÍNICO (${escapeHtml(format)}) — ${escapeHtml(calculator.acronym)}</h2>`,
    `<p><strong>Ferramenta:</strong> ${escapeHtml(calculator.name)} (${escapeHtml(calculator.acronym)})</p>`,
    `<p><strong>Identificação Operacional:</strong> ${escapeHtml(sanitizeBedIdentifier(bedIdentifier))}${patientWeightKg ? ` | <strong>Peso:</strong> ${escapeHtml(String(patientWeightKg))} kg` : ''}</p>`,
    `<p><strong>Pontuação Calculada:</strong> ${escapeHtml(result.scoreFormatted)} pontos (Escala ${escapeHtml(String(calculator.minPossibleScore))} a ${escapeHtml(String(calculator.maxPossibleScore))})</p>`,
    `<p><strong>Estratificação de Risco:</strong> ${escapeHtml(tier.label)} [${escapeHtml(tier.severityLevel.toUpperCase())}]</p>`,
    `<p><strong>Desfecho Estatístico / Significado:</strong> ${escapeHtml(tier.statisticalOutcome)}</p>`,
    result.sscWarning
      ? `<p><strong>Alerta de Diretriz (SSC 2021):</strong> ${escapeHtml(result.sscWarning)}</p>`
      : '',
    `<h3>Parâmetros Pontuados à Beira do Leito</h3>`,
    findingsHtml,
    `<h3>Perfil de Desvio Fisiológico (Radar)</h3>`,
    deviationsHtml,
    nonRxHtml ? `<h3>Condutas Não-Farmacológicas e Monitorização</h3>${nonRxHtml}` : '',
    rxHtml ? `<h3>Intervenções Farmacológicas Recomendadas</h3>${rxHtml}` : '',
    bicHtml ? `<h3>Infusão Contínua em Bomba (BIC)</h3>${bicHtml}` : '',
    `<p><em>Fonte de Evidência: ${escapeHtml(calculator.evidenceSource)}</em></p>`,
  ]
    .filter(Boolean)
    .join('');
}

/**
 * Converte uma conduta farmacológica de um escore do Scoreboard em um `PrescriptionItem` do PresCMed.
 */
export function convertPharmacologicalActionToPrescriptionItem(
  action: PharmacologicalAction,
  calculatorAcronym: string
): PrescriptionItem {
  const instructionParts: string[] = [];
  if (action.dilutionInstructions && action.dilutionInstructions !== 'Não aplicável') {
    instructionParts.push(`Preparo/Diluição: ${action.dilutionInstructions}`);
  }
  if (action.renalAdjustment) {
    instructionParts.push(`Ajuste Renal: ${action.renalAdjustment}`);
  }
  if (action.contraindications) {
    instructionParts.push(`Cautelas: ${action.contraindications}`);
  }
  instructionParts.push(`[Origem: Escore ${calculatorAcronym}]`);

  return {
    id: `score-rx-${action.id}-${Date.now()}`,
    name: action.drugName,
    presentation: action.dosage,
    route: action.route || 'Intravenosa',
    quantity: 'Uso hospitalar / 1 esquema',
    doseCalculatedText: action.dosage,
    frequencyText: action.frequency || 'Conforme protocolo',
    scheduleInterval: 'Uso Contínuo',
    scheduleTimes: [],
    instructions: instructionParts.join(' | '),
    isContinuous: false,
  };
}
