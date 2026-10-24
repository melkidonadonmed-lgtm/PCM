import type {
  HospitalBedPatientRecord,
  HospitalImagingExamEntry,
  HospitalLabPanelEntry,
  HospitalSpecialtyTemplate,
} from '../../core/domain/clinicalEntities';
import { escapeHtml } from '../sanitizeHtml';

export const CANONICAL_LAB_MARKERS: ReadonlyArray<{
  key: string;
  label: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  criticalLow?: number;
  criticalHigh?: number;
}> = [
  { key: 'HB', label: 'HB', unit: 'g/dL', minNormal: 12.0, maxNormal: 16.5, criticalLow: 7.0, criticalHigh: 19.0 },
  { key: 'HT', label: 'HT', unit: '%', minNormal: 36, maxNormal: 50, criticalLow: 21, criticalHigh: 58 },
  { key: 'LEU', label: 'LEU', unit: '/mm³', minNormal: 4000, maxNormal: 11000, criticalLow: 1500, criticalHigh: 25000 },
  { key: 'SEG', label: 'SEG', unit: '%', minNormal: 40, maxNormal: 70 },
  { key: 'PLQ', label: 'PLQ', unit: '/mm³', minNormal: 150000, maxNormal: 450000, criticalLow: 50000, criticalHigh: 900000 },
  { key: 'CR', label: 'CR', unit: 'mg/dL', minNormal: 0.6, maxNormal: 1.2, criticalHigh: 3.5 },
  { key: 'UR', label: 'UR', unit: 'mg/dL', minNormal: 15, maxNormal: 45, criticalHigh: 140 },
  { key: 'NA', label: 'NA+', unit: 'mEq/L', minNormal: 135, maxNormal: 145, criticalLow: 125, criticalHigh: 155 },
  { key: 'K', label: 'K+', unit: 'mEq/L', minNormal: 3.5, maxNormal: 5.1, criticalLow: 2.8, criticalHigh: 6.0 },
  { key: 'CL', label: 'CL-', unit: 'mEq/L', minNormal: 98, maxNormal: 107 },
  { key: 'PCR', label: 'PCR', unit: 'mg/L', minNormal: 0, maxNormal: 5.0, criticalHigh: 100 },
];

export function parseDateBrOrIsoToIso(raw: string): string {
  const clean = (raw || '').trim();
  const brMatch = clean.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  return '';
}

export function formatIsoToDateBr(raw: string): string {
  const iso = parseDateBrOrIsoToIso(raw);
  if (!iso) return raw.trim();
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function calculatePatientAgeYearsFromDate(birthDateStr: string, refDateIso = '2026-10-24'): string {
  const birthIso = parseDateBrOrIsoToIso(birthDateStr);
  if (!birthIso) return '';
  const [by, bm, bd] = birthIso.split('-').map(Number);
  const [ry, rm, rd] = refDateIso.split('-').map(Number);
  if (!by || !ry) return '';
  let years = ry - by;
  if (rm < bm || (rm === bm && rd < bd)) {
    years -= 1;
  }
  if (years < 0 || years > 130) return '';
  return `${years} A`;
}

export function calculateHospitalStayDays(dihDateStr: string, refDateIso = '2026-10-24'): number {
  const dihIso = parseDateBrOrIsoToIso(dihDateStr);
  if (!dihIso) return 0;
  const startMs = Date.parse(`${dihIso}T00:00:00Z`);
  const endMs = Date.parse(`${refDateIso}T00:00:00Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return 1;
  return Math.floor((endMs - startMs) / 86400000) + 1;
}

export function sortLabPanelsChronologically(panels: HospitalLabPanelEntry[]): HospitalLabPanelEntry[] {
  return [...panels].sort((a, b) => {
    const isoA = a.dateIso || parseDateBrOrIsoToIso(a.dateBr) || '9999-99-99';
    const isoB = b.dateIso || parseDateBrOrIsoToIso(b.dateBr) || '9999-99-99';
    return isoA.localeCompare(isoB);
  });
}

export function sortImagingChronologically(exams: HospitalImagingExamEntry[]): HospitalImagingExamEntry[] {
  return [...exams].sort((a, b) => {
    const isoA = a.dateIso || parseDateBrOrIsoToIso(a.dateBr) || '9999-99-99';
    const isoB = b.dateIso || parseDateBrOrIsoToIso(b.dateBr) || '9999-99-99';
    return isoA.localeCompare(isoB);
  });
}

export function formatLabPanelCompactLine(panel: HospitalLabPanelEntry): string {
  if (panel.rawSummaryLine && Object.keys(panel.markers || {}).length === 0) {
    return `${panel.dateBr}: ${panel.rawSummaryLine}`;
  }
  const orderedParts: string[] = [];
  for (const meta of CANONICAL_LAB_MARKERS) {
    const val = panel.markers[meta.key] ?? panel.markers[meta.label];
    if (val !== undefined && val !== '') {
      const formattedVal = typeof val === 'number' ? String(val).replace('.', ',') : String(val);
      orderedParts.push(`${meta.label} ${formattedVal}`);
    }
  }
  for (const [k, v] of Object.entries(panel.markers || {})) {
    const alreadyIncluded = CANONICAL_LAB_MARKERS.some((m) => m.key === k || m.label === k);
    if (!alreadyIncluded && v !== undefined && v !== '') {
      orderedParts.push(`${k} ${String(v).replace('.', ',')}`);
    }
  }
  return `${panel.dateBr || 's/data'}: ${orderedParts.join(' | ')}`;
}

export interface LongitudinalMarkerDelta {
  key: string;
  label: string;
  unit: string;
  previousDateBr: string;
  latestDateBr: string;
  previousValue: number | null;
  latestValue: number;
  deltaNumeric: number | null;
  deltaPercent: number | null;
  direction: 'up' | 'down' | 'stable';
  alertLevel: 'normal' | 'abnormal' | 'critical';
}

export function computeLongitudinalLabDeltas(panels: HospitalLabPanelEntry[]): LongitudinalMarkerDelta[] {
  const sorted = sortLabPanelsChronologically(panels);
  if (sorted.length === 0) return [];
  const results: LongitudinalMarkerDelta[] = [];

  for (const meta of CANONICAL_LAB_MARKERS) {
    const points: Array<{ dateBr: string; value: number }> = [];
    for (const p of sorted) {
      const rawVal = p.markers[meta.key] ?? p.markers[meta.label];
      if (rawVal === undefined || rawVal === '') continue;
      const num = typeof rawVal === 'number' ? rawVal : Number(String(rawVal).replace(',', '.'));
      if (!Number.isNaN(num)) {
        points.push({ dateBr: p.dateBr, value: num });
      }
    }
    if (points.length === 0) continue;
    const latest = points[points.length - 1];
    const prev = points.length >= 2 ? points[points.length - 2] : null;
    const deltaNumeric = prev ? Number((latest.value - prev.value).toFixed(2)) : null;
    const deltaPercent = prev && prev.value !== 0 ? Number((((latest.value - prev.value) / prev.value) * 100).toFixed(1)) : null;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (deltaNumeric !== null && deltaPercent !== null) {
      if (Math.abs(deltaPercent) >= 2.5 || Math.abs(deltaNumeric) >= 0.2) {
        direction = deltaNumeric > 0 ? 'up' : 'down';
      }
    }

    let alertLevel: 'normal' | 'abnormal' | 'critical' = 'normal';
    if (
      (meta.criticalLow !== undefined && latest.value <= meta.criticalLow) ||
      (meta.criticalHigh !== undefined && latest.value >= meta.criticalHigh)
    ) {
      alertLevel = 'critical';
    } else if (latest.value < meta.minNormal || latest.value > meta.maxNormal) {
      alertLevel = 'abnormal';
    }

    results.push({
      key: meta.key,
      label: meta.label,
      unit: meta.unit,
      previousDateBr: prev ? prev.dateBr : '-',
      latestDateBr: latest.dateBr,
      previousValue: prev ? prev.value : null,
      latestValue: latest.value,
      deltaNumeric,
      deltaPercent,
      direction,
      alertLevel,
    });
  }
  return results;
}

export interface ConductEvolutionCorrelationItem {
  id: string;
  domain: 'infeccioso' | 'renal_hidrico' | 'hematologico' | 'eletrolitico' | 'geral';
  activeConductText: string;
  evolutionResponseText: string;
  efficacyStatus: 'favorable' | 'attention' | 'neutral';
}

export function analyzeConductVsEvolution(record: HospitalBedPatientRecord): ConductEvolutionCorrelationItem[] {
  const deltas = computeLongitudinalLabDeltas(record.labPanels);
  const insights: ConductEvolutionCorrelationItem[] = [];
  const activeMedsText = record.currentMedicationsAndDevices.map((m) => `${m.nameAndDetails} (${m.durationAndDates})`).join('; ');
  const conductsJoined = [...record.conductList, activeMedsText].join(' ').toLowerCase();

  const leuDelta = deltas.find((d) => d.key === 'LEU');
  const pcrDelta = deltas.find((d) => d.key === 'PCR');
  if (leuDelta || pcrDelta) {
    const dropping = (leuDelta?.direction === 'down') || (pcrDelta?.direction === 'down');
    const rising = (leuDelta?.direction === 'up' && leuDelta.alertLevel !== 'normal') || (pcrDelta?.direction === 'up' && pcrDelta.alertLevel !== 'normal');
    insights.push({
      id: 'corr-infec',
      domain: 'infeccioso',
      activeConductText: activeMedsText || 'Vigilância infecciosa / Antibioticoterapia em avaliação',
      evolutionResponseText: `${leuDelta ? `LEU ${leuDelta.previousValue ?? '-'} -> ${leuDelta.latestValue}/mm³` : ''} ${pcrDelta ? `| PCR ${pcrDelta.previousValue ?? '-'} -> ${pcrDelta.latestValue} mg/L` : ''}`.trim(),
      efficacyStatus: dropping ? 'favorable' : rising ? 'attention' : 'neutral',
    });
  }

  const crDelta = deltas.find((d) => d.key === 'CR');
  const kDelta = deltas.find((d) => d.key === 'K');
  if (crDelta || kDelta) {
    const worseningRenal = (crDelta && crDelta.direction === 'up' && crDelta.latestValue > 1.2) || (kDelta && kDelta.alertLevel === 'critical');
    insights.push({
      id: 'corr-renal',
      domain: 'renal_hidrico',
      activeConductText: record.hydrationApplicable && record.hydrationDescription
        ? `Hidratação: ${record.hydrationDescription}`
        : conductsJoined.includes('furosemida') ? 'Terapia diurética / controle de balanço' : 'Monitorização renal e hidroeletrolítica',
      evolutionResponseText: `${crDelta ? `CR ${crDelta.previousValue ?? '-'} -> ${crDelta.latestValue} mg/dL` : ''} ${kDelta ? `| K+ ${kDelta.previousValue ?? '-'} -> ${kDelta.latestValue} mEq/L` : ''}`.trim(),
      efficacyStatus: worseningRenal ? 'attention' : (crDelta?.direction === 'down' ? 'favorable' : 'neutral'),
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'corr-geral',
      domain: 'geral',
      activeConductText: record.conductList[0] || activeMedsText || 'Conduta clínica registrada no leito',
      evolutionResponseText: record.evolution24h || 'Aguardando novas aferições seriadas de exames e sinais vitais nas 24h.',
      efficacyStatus: 'neutral',
    });
  }
  return insights;
}

export function formatStandardHospitalEvolutionText(record: HospitalBedPatientRecord): string {
  const ageText = record.ageYearsText || calculatePatientAgeYearsFromDate(record.birthDateBr);
  const dnFormatted = record.birthDateBr
    ? `${record.birthDateBr}${ageText ? ` (${ageText})` : ''}`
    : '';
  const hdLines: string[] = [];
  for (const hd of record.diagnosticHypotheses) {
    if (hd.diseaseAndDate.trim()) {
      hdLines.push(`${hd.codeNumber} - ${hd.diseaseAndDate.trim()}`);
    }
    for (const sub of hd.subItems || []) {
      if (sub.diseaseAndDate.trim()) {
        hdLines.push(`${sub.codeNumber}- ${sub.diseaseAndDate.trim()}`);
      }
    }
  }

  const hfLines = record.familyAndSocialHistory.filter(Boolean).map((item) => `- ${item}`);
  const fezUsoLines = record.previousMedicationsAndDevices.map(
    (m) => `- ${m.nameAndDetails}${m.durationAndDates ? ` (${m.durationAndDates})` : ''}`
  );
  const emUsoLines = record.currentMedicationsAndDevices.map(
    (m) => `- ${m.nameAndDetails}${m.durationAndDates ? ` (${m.durationAndDates})` : ''}`
  );
  const labLines = sortLabPanelsChronologically(record.labPanels).map(formatLabPanelCompactLine);
  const imgLines = sortImagingChronologically(record.imagingExams).map(
    (img) => `${img.dateBr}: ${img.examModalityAndRegion} — ${img.findingsSummary}`
  );
  const customExamLines = (record.physicalExam.customSections || [])
    .filter((s) => s.title.trim() || s.content.trim())
    .map((s) => `${s.title.toUpperCase()}: ${s.content}`);

  const lines: string[] = [
    `EF/LT : ${record.wardAndBed}`,
    `ID: ${record.patientNameOrInitials}`,
    `DN: ${dnFormatted}`,
    `CNS: ${record.cns}`,
    `DIH: ${record.dihDateBr}`,
    `QP: ${record.chiefComplaintQp}`,
    `HD:`,
    ...(hdLines.length > 0 ? hdLines : ['1 - ']),
    `HDA: ${record.historyPresentIllnessHda}`,
    `ALERGIAS: ${record.allergiesText}`,
    `SOROLOGIAS: ${record.serologiesText}`,
    `HPP: ${record.pastMedicalHistoryHpp}`,
    `HF/SOCIAL:`,
    ...(hfLines.length > 0 ? hfLines : ['-']),
    ...(record.obstetricHistoryApplicable ? [`HISTÓRIA OBSTÉTRICA: ${record.obstetricHistoryText}`] : []),
    `FEZ USO:`,
    ...(fezUsoLines.length > 0 ? fezUsoLines : ['-']),
    `EM USO:`,
    ...(emUsoLines.length > 0 ? emUsoLines : ['-']),
    `EXAMES LAB:`,
    ...(labLines.length > 0 ? labLines : ['-']),
    `EXAMES DE IMAGEM:`,
    ...(imgLines.length > 0 ? imgLines : ['-']),
    `EXAME FÍSICO:`,
    `GERAL: ${record.physicalExam.geral}`,
    `SSVV: ${record.physicalExam.ssvv}`,
    `AR: ${record.physicalExam.ar}`,
    `AC: ${record.physicalExam.ac}`,
    ...(record.physicalExam.abd ? [`ABD: ${record.physicalExam.abd}`] : []),
    `MEMBROS E ANEXOS: ${record.physicalExam.membrosEAnexos}`,
    ...customExamLines,
    `EVOLUÇÃO 24H: ${record.evolution24h}`,
    ...(record.dietApplicable ? [`DIETA: ${record.dietDescription}`] : []),
    ...(record.hydrationApplicable ? [`HIDRATAÇÃO: ${record.hydrationDescription}`] : []),
    `Pareceres:`,
    ...(record.consultationsList.length > 0 ? record.consultationsList.map((c) => `- ${c}`) : ['-']),
    `PENDÊNCIAS:`,
    ...(record.pendingItemsList.length > 0 ? record.pendingItemsList.map((p) => `- ${p}`) : ['-']),
    `CD:`,
    ...(record.conductList.length > 0 ? record.conductList.map((c) => `- ${c}`) : ['-']),
  ];
  return lines.join('\n');
}

export function buildHospitalEvolutionHtmlForA4(record: HospitalBedPatientRecord): string {
  const rawText = formatStandardHospitalEvolutionText(record);
  const safeHtmlLines = rawText
    .split('\n')
    .map((line) => {
      const escaped = escapeHtml(line);
      if (/^(EF\/LT|ID|DN|CNS|DIH|QP|HD|HDA|ALERGIAS|SOROLOGIAS|HPP|HF\/SOCIAL|HISTÓRIA OBSTÉTRICA|FEZ USO|EM USO|EXAMES LAB|EXAMES DE IMAGEM|EXAME FÍSICO|EVOLUÇÃO 24H|DIETA|HIDRATAÇÃO|Pareceres|PENDÊNCIAS|CD)\b/.test(line)) {
        const idx = escaped.indexOf(':');
        if (idx !== -1) {
          return `<p><strong>${escaped.slice(0, idx + 1)}</strong>${escaped.slice(idx + 1)}</p>`;
        }
      }
      return `<p>${escaped}</p>`;
    })
    .join('');
  return `<div><h2>EVOLUÇÃO / ADMISSÃO HOSPITALAR — LEITO ${escapeHtml(record.wardAndBed)}</h2>${safeHtmlLines}</div>`;
}
