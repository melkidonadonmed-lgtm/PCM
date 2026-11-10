import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculatePediatricDose } from '../utils/doseCalculator';
import { PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import {
  CertificateAndReferral,
  buildCertificateEditorHtml,
} from '../components/CertificateAndReferral';
import { buildReferralEditorHtml } from '../components/ReferralFormSection';
import { mergeHeaderConfigWithDoctorProfile } from '../components/editor/EditorSheetViewport';
import {
  inferirUnidadeDoseDoMedicamento,
  construirOuAtualizarItemPrescrito,
} from '../components/prescription/prescriptionComposerHelpers';
import { createDefaultCertificate, createDefaultReferral, DEFAULT_DOCTOR } from '../hooks/usePrescriptionSession';
import { DocumentHeaderConfig, PrescriptionItem, Patient } from '../types';

describe('Integração da Calculadora Pediátrica em Drawer e Ilhas de Documentos', () => {
  const dummyPatient: Patient = {
    id: 'p-1',
    name: 'Bernardo Silva',
    documentNumber: '123.456.789-00',
    weightKg: 15,
    gender: 'male',
    allergies: []
  };

  it('deve calcular a dose pediátrica exata e gerar PrescriptionItem compatível com a receita', () => {
    const amoxi = PEDIATRIC_MEDICATIONS.find(m => m.id === 'amoxicilina-250-habitual');
    expect(amoxi).toBeDefined();
    if (!amoxi) return;

    const calc = calculatePediatricDose(amoxi, dummyPatient.weightKg);
    expect(calc.volumeText).toContain('5 mL');

    const newItem: PrescriptionItem = {
      id: 'presc-amoxi-15kg',
      name: amoxi.name,
      presentation: amoxi.presentation,
      route: amoxi.route,
      quantity: '1 frasco',
      doseCalculatedText: `${calc.volumeText} (${calc.rawDoseText})`,
      frequencyText: amoxi.frequency,
      scheduleInterval: '8/8h',
      scheduleTimes: [],
      durationDays: amoxi.defaultDays || 5,
      instructions: calc.formattedPrescriptionText,
      isContinuous: false,
      isSpecialControl: false,
      calculatedFromWeight: dummyPatient.weightKg
    };

    expect(newItem.name).toBe('Amoxicilina Susp 250 mg/5 mL (Dose Habitual)');
    expect(newItem.instructions).toContain('5 mL');
    expect(newItem.calculatedFromWeight).toBe(15);
  });

  it('deve respeitar a propriedade hideSubNav e renderizar tanto Atestado quanto Encaminhamento (ReferralFormSection)', () => {
    const baseProps = {
      darkMode: false,
      patient: dummyPatient,
      doctor: DEFAULT_DOCTOR,
      certificate: createDefaultCertificate('Porto Velho - RO'),
      onUpdateCertificate: vi.fn(),
      referral: createDefaultReferral(),
      onUpdateReferral: vi.fn(),
      onNavigateToPrint: vi.fn()
    };

    const htmlWithSubNav = renderToStaticMarkup(
      React.createElement(CertificateAndReferral, {
        ...baseProps,
        hideSubNav: false
      })
    );
    const htmlHiddenSubNav = renderToStaticMarkup(
      React.createElement(CertificateAndReferral, {
        ...baseProps,
        hideSubNav: true
      })
    );
    const htmlReferralSubTab = renderToStaticMarkup(
      React.createElement(CertificateAndReferral, {
        ...baseProps,
        activeSubTab: 'referral',
        hideSubNav: true
      })
    );

    expect(htmlWithSubNav).toContain('max-w-sm mx-auto');
    expect(htmlHiddenSubNav).not.toContain('max-w-sm mx-auto');
    expect(htmlHiddenSubNav).toContain('Emissão de Atestado Médico');
    expect(htmlReferralSubTab).toContain('Guia de Encaminhamento &amp; Referência Especializada');
    expect(htmlReferralSubTab).toContain('id="referral-destination-specialty"');
  });

  it('deve manter teto de segurança ao prescrever gotas pediátricas no Drawer', () => {
    const paracetamol = PEDIATRIC_MEDICATIONS.find(m => m.id === 'paracetamol-gotas');
    expect(paracetamol).toBeDefined();
    if (!paracetamol) return;

    const calc12 = calculatePediatricDose(paracetamol, 12);
    expect(calc12.calculatedDrops).toBe(12);
    expect(calc12.isMaxDoseReached).toBe(false);

    const calc110 = calculatePediatricDose(paracetamol, 110);
    expect(calc110.calculatedDrops).toBe(100);
    expect(calc110.isMaxDoseReached).toBe(true);
  });

  it('deve omitir CID-10 sem autorização (Res. CFM 1.658/2002) e neutralizar XSS em buildCertificateEditorHtml e buildReferralEditorHtml', () => {
    const baseCert = createDefaultCertificate('Porto Velho - RO');
    const htmlSemConsentimento = buildCertificateEditorHtml(dummyPatient, {
      ...baseCert,
      includeCID: false,
      cid10Code: 'J03.9',
      cid10Description: 'Amigdalite aguda',
      observations: 'Alerta se T > 38,5°C <script>evil()</script>',
    });
    expect(htmlSemConsentimento).not.toContain('J03.9');
    expect(htmlSemConsentimento).not.toContain('<script>');
    expect(htmlSemConsentimento).toContain('&gt; 38,5°C');

    const htmlComConsentimento = buildCertificateEditorHtml(dummyPatient, {
      ...baseCert,
      includeCID: true,
      cid10Code: 'J03.9',
      cid10Description: 'Amigdalite aguda',
    });
    expect(htmlComConsentimento).toContain('J03.9');
    expect(htmlComConsentimento).toContain('Expressamente autorizado pelo paciente');

    const baseRef = createDefaultReferral();
    const { referralHtml, title } = buildReferralEditorHtml(dummyPatient, {
      ...baseRef,
      destinationSpecialty: 'Cardiologia',
      reason: 'FEVE < 40% <img src=x onerror=alert(1)>',
    });
    expect(title).toBe('Encaminhamento - Cardiologia');
    expect(referralHtml).toContain('FEVE &lt; 40%');
    expect(referralHtml).not.toContain('<img');
  });

  it('deve sincronizar cabeçalho padrão sem sobrescrever edições manuais em mergeHeaderConfigWithDoctorProfile e deduzir unidades no composer', () => {
    const padrao: DocumentHeaderConfig = {
      doctorName: 'Dr(a). Médico(a)',
      doctorCrm: 'CRM ------',
      doctorSpecialty: 'Clínica Médica',
      clinicName: 'Dr(a). Médico(a)',
      clinicAddress: '',
      badgeText: '',
      dateText: '09/11/2026',
      showHeader: true,
      showFooter: true,
      showPatientBanner: false,
      patientCustomText: '',
      footerDocName: 'Dr(a). Médico(a)',
      footerCrm: 'CRM ------',
      footerSpecialty: 'Clínica Médica',
      footerSubtext: '',
    };
    const atualizado: DocumentHeaderConfig = {
      ...padrao,
      doctorName: 'Dra. Marina Rocha',
      doctorCrm: 'CRM-RO 9988',
      clinicName: 'Hospital Regional',
      footerDocName: 'Dra. Marina Rocha',
      footerCrm: 'CRM-RO 9988',
    };

    const mesclado = mergeHeaderConfigWithDoctorProfile(padrao, atualizado);
    expect(mesclado.doctorName).toBe('Dra. Marina Rocha');
    expect(mesclado.clinicName).toBe('Hospital Regional');

    const customizadoPeloMedico: DocumentHeaderConfig = {
      ...atualizado,
      doctorName: 'Dr. Nome Personalizado Manualmente',
      clinicName: 'Clínica Própria',
    };
    expect(mergeHeaderConfigWithDoctorProfile(customizadoPeloMedico, padrao)).toBe(
      customizadoPeloMedico
    );

    expect(inferirUnidadeDoseDoMedicamento('Amoxicilina 500 mg Cápsula')).toBe('cápsula');
    expect(inferirUnidadeDoseDoMedicamento('Dipirona Gotas 500 mg/mL')).toBe('gota');
    expect(inferirUnidadeDoseDoMedicamento('Prednisolona Solução 3 mg/mL')).toBe('mL');
    expect(inferirUnidadeDoseDoMedicamento('Dexametasona Creme 1 mg/g')).toBe('aplicação');

    const { updatedItems, regime } = construirOuAtualizarItemPrescrito(
      {
        selectedMedName: 'Amoxicilina 500 mg',
        selectedRoute: 'Uso Oral',
        selectedQuantity: '21 cápsulas',
        selectedPosology: '',
        doseAmount: 1,
        doseUnit: 'cápsula',
        doseFrequency: '8/8h',
        doseDays: 7,
        isContinuousDose: false,
      },
      [],
      null
    );
    expect(regime).toBe('antimicrobiano');
    expect(updatedItems).toHaveLength(1);
    expect(updatedItems[0].isSpecialControl).toBe(true);
    expect(updatedItems[0].regimeReceita).toBe('antimicrobiano');
  });
});
