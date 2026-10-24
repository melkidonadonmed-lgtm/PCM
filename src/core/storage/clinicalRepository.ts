import type {
  DoctorProfile,
  Patient,
  PrescriptionItem,
  SavedDocument,
  WorkContext,
} from '../../types';
import { db } from '../../services/db';
import { storageService } from '../../services/storageService';
import {
  CLINICAL_MODULES_REGISTRY,
  type ClinicalEncounterEntity,
  type ClinicalModuleDescriptor,
  type ClinicalModuleId,
  type EvolutionSoapEntity,
  type HospitalAdmissionEntity,
  type HospitalBedPatientRecord,
} from '../domain/clinicalEntities';

/**
 * Contrato de Persistência Clínica Desacoplada (Repository Pattern).
 *
 * Hoje implementado sobre `localStorage` + `Dexie.js` (IndexedDB v2) 100% client-side.
 * Quando os módulos de Evolução (PEP) e Hospitalar forem conectados a um banco de dados
 * seguro (PostgreSQL / Cloud SQL / Supabase com criptografia em repouso e trilha de auditoria),
 * basta injetar uma implementação `RemoteSecureClinicalRepository` que cumpra esta mesma interface,
 * sem alterar os componentes React de prescrição e documentos.
 */
export interface IClinicalRepository {
  readonly driverName: 'local-dexie-v2' | 'encrypted-indexeddb' | 'remote-secure-db';

  listModules(): readonly ClinicalModuleDescriptor[];
  getActiveModule(): ClinicalModuleId;

  loadDoctorProfile(fallback: DoctorProfile): DoctorProfile;
  saveDoctorProfile(doctor: DoctorProfile): boolean;

  loadActivePatient(fallback: Patient): Patient;
  saveActivePatient(patient: Patient): boolean;

  loadActivePrescription(fallback?: PrescriptionItem[]): PrescriptionItem[];
  saveActivePrescription(items: PrescriptionItem[]): boolean;

  listWorkContexts(): Promise<WorkContext[]>;
  saveWorkContext(context: WorkContext): Promise<void>;

  listSavedDocuments(contextId?: string): Promise<SavedDocument[]>;
  saveDocument(doc: SavedDocument): Promise<void>;

  /** Hooks preparados para os módulos de Evolução (PEP) e Hospitalar (MOD-03) */
  saveEncounterSnapshot?(encounter: ClinicalEncounterEntity): Promise<void>;
  listPatientEvolutions?(patientId: string): Promise<EvolutionSoapEntity[]>;
  savePatientEvolution?(entry: EvolutionSoapEntity): Promise<void>;
  listHospitalAdmissions?(wardFilter?: string): Promise<HospitalAdmissionEntity[]>;
  saveHospitalAdmission?(admission: HospitalAdmissionEntity): Promise<void>;
  listHospitalBeds?(wardFilter?: string): Promise<HospitalBedPatientRecord[]>;
  saveHospitalBed?(record: HospitalBedPatientRecord): Promise<void>;
  deleteHospitalBed?(bedId: string): Promise<void>;
}

export const CLINICAL_STORAGE_KEYS = {
  DOCTOR: 'prescmed_doctor',
  PATIENT: 'prescmed_patient',
  PRESCRIPTION: 'prescmed_prescription',
  HOSPITAL_BEDS_FALLBACK: 'prescmed_hospital_beds_v3',
} as const;

class LocalDexieClinicalRepository implements IClinicalRepository {
  public readonly driverName = 'local-dexie-v2' as const;

  public listModules(): readonly ClinicalModuleDescriptor[] {
    return CLINICAL_MODULES_REGISTRY;
  }

  public getActiveModule(): ClinicalModuleId {
    return 'prescription';
  }

  public loadDoctorProfile(fallback: DoctorProfile): DoctorProfile {
    return storageService.loadItem(CLINICAL_STORAGE_KEYS.DOCTOR, fallback);
  }

  public saveDoctorProfile(doctor: DoctorProfile): boolean {
    return storageService.saveItem(CLINICAL_STORAGE_KEYS.DOCTOR, doctor);
  }

  public loadActivePatient(fallback: Patient): Patient {
    return storageService.loadItem(CLINICAL_STORAGE_KEYS.PATIENT, fallback);
  }

  public saveActivePatient(patient: Patient): boolean {
    return storageService.saveItem(CLINICAL_STORAGE_KEYS.PATIENT, patient);
  }

  public loadActivePrescription(fallback: PrescriptionItem[] = []): PrescriptionItem[] {
    return storageService.loadItem(CLINICAL_STORAGE_KEYS.PRESCRIPTION, fallback);
  }

  public saveActivePrescription(items: PrescriptionItem[]): boolean {
    return storageService.saveItem(CLINICAL_STORAGE_KEYS.PRESCRIPTION, items);
  }

  public async listWorkContexts(): Promise<WorkContext[]> {
    return db.workContexts.orderBy('createdAt').toArray();
  }

  public async saveWorkContext(context: WorkContext): Promise<void> {
    await db.workContexts.put(context);
  }

  public async listSavedDocuments(contextId?: string): Promise<SavedDocument[]> {
    if (contextId) {
      return db.savedDocuments.where('contextId').equals(contextId).reverse().sortBy('updatedAt');
    }
    return db.savedDocuments.orderBy('updatedAt').reverse().toArray();
  }

  public async saveDocument(doc: SavedDocument): Promise<void> {
    await db.savedDocuments.put(doc);
  }

  public async listHospitalBeds(wardFilter?: string): Promise<HospitalBedPatientRecord[]> {
    try {
      const all = await db.hospitalBeds.orderBy('wardAndBed').toArray();
      if (all.length > 0) {
        return wardFilter
          ? all.filter((b) => b.wardName.toLowerCase().includes(wardFilter.toLowerCase()))
          : all;
      }
    } catch {
      // Fallback para ambientes de teste sem IndexedDB
    }
    const local = storageService.loadItem<HospitalBedPatientRecord[]>(
      CLINICAL_STORAGE_KEYS.HOSPITAL_BEDS_FALLBACK,
      []
    );
    return wardFilter
      ? local.filter((b) => b.wardName.toLowerCase().includes(wardFilter.toLowerCase()))
      : local;
  }

  public async saveHospitalBed(record: HospitalBedPatientRecord): Promise<void> {
    const current = storageService.loadItem<HospitalBedPatientRecord[]>(
      CLINICAL_STORAGE_KEYS.HOSPITAL_BEDS_FALLBACK,
      []
    );
    const next = current.some((item) => item.id === record.id)
      ? current.map((item) => (item.id === record.id ? record : item))
      : [...current, record];
    storageService.saveItem(CLINICAL_STORAGE_KEYS.HOSPITAL_BEDS_FALLBACK, next);
    try {
      await db.hospitalBeds.put(record);
    } catch {
      // Silencioso em SSR/Vitest sem IndexedDB
    }
  }

  public async deleteHospitalBed(bedId: string): Promise<void> {
    const current = storageService.loadItem<HospitalBedPatientRecord[]>(
      CLINICAL_STORAGE_KEYS.HOSPITAL_BEDS_FALLBACK,
      []
    );
    storageService.saveItem(
      CLINICAL_STORAGE_KEYS.HOSPITAL_BEDS_FALLBACK,
      current.filter((item) => item.id !== bedId)
    );
    try {
      await db.hospitalBeds.delete(bedId);
    } catch {
      // Silencioso em SSR/Vitest sem IndexedDB
    }
  }
}

export const clinicalRepository: IClinicalRepository = new LocalDexieClinicalRepository();
