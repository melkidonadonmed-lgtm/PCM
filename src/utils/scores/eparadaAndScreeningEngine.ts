import { escapeHtml } from '../sanitizeHtml';

// ============================================================================
// 1. MOTOR EPARADA (PCR ACLS / PALS + CAUSAS REVERSÍVEIS 5H / 5T)
// ============================================================================

export type PcrRhythmType = 'FV' | 'TVSP' | 'AESP' | 'ASSISTOLIA';

export interface EparadaDoseItem {
  id: string;
  drugOrAction: string;
  calculatedDose: string;
  preparationAndAdministration: string;
  ceilingApplied: boolean;
  clinicalAlert: string;
}

export interface EparadaCalculationResult {
  weightKg: number;
  isPediatric: boolean;
  isValidWeight: boolean;
  validationMessage?: string;
  doses: EparadaDoseItem[];
}

export interface ReversibleCause5H5T {
  id: string;
  group: '5H' | '5T';
  name: string;
  diagnosticClue: string;
  immediateIntervention: string;
}

export const REVERSIBLE_CAUSES_5H5T: ReversibleCause5H5T[] = [
  {
    id: '5h_hypovolemia',
    group: '5H',
    name: 'Hipovolemia',
    diagnosticClue: 'História de trauma, sangramento digestivo, diarreia/desidratação severa, turgor reduzido, VCI colabada ao POCUS.',
    immediateIntervention: 'Cristaloide aquecido 20 mL/kg IV/IO rápido + Controle de hemorragia externa + Transfusão maciça se choque hemorrágico.',
  },
  {
    id: '5h_hypoxia',
    group: '5H',
    name: 'Hipóxia',
    diagnosticClue: 'Cianose prévia, obstrução de via aérea, intubação esofágica ou seletiva, deslocamento do TOT (DOPE).',
    immediateIntervention: 'Ventilação com O2 a 100%, checar capnografia em forma de onda (ETCO2), garantir via aérea avançada patente.',
  },
  {
    id: '5h_hydrogen',
    group: '5H',
    name: 'Hidrogênio (Acidose Metabólica Grave)',
    diagnosticClue: 'IRC dialítica sem sessão, cetoacidose diabética, intoxicação exógena (tricíclicos/salicilatos), PCR prolongada (pH < 7,1).',
    immediateIntervention: 'Bicarbonato de Sódio 8,4% 1 mEq/kg (1 mL/kg) IV/IO lento e otimizar ventilação minuto.',
  },
  {
    id: '5h_kalemia',
    group: '5H',
    name: 'Hipo / Hipercalemia',
    diagnosticClue: 'IRC, uso de IECA/espironolactona, ondas T em tenda ou QRS alargado (HiperK) vs. onda U/uso de diuréticos (HipoK).',
    immediateIntervention: 'HiperK: Gluconato de Cálcio 10% 10-20 mL IV + Bicarbonato 50 mEq + Solução Polarizante (Glicose 50g + Regular 10 UI). HipoK: Reposição de K+ + Sulfato de Magnésio.',
  },
  {
    id: '5h_hypothermia',
    group: '5H',
    name: 'Hipotermia',
    diagnosticClue: 'Exposição ambiental ao frio, afogamento, infusão maciça de fluidos frios, temperatura central < 30°C.',
    immediateIntervention: 'Reaquecimento ativo externo e interno (fluidos IV aquecidos a 40°C); manter esforços de RCP até normotermia.',
  },
  {
    id: '5t_tension_pneumo',
    group: '5T',
    name: 'Tensão (Pneumotórax Hipertensivo)',
    diagnosticClue: 'Ausência unilateral de murmúrio vesicular, desvio traqueal, turgência jugular, ausência de lung sliding ao POCUS, alta pressão de pico na VM.',
    immediateIntervention: 'Descompressão torácica imediata por agulha/toracostomia digital (4º/5º EIC linha axilar anterior no adulto; 2º EIC LHC em pediatria) seguida de drenagem em selo d’água.',
  },
  {
    id: '5t_tamponade',
    group: '5T',
    name: 'Tamponamento Cardíaco',
    diagnosticClue: 'Trauma penetrante torácico, pós-operatório cardíaco, pericardiocentese recente, derrame pericárdico com colapso diastólico de VD ao POCUS.',
    immediateIntervention: 'Pericardiocentese de emergência guiada por ultrassom (subxifoide/paraesternal) ou toracotomia de reanimação se trauma penetrante.',
  },
  {
    id: '5t_toxins',
    group: '5T',
    name: 'Tóxicos / Intoxicação Exógena',
    diagnosticClue: 'Overdose de opioides, benzodiazepínicos, antidepressivos tricíclicos, betabloqueadores, bloqueadores de canal de cálcio ou anestésicos locais.',
    immediateIntervention: 'Antídoto específico: Naloxona (opioide), Bicarbonato de Sódio (tricíclicos), Glucagon/Cálcio/Insulina Euglicêmica (BB/BCC), Emulsão Lipídica 20% (anestésico local).',
  },
  {
    id: '5t_thrombosis_pe',
    group: '5T',
    name: 'Trombose Pulmonar (TEP Maciço)',
    diagnosticClue: 'História de TVP/imobilização/câncer, dilatação aguda severa do VD ao POCUS (sinal de McConnell / D-shape).',
    immediateIntervention: 'Trombólise sistêmica intra-PCR (Alteplase 50 mg IV em bolus, podendo repetir 50 mg após 15 min) e manter RCP por pelo menos 60-90 min pós-trombolítico.',
  },
  {
    id: '5t_thrombosis_mi',
    group: '5T',
    name: 'Trombose Coronariana (IAM Extenso)',
    diagnosticClue: 'Dor torácica típica prodrômica, supradesnivelamento de ST pré-PCR ou ritmo inicial chocável (FV/TVSP).',
    immediateIntervention: 'Desfibrilação precoce, estabilização pós-RCE com ECG de 12 derivações imediato e encaminhamento direto para Cinecoronariografia / ICP Primária.',
  },
];

/**
 * Calcula doses determinísticas de PCR (ACLS Adulto / PALS Pediátrico) com trava "Sem peso, sem dose"
 * e tetos de segurança adultos obrigatórios.
 */
export function calculateEparadaDoses(
  weightKg: number,
  isPediatricMode: boolean = false
): EparadaCalculationResult {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return {
      weightKg: 0,
      isPediatric: isPediatricMode,
      isValidWeight: false,
      validationMessage:
        'TRAVA DE SEGURANÇA ("Sem peso, sem dose"): Informe um peso corporal válido (> 0 kg) para calcular as doses de emergência e desfibrilação.',
      doses: [],
    };
  }

  const isPed = isPediatricMode || weightKg < 45;

  // 1. Epinefrina (0,01 mg/kg IV/IO, máx 1 mg = 10 mL da solução 1:10.000)
  const rawEpiMg = weightKg * 0.01;
  const epiCeiling = rawEpiMg >= 1.0 || !isPed;
  const finalEpiMg = isPed ? Math.min(1.0, Number(rawEpiMg.toFixed(2))) : 1.0;
  const finalEpiMlDiluted = Number((finalEpiMg * 10).toFixed(1));

  // 2. Choque Desfibrilação Bifásica (PALS: 1º choque 2 J/kg, 2º choque 4 J/kg, máx 200 J)
  const rawShock1J = Math.round(weightKg * 2);
  const rawShock2J = Math.round(weightKg * 4);
  const finalShock1J = isPed ? Math.min(200, rawShock1J) : 200;
  const finalShock2J = isPed ? Math.min(200, rawShock2J) : 200;

  // 3. Amiodarona FV/TVSP refratária (5 mg/kg, máx 300 mg 1ª dose / 150 mg 2ª dose)
  const rawAmio1Mg = Math.round(weightKg * 5);
  const finalAmio1Mg = isPed ? Math.min(300, rawAmio1Mg) : 300;
  const finalAmio2Mg = isPed ? Math.min(150, rawAmio1Mg) : 150;

  // 4. Lidocaína alternativa à Amiodarona (1 mg/kg, máx 100 mg)
  const rawLidoMg = Math.round(weightKg * 1);
  const finalLidoMg = isPed ? Math.min(100, rawLidoMg) : 100;

  // 5. Sulfato de Magnésio (Torsades de Pointes: 50 mg/kg, máx 2.000 mg = 2 g)
  const rawMagMg = Math.round(weightKg * 50);
  const finalMagMg = Math.min(2000, rawMagMg);

  // 6. Sequência Rápida de Intubação (SRI: Etomidato 0,3 mg/kg, Cetamina 1,5 mg/kg, Rocurônio 1,2 mg/kg)
  const etomidateMg = Number((weightKg * 0.3).toFixed(1));
  const ketamineMg = Number((weightKg * 1.5).toFixed(1));
  const rocuroniumMg = Number((weightKg * 1.2).toFixed(1));

  const doses: EparadaDoseItem[] = [
    {
      id: 'eparada_epi',
      drugOrAction: 'Adrenalina (Epinefrina) IV / IO',
      calculatedDose: `${finalEpiMg} mg (${finalEpiMlDiluted} mL da diluição 1:10.000)`,
      preparationAndAdministration: isPed
        ? `Diluir 1 ampola (1 mg/1 mL) + 9 mL de SF 0,9% (0,1 mg/mL) e administrar ${finalEpiMlDiluted} mL em bolus seguido de flush de 5-10 mL SF 0,9% a cada 3 a 5 min.`
        : 'Administrar 1 ampola (1 mg = 1 mL) pura ou diluída para 10 mL seguido de flush de 20 mL de SF 0,9% e elevação do membro a cada 3 a 5 min.',
      ceilingApplied: epiCeiling,
      clinicalAlert: 'Ritmo Não-Chocável (AESP/Assistolia): administrar IMEDIATAMENTE. Ritmo Chocável (FV/TVSP): administrar após o 2º choque.',
    },
    {
      id: 'eparada_shock',
      drugOrAction: 'Carga de Desfibrilação Bifásica (FV / TV sem pulso)',
      calculatedDose: `1º Choque: ${finalShock1J} J | 2º Choque e subsequentes: ${finalShock2J} J`,
      preparationAndAdministration: 'Retomar compressões torácicas IMEDIATAMENTE após o choque por 2 minutos antes de checar pulso ou ritmo.',
      ceilingApplied: finalShock1J >= 200 || finalShock2J >= 200,
      clinicalAlert: isPed
        ? 'Em pediatria: 1º choque 2 J/kg, 2º choque 4 J/kg, subsequentes >= 4 J/kg (máx 10 J/kg ou carga de adulto 200 J).'
        : 'Adulto (Bifásico): 200 J (ou carga máxima recomendada pelo fabricante).',
    },
    {
      id: 'eparada_amio',
      drugOrAction: 'Amiodarona IV / IO (FV / TVSP Refratária)',
      calculatedDose: `1ª Dose: ${finalAmio1Mg} mg | 2ª Dose: ${finalAmio2Mg} mg`,
      preparationAndAdministration: `Apresentação 150 mg/3 mL (${(finalAmio1Mg / 50).toFixed(1)} mL na 1ª dose). Administrar em bolus rápido durante a PCR seguido de flush de SF 0,9%.`,
      ceilingApplied: finalAmio1Mg >= 300,
      clinicalAlert: 'Indicada após o 3º choque em FV/TV sem pulso refratária.',
    },
    {
      id: 'eparada_lido',
      drugOrAction: 'Lidocaína 2% sem Vasoconstritor IV / IO (Alternativa)',
      calculatedDose: `1ª Dose: ${finalLidoMg} mg (${(finalLidoMg / 20).toFixed(1)} mL de Lidocaína 2%)`,
      preparationAndAdministration: '20 mg/mL (frasco 2%). Dose subsequente de 0,5 a 0,75 mg/kg se persistência de FV/TVSP.',
      ceilingApplied: finalLidoMg >= 100,
      clinicalAlert: 'Alternativa de primeira linha caso Amiodarona indisponível.',
    },
    {
      id: 'eparada_mag',
      drugOrAction: 'Sulfato de Magnésio IV / IO (Torsades de Pointes)',
      calculatedDose: `${finalMagMg} mg (${(finalMagMg / 1000).toFixed(1)} g)`,
      preparationAndAdministration: 'Diluir em 10 mL de SG 5% ou SF 0,9% e administrar em bolus lento (1-2 min na PCR por Torsades).',
      ceilingApplied: finalMagMg >= 2000,
      clinicalAlert: 'Específico para TV Polimórfica associada a intervalo QT longo (Torsades de Pointes) ou hipomagnesemia severa.',
    },
    {
      id: 'eparada_rsi',
      drugOrAction: 'Kit Rápido de Via Aérea / SRI Pós-RCE',
      calculatedDose: `Etomidato: ${etomidateMg} mg | Cetamina: ${ketamineMg} mg | Rocurônio: ${rocuroniumMg} mg`,
      preparationAndAdministration: 'Confirmar posição do tubo endotraqueal obrigatoriamente com Capnografia em forma de onda (ETCO2). Após via aérea avançada: 1 ventilação a cada 6s (10 irpm) no adulto ou a cada 2-3s (20-30 irpm) na criança.',
      ceilingApplied: false,
      clinicalAlert: 'Meta Pós-RCE: SpO2 92–98%, PaCO2 35–45 mmHg, PAM >= 65 mmHg (PAS >= 90 mmHg) e controle direcionado de temperatura (evitar febre > 37,7°C).',
    },
  ];

  return {
    weightKg,
    isPediatric: isPed,
    isValidWeight: true,
    doses,
  };
}

export interface PcrLogSummaryInput {
  rhythm: PcrRhythmType;
  weightKg: number;
  elapsedSeconds: number;
  cyclesCount: number;
  shocksCount: number;
  epinephrineCount: number;
  amiodaroneCount: number;
  checkedCausesIds: string[];
  outcome: 'EM_ANDAMENTO' | 'RCE_ATINGIDO' | 'OBITO_CONSTATADO';
}

export function formatPcrSummaryNote(input: PcrLogSummaryInput): string {
  const mins = Math.floor(input.elapsedSeconds / 60);
  const secs = input.elapsedSeconds % 60;
  const durationFormatted = `${String(mins).padStart(2, '0')}m${String(secs).padStart(2, '0')}s`;
  const checkedCauses = REVERSIBLE_CAUSES_5H5T.filter((c) =>
    input.checkedCausesIds.includes(c.id)
  );

  const outcomeLabel =
    input.outcome === 'RCE_ATINGIDO'
      ? 'RETORNO DA CIRCULAÇÃO ESPONTÂNEA (RCE) — INICIADO PACOTE PÓS-PCR'
      : input.outcome === 'OBITO_CONSTATADO'
        ? 'AUSÊNCIA DE RESPOSTA ÀS MANOBRAS DE REANIMAÇÃO — ÓBITO CONSTATADO'
        : 'REANIMAÇÃO CARDIOPULMONAR EM ANDAMENTO';

  return [
    '======================================================================',
    'REGISTRO ESTRUTURADO DE ATENDIMENTO À PARADA CARDIORRESPIRATÓRIA (EPARADA / ACLS-PALS)',
    '======================================================================',
    `- Ritmo Inicial Identificado: ${input.rhythm} (${input.rhythm === 'FV' || input.rhythm === 'TVSP' ? 'Ritmo Chocável' : 'Ritmo Não-Chocável'})`,
    `- Peso de Referência: ${input.weightKg} kg | Tempo Total Registrado: ${durationFormatted}`,
    `- Ciclos de RCP (2 min): ${input.cyclesCount} ciclo(s)`,
    `- Desfibrilações Aplicadas: ${input.shocksCount} choque(s)`,
    `- Doses de Adrenalina (1 mg / 0,01 mg/kg): ${input.epinephrineCount} dose(s)`,
    `- Doses de Antiarrítmico (Amiodarona/Lidocaína): ${input.amiodaroneCount} dose(s)`,
    `- Causas Reversíveis (5H e 5T) Revisadas/Tratadas: ${checkedCauses.length > 0 ? checkedCauses.map((c) => c.name).join(', ') : 'Em investigação sistemática'}`,
    `- Desfecho Atual: ${outcomeLabel}`,
    '======================================================================',
  ].join('\n');
}

export function buildPcrSummaryHtmlForA4(input: PcrLogSummaryInput): string {
  const note = formatPcrSummaryNote(input);
  return `<h2>REGISTRO DE REANIMAÇÃO CARDIOPULMONAR (EPARADA ACLS/PALS)</h2><pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${escapeHtml(note)}</pre>`;
}

// ============================================================================
// 2. RASTREIO ONCOLÓGICO FÁCIL (MAMA, COLO DO ÚTERO E PRÓSTATA — INCA / MS)
// ============================================================================

export type BiradsCategory = '0' | '1' | '2' | '3' | '4' | '5' | '6' | 'SEM_EXAME_PREVIO';

export type CervicalCytologyResult =
  | 'SEM_EXAME_PREVIO'
  | 'NORMAL_BENIGNO'
  | 'ASC_US'
  | 'ASC_H'
  | 'LSIL'
  | 'HSIL'
  | 'AGC'
  | 'CARCINOMA';

export interface OncologyScreeningRecommendation {
  domain: 'MAMA' | 'COLO_UTERO' | 'PROSTATA';
  title: string;
  riskLevel: 'low' | 'intermediate' | 'high' | 'critical';
  guidelineSource: string;
  conductSummary: string;
  followUpInterval: string;
  sigtapCode: string;
  sigtapExamName: string;
  presetExamId: string;
  soapSnippet: string;
}

export function evaluateBreastScreening(params: {
  ageYears: number;
  highFamilyOrGeneticRisk: boolean;
  palpableNoduleOrRedFlag: boolean;
  birads: BiradsCategory;
}): OncologyScreeningRecommendation {
  const { ageYears, highFamilyOrGeneticRisk, palpableNoduleOrRedFlag, birads } = params;

  if (palpableNoduleOrRedFlag || birads === '4' || birads === '5') {
    return {
      domain: 'MAMA',
      title:
        birads === '4' || birads === '5'
          ? `BI-RADS ${birads} — Lesão Suspeita de Malignidade (Biópsia Obrigatória)`
          : 'Sinal de Alerta Mamário / Nódulo Palpável (Investigação Diagnóstica)',
      riskLevel: 'critical',
      guidelineSource: 'Diretrizes para a Detecção Precoce do Câncer de Mama no Brasil (INCA / Ministério da Saúde)',
      conductSummary:
        birads === '4' || birads === '5'
          ? 'Indicação formal de estudo histopatológico percutâneo imediato (Core Biopsy / Mamotomia guiada por imagem) e encaminhamento prioritário à Mastologia.'
          : 'Presença de nódulo palpável, descarga papilar sanguinolenta/água de rocha ou retração cutânea exige Mamografia Diagnóstica + USG Mamária e avaliação mastológica prioritária.',
      followUpInterval: 'Imediato (Prioridade Oncológica — Lei dos 30/60 dias SUS)',
      sigtapCode: '02.04.03.003-0',
      sigtapExamName: 'Mamografia Diagnóstica + Core Biopsy (02.01.01.056-9)',
      presetExamId: 'mamografia',
      soapSnippet: `[Rastreio/Investigação Mamária — ${birads === 'SEM_EXAME_PREVIO' ? 'Sinal de Alerta Clínico' : `BI-RADS ${birads}`}]: Solicitada Mamografia Diagnóstica (SIGTAP 02.04.03.003-0) / Core Biopsy mamária (02.01.01.056-9) e encaminhamento prioritário à Mastologia.`,
    };
  }

  if (birads === '0') {
    return {
      domain: 'MAMA',
      title: 'BI-RADS 0 — Avaliação Incompleta (Necessita Complementação por Imagem)',
      riskLevel: 'intermediate',
      guidelineSource: 'ACR BI-RADS / INCA / Ministério da Saúde',
      conductSummary:
        'Solicitar Ultrassonografia Mamária Bilateral ou incidências mamográficas complementares (compressão localizada / magnificação) para classificação definitiva.',
      followUpInterval: 'Imediato (Complementação Diagnóstica)',
      sigtapCode: '02.05.02.009-7',
      sigtapExamName: 'Ultrassonografia de Mama Bilateral (Complemento BI-RADS 0)',
      presetExamId: 'usg-mamas',
      soapSnippet:
        '[Rastreio Mamário — BI-RADS 0]: Avaliação mamográfica incompleta. Solicitada Ultrassonografia de Mamas Bilateral (SIGTAP 02.05.02.009-7) / compressão focal.',
    };
  }

  if (birads === '3') {
    return {
      domain: 'MAMA',
      title: 'BI-RADS 3 — Achado Provavelmente Benigno (< 2% de risco de malignidade)',
      riskLevel: 'intermediate',
      guidelineSource: 'INCA / Ministério da Saúde',
      conductSummary:
        'Controle radiológico semestral no 1º ano (0, 6 e 12 meses) e anual até completar 24–36 meses de estabilidade documentada.',
      followUpInterval: 'Repetir exame de imagem em 6 meses',
      sigtapCode: '02.04.03.003-0',
      sigtapExamName: 'Mamografia Diagnóstica de Controle Semestral (BI-RADS 3)',
      presetExamId: 'mamografia',
      soapSnippet:
        '[Rastreio Mamário — BI-RADS 3]: Achado provavelmente benigno. Orientado controle radiológico em 6 meses (SIGTAP 02.04.03.003-0).',
    };
  }

  if (birads === '6') {
    return {
      domain: 'MAMA',
      title: 'BI-RADS 6 — Malignidade Já Comprovada por Biópsia',
      riskLevel: 'high',
      guidelineSource: 'INCA / Ministério da Saúde',
      conductSummary:
        'Manter seguimento especializado em UNACON/CACON para estadiamento, planejamento cirúrgico ou avaliação de resposta à terapia neoadjuvante.',
      followUpInterval: 'Seguimento Oncológico / Mastologia',
      sigtapCode: '02.04.03.003-0',
      sigtapExamName: 'Mamografia Diagnóstica (Avaliação Terapêutica BI-RADS 6)',
      presetExamId: 'mamografia',
      soapSnippet:
        '[Seguimento Oncológico Mamário — BI-RADS 6]: Lesão com malignidade confirmada em acompanhamento especializado (Mastologia/Oncologia).',
    };
  }

  // BI-RADS 1, 2 ou Sem Exame Prévio
  const inTargetAge = ageYears >= 50 && ageYears <= 69;
  const shouldScreenAnnualHighRisk = highFamilyOrGeneticRisk && ageYears >= 35;

  return {
    domain: 'MAMA',
    title: shouldScreenAnnualHighRisk
      ? 'Alto Risco Familiar/Genético (>= 35 anos) — Rastreamento Anual Individualizado'
      : inTargetAge
        ? 'Faixa Etária Alvo (50 a 69 anos) — Mamografia de Rastreamento Bienal'
        : 'Fora da Faixa Etária Padrão (50–69 anos) — Decisão Compartilhada / Educação em Saúde',
    riskLevel: shouldScreenAnnualHighRisk ? 'intermediate' : 'low',
    guidelineSource: 'INCA / Ministério da Saúde (Portaria de Rastreamento Mamográfico)',
    conductSummary: shouldScreenAnnualHighRisk
      ? 'Em mulheres com risco elevado (parente de 1º grau com CA de mama < 50 anos, CA bilateral, CA de ovário ou masculino, ou mutação BRCA1/2), realizar acompanhamento clínico e mamográfico anual a partir dos 35 anos.'
      : inTargetAge
        ? 'Recomendação oficial do Ministério da Saúde/INCA: Mamografia Bilateral de Rastreamento a cada 2 anos para mulheres assintomáticas de 50 a 69 anos.'
        : 'Abaixo de 50 anos ou acima de 69 anos sem alto risco familiar, o MS/INCA recomenda evitar rastreamento oportunístico de rotina e priorizar conscientização dos sinais de alerta mamários.',
    followUpInterval: shouldScreenAnnualHighRisk ? 'Anual (12 meses)' : inTargetAge ? 'Bienal (a cada 2 anos)' : 'Individualizado / Conscientização clínica',
    sigtapCode: '02.04.03.018-8',
    sigtapExamName: 'Mamografia Bilateral para Rastreamento (SIGTAP 02.04.03.018-8)',
    presetExamId: 'mamografia',
    soapSnippet: `[Rastreio de Câncer de Mama — Idade ${ageYears}a${birads !== 'SEM_EXAME_PREVIO' ? ` | BI-RADS ${birads}` : ''}]: ${shouldScreenAnnualHighRisk ? 'Rastreamento anual por alto risco familiar.' : 'Rastreamento mamográfico bienal (50-69 anos) conforme diretriz INCA/MS (SIGTAP 02.04.03.018-8).'}`,
  };
}

export function evaluateCervicalScreening(params: {
  ageYears: number;
  twoConsecutiveAnnualNormals: boolean;
  immunosuppressedOrHiv: boolean;
  cytologyResult: CervicalCytologyResult;
}): OncologyScreeningRecommendation {
  const { ageYears, twoConsecutiveAnnualNormals, immunosuppressedOrHiv, cytologyResult } = params;

  if (
    cytologyResult === 'HSIL' ||
    cytologyResult === 'ASC_H' ||
    cytologyResult === 'AGC' ||
    cytologyResult === 'CARCINOMA'
  ) {
    return {
      domain: 'COLO_UTERO',
      title: `Citologia Alterada de Alto Grau (${cytologyResult.replace('_', '-')}) — Colposcopia Imediata`,
      riskLevel: 'critical',
      guidelineSource: 'Diretrizes Brasileiras para o Rastreamento do Câncer do Colo do Útero (INCA / MS)',
      conductSummary:
        'Encaminhamento imediato à unidade de referência de Patologia do Trato Genital Inferior para realização de Colposcopia e biópsia dirigida (se AGC em > 35 anos ou sangramento anormal, incluir avaliação endometrial com USG transvaginal).',
      followUpInterval: 'Imediato — Encaminhamento para Colposcopia',
      sigtapCode: '02.03.01.008-6',
      sigtapExamName: 'Exame Citopatológico Cervicovaginal + Encaminhamento para Colposcopia',
      presetExamId: 'papanicolaou',
      soapSnippet: `[Rastreio Cervical — Laudo ${cytologyResult.replace('_', '-')}]: Lesão intraepitelial de alto grau/atipia glandular. Encaminhada prioritariamente para Colposcopia conforme diretriz INCA/MS.`,
    };
  }

  if (cytologyResult === 'ASC_US' || cytologyResult === 'LSIL') {
    const interval =
      ageYears < 25
        ? 'Repetir citopatológico em 3 anos'
        : ageYears <= 29
          ? 'Repetir citopatológico em 12 meses'
          : 'Repetir citopatológico em 6 meses';
    return {
      domain: 'COLO_UTERO',
      title: `Atipia Escamosa / Lesão de Baixo Grau (${cytologyResult.replace('_', '-')}) — Controle Citológico`,
      riskLevel: 'intermediate',
      guidelineSource: 'Diretrizes Brasileiras INCA / Ministério da Saúde',
      conductSummary: `${interval} na Atenção Primária (se imunossuprimida/HIV+, encaminhar diretamente para Colposcopia no primeiro exame alterado). Se a alteração persistir na repetição, encaminhar para Colposcopia.`,
      followUpInterval: immunosuppressedOrHiv ? 'Imediato (Colposcopia por imunossupressão)' : interval,
      sigtapCode: '02.03.01.008-6',
      sigtapExamName: 'Exame Citopatológico Cervicovaginal de Controle (SIGTAP 02.03.01.008-6)',
      presetExamId: 'papanicolaou',
      soapSnippet: `[Rastreio Cervical — ${cytologyResult.replace('_', '-')}]: Conduta conservadora conforme faixa etária (${ageYears}a): ${immunosuppressedOrHiv ? 'encaminhamento para Colposcopia por imunossupressão' : interval}.`,
    };
  }

  // Normal ou Sem Exame Prévio
  const intervalText = immunosuppressedOrHiv
    ? 'Semestral no 1º ano e Anual se CD4 > 200 células/mm³ (Semestral enquanto CD4 < 200)'
    : ageYears < 25
      ? 'Não indicado antes dos 25 anos (alta taxa de regressão espontânea de NIC I/HPV transitório)'
      : ageYears > 64 && twoConsecutiveAnnualNormals
        ? 'Rastreamento pode ser encerrado após os 64 anos se pelo menos 2 exames negativos nos últimos 5 anos'
        : twoConsecutiveAnnualNormals
          ? 'Trienal (a cada 3 anos) após 2 exames anuais consecutivos normais'
          : 'Anual (repetir em 12 meses até completar 2 exames anuais consecutivos negativos; depois, a cada 3 anos)';

  return {
    domain: 'COLO_UTERO',
    title:
      ageYears >= 25 && ageYears <= 64
        ? `População-Alvo (25 a 64 anos) — Periodicidade ${twoConsecutiveAnnualNormals ? 'Trienal (3 anos)' : 'Anual Inicial'}`
        : `Faixa Etária ${ageYears} anos — Orientação de Rastreamento Cervical`,
    riskLevel: 'low',
    guidelineSource: 'Diretrizes Brasileiras para o Rastreamento do Câncer do Colo do Útero (INCA / MS)',
    conductSummary: `População-alvo oficial: mulheres de 25 a 64 anos que já iniciaram atividade sexual. Periodicidade recomendada: ${intervalText}. Garantir representação da Junção Escamocolunar (epitélio escamoso + glandular/metaplásico).`,
    followUpInterval: intervalText,
    sigtapCode: '02.03.01.008-6',
    sigtapExamName: 'Exame Citopatológico Cervicovaginal/Microflora-Rastreamento (02.03.01.008-6)',
    presetExamId: 'papanicolaou',
    soapSnippet: `[Rastreio de Câncer do Colo do Útero — ${ageYears}a]: Solicitado/avaliado Citopatológico Oncótico Cervicovaginal (SIGTAP 02.03.01.008-6). Seguimento: ${intervalText}.`,
  };
}

export function evaluateProstateScreening(params: {
  ageYears: number;
  highRiskFamilyOrAncestry: boolean;
  psaTotalNgMl?: number;
  freeToTotalRatioPct?: number;
  abnormalDigitalRectalExam: boolean;
}): OncologyScreeningRecommendation {
  const {
    ageYears,
    highRiskFamilyOrAncestry,
    psaTotalNgMl,
    freeToTotalRatioPct,
    abnormalDigitalRectalExam,
  } = params;

  const psaElevated =
    psaTotalNgMl !== undefined &&
    ((ageYears < 60 && psaTotalNgMl >= 2.5) || psaTotalNgMl >= 4.0);
  const lowFreeRatio =
    freeToTotalRatioPct !== undefined &&
    psaTotalNgMl !== undefined &&
    psaTotalNgMl >= 2.5 &&
    psaTotalNgMl <= 10.0 &&
    freeToTotalRatioPct < 15;

  if (
    abnormalDigitalRectalExam ||
    (psaTotalNgMl !== undefined && psaTotalNgMl > 10.0) ||
    lowFreeRatio
  ) {
    return {
      domain: 'PROSTATA',
      title: 'Suspeita Elevada de Neoplasia Prostática — Avaliação Urológica / RM Multiparamétrica / Biópsia',
      riskLevel: 'high',
      guidelineSource: 'Sociedade Brasileira de Urologia (SBU) / Nota Técnica MS & INCA (Decisão Compartilhada)',
      conductSummary:
        'Toque retal suspeito (nódulo/endurecimento), PSA Total > 10 ng/mL ou Relação PSA Livre/Total < 15% na zona cinzenta (4–10 ng/mL) indica encaminhamento prioritário à Urologia para RM Multiparamétrica de Próstata (PI-RADS) e/ou Biópsia Prostática Transretal/Transperineal.',
      followUpInterval: 'Encaminhamento Prioritário à Urologia',
      sigtapCode: '02.02.03.010-5',
      sigtapExamName: 'Dosagem de PSA Total e Livre (02.02.03.010-5) + Encaminhamento Urologia',
      presetExamId: 'psa',
      soapSnippet: `[Avaliação Prostática — Idade ${ageYears}a${psaTotalNgMl !== undefined ? ` | PSA Total: ${psaTotalNgMl} ng/mL` : ''}${freeToTotalRatioPct !== undefined ? ` | Relação L/T: ${freeToTotalRatioPct}%` : ''}]: Critério para investigação urológica especializada (RM Multiparamétrica / Biópsia).`,
    };
  }

  if (psaElevated) {
    return {
      domain: 'PROSTATA',
      title: `PSA na Zona Cinzenta (${psaTotalNgMl} ng/mL) — Confirmar PSA Livre/Total e Excluir Prostatite/ITU`,
      riskLevel: 'intermediate',
      guidelineSource: 'SBU / Ministério da Saúde (Decisão Compartilhada)',
      conductSummary:
        'Repetir PSA Total + PSA Livre após 4 a 6 semanas (respeitando abstinência ejaculatória de 48h, sem exercício de ciclismo ou manipulação uretral recente) e correlacionar com velocidade/densidade do PSA.',
      followUpInterval: 'Reavaliação laboratorial em 4 a 6 semanas com relação PSA Livre/Total',
      sigtapCode: '02.02.03.010-5',
      sigtapExamName: 'Dosagem de Antígeno Prostático Específico — PSA Total e Livre (02.02.03.010-5)',
      presetExamId: 'psa',
      soapSnippet: `[Avaliação Prostática — PSA ${psaTotalNgMl} ng/mL]: Solicitada repetição confirmatória com Relação PSA Livre/Total (SIGTAP 02.02.03.010-5) após orientação de preparo pré-analítico.`,
    };
  }

  const targetAgeStart = highRiskFamilyOrAncestry ? 45 : 50;
  return {
    domain: 'PROSTATA',
    title: `Decisão Compartilhada Individualizada (A partir dos ${targetAgeStart} anos, até 75 anos)`,
    riskLevel: 'low',
    guidelineSource: 'Ministério da Saúde / INCA & Sociedade Brasileira de Urologia (SBU)',
    conductSummary:
      'O MS/INCA preconiza que o rastreamento populacional em massa não deve ser imposto sem esclarecimento; quando o homem (50–75 anos, ou >= 45 anos se história familiar de 1º grau ou negro) opta pela avaliação precoce após decisão compartilhada sobre benefícios e riscos (sobrediagnóstico/biópsia), solicita-se PSA Total e exame clínico.',
    followUpInterval:
      psaTotalNgMl !== undefined && psaTotalNgMl < 1.0
        ? 'A cada 2 anos se PSA basal < 1,0 ng/mL (ou anual se fatores de risco)'
        : 'Anual a bienal conforme decisão compartilhada',
    sigtapCode: '02.02.03.010-5',
    sigtapExamName: 'Dosagem de Antígeno Prostático Específico — PSA (SIGTAP 02.02.03.010-5)',
    presetExamId: 'psa',
    soapSnippet: `[Saúde do Homem — Decisão Compartilhada (${ageYears}a)]: Orientados riscos e benefícios do rastreio prostático (INCA/SBU). Solicitada dosagem de PSA Total (SIGTAP 02.02.03.010-5).`,
  };
}
