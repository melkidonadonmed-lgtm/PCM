import { describe, it, expect } from 'vitest';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import {
  searchUnifiedMedicationsFuzzy,
  isCombinationMedication,
  extractPrimarySubstanceWord,
} from '../utils/fuzzySearch';
import { classificarReceita } from '../utils/isSpecialControlOrAntibiotic';

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

  it('mantém unicidade absoluta de IDs no catálogo expandido (> 300 apresentações)', () => {
    const ids = UNIFIED_MEDICATIONS.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(UNIFIED_MEDICATIONS.length).toBeGreaterThanOrEqual(300);
  });

  it('encontra todas as apresentações de Vitamina B12 (oral, sublingual e injetável IM) e Vitamina D3 (gotas e 1.000 a 50.000 UI)', () => {
    const b12Results = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'vitamina b12', 'all');
    const b12Ids = b12Results.map((m) => m.id);
    expect(b12Ids).toContain('vitamina-b12-cianocobalamina-1000mcg-oral');
    expect(b12Ids).toContain('vitamina-b12-mecobalamina-1000mcg-sl');
    expect(b12Ids).toContain('citoneurin-5000-drageas');
    expect(b12Ids).toContain('citoneurin-5000-injetavel');
    expect(b12Ids).toContain('cronobe-5000-injetavel');
    expect(b12Ids).toContain('hidroxicobalamina-5000mcg-injetavel');

    const vitDResults = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'vitamina d', 'all');
    const vitDIds = vitDResults.map((m) => m.id);
    for (const id of [
      'vitamina-d3-gotas-200ui',
      'vitamina-d3-gotas-500ui',
      'vitamina-d3-gotas-1000ui',
      'vitamina-d3-1000ui',
      'vitamina-d3-2000ui',
      'vitamina-d3-4000ui',
      'vitamina-d3-5000ui',
      'vitamina-d3-7000ui',
      'vitamina-d3-8000ui',
      'vitamina-d3-10000ui',
      'vitamina-d3-14000ui',
      'vitamina-d3-20000ui',
      'vitamina-d3-50000ui',
    ]) {
      expect(vitDIds).toContain(id);
    }
  });

  it('resolve ISRS, IRSN, antidepressivos (incluindo "densvela", "esc" e "vilazodona"), estabilizadores de humor, antipsicóticos e gabapentinoides como Controle Especial', () => {
    // Busca por marcas/abreviações solicitadas pelo clínico
    const densvela = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'densvela', 'all');
    expect(densvela.map((m) => m.id)).toEqual(expect.arrayContaining(['desvenlafaxina-50mg', 'desvenlafaxina-100mg']));
    expect(classificarReceita(densvela[0])).toBe('controle_especial');

    const esc = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'esc', 'all');
    expect(esc.slice(0, 4).map((m) => m.id)).toEqual([
      'escitalopram-10mg',
      'escitalopram-15mg',
      'escitalopram-20mg',
      'escitalopram-gotas-20mg',
    ]);

    const vilazodona = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'vilazodona', 'all');
    expect(vilazodona.slice(0, 3).map((m) => m.id)).toEqual([
      'vilazodona-10mg',
      'vilazodona-20mg',
      'vilazodona-40mg',
    ]);
    expect(classificarReceita(vilazodona[0])).toBe('controle_especial');

    // Venlafaxina, Sertralina, Bupropiona, Trazodona, Amitriptilina
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'venlafaxina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['venlafaxina-37-5mg', 'venlafaxina-75mg', 'venlafaxina-150mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'sertralina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['sertralina-25mg', 'sertralina-50mg', 'sertralina-75mg', 'sertralina-100mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'bupropiona', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['bupropiona-150mg-xl', 'bupropiona-300mg-xl'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'trazodona', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['trazodona-50mg', 'trazodona-100mg', 'trazodona-150mg-retard'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'amitriptilina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['amitriptilina-10mg', 'amitriptilina-25mg', 'amitriptilina-75mg'])
    );

    // Estabilizadores de humor e anticonvulsivantes
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'acido valproico', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining([
        'acido-valproico-250mg',
        'acido-valproico-300mg',
        'acido-valproico-500mg',
        'acido-valproico-xarope-50mg',
      ])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'divalproato', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['divalproato-250mg', 'divalproato-500mg', 'divalproato-er-250mg', 'divalproato-er-500mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'lamotrigina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['lamotrigina-25mg', 'lamotrigina-50mg', 'lamotrigina-100mg'])
    );

    // Antipsicóticos e Gabapentinoides
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'risperidona', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['risperidona-1mg', 'risperidona-2mg', 'risperidona-3mg', 'risperidona-sol-1mg-ml'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'olanzapina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['olanzapina-2-5mg', 'olanzapina-5mg', 'olanzapina-10mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'quetiapina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining([
        'quetiapina-25mg',
        'quetiapina-50mg-xr',
        'quetiapina-100mg',
        'quetiapina-200mg',
        'quetiapina-300mg',
      ])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'pregabalina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['pregabalina-25mg', 'pregabalina-50mg', 'pregabalina-75mg', 'pregabalina-150mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'gabapentina', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['gabapentina-300mg', 'gabapentina-400mg', 'gabapentina-600mg'])
    );
  });

  it('resolve triptanos, colírios (segregando antibióticos oftálmicos em 2 vias RDC 471/2021), IBPs/P-CAB, novos fármacos DM2/HAS e todas as 16 dosagens de Levotiroxina', () => {
    // Triptanos
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'sumatriptana', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['sumatriptana-25mg', 'sumatriptana-50mg', 'sumatriptana-100mg', 'sumatriptana-spray-10mg', 'sumatriptana-sc-6mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'naratriptana', 'all')[0]?.id).toBe('naratriptana-2-5mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'zolmitriptana', 'all')[0]?.id).toBe('zolmitriptana-2-5mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'rizatriptana', 'all')[0]?.id).toBe('rizatriptana-10mg');

    // Colírios e classificação sanitária
    const tobrex = UNIFIED_MEDICATIONS.find((m) => m.id === 'tobramicina-colirio-0-3')!;
    const vigamox = UNIFIED_MEDICATIONS.find((m) => m.id === 'moxifloxacino-colirio-0-5')!;
    const carmelose = UNIFIED_MEDICATIONS.find((m) => m.id === 'colirio-carmelose-0-5')!;
    const timolol = UNIFIED_MEDICATIONS.find((m) => m.id === 'colirio-timolol-0-5')!;
    expect(classificarReceita(tobrex)).toBe('antimicrobiano');
    expect(classificarReceita(vigamox)).toBe('antimicrobiano');
    expect(classificarReceita(carmelose)).toBe('simples');
    expect(classificarReceita(timolol)).toBe('simples');

    // IBPs e Vonoprazana (P-CAB)
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'esomeprazol', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['esomeprazol-20mg', 'esomeprazol-40mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'dexlansoprazol', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['dexlansoprazol-30mg', 'dexlansoprazol-60mg'])
    );
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'vonoprazana', 'all').map((m) => m.id)).toEqual(
      expect.arrayContaining(['vonoprazana-10mg', 'vonoprazana-20mg'])
    );

    // Novos DM2 e HAS
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'dapagliflozina', 'all')[0]?.id).toBe('dapagliflozina-10mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'empagliflozina', 'all')[0]?.id).toBe('empagliflozina-10mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'semaglutida', 'all')[0]?.id).toBe('semaglutida-sc-0-25-0-5mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'tirzepatida', 'all')[0]?.id).toBe('tirzepatida-2-5mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'olmesartana', 'all')[0]?.id).toBe('olmesartana-20mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'valsartana', 'all')[0]?.id).toBe('valsartana-80mg');
    expect(searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'sacubitril', 'all')[0]?.id).toBe('sacubitril-valsartana-24-26mg');

    // Todas as 16 dosagens de Levotiroxina (SUS + intermediárias comerciais fora da RENAME)
    const levoIds = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, 'levotiroxina', 'all').map((m) => m.id);
    for (const dose of [
      '12-5mcg',
      '25mcg',
      '37-5mcg',
      '38mcg',
      '50mcg',
      '62-5mcg',
      '75mcg',
      '88mcg',
      '100mcg',
      '112mcg',
      '125mcg',
      '137mcg',
      '150mcg',
      '175mcg',
      '200mcg',
      '300mcg',
    ]) {
      expect(levoIds).toContain(`levotiroxina-${dose}`);
    }
  });
});
