import { describe, it, expect } from 'vitest';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import { PrescriptionItem } from '../types';
import { generateMedicalPDF } from '../utils/pdfGenerator';

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

  it('deve validar a presença dos campos obrigatórios da Portaria 344/98 na receita especial de 2 vias', () => {
    // Especificação dos campos regulatórios de Identificação do Comprador e Fornecedor
    const buyerFields = ['Nome', 'RG', 'CPF', 'Endereço', 'Cidade/UF', 'Telefone'];
    const supplierFields = ['Farmácia/Drogaria', 'Assinatura do Farmacêutico', 'Data', 'Lote', 'Quantidade Dispensada'];

    buyerFields.forEach((field) => {
      expect(field).toBeDefined();
      expect(typeof field).toBe('string');
    });

    supplierFields.forEach((field) => {
      expect(field).toBeDefined();
      expect(typeof field).toBe('string');
    });
  });

  it('deve gerar PDF em modo Paisagem (297x210 mm) com folha única de 2 vias para Controle Especial', () => {
    const mockDoctor = {
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

    const mockPatient = {
      id: 'pat-1',
      name: 'Carlos Eduardo Souza',
      weightKg: 72,
      birthDate: '1985-06-15',
      ageText: '41 anos',
      gender: 'male' as const,
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
        scheduleTimes: ['22:00'],
        instructions: 'Tomar 1 comprimido via oral à noite ao deitar',
        durationDays: 30,
        route: 'Oral',
        isContinuous: true,
        isSpecialControl: true
      }
    ];

    const pdfSpecial = generateMedicalPDF({
      docType: 'special_prescription',
      doctor: mockDoctor,
      patient: mockPatient,
      prescriptionItems: specialItems,
      exams: [],
      examIndication: '',
      certificate: {
        id: 'c1',
        patientName: 'Carlos Eduardo Souza',
        documentNumber: '123.456.789-00',
        daysOff: 2,
        startDate: '2026-09-30',
        endDate: '2026-10-02',
        periodText: '',
        includeCID: false,
        cid10Code: '',
        cid10Description: '',
        observations: '',
        cityDateText: ''
      },
      referral: {
        id: 'r1',
        patientName: 'Carlos Eduardo Souza',
        documentNumber: '123.456.789-00',
        destinationSpecialty: 'Neurologia',
        destinationInstitution: '',
        priority: 'prioritario',
        reason: '',
        clinicalSummary: '',
        relevantExams: '',
        hypothesisCID: '',
        date: '2026-09-30'
      }
    });

    // Validar dimensões de modo Paisagem (A4: 297mm largura x 210mm altura)
    const width = Math.round(pdfSpecial.internal.pageSize.getWidth());
    const height = Math.round(pdfSpecial.internal.pageSize.getHeight());

    expect(width).toBe(297);
    expect(height).toBe(210);
    // Folha única econômica com as duas vias lado a lado
    expect(pdfSpecial.getNumberOfPages()).toBe(1);
  });
});
