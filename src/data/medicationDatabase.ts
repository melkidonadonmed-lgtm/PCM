import { ANALGESICS_AND_AINES } from './medications/analgesicsAndAntiInflammatories';
import { ANTIMICROBIALS_AND_ANTIPARASITICS } from './medications/antimicrobialsAndAntiparasitics';
import { CARDIO_AND_METABOLIC_MEDS } from './medications/cardioAndMetabolicMeds';
import { RESPIRATORY_GASTRO_AND_CNS_MEDS } from './medications/respiratoryGastroAndCnsMeds';

export interface UnifiedMedication {
  id: string;
  name: string;
  activeIngredient: string;
  route: string;
  category: 'analgesicos' | 'antibioticos' | 'cardio' | 'diabetes' | 'respiratorio' | 'gastro' | 'snc' | 'outros';
  defaultQuantity: string;
  defaultPosology: string;
  isSpecialControl?: boolean;
  isPediatric?: boolean;
  pediatricDoseMgKg?: number;
  pediatricConcentrationMgMl?: number;
  pediatricUnitType?: 'drops' | 'ml' | 'mg' | 'sache';
  pediatricMaxDoseMg?: number;
  pediatricDefaultDays?: number;
}

export const UNIFIED_MEDICATIONS: UnifiedMedication[] = [
  ...ANALGESICS_AND_AINES,
  ...ANTIMICROBIALS_AND_ANTIPARASITICS,
  ...CARDIO_AND_METABOLIC_MEDS,
  ...RESPIRATORY_GASTRO_AND_CNS_MEDS,
];

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Todos os Fármacos',
  analgesicos: 'Sintomáticos & AINEs',
  antibioticos: 'Antibióticos & Antiparasitários',
  cardio: 'Cardiovascular & HAS',
  diabetes: 'Diabetes & Endócrino',
  respiratorio: 'Respiratório & Alergia',
  gastro: 'Gastroenterologia',
  snc: 'SNC & Psiquiatria',
};

export {
  ANALGESICS_AND_AINES,
  ANTIMICROBIALS_AND_ANTIPARASITICS,
  CARDIO_AND_METABOLIC_MEDS,
  RESPIRATORY_GASTRO_AND_CNS_MEDS,
};
