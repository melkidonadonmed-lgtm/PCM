import { describe, it, expect } from 'vitest';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DoctorProfile, Patient, PrescriptionItem } from '../types';
import { DocumentoClinico } from '../components/documento/DocumentoClinico';
import { orientacaoDoDocumento } from '../utils/documentoClinico';
import { alturaFolhaPx, larguraFolhaPx } from '../utils/folhaA4';

describe('Conformidade Sanitária: Portaria SVS/MS nº 344/98 e RDC 784/2023 (Controle Especial)', () => {
  it('deve identificar corretamente medicamentos sujeitos a controle especial (Lista C1 e B1)', () => {
    const controlledIds = [
      'fluoxetina-20mg',
      'sertralina-50mg',
      'escitalopram-10mg',
      'clonazepam-2mg',
      'zolpidem-10mg',
      'tramadol-50mg',
      'codeina-30mg',
      'pregabalina-75mg'
    ];

    controlledIds.forEach((id) => {
      const med = UNIFIED_MEDICATIONS.find((m) => m.id === id);
      expect(med, `Medicamento ${id} deve existir na base`).toBeDefined();
      expect(med?.isSpecialControl, `Medicamento ${id} deve ter isSpecialControl: true`).toBe(true);
    });
  });

  it('não deve marcar medicamentos isentos ou antimicrobianos comuns como controle especial 344', () => {
    const regularIds = [
      'paracetamol-750mg',
      'dipirona-500mg',
      'ibuprofeno-600mg',
      'amoxicilina-500mg',
      'losartana-50mg',
      'omeprazol-20mg'
    ];

    regularIds.forEach((id) => {
      const med = UNIFIED_MEDICATIONS.find((m) => m.id === id);
      if (med) {
        expect(med.isSpecialControl).toBeFalsy();
      }
    });
  });

  it('deve segregar corretamente itens comuns e itens de controle especial em uma prescrição mista', () => {
    const mixedItems: PrescriptionItem[] = [
      {
        id: 'item-1',
        name: 'Amoxicilina 500 mg',
        presentation: '500 mg cápsulas',
        quantity: '1 caixa (21 cápsulas)',
        doseCalculatedText: '1 cápsula',
        frequencyText: 'de 8 em 8 horas',
        scheduleInterval: '8/8h',
        scheduleTimes: ['08:00', '16:00', '00:00'],
        instructions: 'Tomar por 7 dias completos',
        durationDays: 7,
        route: 'Oral',
        isContinuous: false,
        isSpecialControl: false
      },
      {
        id: 'item-2',
        name: 'Clonazepam 2 mg',
        presentation: '2 mg comprimidos',
        quantity: '1 caixa (30 comprimidos)',
        doseCalculatedText: '1 comprimido',
        frequencyText: 'à noite ao deitar',
        scheduleInterval: '24/24h',
        scheduleTimes: ['22:00'],
        instructions: 'Tomar 1 comprimido antes de dormir',
        durationDays: 30,
        route: 'Oral',
        isContinuous: true,
        isSpecialControl: true
      },
      {
        id: 'item-3',
        name: 'Dipirona 500 mg',
        presentation: '500 mg comprimidos',
        quantity: '1 cartela (10 comprimidos)',
        doseCalculatedText: '1 comprimido',
        frequencyText: 'de 6 em 6 horas se dor',
        scheduleInterval: '6/6h',
        scheduleTimes: ['08:00', '14:00', '20:00', '02:00'],
        instructions: 'Tomar se houver dor ou febre',
        durationDays: 3,
        route: 'Oral',
        isContinuous: false,
        isSpecialControl: false
      }
    ];

    // Algoritmo de particionamento regulamentar
    const regularPrescription = mixedItems.filter((item) => !item.isSpecialControl);
    const specialPrescription = mixedItems.filter((item) => item.isSpecialControl);

    expect(regularPrescription).toHaveLength(2);
    expect(regularPrescription.map((i) => i.name)).toEqual(['Amoxicilina 500 mg', 'Dipirona 500 mg']);

    expect(specialPrescription).toHaveLength(1);
    expect(specialPrescription[0].name).toBe('Clonazepam 2 mg');
    expect(specialPrescription[0].isSpecialControl).toBe(true);
  });

  describe('folha de 2 vias (a mesma usada na prévia, na impressão e no PDF)', () => {
    const doctor: DoctorProfile = {
      name: 'Dra. Gabriela Silveira',
      crm: '123456',
      crmState: 'SP',
      specialty: 'Psiquiatria',
      rqe: '7890',
      clinicName: 'Clínica Integrada',
      address: 'Av. Paulista, 1000',
      cityState: 'São Paulo - SP',
      phone: '(11) 99999-9999',
      email: 'dra.gabriela@email.com',
      showSignature: true,
      stampText: ''
    };

    const patient: Patient = {
      id: 'pat-1',
      name: 'Carlos Eduardo Souza',
      weightKg: 72,
      birthDate: '1985-06-15',
      ageText: '41 anos',
      gender: 'male',
      documentNumber: '123.456.789-00',
      phone: '(11) 98888-7777',
      allergies: []
    };

    const specialItems: PrescriptionItem[] = [
      {
        id: 'item-clona',
        name: 'Clonazepam 2 mg',
        presentation: '2 mg comprimidos',
        quantity: '1 caixa',
        doseCalculatedText: '1 comprimido',
        frequencyText: 'à noite',
        scheduleInterval: '24/24h',
        scheduleTimes: [],
        instructions: 'Tomar 1 comprimido via oral à noite ao deitar',
        durationDays: 30,
        route: 'Oral',
        isContinuous: true,
        isSpecialControl: true
      }
    ];

    const folha = (p: Patient = patient) =>
      renderToStaticMarkup(
        React.createElement(DocumentoClinico, {
          tipo: 'special_prescription',
          doctor,
          patient: p,
          prescriptionItems: specialItems
        })
      );
    const ocorrencias = (texto: string, trecho: string) => texto.split(trecho).length - 1;

    it('sai em folha única A4 paisagem', () => {
      expect(orientacaoDoDocumento('special_prescription')).toBe('landscape');
      expect(larguraFolhaPx('landscape')).toBeGreaterThan(alturaFolhaPx('landscape'));
      // A4 a 96 dpi: 297 mm x 210 mm
      expect(larguraFolhaPx('landscape')).toBe(1123);
      expect(alturaFolhaPx('landscape')).toBe(794);
    });

    it('traz as duas vias identificadas, com a mesma prescrição completa em ambas', () => {
      const html = folha();
      expect(html).toContain('1ª via — Farmácia (retenção)');
      expect(html).toContain('2ª via — Paciente (orientação)');
      expect(ocorrencias(html, 'Receituário de Controle Especial')).toBe(2);
      expect(ocorrencias(html, 'Clonazepam 2 mg')).toBe(2);
      expect(ocorrencias(html, 'Tomar 1 comprimido via oral à noite ao deitar')).toBe(2);
      expect(ocorrencias(html, '1 caixa')).toBe(2);
    });

    it('identifica o emitente (nome, CRM/UF, endereço) e o paciente com endereço nas duas vias', () => {
      const html = folha({ ...patient, address: 'Rua das Flores, 10', city: 'São Paulo', state: 'SP' });
      expect(ocorrencias(html, 'Identificação do emitente')).toBe(2);
      expect(html).toContain('Dra. Gabriela Silveira');
      expect(html).toContain('CRM-SP 123456 • RQE 7890');
      expect(html).toContain('Av. Paulista, 1000');
      expect(ocorrencias(html, 'Carlos Eduardo Souza')).toBe(2);
      expect(ocorrencias(html, 'Endereço: Rua das Flores, 10, São Paulo - SP')).toBe(2);
    });

    it('traz os quadros de comprador e fornecedor com os campos regulamentares na via da farmácia', () => {
      const html = folha();
      expect(html).toContain('Identificação do comprador');
      ['Nome', 'RG', 'Órgão emissor', 'Endereço', 'Cidade/UF', 'Telefone'].forEach((campo) => {
        expect(html, campo).toContain(`${campo}:`);
      });
      expect(html).toContain('Identificação do fornecedor');
      ['Farmácia/Drogaria', 'Quantidade dispensada', 'Lote', 'Data'].forEach((campo) => {
        expect(html, campo).toContain(`${campo}:`);
      });
      expect(html).toContain('Assinatura do farmacêutico');
    });

    it('não declara assinatura eletrônica nem validação digital inexistentes', () => {
      const html = folha();
      expect(html).not.toMatch(/assinatura eletr[ôo]nica/i);
      expect(html).not.toMatch(/valida[çc][ãa]o digital/i);
      expect(html).not.toContain('prescmed.digital');
    });
  });
});
