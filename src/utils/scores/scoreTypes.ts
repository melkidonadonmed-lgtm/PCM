/**
 * Contratos de domínio estritos para o módulo integrado Scoreboard CDSS no PresCMed (PCM).
 * Compatível 100% com o catálogo monográfico `manifest.json` e `blocks/block_01..09.json`.
 * Zero dependências externas de runtime (sem Zod) e zero uso de `any`.
 */

export type ScoreInputValue = string | number | boolean | undefined;
export type ScoreInputRecord = Record<string, ScoreInputValue>;

// ==========================================
// 1. PROTOCOLOS DE INFUSÃO CONTÍNUA (BIC)
// ==========================================

export interface SolutionRecipe {
  ampoules: string;
  diluent: string;
  totalVolumeMl: number;
  concentrationMcgMl: number;
  mandatoryVehicleNotice?: string;
  indication?: string;
}

export type InfusionDoseUnit = 'mcg/kg/min' | 'UI/min' | 'mcg/min';

export interface InfusionProtocol {
  drugId?: string;
  drugName: string;
  standardSolution: SolutionRecipe;
  concentratedSolution?: SolutionRecipe;
  doseUnit: InfusionDoseUnit;
  initialDose: number;
  maintenanceDoseMin: number;
  maintenanceDoseMax: number;
  maxDose: number;
  defaultDose: number;
  isFixedDose: boolean;
  administrationRoute: string;
  containerCompatibility?: 'vidro_polietileno_obrigatorio' | 'qualquer';
  nursingPrecautions: string;
  titrationAdvice?: string;
  weaningCriteria?: string;
}

export interface InfusionCalculationParams {
  drugId: string;
  patientWeightKg: number;
  doseValue: number;
  concentrationMcgPerMl: number;
  isFixedDose?: boolean;
}

export interface InfusionCalculationResult {
  rateMlPerHour: number;
  recommendedVehicle: string;
  containerAlert?: string;
  safetyAlerts: string[];
  formattedDose: string;
  concentrationFormatted?: string;
}

export interface TitrationStep {
  dose: number;
  rateMlPerHour: number;
  label: string;
  isWarning?: boolean;
}

// ==========================================
// 2. RADAR FISIOLÓGICO (POLAR SVG 60FPS)
// ==========================================

export interface RadarAxis {
  id: string;
  label: string;
  system: string;
  unit?: string;
  baselineValue?: number;
  maxAxisValue?: number;
}

export type RadarAxisDefinition = RadarAxis;

// ==========================================
// 3. PARÂMETROS E OPÇÕES DO ESCORE
// ==========================================

export interface ParameterOption {
  id: string;
  label: string;
  pointValue: number;
  isNormalBaseline?: boolean;
  radarNormalizedValue: number;
  sortOrder: number;
  description?: string;
}

export type ParameterInputType =
  | 'single_choice'
  | 'boolean'
  | 'numeric_input'
  | 'pupil_reactivity';

export interface ParameterGroup {
  id: string;
  name: string;
  slug: string;
  inputType: ParameterInputType;
  unit?: string;
  radarAxisId: string;
  normalBaselineValue: number;
  maxAxisValue: number;
  sortOrder: number;
  options: ParameterOption[];
  helpText?: string;
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
}

// ==========================================
// 4. CONDUTAS CLÍNICAS E FAIXAS DE RISCO
// ==========================================

export interface PharmacologicalAction {
  id: string;
  drugName: string;
  dosage: string;
  route: string;
  frequency: string;
  dilutionInstructions?: string;
  renalAdjustment?: string;
  contraindications?: string;
  infusionProtocol?: InfusionProtocol;
}

export interface NonPharmacologicalAction {
  id: string;
  recommendationTitle: string;
  dispositionTarget: string;
  monitoringPlan: string;
  interventionalProcedure?: string;
  ventilatorySupport?: string;
  vascularAccess?: string;
  laboratoryPanel?: string;
}

export type RiskSeverityLevel = 'low' | 'intermediate' | 'high' | 'critical';

export interface RiskTier {
  id: string;
  label: string;
  severityLevel: RiskSeverityLevel;
  minScore: number;
  maxScore: number;
  statisticalOutcome: string;
  colorHex: string;
  pharmacologicalActions: PharmacologicalAction[];
  nonPharmacologicalActions: NonPharmacologicalAction[];
  infusionProtocol?: InfusionProtocol;
}

// ==========================================
// 5. CALCULADORA COMPLETA & BLOCO MONOGRÁFICO
// ==========================================

export type CalculationType =
  | 'additive_points'
  | 'continuous_formula'
  | 'branching_decision';

export interface Calculator {
  id: string;
  slug: string;
  name: string;
  acronym: string;
  version?: string;
  category?: string;
  subcategory?: string;
  categorySlug: string;
  categoryName?: string;
  moduleName?: string;
  description?: string;
  summary: string;
  clinicalObjective?: string;
  targetPopulation?: string;
  calculationType: CalculationType;
  formulaExpression?: string;
  evidenceSource: string;
  minPossibleScore: number;
  maxPossibleScore: number;
  baseScore?: number;
  ssc2021Warning?: boolean;
  clinicalWarning?: string;
  badge?: string;
  radarAxes: RadarAxis[];
  parameterGroups: ParameterGroup[];
  riskTiers: RiskTier[];
  pharmacologicalActions?: PharmacologicalAction[];
  nonPharmacologicalActions?: NonPharmacologicalAction[];
}

export type CalculatorDefinition = Calculator;
export type ClinicalTool = Calculator;

export interface BlockData {
  blockId: string;
  blockName: string;
  version: string;
  categorySlug?: string;
  description?: string;
  calculators: Calculator[];
}

export interface ManifestItem {
  id: string;
  slug: string;
  name: string;
  acronym: string;
  category?: string;
  subcategory?: string;
  categorySlug: string;
  categoryName: string;
  moduleName: string;
  description?: string;
  summary: string;
  synonyms?: string[];
  searchSynonyms: string[];
  calculationType: CalculationType;
  blockId?: string;
  blockFile: string;
  evidenceSource: string;
  badge?: string;
  hasInfusionProtocol?: boolean;
  starredDefault?: boolean;
}

export interface ScoreBlockMeta {
  blockId: string;
  blockName: string;
  shortLabel: string;
  icon: string;
  count: number;
}

// ==========================================
// 6. RESULTADO DO MOTOR DE CÁLCULO
// ==========================================

export interface CalculationResult {
  score?: number;
  rawScore: number;
  scoreFormatted: string;
  activeRiskTier: RiskTier;
  radarValues: Record<string, number>;
  radarPoints?: Record<string, number>;
  clinicalWarning?: string;
  sscWarning?: string;
  warnings?: string[];
}
