import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeHtml, DOMPurify } from '../utils/sanitizeHtml';
import {
  formatarReceitaCopiaTexto,
  formatarReceitaWhatsAppTexto,
  formatarAtestadoWhatsAppTexto,
  formatarEncaminhamentoWhatsAppTexto,
  formatarDocumentoPreviewTexto
} from '../utils/compartilhamentoTexto';
import { buildSusDocumentHtml, SUS_DOCUMENTS_CATALOG } from '../data/susDocumentsCatalog';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import { parseAndValidateBackup } from '../services/backupService';
import {
  formatPrescriptionItemsList,
  interpolateMedicalTags,
  buildActiveReferralPayload,
  buildActiveCertificatePayload
} from '../components/editor/editorConfigAndFormatters';
import { DEFAULT_HOSPITAL_BEDS_SEED } from '../utils/hospital/hospitalMultimodalIngestor';
import type { DoctorProfile, Patient, PrescriptionItem, SusFilledFormData } from '../types';

const medicoPadrao: DoctorProfile = {
  name: 'Dra. Helena Costa',
  crm: '123456',
  crmState: 'SP',
  specialty: 'Clínica Médica',
  clinicName: 'UBS Jardim Primavera',
  address: 'Rua das Flores, 100',
  cityState: 'São Paulo - SP',
  phone: '(11) 3333-4444',
  email: 'helena@ubs.gov.br',
  showSignature: true
};

const pacientePadrao: Patient = {
  id: 'pac-1',
  name: 'João da Silva',
  ageText: '45 anos',
  gender: 'male',
  weightKg: 72,
  documentNumber: '123.456.789-00',
  allergies: []
};

describe('Auditoria de Segurança XSS e Sanitização HTML (sanitizeHtml)', () => {
  it('escapa caracteres especiais e preserva operadores clínicos < e > sem truncar texto', () => {
    const raw = 'Paciente com eTFG < 45 mL/min & K+ > 5,5 mEq/L ("alerta")';
    const escaped = escapeHtml(raw);

    expect(escaped).toBe(
      'Paciente com eTFG &lt; 45 mL/min &amp; K+ &gt; 5,5 mEq/L (&quot;alerta&quot;)'
    );
    expect(escaped).not.toContain('< 45');
  });

  it('remove tags <script>, handlers on* e protocolos javascript: preservando marcação clínica', () => {
    const malicious =
      '<p onclick="xssPayload(1)"><strong>1. Dipirona 500 mg</strong></p><script>window.evil=true</script><a href="javascript:xssPayload(2)">Link</a>';
    const clean = DOMPurify.sanitize(malicious);

    expect(clean).toContain('<strong>1. Dipirona 500 mg</strong>');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('javascript:');
    expect(sanitizeHtml(malicious)).toBe(clean);
  });

  it('neutraliza tags aninhadas reconstruídas (<scr<input>ipt>), atributos separados por barra (<img/onerror=...>) e entidades HTML em javascript: (PCM-SEC-03)', () => {
    const nested = '<scr<input>ipt>window.pwned=1</scr</input>ipt><img/src="x"/onerror="alert(1)"><a href="&#106;avascript:alert(2)">Click</a>';
    const clean = DOMPurify.sanitize(nested);

    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('javascript');
    expect(clean).not.toContain('&#106;avascript');
  });

  it('escapa operadores clínicos (< e >) e tags HTML nos formatadores do Editor A4 sem interpretar padrões $ (PCM-SEC-03)', () => {
    const itemsHtml = formatPrescriptionItemsList([
      {
        id: 'rx-sec-1',
        name: 'Espironolactona 25 mg <script>evil()</script>',
        presentation: 'Comprimido',
        route: 'Uso Oral',
        quantity: '30 comp',
        doseCalculatedText: '1 comp',
        frequencyText: '1x/dia',
        instructions: 'Suspender se K+ > 5,5 mEq/L ou eTFG < 30 mL/min',
        scheduleInterval: '24/24h',
        scheduleTimes: [],
        isContinuous: true,
      },
    ]);
    expect(itemsHtml).not.toContain('<script>');
    expect(itemsHtml).toContain('&gt; 5,5 mEq/L');
    expect(itemsHtml).toContain('&lt; 30 mL/min');

    const interpolated = interpolateMedicalTags(
      '<p>Paciente: {{paciente_nome}}</p>',
      { ...pacientePadrao, name: 'João $& <img src=x onerror=alert(1)>' },
      [],
      medicoPadrao,
      null
    );
    expect(interpolated).toContain('João $&amp; &lt;img src=x onerror=alert(1)&gt;');
    expect(interpolated).not.toContain('<img');

    const refPayload = buildActiveReferralPayload(
      pacientePadrao,
      {
        patientName: pacientePadrao.name,
        documentNumber: '123',
        destinationSpecialty: 'Cardiologia',
        reason: 'ICFER com FEVE < 35% e QRS > 150 ms',
        clinicalSummary: 'Uso de IECA <script>bad()</script>',
        relevantExams: 'Eco: FEVE < 35%',
        hypothesisCID: 'I50.0',
        priority: 'prioritario',
      },
      {
        doctorName: medicoPadrao.name,
        doctorCrm: 'CRM-SP 123456',
        doctorSpecialty: 'Clínica Médica',
        clinicName: 'UBS',
        clinicAddress: 'Rua A',
        badgeText: '',
        dateText: '24/10/2026',
        showHeader: true,
        showFooter: true,
        showPatientBanner: false,
        patientCustomText: '',
        footerDocName: medicoPadrao.name,
        footerCrm: 'CRM-SP 123456',
        footerSpecialty: 'Clínica Médica',
        footerSubtext: '',
      }
    );
    expect(refPayload.referralHtml).toContain('FEVE &lt; 35%');
    expect(refPayload.referralHtml).toContain('QRS &gt; 150 ms');
    expect(refPayload.referralHtml).not.toContain('<script>');

    const certPayload = buildActiveCertificatePayload(
      pacientePadrao,
      {
        patientName: pacientePadrao.name,
        documentNumber: '123',
        daysOff: 3,
        startDate: '2026-10-24',
        endDate: '2026-10-26',
        periodText: 'por quadro febril > 38,5°C',
        includeCID: true,
        cid10Code: 'J18.9',
        cid10Description: 'Pneumonia <bacteriana>',
        observations: 'Reavaliar se SpO2 < 94%',
      },
      refPayload.nextHeader
    );
    expect(certPayload.certHtml).toContain('&gt; 38,5°C');
    expect(certPayload.certHtml).toContain('SpO2 &lt; 94%');
    expect(certPayload.certHtml).toContain('&lt;bacteriana&gt;');
  });

  it('escapa campos livres e sinais clínicos (< / >) em buildSusDocumentHtml', () => {
    const docItem = SUS_DOCUMENTS_CATALOG[0];
    const formData: SusFilledFormData = {
      patientName: 'Maria <script>xssPayload(1)</script>',
      patientCns: '700000000000001',
      patientCpf: '111.222.333-44',
      patientBirthDate: '1980-05-10',
      patientAge: '45',
      patientGender: 'female',
      patientSex: 'F',
      patientMotherName: 'Ana Silva',
      patientPhone: '(11) 99999-0000',
      patientAddress: 'Av. Brasil, 500',
      patientNeighborhood: 'Centro',
      patientCity: 'São Paulo',
      patientState: 'SP',
      patientCep: '01000-000',
      doctorName: medicoPadrao.name,
      doctorCrm: medicoPadrao.crm,
      doctorCrmState: medicoPadrao.crmState,
      doctorSpecialty: medicoPadrao.specialty,
      doctorClinicName: medicoPadrao.clinicName,
      doctorCnes: '1234567',
      sigtapCode: '02.04.03.018-8',
      procedureName: 'Mamografia bilateral',
      procedureQuantity: '1',
      cid10Code: 'Z12.3',
      cid10Description: 'Rastreamento de neoplasia de mama',
      clinicalJustification: 'Lesão BI-RADS 4 com nódulo < 12 mm & microcalcificações > 3 mm',
      lmePreviousTreatment: 'nao'
    };

    const html = buildSusDocumentHtml(docItem, formData);

    expect(html).not.toContain('<script>');
    expect(html).toContain('Maria &lt;script&gt;xssPayload(1)&lt;/script&gt;');
    expect(html).toContain('&lt; 12 mm');
    expect(html).toContain('&gt; 3 mm');
  });
});

describe('Formatadores Puros de Compartilhamento e Conformidade CFM (compartilhamentoTexto)', () => {
  const itens: PrescriptionItem[] = [
    {
      id: 'item-1',
      name: 'Amoxicilina 500 mg',
      presentation: 'Cápsulas',
      route: 'Uso Oral',
      quantity: '21 cápsulas',
      doseCalculatedText: '1 cápsula',
      frequencyText: 'de 8 em 8 horas',
      instructions: '1 cápsula de 8/8h por 7 dias',
      scheduleInterval: 'Conforme posologia',
      scheduleTimes: [],
      isContinuous: false,
      isSpecialControl: true,
      regimeReceita: 'antimicrobiano'
    }
  ];

  const porRegime = {
    simples: [],
    antimicrobiano: itens,
    controle_especial: []
  };

  it('formata texto de cópia e WhatsApp da receita segregando por regime sanitário', () => {
    const textoCopia = formatarReceitaCopiaTexto(itens, ['antimicrobiano'], porRegime);
    const textoWa = formatarReceitaWhatsAppTexto({
      items: itens,
      doctor: medicoPadrao,
      patient: pacientePadrao,
      regimesComItens: ['antimicrobiano'],
      porRegime
    });

    expect(textoCopia).toContain('RECEITUÁRIO MÉDICO — ANTIMICROBIANO');
    expect(textoCopia).toContain('1. Amoxicilina 500 mg (Uso Oral)');
    expect(textoWa).toContain('*RECEITUÁRIO MÉDICO — ANTIMICROBIANO (2 vias • válida por 10 dias):*');
    expect(textoWa).toContain('Dra. Helena Costa');
  });

  it('omite CID-10 no WhatsApp do atestado quando não autorizado pelo paciente (Res. CFM 1.658/2002)', () => {
    const semConsentimento = formatarAtestadoWhatsAppTexto(medicoPadrao, pacientePadrao, {
      patientName: 'João da Silva',
      documentNumber: '123.456.789-00',
      daysOff: 2,
      startDate: '2026-10-19',
      endDate: '2026-10-20',
      periodText: 'por motivo de saúde',
      includeCID: false,
      cid10Code: 'J03.9',
      cid10Description: 'Amigdalite aguda',
      observations: '',
      date: '19/10/2026'
    });

    const comConsentimento = formatarAtestadoWhatsAppTexto(medicoPadrao, pacientePadrao, {
      patientName: 'João da Silva',
      documentNumber: '123.456.789-00',
      daysOff: 2,
      startDate: '2026-10-19',
      endDate: '2026-10-20',
      periodText: 'por motivo de saúde',
      includeCID: true,
      cid10Code: 'J03.9',
      cid10Description: 'Amigdalite aguda',
      observations: '',
      date: '19/10/2026'
    });

    expect(semConsentimento).not.toContain('J03.9');
    expect(comConsentimento).toContain('J03.9');
  });

  it('formata encaminhamento e preview de exames de maneira determinística', () => {
    const textoEnc = formatarEncaminhamentoWhatsAppTexto(medicoPadrao, pacientePadrao, {
      patientName: 'João da Silva',
      documentNumber: '123.456.789-00',
      destinationSpecialty: 'Cardiologia',
      reason: 'ICFER - CID I50.0',
      clinicalSummary: 'Dispneia aos médios esforços',
      relevantExams: 'ECG sinusal',
      hypothesisCID: 'I50.0',
      priority: 'prioritario',
      date: '19/10/2026'
    });

    const textoExames = formatarDocumentoPreviewTexto({
      isConfigured: true,
      docType: 'exams',
      emissao: new Date('2026-10-19T12:00:00Z'),
      identidade: {
        exemplo: false,
        cabecalho: {
          titulo: 'UBS Jardim Primavera',
          tituloEhMedico: false,
          linhas: ['Secretaria Municipal de Saúde'],
          alinhamentoLogo: 'left'
        },
        medico: {
          nome: 'Dra. Helena Costa',
          registro: 'CRM-SP 123456',
          especialidade: 'Clínica Médica',
          endereco: 'Rua das Flores, 100',
          telefone: '(11) 3333-4444',
          cidadeUf: 'São Paulo - SP'
        }
      },
      patientName: 'João da Silva',
      patientWeight: 72,
      ehReceita: false,
      itensDaFolha: [],
      certificate: {
        patientName: 'João da Silva',
        documentNumber: '',
        daysOff: 1,
        startDate: '2026-10-19',
        endDate: '2026-10-19',
        periodText: 'por motivo de saúde',
        includeCID: false,
        cid10Code: '',
        cid10Description: '',
        observations: ''
      },
      referral: {
        patientName: 'João da Silva',
        documentNumber: '',
        destinationSpecialty: 'Hematologia',
        reason: '',
        clinicalSummary: '',
        relevantExams: '',
        hypothesisCID: '',
        priority: 'eletivo'
      },
      exams: [{ id: 'ex-1', name: 'Hemograma completo', category: 'Hematologia', selected: true, urgency: 'routine' }],
      examIndication: 'Investigação de anemia'
    });

    expect(textoEnc).toContain('*Cardiologia*');
    expect(textoExames).toContain('Hemograma completo');
    expect(textoExames).toContain('Investigação de anemia');
  });
});

describe('Preservação de Metadados no Editor A4 e Validação Defensiva de Backup', () => {
  it('preserva regimeReceita e calculatedFromWeight ao converter HTML do Editor de volta para itens', () => {
    const existentes: PrescriptionItem[] = [
      {
        id: 'orig-1',
        name: 'Clonazepam 2 mg',
        presentation: 'Comprimidos',
        route: 'Uso Oral',
        quantity: '30 comprimidos',
        doseCalculatedText: '1 comprimido',
        frequencyText: '1x ao dia',
        instructions: 'Tomar 1 comprimido à noite',
        scheduleInterval: 'Conforme posologia',
        scheduleTimes: [],
        isContinuous: true,
        isSpecialControl: true,
        regimeReceita: 'controle_especial',
        calculatedFromWeight: 72
      }
    ];

    const htmlEditado =
      '<p><strong>1. Clonazepam 2 mg --- 30 comprimidos</strong></p><p>Posologia: Tomar 1 comprimido à noite por 30 dias</p>';
    const convertidos = parsePrescriptionHtmlToItems(htmlEditado, existentes);

    expect(convertidos).toHaveLength(1);
    expect(convertidos[0].id).toBe('orig-1');
    expect(convertidos[0].isSpecialControl).toBe(true);
    expect(convertidos[0].regimeReceita).toBe('controle_especial');
    expect(convertidos[0].calculatedFromWeight).toBe(72);
  });

  it('rejeita perfil médico malformado e aceita perfil válido em parseAndValidateBackup', async () => {
    const jsonValido = JSON.stringify({
      system: 'PresCMed',
      version: '2.0.0',
      exportedAt: '2026-10-19T12:00:00.000Z',
      data: {
        doctorProfile: medicoPadrao,
        workContexts: [],
        savedDocuments: [],
        customStyles: []
      }
    });

    const mockFile = { text: async () => jsonValido } as unknown as File;
    const parsed = await parseAndValidateBackup(mockFile);
    expect(parsed.data.doctorProfile?.crm).toBe('123456');
    expect(parsed.data.doctorProfile?.name).toBe('Dra. Helena Costa');

    const jsonInvalido = JSON.stringify({
      system: 'PresCMed',
      version: '2.0.0',
      exportedAt: '2026-10-19T12:00:00.000Z',
      data: {
        doctorProfile: { name: 123 },
        workContexts: [],
        savedDocuments: []
      }
    });
    const mockFileInv = { text: async () => jsonInvalido } as unknown as File;
    await expect(parseAndValidateBackup(mockFileInv)).rejects.toThrow(
      'O perfil médico no backup contém estrutura inválida.'
    );

    const jsonComLeitosValidos = JSON.stringify({
      system: 'PresCMed',
      version: 2,
      exportedAt: '2026-10-24T12:00:00.000Z',
      data: {
        doctorProfile: medicoPadrao,
        workContexts: [],
        savedDocuments: [],
        hospitalBeds: DEFAULT_HOSPITAL_BEDS_SEED,
        customStyles: []
      }
    });
    const parsedV2 = await parseAndValidateBackup({ text: async () => jsonComLeitosValidos } as unknown as File);
    expect(parsedV2.data.hospitalBeds).toHaveLength(DEFAULT_HOSPITAL_BEDS_SEED.length);
    expect(parsedV2.data.hospitalBeds?.[0].wardAndBed).toBe('110-15');

    const jsonComLeitoInvalido = JSON.stringify({
      system: 'PresCMed',
      version: 2,
      exportedAt: '2026-10-24T12:00:00.000Z',
      data: {
        workContexts: [],
        savedDocuments: [],
        hospitalBeds: [{ id: 123 }]
      }
    });
    await expect(
      parseAndValidateBackup({ text: async () => jsonComLeitoInvalido } as unknown as File)
    ).rejects.toThrow('O registro de leito hospitalar #1 contém campos obrigatórios ausentes.');
  });
});
