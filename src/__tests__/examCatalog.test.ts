import { describe, it, expect } from 'vitest';
import { EXAM_CATALOG, EXAM_PACKAGES } from '../data/examCatalog';

describe('Catálogo de exames — rotinas e painéis prontos', () => {
  const idsDoCatalogo = EXAM_CATALOG.map((exame) => exame.id);

  it('não repete id de exame nem de painel', () => {
    expect(new Set(idsDoCatalogo).size).toBe(idsDoCatalogo.length);
    const idsDosPaineis = EXAM_PACKAGES.map((painel) => painel.id);
    expect(new Set(idsDosPaineis).size).toBe(idsDosPaineis.length);
  });

  it('todo exame de um painel existe no catálogo e não aparece duas vezes no mesmo painel', () => {
    for (const painel of EXAM_PACKAGES) {
      const ausentes = painel.examIds.filter((id) => !idsDoCatalogo.includes(id));
      expect(ausentes, `painel "${painel.name}"`).toEqual([]);
      expect(new Set(painel.examIds).size, `painel "${painel.name}"`).toBe(painel.examIds.length);
    }
  });

  it('mantém as rotinas por ciclo de vida e de investigação', () => {
    const idsDosPaineis = EXAM_PACKAGES.map((painel) => painel.id);
    expect(idsDosPaineis).toEqual(
      expect.arrayContaining([
        'pre-natal-1tri',
        'pre-natal-2tri',
        'pre-natal-3tri',
        'rotina-mulher',
        'rotina-homem',
        'rotina-idoso',
        'investigacao-has',
        'investigacao-diabetes',
        'painel-ist',
      ]),
    );
  });
});
