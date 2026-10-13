import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import { classificarReceita, isSpecialControlOrAntibiotic } from '../utils/isSpecialControlOrAntibiotic';
import { DOCUMENTO_DO_REGIME, orientacaoDoDocumento, separarPorRegime } from '../utils/documentoClinico';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import type { DoctorProfile, Patient, PrescriptionItem } from '../types';

const item = (id: string, name: string, extra: Partial<PrescriptionItem> = {}): PrescriptionItem => ({
  id,
  name,
  presentation: 'comprimidos',
  route: 'Oral',
  quantity: '21 comprimidos',
  doseCalculatedText: '1 comprimido',
  frequencyText: 'de 8 em 8 horas',
  scheduleInterval: 'Conforme posologia',
  scheduleTimes: [],
  instructions: `Posologia de ${name}.`,
  isContinuous: false,
  ...extra
});

describe('Regime da receita: simples, antimicrobiano e controle especial', () => {
  it('classifica antimicrobianos (RDC 471/2021) separados dos controlados (Portaria 344/98)', () => {
    expect(classificarReceita('Amoxicilina 500mg')).toBe('antimicrobiano');
    expect(classificarReceita('Azitromicina 500mg comprimido (Astro)')).toBe('antimicrobiano');
    expect(classificarReceita({ name: 'Cefixima 400mg', category: 'antibioticos' })).toBe('antimicrobiano');
    expect(classificarReceita('Clonazepam 2mg (Rivotril)')).toBe('controle_especial');
    expect(classificarReceita('Tramadol 50mg')).toBe('controle_especial');
    expect(classificarReceita('Dipirona 500mg')).toBe('simples');
    expect(classificarReceita(null)).toBe('simples');
  });

  it('não confunde a categoria "gastro" com a marca de azitromicina "Astro"', () => {
    const gastro = UNIFIED_MEDICATIONS.filter((m) => m.category === 'gastro');
    expect(gastro.length).toBeGreaterThan(0);
    gastro.forEach((m) => {
      expect(classificarReceita(m), m.name).toBe('simples');
      expect(isSpecialControlOrAntibiotic(m), m.name).toBe(false);
    });
    expect(classificarReceita('Gastrol comprimido')).toBe('simples');
    expect(classificarReceita('Omeprazol 20mg cápsula gastrorresistente')).toBe('simples');
  });

  it('em todo o catálogo, só antibióticos e controlados saem em 2 vias', () => {
    UNIFIED_MEDICATIONS.forEach((m) => {
      const regime = classificarReceita(m);
      if (m.category === 'antibioticos') expect(regime, m.name).toBe('antimicrobiano');
      if (m.isSpecialControl) expect(regime, m.name).toBe('controle_especial');
      if (!['antibioticos', 'snc', 'analgesicos'].includes(m.category)) expect(regime, m.name).toBe('simples');
    });
  });

  it('respeita o tipo de receita escolhido no formulário, sem rebaixar um controlado', () => {
    expect(classificarReceita(item('a', 'Cefixima 400mg', { regimeReceita: 'antimicrobiano' }))).toBe('antimicrobiano');
    expect(classificarReceita(item('b', 'Fármaco novo', { regimeReceita: 'controle_especial' }))).toBe('controle_especial');
    expect(classificarReceita(item('c', 'Clonazepam 2mg', { regimeReceita: 'simples' }))).toBe('controle_especial');
    expect(classificarReceita(item('d', 'Amoxicilina 500mg', { regimeReceita: 'simples' }))).toBe('antimicrobiano');
    // marcação antiga de "2 vias" sem tipo definido continua valendo como controle especial
    expect(classificarReceita(item('e', 'Fármaco novo', { isSpecialControl: true }))).toBe('controle_especial');
  });

  it('separa a prescrição em um documento por regime', () => {
    const grupos = separarPorRegime([
      item('1', 'Dipirona 500mg'),
      item('2', 'Amoxicilina 500mg'),
      item('3', 'Clonazepam 2mg'),
      item('4', 'Loratadina 10mg')
    ]);
    expect(grupos.simples.map((i) => i.id)).toEqual(['1', '4']);
    expect(grupos.antimicrobiano.map((i) => i.id)).toEqual(['2']);
    expect(grupos.controle_especial.map((i) => i.id)).toEqual(['3']);
    expect(DOCUMENTO_DO_REGIME.antimicrobiano).toBe('antimicrobial_prescription');
    expect(orientacaoDoDocumento('antimicrobial_prescription')).toBe('landscape');
  });
});

describe('Folha da receita de antimicrobiano (RDC Anvisa nº 471/2021)', () => {
  const doctor: DoctorProfile = {
    name: 'Dra. Teste Ficticia',
    crm: '99999',
    crmState: 'RO',
    specialty: 'Clínica Médica',
    clinicName: 'UBS Teste',
    address: 'Rua Fictícia, 100',
    cityState: 'Porto Velho - RO',
    phone: '(69) 0000-0000',
    email: '',
    showSignature: true
  };
  const patient: Patient = { id: 'p', name: 'Paciente Ficticio', weightKg: 70, ageText: '36 anos', gender: 'male', allergies: [] };
  const html = renderToStaticMarkup(
    <DocumentoClinico
      tipo="antimicrobial_prescription"
      doctor={doctor}
      patient={patient}
      prescriptionItems={[item('1', 'Amoxicilina 500mg', { instructions: 'Tomar 1 cápsula de 8 em 8 horas por 7 dias.' })]}
    />
  );
  const ocorrencias = (trecho: string) => html.split(trecho).length - 1;

  it('sai em 2 vias: a 1ª é do paciente e a 2ª fica retida na farmácia', () => {
    expect(html).toContain('1ª via — Paciente');
    expect(html).toContain('2ª via — Farmácia (retenção)');
    expect(ocorrencias('Amoxicilina 500mg')).toBe(2);
    expect(ocorrencias('Tomar 1 cápsula de 8 em 8 horas por 7 dias.')).toBe(2);
    expect(ocorrencias('21 comprimidos')).toBe(2);
  });

  it('informa a validade de 10 dias e identifica emitente e paciente (com idade)', () => {
    expect(ocorrencias('receita válida por 10 dias a contar da data de emissão (RDC Anvisa nº 471/2021)')).toBe(2);
    expect(ocorrencias('Identificação do emitente')).toBe(2);
    expect(html).toContain('CRM-RO 99999');
    expect(html).toContain('Rua Fictícia, 100');
    expect(ocorrencias('36 anos')).toBe(2);
    expect(ocorrencias('Dispensação — preenchimento da farmácia')).toBe(2);
  });

  it('não leva título nem avisos do controle especial', () => {
    expect(html).not.toMatch(/controle especial/i);
    expect(html).not.toContain('344/98');
    expect(html).not.toContain('Identificação do comprador');
    expect(html).not.toContain('Identificação do fornecedor');
    expect(html).toContain('Receituário Médico');
  });

  it('imprime o sexo do paciente (RDC 471/2021) apenas quando informado explicitamente (M ou F)', () => {
    // Sem patient.sex informado (mesmo com gender='male' legado), não presume sexo
    expect(html).not.toContain('Sexo:');

    const htmlFeminino = renderToStaticMarkup(
      <DocumentoClinico
        tipo="antimicrobial_prescription"
        doctor={doctor}
        patient={{ ...patient, sex: 'F' }}
        prescriptionItems={[item('1', 'Amoxicilina 500mg')]}
      />
    );
    expect((htmlFeminino.match(/Sexo: Feminino/g) || []).length).toBe(2);

    const htmlMasculino = renderToStaticMarkup(
      <DocumentoClinico
        tipo="antimicrobial_prescription"
        doctor={doctor}
        patient={{ ...patient, sex: 'M' }}
        prescriptionItems={[item('1', 'Amoxicilina 500mg')]}
      />
    );
    expect((htmlMasculino.match(/Sexo: Masculino/g) || []).length).toBe(2);
  });
});

