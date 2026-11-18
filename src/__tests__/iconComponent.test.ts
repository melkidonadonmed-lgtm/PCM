import fs from 'node:fs';
import path from 'node:path';
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
    expect(report.actualSubsetWoff2Bytes).toBe(39_512);
    expect(report.subsetGlyphCount).toBe(CANONICAL_MATERIAL_SYMBOLS_SUBSET.length);
    expect(report.subsetGlyphCount).toBe(135);
    expect(report.preservedAxes).toEqual(['FILL', 'opsz']);
    expect(report.instancedAxes).toEqual({ wght: 400, GRAD: 0 });
    expect(report.isSortedAlphabetically).toBe(true);
    expect(report.hasDuplicateGlyphs).toBe(false);
    expect(report.unmappedAliasTargets).toEqual([]);
    expect(report.estimatedSavingsPercent).toBeGreaterThanOrEqual(99);
  });

  it('deve carregar o binário local material-symbols-outlined.subset.woff2 (< 100 KB, magic wOF2) e cobrir 100% dos ícones de src/ (TASK-16)', () => {
    const srcDir = path.resolve(__dirname, '..');
    const mainTsx = fs.readFileSync(path.join(srcDir, 'main.tsx'), 'utf8');
    expect(mainTsx).not.toContain('material-symbols/outlined.css');

    const a4Css = fs.readFileSync(path.join(srcDir, 'styles/a4-and-editor.css'), 'utf8');
    expect(a4Css).toContain("url('../assets/fonts/material-symbols-outlined.subset.woff2')");
    expect(a4Css).toContain('font-weight: 100 700;');
    expect(a4Css).toContain('font-synthesis: none;');

    const woff2Path = path.join(srcDir, 'assets/fonts/material-symbols-outlined.subset.woff2');
    expect(fs.existsSync(woff2Path)).toBe(true);
    const woff2Buf = fs.readFileSync(woff2Path);
    expect(woff2Buf.subarray(0, 4).toString('ascii')).toBe('wOF2');
    expect(woff2Buf.length).toBe(39_512);
    expect(woff2Buf.length).toBeLessThan(100_000);

    const walk = (dir: string): string[] => {
      const res: string[] = [];
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) res.push(...walk(p));
        else if (/\.(ts|tsx)$/.test(e.name)) res.push(p);
      }
      return res;
    };

    const nonIconStateLiterals = new Set([
      'PEP',
      'SBAR',
      'A4',
      'BED_RECORDED',
      'PCR_SOAP',
      'btn-tactile-icon w-11 h-11 min-w-[44px] min-h-[44px]',
    ]);
    const unmappedUsages: string[] = [];

    for (const file of walk(srcDir)) {
      if (file.includes('__tests__')) continue;
      const txt = fs.readFileSync(file, 'utf8');
      const rel = path.relative(srcDir, file);
      const candidates: string[] = [];

      for (const m of txt.matchAll(/<Icon[^>]*?\bname=["']([^"']+)["']/g)) candidates.push(m[1]);
      for (const m of txt.matchAll(/<Icon[^>]*?\bname=\{([^}]+)\}/g)) {
        for (const s of m[1].matchAll(/['"]([a-zA-Z0-9_-]+)['"]/g)) candidates.push(s[1]);
      }
      for (const m of txt.matchAll(/createMaterialIcon\(['"]([^'"]+)['"]\)/g)) candidates.push(m[1]);
      for (const m of txt.matchAll(/\b(?:icon|icone|iconName|iconRight)\s*[:=]\s*['"]([^'"]+)['"]/g)) {
        candidates.push(m[1]);
      }

      for (const name of candidates) {
        if (nonIconStateLiterals.has(name)) continue;
        if (!isCanonicalMaterialSymbol(name)) {
          unmappedUsages.push(`${rel}: ${name}`);
        }
      }
    }

    expect(unmappedUsages).toEqual([]);
  });

  it('deve rejeitar glifos desconhecidos ou entradas vazias na validação estrita do subset (caso adversarial)', () => {
    expect(isCanonicalMaterialSymbol('prescriptions')).toBe(true);
    expect(isCanonicalMaterialSymbol('receita')).toBe(true);
    expect(isCanonicalMaterialSymbol('')).toBe(false);
    expect(isCanonicalMaterialSymbol('   ')).toBe(false);
    expect(isCanonicalMaterialSymbol('glifo_inexistente_inventado_999')).toBe(false);
  });
});
