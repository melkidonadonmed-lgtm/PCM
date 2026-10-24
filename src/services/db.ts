import Dexie, { type Table } from 'dexie';
import { WorkContext, SavedDocument } from '../types';
import type { HospitalBedPatientRecord } from '../core/domain/clinicalEntities';
import { PRESET_CLINICAL_TEMPLATES } from '../data/presetClinicalTemplates';

export type { SavedDocument };

export class PresCMedDatabase extends Dexie {
  workContexts!: Table<WorkContext, string>;
  savedDocuments!: Table<SavedDocument, string>;
  hospitalBeds!: Table<HospitalBedPatientRecord, string>;

  constructor() {
    super('PresCMed_DB');
    this.version(1).stores({
      workContexts: 'id, name, sphere, isDefault, updatedAt'
    });
    this.version(2).stores({
      workContexts: 'id, name, sphere, isDefault, updatedAt',
      savedDocuments: 'id, title, contextId, isTemplate, updatedAt'
    });
    this.version(3).stores({
      workContexts: 'id, name, sphere, isDefault, updatedAt',
      savedDocuments: 'id, title, contextId, isTemplate, updatedAt',
      hospitalBeds: 'id, wardAndBed, wardName, specialtyTemplate, updatedAt'
    });
  }
}

export const db = new PresCMedDatabase();

// Inicializa modelos clínicos padrão salvos no Dexie (idempotente sob React 19 StrictMode)
export async function initializeDefaultTemplates() {
  const count = await db.savedDocuments.count();
  if (count === 0) {
    await db.savedDocuments.bulkPut(PRESET_CLINICAL_TEMPLATES);
  }
}

