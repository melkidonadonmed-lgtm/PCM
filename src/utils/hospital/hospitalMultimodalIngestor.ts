import type {
  DiagnosticHypothesisItem,
  HospitalBedPatientRecord,
  HospitalImagingExamEntry,
  HospitalLabPanelEntry,
  HospitalSpecialtyTemplate,
  MedicationOrDeviceEntry,
} from '../../core/domain/clinicalEntities';
import {
  calculatePatientAgeYearsFromDate,
  parseDateBrOrIsoToIso,
  sortImagingChronologically,
  sortLabPanelsChronologically,
} from './hospitalEvolutionFormatter';

export function createEmptyHospitalBedRecord(
  wardAndBed = '110-15',
  specialtyTemplate: HospitalSpecialtyTemplate = 'enfermaria_clinica',
  nowMs: number = Date.now()
): HospitalBedPatientRecord {
  return {
    id: `bed-${wardAndBed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    wardAndBed,
    wardName: `Enfermaria ${wardAndBed.split('-')[0] || 'Geral'}`,
    specialtyTemplate,
    patientNameOrInitials: '',
    birthDateBr: '',
    ageYearsText: '',
    cns: '',
    dihDateBr: '',
    chiefComplaintQp: '',
    diagnosticHypotheses: [{ id: 'hd-1', codeNumber: '1', diseaseAndDate: '', subItems: [] }],
    historyPresentIllnessHda: '',
    allergiesText: '',
    serologiesText: '',
    pastMedicalHistoryHpp: '',
    familyAndSocialHistory: [],
    obstetricHistoryApplicable: false,
    obstetricHistoryText: '',
    previousMedicationsAndDevices: [],
    currentMedicationsAndDevices: [],
    labPanels: [],
    imagingExams: [],
    scoreEntries: [],
    physicalExam: {
      geral: '',
      ssvv: '',
      ar: '',
      ac: '',
      abd: '',
      membrosEAnexos: '',
      customSections: [],
    },
    evolution24h: '',
    dietApplicable: true,
    dietDescription: '',
    hydrationApplicable: false,
    hydrationDescription: '',
    consultationsList: [],
    pendingItemsList: [],
    conductList: [],
    evolutionHistoryTimeline: [],
    chatMessages: [],
    updatedAt: nowMs,
  };
}

export const DEFAULT_HOSPITAL_BEDS_SEED: HospitalBedPatientRecord[] = [
  {
    ...createEmptyHospitalBedRecord('110-15', 'enfermaria_clinica'),
    id: 'bed-110-15',
    wardName: 'Enfermaria Clínica 110',
    patientNameOrInitials: 'M. A. S. (Pront. 48291)',
    birthDateBr: '14/05/1962',
    ageYearsText: '64 A',
    cns: '704801239481029',
    dihDateBr: '20/10/2026',
    chiefComplaintQp: '"Falta de ar aos pequenos esforços e tosse com catarro há 4 dias"',
    diagnosticHypotheses: [
      {
        id: 'hd-1',
        codeNumber: '1',
        diseaseAndDate: 'Pneumonia Adquirida na Comunidade — CURB-65 2 (20/10/2026)',
        cid10: 'J18.9',
        subItems: [
          {
            id: 'hd-1-1',
            codeNumber: '1.1',
            diseaseAndDate: 'Injúria Renal Aguda KDIGO 1 pré-renal em resolução (20/10/2026)',
          },
        ],
      },
    ],
    historyPresentIllnessHda:
      '20/10/2026: Admitido com febre (38,6 °C), dispneia, taquipneia (FR 26 ipm) e consolidação em base direita. Iniciado Ceftriaxona + Azitromicina EV. 22/10/2026: Afebril há 24h, redução da necessidade de O2 suplementar. 24/10/2026: Estável em ar ambiente, aceitando bem dieta via oral.',
    allergiesText: 'Dipirona (urticária documentada em 2019)',
    serologiesText: 'HIV NR | VDRL NR | HBsAg NR | Anti-HCV NR (20/10/2026)',
    pastMedicalHistoryHpp: 'HAS há 12 anos, ex-tabagista (20 anos-maço, cessou há 8 anos)',
    familyAndSocialHistory: ['Mora com esposa em área urbana saneada', 'Nega etilismo atual'],
    previousMedicationsAndDevices: [
      {
        id: 'prev-1',
        nameAndDetails: 'Cateter Nasal de O2 2 L/min',
        kind: 'device',
        durationAndDates: '3 dias (20/10/2026 a 23/10/2026)',
        status: 'fez_uso',
      },
    ],
    currentMedicationsAndDevices: [
      {
        id: 'curr-1',
        nameAndDetails: 'Ceftriaxona 1 g EV 12/12h',
        kind: 'medication',
        durationAndDates: 'D4/D7 (início 20/10/2026)',
        status: 'em_uso',
      },
      {
        id: 'curr-2',
        nameAndDetails: 'Azitromicina 500 mg VO 24/24h',
        kind: 'medication',
        durationAndDates: 'D4/D5 (início 20/10/2026)',
        status: 'em_uso',
      },
      {
        id: 'curr-3',
        nameAndDetails: 'Enoxaparina 40 mg SC 24/24h (Profilaxia TEV)',
        kind: 'medication',
        durationAndDates: 'Em uso desde 20/10/2026',
        status: 'em_uso',
      },
      {
        id: 'curr-4',
        nameAndDetails: 'Acesso Venoso Periférico em MSE salinizado',
        kind: 'device',
        durationAndDates: 'Troca em 22/10/2026 (D2)',
        status: 'em_uso',
      },
    ],
    labPanels: [
      {
        id: 'lab-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        markers: { HB: 12.8, HT: 38, LEU: 16400, SEG: 82, PLQ: 245000, CR: 1.6, UR: 68, NA: 137, K: 4.4, CL: 101, PCR: 142 },
      },
      {
        id: 'lab-2',
        dateBr: '22/10/2026',
        dateIso: '2026-10-22',
        markers: { HB: 12.5, HT: 37, LEU: 11900, SEG: 74, PLQ: 260000, CR: 1.2, UR: 48, NA: 139, K: 4.2, CL: 102, PCR: 68 },
      },
      {
        id: 'lab-3',
        dateBr: '24/10/2026',
        dateIso: '2026-10-24',
        markers: { HB: 12.6, HT: 38, LEU: 8600, SEG: 64, PLQ: 272000, CR: 0.9, UR: 34, NA: 140, K: 4.1, CL: 103, PCR: 19 },
      },
    ],
    imagingExams: [
      {
        id: 'img-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        examModalityAndRegion: 'Radiografia de Tórax PA e Perfil',
        findingsSummary: 'Hipotransparência heterogênea com broncograma aéreo em lobo inferior direito; seios costofrênicos livres.',
      },
    ],
    scoreEntries: [
      {
        id: 'score-110-curb-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        recordedAtIso: '2026-10-20T09:15:00',
        calculatorId: 'calc_curb65',
        acronym: 'CURB-65',
        calculatorName: 'CURB-65 (Gravidade de Pneumonia Adquirida na Comunidade)',
        scoreNumeric: 2,
        scoreFormatted: '2',
        minPossibleScore: 0,
        maxPossibleScore: 5,
        severityLevel: 'intermediate',
        riskLabel: 'Risco Intermediário — Considerar Internação Hospitalar',
        findingsSummary: 'Ureia > 50 mg/dL (UR 68); FR >= 30 ou taquipneia admissional',
        recommendedConducts: ['Ceftriaxona 1 g EV 12/12h + Azitromicina 500 mg/dia', 'Monitorização de SpO2 e função renal'],
      },
      {
        id: 'score-110-curb-2',
        dateBr: '22/10/2026',
        dateIso: '2026-10-22',
        recordedAtIso: '2026-10-22T08:30:00',
        calculatorId: 'calc_curb65',
        acronym: 'CURB-65',
        calculatorName: 'CURB-65 (Gravidade de Pneumonia Adquirida na Comunidade)',
        scoreNumeric: 1,
        scoreFormatted: '1',
        minPossibleScore: 0,
        maxPossibleScore: 5,
        severityLevel: 'low',
        riskLabel: 'Baixo Risco — Evolução Clínica Favorável em Enfermaria',
        findingsSummary: 'Resolução da azotemia (UR 48 mg/dL) e eupneico',
      },
      {
        id: 'score-110-curb-3',
        dateBr: '24/10/2026',
        dateIso: '2026-10-24',
        recordedAtIso: '2026-10-24T08:00:00',
        calculatorId: 'calc_curb65',
        acronym: 'CURB-65',
        calculatorName: 'CURB-65 (Gravidade de Pneumonia Adquirida na Comunidade)',
        scoreNumeric: 0,
        scoreFormatted: '0',
        minPossibleScore: 0,
        maxPossibleScore: 5,
        severityLevel: 'low',
        riskLabel: 'Baixo Risco (Mortalidade < 1,5%) — Elegível para Switch Oral / Alta',
        findingsSummary: 'LOTE, UR 34 mg/dL, FR 18 ipm, PA 124/78 mmHg, 64 anos',
      },
      {
        id: 'score-110-qsofa-1',
        dateBr: '20/10/2026',
        dateIso: '2026-10-20',
        recordedAtIso: '2026-10-20T09:20:00',
        calculatorId: 'calc_qsofa',
        acronym: 'qSOFA',
        calculatorName: 'Quick SOFA (Sepsis-3)',
        scoreNumeric: 1,
        scoreFormatted: '1',
        minPossibleScore: 0,
        maxPossibleScore: 3,
        severityLevel: 'low',
        riskLabel: 'Baixo Risco na Triagem Rápida (1 pt)',
        findingsSummary: 'FR >= 22 ipm na admissão; Glasgow 15; PAS > 100 mmHg',
      },
      {
        id: 'score-110-qsofa-2',
        dateBr: '24/10/2026',
        dateIso: '2026-10-24',
        recordedAtIso: '2026-10-24T08:05:00',
        calculatorId: 'calc_qsofa',
        acronym: 'qSOFA',
        calculatorName: 'Quick SOFA (Sepsis-3)',
        scoreNumeric: 0,
        scoreFormatted: '0',
        minPossibleScore: 0,
        maxPossibleScore: 3,
        severityLevel: 'low',
        riskLabel: 'Baixo Risco (0 pts — Parâmetros Fisiológicos Normais)',
        findingsSummary: 'FR 18 ipm, Glasgow 15, PAS 124 mmHg',
      },
    ],
    physicalExam: {
      geral: 'BEG, LOTE, corado, hidratado, acianótico, anictérico, afebril.',
      ssvv: 'PA 124/78 mmHg | FC 78 bpm | FR 18 ipm | SpO2 96% em ar ambiente | Tax 36,6 °C',
      ar: 'MV presente bilateralmente, estertores crepitantes finos residuais em base pulmonar direita, sem tiragem.',
      ac: 'RCR em 2T, BNF, sem sopros audíveis. TEC < 2s.',
      abd: 'Plano, flácido, RHA+, indolor à palpação superficial e profunda.',
      membrosEAnexos: 'Extremidades aquecidas, pulsos pediosos simétricos, panturrilhas livres e sem edema.',
      customSections: [],
    },
    evolution24h:
      'Paciente permaneceu afebril nas últimas 24h, SSVV estáveis, diurese espontânea clara (~1.600 mL/24h), boa aceitação da dieta oral, deambulando pelo quarto com auxílio da enfermagem.',
    vitalSignsLatest: {
      measuredAtIso: '2026-10-24T07:00:00',
      paSystolicMmHg: 124,
      paDiastolicMmHg: 78,
      heartRateBpm: 78,
      respiratoryRateIpm: 18,
      temperatureCelsius: 36.6,
      spo2Percent: 96,
    },
    dietApplicable: true,
    dietDescription: 'Dieta branda hipossódica via oral',
    hydrationApplicable: false,
    hydrationDescription: '',
    consultationsList: ['Fisioterapia respiratória: cinesioterapia motora e reexpansiva 2x/dia'],
    pendingItemsList: ['Avaliar transição para antibioticoterapia oral (switch therapy) no D5', 'Programar alta hospitalar após 48h afebril em AA'],
    conductList: [
      'Manter Ceftriaxona 1 g EV 12/12h (D4/D7) e Azitromicina 500 mg VO (D4/D5)',
      'Manter profilaxia de TEV com Enoxaparina 40 mg SC/dia',
      'Fisioterapia respiratória e deambulação assistida',
    ],
  },
  {
    ...createEmptyHospitalBedRecord('204-02', 'ortopedia'),
    id: 'bed-204-02',
    wardName: 'Enfermaria Ortopedia 204',
    patientNameOrInitials: 'R. F. O. (Pront. 51092)',
    birthDateBr: '08/11/1988',
    ageYearsText: '37 A',
    cns: '709281726354102',
    dihDateBr: '22/10/2026',
    chiefComplaintQp: '"Dor intensa e incapacidade de apoiar a perna direita após queda de moto"',
    diagnosticHypotheses: [
      {
        id: 'hd-ort-1',
        codeNumber: '1',
        diseaseAndDate: 'Fratura fechada diafisária de tíbia direita AO 42-A2 (22/10/2026)',
        cid10: 'S82.2',
        subItems: [],
      },
    ],
    historyPresentIllnessHda:
      '22/10/2026: Admitido no trauma após colisão motociclística com deformidade em perna direita, sem perda de consciência. Imobilizado com tala inguinopodal. 23/10/2026: Submetido a osteossíntese com haste intramedular bloqueada sem intercorrências.',
    allergiesText: 'Nega alergias medicamentosas conhecidas',
    serologiesText: 'Testes rápidos admissionais não reagentes (22/10/2026)',
    pastMedicalHistoryHpp: 'Hígido previamente, nega comorbidades',
    familyAndSocialHistory: ['Motoboy', 'Nega tabagismo'],
    currentMedicationsAndDevices: [
      { id: 'ort-m1', nameAndDetails: 'Cefazolina 1 g EV 8/8h (profilaxia cirúrgica)', kind: 'medication', durationAndDates: '24h pós-op (23/10 a 24/10/2026)', status: 'em_uso' },
      { id: 'ort-m2', nameAndDetails: 'Enoxaparina 40 mg SC 24/24h', kind: 'medication', durationAndDates: 'Início 23/10/2026', status: 'em_uso' },
    ],
    labPanels: [
      { id: 'ort-l1', dateBr: '22/10/2026', dateIso: '2026-10-22', markers: { HB: 14.2, HT: 42, LEU: 10800, PLQ: 290000, CR: 0.9, NA: 140, K: 4.1 } },
      { id: 'ort-l2', dateBr: '24/10/2026', dateIso: '2026-10-24', markers: { HB: 12.4, HT: 37, LEU: 9200, PLQ: 265000, CR: 0.8, NA: 139, K: 4.0 } },
    ],
    imagingExams: [
      { id: 'ort-i1', dateBr: '23/10/2026', dateIso: '2026-10-23', examModalityAndRegion: 'RX de Perna Direita AP/Perfil Pós-Operatório', findingsSummary: 'Alinhamento anatômico satisfatório com haste intramedular bloqueada proximal e distal.' },
    ],
    scoreEntries: [
      {
        id: 'score-204-padua-1',
        dateBr: '23/10/2026',
        dateIso: '2026-10-23',
        recordedAtIso: '2026-10-23T14:00:00',
        calculatorId: 'calc_padua',
        acronym: 'Pádua',
        calculatorName: 'Escore de Pádua / Risco de TEV Hospitalar',
        scoreNumeric: 5,
        scoreFormatted: '5',
        minPossibleScore: 0,
        maxPossibleScore: 20,
        severityLevel: 'high',
        riskLabel: 'Alto Risco de TEV (>= 4 pts) — Tromboprofilaxia Farmacológica Indicada',
        findingsSummary: 'Mobilidade reduzida pós-osteossíntese (3 pts) + trauma/cirurgia recente <= 1 mês (2 pts)',
        recommendedConducts: ['Enoxaparina 40 mg SC 24/24h'],
      },
    ],
    physicalExam: {
      geral: 'BEG, LOTE, corado, hidratado, afebril.',
      ssvv: 'PA 118/74 mmHg | FC 72 bpm | FR 16 ipm | SpO2 98% AA | Tax 36,4 °C',
      ar: 'MV+ bilateral sem ruídos adventícios.',
      ac: 'RCR 2T BNF sem sopros.',
      membrosEAnexos: 'Curativo limpo e seco em joelho/perna direita.',
      customSections: [
        {
          id: 'cust-ort-1',
          title: 'EXAME NEUROVASCULAR DISTAL (MID)',
          content: 'Pulso tibial posterior e pedioso 4+/4+, perfusão < 2s, sensibilidade e motricidade do nervo fibular preservadas, compartimentos flácidos.',
        },
      ],
    },
    evolution24h: '1º PO de HIM de tíbia direita, dor controlada (EVA 2/10), sem sinais de síndrome compartimental.',
    dietApplicable: true,
    dietDescription: 'Dieta livre via oral',
    hydrationApplicable: false,
    hydrationDescription: '',
    consultationsList: ['Fisioterapia motora: treino de marcha com muletas e carga parcial conforme tolerado'],
    pendingItemsList: ['Retirada de pontos em 14 dias no ambulatório de Ortopedia'],
    conductList: ['Suspender Cefazolina após completar 24h pós-op', 'Treino de marcha com fisioterapia e programação de alta'],
  },
];

export interface MultimodalExtractionResult {
  sourceLabel: string;
  extractedFieldsCount: number;
  chronologicalDatesFound: string[];
  verifiedExcerpts: Array<{ field: string; value: string; sourceQuote: string }>;
  partialRecord: Partial<HospitalBedPatientRecord>;
}

export function extractStructuredHospitalDataFromRawInput(
  rawInput: string,
  sourceLabel = 'Texto / Documento Importado'
): MultimodalExtractionResult {
  const text = (rawInput || '').replace(/\r\n/g, '\n').trim();
  const verifiedExcerpts: Array<{ field: string; value: string; sourceQuote: string }> = [];
  const partial: Partial<HospitalBedPatientRecord> = {};

  const matchField = (labelRegex: RegExp, fieldName: string): string => {
    const m = text.match(labelRegex);
    if (m && m[1]?.trim()) {
      const val = m[1].trim();
      verifiedExcerpts.push({ field: fieldName, value: val, sourceQuote: m[0].trim() });
      return val;
    }
    return '';
  };

  const efLt = matchField(/(?:EF\s*\/\s*LT|LEITO)\s*:\s*([^\n]+)/i, 'EF/LT');
  if (efLt) partial.wardAndBed = efLt;

  const idVal = matchField(/(?:^|\n)ID\s*:\s*([^\n]+)/i, 'ID');
  if (idVal) partial.patientNameOrInitials = idVal;

  const dnRaw = matchField(/(?:^|\n)DN\s*:\s*(\d{2}\/\d{2}\/\d{4})/i, 'DN');
  if (dnRaw) {
    partial.birthDateBr = dnRaw;
    partial.ageYearsText = calculatePatientAgeYearsFromDate(dnRaw);
  }

  const cnsVal = matchField(/(?:^|\n)CNS\s*:\s*([0-9\s.-]{10,20})/i, 'CNS');
  if (cnsVal) partial.cns = cnsVal.replace(/\D/g, '');

  const dihVal = matchField(/(?:^|\n)DIH\s*:\s*(\d{2}\/\d{2}\/\d{4})/i, 'DIH');
  if (dihVal) partial.dihDateBr = dihVal;

  const qpVal = matchField(/(?:^|\n)QP\s*:\s*([^\n]+)/i, 'QP');
  if (qpVal) partial.chiefComplaintQp = qpVal;

  const hdaVal = matchField(/(?:^|\n)HDA\s*:\s*([^\n]+(?:\n(?!(?:ALERGIAS|SOROLOGIAS|HPP|EXAMES|CD|FEZ USO|EM USO)\s*:)[^\n]+)*)/i, 'HDA');
  if (hdaVal) partial.historyPresentIllnessHda = hdaVal.replace(/\s+/g, ' ').trim();

  const alergiasVal = matchField(/(?:^|\n)ALERGIAS?\s*:\s*([^\n]+)/i, 'ALERGIAS');
  if (alergiasVal) partial.allergiesText = alergiasVal;

  const sorologiasVal = matchField(/(?:^|\n)SOROLOGIAS?\s*:\s*([^\n]+)/i, 'SOROLOGIAS');
  if (sorologiasVal) partial.serologiesText = sorologiasVal;

  const hppVal = matchField(/(?:^|\n)HPP\s*:\s*([^\n]+)/i, 'HPP');
  if (hppVal) partial.pastMedicalHistoryHpp = hppVal;

  const evo24Val = matchField(/(?:^|\n)EVOLU[CÇ][AÃ]O\s*24H\s*:\s*([^\n]+)/i, 'EVOLUÇÃO 24H');
  if (evo24Val) partial.evolution24h = evo24Val;

  const dietaVal = matchField(/(?:^|\n)DIETA\s*:\s*([^\n]+)/i, 'DIETA');
  if (dietaVal) {
    partial.dietApplicable = true;
    partial.dietDescription = dietaVal;
  }

  const hidraVal = matchField(/(?:^|\n)HIDRATA[CÇ][AÃ]O\s*:\s*([^\n]+)/i, 'HIDRATAÇÃO');
  if (hidraVal) {
    partial.hydrationApplicable = true;
    partial.hydrationDescription = hidraVal;
  }

  // Extrai linhas laboratoriais com data (DD/MM/AAAA: HB ... | HT ... | LEU ...)
  const labPanels: HospitalLabPanelEntry[] = [];
  const labLineRegex = /(\d{2}\/\d{2}\/\d{4})\s*:\s*([^\n]*(?:\b(?:HB|HT|LEU|PLQ|CR|UR|NA\+?|K\+?|CL-?|PCR)\b)[^\n]*)/gi;
  let labMatch: RegExpExecArray | null;
  while ((labMatch = labLineRegex.exec(text)) !== null) {
    const dateBr = labMatch[1];
    const rawLine = labMatch[2].trim();
    const markers: Record<string, number | string> = {};
    const tokenRegex = /\b(HB|HT|LEU|SEG|PLQ|CR|UR|NA|K|CL|PCR)\s*[+:-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi;
    let tok: RegExpExecArray | null;
    while ((tok = tokenRegex.exec(rawLine)) !== null) {
      const key = tok[1].toUpperCase();
      const num = Number(tok[2].replace(',', '.'));
      if (!Number.isNaN(num)) {
        markers[key] = num;
      }
    }
    labPanels.push({
      id: `lab-imp-${dateBr.replace(/\//g, '')}-${labPanels.length + 1}`,
      dateBr,
      dateIso: parseDateBrOrIsoToIso(dateBr),
      markers,
      rawSummaryLine: rawLine,
      sourceQuote: labMatch[0].trim(),
    });
    verifiedExcerpts.push({
      field: `EXAMES LAB (${dateBr})`,
      value: rawLine,
      sourceQuote: labMatch[0].trim(),
    });
  }
  if (labPanels.length > 0) {
    partial.labPanels = sortLabPanelsChronologically(labPanels);
  }

  const allDates = Array.from(new Set((text.match(/\b\d{2}\/\d{2}\/\d{4}\b/g) || []))).sort((a, b) =>
    parseDateBrOrIsoToIso(a).localeCompare(parseDateBrOrIsoToIso(b))
  );

  return {
    sourceLabel,
    extractedFieldsCount: verifiedExcerpts.length,
    chronologicalDatesFound: allDates,
    verifiedExcerpts,
    partialRecord: partial,
  };
}

export function mergeExtractedHospitalDataIntoBed(
  current: HospitalBedPatientRecord,
  extraction: MultimodalExtractionResult
): HospitalBedPatientRecord {
  const p = extraction.partialRecord;
  const mergedLabs = p.labPanels?.length
    ? sortLabPanelsChronologically([...current.labPanels, ...p.labPanels])
    : current.labPanels;
  const mergedImgs: HospitalImagingExamEntry[] = p.imagingExams?.length
    ? sortImagingChronologically([...current.imagingExams, ...p.imagingExams])
    : current.imagingExams;
  const mergedHyps: DiagnosticHypothesisItem[] = p.diagnosticHypotheses?.length
    ? p.diagnosticHypotheses
    : current.diagnosticHypotheses;
  const mergedCurrMeds: MedicationOrDeviceEntry[] = p.currentMedicationsAndDevices?.length
    ? [...current.currentMedicationsAndDevices, ...p.currentMedicationsAndDevices]
    : current.currentMedicationsAndDevices;

  return {
    ...current,
    wardAndBed: p.wardAndBed || current.wardAndBed,
    patientNameOrInitials: p.patientNameOrInitials || current.patientNameOrInitials,
    birthDateBr: p.birthDateBr || current.birthDateBr,
    ageYearsText: p.ageYearsText || current.ageYearsText,
    cns: p.cns || current.cns,
    dihDateBr: p.dihDateBr || current.dihDateBr,
    chiefComplaintQp: p.chiefComplaintQp || current.chiefComplaintQp,
    diagnosticHypotheses: mergedHyps,
    historyPresentIllnessHda: p.historyPresentIllnessHda || current.historyPresentIllnessHda,
    allergiesText: p.allergiesText || current.allergiesText,
    serologiesText: p.serologiesText || current.serologiesText,
    pastMedicalHistoryHpp: p.pastMedicalHistoryHpp || current.pastMedicalHistoryHpp,
    evolution24h: p.evolution24h || current.evolution24h,
    dietApplicable: p.dietApplicable ?? current.dietApplicable,
    dietDescription: p.dietDescription || current.dietDescription,
    hydrationApplicable: p.hydrationApplicable ?? current.hydrationApplicable,
    hydrationDescription: p.hydrationDescription || current.hydrationDescription,
    currentMedicationsAndDevices: mergedCurrMeds,
    labPanels: mergedLabs,
    imagingExams: mergedImgs,
    updatedAt: Date.now(),
  };
}
