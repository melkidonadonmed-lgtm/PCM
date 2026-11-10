import type { UnifiedMedication } from '../medicationDatabase';
import { CARDIO_BETABLOCKERS_LIPIDS_AND_ANTITHROMBOTICS_MEDS } from './cardioBetablockersLipidsAndAntithrombotics';
import { DIABETES_AND_INCRETINS_MEDS } from './diabetesAndIncretinsMeds';
import { THYROID_AND_VITAMINS_MEDS } from './thyroidAndVitaminsMeds';

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
    id: 'olmesartana-20mg',
    name: 'Olmesartana Medoxomila 20mg comprimido (Benicar 20mg)',
    activeIngredient: 'Olmesartana medoxomila',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'olmesartana-40mg',
    name: 'Olmesartana Medoxomila 40mg comprimido (Benicar 40mg)',
    activeIngredient: 'Olmesartana medoxomila',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'olmesartana-hctz-20-12-5',
    name: 'Olmesartana + Hidroclorotiazida 20+12,5mg comprimido (Benicar HCT 20/12,5)',
    activeIngredient: 'Olmesartana medoxomila + hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'olmesartana-hctz-40-12-5',
    name: 'Olmesartana + Hidroclorotiazida 40+12,5mg comprimido (Benicar HCT 40/12,5)',
    activeIngredient: 'Olmesartana medoxomila + hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'olmesartana-hctz-40-25',
    name: 'Olmesartana + Hidroclorotiazida 40+25mg comprimido (Benicar HCT 40/25)',
    activeIngredient: 'Olmesartana medoxomila + hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'olmesartana-anlodipino-20-5',
    name: 'Olmesartana + Anlodipino 20+5mg comprimido (Benicar Anlo 20/5)',
    activeIngredient: 'Olmesartana medoxomila + besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'olmesartana-anlodipino-40-5',
    name: 'Olmesartana + Anlodipino 40+5mg comprimido (Benicar Anlo 40/5)',
    activeIngredient: 'Olmesartana medoxomila + besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'olmesartana-anlodipino-40-10',
    name: 'Olmesartana + Anlodipino 40+10mg comprimido (Benicar Anlo 40/10)',
    activeIngredient: 'Olmesartana medoxomila + besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'valsartana-80mg',
    name: 'Valsartana 80mg comprimido (Diovan 80mg, Brasart)',
    activeIngredient: 'Valsartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'valsartana-160mg',
    name: 'Valsartana 160mg comprimido (Diovan 160mg, Brasart)',
    activeIngredient: 'Valsartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'valsartana-320mg',
    name: 'Valsartana 320mg comprimido (Diovan 320mg, Brasart)',
    activeIngredient: 'Valsartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'valsartana-anlodipino-160-5',
    name: 'Valsartana + Anlodipino 160+5mg comprimido (Exforge 160/5, Diovan Amlo)',
    activeIngredient: 'Valsartana + besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'valsartana-anlodipino-160-10',
    name: 'Valsartana + Anlodipino 160+10mg comprimido (Exforge 160/10, Diovan Amlo)',
    activeIngredient: 'Valsartana + besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'valsartana-hctz-160-12-5',
    name: 'Valsartana + Hidroclorotiazida 160+12,5mg comprimido (Diovan HCT 160/12,5)',
    activeIngredient: 'Valsartana + hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'valsartana-hctz-160-25',
    name: 'Valsartana + Hidroclorotiazida 160+25mg comprimido (Diovan HCT 160/25)',
    activeIngredient: 'Valsartana + hidroclorotiazida',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'candesartana-8mg',
    name: 'Candesartana Cilexetila 8mg comprimido (Atacand 8mg)',
    activeIngredient: 'Candesartana cilexetila',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia (ou de 12/12h na IC).'
  },
  {
    id: 'candesartana-16mg',
    name: 'Candesartana Cilexetila 16mg comprimido (Atacand 16mg)',
    activeIngredient: 'Candesartana cilexetila',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'candesartana-32mg',
    name: 'Candesartana Cilexetila 32mg comprimido (Atacand 32mg)',
    activeIngredient: 'Candesartana cilexetila',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'telmisartana-40mg',
    name: 'Telmisartana 40mg comprimido (Micardis 40mg)',
    activeIngredient: 'Telmisartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'telmisartana-80mg',
    name: 'Telmisartana 80mg comprimido (Micardis 80mg)',
    activeIngredient: 'Telmisartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'irbesartana-150mg',
    name: 'Irbesartana 150mg comprimido (Aprovel 150mg)',
    activeIngredient: 'Irbesartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'irbesartana-300mg',
    name: 'Irbesartana 300mg comprimido (Aprovel 300mg)',
    activeIngredient: 'Irbesartana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'enalapril-10mg',
    name: 'Maleato de Enalapril 10mg comprimido (Renitec 10mg)',
    activeIngredient: 'Maleato de enalapril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas (ou 1x ao dia).'
  },
  {
    id: 'enalapril-20mg',
    name: 'Maleato de Enalapril 20mg comprimido (Renitec 20mg)',
    activeIngredient: 'Maleato de enalapril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas (ou 1x ao dia).'
  },
  {
    id: 'enalapril-5mg',
    name: 'Maleato de Enalapril 5mg comprimido (Renitec 5mg)',
    activeIngredient: 'Maleato de enalapril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas.'
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
    id: 'ramipril-2-5mg',
    name: 'Ramipril 2,5mg comprimido (Triatec 2,5mg, Naprix)',
    activeIngredient: 'Ramipril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'ramipril-5mg',
    name: 'Ramipril 5mg comprimido (Triatec 5mg, Naprix)',
    activeIngredient: 'Ramipril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'ramipril-10mg',
    name: 'Ramipril 10mg comprimido (Triatec 10mg, Naprix)',
    activeIngredient: 'Ramipril',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'perindopril-4mg',
    name: 'Perindopril Erbumina 4mg comprimido (Coversyl 4mg)',
    activeIngredient: 'Perindopril erbumina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã antes da refeição.'
  },
  {
    id: 'perindopril-8mg',
    name: 'Perindopril Erbumina 8mg comprimido (Coversyl 8mg)',
    activeIngredient: 'Perindopril erbumina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã antes da refeição.'
  },
  {
    id: 'perindopril-arginina-5mg',
    name: 'Perindopril Arginina 5mg / 10mg comprimido (Acertil)',
    activeIngredient: 'Perindopril arginina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã antes do café.'
  },
  {
    id: 'lisinopril-10mg',
    name: 'Lisinopril 10mg comprimido (Zestril 10mg)',
    activeIngredient: 'Lisinopril di-hidratado',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'lisinopril-20mg',
    name: 'Lisinopril 20mg comprimido (Zestril 20mg)',
    activeIngredient: 'Lisinopril di-hidratado',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
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
    id: 'anlodipino-2-5mg',
    name: 'Besilato de Anlodipino 2,5mg comprimido (Cordarex 2,5mg)',
    activeIngredient: 'Besilato de anlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'levanlodipino-2-5mg',
    name: 'Besilato de Levanlodipino 2,5mg comprimido (Novanlo 2,5mg)',
    activeIngredient: 'Besilato de levanlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia (equivalente a 5mg de anlodipino racêmico com menor edema).'
  },
  {
    id: 'levanlodipino-5mg',
    name: 'Besilato de Levanlodipino 5mg comprimido (Novanlo 5mg)',
    activeIngredient: 'Besilato de levanlodipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia (equivalente a 10mg de anlodipino racêmico).'
  },
  {
    id: 'lercanidipino-10mg',
    name: 'Cloridrato de Lercanidipino 10mg comprimido (Zanidip 10mg)',
    activeIngredient: 'Cloridrato de lercanidipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia 15 minutos antes de uma refeição.'
  },
  {
    id: 'lercanidipino-20mg',
    name: 'Cloridrato de Lercanidipino 20mg comprimido (Zanidip 20mg)',
    activeIngredient: 'Cloridrato de lercanidipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia 15 minutos antes de uma refeição.'
  },
  {
    id: 'nifedipino-20mg-retard',
    name: 'Nifedipino 20mg comprimido liberação prolongada (Adalat Retard 20mg)',
    activeIngredient: 'Nifedipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas sem mastigar.'
  },
  {
    id: 'nifedipino-30mg-oros',
    name: 'Nifedipino 30mg / 60mg comprimido liberação controlada OROS (Adalat OROS)',
    activeIngredient: 'Nifedipino',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã sem partir ou mastigar.'
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
    name: 'Clortalidona 25mg comprimido (Higroton 25mg)',
    activeIngredient: 'Clortalidona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'clortalidona-12-5mg',
    name: 'Clortalidona 12,5mg comprimido (Higroton 12,5mg)',
    activeIngredient: 'Clortalidona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'clortalidona-50mg',
    name: 'Clortalidona 50mg comprimido (Higroton 50mg)',
    activeIngredient: 'Clortalidona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'indapamida-sr-1-5mg',
    name: 'Indapamida 1,5mg comprimido liberação prolongada SR (Natrilix SR)',
    activeIngredient: 'Indapamida',
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
    name: 'Espironolactona 25mg comprimido (Aldactone 25mg)',
    activeIngredient: 'Espironolactona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'espironolactona-50mg',
    name: 'Espironolactona 50mg comprimido (Aldactone 50mg)',
    activeIngredient: 'Espironolactona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'espironolactona-100mg',
    name: 'Espironolactona 100mg comprimido (Aldactone 100mg)',
    activeIngredient: 'Espironolactona',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  ...CARDIO_BETABLOCKERS_LIPIDS_AND_ANTITHROMBOTICS_MEDS,
  ...DIABETES_AND_INCRETINS_MEDS,
  ...THYROID_AND_VITAMINS_MEDS,
];
