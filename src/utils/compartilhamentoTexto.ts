import type {
  DoctorProfile,
  ExamItem,
  MedicalCertificate,
  MedicalReferral,
  Patient,
  PrescriptionItem
} from '../types';
import type { IdentidadeDocumento, TipoDocumento } from './documentoClinico';
import type { RegimeReceita } from './isSpecialControlOrAntibiotic';
import { avisoTextoNotificacao } from './notificacaoDeReceita';

/** Símbolo tipográfico da linha de corte de receituário em 2 vias (PEC/SUS). */
export const SIMBOLO_CORTE = '\u2702';

/** Como cada tipo de receita é apresentado na tela e no texto compartilhado. */
export const REGIME_INFO: Record<RegimeReceita, { rotulo: string; detalhe: string; tituloTexto: string }> = {
  simples: {
    rotulo: 'Simples',
    detalhe: '1 via',
    tituloTexto: 'RECEITUÁRIO MÉDICO'
  },
  antimicrobiano: {
    rotulo: 'Antimicrobiano',
    detalhe: '2 vias • válida por 10 dias • a farmácia retém a 2ª via',
    tituloTexto: 'RECEITUÁRIO MÉDICO — ANTIMICROBIANO (2 vias • válida por 10 dias)'
  },
  controle_especial: {
    rotulo: 'Controle especial',
    detalhe: '2 vias • a farmácia retém a 1ª via',
    tituloTexto: 'RECEITUÁRIO DE CONTROLE ESPECIAL (2 vias • retenção na farmácia)'
  }
};

/**
 * Gera o texto estruturado da receita para cópia na área de transferência.
 */
export function formatarReceitaCopiaTexto(
  items: PrescriptionItem[],
  regimesComItens: RegimeReceita[],
  porRegime: Record<RegimeReceita, PrescriptionItem[]>
): string {
  if (items.length === 0) return '';
  let text = '';
  regimesComItens.forEach((regime) => {
    text += `📋 ${REGIME_INFO[regime].tituloTexto}\n------------------------------------\n`;
    porRegime[regime].forEach((it, idx) => {
      text += `${idx + 1}. ${it.name} (${it.route})\n   Qtd: ${it.quantity}\n   Posologia: ${it.instructions}\n\n`;
    });
  });
  const avisoNotif = avisoTextoNotificacao(items);
  if (avisoNotif) {
    text += `${avisoNotif}\n`;
  }
  return text;
}

/**
 * Gera o texto formatado da receita para envio via WhatsApp.
 */
export function formatarReceitaWhatsAppTexto(params: {
  items: PrescriptionItem[];
  doctor: DoctorProfile;
  patient: Patient;
  regimesComItens: RegimeReceita[];
  porRegime: Record<RegimeReceita, PrescriptionItem[]>;
}): string {
  const { items, doctor, patient, regimesComItens, porRegime } = params;
  if (items.length === 0) return '';

  const doctorLine = doctor?.name?.trim()
    ? `👨‍⚕️ *${doctor.name.trim()}* — CRM ${doctor.crm || '------'}/${doctor.crmState || 'SP'}\n`
    : '👨‍⚕️ *Receituário Médico*\n';
  const patientLine = patient?.name?.trim()
    ? `👤 *Paciente:* ${patient.name.trim()}${patient?.weightKg && patient.weightKg > 0 ? ` (${patient.weightKg} kg)` : ''}\n`
    : '';
  const dateLine = `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}\n`;

  let text = `📋 *RECEITUÁRIO MÉDICO DIGITAL*\n${doctorLine}${patientLine}${dateLine}------------------------------------\n`;

  regimesComItens.forEach((regime) => {
    text += `\n💊 *${REGIME_INFO[regime].tituloTexto}:*\n`;
    porRegime[regime].forEach((it, idx) => {
      text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
    });
  });

  const avisoNotif = avisoTextoNotificacao(items);
  if (avisoNotif) {
    text += `\n${avisoNotif}\n`;
  }
  text += `\n------------------------------------\n⚠️ _Documento de orientação terapêutica emitido pelo médico. Siga as orientações e horários informados. Para medicamentos controlados e antibióticos, a via da farmácia fica retida na dispensação._`;
  return text;
}

/**
 * Gera o texto formatado de Atestado Médico para envio via WhatsApp.
 */
export function formatarAtestadoWhatsAppTexto(
  doctor: DoctorProfile,
  patient: Patient,
  certificate: MedicalCertificate
): string {
  const pName = certificate.patientName?.trim() || patient?.name?.trim() || 'Paciente';
  const dateStr = certificate.date || new Date().toLocaleDateString('pt-BR');
  const docLine = doctor?.name?.trim()
    ? `👨‍⚕️ *${doctor.name.trim()}* — CRM ${doctor.crm || '------'}/${doctor.crmState || 'SP'}\n`
    : '';

  let msg = `📋 *ATESTADO MÉDICO DIGITAL*\n${docLine}👤 *Paciente:* ${pName}\n📅 *Data:* ${dateStr}\n------------------------------------\n\n`;
  msg += `Atesto para os devidos fins que o(a) paciente acima identificado(a) esteve sob atendimento médico nesta data (${dateStr}).\n\n`;
  if (certificate.daysOff > 0) {
    msg += `👉 *Recomendação:* Repouso e afastamento de suas atividades por *${certificate.daysOff} dia(s)* a contar desta data.\n\n`;
  }
  if (certificate.includeCID && certificate.cid10Code) {
    msg += `📌 *CID-10:* ${certificate.cid10Code}${certificate.cid10Description ? ` - ${certificate.cid10Description}` : ''}\n\n`;
  }
  if (certificate.observations) {
    msg += `📝 *Observações:* ${certificate.observations}\n\n`;
  }
  msg += `------------------------------------\n_Documento emitido conforme Resolução CFM 1.658/2002._`;
  return msg;
}

/**
 * Gera o texto formatado de Encaminhamento Médico para envio via WhatsApp.
 */
export function formatarEncaminhamentoWhatsAppTexto(
  doctor: DoctorProfile,
  patient: Patient,
  referral: MedicalReferral
): string {
  const pName = referral.patientName?.trim() || patient?.name?.trim() || 'Paciente';
  const dateStr = referral.date || new Date().toLocaleDateString('pt-BR');
  const docLine = doctor?.name?.trim()
    ? `👨‍⚕️ *${doctor.name.trim()}* — CRM ${doctor.crm || '------'}/${doctor.crmState || 'SP'}\n`
    : '';

  let msg = `📋 *ENCAMINHAMENTO MÉDICO DIGITAL*\n${docLine}👤 *Paciente:* ${pName}\n📅 *Data:* ${dateStr}\n------------------------------------\n\n`;
  msg += `Ao(À) Colega da especialidade *${referral.destinationSpecialty || 'Especialista'}*:\n\n`;
  msg += `Encaminho o(a) paciente para avaliação e conduta clínica especializada.\n\n`;
  if (referral.reason) {
    msg += `📌 *Motivo / Hipótese Diagnóstica:* ${referral.reason}\n\n`;
  }
  if (referral.clinicalSummary) {
    msg += `📝 *Resumo Clínico & Condutas Prévias:* ${referral.clinicalSummary}\n\n`;
  }
  msg += `------------------------------------\n_PrescMed — Referência e Contrarreferência Ambulatorial_`;
  return msg;
}

/**
 * Gera o texto formatado para WhatsApp e área de transferência na tela de emissão (PrintPreview).
 */
export function formatarDocumentoPreviewTexto(params: {
  isConfigured: boolean;
  docType: TipoDocumento;
  emissao: Date;
  identidade: IdentidadeDocumento;
  patientName: string;
  patientWeight: number | null;
  ehReceita: boolean;
  itensDaFolha: PrescriptionItem[];
  certificate: MedicalCertificate;
  referral: MedicalReferral;
  exams: ExamItem[];
  examIndication: string;
}): string {
  const {
    isConfigured,
    docType,
    emissao,
    identidade,
    patientName,
    patientWeight,
    ehReceita,
    itensDaFolha,
    certificate,
    referral,
    exams,
    examIndication
  } = params;

  if (!isConfigured) return '';

  const dateStr = emissao.toLocaleDateString('pt-BR');
  const docLine = `👨‍⚕️ *${identidade.medico.nome}* — ${identidade.medico.registro}\n`;
  const patientLine =
    patientName !== 'Não identificado'
      ? `👤 *Paciente:* ${patientName}${patientWeight ? ` (${patientWeight} kg)` : ''}\n`
      : '';
  const header = `📋 *DOCUMENTO MÉDICO DIGITAL*\n${docLine}${patientLine}📅 *Data:* ${dateStr}\n------------------------------------\n`;
  const assinaturaTexto = `_${identidade.medico.nome} — ${identidade.medico.registro}_`;

  if (ehReceita) {
    if (itensDaFolha.length === 0) return '';
    const docLabel =
      docType === 'special_prescription'
        ? 'RECEITUÁRIO DE CONTROLE ESPECIAL (2 VIAS • PORTARIA 344/98)'
        : docType === 'antimicrobial_prescription'
          ? 'RECEITUÁRIO MÉDICO — ANTIMICROBIANO (2 VIAS • VÁLIDA POR 10 DIAS • RDC 471/2021)'
          : 'RECEITUÁRIO MÉDICO';
    let text = `${header}💊 *${docLabel}:*\n`;
    itensDaFolha.forEach((it, idx) => {
      text += `\n*${idx + 1}. ${it.name}* (${it.route})\n   📦 *Qtd:* ${it.quantity}\n   👉 *Posologia:* ${it.instructions}\n`;
    });
    const avisoNotif = avisoTextoNotificacao(itensDaFolha);
    if (avisoNotif) {
      text += `\n${avisoNotif}\n`;
    }
    text += `\n------------------------------------\n⚠️ _Siga as instruções médicas e os horários informados._`;
    return text;
  }

  if (docType === 'certificate') {
    let text = `${header}📄 *ATESTADO MÉDICO*\n\n`;
    text += `Atesto para os devidos fins que o(a) paciente *${patientName}* esteve sob atendimento médico nesta data (${dateStr}).\n\n`;
    if (certificate?.daysOff) {
      text += `👉 *Recomendação:* Repouso e afastamento das atividades laborais por *${certificate.daysOff} dia(s)* a contar desta data.\n\n`;
    }
    if (certificate?.includeCID && certificate.cid10Code) {
      text += `📌 *CID-10:* ${certificate.cid10Code}${certificate.cid10Description ? ' - ' + certificate.cid10Description : ''}\n\n`;
    }
    if (certificate?.observations) {
      text += `📝 *Observação:* ${certificate.observations}\n\n`;
    }
    text += `------------------------------------\n${assinaturaTexto}`;
    return text;
  }

  if (docType === 'referral') {
    let text = `${header}🩺 *ENCAMINHAMENTO MÉDICO*\n\n`;
    text += `Ao(À) Colega Especialista em *${referral?.destinationSpecialty || 'Medicina'}*:\n\n`;
    text += `Encaminho o(a) paciente *${patientName}* para avaliação e conduta clínica.\n\n`;
    if (referral?.reason) {
      text += `📌 *Motivo / Hipótese:* ${referral.reason}\n\n`;
    }
    if (referral?.clinicalSummary) {
      text += `📝 *Resumo Clínico:* ${referral.clinicalSummary}\n\n`;
    }
    text += `------------------------------------\n${assinaturaTexto}`;
    return text;
  }

  if (exams.length === 0) return '';
  let text = `${header}🧪 *SOLICITAÇÃO DE EXAMES COMPLEMENTARES*\n\n`;
  exams.forEach((ex) => {
    text += `• ${ex.name}\n`;
  });
  if (examIndication) {
    text += `\n📌 *Indicação Clínica:* ${examIndication}\n`;
  }
  text += `\n------------------------------------\n${assinaturaTexto}`;
  return text;
}
