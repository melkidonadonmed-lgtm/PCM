import { describe, it, expect } from 'vitest';
import { sanitizeForFirestore, cloudSyncManager } from '../services/cloud/cloudSyncManager';

describe('sanitizeForFirestore - Blindagem de Persistência na Nuvem', () => {
  it('rastreia exclusões pendentes (anti-ressurreição / Zombie Records) por coleção (PCM-SYNC-02)', () => {
    cloudSyncManager.recordPendingDelete('prescription_models', 'model-zombie-1');
    cloudSyncManager.recordPendingDelete('work_contexts', 'ctx-zombie-1');

    expect(cloudSyncManager.getPendingDeletedIds('prescription_models')).toContain('model-zombie-1');
    expect(cloudSyncManager.getPendingDeletedIds('work_contexts')).toContain('ctx-zombie-1');
  });

  it('deve remover recursivamente campos com valor undefined em objetos complexos', () => {
    const rawData = {
      id: 'ctx-ubs',
      name: 'USF Osvaldo Piana',
      cnes: undefined,
      rqe: undefined,
      updatedAt: 123456789,
      documentFormatting: {
        headerType: 'custom_logo',
        showCnesOnHeader: false,
        secondaryLogoDataUrl: undefined
      },
      tags: ['ubs', undefined, 'sus']
    };

    const clean = sanitizeForFirestore(rawData);

    expect(clean).toHaveProperty('id', 'ctx-ubs');
    expect(clean).toHaveProperty('name', 'USF Osvaldo Piana');
    expect(clean).toHaveProperty('updatedAt', 123456789);
    expect(clean).not.toHaveProperty('cnes');
    expect(clean).not.toHaveProperty('rqe');
    expect(clean.documentFormatting).toHaveProperty('headerType', 'custom_logo');
    expect(clean.documentFormatting).not.toHaveProperty('secondaryLogoDataUrl');
    expect(clean.tags).toEqual(['ubs', undefined, 'sus']);
  });

  it('deve preservar tipos primitivos, strings vazias, números zero e booleanos false', () => {
    const data = {
      emptyStr: '',
      zeroNum: 0,
      boolFalse: false,
      nullVal: null
    };

    const clean = sanitizeForFirestore(data);
    expect(clean).toEqual(data);
  });
});
