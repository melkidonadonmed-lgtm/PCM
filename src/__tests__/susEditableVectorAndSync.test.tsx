import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SUS_DOCUMENTS_CATALOG,
  timbreDoDocumentoSus,
} from '../data/susDocumentsCatalog';
import { SusInteractiveVectorSheet } from '../components/sus/SusInteractiveVectorSheet';
import { SusDocumentsFiller } from '../components/SusDocumentsFiller';
import {
  applyAgeOrBirthDateInput,
  buildInitialPatientModalState,
} from '../components/PatientModal';
import {
  resolveSusCommonData,
  routeSusFieldUpdate,
} from '../utils/susFormSync';
import { DOMPurify } from '../utils/sanitizeHtml';
import {
  DEFAULT_DOCTOR,
  DEFAULT_PATIENT,
  createDefaultCertificate,
  createDefaultReferral,
  syncDoctorCityToCertificate,
  syncPatientToDocuments,
} from '../hooks/usePrescriptionSession';
import { resolverIdentidade } from '../utils/documentoClinico';
import { buildDefaultHeaderConfig } from '../components/editor/editorConfigAndFormatters';
import { mergeHeaderConfigWithDoctorProfile } from '../components/editor/EditorSheetViewport';
import {
  DoctorProfile,
  LmeMedicationRow,
  Patient,
  SusFilledFormData,
  WorkContext,
} from '../types';

const BASE_DOCTOR: DoctorProfile = {
  ...DEFAULT_DOCTOR,
  name: 'Dra. Helena Vasconcelos',
  crm: '8842',
  crmState: 'RO',
  specialty: 'Reumatologia',
  rqe: '2140',
  clinicName: 'USF Osvaldo Piana',
  cityState: 'Porto Velho - RO',
  cnes: '2678942',
  cpf: '123.456.789-00',
  cns: '700999888777666',
};

const BASE_PATIENT: Patient = {
  ...DEFAULT_PATIENT,
  id: 'pat-sync-1',
  name: 'Carlos Eduardo Nogueira',
  weightKg: 78.5,
  birthDate: '12/08/1980',
  ageText: '46 anos',
  gender: 'male',
  sex: 'M',
  documentNumber: '555.444.333-22',
  cns: '704111222333444',
  motherName: 'Tereza Nogueira',
  phone: '(69) 99211-3344',
  address: 'Av. Sete de Setembro, 1200',
  neighborhood: 'Centro',
  city: 'Porto Velho',
  state: 'RO',
  cep: '76801-096',
  allergies: ['Dipirona'],
};

const BASE_LME_ROW: LmeMedicationRow = {
  name: 'Adalimumabe 40 mg solução injetável',
  quantities: ['2', '2', '2', '2', '2', '2'],
};

const BASE_SUS_DATA: SusFilledFormData = {
  doctorName: BASE_DOCTOR.name,
  doctorCrm: BASE_DOCTOR.crm,
  doctorCrmState: BASE_DOCTOR.crmState,
  doctorSpecialty: BASE_DOCTOR.specialty,
  doctorClinicName: BASE_DOCTOR.clinicName,
  doctorCnes: BASE_DOCTOR.cnes || '',
  doctorCpf: BASE_DOCTOR.cpf,
  doctorCns: BASE_DOCTOR.cns,
  patientName: BASE_PATIENT.name,
  patientCns: BASE_PATIENT.cns || '',
  patientCpf: BASE_PATIENT.documentNumber,
  patientBirthDate: BASE_PATIENT.birthDate,
  patientAge: BASE_PATIENT.ageText,
  patientGender: 'male',
  patientSex: 'M',
  patientWeightKg: '78.5',
  patientHeightCm: '176',
  patientMotherName: BASE_PATIENT.motherName || '',
  patientPhone: BASE_PATIENT.phone,
  patientAddress: BASE_PATIENT.address || '',
  patientNeighborhood: BASE_PATIENT.neighborhood || '',
  patientCity: BASE_PATIENT.city || '',
  patientState: BASE_PATIENT.state || '',
  patientCep: BASE_PATIENT.cep || '',
  sigtapCode: '02.07.01.006-4',
  procedureName: 'Ressonância Magnética de Coluna Lombossacra',
  cid10Code: 'M45',
  cid10Description: 'Espondilite ancilosante',
  clinicalJustification: 'Dor inflamatória axial refratária a dois AINEs em dose plena.',
  lmeMedications: [BASE_LME_ROW],
  lmePreviousTreatment: 'sim',
  lmePreviousTreatmentReport:
    'Uso prévio de Naproxeno 1000 mg/dia e Celecoxibe 400 mg/dia sem remissão.',
  lmeIncapable: 'nao',
  lmeResponsibleName: '',
};

describe('Documentos SUS exclusivamente em Folha A4 Vetorial Editável & Sincronia Simultânea', () => {
  it('renderiza todos os 9 documentos SUS como grade vetorial editável sem imagens escaneadas de baixa resolução', () => {
    for (const docItem of SUS_DOCUMENTS_CATALOG) {
      const html = renderToStaticMarkup(
        <SusInteractiveVectorSheet
          docItem={docItem}
          formData={BASE_SUS_DATA}
          timbre={timbreDoDocumentoSus(docItem)}
          onFieldChange={() => {}}
        />
      );

      expect(html).toContain('sus-document-rendered');
      expect(html).toContain('grid-cols-12');
      expect(html).not.toContain('apac-laudo.png');
      expect(html).not.toContain('lme.png');
    }

    const fillerFormHtml = renderToStaticMarkup(
      <SusDocumentsFiller
        darkMode={false}
        doctor={BASE_DOCTOR}
        patient={BASE_PATIENT}
        initialDocId="apac_principal"
      />
    );
    expect(fillerFormHtml).toContain('Folha A4 Vetorial Editável');
    expect(fillerFormHtml).not.toContain('Impresso Oficial MS');
    expect(fillerFormHtml).not.toContain('apac-laudo.png');
    expect(fillerFormHtml).not.toContain('lme.png');
  });

  it('mantém CPF (campo 28) e CNS (campo 29) distintos e renderiza a grade editável de 6 meses da LME', () => {
    const lmeDoc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'lme_medicamentos')!;
    const html = renderToStaticMarkup(
      <SusInteractiveVectorSheet
        docItem={lmeDoc}
        formData={BASE_SUS_DATA}
        timbre={timbreDoDocumentoSus(lmeDoc)}
        onFieldChange={() => {}}
      />
    );

    expect(html).toContain('123.456.789-00');
    expect(html).toContain('700999888777666');
    expect(html).toContain('1º Mês');
    expect(html).toContain('6º Mês');
    expect(html).toContain('Adalimumabe 40 mg solução injetável');
    expect(html).toContain('Quantidade mês 1 do medicamento 1');

    // Roteamento estrito: editar doctorCpf nunca muta doctorCns e vice-versa
    const cpfUpdate = routeSusFieldUpdate('doctorCpf', '999.888.777-66');
    const cnsUpdate = routeSusFieldUpdate('doctorCns', '701222333444555');
    expect(cpfUpdate).toEqual({ kind: 'doctor', patch: { cpf: '999.888.777-66' } });
    expect(cnsUpdate).toEqual({ kind: 'doctor', patch: { cns: '701222333444555' } });
  });

  it('preserva 100% dos valores e neutraliza payloads XSS em staticPrintMode sob DOMPurify.sanitize (exportação em lote)', () => {
    const lmeDoc = SUS_DOCUMENTS_CATALOG.find((d) => d.id === 'lme_medicamentos')!;
    const adversarialData: SusFilledFormData = {
      ...BASE_SUS_DATA,
      clinicalJustification:
        'Quadro ativo <script>window.__xss = 1</script><img src=x onerror="alert(1)">',
    };

    const rawMarkup = renderToStaticMarkup(
      <SusInteractiveVectorSheet
        docItem={lmeDoc}
        formData={adversarialData}
        timbre={timbreDoDocumentoSus(lmeDoc)}
        onFieldChange={() => {}}
        staticPrintMode={true}
      />
    );
    const sanitized = DOMPurify.sanitize(rawMarkup);

    expect(sanitized).toContain('Carlos Eduardo Nogueira');
    expect(sanitized).toContain('Dra. Helena Vasconcelos');
    expect(sanitized).toContain('1. Adalimumabe 40 mg solução injetável');
    expect(sanitized).toContain('M45');
    expect(sanitized).toContain('Quadro ativo');
    expect(sanitized).not.toContain('<input');
    expect(sanitized).not.toContain('<textarea');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('apac-laudo.png');
    expect(sanitized).not.toContain('lme.png');
  });

  it('sincroniza simultaneamente Médico, Posto de Trabalho e Paciente (ida e volta) preservando espaços e rascunho decimal', () => {
    const ubsContext: WorkContext = {
      id: 'ctx-ubs',
      name: 'USF Osvaldo Piana',
      sphere: 'municipal',
      clinicName: 'UNIDADE DE SAÚDE DA FAMÍLIA OSVALDO PIANA',
      clinicAddress: 'Av. Campos Sales, 858',
      cnes: '2678942',
      logoDataUrl: '',
      logoAlignment: 'left',
      watermarkType: 'none',
      watermarkOpacity: 0.08,
      documentFormatting: {
        headerType: 'standard',
        prescriptionViaCount: 1,
        showCnesOnHeader: true,
        referralModel: 'sus_regulation',
        examHeaderTitle: 'SOLICITAÇÃO DE EXAMES',
      },
      doctorCredentials: { crm: '', uf: 'SP', rqe: '' },
      isDefault: true,
      createdAt: 1,
      updatedAt: 1,
    };

    const privateContext: WorkContext = {
      ...ubsContext,
      id: 'ctx-private',
      sphere: 'private',
      clinicName: 'Consultório Particular',
      cnes: '',
    };

    // 1. Troca de posto municipal (CNES 2678942) -> consultório particular (CNES vazio) não vaza CNES antigo
    const commonUbs = resolveSusCommonData(
      BASE_DOCTOR,
      BASE_PATIENT,
      ubsContext,
      {},
      { patientRaceColor: '', patientEthnicity: '', patientHeightCm: '', patientEmail: '' },
      null
    );
    expect(commonUbs.doctorCnes).toBe('2678942');
    expect(commonUbs.doctorCrmState).toBe('RO');

    const commonPrivate = resolveSusCommonData(
      BASE_DOCTOR,
      BASE_PATIENT,
      privateContext,
      {},
      { patientRaceColor: '', patientEthnicity: '', patientHeightCm: '', patientEmail: '' },
      null
    );
    expect(commonPrivate.doctorClinicName).toBe('Consultório Particular');
    expect(commonPrivate.doctorCnes).toBe('');

    // 2. Edição de nome com espaço final e rascunho de peso ("14,") preserva digitação fluida sem truncar
    const routedPat = routeSusFieldUpdate('patientName', 'Ana Beatriz ');
    expect(routedPat).toEqual({ kind: 'patient', patch: { name: 'Ana Beatriz ' } });

    const routedDoc = routeSusFieldUpdate('doctorName', 'Dr. Marcos ');
    expect(routedDoc).toEqual({ kind: 'doctor', patch: { name: 'Dr. Marcos ' } });

    const routedWeight = routeSusFieldUpdate('patientWeightKg', '14,');
    expect(routedWeight).toEqual({
      kind: 'patient',
      patch: { weightKg: 14 },
      weightDraft: '14,',
    });

    const commonWithDraft = resolveSusCommonData(
      BASE_DOCTOR,
      { ...BASE_PATIENT, weightKg: 14 },
      null,
      {},
      { patientRaceColor: '', patientEthnicity: '', patientHeightCm: '', patientEmail: '' },
      '14,'
    );
    expect(commonWithDraft.patientWeightKg).toBe('14,');
  });

  it('prioriza credenciais vigentes do médico sobre WorkContext defasado (UF SP) em resolverIdentidade e buildDefaultHeaderConfig', () => {
    const staleUbsContext: WorkContext = {
      id: 'ctx-ubs',
      name: 'UBS Legada',
      sphere: 'municipal',
      clinicName: 'USF Osvaldo Piana',
      clinicAddress: 'Av. Campos Sales, 858',
      cnes: '2678942',
      logoDataUrl: '',
      logoAlignment: 'left',
      watermarkType: 'none',
      watermarkOpacity: 0.08,
      documentFormatting: {
        headerType: 'standard',
        prescriptionViaCount: 1,
        showCnesOnHeader: true,
        referralModel: 'sus_regulation',
        examHeaderTitle: 'SOLICITAÇÃO DE EXAMES',
      },
      doctorCredentials: { crm: '', uf: 'SP', rqe: '' },
      isDefault: true,
      createdAt: 1,
      updatedAt: 1,
    };

    const idUbs = resolverIdentidade(BASE_DOCTOR, staleUbsContext);
    expect(idUbs.medico.nome).toBe('Dra. Helena Vasconcelos');
    expect(idUbs.medico.registro).toBe('CRM-RO 8842 • RQE 2140');
    expect(idUbs.medico.especialidade).toBe('Reumatologia');
    expect(idUbs.cabecalho.titulo).toBe('USF Osvaldo Piana');
    expect(idUbs.cabecalho.linhas.join(' ')).toContain('CNES 2678942');

    const headerUbs = buildDefaultHeaderConfig(BASE_DOCTOR, staleUbsContext);
    expect(headerUbs.doctorCrm).toContain('CRM-RO 8842');
    expect(headerUbs.footerCrm).toContain('CRM-RO 8842');
  });

  it('sincroniza cidade do médico e dados do paciente no Atestado/Encaminhamento e no cabeçalho do Editor sem apagar edições manuais', () => {
    const cert0 = createDefaultCertificate('');
    const ref0 = createDefaultReferral();

    const syncedDocs = syncPatientToDocuments(BASE_PATIENT, cert0, ref0);
    expect(syncedDocs.certificate.patientName).toBe('Carlos Eduardo Nogueira');
    expect(syncedDocs.certificate.documentNumber).toBe('555.444.333-22');
    expect(syncedDocs.referral.patientName).toBe('Carlos Eduardo Nogueira');
    expect(syncedDocs.referral.documentNumber).toBe('555.444.333-22');

    const certCityUpdated = syncDoctorCityToCertificate(
      BASE_DOCTOR,
      DEFAULT_DOCTOR,
      syncedDocs.certificate
    );
    expect(certCityUpdated.cityDateText.startsWith('Porto Velho - RO,')).toBe(true);

    // Caso adversarial: cidade customizada manualmente no atestado não pode ser sobrescrita
    const customCert = {
      ...certCityUpdated,
      cityDateText: 'Ariquemes - RO, 11 de novembro de 2026',
    };
    const afterSecondDoctorChange = syncDoctorCityToCertificate(
      { ...BASE_DOCTOR, cityState: 'Ji-Paraná - RO' },
      BASE_DOCTOR,
      customCert
    );
    expect(afterSecondDoctorChange.cityDateText).toBe(
      'Ariquemes - RO, 11 de novembro de 2026'
    );

    // Editor A4: atualiza quando igual ao default anterior, mas preserva edição manual no cabeçalho
    const prevDefault = buildDefaultHeaderConfig(BASE_DOCTOR, null);
    const nextDefault = buildDefaultHeaderConfig(
      { ...BASE_DOCTOR, name: 'Dra. Helena V. Moura', crm: '9900', crmState: 'AC' },
      null
    );
    const mergedAuto = mergeHeaderConfigWithDoctorProfile(
      prevDefault,
      nextDefault,
      prevDefault
    );
    expect(mergedAuto.doctorName).toBe('Dra. Helena V. Moura');
    expect(mergedAuto.doctorCrm).toContain('CRM-AC 9900');

    const manualEditedHeader = {
      ...prevDefault,
      clinicName: 'Clínica Personalizada Manual',
    };
    const mergedManual = mergeHeaderConfigWithDoctorProfile(
      manualEditedHeader,
      nextDefault,
      prevDefault
    );
    expect(mergedManual.clinicName).toBe('Clínica Personalizada Manual');
    expect(mergedManual.doctorName).toBe('Dra. Helena V. Moura');
  });

  it('preserva CNS e endereço SUS no PatientModal e separa idade textual de data de nascimento', () => {
    const initial = buildInitialPatientModalState(BASE_PATIENT);
    expect(initial.cns).toBe('704111222333444');
    expect(initial.address).toBe('Av. Sete de Setembro, 1200');
    expect(initial.city).toBe('Porto Velho');

    const withAgeText = applyAgeOrBirthDateInput(initial, '47 anos');
    expect(withAgeText.ageText).toBe('47 anos');
    expect(withAgeText.birthDate).toBe('12/08/1980');
    expect(withAgeText.cns).toBe('704111222333444');

    const withNewDate = applyAgeOrBirthDateInput(withAgeText, '15/09/1979');
    expect(withNewDate.birthDate).toBe('15/09/1979');
    expect(withNewDate.ageText).toBe('47 anos');
  });
});
