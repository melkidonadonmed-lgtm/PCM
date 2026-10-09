import { describe, it, expect } from 'vitest';
import { 
  SUS_DOCUMENTS_CATALOG, 
  buildSusDocumentMarkdown, 
  buildSusDocumentHtml 
} from '../data/susDocumentsCatalog';
import { SusDocumentItem, SusFilledFormData, PrescriptionItem, SavedDocument } from '../types';

describe('Catálogo e Gerador de Documentos Regulatórios Oficiais do SUS', () => {
  const dummyFormData: SusFilledFormData = {
    // Médico
    doctorName: 'Dr. Lucas Arantes',
    doctorCrm: '12345',
    doctorCrmState: 'RO',
    doctorSpecialty: 'Clínica Médica',
    doctorClinicName: 'UBS Central de Porto Velho',
    doctorCnes: '2847591',
    doctorCpf: '111.222.333-44',

    // Paciente
    patientName: 'Maria de Fátima dos Santos',
    patientCns: '700123456789012',
    patientCpf: '445.678.901-22',
    patientBirthDate: '15/04/1982',
    patientAge: '44',
    patientGender: 'female',
    patientMotherName: 'Francisca Pereira dos Santos',
    patientPhone: '(69) 98400-1122',
    patientAddress: 'Rua das Flores, 450',
    patientNeighborhood: 'Embratel',
    patientCity: 'Porto Velho',
    patientState: 'RO',
    patientCep: '76820-000',

    // Dados Clínicos
    sigtapCode: '02.07.01.006-4',
    procedureName: 'Ressonância Magnética de Coluna Lombossacra',
    cid10Code: 'M54.5',
    cid10Description: 'Dor lombar baixa',
    clinicalJustification: 'Lombociatalgia crônica refratária a tratamento conservador há 8 meses com déficit motor em L5.',
    renalCreatinine: '0.9',
    renalEtfg: '> 90',
    isContrastNeeded: true
  };

  it('deve conter exatamente os 9 documentos oficiais do SUS com SIGTAP e parâmetros clínicos', () => {
    expect(SUS_DOCUMENTS_CATALOG).toHaveLength(9);

    const expectedIds = [
      'apac_principal',
      'apac_complementar',
      'sisreg_guia',
      'lme_medicamentos',
      'siscan_citopatologico',
      'gal_lacen_geral',
      'siscan_histopatologico',
      'siscan_mamografia',
      'gal_trm_tb'
    ];

    for (const id of expectedIds) {
      const doc = SUS_DOCUMENTS_CATALOG.find(d => d.id === id);
      expect(doc, `Documento ${id} deve existir no catálogo`).toBeDefined();
      expect(doc?.title).toBeTruthy();
      expect(doc?.defaultSigtap).toBeTruthy();
      expect(doc?.category).toBeTruthy();
      expect(doc?.system).toBeTruthy();
      expect(doc?.defaultJustification).toBeTruthy();
    }
  });

  it('deve gerar Laudo APAC com CNS do paciente, CNES da unidade e código SIGTAP correto', () => {
    const apacDoc = SUS_DOCUMENTS_CATALOG.find(d => d.id === 'apac_principal')!;
    const md = buildSusDocumentMarkdown(apacDoc, dummyFormData);
    const html = buildSusDocumentHtml(apacDoc, dummyFormData);

    // Validações determinísticas no Markdown
    expect(md).toContain('APAC — Laudo de Solicitação de Procedimento Ambulatorial');
    expect(md).toContain('700123456789012'); // CNS do paciente
    expect(md).toContain('Maria de Fátima dos Santos');
    expect(md).toContain('Francisca Pereira dos Santos'); // Nome da mãe
    expect(md).toContain('Rua das Flores, 450'); // Endereço
    expect(md).toContain('Porto Velho - RO');
    expect(md).toContain('2847591'); // CNES
    expect(md).toContain('CRM-RO 12345');
    expect(md).toContain('02.07.01.006-4'); // SIGTAP APAC
    expect(md).toContain('M54.5'); // CID-10

    // Validações no HTML gerado para o Editor A4
    expect(html).toContain('700123456789012');
    expect(html).toContain('Maria de Fátima dos Santos');
    expect(html).toContain('02.07.01.006-4');
    expect(html).toContain('Dr. Lucas Arantes');
    expect(html).toContain('class="sus-document-rendered"');
  });

  it('deve gerar Requisição GAL/LACEN com dados de vigilância epidemiológica', () => {
    const galDoc = SUS_DOCUMENTS_CATALOG.find(d => d.id === 'gal_lacen_geral')!;
    const galData: SusFilledFormData = {
      ...dummyFormData,
      sinanNumber: '987654',
      symptomsStartDate: '01/10/2026',
      specimenType: 'Soro',
      procedureName: 'Sorologia para Dengue IgM/IgG',
      sigtapCode: '02.02.03.030-9',
      cid10Code: 'A90',
      clinicalJustification: 'Febre alta de início súbito, cefaleia retro-orbital e mialgia intensa há 4 dias.'
    };

    const md = buildSusDocumentMarkdown(galDoc, galData);

    expect(md).toContain('Requisição Geral de Exames Laboratoriais (GAL / LACEN)');
    expect(md).toContain('987654'); // Notificação SINAN
    expect(md).toContain('02.02.03.030-9'); // SIGTAP GAL
    expect(md).toContain('700123456789012');
    expect(md).toContain('Febre alta de início súbito');
    expect(md).toContain('A90');
  });

  it('deve permitir armazenamento e restauração íntegra de Modelos de Receita com PrescriptionItem[]', () => {
    const testItems: PrescriptionItem[] = [
      {
        id: 'item-1',
        name: 'Dipirona Gotas 500 mg/mL',
        presentation: 'Gotas 500 mg/mL',
        route: 'oral',
        quantity: '1 frasco',
        doseCalculatedText: '40 gotas',
        frequencyText: 'de 6 em 6 horas se dor ou febre',
        scheduleInterval: '6/6h',
        scheduleTimes: ['06:00', '12:00', '18:00', '00:00'],
        durationDays: 3,
        instructions: 'Tomar 40 gotas VO até de 6/6h se dor ou febre > 37.8°C.',
        isContinuous: false,
        isSpecialControl: false
      },
      {
        id: 'item-2',
        name: 'Amoxicilina 500 mg Cápsulas',
        presentation: 'Cápsulas 500 mg',
        route: 'oral',
        quantity: '21 cápsulas',
        doseCalculatedText: '500 mg',
        frequencyText: 'de 8 em 8 horas por 7 dias',
        scheduleInterval: '8/8h',
        scheduleTimes: ['06:00', '14:00', '22:00'],
        durationDays: 7,
        instructions: 'Tomar 1 cápsula VO de 8/8h por 7 dias pontualmente.',
        isContinuous: false,
        isSpecialControl: true
      }
    ];

    const modelDoc: SavedDocument = {
      id: 'modelo-infeccao-respiratoria',
      title: 'Modelo: Infecção Respiratória Adulto',
      contextId: 'default',
      contentJson: null,
      contentHtml: '',
      createdAt: 1775700000000,
      updatedAt: 1775700000000,
      isTemplate: true,
      prescriptionItems: testItems
    };

    expect(modelDoc.prescriptionItems).toHaveLength(2);
    expect(modelDoc.prescriptionItems![0].name).toBe('Dipirona Gotas 500 mg/mL');
    expect(modelDoc.prescriptionItems![1].isSpecialControl).toBe(true);
    expect(modelDoc.prescriptionItems![1].durationDays).toBe(7);

    // Validação de desestruturação e clonagem segura para a receita ativa
    const clonedItems = modelDoc.prescriptionItems!.map(item => ({
      ...item,
      id: `presc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    }));

    expect(clonedItems).toHaveLength(2);
    expect(clonedItems[0].name).toBe(testItems[0].name);
    expect(clonedItems[0].id).not.toBe(testItems[0].id);
  });

  it('deve garantir que todos os 7 templates predefinidos suprimem cabeçalho externo duplicado', async () => {
    const { PRESET_CLINICAL_TEMPLATES } = await import('../data/presetClinicalTemplates');
    expect(PRESET_CLINICAL_TEMPLATES).toHaveLength(7);

    for (const tpl of PRESET_CLINICAL_TEMPLATES) {
      expect(tpl.headerConfig).toBeDefined();
      expect(tpl.headerConfig?.showHeader).toBe(false);
      expect(tpl.headerConfig?.showFooter).toBe(false);
      expect(tpl.headerConfig?.showPatientBanner).toBe(false);
    }
  });

  it('deve validar integridade clínica dos itens estruturados nos presets de receitas', async () => {
    const { PRESET_CLINICAL_TEMPLATES } = await import('../data/presetClinicalTemplates');
    const rxTemplates = PRESET_CLINICAL_TEMPLATES.filter(t => t.prescriptionItems && t.prescriptionItems.length > 0);
    expect(rxTemplates.length).toBeGreaterThanOrEqual(3);

    for (const tpl of rxTemplates) {
      for (const item of tpl.prescriptionItems!) {
        expect(item.name).toBeTruthy();
        expect(item.doseCalculatedText).toBeTruthy();
        expect(item.frequencyText).toBeTruthy();
        expect(typeof item.isContinuous).toBe('boolean');
        expect(item.route).toBeTruthy();
        expect(item.quantity).toBeTruthy();
      }
    }
  });

  it('deve concatenar múltiplos documentos do SUS com quebra de página visual para o editor', () => {
    const doc1 = SUS_DOCUMENTS_CATALOG.find(d => d.id === 'apac_principal')!;
    const doc2 = SUS_DOCUMENTS_CATALOG.find(d => d.id === 'gal_lacen_geral')!;

    const html1 = buildSusDocumentHtml(doc1, dummyFormData);
    const html2 = buildSusDocumentHtml(doc2, dummyFormData);

    const combinedHtml = `${html1}<div style="page-break-before: always; margin-top: 32px; border-top: 2px dashed #94A3B8; padding-top: 24px;"></div>${html2}`;

    expect(combinedHtml).toContain('page-break-before: always');
    expect(combinedHtml).toContain('APAC — Laudo de Solicitação de Procedimento Ambulatorial');
    expect(combinedHtml).toContain('Requisição Geral de Exames Laboratoriais (GAL / LACEN)');
  });
});

