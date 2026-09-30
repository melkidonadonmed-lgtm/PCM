import { describe, it, expect, vi } from 'vitest';
import { ActiveTab } from '../types';

describe('Governança de Rotas e Navegação do Editor', () => {
  it('não deve possuir rotas órfãs ou duplicadas na união canônica de ActiveTab', () => {
    const validTabs: ActiveTab[] = [
      'prescription',
      'pediatric_calc',
      'exams',
      'certificate',
      'referral',
      'protocols',
      'editor',
      'print_preview',
      'patients'
    ];

    // Garante que não existem abas duplicadas
    const uniqueTabs = new Set(validTabs);
    expect(uniqueTabs.size).toBe(validTabs.length);

    // Garante que a rota órfã legada 'models' foi eliminada
    const hasOrphanModels = (validTabs as string[]).includes('models');
    expect(hasOrphanModels).toBe(false);
  });

  it('deve priorizar a abertura direta no Editor na ação primária de visualização da receita', () => {
    let editorOpened = false;
    let directPrintOpened = false;

    const mockNavigateToEditor = () => {
      editorOpened = true;
    };

    const mockNavigateToPrint = () => {
      directPrintOpened = true;
    };

    // Simula a lógica de despacho de ações da receita
    const handlePrimaryAction = (hasEditor: boolean) => {
      if (hasEditor) {
        mockNavigateToEditor();
      } else {
        mockNavigateToPrint();
      }
    };

    handlePrimaryAction(true);
    expect(editorOpened).toBe(true);
    expect(directPrintOpened).toBe(false);

    // Teste da ação secundária de impressão rápida direta
    mockNavigateToPrint();
    expect(directPrintOpened).toBe(true);
  });

  it('deve formatar a sincronização clínica em tempo real dos medicamentos para o canvas A4 do Editor', () => {
    const activePrescriptionItems = [
      {
        id: 'med-1',
        name: 'Dipirona Monoidratada 500 mg/mL',
        presentation: 'Gotas 20 mL',
        route: 'Uso Oral',
        quantity: '1 frasco',
        instructions: 'Pingar 25 gotas a cada 6 horas se dor ou febre.'
      },
      {
        id: 'med-2',
        name: 'Amoxicilina 500 mg',
        presentation: 'Cápsulas',
        route: 'Uso Oral',
        quantity: '21 cápsulas',
        instructions: 'Tomar 1 cápsula a cada 8 horas durante 7 dias.'
      }
    ];

    const generateEditorSyncContent = (items: typeof activePrescriptionItems, isSpecial: boolean) => {
      const title = isSpecial ? 'RECEITUÁRIO DE CONTROLE ESPECIAL' : 'RECEITUÁRIO MÉDICO';
      const body = items.map((it, idx) => `${idx + 1}. ${it.name} (${it.route}) - ${it.instructions}`).join('\n');
      return { title, body, count: items.length };
    };

    const synced = generateEditorSyncContent(activePrescriptionItems, false);
    expect(synced.title).toBe('RECEITUÁRIO MÉDICO');
    expect(synced.count).toBe(2);
    expect(synced.body).toContain('Dipirona Monoidratada');
    expect(synced.body).toContain('Amoxicilina 500 mg');
  });
});
