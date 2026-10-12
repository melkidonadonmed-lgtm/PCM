import React from 'react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SUS_DOCUMENTS_CATALOG, buildSusDocumentHtml, buildSusDocumentMarkdown, timbreDoDocumentoSus } from '../data/susDocumentsCatalog';
import { LOGO_DO_ESTADO, LOGO_DO_SUS } from '../data/presetAssets';
import { resolverIdentidade } from '../utils/documentoClinico';
import {
  FORMULARIOS_OFICIAIS_SUS,
  camposSemEspaco,
  formularioOficialDe,
  type CampoDoFormulario
} from '../data/formulariosOficiaisSus';
import { FormularioOficialSus } from '../components/documento/FormularioOficialSus';
import { ajustarTexto, partesDaData, partesDoTelefone } from '../utils/formularioOficial';
import type { DoctorProfile, SusFilledFormData, WorkContext } from '../types';

const EMISSAO = new Date(2026, 9, 11);

// Só identificação; nenhum dado clínico e nenhuma escolha feita nos campos do impresso.
const soIdentificacao: SusFilledFormData = {
  doctorName: 'Dra. Teste Ficticia',
  doctorCrm: '99999',
  doctorCrmState: 'RO',
  doctorSpecialty: 'Clínica Médica',
  doctorCnes: '',
  doctorClinicName: 'UBS Teste',
  patientName: 'Paciente Ficticio da Silva',
  patientCns: '',
  patientCpf: '',
  patientBirthDate: '',
  patientAge: '',
  patientGender: 'male',
  patientMotherName: '',
  patientPhone: '',
  patientAddress: '',
  patientNeighborhood: '',
  patientCity: '',
  patientState: '',
  patientCep: ''
};

const completo: SusFilledFormData = {
  ...soIdentificacao,
  doctorCnes: '1234567',
  doctorCpf: '111.222.333-44',
  doctorCns: '700000000000005',
  patientCns: '898 0012 3456 7890',
  patientCpf: '000.111.222-33',
  patientBirthDate: '1990-03-07',
  patientMotherName: 'Mae Ficticia da Silva',
  patientPhone: '(69) 98400-1122',
  patientAddress: 'Rua das Flores, 450',
  patientNeighborhood: 'Embratel',
  patientCity: 'Porto Velho',
  patientState: 'ro',
  patientCep: '76820-000',
  patientSex: 'F',
  patientRaceColor: 'parda',
  patientWeightKg: '70.5',
  patientHeightCm: '172',
  patientEmail: 'paciente.ficticio@exemplo.com',
  sigtapCode: '02.07.01.006-4',
  procedureName: 'Ressonância magnética de coluna lombossacra',
  procedureQuantity: '01',
  cid10Code: 'm54.5',
  cid10Description: 'Dor lombar baixa',
  clinicalJustification: 'Lombociatalgia há 8 meses, sem resposta ao tratamento conservador.',
  lmeMedications: [
    { name: 'Adalimumabe 40 mg injetável', quantities: ['2', '2', '2', '2', '2', '2'] },
    { name: 'Metotrexato 2,5 mg comprimido', quantities: ['24', '24', '', '', '', ''] }
  ],
  lmePreviousTreatment: 'sim',
  lmePreviousTreatmentReport: 'Metotrexato por 6 meses, sem resposta.',
  lmeIncapable: 'nao'
};

const apac = formularioOficialDe('apac_principal')!;
const lme = formularioOficialDe('lme_medicamentos')!;

const camposDe = (campos: CampoDoFormulario[], numero: string) => campos.filter((c) => c.campo === numero);
const textoDe = (campos: CampoDoFormulario[], numero: string) =>
  camposDe(campos, numero).flatMap((c) => (c.tipo === 'marca' ? [] : [c.valor]));
const folha = (formulario: typeof apac, dados: SusFilledFormData) =>
  renderToStaticMarkup(<FormularioOficialSus formulario={formulario} dados={dados} emissao={EMISSAO} />);

describe('Formulários oficiais do SUS: o impresso do órgão é o fundo da folha', () => {
  it('só APAC e LME saem em impresso oficial, cada um com fonte conferida e imagem publicada', () => {
    expect(FORMULARIOS_OFICIAIS_SUS.map((f) => f.id)).toEqual(['apac_principal', 'lme_medicamentos']);
    FORMULARIOS_OFICIAIS_SUS.forEach((f) => {
      expect(SUS_DOCUMENTS_CATALOG.some((d) => d.id === f.id), f.id).toBe(true);
      expect(f.fonte.url, f.id).toMatch(/^https?:\/\/[^ ]*(gov\.br|saude\.[a-z]{2}\.gov\.br)/);
      expect(f.fonte.conferidoEm, f.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(existsSync(resolve(process.cwd(), 'public', f.imagem.replace(/^\//, ''))), f.imagem).toBe(true);
    });
    expect(formularioOficialDe('sisreg_guia')).toBeUndefined();
  });

  it('a folha usa a imagem do impresso em <img> (fundo em CSS não sai na impressão)', () => {
    const html = folha(apac, completo);
    expect(html).toContain('<img src="/formularios-sus/apac-laudo.png"');
    expect(html).not.toContain('background-image');
  });

  it('todo campo desenhado fica dentro da página do impresso', () => {
    FORMULARIOS_OFICIAIS_SUS.forEach((f) => {
      const [largura, altura] = f.pagina;
      f.montar({ ...completo, lmeIncapable: 'sim', lmeResponsibleName: 'Responsavel Ficticio', patientRaceColor: 'indigena', patientEthnicity: 'Etnia' }, EMISSAO).forEach((c) => {
        const [x0, y0, x1, y1] = c.tipo === 'pente' ? [c.celulas[0], c.y0, c.celulas[c.celulas.length - 1], c.y1] : c.caixa;
        expect(x0, `${f.id} campo ${c.campo}`).toBeLessThan(x1);
        expect(y0, `${f.id} campo ${c.campo}`).toBeLessThan(y1);
        expect(x0).toBeGreaterThanOrEqual(0);
        expect(y0).toBeGreaterThanOrEqual(0);
        expect(x1).toBeLessThanOrEqual(largura);
        expect(y1).toBeLessThanOrEqual(altura);
      });
    });
  });
});

describe('APAC — laudo de 55 campos', () => {
  const campos = apac.montar(completo, EMISSAO);

  it('coloca cada dado no campo numerado do impresso', () => {
    expect(textoDe(campos, '1')).toEqual(['UBS Teste']);
    expect(textoDe(campos, '2')).toEqual(['1234567']);
    expect(textoDe(campos, '3')).toEqual(['Paciente Ficticio da Silva']);
    expect(textoDe(campos, '5')).toEqual(['898001234567890']);
    expect(textoDe(campos, '6')).toEqual(['07', '03', '1990']);
    expect(textoDe(campos, '8')).toEqual(['Parda']);
    expect(textoDe(campos, '13')).toEqual(['Rua das Flores, 450, Embratel']);
    expect(textoDe(campos, '16')).toEqual(['RO']);
    expect(textoDe(campos, '17')).toEqual(['76820000']);
    expect(textoDe(campos, '18')).toEqual(['0207010064']);
    expect(textoDe(campos, '20')).toEqual(['01']);
    expect(textoDe(campos, '36')).toEqual(['Dor lombar baixa']);
    expect(textoDe(campos, '37')).toEqual(['M54.5']);
    expect(textoDe(campos, '40')).toEqual(['Lombociatalgia há 8 meses, sem resposta ao tratamento conservador.']);
    expect(textoDe(campos, '42')).toEqual(['11', '10', '2026']);
    expect(textoDe(campos, '44')).toEqual(['11122233344']);
    expect(textoDe(campos, '45')).toEqual(['CRM-RO 99999']);
  });

  it('CNS, CNES, CEP e código do procedimento têm uma quadrícula por dígito', () => {
    const quadriculas = (numero: string) => {
      const c = camposDe(campos, numero)[0];
      return c.tipo === 'pente' ? c.celulas.length - 1 : 0;
    };
    expect(quadriculas('5')).toBe(15);
    expect(quadriculas('2')).toBe(7);
    expect(quadriculas('17')).toBe(8);
    expect(quadriculas('18')).toBe(10);
    expect(quadriculas('44')).toBe(15);
  });

  it('celular (9 dígitos) vai corrido porque o impresso só tem 8 quadrículas; fixo vai nas quadrículas', () => {
    expect(camposDe(campos, '10').map((c) => c.tipo)).toEqual(['pente', 'texto']);
    expect(textoDe(campos, '10')).toEqual(['69', '984001122']);
    const fixo = apac.montar({ ...completo, patientPhone: '(69) 3221-1122' }, EMISSAO);
    expect(camposDe(fixo, '10').map((c) => c.tipo)).toEqual(['pente', 'pente']);
    expect(textoDe(fixo, '10')).toEqual(['69', '32211122']);
  });

  it('sexo só é marcado quando escolhido no formulário — o sexo padrão do cadastro não conta', () => {
    expect(camposDe(apac.montar({ ...completo, patientSex: '', patientGender: 'male' }, EMISSAO), '7')).toHaveLength(0);
    expect(camposDe(apac.montar({ ...completo, patientSex: 'M' }, EMISSAO), '7')).toHaveLength(1);
    expect(camposDe(campos, '7')).toHaveLength(1);
  });

  it('documento do médico: marca CPF ou CNS conforme o que foi informado, ou nada', () => {
    expect(camposDe(campos, '43')).toHaveLength(1);
    const soCns = apac.montar({ ...completo, doctorCpf: '' }, EMISSAO);
    expect(textoDe(soCns, '44')).toEqual(['700000000000005']);
    const nenhum = apac.montar({ ...completo, doctorCpf: '', doctorCns: '' }, EMISSAO);
    expect(camposDe(nenhum, '43')).toHaveLength(0);
    expect(camposDe(nenhum, '44')).toHaveLength(0);
  });

  it('sem dado informado o campo fica em branco: nada de traço, padrão do catálogo ou procedimento secundário', () => {
    const vazios = apac.montar(soIdentificacao, EMISSAO);
    expect(vazios.map((c) => c.campo).sort()).toEqual(['1', '3', '41', '42', '42', '42', '45'].sort());
    const html = folha(apac, soIdentificacao);
    const doc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'apac_principal')!;
    expect(html).not.toContain('—');
    expect(html).not.toContain(doc.defaultJustification);
    expect(html).not.toContain(doc.defaultCid10);
    expect(html).not.toContain(doc.defaultProcedure);
    expect(html).not.toMatch(/data-campo="(2[1-9]|3[0-5]|4[6-9]|5[0-5])"/);
  });

  it('não imprime selo de validação nem assinatura eletrônica', () => {
    const html = folha(apac, completo);
    expect(html).not.toMatch(/QR|validação digital|assinatura eletrônica|assinado digitalmente/i);
  });
});

describe('LME — laudo de 23 campos (CEAF)', () => {
  const campos = lme.montar(completo, EMISSAO);

  it('lista os medicamentos nas linhas do campo 7 e as quantidades nos meses do campo 8', () => {
    expect(textoDe(campos, '7')).toEqual(['Adalimumabe 40 mg injetável', 'Metotrexato 2,5 mg comprimido']);
    expect(textoDe(campos, '8')).toEqual(['2', '2', '2', '2', '2', '2', '24', '24']);
    const linhas = camposDe(campos, '7').map((c) => (c.tipo === 'texto' ? c.caixa[1] : 0));
    expect(linhas[1]).toBeGreaterThan(linhas[0]);
  });

  it('preenche identificação, diagnóstico, anamnese e data nos campos certos', () => {
    expect(textoDe(campos, '1')).toEqual(['1234567']);
    expect(textoDe(campos, '5')).toEqual(['70,5']);
    expect(textoDe(campos, '6')).toEqual(['172']);
    expect(textoDe(campos, '9')).toEqual(['M54.5']);
    expect(textoDe(campos, '11')).toEqual(['Lombociatalgia há 8 meses, sem resposta ao tratamento conservador.']);
    expect(textoDe(campos, '15')).toEqual(['700000000000005']);
    expect(textoDe(campos, '16')).toEqual(['11/10/2026']);
    expect(textoDe(campos, '22')).toEqual(['paciente.ficticio@exemplo.com']);
  });

  it('tratamento prévio, incapacidade e raça/cor só saem marcados quando escolhidos', () => {
    expect(camposDe(campos, '12').map((c) => c.tipo)).toEqual(['marca', 'texto']);
    expect(camposDe(campos, '13').map((c) => c.tipo)).toEqual(['marca']);
    expect(camposDe(campos, '19').map((c) => c.tipo)).toEqual(['marca']);
    const vazios = lme.montar(soIdentificacao, EMISSAO);
    ['12', '13', '19', '21', '5', '6', '7', '8', '9', '11'].forEach((n) => expect(camposDe(vazios, n), `campo ${n}`).toHaveLength(0));
    // relato sem "Sim" marcado não é impresso
    expect(camposDe(lme.montar({ ...soIdentificacao, lmePreviousTreatment: 'nao', lmePreviousTreatmentReport: 'x' }, EMISSAO), '12')).toHaveLength(1);
  });

  it('documento do paciente: CPF só com 11 dígitos; senão CNS; RG não marca nada', () => {
    expect(textoDe(campos, '21')).toEqual(['00011122233']);
    expect(textoDe(lme.montar({ ...completo, patientCpf: '1234567 SSP/RO' }, EMISSAO), '21')).toEqual(['898001234567890']);
    expect(camposDe(lme.montar({ ...completo, patientCpf: '1234567 SSP/RO', patientCns: '' }, EMISSAO), '21')).toHaveLength(0);
  });

  it('campos 18 e 23 (quem preencheu e assinatura) ficam para a caneta', () => {
    expect(camposDe(campos, '18')).toHaveLength(0);
    expect(camposDe(campos, '23')).toHaveLength(0);
  });

  it('o laudo copiado lista os mesmos medicamentos, sem posologia nem quantidade inventada', () => {
    const doc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'lme_medicamentos')!;
    const md = buildSusDocumentMarkdown(doc, completo);
    expect(md).toContain('**Medicamento 1**: Adalimumabe 40 mg injetável | quantidade do 1º ao 6º mês: 2 / 2 / 2 / 2 / 2 / 2');
    expect(md).toContain('**Medicamento 2**: Metotrexato 2,5 mg comprimido | quantidade do 1º ao 6º mês: 24 / 24 / — / — / — / —');
    expect(buildSusDocumentMarkdown(doc, soIdentificacao)).toContain('- **Medicamento**: —');
    expect(buildSusDocumentMarkdown(doc, soIdentificacao)).not.toContain('1 mês');
  });
});

describe('Documentos SUS sem impresso nacional: cabeçalho com os logos do SUS e do órgão', () => {
  const guia = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'sisreg_guia')!;
  const timbre = { logoLocal: '/logos/semusa.png', logoSus: '/logos/sus.png' };

  it('traz o logo do órgão do posto de trabalho e o do SUS, um de cada lado do título', () => {
    const html = buildSusDocumentHtml(guia, completo, timbre);
    const ordem = [html.indexOf('/logos/semusa.png'), html.indexOf(guia.title), html.indexOf('/logos/sus.png')];
    expect(ordem.every((i) => i > 0)).toBe(true);
    expect(ordem).toEqual([...ordem].sort((a, b) => a - b));
    expect(html).toContain('alt="Logotipo do SUS"');
    expect(html).toContain('alt="Logotipo do órgão do local de atendimento"');
  });

  it('o logo do órgão vem do posto de trabalho: sem ele sai só o do SUS, e o SUS nunca aparece duas vezes', () => {
    const soSus = buildSusDocumentHtml(guia, completo, { logoSus: '/logos/sus.png' });
    expect(soSus.match(/<img /g)).toHaveLength(1);
    expect(soSus).not.toContain('semusa');
    const repetido = buildSusDocumentHtml(guia, completo, { logoLocal: '/logos/sus.png', logoSus: '/logos/sus.png' });
    expect(repetido.match(/<img /g)).toHaveLength(1);
  });

  it('sem timbre (texto enviado ao Editor A4) o cabeçalho segue só com o título', () => {
    const html = buildSusDocumentHtml(guia, completo);
    expect(html).not.toContain('<img');
    expect(html).toContain(guia.title);
  });

  it('APAC é regulação estadual: leva o logo do estado e o do SUS, não o do órgão municipal', () => {
    const complementar = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'apac_complementar')!;
    expect(timbreDoDocumentoSus(complementar, '/logos/semusa.png')).toEqual({ logoSus: LOGO_DO_SUS, logoLocal: LOGO_DO_ESTADO });
    expect(timbreDoDocumentoSus(guia, '/logos/semusa.png')).toEqual({ logoSus: LOGO_DO_SUS, logoLocal: '/logos/semusa.png' });
    const html = buildSusDocumentHtml(complementar, completo, timbreDoDocumentoSus(complementar, '/logos/semusa.png'));
    expect(html).toContain(LOGO_DO_ESTADO);
    expect(html).toContain(LOGO_DO_SUS);
    expect(html).not.toContain('semusa');
  });
});

describe('Timbre geral das receitas: logo do órgão, nome do local no meio e logo do SUS', () => {
  const medico = { name: 'Dra. Teste Ficticia', crm: '99999', crmState: 'RO' } as DoctorProfile;
  const contexto = (extra: Partial<WorkContext>) => ({
    clinicName: 'UNIDADE DE SAÚDE DA FAMÍLIA FICTÍCIA',
    clinicAddress: 'Rua Fictícia, 100',
    sphere: 'municipal',
    logoDataUrl: '/logos/semusa.png',
    logoAlignment: 'left',
    ...extra
  }) as WorkContext;

  it('local público: o SUS entra como segundo logo e o nome do local é o título', () => {
    const { cabecalho } = resolverIdentidade(medico, contexto({}));
    expect(cabecalho).toMatchObject({
      titulo: 'UNIDADE DE SAÚDE DA FAMÍLIA FICTÍCIA',
      logo: '/logos/semusa.png',
      logoSecundario: LOGO_DO_SUS
    });
    expect(resolverIdentidade(medico, contexto({ sphere: 'state', logoDataUrl: LOGO_DO_ESTADO })).cabecalho.logoSecundario).toBe(LOGO_DO_SUS);
  });

  it('muda só o nome do local de uma unidade para outra', () => {
    const a = resolverIdentidade(medico, contexto({})).cabecalho;
    const b = resolverIdentidade(medico, contexto({ clinicName: 'UBS OUTRA FICTÍCIA' })).cabecalho;
    expect(b.titulo).toBe('UBS OUTRA FICTÍCIA');
    expect([b.logo, b.logoSecundario]).toEqual([a.logo, a.logoSecundario]);
  });

  it('consultório particular não ganha logo do SUS; logo repetido ou sem logo do órgão também não', () => {
    expect(resolverIdentidade(medico, contexto({ sphere: 'private' })).cabecalho.logoSecundario).toBeUndefined();
    expect(resolverIdentidade(medico, contexto({ logoDataUrl: LOGO_DO_SUS })).cabecalho.logoSecundario).toBeUndefined();
    expect(resolverIdentidade(medico, contexto({ logoDataUrl: undefined })).cabecalho.logoSecundario).toBeUndefined();
    expect(resolverIdentidade(medico, null).cabecalho.logoSecundario).toBeUndefined();
  });

  it('segundo logo escolhido no posto de trabalho prevalece sobre o do SUS', () => {
    const { cabecalho } = resolverIdentidade(medico, contexto({ secondaryLogoDataUrl: '/logos/rondonia-brasao.svg' }));
    expect(cabecalho.logoSecundario).toBe('/logos/rondonia-brasao.svg');
  });
});

describe('Encaixe do texto nas caixas do impresso', () => {
  it('reduz a fonte para caber e quebra em linhas sem depender do navegador', () => {
    const curto = ajustarTexto('Dor lombar baixa', 290, 17);
    expect(curto).toMatchObject({ tamanho: 9, linhas: ['Dor lombar baixa'], cabe: true });
    const longo = ajustarTexto('Outras artrites reumatoides soropositivas com comprometimento de outros órgãos e sistemas', 290, 17);
    expect(longo.cabe).toBe(true);
    expect(longo.tamanho).toBeLessThan(9);
    expect(longo.linhas.join(' ')).toBe('Outras artrites reumatoides soropositivas com comprometimento de outros órgãos e sistemas');
  });

  it('texto que não cabe nem na fonte mínima sai marcado com […] e é denunciado para a tela', () => {
    const enorme = 'Paciente com quadro arrastado e múltiplas tentativas terapêuticas. '.repeat(60);
    const ajuste = ajustarTexto(enorme, 517, 76);
    expect(ajuste.cabe).toBe(false);
    expect(ajuste.linhas[ajuste.linhas.length - 1].endsWith('[…]')).toBe(true);
    expect(camposSemEspaco(apac, { ...completo, clinicalJustification: enorme }, EMISSAO)).toEqual(['40']);
    expect(camposSemEspaco(apac, completo, EMISSAO)).toEqual([]);
    expect(folha(apac, { ...completo, clinicalJustification: enorme })).toContain('data-cabe="nao"');
  });

  it('entende datas e telefones nos formatos do cadastro', () => {
    expect(partesDaData('1990-03-07')).toEqual(['07', '03', '1990']);
    expect(partesDaData('7/3/1990')).toEqual(['07', '03', '1990']);
    expect(partesDaData('março de 1990')).toBeNull();
    expect(partesDoTelefone('+55 (69) 98400-1122')).toEqual({ ddd: '69', numero: '984001122' });
    expect(partesDoTelefone('3221-1122')).toEqual({ ddd: '', numero: '32211122' });
    // data fora do padrão não é descartada: vai como foi digitada, no campo inteiro
    expect(textoDe(apac.montar({ ...completo, patientBirthDate: 'março de 1990' }, EMISSAO), '6')).toEqual(['março de 1990']);
  });
});
