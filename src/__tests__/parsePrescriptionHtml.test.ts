import { describe, it, expect } from 'vitest';
import { parsePrescriptionHtmlToItems } from '../utils/parsePrescriptionHtml';
import { PrescriptionItem } from '../types';

describe('parsePrescriptionHtmlToItems - Sincronização Bidirecional Editor <-> Receita', () => {
  const originalItems: PrescriptionItem[] = [
    {
      id: 'item-1',
      name: 'Amoxicilina 500mg',
      presentation: 'Cápsulas',
      route: 'Uso Oral',
      quantity: '21 cápsulas',
      doseCalculatedText: '500 mg',
      frequencyText: '8/8h por 7 dias',
      scheduleInterval: '8/8h',
      scheduleTimes: ['06:00', '14:00', '22:00'],
      instructions: 'Tomar 1 cápsula a cada 8 horas durante 7 dias.',
      isContinuous: false,
      isSpecialControl: true
    },
    {
      id: 'item-2',
      name: 'Dipirona 500mg/mL (Gotas)',
      presentation: 'Frasco 20 mL',
      route: 'Uso Oral',
      quantity: '1 frasco',
      doseCalculatedText: '500 mg',
      frequencyText: '6/6h se dor ou febre',
      scheduleInterval: '6/6h',
      scheduleTimes: [],
      instructions: 'Tomar 30 a 40 gotas até de 6/6h se dor ou febre.',
      isContinuous: false,
      isSpecialControl: false
    }
  ];

  it('deve extrair medicamentos e posologias editadas no HTML mantendo IDs originais', () => {
    const editedHtml = `
      <p style="text-align: center;"><strong>RECEITUÁRIO MÉDICO</strong></p>
      <p></p>
      <p><strong>1. Amoxicilina 500mg (Cápsulas)</strong> (Uso Oral) ----------------- 30 cápsulas</p>
      <p style="margin-left: 20px;">Tomar 1 cápsula a cada 8 horas durante 10 dias seguidos.</p>
      <p></p>
      <p><strong>2. Dipirona 500mg/mL (Gotas)</strong> (Uso Oral) ----------------- 2 frascos</p>
      <p style="margin-left: 20px;">Tomar 35 gotas a cada 6 horas se febre alta.</p>
      <p></p>
      <p><strong>Orientações Gerais:</strong> Manter repouso e ingerir líquidos.</p>
    `;

    const result = parsePrescriptionHtmlToItems(editedHtml, originalItems);

    expect(result).toHaveLength(2);
    // Preserva o ID original e os flags de controle especial
    expect(result[0].id).toBe('item-1');
    expect(result[0].isSpecialControl).toBe(true);
    // Mas atualiza quantidade e posologia que foram alteradas no editor!
    expect(result[0].quantity).toBe('30 cápsulas');
    expect(result[0].instructions).toContain('10 dias seguidos');

    expect(result[1].id).toBe('item-2');
    expect(result[1].quantity).toBe('2 frascos');
    expect(result[1].instructions).toContain('35 gotas a cada 6 horas');
  });

  it('deve capturar um novo medicamento adicionado manualmente pelo médico no Editor', () => {
    const htmlWithNewMed = `
      <p><strong>1. Amoxicilina 500mg</strong> (Uso Oral) ----------------- 21 cápsulas</p>
      <p>Tomar 1 cápsula a cada 8h.</p>
      <p><strong>2. Prednisolona 20mg</strong> (Uso Oral) ----------------- 1 caixa</p>
      <p>Tomar 1 comprimido pela manhã por 5 dias.</p>
    `;

    const result = parsePrescriptionHtmlToItems(htmlWithNewMed, [originalItems[0]]);

    expect(result).toHaveLength(2);
    expect(result[0].name).toContain('Amoxicilina 500mg');
    expect(result[1].name).toContain('Prednisolona 20mg');
    expect(result[1].quantity).toBe('1 caixa');
    expect(result[1].instructions).toContain('1 comprimido pela manhã');
  });

  it('deve retornar os itens originais caso o HTML seja vazio ou inválido', () => {
    const result = parsePrescriptionHtmlToItems('', originalItems);
    expect(result).toEqual(originalItems);
  });
});
