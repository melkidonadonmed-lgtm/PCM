import type { UnifiedMedication } from '../medicationDatabase';

export const CARDIO_AND_METABOLIC_MEDS: UnifiedMedication[] = [
  // ==========================================
  // 3. CARDIOLOGIA, HIPERTENSÃO E ANTICOAGULAÇÃO
  // ==========================================
  {
    id: 'losartana-50mg',
    name: 'Losartana Potássica 50mg comprimido (Cozaar, Corus, Aradois)',
    activeIngredient: 'Losartana potássica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã (ou de 12/12h se necessário).'
  },
  {
    id: 'losartana-100mg',
    name: 'Losartana Potássica 100mg comprimido (Cozaar 100)',
    activeIngredient: 'Losartana potássica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'losartana-hctz-50-12',
    name: 'Losartana + Hidroclorotiazida 50+12,5mg / 100+25mg (Hyzaar)',
    activeIngredient: 'Losartana potássica + hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'enalapril-10mg',
    name: 'Maleato de Enalapril 10mg / 20mg comprimido (Renitec)',
    activeIngredient: 'Maleato de enalapril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas (ou 1x ao dia).'
  },
  {
    id: 'captopril-25mg',
    name: 'Captopril 25mg / 50mg comprimido (Capoten, Captosen)',
    activeIngredient: 'Captopril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 8/8h ou 12/12h 1 hora antes das refeições.'
  },
  {
    id: 'anlodipino-5mg',
    name: 'Besilato de Anlodipino 5mg comprimido (Norvasc, Cordarex)',
    activeIngredient: 'Besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia à noite.'
  },
  {
    id: 'anlodipino-10mg',
    name: 'Besilato de Anlodipino 10mg comprimido (Norvasc 10)',
    activeIngredient: 'Besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia à noite.'
  },
  {
    id: 'hidroclorotiazida-25mg',
    name: 'Hidroclorotiazida 25mg comprimido (Clorana)',
    activeIngredient: 'Hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'clortalidona-25mg',
    name: 'Clortalidona 12,5mg / 25mg / 50mg comprimido (Higroton)',
    activeIngredient: 'Clortalidona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'furosemida-40mg',
    name: 'Furosemida 40mg comprimido (Lasix)',
    activeIngredient: 'Furosemida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral pela manhã em jejum.'
  },
  {
    id: 'furosemida-ampola-20mg',
    name: 'Furosemida 10mg/mL ampola 2mL (20mg) (Lasix)',
    activeIngredient: 'Furosemida',
    route: 'Uso Intravenoso',
    category: 'cardio',
    defaultQuantity: '4 ampolas',
    defaultPosology: 'Infundir 20mg a 40mg IV lento em edema agudo de pulmão ou sobrecarga.'
  },
  {
    id: 'espironolactona-25mg',
    name: 'Espironolactona 25mg comprimido (Aldactone)',
    activeIngredient: 'Espironolactona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'metoprolol-succinato-50mg',
    name: 'Succinato de Metoprolol 25mg / 50mg / 100mg (Selozok)',
    activeIngredient: 'Succinato de metoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'atenolol-50mg',
    name: 'Atenolol 25mg / 50mg / 100mg comprimido (Ablok, Atenol)',
    activeIngredient: 'Atenolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'carvedilol-12-5mg',
    name: 'Carvedilol 3,125mg / 6,25mg / 12,5mg / 25mg (Coreg, Cardilol)',
    activeIngredient: 'Carvedilol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas junto às refeições.'
  },
  {
    id: 'propranolol-40mg',
    name: 'Propranolol 40mg comprimido (Inderal, Amprax)',
    activeIngredient: 'Cloridrato de propranolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas.'
  },
  {
    id: 'metildopa-250mg',
    name: 'Metildopa 250mg / 500mg comprimido (Aldomet)',
    activeIngredient: 'Metildopa',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 8 em 8 horas (1ª escolha na hipertensão gestacional).'
  },
  {
    id: 'sinvastatina-20mg',
    name: 'Sinvastatina 20mg / 40mg comprimido (Zocor, Sinvacor)',
    activeIngredient: 'Sinvastatina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia à noite ao deitar.'
  },
  {
    id: 'atorvastatina-20mg',
    name: 'Atorvastatina 10mg / 20mg / 40mg / 80mg (Citalor, Lipitor)',
    activeIngredient: 'Atorvastatina cálcica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia à noite.'
  },
  {
    id: 'rosuvastatina-20mg',
    name: 'Rosuvastatina 5mg / 10mg / 20mg / 40mg (Crestor)',
    activeIngredient: 'Rosuvastatina cálcica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'aas-100mg',
    name: 'Ácido Acetilsalicílico 100mg (Aspirina Prevent, Somalgin Cardio)',
    activeIngredient: 'Ácido acetilsalicílico',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral após o almoço para profilaxia cardiovascular.'
  },
  {
    id: 'clopidogrel-75mg',
    name: 'Clopidogrel 75mg comprimido (Plavix)',
    activeIngredient: 'Bissulfato de clopidogrel',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'varfarina-5mg',
    name: 'Varfarina Sódica 5mg comprimido (Marevan, Coumadin)',
    activeIngredient: 'Varfarina sódica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar dose titulada para manter RNI alvo entre 2,0 e 3,0.'
  },
  {
    id: 'rivaroxabana-20mg',
    name: 'Rivaroxabana 10mg / 15mg / 20mg (Xarelto)',
    activeIngredient: 'Rivaroxabana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia com alimentos.'
  },

  // ==========================================
  // 4. DIABETES, ENDOCRINOLOGIA E METABOLISMO
  // ==========================================
  {
    id: 'metformina-850mg',
    name: 'Cloridrato de Metformina 850mg (Glifage)',
    activeIngredient: 'Cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 2 vezes ao dia junto às principais refeições.'
  },
  {
    id: 'metformina-500mg-xr',
    name: 'Cloridrato de Metformina 500mg XR lib. prolongada (Glifage XR)',
    activeIngredient: 'Cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos ao jantar.'
  },
  {
    id: 'gliclazida-mr-30mg',
    name: 'Gliclazida MR 30mg liberação modificada (Diamicron MR)',
    activeIngredient: 'Gliclazida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral pela manhã antes do café.'
  },
  {
    id: 'glibenclamida-5mg',
    name: 'Glibenclamida 5mg comprimido (Daonil)',
    activeIngredient: 'Glibenclamida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral antes do café da manhã.'
  },
  {
    id: 'dapagliflozina-10mg',
    name: 'Dapagliflozina 10mg comprimido (Forxiga)',
    activeIngredient: 'Dapagliflozina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'empagliflozina-25mg',
    name: 'Empagliflozina 10mg / 25mg comprimido (Jardiance)',
    activeIngredient: 'Empagliflozina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'vildagliptina-50mg',
    name: 'Vildagliptina 50mg comprimido (Galvus)',
    activeIngredient: 'Vildagliptina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '56 comprimidos',
    defaultPosology: 'Tomar 1 comprimido 2 vezes ao dia.'
  },
  {
    id: 'insulina-nph-100ui',
    name: 'Insulina Humana NPH 100 UI/mL frasco 10mL / refil (Humulin N, Novolin N)',
    activeIngredient: 'Insulina humana NPH',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Aplicar dose prescrita SC pela manhã (e antes do jantar) com seringa/caneta.'
  },
  {
    id: 'insulina-regular-100ui',
    name: 'Insulina Humana Regular 100 UI/mL frasco 10mL (Humulin R, Novolin R)',
    activeIngredient: 'Insulina humana regular',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Aplicar dose prescrita SC 30 min antes das refeições.'
  },
  {
    id: 'levotiroxina-50mcg',
    name: 'Levotiroxina Sódica 25mcg / 50mcg / 75mcg / 100mcg (Puran T4, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
];

