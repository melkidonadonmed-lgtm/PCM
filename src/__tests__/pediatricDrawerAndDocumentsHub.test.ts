import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculatePediatricDose } from '../utils/doseCalculator';
import { PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
import { CertificateAndReferral } from '../components/CertificateAndReferral';
import { createDefaultCertificate, createDefaultReferral, DEFAULT_DOCTOR } from '../hooks/usePrescriptionSession';
import { PrescriptionItem, Patient } from '../types';

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

  it('deve respeitar a propriedade hideSubNav para erradicar abas duplicadas no Hub de Documentos', () => {
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

    expect(htmlWithSubNav).toContain('max-w-sm mx-auto');
    expect(htmlHiddenSubNav).not.toContain('max-w-sm mx-auto');
    expect(htmlHiddenSubNav).toContain('Emissão de Atestado Médico');
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
});

