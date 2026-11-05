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
  {
    id: 'metoprolol-succinato-50mg',
    name: 'Succinato de Metoprolol 50mg comprimido lib. controlada (Selozok 50mg)',
    activeIngredient: 'Succinato de metoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'metoprolol-succinato-25mg',
    name: 'Succinato de Metoprolol 25mg comprimido lib. controlada (Selozok 25mg)',
    activeIngredient: 'Succinato de metoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'metoprolol-succinato-100mg',
    name: 'Succinato de Metoprolol 100mg comprimido lib. controlada (Selozok 100mg)',
    activeIngredient: 'Succinato de metoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'nebivolol-5mg',
    name: 'Cloridrato de Nebivolol 5mg comprimido (Nebilet 5mg, Neblock)',
    activeIngredient: 'Cloridrato de nebivolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (ou meio comprimido = 2,5mg) via oral 1 vez ao dia.'
  },
  {
    id: 'bisoprolol-1-25mg',
    name: 'Fumarato de Bisoprolol 1,25mg comprimido (Concor 1,25mg)',
    activeIngredient: 'Fumarato de bisoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'bisoprolol-2-5mg',
    name: 'Fumarato de Bisoprolol 2,5mg comprimido (Concor 2,5mg)',
    activeIngredient: 'Fumarato de bisoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'bisoprolol-5mg',
    name: 'Fumarato de Bisoprolol 5mg comprimido (Concor 5mg)',
    activeIngredient: 'Fumarato de bisoprolol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'bisoprolol-10mg',
    name: 'Fumarato de Bisoprolol 10mg comprimido (Concor 10mg)',
    activeIngredient: 'Fumarato de bisoprolol',
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
    name: 'Carvedilol 12,5mg comprimido (Coreg 12,5mg, Cardilol)',
    activeIngredient: 'Carvedilol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas junto às refeições.'
  },
  {
    id: 'carvedilol-3-125mg',
    name: 'Carvedilol 3,125mg comprimido (Coreg 3,125mg, Cardilol)',
    activeIngredient: 'Carvedilol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas junto às refeições.'
  },
  {
    id: 'carvedilol-6-25mg',
    name: 'Carvedilol 6,25mg comprimido (Coreg 6,25mg, Cardilol)',
    activeIngredient: 'Carvedilol',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas junto às refeições.'
  },
  {
    id: 'carvedilol-25mg',
    name: 'Carvedilol 25mg comprimido (Coreg 25mg, Cardilol)',
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
    id: 'sacubitril-valsartana-24-26mg',
    name: 'Sacubitril + Valsartana 24/26mg (50mg) comprimido (Entresto 24/26mg)',
    activeIngredient: 'Sacubitril + valsartana sódica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas (respeitar washout de 36h após IECA).'
  },
  {
    id: 'sacubitril-valsartana-49-51mg',
    name: 'Sacubitril + Valsartana 49/51mg (100mg) comprimido (Entresto 49/51mg)',
    activeIngredient: 'Sacubitril + valsartana sódica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas.'
  },
  {
    id: 'sacubitril-valsartana-97-103mg',
    name: 'Sacubitril + Valsartana 97/103mg (200mg) comprimido (Entresto 97/103mg)',
    activeIngredient: 'Sacubitril + valsartana sódica',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas (dose alvo na ICFEr).'
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
    id: 'hidralazina-25mg',
    name: 'Cloridrato de Hidralazina 25mg / 50mg comprimido (Apresolina)',
    activeIngredient: 'Cloridrato de hidralazina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas.'
  },
  {
    id: 'clonidina-0-100mg',
    name: 'Cloridrato de Clonidina 0,100mg / 0,150mg / 0,200mg comprimido (Atensina)',
    activeIngredient: 'Cloridrato de clonidina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas ou de 8 em 8 horas.'
  },
  {
    id: 'doxazosina-2mg',
    name: 'Mesilato de Doxazosina 2mg / 4mg comprimido (Carduran, Unoprost)',
    activeIngredient: 'Mesilato de doxazosina',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia à noite ao deitar.'
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
    id: 'ezetimiba-10mg',
    name: 'Ezetimiba 10mg comprimido (Zetia, Posicor)',
    activeIngredient: 'Ezetimiba',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'rosuvastatina-ezetimiba-10-10mg',
    name: 'Rosuvastatina + Ezetimiba 10+10mg / 20+10mg comprimido (Trezen Duo, Zinpass Eze)',
    activeIngredient: 'Rosuvastatina cálcica + ezetimiba',
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
  {
    id: 'apixabana-5mg',
    name: 'Apixabana 2,5mg / 5mg comprimido (Eliquis)',
    activeIngredient: 'Apixabana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas.'
  },
  {
    id: 'dabigatrana-150mg',
    name: 'Etexilato de Dabigatrana 110mg / 150mg cápsula (Pradaxa)',
    activeIngredient: 'Etexilato de dabigatrana',
    route: 'Uso Oral',
    category: 'cardio',
    defaultQuantity: '60 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 12 em 12 horas com um copo de água.'
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
    id: 'metformina-500mg',
    name: 'Cloridrato de Metformina 500mg comprimido (Glifage 500mg)',
    activeIngredient: 'Cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 2 vezes ao dia junto às refeições.'
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
    id: 'metformina-750mg-xr',
    name: 'Cloridrato de Metformina 750mg XR lib. prolongada (Glifage XR 750mg)',
    activeIngredient: 'Cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral junto ao jantar.'
  },
  {
    id: 'metformina-1000mg-xr',
    name: 'Cloridrato de Metformina 1000mg (1g) XR lib. prolongada (Glifage XR 1g)',
    activeIngredient: 'Cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral junto ao jantar.'
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
    id: 'gliclazida-mr-60mg',
    name: 'Gliclazida MR 60mg liberação modificada (Diamicron MR 60mg)',
    activeIngredient: 'Gliclazida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral 1 vez ao dia junto ao café da manhã.'
  },
  {
    id: 'glimepirida-2mg',
    name: 'Glimepirida 1mg / 2mg / 4mg comprimido (Amaryl)',
    activeIngredient: 'Glimepirida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral imediatamente antes da primeira refeição principal.'
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
    id: 'pioglitazona-30mg',
    name: 'Cloridrato de Pioglitazona 15mg / 30mg / 45mg comprimido (Actos, Stanglit)',
    activeIngredient: 'Cloridrato de pioglitazona',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
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
    id: 'dapagliflozina-5mg',
    name: 'Dapagliflozina 5mg comprimido (Forxiga 5mg)',
    activeIngredient: 'Dapagliflozina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'dapagliflozina-metformina-10-1000mg',
    name: 'Dapagliflozina + Metformina XR 10/1000mg ou 5/1000mg (Xigduo XR)',
    activeIngredient: 'Dapagliflozina + cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia junto à refeição.'
  },
  {
    id: 'empagliflozina-10mg',
    name: 'Empagliflozina 10mg comprimido (Jardiance 10mg)',
    activeIngredient: 'Empagliflozina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'empagliflozina-25mg',
    name: 'Empagliflozina 25mg comprimido (Jardiance 25mg)',
    activeIngredient: 'Empagliflozina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'empagliflozina-linagliptina-25-5mg',
    name: 'Empagliflozina + Linagliptina 10/5mg ou 25/5mg comprimido (Glyxambi)',
    activeIngredient: 'Empagliflozina + linagliptina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.'
  },
  {
    id: 'sitagliptina-100mg',
    name: 'Fosfato de Sitagliptina 50mg / 100mg comprimido (Januvia)',
    activeIngredient: 'Fosfato de sitagliptina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'sitagliptina-metformina-50-1000mg',
    name: 'Sitagliptina + Metformina 50/850mg ou 50/1000mg comprimido (Janumet)',
    activeIngredient: 'Fosfato de sitagliptina + cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '56 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 2 vezes ao dia junto às refeições.'
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
    id: 'vildagliptina-metformina-50-1000mg',
    name: 'Vildagliptina + Metformina 50/850mg ou 50/1000mg comprimido (Galvus Met)',
    activeIngredient: 'Vildagliptina + cloridrato de metformina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '56 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 2 vezes ao dia junto às refeições.'
  },
  {
    id: 'linagliptina-5mg',
    name: 'Linagliptina 5mg comprimido (Trayenta)',
    activeIngredient: 'Linagliptina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia (não exige ajuste pela função renal).'
  },
  {
    id: 'alogliptina-25mg',
    name: 'Benzoato de Alogliptina 12,5mg / 25mg comprimido (Nesina)',
    activeIngredient: 'Benzoato de alogliptina',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'semaglutida-sc-0-25-0-5mg',
    name: 'Semaglutida 1,34mg/mL sistema de aplicação SC — doses 0,25mg e 0,5mg (Ozempic)',
    activeIngredient: 'Semaglutida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 sistema de aplicação (1,5 mL)',
    defaultPosology: 'Aplicar 0,25mg via subcutânea 1 vez por semana por 4 semanas; após, aumentar para 0,5mg SC 1 vez por semana.'
  },
  {
    id: 'semaglutida-sc-1mg',
    name: 'Semaglutida 1,34mg/mL sistema de aplicação SC — dose 1mg (Ozempic 1mg)',
    activeIngredient: 'Semaglutida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 sistema de aplicação (3 mL)',
    defaultPosology: 'Aplicar 1mg via subcutânea no abdome ou coxa 1 vez por semana, sempre no mesmo dia da semana.'
  },
  {
    id: 'semaglutida-wegovy-2-4mg',
    name: 'Semaglutida 0,25mg / 0,5mg / 1mg / 1,7mg / 2,4mg caneta injetável SC (Wegovy)',
    activeIngredient: 'Semaglutida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 sistemas de aplicação)',
    defaultPosology: 'Aplicar 1 dose via subcutânea 1 vez por semana conforme etapa de escalonamento mensal.'
  },
  {
    id: 'semaglutida-oral-3mg',
    name: 'Semaglutida 3mg comprimido oral (Rybelsus 3mg)',
    activeIngredient: 'Semaglutida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto ao acordar com até meio copo de água (120mL) e aguardar 30 min antes de comer.'
  },
  {
    id: 'semaglutida-oral-7mg',
    name: 'Semaglutida 7mg comprimido oral (Rybelsus 7mg)',
    activeIngredient: 'Semaglutida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto ao acordar com até meio copo de água e aguardar 30 min antes de comer.'
  },
  {
    id: 'semaglutida-oral-14mg',
    name: 'Semaglutida 14mg comprimido oral (Rybelsus 14mg)',
    activeIngredient: 'Semaglutida',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto ao acordar com até meio copo de água e aguardar 30 min antes de comer.'
  },
  {
    id: 'tirzepatida-2-5mg',
    name: 'Tirzepatida 2,5mg/0,5mL caneta injetável SC semanal (Mounjaro 2,5mg)',
    activeIngredient: 'Tirzepatida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas autoinjetoras)',
    defaultPosology: 'Aplicar 2,5mg via subcutânea 1 vez por semana durante 4 semanas (dose inicial de titulação).'
  },
  {
    id: 'tirzepatida-5mg',
    name: 'Tirzepatida 5mg/0,5mL caneta injetável SC semanal (Mounjaro 5mg)',
    activeIngredient: 'Tirzepatida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas autoinjetoras)',
    defaultPosology: 'Aplicar 5mg via subcutânea 1 vez por semana, sempre no mesmo dia da semana.'
  },
  {
    id: 'tirzepatida-7-5mg',
    name: 'Tirzepatida 7,5mg/0,5mL caneta injetável SC semanal (Mounjaro 7,5mg)',
    activeIngredient: 'Tirzepatida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas autoinjetoras)',
    defaultPosology: 'Aplicar 7,5mg via subcutânea 1 vez por semana.'
  },
  {
    id: 'tirzepatida-10mg',
    name: 'Tirzepatida 10mg/0,5mL caneta injetável SC semanal (Mounjaro 10mg)',
    activeIngredient: 'Tirzepatida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas autoinjetoras)',
    defaultPosology: 'Aplicar 10mg via subcutânea 1 vez por semana.'
  },
  {
    id: 'tirzepatida-12-5mg',
    name: 'Tirzepatida 12,5mg/0,5mL caneta injetável SC semanal (Mounjaro 12,5mg)',
    activeIngredient: 'Tirzepatida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas autoinjetoras)',
    defaultPosology: 'Aplicar 12,5mg via subcutânea 1 vez por semana.'
  },
  {
    id: 'tirzepatida-15mg',
    name: 'Tirzepatida 15mg/0,5mL caneta injetável SC semanal (Mounjaro 15mg)',
    activeIngredient: 'Tirzepatida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas autoinjetoras)',
    defaultPosology: 'Aplicar 15mg via subcutânea 1 vez por semana.'
  },
  {
    id: 'liraglutida-6mg-ml',
    name: 'Liraglutida 6mg/mL sistema de aplicação SC diário (Victoza, Saxenda)',
    activeIngredient: 'Liraglutida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '2 sistemas de aplicação (3 mL cada)',
    defaultPosology: 'Aplicar 0,6mg SC 1x ao dia por 1 semana, titulando semanalmente conforme tolerância (1,2mg a 1,8mg/dia no DM2).'
  },
  {
    id: 'dulaglutida-1-5mg',
    name: 'Dulaglutida 0,75mg / 1,5mg caneta injetável SC semanal (Trulicity)',
    activeIngredient: 'Dulaglutida',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caixa (4 canetas)',
    defaultPosology: 'Aplicar 1 caneta via subcutânea 1 vez por semana.'
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
    id: 'insulina-glargina-100ui',
    name: 'Insulina Glargina 100 UI/mL caneta / refil 3mL SC (Lantus, Basaglar)',
    activeIngredient: 'Insulina glargina',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '2 canetas / carpules (3 mL)',
    defaultPosology: 'Aplicar dose basal prescrita via subcutânea 1 vez ao dia, sempre no mesmo horário.'
  },
  {
    id: 'insulina-glargina-300ui',
    name: 'Insulina Glargina 300 UI/mL caneta preenchida SC (Toujeo)',
    activeIngredient: 'Insulina glargina',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '2 canetas preenchidas (1,5 mL)',
    defaultPosology: 'Aplicar dose basal prescrita via subcutânea 1 vez ao dia.'
  },
  {
    id: 'insulina-degludeca-100ui',
    name: 'Insulina Degludeca 100 UI/mL caneta preenchida 3mL SC (Tresiba)',
    activeIngredient: 'Insulina degludeca',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '1 caneta preenchida (3 mL)',
    defaultPosology: 'Aplicar dose basal prescrita via subcutânea 1 vez ao dia.'
  },
  {
    id: 'insulina-lispro-100ui',
    name: 'Insulina Lispro 100 UI/mL caneta / refil 3mL SC (Humalog) / Asparte (NovoRapid)',
    activeIngredient: 'Insulina lispro',
    route: 'Uso Subcutâneo',
    category: 'diabetes',
    defaultQuantity: '2 canetas / carpules (3 mL)',
    defaultPosology: 'Aplicar dose prandial via subcutânea imediatamente antes das refeições conforme glicemia capilar.'
  },

  // ==========================================
  // 4B. TIREOIDE — LEVOTIROXINA SÓDICA (TODAS AS DOSAGENS SUS E COMERCIAIS EXTRA-SUS)
  // ==========================================
  {
    id: 'levotiroxina-50mcg',
    name: 'Levotiroxina Sódica 50mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-12-5mcg',
    name: 'Levotiroxina Sódica 12,5mcg comprimido (Puran T4 12,5mcg)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-25mcg',
    name: 'Levotiroxina Sódica 25mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-37-5mcg',
    name: 'Levotiroxina Sódica 37,5mcg comprimido (Puran T4 37,5mcg)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-38mcg',
    name: 'Levotiroxina Sódica 38mcg comprimido (Levoid 38mcg)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-62-5mcg',
    name: 'Levotiroxina Sódica 62,5mcg comprimido (Puran T4 62,5mcg)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-75mcg',
    name: 'Levotiroxina Sódica 75mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-88mcg',
    name: 'Levotiroxina Sódica 88mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-100mcg',
    name: 'Levotiroxina Sódica 100mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-112mcg',
    name: 'Levotiroxina Sódica 112mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-125mcg',
    name: 'Levotiroxina Sódica 125mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-137mcg',
    name: 'Levotiroxina Sódica 137mcg comprimido (Synthroid 137mcg)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-150mcg',
    name: 'Levotiroxina Sódica 150mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-175mcg',
    name: 'Levotiroxina Sódica 175mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-200mcg',
    name: 'Levotiroxina Sódica 200mcg comprimido (Puran T4, Euthyrox, Synthroid, Levoid)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },
  {
    id: 'levotiroxina-300mcg',
    name: 'Levotiroxina Sódica 300mcg comprimido (Puran T4 300mcg)',
    activeIngredient: 'Levotiroxina sódica',
    route: 'Uso Oral',
    category: 'diabetes',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido em jejum absoluto com água, 30 a 60 minutos antes do café da manhã.'
  },

  // ==========================================
  // 4C. VITAMINAS — VITAMINA B12 (ORAL, SUBLINGUAL, INJETÁVEL) E VITAMINA D3 (GOTAS E CÁPSULAS)
  // ==========================================
  {
    id: 'vitamina-b12-mecobalamina-1000mcg-sl',
    name: 'Mecobalamina (Vitamina B12 ativa) 1000mcg comprimido sublingual (Dozemast, Mecobe, Cobi-12)',
    activeIngredient: 'Mecobalamina (vitamina B12)',
    route: 'Uso Sublingual',
    category: 'outros',
    defaultQuantity: '30 comprimidos sublinguais',
    defaultPosology: 'Colocar 1 comprimido sob a língua e deixar dissolver completamente 1 vez ao dia.'
  },
  {
    id: 'vitamina-b12-cianocobalamina-1000mcg-oral',
    name: 'Cianocobalamina (Vitamina B12) 1000mcg comprimido revestido oral',
    activeIngredient: 'Cianocobalamina (vitamina B12)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'citoneurin-5000-drageas',
    name: 'Vitamina B1 100mg + B6 100mg + B12 5000mcg drágeas (Citoneurin 5000 Oral)',
    activeIngredient: 'Nitrato de tiamina + cloridrato de piridoxina + cianocobalamina (vitamina B12)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '20 drágeas',
    defaultPosology: 'Tomar 1 drágea via oral de 12 em 12 horas ou de 8 em 8 horas após as refeições.'
  },
  {
    id: 'citoneurin-1000-drageas',
    name: 'Vitamina B1 100mg + B6 100mg + B12 1000mcg drágeas (Citoneurin 1000 Oral)',
    activeIngredient: 'Nitrato de tiamina + cloridrato de piridoxina + cianocobalamina (vitamina B12)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '20 drágeas',
    defaultPosology: 'Tomar 1 drágea via oral 1 a 3 vezes ao dia após as refeições.'
  },
  {
    id: 'citoneurin-5000-injetavel',
    name: 'Vitamina B12 5000mcg + B1 100mg + B6 100mg solução injetável IM (Citoneurin 5000 Injetável)',
    activeIngredient: 'Cianocobalamina (vitamina B12) + cloridrato de tiamina + cloridrato de piridoxina',
    route: 'Uso Intramuscular',
    category: 'outros',
    defaultQuantity: '3 doses (ampolas I + II)',
    defaultPosology: 'Aspirar o conteúdo das ampolas I e II na mesma seringa e aplicar IM profundo na região glútea a cada 2 ou 3 dias.'
  },
  {
    id: 'citoneurin-1000-injetavel',
    name: 'Vitamina B12 1000mcg + B1 100mg + B6 100mg solução injetável IM (Citoneurin 1000 Injetável)',
    activeIngredient: 'Cianocobalamina (vitamina B12) + cloridrato de tiamina + cloridrato de piridoxina',
    route: 'Uso Intramuscular',
    category: 'outros',
    defaultQuantity: '3 doses (ampolas I + II)',
    defaultPosology: 'Aspirar o conteúdo das ampolas I e II na mesma seringa e aplicar IM profundo na região glútea 1 a 2 vezes por semana.'
  },
  {
    id: 'cronobe-5000-injetavel',
    name: 'Cobalamina Cronoativa (Vitamina B12) 5000mcg ampola 2,5mL injetável IM (Cronobê 5000)',
    activeIngredient: 'Cobalamina cronoativa (vitamina B12)',
    route: 'Uso Intramuscular',
    category: 'outros',
    defaultQuantity: '2 ampolas (2,5 mL)',
    defaultPosology: 'Aplicar 1 ampola (2,5mL) por via exclusivamente intramuscular profunda a cada 7 dias (ou conforme esquema de reposição).'
  },
  {
    id: 'hidroxicobalamina-5000mcg-injetavel',
    name: 'Cloridrato de Hidroxicobalamina (Vitamina B12) 5000mcg ampola injetável IM (Rubranova 5000)',
    activeIngredient: 'Cloridrato de hidroxicobalamina (vitamina B12)',
    route: 'Uso Intramuscular',
    category: 'outros',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Aplicar 1 ampola IM profundo 1 a 2 vezes por semana conforme nível sérico de vitamina B12.'
  },
  {
    id: 'vitamina-d3-gotas-200ui',
    name: 'Colecalciferol (Vitamina D3) Gotas 200 UI/gota (3.300 UI/mL) solução oral (Addera D3 Gotas, DePura Kids)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Tomar 2 a 5 gotas (400 a 1.000 UI) via oral 1 vez ao dia.'
  },
  {
    id: 'vitamina-d3-gotas-500ui',
    name: 'Colecalciferol (Vitamina D3) Gotas 500 UI/gota (14.000 UI/mL) solução oral (DePura Gotas)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Tomar 2 a 4 gotas (1.000 a 2.000 UI) via oral 1 vez ao dia junto à refeição.'
  },
  {
    id: 'vitamina-d3-gotas-1000ui',
    name: 'Colecalciferol (Vitamina D3) Gotas 1.000 UI/gota solução oral (Addera D3 Gotas 1000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Tomar 1 a 2 gotas (1.000 a 2.000 UI) via oral 1 vez ao dia.'
  },
  {
    id: 'vitamina-d3-1000ui',
    name: 'Colecalciferol (Vitamina D3) 1.000 UI cápsula mole / comprimido (Addera D3 1000 UI, DePura 1000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez ao dia junto à principal refeição.'
  },
  {
    id: 'vitamina-d3-2000ui',
    name: 'Colecalciferol (Vitamina D3) 2.000 UI cápsula mole / comprimido (Addera D3 2000 UI, DePura 2000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez ao dia junto ao almoço.'
  },
  {
    id: 'vitamina-d3-4000ui',
    name: 'Colecalciferol (Vitamina D3) 4.000 UI cápsula mole / comprimido (Addera D3 4000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez ao dia junto ao almoço.'
  },
  {
    id: 'vitamina-d3-5000ui',
    name: 'Colecalciferol (Vitamina D3) 5.000 UI cápsula mole / comprimido (Addera D3 5000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez ao dia (ou conforme orientação médica) junto à refeição.'
  },
  {
    id: 'vitamina-d3-7000ui',
    name: 'Colecalciferol (Vitamina D3) 7.000 UI cápsula mole / comprimido (Addera D3 7000 UI, DePura 7000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '8 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez por semana junto ao almoço para manutenção.'
  },
  {
    id: 'vitamina-d3-8000ui',
    name: 'Colecalciferol (Vitamina D3) 8.000 UI cápsula / dose oral',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '8 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez por semana junto ao almoço.'
  },
  {
    id: 'vitamina-d3-10000ui',
    name: 'Colecalciferol (Vitamina D3) 10.000 UI cápsula mole / comprimido (Addera D3 10.000 UI, DePura 10.000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '8 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez por semana junto ao almoço.'
  },
  {
    id: 'vitamina-d3-14000ui',
    name: 'Colecalciferol (Vitamina D3) 14.000 UI / 15.000 UI cápsula mole (Addera D3 15.000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '8 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez por semana junto ao almoço.'
  },
  {
    id: 'vitamina-d3-20000ui',
    name: 'Colecalciferol (Vitamina D3) 20.000 UI cápsula mole',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '8 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez por semana (ou a cada 15 dias) junto ao almoço.'
  },
  {
    id: 'vitamina-d3-50000ui',
    name: 'Colecalciferol (Vitamina D3) 50.000 UI cápsula mole / comprimido (Addera D3 50.000 UI, DePura 50.000 UI)',
    activeIngredient: 'Colecalciferol (vitamina D3)',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '8 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez por semana durante 8 semanas (dose de ataque na deficiência de vitamina D).'
  },
  {
    id: 'calcio-vitamina-d3-500-400',
    name: 'Carbonato de Cálcio 500mg + Colecalciferol (Vitamina D3) 400 UI / 1000 UI comprimido (Os-Cal D, Calcitran D3)',
    activeIngredient: 'Carbonato de cálcio + colecalciferol',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 a 2 vezes ao dia junto às refeições.'
  },
  {
    id: 'tiamina-300mg',
    name: 'Cloridrato de Tiamina (Vitamina B1) 300mg comprimido (Benerva)',
    activeIngredient: 'Cloridrato de tiamina',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'acido-folico-5mg',
    name: 'Ácido Fólico (Vitamina B9) 5mg comprimido (Folacin, Endofolin)',
    activeIngredient: 'Ácido fólico',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'complexo-b-comp',
    name: 'Polivitamínico do Complexo B (B1, B2, B3, B5, B6, B12) comprimido (Beneroc, Hyplex B)',
    activeIngredient: 'Vitaminas do complexo B',
    route: 'Uso Oral',
    category: 'outros',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 a 2 vezes ao dia junto às refeições.'
  },
];
