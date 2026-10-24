import type {
  HospitalBedChatMessage,
  HospitalBedPatientRecord,
} from '../../core/domain/clinicalEntities';
import {
  analyzeConductVsEvolution,
  calculateHospitalStayDays,
  computeLongitudinalLabDeltas,
} from './hospitalEvolutionFormatter';

export interface ScienceProtocolGuideline {
  id: string;
  title: string;
  societyAndYear: string;
  keywords: string[];
  summaryRecommendations: string[];
  citationRef: string;
}

export const SCIENCE_CLINICAL_GUIDELINES: readonly ScienceProtocolGuideline[] = [
  {
    id: 'sci-pac-sbpt',
    title: 'Pneumonia Adquirida na Comunidade (PAC) em Internação / Enfermaria',
    societyAndYear: 'SBPT / ATS-IDSA (2025-2026)',
    keywords: ['pneumonia', 'pac', 'ceftriaxona', 'azitromicina', 'curb', 'dispneia', 'pulmao', 'torax', 'antibiotico'],
    summaryRecommendations: [
      'Enfermaria (PAC não grave): Beta-lactâmico (Ceftriaxona 1-2 g/dia EV ou Ampicilina+Sulbactam) associado a Macrolídeo (Azitromicina 500 mg/dia) ou Fluoroquinolona respiratória em monoterapia.',
      'Transição EV para VO (Switch Therapy): Indicada quando paciente está hemodinamicamente estável, afebril por 24-48h, FR < 24 ipm, SpO2 >= 90% em ar ambiente e trato GI funcionante.',
      'Duração total: 5 a 7 dias na resposta clínica e laboratorial favorável (queda sustentada de leucócitos e PCR > 50%).',
    ],
    citationRef: 'Diretrizes Brasileiras para Pneumonia Adquirida na Comunidade em Adultos Imunocompetentes — SBPT / ATS-IDSA',
  },
  {
    id: 'sci-sepse-ssc',
    title: 'Manejo de Sepse e Choque Séptico — Pacote da 1ª Hora',
    societyAndYear: 'Surviving Sepsis Campaign / ILAS (2025)',
    keywords: ['sepse', 'choque', 'lactato', 'noradrenalina', 'cristaloide', 'hemocultura', 'infeccao', 'hipotensao'],
    summaryRecommendations: [
      'Coletar lactato sérico e 2 pares de hemoculturas antes do antimicrobiano (sem atrasar início > 45-60 min).',
      'Antimicrobiano de amplo espectro EV na 1ª hora para choque séptico ou alta probabilidade de sepse.',
      'Ressuscitação volêmica inicial com 30 mL/kg de cristaloide balanceado (Ringer Lactato) nas primeiras 3h se hipotensão ou lactato >= 4 mmol/L, guiada por reavaliação dinâmica.',
      'Vasopressor de 1ª escolha: Noradrenalina visando PAM >= 65 mmHg.',
    ],
    citationRef: 'Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock',
  },
  {
    id: 'sci-ira-kdigo',
    title: 'Injúria Renal Aguda (IRA) e Nefroproteção Hospitalar',
    societyAndYear: 'KDIGO Clinical Practice Guideline for AKI',
    keywords: ['renal', 'creatinina', 'ureia', 'diurese', 'potassio', 'kdigo', 'hidratacao', 'nefro'],
    summaryRecommendations: [
      'Estadiamento KDIGO 1: elevação de Creatinina >= 0,3 mg/dL em 48h ou 1,5 a 1,9x o basal, ou diurese < 0,5 mL/kg/h por 6-12h.',
      'Suspender agentes nefrotóxicos (AINEs, aminoglicosídeos, contraste iodado desnecessário) e ajustar doses de antimicrobianos pela TFG estimada.',
      'Monitorar balanço hídrico rigoroso, eletrólitos seriados (K+, Na+, pH/bicarbonato) e restaurar euvolemia com cristaloides isotônicos na IRA pré-renal.',
    ],
    citationRef: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury',
  },
  {
    id: 'sci-tev-profilaxia',
    title: 'Profilaxia de Tromboembolismo Venoso (TEV) em Pacientes Internados',
    societyAndYear: 'ACCP / Diretriz Brasileira de TEV (SBACV)',
    keywords: ['tev', 'enoxaparina', 'heparina', 'profilaxia', 'trombose', 'ortopedia', 'fratura', 'tibia'],
    summaryRecommendations: [
      'Pacientes clínicos agudamente enfermos com mobilidade reduzida (Escore de Pádua >= 4): Enoxaparina 40 mg SC 1x/dia (ajustar para 20 mg SC/dia ou HNF 5.000 UI 8/8h se ClCr < 30 mL/min).',
      'Cirurgia ortopédica de membros inferiores / osteossíntese de tíbia ou fêmur: profilaxia farmacológica associada à mobilização precoce por no mínimo 10 a 14 dias.',
      'Se contraindicação absoluta à anticoagulação (sangramento ativo ou plaquetas < 50.000/mm³): utilizar profilaxia mecânica (CPI).',
    ],
    citationRef: 'Diretrizes de Profilaxia de TEV em Pacientes Clínicos e Cirúrgicos — ACCP / SBACV',
  },
  {
    id: 'sci-ortopedia-atb',
    title: 'Profilaxia Antimicrobiana em Osteossíntese de Fraturas Fechadas e Expostas',
    societyAndYear: 'SBOT / AAOS / Guia Antimicrobiano MS',
    keywords: ['fratura', 'osteossintese', 'cefazolina', 'haste', 'ortopedia', 'trauma', 'compartimental'],
    summaryRecommendations: [
      'Fraturas fechadas submetidas a fixação interna (HIM / placa): Cefazolina 1-2 g EV na indução anestésica (até 60 min antes da incisão), mantendo por no máximo 24h no pós-operatório.',
      'Vigilância neurovascular seriada (dor desproporcional à extensão passiva, parestesia, pulso distal e tensão compartimental) nas primeiras 48h pós-trauma/osteossíntese.',
    ],
    citationRef: 'Diretrizes de Profilaxia Antimicrobiana em Cirurgia Ortopédica — SBOT / AAOS',
  },
];

export function queryScienceLiteratureAgent(queryText: string, bedRecord: HospitalBedPatientRecord): {
  replyText: string;
  citations: string[];
} {
  const normalized = `${queryText} ${bedRecord.diagnosticHypotheses.map((h) => h.diseaseAndDate).join(' ')} ${bedRecord.specialtyTemplate}`.toLowerCase();
  const matched = SCIENCE_CLINICAL_GUIDELINES.filter((g) =>
    g.keywords.some((kw) => normalized.includes(kw))
  );
  const selected = matched.length > 0 ? matched : SCIENCE_CLINICAL_GUIDELINES.slice(0, 2);

  const sections = selected.map(
    (g) =>
      `[${g.title} — ${g.societyAndYear}]\n` +
      g.summaryRecommendations.map((r) => `• ${r}`).join('\n')
  );

  const stayDays = calculateHospitalStayDays(bedRecord.dihDateBr);
  const contextHeader = bedRecord.patientNameOrInitials
    ? `Análise baseada em evidências contextualizada para o Leito ${bedRecord.wardAndBed} (${bedRecord.patientNameOrInitials}${stayDays > 0 ? ` • D${stayDays} de internação` : ''}):`
    : `Análise baseada em evidências para o Leito ${bedRecord.wardAndBed}:`;

  return {
    replyText: `${contextHeader}\n\n${sections.join('\n\n')}`,
    citations: selected.map((g) => g.citationRef),
  };
}

export function generateBedCopilotResponse(
  userPrompt: string,
  bedRecord: HospitalBedPatientRecord,
  channel: 'bed_copilot' | 'science_protocol' | 'live_voice'
): HospitalBedChatMessage {
  if (channel === 'science_protocol') {
    const sci = queryScienceLiteratureAgent(userPrompt, bedRecord);
    return {
      id: `msg-${Date.now()}`,
      role: 'science',
      channel: 'science_protocol',
      content: sci.replyText,
      evidenceCitations: sci.citations,
      createdAtIso: new Date().toISOString(),
    };
  }

  const deltas = computeLongitudinalLabDeltas(bedRecord.labPanels);
  const correlations = analyzeConductVsEvolution(bedRecord);
  const stayDays = calculateHospitalStayDays(bedRecord.dihDateBr);

  const allergyAlert = bedRecord.allergiesText
    ? `Alerta de Segurança Registrado — Alergias: ${bedRecord.allergiesText}.`
    : 'Alergias: Nenhuma alergia documentada até o momento.';

  const deltaSummary =
    deltas.length > 0
      ? deltas
          .map((d) => {
            const arrow = d.direction === 'up' ? '↑' : d.direction === 'down' ? '↓' : '=';
            return `${d.label}: ${d.previousValue !== null ? `${d.previousValue} -> ` : ''}${d.latestValue} ${d.unit} (${arrow})`;
          })
          .join(' | ')
      : 'Sem exames laboratoriais seriados cadastrados.';

  const conductVsEvoSummary = correlations
    .map((c) => `• [${c.domain.toUpperCase()}] Conduta: ${c.activeConductText} => Evolução: ${c.evolutionResponseText}`)
    .join('\n');

  const content = [
    `Resumo Auditado do Leito ${bedRecord.wardAndBed} (${bedRecord.patientNameOrInitials || 'Paciente sem ID'}${stayDays > 0 ? ` • D${stayDays}` : ''}):`,
    `1. ${allergyAlert}`,
    `2. Tendência Longitudinal de Exames: ${deltaSummary}`,
    `3. Cruzamento Conduta x Evolução:\n${conductVsEvoSummary}`,
    `4. Pendências Ativas: ${bedRecord.pendingItemsList.length > 0 ? bedRecord.pendingItemsList.join('; ') : 'Nenhuma pendência aberta.'}`,
  ].join('\n\n');

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    channel,
    content,
    evidenceCitations: ['Dados extraídos exclusivamente do prontuário estruturado do leito (Diretriz Zero Alucinação).'],
    createdAtIso: new Date().toISOString(),
  };
}
