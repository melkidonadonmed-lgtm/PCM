import Dexie, { type Table } from 'dexie';
import { WorkContext, SavedDocument } from '../types';

export type { SavedDocument };

export class PresCMedDatabase extends Dexie {
  workContexts!: Table<WorkContext, string>;
  savedDocuments!: Table<SavedDocument, string>;

  constructor() {
    super('PresCMed_DB');
    this.version(1).stores({
      workContexts: 'id, name, sphere, isDefault, updatedAt'
    });
    this.version(2).stores({
      workContexts: 'id, name, sphere, isDefault, updatedAt',
      savedDocuments: 'id, title, contextId, isTemplate, updatedAt'
    });
  }
}

export const db = new PresCMedDatabase();

// Contextos Padrão Iniciais para Primeiro Acesso
export async function initializeDefaultContexts(defaultDoctor: { crm: string; uf: string; rqe?: string }) {
  const count = await db.workContexts.count();
  if (count === 0) {
    const defaultContexts: WorkContext[] = [
      {
        id: 'ctx-ubs',
        name: 'UBS Municipal (Atenção Primária)',
        sphere: 'municipal',
        clinicName: 'Secretaria Municipal de Saúde — UBS',
        clinicAddress: 'Rede Municipal de Atenção Básica',
        cnes: '',
        logoAlignment: 'left',
        documentFormatting: {
          headerType: 'standard',
          prescriptionViaCount: 1,
          showCnesOnHeader: true,
          referralModel: 'sus_regulation',
          examHeaderTitle: 'SOLICITAÇÃO DE EXAMES — REDE MUNICIPAL'
        },
        doctorCredentials: { ...defaultDoctor },
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'ctx-policlinica',
        name: 'Policlínica Estadual / Especialidades',
        sphere: 'state',
        clinicName: 'Secretaria de Estado da Saúde — Policlínica',
        clinicAddress: 'Complexo Regulador Estadual',
        cnes: '',
        logoAlignment: 'center',
        documentFormatting: {
          headerType: 'custom_logo',
          prescriptionViaCount: 2,
          showCnesOnHeader: true,
          referralModel: 'sus_regulation',
          examHeaderTitle: 'REQUISIÇÃO DE EXAMES E PROCEDIMENTOS — REDE ESTADUAL'
        },
        doctorCredentials: { ...defaultDoctor },
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];
    await db.workContexts.bulkAdd(defaultContexts);
  }
}
