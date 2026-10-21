import type { UnifiedMedication } from '../medicationDatabase';

export const ANTIMICROBIALS_AND_ANTIPARASITICS: UnifiedMedication[] = [
  // ==========================================
  // 2. ANTIBIÓTICOS, ANTIFÚNGICOS E ANTIPARASITÁRIOS
  // ==========================================
  {
    id: 'amoxicilina-500mg',
    name: 'Amoxicilina 500mg cápsulas (Amoxil, Novocilin)',
    activeIngredient: 'Amoxicilina tri-hidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 8 em 8 horas durante 7 a 10 dias.'
  },
  {
    id: 'amoxicilina-875mg',
    name: 'Amoxicilina 875mg comprimido (Novocilin 875)',
    activeIngredient: 'Amoxicilina tri-hidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas durante 7 a 10 dias.'
  },
  {
    id: 'amoxicilina-susp-250mg',
    name: 'Amoxicilina 250mg/5mL suspensão oral (Amoxil, Novocilin)',
    activeIngredient: 'Amoxicilina tri-hidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '2 frascos (150 mL)',
    defaultPosology: 'Dar dose pediátrica calculada (50mg/kg/dia) de 8 em 8 horas por 10 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 50,
    pediatricConcentrationMgMl: 50,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 1500,
    pediatricDefaultDays: 10
  },
  {
    id: 'amoxicilina-susp-400mg',
    name: 'Amoxicilina 400mg/5mL suspensão oral (Novocilin 400)',
    activeIngredient: 'Amoxicilina tri-hidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '1 frasco (100 mL)',
    defaultPosology: 'Dar dose calculada de 12 em 12 horas durante 10 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 50,
    pediatricConcentrationMgMl: 80,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 1500,
    pediatricDefaultDays: 10
  },
  {
    id: 'amox-clav-875mg',
    name: 'Amoxicilina + Clavulanato 875/125mg (Clavulin BD)',
    activeIngredient: 'Amoxicilina + clavulanato de potássio',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas durante 7 a 10 dias.'
  },
  {
    id: 'amox-clav-500mg',
    name: 'Amoxicilina + Clavulanato 500/125mg (Clavulin)',
    activeIngredient: 'Amoxicilina + clavulanato de potássio',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '21 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 7 a 10 dias.'
  },
  {
    id: 'amox-clav-susp-400mg',
    name: 'Amoxicilina + Clavulanato 400/57mg/5mL suspensão (Clavulin BD)',
    activeIngredient: 'Amoxicilina + clavulanato de potássio',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '2 frascos (70 mL)',
    defaultPosology: 'Dar dose calculada (45 a 90 mg/kg/dia) de 12 em 12 horas por 10 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 50,
    pediatricConcentrationMgMl: 80,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 1750,
    pediatricDefaultDays: 10
  },
  {
    id: 'amox-clav-susp-250mg',
    name: 'Amoxicilina + Clavulanato 250/62,5mg/5mL suspensão (Clavulin)',
    activeIngredient: 'Amoxicilina + clavulanato de potássio',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '2 frascos (75 mL)',
    defaultPosology: 'Dar dose calculada de 8 em 8 horas durante 10 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 50,
    pediatricConcentrationMgMl: 50,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 1500,
    pediatricDefaultDays: 10
  },
  {
    id: 'cefalexina-500mg',
    name: 'Cefalexina 500mg comprimido / cápsula (Keflex, Cefagel)',
    activeIngredient: 'Cefalexina monoidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '28 cápsulas',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas durante 7 a 10 dias.'
  },
  {
    id: 'cefalexina-susp-250mg',
    name: 'Cefalexina 250mg/5mL suspensão oral (Keflex)',
    activeIngredient: 'Cefalexina monoidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '2 frascos (100 mL)',
    defaultPosology: 'Dar dose calculada (50mg/kg/dia) de 6 em 6 horas durante 7 a 10 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 50,
    pediatricConcentrationMgMl: 50,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 2000,
    pediatricDefaultDays: 10
  },
  {
    id: 'ceftriaxona-1g-injetavel',
    name: 'Ceftriaxona 1g frasco-ampola IV/IM (Rocefin)',
    activeIngredient: 'Ceftriaxona dissódica',
    route: 'Uso Intravenoso',
    category: 'antibioticos',
    defaultQuantity: '3 frascos-ampola',
    defaultPosology: 'Adulto: 1g a 2g IV/IM 1x ao dia. Pediatria: 50 a 80 mg/kg/dia 1x ao dia.',
    isPediatric: true,
    pediatricDoseMgKg: 50,
    pediatricConcentrationMgMl: 100,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 2000
  },
  {
    id: 'azitromicina-500mg',
    name: 'Azitromicina 500mg comprimido (Zitromax, Astro)',
    activeIngredient: 'Azitromicina di-hidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '5 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia durante 5 dias (ou dose única de 1g para DST).'
  },
  {
    id: 'azitromicina-susp-200mg',
    name: 'Azitromicina 200mg/5mL suspensão oral (Astro, Zitromax)',
    activeIngredient: 'Azitromicina di-hidratada',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '1 frasco (600 mg)',
    defaultPosology: 'Dar dose pediátrica calculada (10mg/kg/dia) 1x ao dia por 5 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 10,
    pediatricConcentrationMgMl: 40,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 500,
    pediatricDefaultDays: 5
  },
  {
    id: 'claritromicina-500mg',
    name: 'Claritromicina 500mg comprimido (Klaricid)',
    activeIngredient: 'Claritromicina',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '14 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas por 7 a 10 dias.'
  },
  {
    id: 'ciprofloxacino-500mg',
    name: 'Ciprofloxacino 500mg comprimido (Cipro)',
    activeIngredient: 'Cloridrato de ciprofloxacino',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '14 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas por 7 a 14 dias.'
  },
  {
    id: 'levofloxacino-500mg',
    name: 'Levofloxacino 500mg comprimido (Levaquin, Tamiram)',
    activeIngredient: 'Levofloxacino hemi-hidratado',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia por 7 a 10 dias.'
  },
  {
    id: 'bactrim-f-comprimido',
    name: 'Sulfametoxazol + Trimetoprima 800+160mg comprimido (Bactrim F)',
    activeIngredient: 'Sulfametoxazol + trimetoprima',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas por 7 a 14 dias.'
  },
  {
    id: 'bactrim-susp-oral',
    name: 'Sulfametoxazol + Trimetoprima 200+40mg/5mL suspensão (Bactrim)',
    activeIngredient: 'Sulfametoxazol + trimetoprima',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '1 frasco (100 mL)',
    defaultPosology: 'Dar dose calculada (40mg SMZ + 8mg TMP/kg/dia) de 12/12h por 7 a 10 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 40,
    pediatricConcentrationMgMl: 40,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 800,
    pediatricDefaultDays: 10
  },
  {
    id: 'nitrofurantoina-100mg',
    name: 'Nitrofurantoína 100mg cápsulas (Macrodantina)',
    activeIngredient: 'Nitrofurantoína',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '28 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 6 em 6 horas junto às refeições por 5 dias.'
  },
  {
    id: 'fosfomicina-3g',
    name: 'Fosfomicina Trometamol 3g envelope (Monuril)',
    activeIngredient: 'Fosfomicina trometamol',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '1 envelope',
    defaultPosology: 'Diluir em meio copo de água e tomar à noite com bexiga vazia em dose única.'
  },
  {
    id: 'metronidazol-400mg',
    name: 'Metronidazol 400mg comprimido (Flagyl)',
    activeIngredient: 'Metronidazol',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '24 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 7 dias (PROIBIDO ÁLCOOL).'
  },
  {
    id: 'clindamicina-300mg',
    name: 'Clindamicina 300mg cápsulas (Dalacin C)',
    activeIngredient: 'Cloridrato de clindamicina',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '32 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 6 em 6 horas por 7 a 10 dias.'
  },
  {
    id: 'doxiciclina-100mg',
    name: 'Doxiciclina 100mg comprimido (Vibramicina, Doxiclin)',
    activeIngredient: 'Hiclato de doxiciclina',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '15 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas após refeições por 7 a 14 dias.'
  },
  {
    id: 'benzetacil-1200000',
    name: 'Benzilpenicilina Benzatina 1.200.000 UI (Benzetacil)',
    activeIngredient: 'Benzilpenicilina benzatina',
    route: 'Uso Intramuscular',
    category: 'antibioticos',
    defaultQuantity: '1 frasco-ampola',
    defaultPosology: 'Aplicar 1 ampola (1.200.000 UI) IM profundo em dose única.'
  },
  {
    id: 'benzetacil-600000',
    name: 'Benzilpenicilina Benzatina 600.000 UI (Benzetacil Infantil)',
    activeIngredient: 'Benzilpenicilina benzatina',
    route: 'Uso Intramuscular',
    category: 'antibioticos',
    defaultQuantity: '1 frasco-ampola',
    defaultPosology: 'Aplicar 1 ampola (600.000 UI) IM profundo para crianças < 27 kg.'
  },
  {
    id: 'fluconazol-150mg',
    name: 'Fluconazol 150mg cápsula (Zoltec)',
    activeIngredient: 'Fluconazol',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '2 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral em dose única (ou 1x por semana conforme indicação).'
  },
  {
    id: 'nistatina-susp-oral',
    name: 'Nistatina 100.000 UI/mL suspensão oral (Micostatin, Canditrat)',
    activeIngredient: 'Nistatina',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '1 frasco (50 mL)',
    defaultPosology: 'Bochechar e engolir 4 a 6 mL de 6 em 6 horas por 7 a 14 dias.'
  },
  {
    id: 'albendazol-400mg',
    name: 'Albendazol 400mg comprimido mastigável (Zentel)',
    activeIngredient: 'Albendazol',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '3 comprimidos',
    defaultPosology: 'Mastigar 1 comprimido em dose única à noite (ou 3 dias consecutivos se Giardíase).'
  },
  {
    id: 'ivermectina-6mg',
    name: 'Ivermectina 6mg comprimido (Revectina)',
    activeIngredient: 'Ivermectina',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '4 comprimidos',
    defaultPosology: 'Tomar 1 comprimido para cada 30kg de peso corporal em dose única em jejum.'
  },
  {
    id: 'nitazoxanida-500mg',
    name: 'Nitazoxanida 500mg comprimido (Annita)',
    activeIngredient: 'Nitazoxanida',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '6 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas com alimentos por 3 dias.'
  },
  {
    id: 'aciclovir-200mg',
    name: 'Aciclovir 200mg / 400mg comprimido (Zovirax)',
    activeIngredient: 'Aciclovir',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 4 em 4 horas (5x ao dia) por 5 a 7 dias.'
  },
  {
    id: 'oseltamivir-75mg',
    name: 'Oseltamivir 75mg cápsulas (Tamiflu)',
    activeIngredient: 'Fosfato de oseltamivir',
    route: 'Uso Oral',
    category: 'antibioticos',
    defaultQuantity: '10 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 12 em 12 horas durante 5 dias consecutivos.'
  },
];

