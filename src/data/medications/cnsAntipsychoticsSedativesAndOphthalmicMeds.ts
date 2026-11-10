import type { UnifiedMedication } from '../medicationDatabase';

export const CNS_ANTIPSYCHOTICS_SEDATIVES_AND_OPHTHALMIC_MEDS: UnifiedMedication[] = [
  // --- 7.3 Antipsicóticos Atípicos e Típicos ---
  {
    id: 'risperidona-1mg',
    name: 'Risperidona 1mg comprimido revestido (Risperdal, Respidon)',
    activeIngredient: 'Risperidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (1mg) via oral à noite ao deitar (ou de 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'risperidona-2mg',
    name: 'Risperidona 2mg comprimido (Risperdal)',
    activeIngredient: 'Risperidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido à noite ao deitar (ou 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'risperidona-3mg',
    name: 'Risperidona 3mg comprimido revestido (Risperdal, Respidon)',
    activeIngredient: 'Risperidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (3mg) via oral à noite ao deitar (ou de 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'risperidona-sol-1mg-ml',
    name: 'Risperidona 1mg/mL solução oral com pipeta dosadora (Risperdal Solução)',
    activeIngredient: 'Risperidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (30 mL)',
    defaultPosology: 'Administrar 0,5 mL a 2 mL (0,5mg a 2mg) via oral 1 a 2 vezes ao dia.',
    isSpecialControl: true
  },
  {
    id: 'olanzapina-2-5mg',
    name: 'Olanzapina 2,5mg comprimido revestido (Zyprexa, Zap)',
    activeIngredient: 'Olanzapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (2,5mg) via oral 1 vez ao dia à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'olanzapina-5mg',
    name: 'Olanzapina 5mg comprimido revestido / orodispersível (Zyprexa, Zap)',
    activeIngredient: 'Olanzapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (5mg) via oral 1 vez ao dia à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'olanzapina-10mg',
    name: 'Olanzapina 10mg comprimido revestido / orodispersível (Zyprexa, Zap)',
    activeIngredient: 'Olanzapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'quetiapina-25mg',
    name: 'Hemifumarato de Quetiapina 25mg comprimido (Seroquel, Quet)',
    activeIngredient: 'Hemifumarato de quetiapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'quetiapina-50mg-xr',
    name: 'Hemifumarato de Quetiapina XR 50mg liberação prolongada (Seroquel XRO)',
    activeIngredient: 'Hemifumarato de quetiapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (50mg XRO) via oral à noite longe das refeições sem partir.',
    isSpecialControl: true
  },
  {
    id: 'quetiapina-100mg',
    name: 'Hemifumarato de Quetiapina 100mg comprimido revestido (Seroquel, Quet)',
    activeIngredient: 'Hemifumarato de quetiapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral à noite ao deitar (ou de 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'quetiapina-200mg',
    name: 'Hemifumarato de Quetiapina 200mg comprimido / liberação prolongada (Seroquel, Seroquel XRO)',
    activeIngredient: 'Hemifumarato de quetiapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (200mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'quetiapina-300mg',
    name: 'Hemifumarato de Quetiapina 300mg comprimido / liberação prolongada (Seroquel, Seroquel XRO)',
    activeIngredient: 'Hemifumarato de quetiapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (300mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'aripiprazol-10mg',
    name: 'Aripiprazol 10mg comprimido (Aristab, Abilify, Toarip)',
    activeIngredient: 'Aripiprazol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'aripiprazol-15mg',
    name: 'Aripiprazol 15mg comprimido (Aristab, Abilify, Toarip)',
    activeIngredient: 'Aripiprazol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (15mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'aripiprazol-20mg',
    name: 'Aripiprazol 20mg comprimido (Aristab, Abilify)',
    activeIngredient: 'Aripiprazol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'aripiprazol-30mg',
    name: 'Aripiprazol 30mg comprimido (Aristab, Abilify)',
    activeIngredient: 'Aripiprazol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (30mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'aripiprazol-sol-1mg-ml',
    name: 'Aripiprazol 1mg/mL solução oral gotas / seringa dosadora (Aristab Solução)',
    activeIngredient: 'Aripiprazol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (150 mL)',
    defaultPosology: 'Administrar 2 mL a 10 mL (2mg a 10mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'lurasidona-20mg',
    name: 'Cloridrato de Lurasidona 20mg comprimido revestido (Latuda)',
    activeIngredient: 'Cloridrato de lurasidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia junto com refeição (mínimo 350 kcal).',
    isSpecialControl: true
  },
  {
    id: 'lurasidona-40mg',
    name: 'Cloridrato de Lurasidona 40mg comprimido revestido (Latuda)',
    activeIngredient: 'Cloridrato de lurasidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (40mg) via oral 1 vez ao dia junto com refeição (mínimo 350 kcal).',
    isSpecialControl: true
  },
  {
    id: 'lurasidona-80mg',
    name: 'Cloridrato de Lurasidona 80mg comprimido revestido (Latuda)',
    activeIngredient: 'Cloridrato de lurasidona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (80mg) via oral 1 vez ao dia junto com refeição (mínimo 350 kcal).',
    isSpecialControl: true
  },
  {
    id: 'clorpromazina-25mg',
    name: 'Cloridrato de Clorpromazina 25mg comprimido (Amplictil, Longactil)',
    activeIngredient: 'Cloridrato de clorpromazina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral à noite (ou de 8/8h).',
    isSpecialControl: true
  },
  {
    id: 'clorpromazina-100mg',
    name: 'Cloridrato de Clorpromazina 100mg comprimido (Amplictil, Longactil)',
    activeIngredient: 'Cloridrato de clorpromazina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral à noite ao deitar (ou de 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'levomepromazina-25mg',
    name: 'Maleato de Levomepromazina 25mg comprimido (Neozine)',
    activeIngredient: 'Maleato de levomepromazina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'levomepromazina-100mg',
    name: 'Maleato de Levomepromazina 100mg comprimido (Neozine)',
    activeIngredient: 'Maleato de levomepromazina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'haloperidol-1mg',
    name: 'Haloperidol 1mg comprimido (Haldol)',
    activeIngredient: 'Haloperidol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (1mg) via oral de 12 em 12 horas ou à noite.',
    isSpecialControl: true
  },
  {
    id: 'haloperidol-5mg',
    name: 'Haloperidol 5mg comprimido (Haldol)',
    activeIngredient: 'Haloperidol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 8/8h ou 12/12h conforme indicação.',
    isSpecialControl: true
  },
  {
    id: 'haloperidol-gotas-2mg',
    name: 'Haloperidol 2mg/mL solução oral gotas (Haldol Gotas)',
    activeIngredient: 'Haloperidol',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (30 mL)',
    defaultPosology: 'Tomar 5 a 20 gotas (cada gota = 0,1mg) via oral 1 a 2 vezes ao dia.',
    isSpecialControl: true
  },

  // --- 7.4 Gabapentinoides (Dor Neuropática / Ansiedade / Fibromialgia) ---
  {
    id: 'pregabalina-25mg',
    name: 'Pregabalina 25mg cápsula (Lyrica, Dorene, Insit)',
    activeIngredient: 'Pregabalina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (25mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'pregabalina-50mg',
    name: 'Pregabalina 50mg cápsula (Lyrica, Dorene, Insit)',
    activeIngredient: 'Pregabalina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (50mg) via oral à noite (ou de 12 em 12 horas).',
    isSpecialControl: true
  },
  {
    id: 'pregabalina-75mg',
    name: 'Pregabalina 75mg cápsula (Lyrica, Dorene, Insit)',
    activeIngredient: 'Pregabalina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 a 2 vezes ao dia.',
    isSpecialControl: true
  },
  {
    id: 'pregabalina-150mg',
    name: 'Pregabalina 150mg cápsula (Lyrica, Dorene, Insit)',
    activeIngredient: 'Pregabalina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (150mg) via oral de 12 em 12 horas (ou à noite).',
    isSpecialControl: true
  },
  {
    id: 'gabapentina-300mg',
    name: 'Gabapentina 300mg cápsula (Neurontin, Progresse)',
    activeIngredient: 'Gabapentina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (300mg) via oral de 8 em 8 horas (iniciar com 300mg à noite e progredir).',
    isSpecialControl: true
  },
  {
    id: 'gabapentina-400mg',
    name: 'Gabapentina 400mg cápsula (Neurontin, Progresse)',
    activeIngredient: 'Gabapentina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (400mg) via oral de 8 em 8 horas.',
    isSpecialControl: true
  },
  {
    id: 'gabapentina-600mg',
    name: 'Gabapentina 600mg comprimido revestido (Neurontin)',
    activeIngredient: 'Gabapentina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (600mg) via oral de 8 em 8 horas.',
    isSpecialControl: true
  },

  // --- 7.5 Benzodiazepínicos, Hipnóticos Z e Psicoestimulantes ---
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
    id: 'cloridrato-metilfenidato-10mg',
    name: 'Cloridrato de Metilfenidato 10mg (Ritalina)',
    activeIngredient: 'Cloridrato de metilfenidato',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido 1 a 2 vezes ao dia (manhã e almoço).',
    isSpecialControl: true
  },

  // ==========================================
  // 8. OFTALMOLOGIA — COLÍRIOS LUBRIFICANTES, ANTIALÉRGICOS, ANTI-INFLAMATÓRIOS E GLAUCOMA
  // ==========================================
  {
    id: 'colirio-carmelose-0-5',
    name: 'Carmelose Sódica 0,5% (5mg/mL) colírio lubrificante (Lacrifilm, Optive, Fresh Tears)',
    activeIngredient: 'Carmelose sódica',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Pingar 1 a 2 gotas no(s) olho(s) afetado(s) 4 a 6 vezes ao dia ou conforme necessidade.'
  },
  {
    id: 'colirio-hialuronato-sodio-0-15',
    name: 'Hialuronato de Sódio 0,15% (1,5mg/mL) colírio lubrificante sem conservantes (Hyabak, Lacribell)',
    activeIngredient: 'Hialuronato de sódio',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Pingar 1 gota em cada olho 4 a 6 vezes ao dia.'
  },
  {
    id: 'colirio-hipromelose-dextrano',
    name: 'Hipromelose 3mg/mL + Dextrano 70 1mg/mL colírio lubrificante (Lacri, Lacrima Plus)',
    activeIngredient: 'Hipromelose + dextrano 70',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Pingar 1 a 2 gotas no(s) olho(s) 4 vezes ao dia.'
  },
  {
    id: 'colirio-systane-ul',
    name: 'Polietilenoglicol 400 + Propilenoglicol colírio lubrificante (Systane UL)',
    activeIngredient: 'Polietilenoglicol 400 + propilenoglicol',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Pingar 1 a 2 gotas no(s) olho(s) 4 vezes ao dia.'
  },
  {
    id: 'colirio-olopatadina-0-1',
    name: 'Cloridrato de Olopatadina 0,1% (1mg/mL) colírio antialérgico (Patanol)',
    activeIngredient: 'Cloridrato de olopatadina',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 12 em 12 horas.'
  },
  {
    id: 'colirio-olopatadina-0-2',
    name: 'Cloridrato de Olopatadina 0,2% (2mg/mL) colírio antialérgico 24h (Patanol S)',
    activeIngredient: 'Cloridrato de olopatadina',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (2,5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) 1 vez ao dia.'
  },
  {
    id: 'colirio-cetotifeno-0-025',
    name: 'Fumarato de Cetotifeno 0,025% (0,25mg/mL) colírio antialérgico (Zaditen, Octifen)',
    activeIngredient: 'Fumarato de cetotifeno',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 12 em 12 horas.'
  },
  {
    id: 'colirio-cetorolaco-0-4',
    name: 'Trometamol Cetorolaco 0,4% / 0,5% colírio anti-inflamatório (Acular LS, Cetrolac)',
    activeIngredient: 'Trometamol cetorolaco',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 6 em 6 horas por 5 a 7 dias.'
  },
  {
    id: 'colirio-prednisolona-1',
    name: 'Acetato de Prednisolona 1% (10mg/mL) suspensão oftálmica colírio (Pred Fort, Ster)',
    activeIngredient: 'Acetato de prednisolona',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Agitar antes de usar. Pingar 1 gota no olho afetado de 6/6h com desmame progressivo conforme orientação oftalmológica.'
  },
  {
    id: 'colirio-dexametasona-0-1',
    name: 'Dexametasona 0,1% (1mg/mL) suspensão oftálmica colírio (Maxidex)',
    activeIngredient: 'Dexametasona',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no olho afetado de 6 em 6 horas com redução gradual.'
  },
  {
    id: 'colirio-timolol-0-5',
    name: 'Maleato de Timolol 0,5% (5mg/mL) colírio antiglaucoma (Timoptol)',
    activeIngredient: 'Maleato de timolol',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 12 em 12 horas (glaucoma).'
  },
  {
    id: 'colirio-latanoprosta-0-005',
    name: 'Latanoprosta 0,005% (50mcg/mL) colírio antiglaucoma (Xalatan, Arulatan)',
    activeIngredient: 'Latanoprosta',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (2,5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) 1 vez ao dia à noite.'
  },
  {
    id: 'colirio-travoprosta-0-004',
    name: 'Travoprosta 0,004% (40mcg/mL) colírio antiglaucoma (Travatan)',
    activeIngredient: 'Travoprosta',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (2,5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) 1 vez ao dia à noite.'
  },
  {
    id: 'colirio-bimatoprosta-0-03',
    name: 'Bimatoprosta 0,03% / 0,01% colírio antiglaucoma (Lumigan, Lumigan RC)',
    activeIngredient: 'Bimatoprosta',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (3 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) 1 vez ao dia à noite.'
  },
  {
    id: 'colirio-brimonidina-0-2',
    name: 'Tartarato de Brimonidina 0,2% (2mg/mL) colírio antiglaucoma (Alphagan, Glaub)',
    activeIngredient: 'Tartarato de brimonidina',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 12 em 12 horas (ou de 8/8h).'
  },
  {
    id: 'colirio-dorzolamida-2',
    name: 'Cloridrato de Dorzolamida 2% (20mg/mL) colírio antiglaucoma (Trusopt)',
    activeIngredient: 'Cloridrato de dorzolamida',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 8 em 8 horas (monoterapia) ou de 12/12h (associado).'
  },
  {
    id: 'colirio-dorzolamida-timolol',
    name: 'Cloridrato de Dorzolamida 2% + Maleato de Timolol 0,5% colírio (Cosopt, Drusolol)',
    activeIngredient: 'Cloridrato de dorzolamida + maleato de timolol',
    route: 'Uso Oftálmico',
    category: 'outros',
    defaultQuantity: '1 frasco (5 mL)',
    defaultPosology: 'Pingar 1 gota no(s) olho(s) afetado(s) de 12 em 12 horas.'
  }
];
