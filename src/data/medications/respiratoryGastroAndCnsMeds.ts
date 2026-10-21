import type { UnifiedMedication } from '../medicationDatabase';

export const RESPIRATORY_GASTRO_AND_CNS_MEDS: UnifiedMedication[] = [
  // ==========================================
  // 5. RESPIRATÓRIO, ASMA E ANTI-ALÉRGICOS
  // ==========================================
  {
    id: 'salbutamol-spray-100mcg',
    name: 'Sulfato de Salbutamol Spray 100mcg/dose (Aerolin)',
    activeIngredient: 'Sulfato de salbutamol',
    route: 'Uso Inalatória',
    category: 'respiratorio',
    defaultQuantity: '1 frasco spray (200 doses) + espaçador',
    defaultPosology: 'Inalar 2 a 4 jatos com espaçador em caso de falta de ar ou chiado no peito.'
  },
  {
    id: 'salbutamol-gotas-5mg',
    name: 'Sulfato de Salbutamol 5mg/mL solução para inalação (Aerolin Gotas)',
    activeIngredient: 'Sulfato de salbutamol',
    route: 'Uso Inalatória',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Fazer inalação com 10 a 20 gotas em 3mL SF 0,9% de 6 em 6 horas.',
    isPediatric: true,
    pediatricDoseMgKg: 0.15,
    pediatricConcentrationMgMl: 5,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 5
  },
  {
    id: 'ipratropio-gotas-0-25mg',
    name: 'Brometo de Ipratrópio 0,25mg/mL gotas (Atrovent)',
    activeIngredient: 'Brometo de ipratrópio',
    route: 'Uso Inalatória',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Fazer inalação com 20 a 40 gotas (crianças: 10 a 20 gotas) em 3mL SF 0,9% de 8/8h.',
    isPediatric: true,
    pediatricDoseMgKg: 0.05,
    pediatricConcentrationMgMl: 0.25,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 0.5
  },
  {
    id: 'budesonida-spray-nasal-50mcg',
    name: 'Budesonida Spray Nasal 32mcg / 50mcg / 64mcg / 100mcg (Busonid, Noex)',
    activeIngredient: 'Budesonida',
    route: 'Uso Nasal',
    category: 'respiratorio',
    defaultQuantity: '1 frasco spray (120 doses)',
    defaultPosology: 'Aplicar 1 a 2 jatos em cada narina 1 a 2 vezes ao dia.'
  },
  {
    id: 'budesonida-inalacao-0-25mg',
    name: 'Budesonida 0,25mg/mL / 0,50mg/mL suspensão para inalação (Pulmicort)',
    activeIngredient: 'Budesonida',
    route: 'Uso Inalatória',
    category: 'respiratorio',
    defaultQuantity: '20 flaconetes',
    defaultPosology: 'Fazer inalação com 1 flaconete (2mL) 1 a 2 vezes ao dia.'
  },
  {
    id: 'beclometasona-spray-250mcg',
    name: 'Dipropionato de Beclometasona 50mcg / 250mcg spray (Clenil HFA)',
    activeIngredient: 'Dipropionato de beclometasona',
    route: 'Uso Inalatória',
    category: 'respiratorio',
    defaultQuantity: '1 frasco spray (200 doses)',
    defaultPosology: 'Inalar 1 a 2 jatos de 12 em 12 horas com espaçador (lavar a boca após).'
  },
  {
    id: 'loratadina-10mg',
    name: 'Loratadina 10mg comprimido (Claritin)',
    activeIngredient: 'Loratadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '12 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia por 5 a 7 dias.'
  },
  {
    id: 'loratadina-xarope-1mg',
    name: 'Loratadina 1mg/mL xarope (Claritin Xarope)',
    activeIngredient: 'Loratadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (100 mL)',
    defaultPosology: 'Dar 5mL (< 30 kg) ou 10mL (≥ 30 kg) via oral 1 vez ao dia.',
    isPediatric: true,
    pediatricDoseMgKg: 0.2,
    pediatricConcentrationMgMl: 1,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 10
  },
  {
    id: 'desloratadina-5mg',
    name: 'Desloratadina 5mg comprimido (Desalex, Esalerg)',
    activeIngredient: 'Desloratadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'cetirizina-10mg',
    name: 'Cetirizina 10mg comprimido / gotas 10mg/mL (Zyrtec)',
    activeIngredient: 'Dicloridrato de cetirizina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '12 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (ou 20 gotas) 1 vez ao dia à noite.'
  },
  {
    id: 'dexclorfeniramina-2mg',
    name: 'Dexclorfeniramina 2mg comprimido (Polaramine)',
    activeIngredient: 'Maleato de dexclorfeniramina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas.'
  },
  {
    id: 'dexclorfeniramina-xarope',
    name: 'Dexclorfeniramina 0,4mg/mL xarope (Polaramine)',
    activeIngredient: 'Maleato de dexclorfeniramina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (120 mL)',
    defaultPosology: 'Tomar 5mL de 8 em 8 horas.',
    isPediatric: true,
    pediatricDoseMgKg: 0.15,
    pediatricConcentrationMgMl: 0.4,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 6
  },
  {
    id: 'hidroxizina-25mg',
    name: 'Hidroxizina 25mg comprimido (Hixizine)',
    activeIngredient: 'Cloridrato de hidroxizina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 8/8h ou à noite ao deitar.'
  },
  {
    id: 'acetilcisteina-600mg',
    name: 'Acetilcisteína 200mg / 600mg sachê efervescente (Fluimucil)',
    activeIngredient: 'Acetilcisteína',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '16 envelopes',
    defaultPosology: 'Dissolver 1 sachê em meio copo de água 1 vez ao dia (600mg) ou de 8/8h (200mg).'
  },
  {
    id: 'soro-fisiologico-spray-0-9',
    name: 'Cloreto de Sódio 0,9% spray nasal (Sorine, Rinosoro)',
    activeIngredient: 'Cloreto de sódio',
    route: 'Uso Nasal',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (50 mL)',
    defaultPosology: 'Aplicar 2 a 3 jatos em cada narina várias vezes ao dia.'
  },

  // ==========================================
  // 6. GASTROENTEROLOGIA E REIDRATAÇÃO
  // ==========================================
  {
    id: 'omeprazol-20mg',
    name: 'Omeprazol 20mg cápsula (Losec, Prilosec, Pratiprazol)',
    activeIngredient: 'Omeprazol magnésico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '56 cápsulas',
    defaultPosology: 'Tomar 1 cápsula pela manhã em jejum 30 minutos antes do café por 4 a 8 semanas.'
  },
  {
    id: 'pantoprazol-40mg',
    name: 'Pantoprazol 40mg comprimido (Pantozol)',
    activeIngredient: 'Pantoprazol sódico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido pela manhã em jejum 30 min antes do café.'
  },
  {
    id: 'domperidona-10mg',
    name: 'Domperidona 10mg comprimido (Motilium)',
    activeIngredient: 'Domperidona',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido 15 a 30 minutos antes das refeições (máx 3x/dia).'
  },
  {
    id: 'simeticona-gotas-75mg',
    name: 'Simeticona 75mg/mL gotas (Luftal)',
    activeIngredient: 'Simeticona',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Tomar 20 a 30 gotas (crianças: 5 a 10 gotas) de 8 em 8 horas se gases.',
    isPediatric: true,
    pediatricDoseMgKg: 1,
    pediatricConcentrationMgMl: 75,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 40
  },
  {
    id: 'sais-reidratacao-sro',
    name: 'Sais de Reidratação Oral (SRO) envelopes (Reidrat, Pedialyte)',
    activeIngredient: 'Cloreto de sódio + glicose + cloreto de potássio + citrato',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '6 envelopes',
    defaultPosology: 'Diluir 1 envelope em 1L de água tratada. Beber após cada evacuação líquida ou vômito.'
  },
  {
    id: 'sulfato-zinco-gotas-10mg',
    name: 'Sulfato de Zinco 10mg Zn elementar/mL gotas (Zincoquel, Bio-Zinco)',
    activeIngredient: 'Sulfato de zinco heptaidratado',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Lactentes < 6 meses: 10mg/dia; ≥ 6 meses: 20mg/dia por 10 a 14 dias seguidos.',
    isPediatric: true,
    pediatricDoseMgKg: 1,
    pediatricConcentrationMgMl: 10,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 20
  },
  {
    id: 'racecadotrila-100mg',
    name: 'Racecadotrila 100mg cápsulas (Tiorfan)',
    activeIngredient: 'Racecadotrila',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '9 cápsulas',
    defaultPosology: 'Tomar 1 cápsula de 8 em 8 horas antes das refeições até normalizar o trânsito.'
  },
  {
    id: 'racecadotrila-sache-30mg',
    name: 'Racecadotrila 10mg / 30mg sachês granulado (Tiorfan Pediátrico)',
    activeIngredient: 'Racecadotrila',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '16 sachês',
    defaultPosology: 'Dar 1,5mg/kg/dose dissolvido em água de 8 em 8 horas por até 5 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 1.5,
    pediatricConcentrationMgMl: 30,
    pediatricUnitType: 'mg',
    pediatricMaxDoseMg: 30
  },
  {
    id: 'lactulose-xarope',
    name: 'Lactulose 667mg/mL xarope (Lactulona)',
    activeIngredient: 'Lactulose',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '1 frasco (120 mL)',
    defaultPosology: 'Tomar 15 a 30 mL 1 a 2 vezes ao dia.'
  },
  {
    id: 'sulfato-ferroso-40mg',
    name: 'Sulfato Ferroso 40mg Fe elementar comprimido (Ferro)',
    activeIngredient: 'Sulfato ferroso',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos ao dia 1 hora antes do almoço com suco cítrico.'
  },
  {
    id: 'sulfato-ferroso-gotas-25mg',
    name: 'Sulfato Ferroso gotas (25mg Fe/mL = 1,25mg/gota)',
    activeIngredient: 'Sulfato ferroso',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '1 frasco (30 mL)',
    defaultPosology: 'Pediatria: 1 a 2 mg Fe/kg/dia profilático ou 3 a 5 mg Fe/kg/dia terapêutico.',
    isPediatric: true,
    pediatricDoseMgKg: 4,
    pediatricConcentrationMgMl: 25,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 60
  },

  // ==========================================
  // 7. SISTEMA NERVOSO CENTRAL, PSIQUIATRIA E CONTROLE ESPECIAL
  // ==========================================
  {
    id: 'fluoxetina-20mg',
    name: 'Cloridrato de Fluoxetina 20mg cápsula (Prozac, Daforin)',
    activeIngredient: 'Cloridrato de fluoxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula pela manhã após o café da manhã.',
    isSpecialControl: true
  },
  {
    id: 'sertralina-50mg',
    name: 'Cloridrato de Sertralina 50mg comprimido (Zoloft, Assert, Tolrest)',
    activeIngredient: 'Cloridrato de sertralina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral pela manhã (ou à noite).',
    isSpecialControl: true
  },
  {
    id: 'escitalopram-10mg',
    name: 'Oxalato de Escitalopram 10mg / 20mg (Lexapro, Exodus)',
    activeIngredient: 'Oxalato de escitalopram',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'amitriptilina-25mg',
    name: 'Cloridrato de Amitriptilina 25mg comprimido (Tryptanol, Amytril)',
    activeIngredient: 'Cloridrato de amitriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'diazepam-10mg',
    name: 'Diazepam 5mg / 10mg comprimido (Valium)',
    activeIngredient: 'Diazepam',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido à noite ou se crise de ansiedade aguda.',
    isSpecialControl: true
  },
  {
    id: 'clonazepam-2mg',
    name: 'Clonazepam 0,5mg / 2mg comprimido (Rivotril)',
    activeIngredient: 'Clonazepam',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'clonazepam-gotas-2-5mg',
    name: 'Clonazepam 2,5mg/mL gotas (Rivotril Gotas)',
    activeIngredient: 'Clonazepam',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar gotas prescritas (cada gota = 0,1mg) à noite com água.',
    isSpecialControl: true
  },
  {
    id: 'zolpidem-10mg',
    name: 'Hemitartarato de Zolpidem 10mg comprimido (Stilnox, Patz)',
    activeIngredient: 'Hemitartarato de zolpidem',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido imediatamente antes de deitar na cama (indutor do sono).',
    isSpecialControl: true
  },
  {
    id: 'pregabalina-75mg',
    name: 'Pregabalina 75mg / 150mg cápsulas (Lyrica, Dorene)',
    activeIngredient: 'Pregabalina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 a 2 vezes ao dia.',
    isSpecialControl: true
  },
  {
    id: 'carbamazepina-200mg',
    name: 'Carbamazepina 200mg / 400mg comprimido (Tegretol)',
    activeIngredient: 'Carbamazepina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 12 em 12 horas ou 8 em 8 horas.',
    isSpecialControl: true
  },
  {
    id: 'haloperidol-5mg',
    name: 'Haloperidol 1mg / 5mg comprimido (Haldol)',
    activeIngredient: 'Haloperidol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 8/8h ou 12/12h conforme indicação.',
    isSpecialControl: true
  },
  {
    id: 'risperidona-2mg',
    name: 'Risperidona 1mg / 2mg / 3mg comprimido (Risperdal)',
    activeIngredient: 'Risperidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido à noite ao deitar (ou 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'quetiapina-25mg',
    name: 'Quetiapina 25mg / 100mg / 200mg comprimido (Seroquel)',
    activeIngredient: 'Hemifumarato de quetiapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'cloridrato-metilfenidato-10mg',
    name: 'Cloridrato de Metilfenidato 10mg (Ritalina)',
    activeIngredient: 'Cloridrato de metilfenidato',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido 1 a 2 vezes ao dia (manhã e almoço).',
    isSpecialControl: true
  }
];

