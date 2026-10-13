import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DocumentoClinico, type DocumentoClinicoProps } from '../components/documento/DocumentoClinico';
import {
  agruparPorVia,
  localEData,
  nomeArquivoDocumento,
  numeroPorExtenso,
  orientacaoDoDocumento,
  resolverIdentidade,
  rotuloApresentacao,
  type TipoDocumento
} from '../utils/documentoClinico';
import { EXEMPLO_MEDICO } from '../data/exemplos';
import type { DoctorProfile, MedicalCertificate, MedicalReferral, Patient, PrescriptionItem, WorkContext } from '../types';

const medico: DoctorProfile = {
  name: 'Dra. Teste Ficticia',
  crm: '99999',
  crmState: 'RO',
  specialty: 'Clínica Médica',
  clinicName: '',
  address: '',
  cityState: 'Porto Velho - RO',
  phone: '',
  email: '',
  showSignature: true
};

const paciente: Patient = {
  id: 'p1',
  name: 'Paciente Ficticio da Silva',
  weightKg: 70,
  ageText: '36 anos',
  gender: 'male',
  documentNumber: '000.000.000-00',
  allergies: []
};

const local: WorkContext = {
  id: 'ctx-teste',
  name: 'UBS Teste',
  sphere: 'municipal',
  clinicName: 'UNIDADE BÁSICA DE SAÚDE TESTE',
  clinicAddress: 'Rua Fictícia, 100 - Centro',
  cnes: '1234567',
  logoDataUrl: 'data:image/png;base64,AAAA',
  logoAlignment: 'left',
  watermarkType: 'none',
  documentFormatting: {
    headerType: 'custom_logo',
    prescriptionViaCount: 1,
    showCnesOnHeader: true,
    referralModel: 'sus_regulation',
    examHeaderTitle: 'SOLICITAÇÃO DE EXAMES'
  },
  doctorCredentials: { crm: '99999', uf: 'RO' },
  createdAt: 0,
  updatedAt: 0
};

const item = (id: string, name: string, extra: Partial<PrescriptionItem> = {}): PrescriptionItem => ({
  id,
  name,
  presentation: 'comprimidos',
  route: 'Oral',
  quantity: '20 comprimidos',
  doseCalculatedText: '1 comprimido',
  frequencyText: 'de 8 em 8 horas',
  scheduleInterval: 'Conforme posologia',
  scheduleTimes: [],
  durationDays: 7,
  instructions: `Posologia de ${name}: 1 comprimido de 8 em 8 horas.`,
  isContinuous: false,
  ...extra
});

const atestado: MedicalCertificate = {
  patientName: '',
  documentNumber: '',
  daysOff: 2,
  startDate: '2026-10-10',
  endDate: '2026-10-12',
  periodText: 'por motivo de saúde',
  includeCID: false,
  cid10Code: 'J00',
  cid10Description: 'Nasofaringite aguda',
  observations: ''
};

const encaminhamento: MedicalReferral = {
  patientName: '',
  documentNumber: '',
  destinationSpecialty: 'Cardiologia',
  reason: 'Avaliação de sopro cardíaco.',
  clinicalSummary: '',
  relevantExams: '',
  hypothesisCID: '',
  priority: 'eletivo'
};

const emissao = new Date(2026, 9, 10, 22, 30);

const folha = (tipo: TipoDocumento, extra: Partial<DocumentoClinicoProps> = {}): string =>
  renderToStaticMarkup(
    <DocumentoClinico
      tipo={tipo}
      doctor={medico}
      patient={paciente}
      activeContext={local}
      prescriptionItems={[item('i1', 'Dipirona 500 mg')]}
      exams={[{ id: 'e1', category: 'Hematologia', name: 'Hemograma completo', selected: true, urgency: 'routine' }]}
      examIndication="Investigação de anemia."
      certificate={atestado}
      referral={encaminhamento}
      emissao={emissao}
      {...extra}
    />
  );

const ocorrencias = (texto: string, trecho: string) => texto.split(trecho).length - 1;
const TODOS: TipoDocumento[] = ['prescription', 'antimicrobial_prescription', 'special_prescription', 'exams', 'certificate', 'referral'];

describe('Folha única do documento clínico (prévia = impressão = PDF)', () => {
  it('nenhum documento traz selo de validação digital, QR code ou assinatura eletrônica', () => {
    TODOS.forEach((tipo) => {
      const html = folha(tipo);
      expect(html, tipo).not.toMatch(/valida[çc][ãa]o digital/i);
      expect(html, tipo).not.toMatch(/assinatura eletr[ôo]nica/i);
      expect(html, tipo).not.toMatch(/prescmed\.digital/i);
      expect(html, tipo).not.toMatch(/DOC-PRESC/);
    });
  });

  it('cabeçalho traz o local de atendimento e o logo; o médico aparece só na assinatura', () => {
    (['prescription', 'exams', 'certificate', 'referral'] as TipoDocumento[]).forEach((tipo) => {
      const html = folha(tipo);
      expect(html, tipo).toContain('UNIDADE BÁSICA DE SAÚDE TESTE');
      expect(html, tipo).toContain('Rua Fictícia, 100 - Centro');
      expect(html, tipo).toContain('CNES 1234567');
      expect(html, tipo).toContain('src="data:image/png;base64,AAAA"');
      expect(ocorrencias(html, 'Dra. Teste Ficticia'), tipo).toBe(1);
      expect(html, tipo).toContain('CRM-RO 99999');
    });
  });

  it('sem local cadastrado, o cabeçalho recai no nome do médico (nunca fica vazio)', () => {
    const identidade = resolverIdentidade(medico, null);
    expect(identidade.cabecalho.titulo).toBe('Dra. Teste Ficticia');
    expect(identidade.cabecalho.tituloEhMedico).toBe(true);
    expect(ocorrencias(folha('prescription', { activeContext: null }), 'Dra. Teste Ficticia')).toBe(2);
  });

  it('só mostra o CNES no cabeçalho quando o local pede', () => {
    const semCnes = { ...local, documentFormatting: { ...local.documentFormatting, showCnesOnHeader: false } };
    expect(resolverIdentidade(medico, semCnes).cabecalho.linhas.join(' ')).not.toContain('CNES');
  });

  it('médico não configurado gera apenas prévia marcada EXEMPLO, com os dados fictícios', () => {
    const html = folha('prescription', { doctor: { ...medico, name: '', crm: '' } });
    expect(html).toContain('EXEMPLO');
    expect(html).toContain(EXEMPLO_MEDICO.name);
    expect(folha('prescription')).not.toContain('EXEMPLO');
  });

  it('receita não imprime horários nem duração que o médico não escreveu', () => {
    const html = folha('prescription');
    expect(html).not.toContain('Horários sugeridos');
    expect(html).not.toMatch(/Dura[çc][ãa]o do tratamento/);
    expect(folha('prescription', { prescriptionItems: [item('i1', 'Amoxicilina', { scheduleTimes: ['08:00', '16:00'] })] }))
      .toContain('Horários sugeridos');
  });

  it('atestado só traz CID-10 com consentimento, acompanhado do aviso da Res. CFM 1.658/2002', () => {
    const semConsentimento = folha('certificate');
    expect(semConsentimento).not.toContain('J00');
    expect(semConsentimento).not.toContain('CID-10');
    expect(semConsentimento).toContain('2 (dois) dia(s)');

    const comConsentimento = folha('certificate', { certificate: { ...atestado, includeCID: true } });
    expect(comConsentimento).toContain('J00');
    expect(comConsentimento).toContain('expressamente solicitada e autorizada pelo(a) paciente (Resolução CFM nº 1.658/2002)');
  });

  it('encaminhamento não inventa texto clínico para campos vazios', () => {
    const html = folha('referral');
    expect(html).toContain('Avaliação de sopro cardíaco.');
    expect(html).not.toMatch(/Resumo cl[íi]nico/i);
    expect(html).not.toContain('sem alterações agudas');
  });

  it('pedido de exames lista os exames e sinaliza urgência marcada pelo médico', () => {
    const html = folha('exams', {
      exams: [{ id: 'e1', category: 'Hematologia', name: 'Hemograma completo', selected: true, urgency: 'urgent' }]
    });
    expect(html).toContain('Hemograma completo');
    expect(html).toContain('Urgente');
    expect(html).toContain('Investigação de anemia.');
  });
});

describe('Regras de conteúdo do documento (utils/documentoClinico)', () => {
  it('todas as receitas são paisagem (padrão PEC do SUS); exames, atestado e encaminhamento são retrato', () => {
    expect(orientacaoDoDocumento('prescription')).toBe('landscape');
    expect(orientacaoDoDocumento('special_prescription')).toBe('landscape');
    expect(orientacaoDoDocumento('antimicrobial_prescription')).toBe('landscape');
    (['exams', 'certificate', 'referral'] as TipoDocumento[]).forEach((tipo) => {
      expect(orientacaoDoDocumento(tipo)).toBe('portrait');
    });
  });

  it('receita simples sai em meia folha à esquerda (1 via) sem duplicar itens e sem quadros de controle especial', () => {
    const html = folha('prescription');
    expect(ocorrencias(html, '1. Dipirona 500 mg')).toBe(1);
    expect(html).not.toContain('Identificação do emitente');
    expect(html).not.toContain('Identificação do comprador');
    expect(html).not.toContain('1ª via');
  });

  it('não repete a apresentação quando ela já está na quantidade', () => {
    expect(rotuloApresentacao({ presentation: 'comprimidos', quantity: '20 comprimidos' })).toBe('');
    expect(rotuloApresentacao({ presentation: '250 mg/5 mL suspensão', quantity: '1 frasco' })).toBe('250 mg/5 mL suspensão');
    expect(rotuloApresentacao({ presentation: '', quantity: '1 frasco' })).toBe('');
  });

  it('agrupa por via na ordem de prescrição', () => {
    const grupos = agruparPorVia([
      item('a', 'A', { route: 'Oral' }),
      item('b', 'B', { route: 'Tópica' }),
      item('c', 'C', { route: 'Uso Oral' })
    ]);
    expect(grupos.map((g) => g.via)).toEqual(['USO ORAL', 'USO TÓPICA']);
    expect(grupos[0].itens.map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('escreve dias por extenso em pt-BR', () => {
    expect(numeroPorExtenso(1)).toBe('um');
    expect(numeroPorExtenso(14)).toBe('quatorze');
    expect(numeroPorExtenso(21)).toBe('vinte e um');
    expect(numeroPorExtenso(45)).toBe('quarenta e cinco');
    expect(numeroPorExtenso(90)).toBe('noventa');
    expect(numeroPorExtenso(120)).toBe('120');
  });

  it('nunca inventa cidade: sem cidade cadastrada, imprime só a data', () => {
    expect(localEData('', emissao)).toBe('10 de outubro de 2026');
    expect(localEData('Porto Velho - RO', emissao)).toBe('Porto Velho - RO, 10 de outubro de 2026');
  });

  it('nome do arquivo usa a data local da emissão (não UTC) e remove acentos', () => {
    expect(nomeArquivoDocumento('prescription', 'José da Conceição', emissao)).toBe('Receita_Medica_Jose_da_Conceicao_2026-10-10.pdf');
    expect(nomeArquivoDocumento('special_prescription', '', emissao)).toBe('Receita_Controle_Especial_Paciente_2026-10-10.pdf');
  });
});
