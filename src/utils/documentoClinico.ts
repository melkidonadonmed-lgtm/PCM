import type { DoctorProfile, Patient, PrescriptionItem, WorkContext } from '../types';
import { medicoConfigurado } from './medicoConfigurado';
import { classificarReceita, type RegimeReceita } from './isSpecialControlOrAntibiotic';
import { EXEMPLO_MEDICO, EXEMPLO_PACIENTE } from '../data/exemplos';
import { LOGO_DO_SUS } from '../data/presetAssets';

/**
 * Regras de conteúdo dos documentos emitidos (sem JSX): quem aparece no
 * cabeçalho, título, orientação da folha e textos derivados. A folha em si é
 * desenhada por `components/documento/DocumentoClinico.tsx`.
 */

export type TipoDocumento =
  | 'prescription'
  | 'antimicrobial_prescription'
  | 'special_prescription'
  | 'exams'
  | 'certificate'
  | 'referral';

export type OrientacaoDocumento = 'portrait' | 'landscape';

/** Receitas de 2 vias (antimicrobiano e controle especial) saem em folha única paisagem, lado a lado. */
export function orientacaoDoDocumento(tipo: TipoDocumento): OrientacaoDocumento {
  return tipo === 'special_prescription' || tipo === 'antimicrobial_prescription' ? 'landscape' : 'portrait';
}

/** Tipo de documento em que cada regime de receita é emitido. */
export const DOCUMENTO_DO_REGIME: Record<RegimeReceita, TipoDocumento> = {
  simples: 'prescription',
  antimicrobiano: 'antimicrobial_prescription',
  controle_especial: 'special_prescription'
};

/** Separa os itens da prescrição pelo documento em que cada um deve sair. */
export function separarPorRegime(items: PrescriptionItem[]): Record<RegimeReceita, PrescriptionItem[]> {
  const grupos: Record<RegimeReceita, PrescriptionItem[]> = { simples: [], antimicrobiano: [], controle_especial: [] };
  items.forEach((item) => grupos[classificarReceita(item)].push(item));
  return grupos;
}

export interface IdentidadeDocumento {
  /** true quando o médico ainda não foi configurado: a folha é só uma prévia marcada "EXEMPLO". */
  exemplo: boolean;
  /** Cabeçalho: sempre o local de atendimento. Só recai no nome do médico se não houver local cadastrado. */
  cabecalho: {
    titulo: string;
    /** true quando o título é o nome do médico (consultório sem nome de local cadastrado). */
    tituloEhMedico: boolean;
    linhas: string[];
    logo?: string;
    logoSecundario?: string;
    alinhamentoLogo: 'left' | 'center' | 'right';
  };
  /** Identificação do médico: usada no bloco de assinatura e no emitente da receita especial. */
  medico: {
    nome: string;
    registro: string;
    especialidade: string;
    endereco: string;
    telefone: string;
    cidadeUf: string;
  };
}

export function resolverIdentidade(
  doctor: DoctorProfile | null | undefined,
  activeContext?: WorkContext | null,
): IdentidadeDocumento {
  const configurado = medicoConfigurado(doctor);

  const nome = configurado ? doctor!.name.trim() : EXEMPLO_MEDICO.name;
  const crm = configurado ? (activeContext?.doctorCredentials?.crm || doctor!.crm.trim()) : EXEMPLO_MEDICO.crm;
  const uf = configurado ? (activeContext?.doctorCredentials?.uf || doctor!.crmState || 'SP') : EXEMPLO_MEDICO.crmState;
  const rqe = configurado ? (activeContext?.doctorCredentials?.rqe || doctor!.rqe || '').trim() : '';
  const especialidade = configurado
    ? (activeContext?.doctorCredentials?.specialty || doctor!.specialty || '').trim()
    : EXEMPLO_MEDICO.specialty;

  const local = activeContext?.clinicName?.trim() || doctor?.clinicName?.trim() || '';
  const endereco = activeContext?.clinicAddress?.trim() || doctor?.address?.trim() || '';
  const telefone = doctor?.phone?.trim() || '';
  const cnes = activeContext?.cnes?.trim() && activeContext.documentFormatting?.showCnesOnHeader
    ? `CNES ${activeContext.cnes.trim()}`
    : '';

  const contato = [cnes, telefone ? `Tel. ${telefone}` : ''].filter(Boolean).join(' • ');

  // Timbre geral da rede pública: logo do órgão (ex.: SEMUSA) de um lado, SUS do outro e,
  // no meio, o nome do local — que é a única coisa que muda de uma unidade para outra.
  const logo = activeContext?.logoDataUrl || undefined;
  const localPublico = Boolean(activeContext) && activeContext!.sphere !== 'private';
  const logoSecundario = activeContext?.secondaryLogoDataUrl
    || (localPublico && logo && logo !== LOGO_DO_SUS ? LOGO_DO_SUS : undefined);

  return {
    exemplo: !configurado,
    cabecalho: {
      titulo: local || nome,
      tituloEhMedico: !local,
      linhas: [endereco, contato].filter(Boolean),
      logo,
      logoSecundario,
      alinhamentoLogo: activeContext?.logoAlignment || 'left'
    },
    medico: {
      nome,
      registro: `CRM-${uf} ${crm}${rqe ? ` • RQE ${rqe}` : ''}`,
      especialidade,
      endereco,
      telefone,
      cidadeUf: doctor?.cityState?.trim() || ''
    }
  };
}

export function tituloDoDocumento(tipo: TipoDocumento, activeContext?: WorkContext | null): string {
  switch (tipo) {
    case 'prescription':
    case 'antimicrobial_prescription':
      return 'Receituário Médico';
    case 'special_prescription':
      return 'Receituário de Controle Especial';
    case 'exams':
      return activeContext?.documentFormatting?.examHeaderTitle?.trim() || 'Solicitação de Exames';
    case 'certificate':
      return 'Atestado Médico';
    case 'referral':
      return 'Encaminhamento Médico';
  }
}

/** Nome exibido do paciente: o cadastrado, ou o placeholder de exemplo enquanto não há médico configurado. */
export function nomeDoPaciente(
  patient: Patient | null | undefined,
  exemplo: boolean,
  alternativas: Array<string | undefined> = [],
): string {
  const candidato = [patient?.name, ...alternativas].map((n) => n?.trim()).find(Boolean);
  if (candidato) return candidato;
  return exemplo ? EXEMPLO_PACIENTE.name : 'Não identificado';
}

/** Endereço completo do paciente em uma linha (exigido na receita de controle especial). */
export function enderecoDoPaciente(patient: Patient | null | undefined): string {
  if (!patient) return '';
  const cidadeUf = [patient.city?.trim(), patient.state?.trim()].filter(Boolean).join(' - ');
  return [patient.address?.trim(), patient.neighborhood?.trim(), cidadeUf, patient.cep?.trim() ? `CEP ${patient.cep.trim()}` : '']
    .filter(Boolean)
    .join(', ');
}

/**
 * Apresentação entre parênteses ao lado do nome do medicamento. Omitida quando
 * só repetiria a quantidade ou a via (ex.: quantidade "20 comprimidos" e
 * apresentação "comprimidos").
 */
export function rotuloApresentacao(item: Pick<PrescriptionItem, 'presentation' | 'quantity'>): string {
  const apresentacao = (item.presentation || '').trim();
  if (!apresentacao) return '';
  const pres = apresentacao.toLowerCase();
  const qtd = (item.quantity || '').toLowerCase();
  if (pres === qtd || pres === 'uso oral' || pres.includes('caixa') || qtd.includes(pres)) return '';
  return apresentacao;
}

export interface GrupoPorVia {
  via: string;
  itens: PrescriptionItem[];
}

/** Agrupa os itens pela via de administração, na ordem em que foram prescritos ("USO ORAL", "USO TÓPICO"...). */
export function agruparPorVia(items: PrescriptionItem[]): GrupoPorVia[] {
  const grupos: GrupoPorVia[] = [];
  items.forEach((item) => {
    const bruta = (item.route || 'Oral').trim().toUpperCase();
    const via = bruta.startsWith('USO ') ? bruta : `USO ${bruta}`;
    const existente = grupos.find((g) => g.via === via);
    if (existente) existente.itens.push(item);
    else grupos.push({ via, itens: [item] });
  });
  return grupos;
}

const NUMEROS_POR_EXTENSO: Record<number, string> = {
  1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco', 6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove',
  10: 'dez', 11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze', 16: 'dezesseis',
  17: 'dezessete', 18: 'dezoito', 19: 'dezenove', 20: 'vinte', 30: 'trinta', 40: 'quarenta',
  50: 'cinquenta', 60: 'sessenta', 70: 'setenta', 80: 'oitenta', 90: 'noventa'
};

/** Número de dias por extenso (1 a 99); fora da faixa devolve os próprios algarismos. */
export function numeroPorExtenso(num: number): string {
  if (!Number.isInteger(num) || num < 1 || num > 99) return String(num);
  if (NUMEROS_POR_EXTENSO[num]) return NUMEROS_POR_EXTENSO[num];
  const dezena = Math.floor(num / 10) * 10;
  return `${NUMEROS_POR_EXTENSO[dezena]} e ${NUMEROS_POR_EXTENSO[num - dezena]}`;
}

/**
 * Data local no formato aaaa-mm-dd. Não use `toISOString()` para isso: ele
 * converte para UTC e, à noite no Brasil, devolve a data do dia seguinte.
 */
export function dataLocalISO(data: Date = new Date()): string {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0')
  ].join('-');
}

/** Data ISO (aaaa-mm-dd) em dd/mm/aaaa; vazia ou inválida cai na data de emissão. */
export function dataCurta(iso: string | undefined, emissao: Date): string {
  if (iso) {
    const data = new Date(`${iso}T00:00:00`);
    if (!Number.isNaN(data.getTime())) return data.toLocaleDateString('pt-BR');
  }
  return emissao.toLocaleDateString('pt-BR');
}

/** "Porto Velho - RO, 10 de outubro de 2026" — sem cidade cadastrada, apenas a data (nunca uma cidade inventada). */
export function localEData(cidadeUf: string, emissao: Date): string {
  const data = emissao.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  return cidadeUf ? `${cidadeUf}, ${data}` : data;
}

const PREFIXO_ARQUIVO: Record<TipoDocumento, string> = {
  prescription: 'Receita_Medica',
  antimicrobial_prescription: 'Receita_Antimicrobiano',
  special_prescription: 'Receita_Controle_Especial',
  exams: 'Pedido_Exames',
  certificate: 'Atestado_Medico',
  referral: 'Encaminhamento_Medico'
};

export function nomeArquivoDocumento(tipo: TipoDocumento, nomePaciente: string, emissao: Date): string {
  const paciente = (nomePaciente || 'Paciente')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'Paciente';
  return `${PREFIXO_ARQUIVO[tipo]}_${paciente}_${dataLocalISO(emissao)}.pdf`;
}
