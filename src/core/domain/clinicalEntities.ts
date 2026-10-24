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
    title: 'Módulo Hospitalar & Gestão de Pacientes',
    shortTitle: 'Hospitalar',
    description:
      'Gestão de leitos (EF/LT), admissão manual e multimodal via IA sem alucinação, evolução clínica inteligente (categorias fixas + livres), monitoramento longitudinal de exames, agente Conduta x Evolução, Chat Live e Agente Science.',
    iconName: 'local_hospital',
    status: 'active',
    requiresSecureBackend: false,
  },
] as const;

/**
 * Especialidade / Setor de adaptação do Modelo Padronizado de Evolução / Admissão.
 */
export type HospitalSpecialtyTemplate =
  | 'enfermaria_clinica'
  | 'ortopedia'
  | 'pediatria'
  | 'uti'
  | 'gineco_obstetricia'
  | 'cirurgia_geral';

/**
 * Hipótese Diagnóstica estruturada em árvore (1 - Doença + data / 1.1 - Subitem + data).
 */
export interface DiagnosticHypothesisItem {
  id: string;
  codeNumber: string; // ex: "1", "2"
  diseaseAndDate: string; // ex: "Pneumonia Comunitária Grave (20/10/2026)"
  cid10?: string;
  subItems: Array<{
    id: string;
    codeNumber: string; // ex: "1.1", "1.2"
    diseaseAndDate: string; // ex: "Insuficiência Respiratória Hipoxêmica (21/10/2026)"
  }>;
}

/**
 * Registro de Medicações e Dispositivos ("FEZ USO" e "EM USO" com tempo e data).
 */
export interface MedicationOrDeviceEntry {
  id: string;
  nameAndDetails: string; // ex: "Ceftriaxona 1g EV 12/12h" ou "Acesso Venoso Central (JID)"
  kind: 'medication' | 'device';
  durationAndDates: string; // ex: "D5 (20/10/2026 - atual)" ou "7 dias (10/10/2026 a 17/10/2026)"
  status: 'fez_uso' | 'em_uso';
}

/**
 * Linha cronológica de exames laboratoriais (ex: "xx/xx/xxxx: HB | HT | LEU | SEG | ... K+ | CL...").
 */
export interface HospitalLabPanelEntry {
  id: string;
  dateBr: string; // DD/MM/AAAA
  dateIso: string; // YYYY-MM-DD para ordenação estritamente cronológica
  markers: Record<string, number | string>; // ex: { HB: 11.4, HT: 34, LEU: 12800, SEG: 78, PLQ: 210000, CR: 1.4, UR: 58, NA: 138, K: 4.9, CL: 102, PCR: 64 }
  rawSummaryLine?: string;
  sourceQuote?: string; // Trecho literal da fonte quando importado via IA
}

/**
 * Registro cronológico de Exames de Imagem (data + modalidade + achados/laudo objetivo).
 */
export interface HospitalImagingExamEntry {
  id: string;
  dateBr: string; // DD/MM/AAAA
  dateIso: string; // YYYY-MM-DD
  examModalityAndRegion: string; // ex: "TC de Tórax sem contraste"
  findingsSummary: string; // ex: "Consolidação em lobo inferior direito com broncogramas aéreos; pequeno derrame pleural laminar ipsilateral."
}

/**
 * Categoria livre de evolução/exame físico específica por especialidade (Ortopedia, UTI, Pediatria, etc.).
 */
export interface CustomClinicalSection {
  id: string;
  title: string; // ex: "EXAME ORTOPÉDICO / NEUROVASCULAR" ou "PARÂMETROS VENTILATÓRIOS (VM)"
  content: string;
}

/**
 * Exame Físico sistematizado com categorias fixas + categorias livres por especialidade.
 */
export interface HospitalPhysicalExamSection {
  geral: string;
  ssvv: string;
  ar: string;
  ac: string;
  abd?: string;
  membrosEAnexos: string;
  customSections: CustomClinicalSection[];
}

/**
 * Snapshot diário auditável salvo na Linha do Tempo de Evolução do Leito.
 */
export interface HospitalEvolutionSnapshot {
  id: string;
  recordedAtIso: string;
  dateBr: string;
  dayNumber: number; // D1, D2...
  authorDoctorName: string;
  authorCrm: string;
  formattedText: string;
  evolution24hSummary: string;
  conductSummary: string[];
  vitalSigns?: VitalSignsRecord;
}

/**
 * Registro longitudinal de Escore Clínico e Estratificação de Risco vinculado ao Leito (MOD-03 <-> Scoreboard CDSS).
 */
export interface HospitalBedScoreEntry {
  id: string;
  dateBr: string; // DD/MM/AAAA
  dateIso: string; // YYYY-MM-DD para ordenação estritamente cronológica
  recordedAtIso: string; // ISO timestamp para desempate intraday
  calculatorId: string; // ex: "calc_qsofa", "calc_sofa", "calc_curb65"
  acronym: string; // ex: "qSOFA", "SOFA", "CURB-65"
  calculatorName: string; // ex: "Quick SOFA (Sepsis-3)"
  scoreNumeric: number; // valor numérico p/ curva SVG e cálculo de Delta
  scoreFormatted: string; // ex: "2" ou "3,5"
  minPossibleScore: number;
  maxPossibleScore: number;
  severityLevel: 'low' | 'intermediate' | 'high' | 'critical';
  riskLabel: string; // ex: "Alto Risco de Desfecho Desfavorável"
  findingsSummary?: string;
  recommendedConducts?: string[];
  infusionSummary?: string;
}

/**
 * Mensagem do Assistente Virtual do Leito / Agente Science / Live API.
 */
export interface HospitalBedChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'science';
  channel: 'bed_copilot' | 'science_protocol' | 'live_voice';
  content: string;
  createdAtIso: string;
  attachedFileName?: string;
  evidenceCitations?: string[];
}

/**
 * Entidade Completa do Leito e Evolução/Admissão Padronizada (MOD-03).
 */
export interface HospitalBedPatientRecord {
  id: string;
  wardAndBed: string; // EF/LT: ex. "110-15"
  wardName: string; // ex. "Enfermaria Clínica 110"
  specialtyTemplate: HospitalSpecialtyTemplate;
  patientNameOrInitials: string; // ID: Nome completo, iniciais ou prontuário
  medicalRecordNumber?: string;
  birthDateBr: string; // DN: DD/MM/AAAA
  ageYearsText: string; // Idade calculada em anos (ex: "64 A")
  cns: string; // CNS
  dihDateBr: string; // DIH: DD/MM/AAAA
  chiefComplaintQp: string; // QP: queixa principal sucinta e direta nas palavras do paciente
  diagnosticHypotheses: DiagnosticHypothesisItem[]; // HD: 1 e 1.1 (doença + data)
  historyPresentIllnessHda: string; // HDA: descrição estritamente cronológica até o presente momento
  allergiesText: string; // ALERGIAS
  serologiesText: string; // SOROLOGIAS
  pastMedicalHistoryHpp: string; // HPP
  familyAndSocialHistory: string[]; // HF/SOCIAL em tópicos (-)
  obstetricHistoryApplicable: boolean;
  obstetricHistoryText: string; // HISTÓRIA OBSTÉTRICA (se aplicável)
  previousMedicationsAndDevices: MedicationOrDeviceEntry[]; // FEZ USO: medicações e dispositivos, tempo e data
  currentMedicationsAndDevices: MedicationOrDeviceEntry[]; // EM USO: medicações e dispositivos, tempo e data
  labPanels: HospitalLabPanelEntry[]; // EXAMES LAB (cronológico)
  imagingExams: HospitalImagingExamEntry[]; // EXAMES DE IMAGEM (cronológico)
  scoreEntries?: HospitalBedScoreEntry[]; // ESCORES CLÍNICOS (cronológico)
  physicalExam: HospitalPhysicalExamSection; // EXAME FÍSICO (GERAL, SSVV, AR, AC, MEMBROS E ANEXOS + Categorias Livres)
  evolution24h: string; // EVOLUÇÃO 24H: SSVV 24h, comportamento, aspecto geral + visita + enfermaria + informações
  vitalSignsLatest?: VitalSignsRecord;
  dietApplicable: boolean;
  dietDescription: string; // DIETA (se aplicável)
  hydrationApplicable: boolean;
  hydrationDescription: string; // HIDRATAÇÃO (se aplicável: qual e por quanto tempo)
  consultationsList: string[]; // Pareceres (-)
  pendingItemsList: string[]; // PENDÊNCIAS (-)
  conductList: string[]; // CD (-)
  evolutionHistoryTimeline: HospitalEvolutionSnapshot[];
  chatMessages: HospitalBedChatMessage[];
  updatedAt: number;
}

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
