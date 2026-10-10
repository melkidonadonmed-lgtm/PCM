import { describe, it, expect } from 'vitest';
import { isSpecialControlOrAntibiotic } from '../utils/isSpecialControlOrAntibiotic';

describe('isSpecialControlOrAntibiotic — Detecção Clínica de Antimicrobianos e Controlados', () => {
  it('deve identificar Amoxicilina como medicamento de controle especial / 2 vias', () => {
    expect(isSpecialControlOrAntibiotic('Amoxicilina 875mg comprimido (Novocilin 875)')).toBe(true);
    expect(isSpecialControlOrAntibiotic({ name: 'Amoxicilina 500mg', category: 'antibioticos' })).toBe(true);
    expect(isSpecialControlOrAntibiotic({ name: 'Novocilin 875' })).toBe(true);
    expect(isSpecialControlOrAntibiotic('Amoxicilina + Clavulanato 875/125mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Clavulin BD')).toBe(true);
  });

  it('deve identificar outros antibióticos comuns da RDC 20/2011', () => {
    expect(isSpecialControlOrAntibiotic('Azitromicina 500mg comprimido')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Cefalexina 500mg cápsulas')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Ciprofloxacino 500mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Levofloxacino 500mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Bactrim F comprimido')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Sulfametoxazol + Trimetoprima')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Benzetacil 1.200.000 UI')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Nitrofurantoína 100mg')).toBe(true);
  });

  it('deve identificar psicotrópicos e controlados da Portaria 344/98', () => {
    expect(isSpecialControlOrAntibiotic('Clonazepam 2mg comprimido (Rivotril)')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Diazepam 10mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Sertralina 50mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Fluoxetina 20mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Zolpidem 10mg')).toBe(true);
    expect(isSpecialControlOrAntibiotic('Tramadol 50mg')).toBe(true);
  });

  it('NÃO deve marcar analgésicos e medicamentos comuns de receita simples como especiais', () => {
    expect(isSpecialControlOrAntibiotic('Dipirona Sódica 500mg comprimido')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Dipirona + Orfenadrina + Cafeína (Dorflex)')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Paracetamol 750mg')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Ibuprofeno 600mg')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Omeprazol 20mg')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Losartana Potássica 50mg')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Metformina 850mg')).toBe(false);
    expect(isSpecialControlOrAntibiotic('Sinvastatina 20mg')).toBe(false);
  });

  it('deve respeitar a flag explícita isSpecialControl se presente', () => {
    expect(isSpecialControlOrAntibiotic({ name: 'Fórmula Manipulada', isSpecialControl: true })).toBe(true);
    expect(isSpecialControlOrAntibiotic({ name: 'Colírio Específico', isSpecialControl: false })).toBe(false);
  });

  it('deve segregar corretamente uma prescrição mista contendo antibiótico (Amoxicilina) e analgésico (Dorflex/Dipirona)', () => {
    const mixedItems = [
      { id: '1', name: 'Amoxicilina 875mg comprimido', route: 'Uso Oral', quantity: '1 caixa', instructions: 'Tomar de 12/12h por 7 dias' },
      { id: '2', name: 'Dipirona + Orfenadrina + Cafeína (Dorflex)', route: 'Uso Oral', quantity: '1 caixa', instructions: 'Tomar 1 comp de 6/6h se dor' },
      { id: '3', name: 'Azitromicina 500mg', route: 'Uso Oral', quantity: '1 caixa', instructions: 'Tomar 1 comp ao dia por 5 dias' },
      { id: '4', name: 'Paracetamol 750mg', route: 'Uso Oral', quantity: '1 caixa', instructions: 'Tomar se dor ou febre' }
    ];

    const specialItems = mixedItems.filter(i => isSpecialControlOrAntibiotic(i));
    const simpleItems = mixedItems.filter(i => !isSpecialControlOrAntibiotic(i));

    expect(specialItems).toHaveLength(2);
    expect(specialItems.map(i => i.name)).toEqual([
      'Amoxicilina 875mg comprimido',
      'Azitromicina 500mg'
    ]);

    expect(simpleItems).toHaveLength(2);
    expect(simpleItems.map(i => i.name)).toEqual([
      'Dipirona + Orfenadrina + Cafeína (Dorflex)',
      'Paracetamol 750mg'
    ]);
  });
});
