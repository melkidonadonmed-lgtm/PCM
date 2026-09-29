import { describe, it, expect } from 'vitest';
import { CLINICAL_KITS, ClinicalKit } from '../data/clinicalKits';
import { montarItensDoKit } from '../utils/montarItensDoKit';
import { Patient, PrescriptionItem } from '../types';

describe('Kits Clínicos e Montagem de Itens (montarItensDoKit)', () => {
  const pacienteAdultoSemPeso: Patient = {
    id: 'paciente-adulto-0kg',
    name: 'Paciente Sem Peso',
    weightKg: 0,
    gender: 'male',
    allergies: []
  };

  const pacientePediatrico15kg: Patient = {
    id: 'paciente-pedia-15kg',
    name: 'Paciente Pediátrico 15kg',
    weightKg: 15,
    gender: 'female',
    allergies: []
  };

  // Remove campos voláteis (como id aleatório com timestamp) para snapshot determinístico
  const stripVolatileFields = (items: PrescriptionItem[]) =>
    items.map(({ id, ...rest }) => rest);

  const getKit = (id: string): ClinicalKit => {
    const kit = CLINICAL_KITS.find(k => k.id === id);
    if (!kit) throw new Error(`Kit clínico não encontrado: ${id}`);
    return kit;
  };

  it('formata o texto em pt-BR (vírgula, "1 gota") e não gera grade de horários', () => {
    const kitComItem = (chave: string) => {
      const kit = CLINICAL_KITS.find(k => k.items.some(i => i.pediaDrugKey === chave));
      if (!kit) throw new Error(`Nenhum kit com ${chave}`);
      return kit;
    };
    // Amoxicilina: 10 kg x 50 / 3 / 50 = 3,33 → 3,3 mL (mesmo arredondamento de antes)
    const amox = montarItensDoKit(kitComItem('amoxicilina_susp'), { ...pacientePediatrico15kg, weightKg: 10 });
    expect(amox.some(i => i.doseCalculatedText === '3,3 mL' && i.instructions.includes('3,3 mL'))).toBe(true);
    // Dipirona: 1 kg → 1 gota
    const dipirona = montarItensDoKit(kitComItem('dipirona_gotas'), { ...pacientePediatrico15kg, weightKg: 1 });
    expect(dipirona.some(i => i.doseCalculatedText === '1 gota' && i.instructions.includes('1 gota '))).toBe(true);
    expect([...amox, ...dipirona].every(i => i.scheduleTimes.length === 0)).toBe(true);
  });

  it('deve conter exatamente os 6 kits clínicos cadastrados', () => {
    expect(CLINICAL_KITS).toHaveLength(6);
    const kitIds = CLINICAL_KITS.map(k => k.id);
    expect(kitIds).toEqual([
      'kit_amigdalite',
      'kit_geca',
      'kit_ivas',
      'kit_lombalgia',
      'kit_itu',
      'kit_asma'
    ]);
  });

  describe('1. Kit Amigdalite Bacteriana', () => {
    const kit = getKit('kit_amigdalite');

    it('deve montar exatamente 3 itens para paciente sem peso (formulação padrão) e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacienteAdultoSemPeso);
      expect(items).toHaveLength(3);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });

    it('deve montar exatamente 3 itens para paciente pediátrico de 15 kg (com ajuste por peso) e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacientePediatrico15kg);
      expect(items).toHaveLength(3);
      // Amoxicilina suspensão para 15 kg: (15 * 50) / 3 / 50 = 5 mL
      expect(items[0].doseCalculatedText).toBe('5 mL');
      // Ibuprofeno 100 mg/mL gotas para 15 kg: 15 gotas
      expect(items[1].doseCalculatedText).toBe('15 gotas');
      // Dipirona gotas para 15 kg: 15 gotas
      expect(items[2].doseCalculatedText).toBe('15 gotas');
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });
  });

  describe('2. Kit Gastroenterite & Vômitos (GECA)', () => {
    const kit = getKit('kit_geca');

    it('deve montar exatamente 3 itens para paciente sem peso e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacienteAdultoSemPeso);
      expect(items).toHaveLength(3);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });

    it('deve montar exatamente 3 itens para paciente de 15 kg e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacientePediatrico15kg);
      expect(items).toHaveLength(3);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });
  });

  describe('3. Kit IVAS / Gripe & Resfriado', () => {
    const kit = getKit('kit_ivas');

    it('deve montar exatamente 3 itens para paciente sem peso e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacienteAdultoSemPeso);
      expect(items).toHaveLength(3);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });

    it('deve montar exatamente 3 itens para paciente de 15 kg (ajuste pediátrico) e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacientePediatrico15kg);
      expect(items).toHaveLength(3);
      expect(items[0].doseCalculatedText).toBe('15 gotas');
      expect(items[1].doseCalculatedText).toBe('15 gotas');
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });
  });

  describe('4. Kit Lombalgia / Dor Aguda', () => {
    const kit = getKit('kit_lombalgia');

    it('deve montar exatamente 4 itens para paciente sem peso e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacienteAdultoSemPeso);
      expect(items).toHaveLength(4);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });

    it('deve montar exatamente 4 itens para paciente de 15 kg e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacientePediatrico15kg);
      expect(items).toHaveLength(4);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });
  });

  describe('5. Kit Infecção Urinária (ITU)', () => {
    const kit = getKit('kit_itu');

    it('deve montar exatamente 2 itens para paciente sem peso e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacienteAdultoSemPeso);
      expect(items).toHaveLength(2);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });

    it('deve montar exatamente 2 itens para paciente de 15 kg e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacientePediatrico15kg);
      expect(items).toHaveLength(2);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });
  });

  describe('6. Kit Crise de Asma / Broncoespasmo', () => {
    const kit = getKit('kit_asma');

    it('deve montar exatamente 2 itens para paciente sem peso e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacienteAdultoSemPeso);
      expect(items).toHaveLength(2);
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });

    it('deve montar exatamente 2 itens para paciente de 15 kg (ajuste de prednisolona oral) e bater snapshot', () => {
      const items = montarItensDoKit(kit, pacientePediatrico15kg);
      expect(items).toHaveLength(2);
      // Prednisolona 3 mg/mL para 15 kg: 15 / 3 = 5 mL
      expect(items[1].doseCalculatedText).toBe('5 mL');
      expect(stripVolatileFields(items)).toMatchSnapshot();
    });
  });
});
