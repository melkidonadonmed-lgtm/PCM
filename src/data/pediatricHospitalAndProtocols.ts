import { PediatricMedication, ClinicalProtocol } from '../types';

export const PEDIATRIC_HOSPITAL_EMERGENCY_AND_SUPPLEMENTS: PediatricMedication[] = [
  // Antibióticos Hospitalares Injetáveis
  {
    id: 'ceftriaxona-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Ceftriaxona Injetável (EV/IM)',
    presentation: 'Reconstituição 100 mg/mL (Frasco 1 g)',
    concentrationMgPerMl: 100.0,
    standardDoseMgKg: 50.0,
    maxDoseMg: 2000,
    unitType: 'ml',
    frequency: '24/24h (ou 12/12h em meningite)',
    route: 'Intravenoso / Intramuscular',
    observations: '50 a 100 mg/kg/dia em dose única ou fracionada 12/12h. Não coadministrar com soluções que contenham cálcio.',
    defaultDays: 7
  },
  {
    id: 'ampicilina-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Ampicilina Injetável (EV)',
    presentation: 'Reconstituição 100 mg/mL (Frasco 1 g)',
    concentrationMgPerMl: 100.0,
    standardDoseMgKg: 37.5,
    maxDoseMg: 2000,
    unitType: 'ml',
    frequency: '6/6h EV lento',
    route: 'Intravenoso',
    observations: '150 a 200 mg/kg/dia divididos a cada 6/6h (Meningite: 200-300 mg/kg/dia 4/4h ou 6/6h).',
    defaultDays: 7
  },
  {
    id: 'oxacilina-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Oxacilina Injetável (EV)',
    presentation: 'Reconstituição 50 mg/mL (Frasco 500 mg)',
    concentrationMgPerMl: 50.0,
    standardDoseMgKg: 37.5,
    maxDoseMg: 2000,
    unitType: 'ml',
    frequency: '6/6h EV lento em 15-30 min',
    route: 'Intravenoso',
    observations: '150 a 200 mg/kg/dia divididos a cada 6/6h EV. Droga de escolha para MSSA.',
    defaultDays: 7
  },
  {
    id: 'cefuroxima-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Cefuroxima Injetável (EV)',
    presentation: 'Reconstituição 75 mg/mL (Frasco 750 mg)',
    concentrationMgPerMl: 75.0,
    standardDoseMgKg: 33.33,
    maxDoseMg: 1500,
    unitType: 'ml',
    frequency: '8/8h EV em 30 min',
    route: 'Intravenoso',
    observations: '100 mg/kg/dia divididos em 3 doses (8/8h). Cefalosporina de 2ª geração.',
    defaultDays: 7
  },
  {
    id: 'cefalotina-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Cefalotina Injetável (EV)',
    presentation: 'Reconstituição 100 mg/mL (Frasco 1 g)',
    concentrationMgPerMl: 100.0,
    standardDoseMgKg: 25.0,
    maxDoseMg: 2000,
    unitType: 'ml',
    frequency: '6/6h EV lento',
    route: 'Intravenoso',
    observations: '100 mg/kg/dia divididos em 4 doses (6/6h). Profilaxia cirúrgica / infecções estafilocócicas.',
    defaultDays: 7
  },
  {
    id: 'clindamicina-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Clindamicina Injetável (EV)',
    presentation: '150 mg/mL (Ampola 4 mL = 600 mg)',
    concentrationMgPerMl: 150.0,
    standardDoseMgKg: 10.0,
    maxDoseMg: 600,
    unitType: 'ml',
    frequency: '6/6h ou 8/8h EV em 30 min',
    route: 'Intravenoso',
    observations: '30 a 40 mg/kg/dia divididos de 6/6h ou 8/8h. Infundir em no mínimo 30 min (nunca em bolus direto).',
    defaultDays: 7
  },
  {
    id: 'gentamicina-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Gentamicina Injetável (EV/IM)',
    presentation: '40 mg/mL (Ampola 2 mL = 80 mg)',
    concentrationMgPerMl: 40.0,
    standardDoseMgKg: 6.0,
    maxDoseMg: 300,
    unitType: 'ml',
    frequency: '24/24h dose única diária EV em 30-60 min',
    route: 'Intravenoso / Intramuscular',
    observations: '5 a 7,5 mg/kg/dia em dose única diária (24/24h). Monitorar função renal e hidratação.',
    defaultDays: 5
  },
  {
    id: 'amicacina-injetavel',
    category: 'Antibiótico Hospitalar',
    name: 'Amicacina Injetável (EV/IM)',
    presentation: '125 mg/mL (Ampola 2 mL = 250 mg)',
    concentrationMgPerMl: 125.0,
    standardDoseMgKg: 15.0,
    maxDoseMg: 1000,
    unitType: 'ml',
    frequency: '24/24h dose única diária EV em 30-60 min',
    route: 'Intravenoso / Intramuscular',
    observations: '15 a 20 mg/kg/dia 1x ao dia (24/24h) diluído em SG 5% ou SF 0,9%.',
    defaultDays: 5
  },

  // Emergência / Anafilaxia / PCR / Crupe
  {
    id: 'adrenalina-anafilaxia',
    category: 'Emergência',
    name: 'Adrenalina 1:1.000 (Anafilaxia - IM)',
    presentation: '1 mg/mL (1:1.000) pura',
    concentrationMgPerMl: 1.0,
    standardDoseMgKg: 0.01,
    maxDoseMg: 0.5,
    unitType: 'ml',
    frequency: 'Dose IM imediata (repetir após 5-15 min se refratário)',
    route: 'Intramuscular no Vasto Lateral da Coxa',
    observations: '0,01 mL/kg da ampola pura 1:1.000 (0,01 mg/kg; máx 0,3 mg em crianças pequenas e 0,5 mg em adolescentes).',
    defaultDays: 1
  },
  {
    id: 'adrenalina-pcr',
    category: 'Emergência',
    name: 'Adrenalina 1:10.000 (PCR - EV/IO)',
    presentation: '0.1 mg/mL (Diluição 1 mL adrenalina 1:1.000 + 9 mL SF 0,9%)',
    concentrationMgPerMl: 0.1,
    standardDoseMgKg: 0.01,
    maxDoseMg: 1.0,
    unitType: 'ml',
    frequency: 'A cada 3 a 5 minutos durante RCP',
    route: 'Intravenoso / Intraósseo em bolus rápido + flush de SF',
    observations: '0,1 mL/kg da solução diluída 1:10.000 (equivale a 0,01 mg/kg; máx 1 mg = 10 mL).',
    defaultDays: 1
  },
  {
    id: 'adrenalina-crupe',
    category: 'Emergência',
    name: 'Adrenalina 1:1.000 (Crupe / Laringite Inalação)',
    presentation: '1 mg/mL (1:1.000) pura',
    concentrationMgPerMl: 1.0,
    standardDoseMgKg: 0.5,
    maxDoseMg: 5.0,
    unitType: 'ml',
    frequency: 'Nebulização imediata com O2 a 6-8 L/min',
    route: 'Inalatória por Nebulização',
    observations: '0,5 mL/kg de adrenalina 1:1.000 pura (mínimo 3 mL, máx 5 mL) + SF 0,9% até completar 4-5 mL se necessário.',
    defaultDays: 1
  },
  {
    id: 'furosemida-injetavel',
    category: 'Emergência',
    name: 'Furosemida Injetável 10 mg/mL',
    presentation: '10 mg/mL (Ampola 2 mL = 20 mg)',
    concentrationMgPerMl: 10.0,
    standardDoseMgKg: 1.0,
    maxDoseMg: 40,
    unitType: 'ml',
    frequency: '12/12h ou 24/24h EV lento',
    route: 'Intravenoso lento em 2 minutos',
    observations: '1 a 2 mg/kg/dose EV lento (máx 40 mg = 4 mL por dose).',
    defaultDays: 1
  },

  // Suplementação Pediátrica
  {
    id: 'sulfato-ferroso-tratamento',
    category: 'Suplementação',
    name: 'Sulfato Ferroso Gotas (Tratamento de Anemia)',
    presentation: '25 mg Fe elementar/mL (1 gota = 1,25 mg Fe)',
    concentrationMgPerMl: 25.0,
    standardDoseMgKg: 4.0,
    maxDoseMg: 60,
    unitType: 'drops',
    dropsPerMl: 20,
    frequency: '1x ou 2x ao dia em jejum com suco cítrico',
    route: 'Oral',
    observations: '3 a 5 mg de Fe elementar/kg/dia por 3 a 6 meses. Administrar longe do leite.',
    defaultDays: 90
  },
  {
    id: 'sulfato-ferroso-prematuro',
    category: 'Suplementação',
    name: 'Sulfato Ferroso Gotas (Profilaxia Prematuro)',
    presentation: '25 mg Fe elementar/mL (1 gota = 1,25 mg Fe)',
    concentrationMgPerMl: 25.0,
    standardDoseMgKg: 2.0,
    maxDoseMg: 15,
    unitType: 'drops',
    dropsPerMl: 20,
    frequency: '24/24h a partir do 30º dia de vida',
    route: 'Oral',
    observations: '2 mg Fe elementar/kg/dia até os 2 anos de idade para prematuros e baixo peso (< 2.500 g).',
    defaultDays: 60
  },
  {
    id: 'sulfato-ferroso-termo',
    category: 'Suplementação',
    name: 'Sulfato Ferroso Gotas (Profilaxia Termo >= 2500g)',
    presentation: '25 mg Fe elementar/mL',
    concentrationMgPerMl: 25.0,
    standardDoseMgKg: 0,
    maxDoseMg: 12.5,
    unitType: 'drops',
    dropsPerMl: 20,
    frequency: '24/24h dose fixa profilática',
    route: 'Oral',
    observations: 'Dose fixa recomendada pela SBP: 10 gotas/dia (12,5 mg Fe) dos 6 aos 24 meses.',
    doseCustomLabel: '10 gotas (12,5 mg de Ferro elementar)',
    defaultDays: 60
  },
  {
    id: 'vitamina-d3-gotas',
    category: 'Suplementação',
    name: 'Vitamina D3 Gotas (200 UI/gota)',
    presentation: '200 UI por gota',
    concentrationMgPerMl: 10.0,
    standardDoseMgKg: 0,
    maxDoseMg: 0,
    unitType: 'fixed',
    frequency: '24/24h uma vez ao dia continuamente',
    route: 'Oral',
    observations: '0-12 meses: 400 UI/dia (2 gotas); 12-24 meses: 600 UI/dia (3 gotas). Profilaxia SBP.',
    doseCustomLabel: '2 a 3 gotas (400 a 600 UI/dia)',
    defaultDays: 90
  }
];

export const CLINICAL_PROTOCOLS: ClinicalProtocol[] = [
  {
    id: 'dengue-grupo-a',
    title: 'Dengue Grupo A (Ambulatorial)',
    condition: 'Sem sinais de alarme / Hidratação Oral',
    ruleFormula: '10-20 kg: 100 mL/kg/dia | >20 kg: 60 mL/kg/dia | Adulto: 60 mL/kg/dia',
    routeDilution: 'Oral fracionado: 1/3 SRO (Soro de Reidratação Oral) + 2/3 líquidos caseiros (água, água de coco, sucos)',
    frequencyTime: 'Fracionado continuamente ao longo do dia',
    clinicalNotes: 'Sintomáticos permitidos: Paracetamol e Dipirona. CONTRAINDICADO terminantemente: AINEs (Ibuprofeno, Cetoprofeno, Nimesulida) e AAS pelo alto risco hemorrágico.',
    calculateVolume: (weight: number) => {
      let totalMl = 0;
      if (weight <= 10) totalMl = weight * 130;
      else if (weight <= 20) totalMl = 1000 + (weight - 10) * 50;
      else totalMl = 1500 + (weight - 20) * 20;
      
      const sro = Math.round(totalMl / 3);
      const liquids = Math.round((totalMl * 2) / 3);
      return {
        volumeText: `${totalMl.toLocaleString('pt-BR')} mL/dia`,
        detail: `SRO: ${sro.toLocaleString('pt-BR')} mL + Líquidos caseiros: ${liquids.toLocaleString('pt-BR')} mL ao dia`,
        rate: `Aprox. ${Math.round(totalMl / 24)} mL/hora`
      };
    }
  },
  {
    id: 'dengue-grupo-c',
    title: 'Dengue Grupo C (Sinais de Alarme)',
    condition: 'Dor abdominal intensa, vômitos persistentes, hipotensão postural, sangramento de mucosa',
    ruleFormula: '10 mL/kg na 1ª hora (EV SF 0,9% ou Ringer Lactato)',
    routeDilution: 'Intravenoso em acesso calibroso com SF 0,9% puro',
    frequencyTime: 'Infundir o volume total calculado em exatamente 1 hora',
    clinicalNotes: 'Após 1 hora: reavaliar parâmetros clínicos e hematócrito. Se melhora clínica: 8 mL/kg/h nas 2h seguintes, reduzindo gradativamente. Se sem melhora: repetir fase de expansão.',
    calculateVolume: (weight: number) => {
      const vol = Math.round(weight * 10);
      return {
        volumeText: `${vol} mL em 1 hora`,
        detail: `Fase de expansão imediata com SF 0,9% ou RL (10 mL/kg)`,
        rate: `${vol} mL/h`
      };
    }
  },
  {
    id: 'dengue-grupo-d',
    title: 'Dengue Grupo D (Choque / Dengue Grave)',
    condition: 'Choque, pulso filiforme, TEC > 3s, PA convergente, sangramento grave',
    ruleFormula: '20 mL/kg em bolus rápido em 20 minutos',
    routeDilution: 'Intravenoso / Intraósseo em bolus rápido com SF 0,9% ou Ringer Lactato',
    frequencyTime: 'Infundir em 20 minutos (repetir até 3x se choque persistir)',
    clinicalNotes: 'Emergência crítica. Se choque refratário após 3 expansões de 20 mL/kg (total 60 mL/kg): transferir imediatamente para UTI Pediátrica e iniciar inotrópicos (adrenalina/noradrenalina).',
    calculateVolume: (weight: number) => {
      const vol = Math.round(weight * 20);
      return {
        volumeText: `${vol} mL em 20 minutos`,
        detail: `Bolus rápido 20 mL/kg. Repetir se TEC > 3s ou pulso fino (máx 3x)`,
        rate: `${vol * 3} mL/h equivalente`
      };
    }
  },
  {
    id: 'choque-septico',
    title: 'Ressuscitação no Choque Séptico Pediátrico',
    condition: 'Hipotensão, taquicardia desproporcional, alteração do sensório, extremidades frias',
    ruleFormula: '20 mL/kg de SF 0,9% ou Ringer Lactato em 10 a 20 minutos',
    routeDilution: 'EV ou IO em acesso rápido pressurizado',
    frequencyTime: 'Infundir em 10-20 min em alíquotas de 20 mL/kg',
    clinicalNotes: 'Reavaliar sinais de sobrecarga hídrica a cada alíquota (crepitações pulmonares, ritmo de galope, hepatomegalia). Se choque frio refratário: iniciar Epinefrina precoce.',
    calculateVolume: (weight: number) => {
      const vol = Math.round(weight * 20);
      return {
        volumeText: `${vol} mL em 10-20 min`,
        detail: `Etapa 1 de ressuscitação volêmica (20 mL/kg)`,
        rate: `Infusão rápida pressurizada`
      };
    }
  },
  {
    id: 'hipoglicemia-aguda',
    title: 'Correção de Hipoglicemia Aguda Pediátrica',
    condition: 'Glicemia capilar < 60 mg/dL (sintomático) ou convulsão hipoglicêmica',
    ruleFormula: '2 a 5 mL/kg de Soro Glicosado a 10% (SG 10%) em bolus lento',
    routeDilution: 'EV ou IO lento (2 a 3 mL/minuto)',
    frequencyTime: 'Bolus imediato em 5 a 10 minutos',
    clinicalNotes: 'NUNCA infundir SG 50% puro em veia periférica pediátrica (risco de flebite e esclerose venosa grave). Se só houver SG 50%: preparar SG 10% misturando 4 partes de água destilada com 1 parte de SG 50%.',
    calculateVolume: (weight: number) => {
      const minVol = Math.round(weight * 2);
      const maxVol = Math.round(weight * 5);
      return {
        volumeText: `${minVol} a ${maxVol} mL de SG 10%`,
        detail: `Bolus lento de SG 10% (2 a 5 mL/kg) seguido de soro de manutenção com TIG 4-6 mg/kg/min`,
        rate: `Infundir em 5-10 minutos`
      };
    }
  }
];
