import { describe, it, expect } from 'vitest';
import { calculatePediatricDose, generateScheduleTimes } from '../utils/doseCalculator';
import { PEDIATRIC_MEDICATIONS, CLINICAL_PROTOCOLS } from '../data/pediatricMeds';
import { UNIFIED_MEDICATIONS } from '../data/medicationDatabase';
import { COMMON_CID10, searchCID10 } from '../data/cidCatalog';
import { PediatricMedication } from '../types';
import {
  PWA_INCLUDE_ASSETS,
  PWA_INCLUDE_MANIFEST_ICONS,
  PWA_WORKBOX_GLOB_IGNORES,
  isIgnoredFromPwaPrecache,
  resolvePwaManualChunk,
} from '../../vite.config';

describe('Calculadora de Doses Pediátricas por Peso (YMYL / Segurança Clínica)', () => {
  const getMed = (id: string): PediatricMedication => {
    const med = PEDIATRIC_MEDICATIONS.find((m) => m.id === id);
    if (!med) throw new Error(`Medicamento pediátrico não encontrado: ${id}`);
    return med;
  };

  describe('Paracetamol Gotas (200 mg/mL)', () => {
    const paracetamol = getMed('paracetamol-gotas');

    it('deve prescrever exatamente 1 gota por kg para peso de 10 kg (padrão Brasil)', () => {
      const result = calculatePediatricDose(paracetamol, 10);
      expect(result.calculatedDrops).toBe(10);
      expect(result.volumeText).toBe('0,5 mL');
      expect(result.isMaxDoseReached).toBe(false);
      expect(result.formattedPrescriptionText).toContain('10 gotas');
    });

    it('deve prescrever 20 gotas para criança de 20 kg', () => {
      const result = calculatePediatricDose(paracetamol, 20);
      expect(result.calculatedDrops).toBe(20);
      expect(result.volumeText).toBe('1 mL');
    });

    it('não deve ultrapassar o limite seguro de 100 gotas por dose', () => {
      const result = calculatePediatricDose(paracetamol, 120);
      expect(result.calculatedDrops).toBe(100);
      expect(result.isMaxDoseReached).toBe(true);
    });
  });

  describe('Dipirona Gotas (500 mg/mL)', () => {
    const dipirona = getMed('dipirona-gotas');

    it('deve calcular gotas com posologia segura de 20 mg/kg/dose (mínimo de 4 gotas)', () => {
      const result = calculatePediatricDose(dipirona, 3);
      expect(result.calculatedDrops).toBeGreaterThanOrEqual(4);
    });

    it('não deve exceder o teto máximo seguro de 40 gotas (1000 mg/dose)', () => {
      const result = calculatePediatricDose(dipirona, 80);
      expect(result.calculatedDrops).toBeLessThanOrEqual(40);
      expect(result.calculatedMg).toBeLessThanOrEqual(1000);
    });
  });

  describe('Amoxicilina Suspensão 250 mg/5 mL (50 mg/mL)', () => {
    const amoxi = getMed('amoxicilina-250-habitual');

    it('deve calcular volume em mL compatível com peso e concentração', () => {
      // 12 kg * 16.67 mg/kg = ~200 mg por dose -> 200 / 50 mg/mL = 4 mL
      const result = calculatePediatricDose(amoxi, 12);
      expect(result.calculatedMl).toBeCloseTo(4.0, 1);
      expect(result.volumeText).toContain('4 mL');
    });
  });

  describe('Resiliência e Proteção contra Pesos Extremos ou Inválidos', () => {
    const paracetamol = getMed('paracetamol-gotas');

    it('deve normalizar peso zero ou negativo para o piso seguro de 0.5 kg', () => {
      const zeroResult = calculatePediatricDose(paracetamol, 0);
      expect(zeroResult.weightKg).toBe(0.5);

      const negativeResult = calculatePediatricDose(paracetamol, -10);
      expect(negativeResult.weightKg).toBe(0.5);
    });

    it('deve limitar peso excessivo ao teto de 120 kg', () => {
      const heavyResult = calculatePediatricDose(paracetamol, 180);
      expect(heavyResult.weightKg).toBe(120);
    });
  });

  describe('Medicamentos com Dosagem Fixa (unitType = fixed)', () => {
    it('deve manter texto de dose fixa sem multiplicar por peso', () => {
      const fixedMed: PediatricMedication = {
        id: 'vitamina-d-gotas',
        category: 'Suplemento',
        name: 'Vitamina D Gotas',
        presentation: '200 UI/gota',
        concentrationMgPerMl: 0,
        standardDoseMgKg: 0,
        maxDoseMg: 0,
        unitType: 'fixed',
        doseCustomLabel: '2 gotas ao dia',
        frequency: '1x ao dia pela manhã',
        route: 'Oral',
        observations: 'Suplementação profilática de vitamina D.'
      };

      const result = calculatePediatricDose(fixedMed, 15);
      expect(result.rawDoseText).toBe('Dose Fixa');
      expect(result.formattedPrescriptionText).toContain('2 gotas ao dia');
    });
  });

  describe('Formatação de Doses e Textos Clínicos em pt-BR (Vírgula decimal e Concordância de Gotas)', () => {
    it('deve formatar mg com vírgula decimal para doses >= 1 mg com fração (ex: 7,5 mg)', () => {
      // Paracetamol gotas (15 mg/kg): para 0.5 kg -> 0.5 * 15 = 7.5 mg -> '7,5 mg'
      const paracetamol = getMed('paracetamol-gotas');
      const result = calculatePediatricDose(paracetamol, 0.5);
      expect(result.rawDoseText).toBe('7,5 mg');

      // Ondansetrona solução oral (0.15 mg/kg): para 10 kg -> 10 * 0.15 = 1.5 mg -> '1,5 mg'
      const ondansetrona = getMed('ondansetrona-solucao');
      const resultOndan = calculatePediatricDose(ondansetrona, 10);
      expect(resultOndan.rawDoseText).toBe('1,5 mg');
    });

    it('deve formatar mg com duas casas decimais e vírgula para doses < 1 mg (ex: 0,30 mg e 0,75 mg)', () => {
      // Ondansetrona solução oral (0.15 mg/kg): para 2 kg -> 2 * 0.15 = 0.30 mg -> '0,30 mg'
      const ondansetrona = getMed('ondansetrona-solucao');
      const result2kg = calculatePediatricDose(ondansetrona, 2);
      expect(result2kg.rawDoseText).toBe('0,30 mg');

      // Ondansetrona solução oral (0.15 mg/kg): para 5 kg -> 5 * 0.15 = 0.75 mg -> '0,75 mg'
      const result5kg = calculatePediatricDose(ondansetrona, 5);
      expect(result5kg.rawDoseText).toBe('0,75 mg');
    });

    it('não deve agrupar milhares no texto de mg (1000 mg, nunca "1.000 mg")', () => {
      // Paracetamol gotas: 100 kg x 15 mg/kg = 1500 mg, limitado ao máximo de 1000 mg
      const paracetamol = getMed('paracetamol-gotas');
      const result = calculatePediatricDose(paracetamol, 100);
      expect(result.isMaxDoseReached).toBe(true);
      expect(result.rawDoseText).toBe('1000 mg');
    });

    it('deve usar singular "1 gota" em dropsText e na instrução para dose unitária', () => {
      // Paracetamol gotas (1 gota/kg): para 1 kg -> 1 gota
      const paracetamol = getMed('paracetamol-gotas');
      const result = calculatePediatricDose(paracetamol, 1);
      expect(result.calculatedDrops).toBe(1);
      expect(result.dropsText).toBe('1 gota');
      expect(result.formattedPrescriptionText).toContain('Dar 1 gota (0,05 mL)');
    });

    it('deve usar plural "gotas" em dropsText e na instrução para doses maiores que 1 gota', () => {
      // Paracetamol gotas (1 gota/kg): para 10 kg -> 10 gotas
      const paracetamol = getMed('paracetamol-gotas');
      const result = calculatePediatricDose(paracetamol, 10);
      expect(result.calculatedDrops).toBe(10);
      expect(result.dropsText).toBe('10 gotas');
      expect(result.formattedPrescriptionText).toContain('Dar 10 gotas (0,5 mL)');
    });
  });
});

describe('Gerador de Horários de Posologia (generateScheduleTimes)', () => {
  it('deve gerar 6 tomadas para intervalo de 4/4h iniciando às 08:00', () => {
    const times = generateScheduleTimes('4/4h', 8);
    expect(times).toEqual(['08:00', '12:00', '16:00', '20:00', '00:00', '04:00']);
  });

  it('deve gerar 4 tomadas para intervalo de 6/6h iniciando às 08:00', () => {
    const times = generateScheduleTimes('6/6h', 8);
    expect(times).toEqual(['08:00', '14:00', '20:00', '02:00']);
  });

  it('deve gerar 3 tomadas para intervalo de 8/8h iniciando às 08:00', () => {
    const times = generateScheduleTimes('8/8h', 8);
    expect(times).toEqual(['08:00', '16:00', '00:00']);
  });

  it('deve gerar 2 tomadas para intervalo de 12/12h iniciando às 08:00', () => {
    const times = generateScheduleTimes('12/12h', 8);
    expect(times).toEqual(['08:00', '20:00']);
  });

  it('deve gerar 1 tomada para 24/24h ou 1x ao dia', () => {
    const times = generateScheduleTimes('1x ao dia', 8);
    expect(times).toEqual(['08:00']);
  });

  it('deve retornar array vazio para posologia sem horário fixo (ex: S.O.S)', () => {
    const times = generateScheduleTimes('se dor ou febre (S.O.S)', 8);
    expect(times).toEqual([]);
  });
});

describe('Integridade dos Catálogos Clínicos Modularizados (TASK-10 / YMYL)', () => {
  it('deve preservar 100% dos fármacos adultos/ambulatoriais, pediátricos, protocolos e CID-10 sem duplicatas de ID', () => {
    // 1. PEDIATRIC_MEDICATIONS (oral + hospitalar/emergência/suplementos)
    expect(PEDIATRIC_MEDICATIONS.length).toBe(49);
    const pediatricIds = PEDIATRIC_MEDICATIONS.map((m) => m.id);
    expect(new Set(pediatricIds).size).toBe(PEDIATRIC_MEDICATIONS.length);
    expect(pediatricIds).toContain('paracetamol-gotas');
    expect(pediatricIds).toContain('adrenalina-anafilaxia');
    expect(pediatricIds).toContain('vitamina-d3-gotas');

    // 2. CLINICAL_PROTOCOLS
    expect(CLINICAL_PROTOCOLS.length).toBe(5);
    const protocolIds = CLINICAL_PROTOCOLS.map((p) => p.id);
    expect(new Set(protocolIds).size).toBe(CLINICAL_PROTOCOLS.length);

    // 3. UNIFIED_MEDICATIONS (todas as fatias clínicas consolidadas)
    expect(UNIFIED_MEDICATIONS.length).toBe(486);
    const unifiedIds = UNIFIED_MEDICATIONS.map((m) => m.id);
    expect(new Set(unifiedIds).size).toBe(UNIFIED_MEDICATIONS.length);
    expect(unifiedIds).toContain('dipirona-500mg');
    expect(unifiedIds).toContain('tramadol-50mg');
    expect(unifiedIds).toContain('amoxicilina-500mg');
    expect(unifiedIds).toContain('losartana-50mg');
    expect(unifiedIds).toContain('metoprolol-succinato-50mg');
    expect(unifiedIds).toContain('metformina-850mg');
    expect(unifiedIds).toContain('levotiroxina-50mcg');
    expect(unifiedIds).toContain('salbutamol-spray-100mcg');
    expect(unifiedIds).toContain('fluoxetina-20mg');
    expect(unifiedIds).toContain('acido-valproico-250mg');
    expect(unifiedIds).toContain('risperidona-1mg');

    // 4. COMMON_CID10 (clínica geral + especialidades e administrativo)
    expect(COMMON_CID10.length).toBe(107);
    const cidCodes = COMMON_CID10.map((c) => c.code);
    expect(new Set(cidCodes).size).toBe(COMMON_CID10.length);
    expect(searchCID10('Z02.7').some((c) => c.code === 'Z02.7')).toBe(true);
    expect(searchCID10('enxaqueca').some((c) => c.code === 'G43.9')).toBe(true);
  });

  it('isola vendor-canvg fora do precache PWA (preservando html2canvas-pro em vendor-pdf-canvas) e particiona clinical-catalogs, pediatric-catalog e cid-catalog com rejeição de entradas adversariais (TASK-13)', () => {
    expect(PWA_WORKBOX_GLOB_IGNORES).toContain('**/vendor-firebase-*.js');
    expect(PWA_WORKBOX_GLOB_IGNORES).toContain('**/vendor-canvg-*.js');
    expect(PWA_WORKBOX_GLOB_IGNORES).not.toContain('**/vendor-pdf-canvas-*.js');

    // Motor oficial raster/PDF permanece em vendor-pdf-canvas (100% precacheado no PWA)
    expect(resolvePwaManualChunk('/app/node_modules/html2canvas-pro/dist/html2canvas-pro.esm.js')).toBe('vendor-pdf-canvas');
    expect(resolvePwaManualChunk('C:\\repo\\node_modules\\jspdf\\dist\\jspdf.es.min.js')).toBe('vendor-pdf-canvas');

    // Dependências opcionais de SVG/HTML do jspdf (canvg, dompurify e html2canvas legado) vão para vendor-canvg
    expect(resolvePwaManualChunk('/app/node_modules/canvg/lib/index.es.js')).toBe('vendor-canvg');
    expect(resolvePwaManualChunk('C:\\repo\\node_modules\\html2canvas\\dist\\html2canvas.esm.js')).toBe('vendor-canvg');
    expect(resolvePwaManualChunk('/app/node_modules/dompurify/dist/purify.es.mjs')).toBe('vendor-canvg');
    expect(resolvePwaManualChunk('/app/node_modules/svg-pathdata/lib/SVGPathData.module.js')).toBe('vendor-canvg');

    // Particionamento dos 3 catálogos clínicos (adulto/RENAME vs. pediatria vs. CID-10)
    expect(resolvePwaManualChunk('/app/src/data/medications/analgesicsAndAntiInflammatories.ts')).toBe('clinical-catalogs');
    expect(resolvePwaManualChunk('C:\\repo\\src\\data\\medicationDatabase.ts')).toBe('clinical-catalogs');
    expect(resolvePwaManualChunk('/app/src/data/pediatricMeds.ts')).toBe('pediatric-catalog');
    expect(resolvePwaManualChunk('C:\\repo\\src\\data\\pediatricHospitalAndProtocols.ts')).toBe('pediatric-catalog');
    expect(resolvePwaManualChunk('/app/src/data/cidCatalog.ts')).toBe('cid-catalog');
    expect(resolvePwaManualChunk('C:\\repo\\src\\data\\cidSpecialtyAndAdminItems.ts')).toBe('cid-catalog');

    // Fronteiras adversariais em resolvePwaManualChunk e searchCID10
    expect(resolvePwaManualChunk('')).toBeUndefined();
    expect(resolvePwaManualChunk('   ')).toBeUndefined();
    expect(resolvePwaManualChunk(null as unknown as string)).toBeUndefined();
    expect(resolvePwaManualChunk('/app/src/utils/sanitizeHtml.ts')).toBeUndefined();

    expect(searchCID10('!@#$%^&*()')).toEqual([]);
    expect(searchCID10('<script>alert(1)</script>')).toEqual([]);
    expect(searchCID10(null as unknown as string).length).toBe(COMMON_CID10.length);
  });

  it('deduplica ícones estáticos no manifesto Workbox e particiona block_01..09.json em chunks individuais scores-block-01..09 (TASK-14)', () => {
    expect(PWA_INCLUDE_ASSETS).toEqual([]);
    expect(PWA_INCLUDE_MANIFEST_ICONS).toBe(false);

    for (let i = 1; i <= 9; i++) {
      const n = `0${i}`;
      expect(resolvePwaManualChunk(`/app/src/data/scores/blocks/block_${n}.json`)).toBe(
        `scores-block-${n}`
      );
      expect(
        resolvePwaManualChunk(`C:\\repo\\src\\data\\scores\\blocks\\block_${n}.json?import`)
      ).toBe(`scores-block-${n}`);
    }

    // Rejeição de blocos fora do intervalo 01..09
    expect(resolvePwaManualChunk('/app/src/data/scores/blocks/block_00.json')).toBeUndefined();
    expect(resolvePwaManualChunk('/app/src/data/scores/blocks/block_10.json')).toBeUndefined();
    expect(resolvePwaManualChunk('/app/src/data/scores/blocks/block_01.json.bak')).toBeUndefined();
  });

  it('exclui scans raster legados (formularios-sus/*.png) do precache Workbox preservando a central vetorial offline e ícones oficiais (TASK-15)', () => {
    expect(PWA_WORKBOX_GLOB_IGNORES).toContain('**/formularios-sus/*.png');

    expect(isIgnoredFromPwaPrecache('formularios-sus/apac-laudo.png')).toBe(true);
    expect(isIgnoredFromPwaPrecache('/formularios-sus/lme.png')).toBe(true);
    expect(isIgnoredFromPwaPrecache('assets/vendor-firebase-BYhIg_hw.js')).toBe(true);
    expect(isIgnoredFromPwaPrecache('assets/vendor-canvg-D6c-glFS.js')).toBe(true);

    // Ativos obrigatórios do fluxo offline nunca são ignorados
    expect(isIgnoredFromPwaPrecache('formularios-sus-offline.html')).toBe(false);
    expect(isIgnoredFromPwaPrecache('logos/sus.png')).toBe(false);
    expect(isIgnoredFromPwaPrecache('watermarks/sus.png')).toBe(false);
    expect(isIgnoredFromPwaPrecache('pwa-192x192.png')).toBe(false);
    expect(isIgnoredFromPwaPrecache('assets/vendor-pdf-canvas-D1v1qYO1.js')).toBe(false);

    // Casos adversariais (path traversal, vazios e tipos inválidos)
    expect(isIgnoredFromPwaPrecache('../formularios-sus/apac-laudo.png')).toBe(false);
    expect(isIgnoredFromPwaPrecache('formularios-sus/sub/apac-laudo.png')).toBe(false);
    expect(isIgnoredFromPwaPrecache('')).toBe(false);
    expect(isIgnoredFromPwaPrecache(null as unknown as string)).toBe(false);
  });
});
