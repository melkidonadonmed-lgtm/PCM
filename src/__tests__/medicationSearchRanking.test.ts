import { describe, it, expect } from 'vitest';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import {
  searchUnifiedMedicationsFuzzy,
  isCombinationMedication,
  extractPrimarySubstanceWord,
} from '../utils/fuzzySearch';

describe('Busca de Medicamentos — Priorização Clínica (Monofármacos vs. Associações)', () => {
  it('ao buscar "dip" ou "dipirona", lista todas as apresentações puras de Dipirona antes de Dorflex, Neosaldina, Buscopan Composto ou Diprospan', () => {
    for (const term of ['dip', 'dipi', 'dipirona']) {
      const results = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all');
      const topIds = results.slice(0, 8).map((m) => m.id);

      // As 4 apresentações monofármaco de Dipirona devem ocupar as 4 primeiras posições na ordem clínica do catálogo
      expect(topIds.slice(0, 4)).toEqual([
        'dipirona-500mg',
        'dipirona-1g',
        'dipirona-gotas-500mg',
        'dipirona-ampola',
      ]);

      // Combinações com dipirona só aparecem depois das apresentações puras
      const firstComboIdx = results.findIndex((m) => isCombinationMedication(m));
      expect(firstComboIdx).toBeGreaterThanOrEqual(4);
    }
  });

  it('ao buscar "par" ou "paracetamol", prioriza Paracetamol puro (500mg primeiro) antes de Torsilax e Tylex', () => {
    for (const term of ['par', 'parac', 'paracetamol']) {
      const results = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all');
      expect(results[0]?.id).toBe('paracetamol-500mg');
      expect(results[1]?.id).toBe('paracetamol-750mg');
      expect(results[2]?.id).toBe('paracetamol-gotas-200mg');

      const pureCount = results.filter((m) => m.id.startsWith('paracetamol-')).length;
      const torsilaxIdx = results.findIndex((m) => m.id === 'torsilax-comp');
      const tylexIdx = results.findIndex((m) => m.id === 'tylex-30mg');

      expect(torsilaxIdx).toBeGreaterThanOrEqual(pureCount);
      expect(tylexIdx).toBeGreaterThanOrEqual(pureCount);
    }
  });

  it('ao buscar "amox" ou "amoxicilina", prioriza Amoxicilina pura (500mg primeiro) antes de Amoxicilina + Clavulanato', () => {
    for (const term of ['amox', 'amoxicilina']) {
      const results = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, term, 'all');
      expect(results.slice(0, 4).map((m) => m.id)).toEqual([
        'amoxicilina-500mg',
        'amoxicilina-875mg',
        'amoxicilina-susp-250mg',
        'amoxicilina-susp-400mg',
      ]);
      expect(results[4]?.id).toBe('amox-clav-875mg');
    }
  });

  it('ao buscar "los" ou "losartana", prioriza Losartana 50mg e 100mg antes de Losartana + Hidroclorotiazida', () => {
    const results = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'los', 'all');
    expect(results[0]?.id).toBe('losartana-50mg');
    expect(results[1]?.id).toBe('losartana-100mg');
    expect(results[2]?.id).toBe('losartana-hctz-50-12');
  });

  it('quando o médico busca explicitamente pela associação ou marca combinada ("amox clav", "dorflex", "neosaldina", "buscopan", "diprospan"), coloca a associação em 1º lugar', () => {
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'amox clav', 'all')[0]?.id).toBe('amox-clav-875mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'clavulin', 'all')[0]?.id).toBe('amox-clav-875mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'dorflex', 'all')[0]?.id).toBe('dorflex-comp');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'neosaldina', 'all')[0]?.id).toBe('neosaldina-drageas');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'buscopan', 'all')[0]?.id).toBe('buscopan-composto-comp');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'diprospan', 'all')[0]?.id).toBe('diprospan-ampola');
  });

  it('suporta busca multi-token refinando apresentação e dosagem ("dip gotas", "dip 1g", "dip ampola", "amox susp")', () => {
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'dip gotas', 'all')[0]?.id).toBe('dipirona-gotas-500mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'dip 1g', 'all')[0]?.id).toBe('dipirona-1g');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'dip ampola', 'all')[0]?.id).toBe('dipirona-ampola');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'amox susp', 'all')[0]?.id).toBe('amoxicilina-susp-250mg');
  });

  it('ignora prefixos de sais/ésteres farmacêuticos ao extrair a substância ativa principal', () => {
    const metformina = UNIFIED_MEDICATIONS.find((m) => m.id === 'metformina-850mg')!;
    const beclometasona = UNIFIED_MEDICATIONS.find((m) => m.id === 'beclometasona-spray-250mcg')!;
    expect(extractPrimarySubstanceWord(metformina)).toBe('metformina');
    expect(extractPrimarySubstanceWord(beclometasona)).toBe('beclometasona');

    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'metformina', 'all')[0]?.id).toBe('metformina-850mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'anlodipino', 'all')[0]?.id).toBe('anlodipino-5mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'enalapril', 'all')[0]?.id).toBe('enalapril-10mg');
  });
});
