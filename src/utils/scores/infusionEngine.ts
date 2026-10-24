import type {
  InfusionCalculationResult,
  InfusionProtocol,
  TitrationStep,
} from './scoreTypes';

export const NOREPINEPHRINE_PROTOCOL: InfusionProtocol = {
  drugId: 'drug_noradrenalina',
  drugName: 'Noradrenalina (Hemitartarato de Norepinefrina)',
  standardSolution: {
    ampoules: '4 ampolas (16 mg = 16 mL)',
    diluent: 'Soro Glicosado a 5% (SG 5%) 234 mL',
    totalVolumeMl: 250,
    concentrationMcgMl: 64,
    mandatoryVehicleNotice:
      'Veículo MANDATÓRIO: SG 5% (pH ácido 3,5–5,0 protege contra oxidação rápida). Proibida infusão contínua prolongada em SF 0,9%.',
    indication:
      'Choque Séptico, Choque Vasoplégico e Choque Cardiogênico com hipotensão grave (PAM < 65 mmHg)',
  },
  concentratedSolution: {
    ampoules: '8 ampolas (32 mg = 32 mL)',
    diluent: 'Soro Glicosado a 5% (SG 5%) 218 mL',
    totalVolumeMl: 250,
    concentrationMcgMl: 128,
    mandatoryVehicleNotice:
      'Solução Concentrada (2x) para restrição hídrica severa, SDRA ou LRA oligúrica/anúrica.',
    indication: 'Restrição volêmica estrita / Choque refratário em altas doses',
  },
  doseUnit: 'mcg/kg/min',
  initialDose: 0.05,
  maintenanceDoseMin: 0.1,
  maintenanceDoseMax: 0.5,
  maxDose: 2.0,
  defaultDose: 0.1,
  isFixedDose: false,
  administrationRoute:
    'Acesso Venoso Central exclusivo (em emergência extrema fora da UTI, veia antecubital calibrosa por no máx. 2 a 4h até punção central)',
  containerCompatibility: 'qualquer',
  nursingPrecautions:
    'Fotossensível: proteger equipo se exposição solar direta. Trocar solução a cada 24h. Se extravasamento periférico, infiltrar Fentolamina 5 a 10 mg diluída em 10-15 mL de SF 0,9% no tecido subcutâneo isquêmico.',
  titrationAdvice:
    'Titular a cada 2 a 5 minutos para atingir meta de PAM >= 65 mmHg. Se dose >= 0,25 a 0,50 mcg/kg/min, associar Vasopressina (0,03 UI/min) e Hidrocortisona IV (200 mg/dia).',
  weaningCriteria:
    'Reduzir 0,02 a 0,05 mcg/kg/min a cada 15–30 min após estabilidade hemodinâmica sustentada >= 6h e clareamento de lactato.',
};

export const VASOPRESSIN_PROTOCOL: InfusionProtocol = {
  drugId: 'drug_vasopressina',
  drugName: 'Vasopressina (Hormônio Antidiurético Sintético)',
  standardSolution: {
    ampoules: '1 ampola (20 UI = 1 mL)',
    diluent: 'Soro Fisiológico 0,9% (SF 0,9%) ou SG 5% 99 mL',
    totalVolumeMl: 100,
    concentrationMcgMl: 0.2,
    mandatoryVehicleNotice:
      'Concentração padrão: 0,2 UI/mL (20 UI em 100 mL). Dose fixa INDEPENDENTE do peso corporal.',
    indication:
      'Vasopressor poupador de catecolaminas de 2ª linha no Choque Séptico (associar quando Noradrenalina >= 0,25–0,50 mcg/kg/min)',
  },
  concentratedSolution: {
    ampoules: '2 ampolas (40 UI = 2 mL)',
    diluent: 'SF 0,9% ou SG 5% 98 mL',
    totalVolumeMl: 100,
    concentrationMcgMl: 0.4,
    mandatoryVehicleNotice: 'Concentração dobrada: 0,4 UI/mL (40 UI em 100 mL).',
    indication: 'Restrição hídrica severa',
  },
  doseUnit: 'UI/min',
  initialDose: 0.01,
  maintenanceDoseMin: 0.01,
  maintenanceDoseMax: 0.03,
  maxDose: 0.04,
  defaultDose: 0.03,
  isFixedDose: true,
  administrationRoute: 'Acesso Venoso Central obrigatório',
  containerCompatibility: 'qualquer',
  nursingPrecautions:
    'Atenção rigorosa à perfusão de extremidades (risco de necrose digital), isquemia mesentérica e coronariana.',
  titrationAdvice:
    'Manter dose fixa contínua de 0,03 UI/min (9 mL/h na diluição de 0,2 UI/mL). Doses > 0,04 UI/min devem ser reservadas exclusivamente para salvamento devido ao risco de parada cardíaca e necrose esplâncnica.',
  weaningCriteria:
    'Desmamar apenas após redução da Noradrenalina para < 0,10–0,15 mcg/kg/min.',
};

export const DOBUTAMINE_PROTOCOL: InfusionProtocol = {
  drugId: 'drug_dobutamina',
  drugName: 'Dobutamina (Cloridrato de Dobutamina)',
  standardSolution: {
    ampoules: '1 ampola (250 mg = 20 mL)',
    diluent: 'SG 5% ou SF 0,9% 230 mL',
    totalVolumeMl: 250,
    concentrationMcgMl: 1000,
    mandatoryVehicleNotice:
      'Solução Padrão: 1.000 mcg/mL (1 mg/mL). Incompatível com soluções alcalinas (Bicarbonato de Sódio).',
    indication:
      'Choque Cardiogênico, Disfunção Miocárdica Séptica com baixo débito cardíaco persistente (SvcO2 < 70%)',
  },
  concentratedSolution: {
    ampoules: '2 ampolas (500 mg = 40 mL)',
    diluent: 'SG 5% ou SF 0,9% 210 mL',
    totalVolumeMl: 250,
    concentrationMcgMl: 2000,
    mandatoryVehicleNotice:
      'Solução Concentrada (2x): 2.000 mcg/mL (2 mg/mL) para congestão pulmonar/restrição volêmica.',
    indication: 'Choque Cardiogênico congestivo com restrição hídrica',
  },
  doseUnit: 'mcg/kg/min',
  initialDose: 2.5,
  maintenanceDoseMin: 2.5,
  maintenanceDoseMax: 15.0,
  maxDose: 20.0,
  defaultDose: 5.0,
  isFixedDose: false,
  administrationRoute: 'Acesso Venoso Central ou Periférico calibroso exclusivo',
  containerCompatibility: 'qualquer',
  nursingPrecautions:
    'A solução pode adquirir coloração levemente rosada com o tempo devido à leve oxidação do fármaco, sem perda de potência nas primeiras 24h.',
  titrationAdvice:
    'Iniciar a 2,5 a 5,0 mcg/kg/min e titular conforme débito cardíaco, SvcO2, lactato e janela ecocardiográfica. Suspender ou reduzir se taquiarritmia (FC > 130 bpm) ou piora da hipotensão.',
  weaningCriteria:
    'Reduzir 1 a 2 mcg/kg/min a cada 30–60 min monitorando perfusão periférica e diurese.',
};

export const NITROGLYCERIN_PROTOCOL: InfusionProtocol = {
  drugId: 'drug_nitroglicerina',
  drugName: 'Nitroglicerina (Tridil)',
  standardSolution: {
    ampoules: '1 ampola (50 mg = 10 mL)',
    diluent: 'SG 5% ou SF 0,9% 240 mL',
    totalVolumeMl: 250,
    concentrationMcgMl: 200,
    mandatoryVehicleNotice:
      'OBRIGATÓRIO Frasco de Vidro ou Polietileno (Ecoflac/PE) e equipo específico sem PVC (o PVC absorve até 40–80% da nitroglicerina ativa).',
    indication:
      'Edema Agudo de Pulmão Hipertensivo, Síndrome Coronariana Aguda com dor refratária, Emergência Hipertensiva',
  },
  doseUnit: 'mcg/min',
  initialDose: 5,
  maintenanceDoseMin: 10,
  maintenanceDoseMax: 100,
  maxDose: 200,
  defaultDose: 10,
  isFixedDose: true,
  administrationRoute: 'Acesso Venoso Central ou Periférico dedicado',
  containerCompatibility: 'vidro_polietileno_obrigatorio',
  nursingPrecautions:
    'Proibido uso de bolsas ou equipos comuns de PVC (cloreto de polivinila). Contraindicado absolutamente se uso de Sildenafila/Tadalafila nas últimas 24–48h ou infarto de ventrículo direito.',
  titrationAdvice:
    'Iniciar a 5 mcg/min (1,5 mL/h) e aumentar 5 a 10 mcg/min a cada 3 a 5 minutos até alívio da congestão pulmonar/angina ou redução de 20-25% da PAM.',
  weaningCriteria:
    'Desmamar gradualmente de 5 em 5 mcg/min após controle pressórico e transição para vasodilatadores orais.',
};

export const STANDARD_PROTOCOLS: Record<string, InfusionProtocol> = {
  drug_noradrenalina: NOREPINEPHRINE_PROTOCOL,
  noradrenalina: NOREPINEPHRINE_PROTOCOL,
  norepinephrine: NOREPINEPHRINE_PROTOCOL,
  drug_vasopressina: VASOPRESSIN_PROTOCOL,
  vasopressina: VASOPRESSIN_PROTOCOL,
  vasopressin: VASOPRESSIN_PROTOCOL,
  drug_dobutamina: DOBUTAMINE_PROTOCOL,
  dobutamina: DOBUTAMINE_PROTOCOL,
  dobutamine: DOBUTAMINE_PROTOCOL,
  drug_nitroglicerina: NITROGLYCERIN_PROTOCOL,
  nitroglicerina: NITROGLYCERIN_PROTOCOL,
  tridil: NITROGLYCERIN_PROTOCOL,
  nitroglycerin: NITROGLYCERIN_PROTOCOL,
};

export interface CalculateInfusionRateInput {
  protocol?: InfusionProtocol;
  drugId?: string;
  weightKg?: number;
  patientWeightKg?: number;
  dose: number;
  concentrationMcgPerMl?: number;
  useConcentrated?: boolean;
}

export function calculateInfusionRate(
  params: CalculateInfusionRateInput
): InfusionCalculationResult {
  const protocol: InfusionProtocol =
    params.protocol ??
    (params.drugId ? STANDARD_PROTOCOLS[params.drugId] : undefined) ??
    NOREPINEPHRINE_PROTOCOL;

  const weightKg = params.weightKg ?? params.patientWeightKg ?? 70;
  const dose = params.dose;

  if (weightKg <= 0 && !protocol.isFixedDose) {
    throw new Error('Patient weight (weightKg) must be greater than zero.');
  }
  if (dose < 0) {
    throw new Error('Dose cannot be negative.');
  }

  const solution =
    params.useConcentrated && protocol.concentratedSolution
      ? protocol.concentratedSolution
      : protocol.standardSolution;

  const concentration =
    params.concentrationMcgPerMl ?? solution.concentrationMcgMl;

  if (concentration <= 0) {
    throw new Error('Solution concentration must be greater than zero.');
  }

  let rawRateMlPerHour: number;
  if (
    protocol.isFixedDose ||
    protocol.doseUnit === 'UI/min' ||
    protocol.doseUnit === 'mcg/min'
  ) {
    rawRateMlPerHour = (dose * 60) / concentration;
  } else {
    rawRateMlPerHour = (dose * weightKg * 60) / concentration;
  }

  const rateMlPerHour = Number(rawRateMlPerHour.toFixed(1));
  const safetyAlerts: string[] = [];

  if (
    protocol.drugId === 'drug_noradrenalina' ||
    protocol.drugName.toLowerCase().includes('noradrenalina')
  ) {
    if (dose > 0.25) {
      safetyAlerts.push(
        'ALERTA DE CHOQUE REFRATÁRIO (Dose > 0,25 mcg/kg/min): Considerar associação imediata de Vasopressina (0,03 UI/min) como 2º vasopressor poupador de catecolaminas e Hidrocortisona IV (200 mg/dia = 50 mg 6/6h).'
      );
    }
    if (dose > 0.5) {
      safetyAlerts.push(
        'DOSE CRÍTICA ELEVADA (> 0,50 mcg/kg/min): Alto risco de vasoconstrição esplâncnica/digital severa e arritmias. Avaliar função miocárdica por ecocardiografia à beira do leito.'
      );
    }
  }

  if (
    protocol.drugId === 'drug_vasopressina' ||
    protocol.drugName.toLowerCase().includes('vasopressina')
  ) {
    if (dose > 0.03) {
      safetyAlerts.push(
        'ALERTA DE TETO TERAPÊUTICO: Doses de Vasopressina > 0,03–0,04 UI/min aumentam drasticamente o risco de isquemia mesentérica, necrose cutânea e queda do débito cardíaco.'
      );
    }
  }

  if (
    protocol.drugId === 'drug_dobutamina' ||
    protocol.drugName.toLowerCase().includes('dobutamina')
  ) {
    if (dose > 15) {
      safetyAlerts.push(
        'ALERTA DE TAQUIARRITMIA (> 15 mcg/kg/min): Risco acentuado de taquicardia sinusal/fibrilação atrial e aumento do consumo miocárdico de O2.'
      );
    }
  }

  if (dose > protocol.maxDose) {
    safetyAlerts.push(
      `DOSE ACIMA DO LIMITE MÁXIMO (${protocol.maxDose} ${protocol.doseUnit}): Revise a diluição e considere associação sinérgica de segunda droga vasoativa.`
    );
  }

  let containerAlert: string | undefined;
  if (protocol.containerCompatibility === 'vidro_polietileno_obrigatorio') {
    containerAlert =
      'OBRIGATÓRIO Frasco de Vidro ou Polietileno (Ecoflac) + Equipo livre de PVC (adsorção plástica de até 80% em PVC comum).';
    safetyAlerts.push(containerAlert);
  }

  if (solution.mandatoryVehicleNotice) {
    safetyAlerts.push(solution.mandatoryVehicleNotice);
  }

  return {
    rateMlPerHour,
    recommendedVehicle: `${solution.ampoules} + ${solution.diluent} (Volume Total: ${solution.totalVolumeMl} mL)`,
    containerAlert,
    safetyAlerts,
    formattedDose: `${dose} ${protocol.doseUnit}`,
    concentrationFormatted: `${concentration} ${protocol.doseUnit === 'UI/min' ? 'UI/mL' : 'mcg/mL'}`,
  };
}

export function calculateDoseFromRate(params: {
  rateMlPerHour: number;
  weightKg?: number;
  concentrationMcgPerMl: number;
  isFixedDose?: boolean;
}): number {
  const {
    rateMlPerHour,
    weightKg = 70,
    concentrationMcgPerMl,
    isFixedDose = false,
  } = params;
  if (concentrationMcgPerMl <= 0) return 0;

  if (isFixedDose) {
    return Number(((rateMlPerHour * concentrationMcgPerMl) / 60).toFixed(3));
  }
  if (weightKg <= 0) return 0;
  return Number(
    ((rateMlPerHour * concentrationMcgPerMl) / (weightKg * 60)).toFixed(3)
  );
}

export function generateTitrationMatrix(params: {
  protocol?: InfusionProtocol;
  weightKg: number;
  useConcentrated?: boolean;
  customDoses?: number[];
}): TitrationStep[] {
  const protocol = params.protocol ?? NOREPINEPHRINE_PROTOCOL;
  const solution =
    params.useConcentrated && protocol.concentratedSolution
      ? protocol.concentratedSolution
      : protocol.standardSolution;

  let doses = params.customDoses;
  if (!doses) {
    if (protocol.doseUnit === 'UI/min') {
      doses = [0.01, 0.02, 0.03, 0.04];
    } else if (protocol.doseUnit === 'mcg/min') {
      doses = [5, 10, 20, 40, 80, 120, 160, 200];
    } else if (protocol.drugName.toLowerCase().includes('dobutamina')) {
      doses = [2.5, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0];
    } else {
      doses = [0.05, 0.1, 0.2, 0.25, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0];
    }
  }

  return doses.map((dose) => {
    const calc = calculateInfusionRate({
      protocol,
      weightKg: params.weightKg,
      dose,
      concentrationMcgPerMl: solution.concentrationMcgMl,
      useConcentrated: params.useConcentrated,
    });

    const isWarning =
      dose > protocol.maintenanceDoseMax ||
      (protocol.drugId === 'drug_noradrenalina' && dose > 0.25);

    let label = 'Manutenção Usual';
    if (dose <= protocol.initialDose) {
      label = 'Dose Inicial';
    } else if (dose > protocol.maxDose) {
      label = 'Acima do Teto';
    } else if (isWarning) {
      label = 'Dose Alta / Alerta';
    }

    return {
      dose,
      rateMlPerHour: calc.rateMlPerHour,
      label,
      isWarning,
    };
  });
}
