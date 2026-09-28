import Dexie, { type Table } from 'dexie';
import { WorkContext } from '../types';

export class PresCMedDatabase extends Dexie {
  workContexts!: Table<WorkContext, string>;

  constructor() {
    super('PresCMed_DB');
    this.version(1).stores({
      workContexts: 'id, name, sphere, isDefault, updatedAt'
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
        id: 'ctx-ubs-padrao',
        name: 'UBS Municipal (Atenção Básica)',
        sphere: 'municipal',
        clinicName: 'Unidade Básica de Saúde da Família',
        clinicAddress: 'Rede de Atenção Primária à Saúde',
        logoAlignment: 'left',
        regulatoryRules: {
          restrictToRemume: true,
          requireSpecificReferralHeader: true,
          standardPrescriptionViaCount: 1
        },
        doctorCredentials: { ...defaultDoctor },
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'ctx-policlinica-padrao',
        name: 'Policlínica Estadual / Especialidades',
        sphere: 'state',
        clinicName: 'Centro de Especialidades Médicas do Estado',
        clinicAddress: 'Rede de Atenção Especializada',
        logoAlignment: 'center',
        regulatoryRules: {
          restrictToRemume: false,
          requireSpecificReferralHeader: true,
          standardPrescriptionViaCount: 2
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
