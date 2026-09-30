import { describe, it, expect } from 'vitest';
import {
  calcularPrescricaoRapida,
  getTomadasPorDia,
  formatarUnidadeDose
} from '../utils/prescricaoRapida';

describe('prescricaoRapida (Cálculo de Comprimidos Totais e Posologia)', () => {
  it('calcula tomadas por dia corretamente para cada intervalo', () => {
    expect(getTomadasPorDia('4/4h')).toBe(6);
    expect(getTomadasPorDia('6/6h')).toBe(4);
    expect(getTomadasPorDia('8/8h')).toBe(3);
    expect(getTomadasPorDia('12/12h')).toBe(2);
    expect(getTomadasPorDia('24h')).toBe(1);
    expect(getTomadasPorDia('manha')).toBe(1);
    expect(getTomadasPorDia('noite')).toBe(1);
    expect(getTomadasPorDia('DU')).toBe(1);
  });

  it('formata plural e singular de unidades farmacêuticas', () => {
    expect(formatarUnidadeDose('comprimido', 1)).toBe('comprimido');
    expect(formatarUnidadeDose('comprimido', 20)).toBe('comprimidos');
    expect(formatarUnidadeDose('cápsula', 1)).toBe('cápsula');
    expect(formatarUnidadeDose('capsula', 14)).toBe('cápsulas');
    expect(formatarUnidadeDose('gota', 1)).toBe('gota');
    expect(formatarUnidadeDose('gota', 30)).toBe('gotas');
    expect(formatarUnidadeDose('sachê', 1)).toBe('sachê');
    expect(formatarUnidadeDose('sache', 10)).toBe('sachês');
  });

  it('calcula 1 comp 8/8h por 5 dias = 15 comprimidos e monta posologia', () => {
    const res = calcularPrescricaoRapida({
      dose: 1,
      unidade: 'comprimido',
      frequencia: '8/8h',
      diasTratamento: 5,
      via: 'Uso Oral'
    });

    expect(res.quantidadeTotalNumero).toBe(15);
    expect(res.quantidadeTotalTexto).toBe('15 comprimidos');
    expect(res.posologiaTexto).toBe('Tomar 1 comprimido via oral de 8 em 8 horas durante 5 dias.');
  });

  it('calcula 1 comp 12/12h por 7 dias = 14 comprimidos', () => {
    const res = calcularPrescricaoRapida({
      dose: 1,
      unidade: 'comprimido',
      frequencia: '12/12h',
      diasTratamento: 7,
      via: 'Uso Oral'
    });

    expect(res.quantidadeTotalNumero).toBe(14);
    expect(res.quantidadeTotalTexto).toBe('14 comprimidos');
    expect(res.posologiaTexto).toBe('Tomar 1 comprimido via oral de 12 em 12 horas durante 7 dias.');
  });

  it('calcula uso contínuo (1 comp pela manhã) = 30 comprimidos', () => {
    const res = calcularPrescricaoRapida({
      dose: 1,
      unidade: 'comprimido',
      frequencia: 'manha',
      usoContinuo: true,
      via: 'Uso Oral'
    });

    expect(res.quantidadeTotalNumero).toBe(30);
    expect(res.quantidadeTotalTexto).toBe('30 comprimidos');
    expect(res.posologiaTexto).toBe('Tomar 1 comprimido via oral 1 vez ao dia, pela manhã em uso contínuo.');
  });

  it('calcula dose única = 1 comprimido', () => {
    const res = calcularPrescricaoRapida({
      dose: 1,
      unidade: 'comprimido',
      frequencia: 'DU',
      via: 'Uso Oral'
    });

    expect(res.quantidadeTotalNumero).toBe(1);
    expect(res.quantidadeTotalTexto).toBe('1 comprimido');
    expect(res.posologiaTexto).toBe('Tomar 1 comprimido via oral em dose única');
  });

  it('calcula medicamento SOS com complemento', () => {
    const res = calcularPrescricaoRapida({
      dose: 1,
      unidade: 'comprimido',
      frequencia: '6/6h',
      diasTratamento: 3,
      via: 'Uso Oral',
      complemento: 'se dor ou febre'
    });

    // 1 comp x 4 tomadas/dia x 3 dias = 12 comprimidos
    expect(res.quantidadeTotalNumero).toBe(12);
    expect(res.quantidadeTotalTexto).toBe('12 comprimidos');
    expect(res.posologiaTexto).toBe('Tomar 1 comprimido via oral de 6 em 6 horas (se dor ou febre) durante 3 dias.');
  });
});
