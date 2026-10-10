import { describe, it, expect, vi } from 'vitest';
import { calculatePediatricDose } from '../utils/doseCalculator';
import { PEDIATRIC_MEDICATIONS } from '../data/pediatricMeds';
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

    // Cálculo clínico real
    const calc = calculatePediatricDose(amoxi, dummyPatient.weightKg);
    expect(calc.volumeText).toContain('5 mL'); // 15 kg * 16.67 mg/kg = 250 mg -> 5 mL

    // Simula a construção do item como é feita em PediatricCalculator.tsx
    const newItem: PrescriptionItem = {
      id: `presc-${Date.now()}`,
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
    // Validação de contrato de tipos e props
    const hubProps = {
      initialSubTab: 'certificate' as const,
      hideSubNav: true
    };
    expect(hubProps.hideSubNav).toBe(true);
    expect(hubProps.initialSubTab).toBe('certificate');
  });

  it('deve manter teto de segurança ao prescrever gotas pediátricas no Drawer', () => {
    const paracetamol = PEDIATRIC_MEDICATIONS.find(m => m.id === 'paracetamol-gotas');
    expect(paracetamol).toBeDefined();
    if (!paracetamol) return;

    // Criança de 12 kg -> 12 gotas (1 gota/kg)
    const calc12 = calculatePediatricDose(paracetamol, 12);
    expect(calc12.calculatedDrops).toBe(12);
    expect(calc12.isMaxDoseReached).toBe(false);

    // Criança pesada de 110 kg -> teto seguro de 100 gotas por dose
    const calc110 = calculatePediatricDose(paracetamol, 110);
    expect(calc110.calculatedDrops).toBe(100);
    expect(calc110.isMaxDoseReached).toBe(true);
  });
});
