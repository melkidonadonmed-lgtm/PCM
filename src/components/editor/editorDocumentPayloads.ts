import {
  Patient,
  PrescriptionItem,
  MedicalCertificate,
  MedicalReferral,
  DocumentHeaderConfig,
  DocumentOrientation,
  DocumentViaLayout,
} from '../../types';
import { escapeHtml } from '../../utils/sanitizeHtml';
import {
  INITIAL_EDITOR_CONTENT,
  PresetQuickTemplateType,
  formatPrescriptionItemsList,
} from './editorConfigAndFormatters';

export function buildActiveReferralPayload(
  patient: Patient,
  referral: MedicalReferral | undefined,
  currentHeader: DocumentHeaderConfig
) {
  const pName = escapeHtml(
    patient?.name?.trim() || referral?.patientName?.trim() || '______________________________'
  );
  const pDoc = escapeHtml(patient?.documentNumber || referral?.documentNumber || '____________________');
  const pAge = escapeHtml(patient?.ageText || (patient?.birthDate ? patient.birthDate : ''));
  const today =
    referral?.date ||
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const priorityLabel = escapeHtml((referral?.priority || 'eletivo').toUpperCase());
  const rawSpecialty = referral?.destinationSpecialty || 'Especialidade Médica';
  const specialty = escapeHtml(rawSpecialty);
  const institution = escapeHtml(
    referral?.destinationInstitution || 'Serviço de Referência / Atenção Especializada'
  );
  const reason = escapeHtml(referral?.reason || 'Avaliação e conduta especializada.');
  const summary = escapeHtml(referral?.clinicalSummary || 'Quadro clínico em investigação.');
  const exams = escapeHtml(referral?.relevantExams || 'Sem exames complementares anexados.');
  const cid = escapeHtml(referral?.hypothesisCID || 'A esclarecer.');

  const referralHtml = `
    <p style="text-align: center;"><strong>GUIA DE ENCAMINHAMENTO MÉDICO</strong></p>
    <p style="text-align: center; font-size: 0.9em; color: #475569;"><strong>PRIORIDADE: [ ${priorityLabel} ]</strong></p>
    <p></p>
    <p><strong>Ao Serviço / Colega:</strong> ${specialty}</p>
    <p><strong>Instituição de Destino:</strong> ${institution}</p>
    <p></p>
    <p><strong>Paciente:</strong> ${pName} &nbsp;|&nbsp; <strong>Doc:</strong> ${pDoc}${pAge ? ` &nbsp;|&nbsp; <strong>Idade:</strong> ${pAge}` : ''}</p>
    <p></p>
    <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 12px 0;" />
    <p><strong>1. Motivo do Encaminhamento:</strong></p>
    <p style="margin-left: 16px; color: #1e293b;">${reason}</p>
    <p></p>
    <p><strong>2. História Clínica & Exame Físico Relevante:</strong></p>
    <p style="margin-left: 16px; color: #1e293b;">${summary}</p>
    <p></p>
    <p><strong>3. Exames Complementares Realizados:</strong></p>
    <p style="margin-left: 16px; color: #1e293b;">${exams}</p>
    <p></p>
    <p><strong>4. Hipótese Diagnóstica (CID-10):</strong></p>
    <p style="margin-left: 16px; color: #1e293b;">${cid}</p>
    <p></p>
    <p>Agradeço a atenção e coloco-me à disposição para discussão do caso.</p>
  `;

  const nextHeader: DocumentHeaderConfig = {
    ...currentHeader,
    showHeader: true,
    showFooter: true,
    showPatientBanner: false,
    badgeText: `ENCAMINHAMENTO • ${rawSpecialty.toUpperCase()}`,
    dateText: today,
  };

  return {
    specialty: rawSpecialty,
    referralHtml,
    nextHeader,
  };
}

export function buildActiveCertificatePayload(
  patient: Patient,
  certificate: MedicalCertificate | undefined,
  currentHeader: DocumentHeaderConfig
) {
  const pName = escapeHtml(
    patient?.name?.trim() || certificate?.patientName?.trim() || '______________________________'
  );
  const pDoc = escapeHtml(patient?.documentNumber || certificate?.documentNumber || '____________________');
  const days = certificate?.daysOff || 1;
  const daysText = escapeHtml(days === 1 ? '1 (um) dia' : `${days} dias`);
  const period = escapeHtml(certificate?.periodText || 'por motivo de doença e necessidade de repouso');
  const today =
    certificate?.date ||
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const cidText =
    certificate?.includeCID && certificate?.cid10Code
      ? `<p><strong>Diagnóstico (CID-10):</strong> ${escapeHtml(certificate.cid10Code)}${certificate.cid10Description ? ` - ${escapeHtml(certificate.cid10Description)}` : ''} <em>(Expressamente autorizado pelo paciente)</em></p><p></p>`
      : '';
  const obsText = certificate?.observations
    ? `<p><strong>Observações:</strong> ${escapeHtml(certificate.observations)}</p><p></p>`
    : '';
  const addr = currentHeader.clinicAddress;

  const certHtml = `
    <p style="text-align: center;"><strong>ATESTADO MÉDICO</strong></p>
    <p></p>
    <p style="text-align: justify; line-height: 1.8;">
      Atesto para os devidos fins que o(a) paciente <strong>${pName}</strong>, inscrito(a) no documento nº <strong>${pDoc}</strong>, foi submetido(a) a atendimento médico nesta data e deve permanecer afastado(a) de suas atividades laborais e habituais pelo período de <strong>${daysText}</strong>, a contar desta data, ${period}.
    </p>
    <p></p>
    ${cidText}
    ${obsText}
    <p style="text-align: right; margin-top: 24px;">${addr ? `${escapeHtml(addr.split('-')[0].trim())}, ` : ''}${escapeHtml(today)}.</p>
  `;

  const nextHeader: DocumentHeaderConfig = {
    ...currentHeader,
    showHeader: true,
    showFooter: true,
    badgeText: 'ATESTADO MÉDICO',
    dateText: today,
  };

  return {
    certHtml,
    nextHeader,
  };
}

export function buildPresetQuickTemplatePayload(
  type: PresetQuickTemplateType,
  patient: Patient,
  prescriptionItems: PrescriptionItem[]
): {
  templateHtml: string;
  presetTitle: string;
  badge: string;
  viaLayout?: DocumentViaLayout;
  pageOrientation?: DocumentOrientation;
  baseFontSize?: number;
} {
  const patientName = escapeHtml(patient?.name || '__________________________');
  const patientDoc = escapeHtml(patient?.documentNumber || '________________');
  const today = escapeHtml(
    new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  );
  const medsList = formatPrescriptionItemsList(prescriptionItems);

  if (type === 'receita_especial') {
    return {
      presetTitle: 'Receituário de Controle Especial (Portaria 344/98)',
      badge: 'RECEITUÁRIO DE CONTROLE ESPECIAL',
      viaLayout: '2-vias',
      pageOrientation: 'landscape',
      baseFontSize: 10,
      templateHtml: `
        <p style="text-align: center;"><strong>RECEITUÁRIO DE CONTROLE ESPECIAL</strong></p>
        <p><br></p>
        <p><strong>Paciente:</strong> ${patientName} | <strong>Documento:</strong> ${patientDoc}</p>
        <p><br></p>
        <p><strong>PRESCRIÇÃO MEDICAMENTOSA (PORTARIA SVS/MS 344/98):</strong></p>
        <p><strong>1. Clonazepam 2,5 mg/mL (Gotas)</strong> (Uso Oral) ---------------- 01 frasco (vinte mL)</p>
        <p style="margin-left: 20px;">Pingar 05 (cinco) gotas por via oral às 21:00 horas se insônia severa.</p>
        <p><br></p>
        <p><strong>2. Sertralina 50 mg (Comprimidos)</strong> (Uso Oral) ------------ 60 comprimidos (sessenta)</p>
        <p style="margin-left: 20px;">Tomar 01 (um) comprimido por via oral pela manhã, após o café, diariamente durante 60 dias.</p>
        <p><br></p>
        <p><strong>Orientações:</strong> Validade de 30 dias a contar da emissão. 1ª via retida na farmácia e 2ª via devolvida ao paciente orientada.</p>
      `,
    };
  }
  if (type === 'laudo_com_receita') {
    return {
      presetTitle: 'Laudo Médico com Prescrição Terapêutica',
      badge: 'LAUDO COM RECEITA',
      templateHtml: `
        <p style="text-align: center;"><strong>LAUDO MÉDICO COM PRESCRIÇÃO TERAPÊUTICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, encontra-se sob acompanhamento ambulatorial neste serviço para investigação propedêutica e manejo clínico integral.</p>
        <p><br></p>
        <p><strong>Quadro Clínico & Parecer:</strong> Paciente hemodinamicamente estável, em bom estado geral, orientado(a) quanto aos cuidados clínicos, medidas higienodietéticas e aderência farmacológica estrita.</p>
        <p><br></p>
        <p><strong>PLANO FARMACOLÓGICO INSTITUÍDO:</strong></p>
        ${medsList}
        <p><br></p>
        <p><strong>Recomendações Clínicas:</strong> Manter a posologia prescrita com rigor de horários. Retorno ambulatorial programado para reavaliação de conduta e seguimento terapêutico.</p>
      `,
    };
  }
  if (type === 'relatorio_circunstanciado') {
    return {
      presetTitle: 'Relatório Médico Circunstanciado',
      badge: 'RELATÓRIO CIRCUNSTANCIADO',
      templateHtml: `
        <p style="text-align: center;"><strong>RELATÓRIO MÉDICO CIRCUNSTANCIADO</strong></p>
        <p><br></p>
        <p><strong>Identificação do Paciente:</strong> ${patientName} | <strong>Documento:</strong> ${patientDoc} | <strong>Data:</strong> ${today}</p>
        <p><br></p>
        <p><strong>1. Histórico da Moléstia Atual:</strong> Paciente em acompanhamento regular neste serviço de saúde apresentando quadro clínico compatível com a hipótese diagnóstica em investigação, demandando suporte clínico contínuo e plano farmacológico diário.</p>
        <p><br></p>
        <p><strong>2. Exame Físico / Sinais Vitais:</strong> Bom estado geral, consciente e orientado(a) no tempo e espaço, eupneico(a) em ar ambiente, acianótico(a). Aparelho cardiovascular com ritmo regular em 2 tempos, bulhas normofonéticas sem sopros. Ausculta pulmonar com murmúrio vesicular universalmente audível sem ruídos adventícios.</p>
        <p><br></p>
        <p><strong>3. Terapêutica Farmacológica em Curso:</strong></p>
        ${medsList}
        <p><br></p>
        <p><strong>4. Conclusão & Conduta:</strong> Paciente com benefício clínico comprovado ao esquema medicamentoso instituído, necessitando de continuidade do tratamento e reavaliações periódicas neste serviço.</p>
      `,
    };
  }
  if (type === 'declaracao_comparecimento') {
    return {
      presetTitle: 'Declaração de Comparecimento com Receita',
      badge: 'DECLARAÇÃO DE COMPARECIMENTO',
      templateHtml: `
        <p style="text-align: center;"><strong>DECLARAÇÃO DE COMPARECIMENTO E RECEITA MÉDICA</strong></p>
        <p><br></p>
        <p>Declaro para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, compareceu a esta unidade de saúde na data de <strong>${today}</strong> para consulta médica ambulatorial.</p>
        <p><br></p>
        <p><strong>PRESCRIÇÃO FARMACOLÓGICA EMITIDA:</strong></p>
        ${medsList}
        <p><br></p>
        <p>Apto(a) a retornar às suas atividades habituais após o atendimento, respeitadas as orientações posológicas e de repouso prescritas.</p>
      `,
    };
  }
  if (type === 'laudo') {
    return {
      presetTitle: 'Laudo de Avaliação Clínica',
      badge: 'LAUDO CLÍNICO',
      templateHtml: `
        <p style="text-align: center;"><strong>LAUDO MÉDICO DE AVALIAÇÃO CLÍNICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico nesta data, encontrando-se sob acompanhamento ambulatorial para investigação e manejo terapêutico.</p>
        <p><br></p>
        <p><strong>Hipótese Diagnóstica / Quadro Clínico:</strong> Paciente lúcido(a), orientado(a), eupneico(a), hemodinamicamente estável, sem queixas agudas de urgência no momento da avaliação.</p>
        <p><br></p>
        <p><strong>Conduta:</strong> Mantido plano terapêutico previamente instituído. Retorno programado com resultados de exames complementares.</p>
      `,
    };
  }
  if (type === 'risco') {
    return {
      presetTitle: 'Parecer de Risco Cirúrgico Pré-Operatório',
      badge: 'RISCO CIRÚRGICO',
      templateHtml: `
        <p style="text-align: center;"><strong>PARECER DE RISCO CIRÚRGICO PRÉ-OPERATÓRIO</strong></p>
        <p><br></p>
        <p>Paciente: <strong>${patientName}</strong> | Documento: ${patientDoc}</p>
        <p><br></p>
        <p>Avaliado(a) para liberação de procedimento cirúrgico eletivo. Nega precordialgia típica, dispneia paroxística noturna ou síncope aos esforços. Capacidade funcional estimada > 4 METs.</p>
        <p><br></p>
        <p><strong>Exame Físico:</strong> Ritmo cardíaco regular em 2 tempos, bulhas normofonéticas sem sopros audíveis. PA dentro dos limites de tolerância. Murmúrio vesicular presente bilateralmente, sem ruídos adventícios.</p>
        <p><br></p>
        <p><strong>Classificação de Risco:</strong> ASA II / Baixo Risco Cardiovascular para o procedimento proposto.</p>
        <p><br></p>
        <p><strong>Recomendações:</strong> Manter medicação anti-hipertensiva habitual com mínimo gole de água pela manhã no dia da cirurgia. Monitorização hemodinâmica intraoperatória padrão.</p>
      `,
    };
  }
  if (type === 'parecer') {
    return {
      presetTitle: 'Parecer Médico Especializado',
      badge: 'PARECER ESPECIALIZADO',
      templateHtml: `
        <p style="text-align: center;"><strong>PARECER MÉDICO ESPECIALIZADO / CONTRA-REFERÊNCIA</strong></p>
        <p><br></p>
        <p>Ao Médico(a) Assistente da Unidade de Origem,</p>
        <p>Encaminhamos avaliação especializada referente ao(à) paciente <strong>${patientName}</strong>.</p>
        <p><br></p>
        <p><strong>Sumário da Avaliação:</strong> Exame físico sem alterações significativas para a queixa principal. Exames complementares revisados e discutidos com o paciente.</p>
        <p><br></p>
        <p><strong>Recomendações e Ajustes Farmacológicos:</strong> Seguir acompanhamento regular na Atenção Primária com as orientações anexas. Programado novo retorno especializado caso haja refratariedade sintomática.</p>
      `,
    };
  }
  if (type === 'atestado') {
    return {
      presetTitle: 'Atestado Médico de Aptidão Física',
      badge: 'ATESTADO DE APTIDÃO',
      templateHtml: `
        <p style="text-align: center;"><strong>ATESTADO MÉDICO DE APTIDÃO FÍSICA</strong></p>
        <p><br></p>
        <p>Atesto para os devidos fins que o(a) paciente <strong>${patientName}</strong>, portador(a) do documento nº ${patientDoc}, foi submetido(a) a exame clínico e anamnese dirigida nesta data, encontrando-se <strong>APTO(A)</strong> para a prática de atividades físicas esportivas e laborativas que não exijam esforço físico extenuante desmedido.</p>
        <p><br></p>
        <p>Válido pelo período regulamentar a contar da presente data.</p>
      `,
    };
  }
  return {
    presetTitle: 'Receita Ambulatorial Livre',
    badge: 'RECEITA MÉDICA',
    viaLayout: '1-via',
    pageOrientation: 'portrait',
    baseFontSize: 12,
    templateHtml: INITIAL_EDITOR_CONTENT,
  };
}
