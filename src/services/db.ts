import Dexie, { type Table } from 'dexie';
import { WorkContext, SavedDocument } from '../types';
import { PRESET_LOGOS } from '../data/presetAssets';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';

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
        name: 'USF Osvaldo Piana (SEMUSA - Porto Velho)',
        sphere: 'municipal',
        clinicName: 'UNIDADE DE SAÚDE DA FAMÍLIA OSVALDO PIANA',
        clinicAddress: 'Av. Campos Sales, 858 - Areal, Porto Velho - RO, 76804-358',
        cnes: '2678942',
        logoDataUrl: PRESET_LOGOS.semusa.dataUrl,
        logoAlignment: 'left',
        watermarkType: 'sus_double',
        watermarkOpacity: 0.08,
        documentFormatting: {
          headerType: 'custom_logo',
          prescriptionViaCount: 2,
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
        name: 'Policlínica Oswaldo Cruz - POC (SESAU - RO)',
        sphere: 'state',
        clinicName: 'POC - Policlínica Oswaldo Cruz',
        clinicAddress: 'Av. Gov. Jorge Teixeira, 3862 - Industrial, Porto Velho - RO, Tel: (69) 3216-5462',
        cnes: '2678950',
        logoDataUrl: PRESET_LOGOS.sesau_ro.dataUrl,
        logoAlignment: 'center',
        watermarkType: 'sus_double',
        watermarkOpacity: 0.08,
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
      },
      {
        id: 'ctx-consultorio',
        name: 'Consultório / Clínica Particular',
        sphere: 'private',
        clinicName: 'Consultório Médico Particular',
        clinicAddress: 'Atendimento Clínico Ambulatorial',
        cnes: '',
        logoDataUrl: PRESET_LOGOS.sus.dataUrl,
        logoAlignment: 'right',
        watermarkType: 'none',
        watermarkOpacity: 0.08,
        documentFormatting: {
          headerType: 'standard',
          prescriptionViaCount: 1,
          showCnesOnHeader: false,
          referralModel: 'direct_ambulatory',
          examHeaderTitle: 'SOLICITAÇÃO DE EXAMES COMPLEMENTARES'
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

// Inicializa modelos clínicos padrão salvos no Dexie
export async function initializeDefaultTemplates() {
  const count = await db.savedDocuments.count();
  if (count === 0) {
    await db.savedDocuments.bulkAdd(PRESET_CLINICAL_TEMPLATES);
  }
}

