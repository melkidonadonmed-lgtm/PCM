export interface DoctorProfile {
  name: string;
  crm: string;
  crmState: string;
  specialty: string;
  rqe?: string;
  clinicName: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
  showSignature: boolean;
  signatureText?: string;
  stampText?: string;
}

export interface Patient {
  id: string;
  name: string;
  weightKg: number;
  weightCalcEnabled?: boolean;
  birthDate?: string;
  ageText?: string;
  gender: 'male' | 'female' | 'other';
  documentNumber?: string; // RG or CPF
  allergies: string[];
  motherName?: string;
  notes?: string;
  phone?: string;
}

export interface PediatricMedication {
  id: string;
  category: string;
  name: string;
  presentation: string;
  concentrationMgPerMl: number;
  standardDoseMgKg: number;
  maxDoseMg: number;
  unitType: 'drops' | 'ml' | 'mg' | 'fixed' | 'spray' | 'ampoule';
  frequency: string;
  route: string;
  observations: string;
  dropsPerMl?: number; // default is 20 drops per ml unless specified
  doseCustomLabel?: string;
  defaultDays?: number;
}

export interface AdultMedication {
  id: string;
  activeIngredient: string;
  tradeName: string;
  concentration: string;
  pharmaceuticalForm: string;
  adultPosology: string;
  pediatricDose?: string;
  observations?: string;
  category?: string;
  route?: string;
  defaultQuantity?: string;
  defaultFrequency?: string;
  isSpecialControl?: boolean;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  presentation: string;
  route: string; // Oral, Tópica, Inalatória, Injetável, Otológica, Oftálmica, Sublingual, Retal
  quantity: string; // ex: "1 frasco", "2 caixas", "30 comprimidos"
  doseCalculatedText: string; // ex: "18 gotas (0,9 mL)", "1 comprimido", "5 mL"
  frequencyText: string; // ex: "de 6 em 6 horas se dor ou febre"
  scheduleInterval: string; // "4/4h", "6/6h", "8/8h", "12/12h", "24/24h", "Dose Única", "Uso Contínuo", "S.O.S"
  scheduleTimes: string[]; // ex: ["06:00", "12:00", "18:00", "00:00"]
  durationDays?: number;
  instructions: string; // Detailed instructions
  isContinuous: boolean;
  isSpecialControl?: boolean; // Receita de controle especial (C1, B1, etc.)
  calculatedFromWeight?: number; // If calculated for a specific weight
}

export interface ExamItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  selected: boolean;
  urgency: 'routine' | 'urgent';
  clinicalIndication?: string;
}

export interface MedicalCertificate {
  id?: string;
  patientName: string;
  documentType?: 'RG' | 'CPF';
  documentNumber: string;
  birthDate?: string;
  daysOff: number;
  startDate: string;
  endDate: string;
  periodText: string; // "por motivo de saúde", "para fins de acompanhamento", "para fins de perícia"
  includeCID: boolean;
  cid10Code: string;
  cid10Description: string;
  observations: string;
  cityDateText?: string;
  date?: string;
}

export interface MedicalReferral {
  id?: string;
  patientName: string;
  documentNumber: string;
  destinationSpecialty: string;
  destinationInstitution?: string;
  reason: string;
  clinicalSummary: string;
  relevantExams: string;
  hypothesisCID: string;
  priority: 'eletivo' | 'prioritario' | 'urgente';
  date?: string;
}

export interface ClinicalProtocol {
  id: string;
  title: string;
  condition: string;
  ruleFormula: string;
  routeDilution: string;
  frequencyTime: string;
  clinicalNotes: string;
  calculateVolume: (weight: number) => { volumeText: string; detail: string; rate?: string };
}

// Decks de patologias (protocolos ambulatoriais acionáveis)
export interface ProtocolMedication {
  /** Referência opcional ao id em PEDIATRIC_MEDICATIONS para cálculo de dose por peso */
  pediatricMedId?: string;
  name: string;
  presentation: string;
  route: string; // Oral, Tópica, Inalatória, Injetável, etc.
  quantity: string; // ex: "1 frasco", "30 comprimidos"
  posology: string; // posologia de referência (texto exibido no card)
  frequencyText: string; // ex: "de 6 em 6 horas se dor ou febre"
  scheduleInterval: string; // "6/6h", "12/12h", "24/24h", "Dose Única", "Uso Contínuo", "S.O.S"
  durationDays?: number;
  isContinuous?: boolean;
  instructions?: string; // instruções extras para a prescrição
}

export interface PathologyProtocol {
  id: string;
  name: string;
  category: string; // grupo (ex: Infectológica, Cardiovascular)
  firstLineSummary: string; // resumo do tratamento de 1ª linha
  pediatricRelevant: boolean; // se contempla dose pediátrica por peso
  clinicalWarning?: string; // alerta clínico de segurança
  reference: string; // fonte de referência (ex: manual/protocolo do MS)
  medications: ProtocolMedication[];
}

export type ActiveTab = 
  | 'prescription' 
  | 'pediatric_calc' 
  | 'exams' 
  | 'certificate' 
  | 'referral' 
  | 'protocols'
  | 'editor'
  | 'print_preview' 
  | 'patients';

// Tipagem para os Contextos de Atendimento (Multi-Instituição)
export type InstitutionalSphere = 'municipal' | 'state' | 'private' | 'federal';

export type WatermarkType = 'none' | 'sus_single' | 'sus_double' | 'sus_triple' | 'rondonia' | 'custom';

export interface WorkContext {
  id: string; // ex: 'ctx-ubs-centro', 'ctx-policlinica-estadual'
  name: string; // "UBS Dr. Hamilton - Município" ou "Policlínica Oswaldo Cruz - Estado"
  sphere: InstitutionalSphere;
  clinicName: string;
  clinicAddress: string;
  cnes?: string;
  logoDataUrl?: string; // Imagem do Brasão/Logo (Base64 no IndexedDB)
  logoAlignment: 'left' | 'center' | 'right';
  secondaryLogoDataUrl?: string; // Segundo Brasão/Logo (ex: SUS à direita ou Brasão Municipal)
  secondaryLogoAlignment?: 'left' | 'center' | 'right';
  watermarkType?: WatermarkType;
  watermarkOpacity?: number; // 0.05 a 0.20 (padrão 0.09)
  documentFormatting: {
    headerType: 'standard' | 'minimal' | 'custom_logo';
    prescriptionViaCount: 1 | 2; // Ex: UBS 1 via simples; Policlínica 2 vias padrão
    showCnesOnHeader: boolean;
    referralModel: 'sus_regulation' | 'direct_ambulatory'; // Modelo de encaminhamento
    examHeaderTitle: string; // Ex: "SECRETARIA MUNICIPAL DE SAÚDE" vs "GOVERNO DO ESTADO"
  };
  customHeaderMarkdown?: string;
  customFooterMarkdown?: string;
  doctorCredentials: {
    crm: string;
    uf: string;
    rqe?: string;
    specialty?: string;
  };
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type LogoPosition = 'top-left' | 'top-center' | 'top-right' | 'header-left' | 'header-right' | 'free';

export interface DocumentHeaderConfig {
  doctorName?: string;
  doctorCrm?: string;
  doctorSpecialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  badgeText?: string;
  dateText?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showPatientBanner?: boolean;
  patientCustomText?: string;
  footerDocName?: string;
  footerCrm?: string;
  footerSpecialty?: string;
  footerSubtext?: string;
}

export interface DocumentLogoConfig {
  dataUrl?: string; // Logotipo Principal / Esquerdo
  position: LogoPosition;
  x?: number; // percentual horizontal 0-100 na folha A4
  y?: number; // percentual vertical 0-100 na folha A4
  size: 'sm' | 'md' | 'lg' | 'xl' | number;
  visible: boolean;
  // Suporte a Timbrado Duplo (Logotipo Secundário / Direito)
  secondaryDataUrl?: string;
  secondaryPosition?: LogoPosition;
  secondarySize?: 'sm' | 'md' | 'lg' | 'xl' | number;
  secondaryVisible?: boolean;
}

export type DocumentOrientation = 'portrait' | 'landscape';
export type DocumentViaLayout = '1-via' | '2-vias';

export interface SavedDocument {
  id: string;
  title: string;
  contentJson: any; // Estado do documento Tiptap
  contentHtml: string;
  contextId: string; // Vínculo com a UBS ou Policlínica ativa
  isTemplate: boolean; // Se é um modelo reutilizável
  headerConfig?: DocumentHeaderConfig;
  logoConfig?: DocumentLogoConfig;
  typography?: string;
  fontSize?: number;
  orientation?: DocumentOrientation;
  viaLayout?: DocumentViaLayout;
  createdAt: number;
  updatedAt: number;
}

export interface PrescriptionStyle {
  id: string;
  name: string;
  fontFamilyId: string;
  baseFontSize: number;
  pageOrientation: DocumentOrientation;
  viaLayout: DocumentViaLayout;
  showHeader: boolean;
  showFooter: boolean;
  watermarkType: WatermarkType;
  isCustom?: boolean;
}

export type { UnifiedMedication } from './data/medicationDatabase';

