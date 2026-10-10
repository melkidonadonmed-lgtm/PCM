import { describe, it, expect } from 'vitest';
import { resolveIconName, ICON_ALIASES } from '../components/Icon';

describe('Icon Component — Anti-Mutation & Alias Resolution', () => {
  it('deve resolver aliases clínicos essenciais para símbolos canônicos do Material Symbols', () => {
    expect(resolveIconName('prescription')).toBe('prescriptions');
    expect(resolveIconName('receita')).toBe('prescriptions');
    expect(resolveIconName('medicamento')).toBe('medication');
    expect(resolveIconName('remedio')).toBe('medication');
    expect(resolveIconName('gotas')).toBe('water_drop');
    expect(resolveIconName('vacina')).toBe('vaccines');
    expect(resolveIconName('estetoscopio')).toBe('stethoscope');
    expect(resolveIconName('balanca')).toBe('scale');
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
});
