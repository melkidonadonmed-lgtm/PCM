import type {
  DoctorProfile,
  ExamItem,
  MedicalCertificate,
  MedicalReferral,
  Patient,
  PrescriptionItem,
  WorkContext,
} from '../../types';

/**
 * Identificadores canônicos dos Macro-Módulos da Plataforma PresCMed.
 * - `prescription`: Módulo Ambulatorial e de Prescrição / Documentos / SUS (Ativo em produção).
 * - `evolution_pep`: Módulo de Evolução Clínica / Prontuário Eletrônico SOAP (Arquitetura preparada).
 * - `hospital`: Módulo Hospitalar / Internação, Prescrição por Horário e Alta (Arquitetura preparada).
 */
export type ClinicalModuleId = 'prescription' | 'evolution_pep' | 'hospital';

export interface ClinicalModuleDescriptor {
  id: ClinicalModuleId;
  code: string;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  status: 'active' | 'planned';
  requiresSecureBackend: boolean;
}

export const CLINICAL_MODULES_REGISTRY: readonly ClinicalModuleDescriptor[] = [
  {
    id: 'prescription',
    code: 'MOD-01',
    title: 'Módulo Clínico & Prescrição Ambulatorial',
    shortTitle: 'Clínico & Prescrição',
    description:
      'Receituário inteligente (Simples, Antimicrobiano RDC 471/2021 e Controle Especial Portaria 344/98), Calculadora Pediátrica, Exames, Atestados CFM e 9 Guias Oficiais do SUS.',
    iconName: 'stethoscope',
    status: 'active',
    requiresSecureBackend: false,
  },
  {
    id: 'evolution_pep',
    code: 'MOD-02',
    title: 'Módulo de Evolução Clínica & Prontuário (PEP)',
    shortTitle: 'Evolução / PEP',
    description:
      'Registro longitudinal de consultas em formato SOAP, curva de sinais vitais, linha do tempo clínica por paciente e anexos de exames.',
    iconName: 'clinical_notes',
    status: 'planned',
    requiresSecureBackend: true,
  },
  {
    id: 'hospital',
    code: 'MOD-03',
    title: 'Módulo Hospitalar & Internação',
    shortTitle: 'Hospitalar',
    description:
      'Gestão de leitos, prescrição hospitalar sistematizada (Dieta, Hidratação Venosa, Medicamentos aprazados, SOS, Cuidados e Profilaxias), Evolução Diária (D1..Dn) e Sumário de Alta.',
    iconName: 'local_hospital',
    status: 'planned',
    requiresSecureBackend: true,
  },
] as const;

/**
 * Sinais vitais padronizados (compartilhados entre Evolução Ambulatorial e Evolução Hospitalar).
 */
export interface VitalSignsRecord {
  measuredAtIso: string;
  paSystolicMmHg?: number;
  paDiastolicMmHg?: number;
  heartRateBpm?: number;
  respiratoryRateIpm?: number;
  temperatureCelsius?: number;
  spo2Percent?: number;
  capillaryGlucoseMgDl?: number;
  weightKg?: number;
  heightCm?: number;
  glasgowScale?: number;
  painScore0to10?: number;
}

/**
 * Entidade de Atendimento / Episódio Clínico (Encounter) que vincula Prescrições,
 * Documentos, Evoluções SOAP e Internações a um mesmo atendimento auditável.
 */
export interface ClinicalEncounterEntity {
  id: string;
  module: ClinicalModuleId;
  patient: Patient;
  doctor: DoctorProfile;
  workContextId?: string;
  startedAt: number;
  updatedAt: number;
  closedAt?: number;
  status: 'open' | 'signed' | 'archived';
  prescriptionItems: PrescriptionItem[];
  selectedExams: ExamItem[];
  certificate?: MedicalCertificate;
  referral?: MedicalReferral;
}

/**
 * Contrato de Evolução Clínica Estruturada (SOAP) para o futuro Módulo de Evolução (PEP).
 */
export interface EvolutionSoapEntity {
  id: string;
  encounterId: string;
  patientId: string;
  createdAt: number;
  updatedAt: number;
  subjective: string;
  objective: string;
  vitalSigns?: VitalSignsRecord;
  assessment: string;
  cid10Codes: Array<{
    code: string;
    description: string;
    authorizedByPatient: boolean;
  }>;
  plan: string;
  linkedPrescriptionIds: string[];
}

/**
 * Contrato de Prescrição e Evolução de Internação para o futuro Módulo Hospitalar.
 */
export interface HospitalAdmissionEntity {
  id: string;
  patientId: string;
  wardName: string;
  bedNumber: string;
  admissionDateIso: string;
  hospitalDayNumber: number;
  mainDiagnosisCid10: string;
  secondaryDiagnosesCid10: string[];
  allergiesVerified: boolean;
  dietOrders: Array<{
    id: string;
    route: 'oral' | 'enteral' | 'parenteral' | 'zero';
    description: string;
    observations?: string;
  }>;
  hydrationOrders: Array<{
    id: string;
    solutionName: string;
    volumeMl: number;
    infusionRateText: string;
    additivesText?: string;
  }>;
  medicationOrders: PrescriptionItem[];
  nursingCareOrders: string[];
  vteProphylaxisStatus: 'mechanical' | 'pharmacological' | 'contraindicated' | 'low_risk';
  vitalSignsHistory: VitalSignsRecord[];
  dischargeSummary?: {
    dischargedAtIso: string;
    outcome: 'improved' | 'transferred' | 'ama' | 'deceased';
    admissionSummary: string;
    hospitalCourseSummary: string;
    dischargeMedications: PrescriptionItem[];
    followUpInstructions: string;
  };
}

export interface ClinicalSessionSnapshot {
  activeModule: ClinicalModuleId;
  activeContext: WorkContext | null;
  encounter: ClinicalEncounterEntity;
}
