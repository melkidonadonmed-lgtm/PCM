import { describe, it, expect } from 'vitest';
import {
  resolveIconName,
  ICON_ALIASES,
  CANONICAL_MATERIAL_SYMBOLS_SUBSET,
  isCanonicalMaterialSymbol,
  evaluateMaterialSymbolsSubset,
} from '../components/Icon';

describe('Icon Component — Anti-Mutation, Alias Resolution & WOFF2 Subset Evaluation', () => {
  it('deve resolver aliases clínicos essenciais para símbolos canônicos do Material Symbols', () => {
    expect(resolveIconName('prescription')).toBe('prescriptions');
    expect(resolveIconName('receita')).toBe('prescriptions');
    expect(resolveIconName('medicamento')).toBe('medication');
    expect(resolveIconName('remedio')).toBe('medication');
    expect(resolveIconName('gotas')).toBe('water_drop');
    expect(resolveIconName('vacina')).toBe('vaccines');
    expect(resolveIconName('estetoscopio')).toBe('stethoscope');
    expect(resolveIconName('balanca')).toBe('calculate');
    expect(resolveIconName('pediatria')).toBe('child_care');
  });

  it('deve resolver aliases de exames, diagnósticos e conformidade CFM', () => {
    expect(resolveIconName('exame')).toBe('biotech');
    expect(resolveIconName('laboratorio')).toBe('biotech');
    expect(resolveIconName('raiox')).toBe('radiology');
    expect(resolveIconName('coracao')).toBe('monitor_heart');
    expect(resolveIconName('cid10')).toBe('diagnosis');
    expect(resolveIconName('consentimento')).toBe('fact_check');
  });

  it('deve resolver aliases de documentos, impressão e exportação', () => {
    expect(resolveIconName('atestado')).toBe('workspace_premium');
    expect(resolveIconName('encaminhamento')).toBe('send');
    expect(resolveIconName('imprimir')).toBe('print');
    expect(resolveIconName('pdf')).toBe('picture_as_pdf');
    expect(resolveIconName('copiar')).toBe('content_copy');
    expect(resolveIconName('qrcode')).toBe('qr_code_2');
  });

  it('deve normalizar strings com hífens ou maiúsculas', () => {
    expect(resolveIconName('WATER-DROP')).toBe('water_drop');
    expect(resolveIconName('child-care')).toBe('child_care');
    expect(resolveIconName('  prescriptions  ')).toBe('prescriptions');
  });

  it('deve manter nomes canônicos do Material Symbols inalterados quando não houver alias', () => {
    expect(resolveIconName('search')).toBe('search');
    expect(resolveIconName('medication')).toBe('medication');
    expect(resolveIconName('clinical_notes')).toBe('clinical_notes');
  });

  it('deve retornar help para strings vazias', () => {
    expect(resolveIconName('')).toBe('help');
  });

  it('deve auditar o subset WOFF2 de material-symbols sem glifos duplicados, ordenado alfabeticamente e cobrindo 100% dos aliases', () => {
    const report = evaluateMaterialSymbolsSubset();
    expect(report.upstreamWoff2Bytes).toBe(4_001_608);
    expect(report.subsetGlyphCount).toBe(CANONICAL_MATERIAL_SYMBOLS_SUBSET.length);
    expect(report.subsetGlyphCount).toBeGreaterThanOrEqual(130);
    expect(report.isSortedAlphabetically).toBe(true);
    expect(report.hasDuplicateGlyphs).toBe(false);
    expect(report.unmappedAliasTargets).toEqual([]);
    expect(report.estimatedSavingsPercent).toBeGreaterThan(95);
  });

  it('deve rejeitar glifos desconhecidos ou entradas vazias na validação estrita do subset (caso adversarial)', () => {
    expect(isCanonicalMaterialSymbol('prescriptions')).toBe(true);
    expect(isCanonicalMaterialSymbol('receita')).toBe(true);
    expect(isCanonicalMaterialSymbol('')).toBe(false);
    expect(isCanonicalMaterialSymbol('   ')).toBe(false);
    expect(isCanonicalMaterialSymbol('glifo_inexistente_inventado_999')).toBe(false);
  });
});
