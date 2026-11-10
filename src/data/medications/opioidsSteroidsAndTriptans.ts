import type { UnifiedMedication } from '../medicationDatabase';

export const OPIOIDS_STEROIDS_AND_TRIPTANS_MEDS: UnifiedMedication[] = [
  {
    id: 'tramadol-50mg',
    name: 'Tramadol 50mg cápsulas (Tramal, Sylador)',
    activeIngredient: 'Cloridrato de tramadol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 6 em 6 horas se dor moderada (máx 400mg/dia).',
    isSpecialControl: true
  },
  {
    id: 'tramadol-gotas-100mg',
    name: 'Tramadol 100mg/mL gotas (Tramal Gotas)',
    activeIngredient: 'Cloridrato de tramadol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Tomar 20 a 40 gotas via oral de 6 em 6 horas.',
    isSpecialControl: true
  },
  {
    id: 'codeina-30mg',
    name: 'Codeína 30mg comprimido (Codein)',
    activeIngredient: 'Fosfato de codeína',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 4 em 4 horas ou 6 em 6 horas se dor moderada.',
    isSpecialControl: true
  },
  {
    id: 'tylex-30mg',
    name: 'Codeína 30mg + Paracetamol 500mg (Tylex 30, Paco)',
    activeIngredient: 'Fosfato de codeína + paracetamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '24 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas se dor moderada.',
    isSpecialControl: true
  },
  {
    id: 'morfina-10mg',
    name: 'Morfina 10mg / 30mg comprimido (Dimorf)',
    activeIngredient: 'Sulfato de morfina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '50 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 4 em 4 horas com resgate se dor oncológica.',
    isSpecialControl: true
  },
  {
    id: 'prednisona-20mg',
    name: 'Prednisona 20mg comprimido (Meticorten)',
    activeIngredient: 'Prednisona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos pela manhã por 5 dias com desmame subsequente.'
  },
  {
    id: 'prednisolona-sol-3mg',
    name: 'Prednisolona 3mg/mL solução oral (Prelone, Predsim)',
    activeIngredient: 'Fosfato sódico de prednisolona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (60 mL)',
    defaultPosology: 'Dar dose pediátrica calculada (1 a 2 mg/kg/dia) 1x ao dia pela manhã por 3 a 5 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 1,
    pediatricConcentrationMgMl: 3,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 60,
    pediatricDefaultDays: 5
  },
  {
    id: 'prednisolona-gotas-11mg',
    name: 'Prednisolona 11mg/mL gotas (Predsim Gotas)',
    activeIngredient: 'Fosfato sódico de prednisolona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar 2 gotas por kg de peso 1 vez ao dia pela manhã por 3 a 5 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 1,
    pediatricConcentrationMgMl: 11,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 60
  },
  {
    id: 'dexametasona-4mg',
    name: 'Dexametasona 4mg comprimido (Decadron)',
    activeIngredient: 'Dexametasona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã por 3 dias.'
  },
  {
    id: 'dexametasona-elixir-0-1mg',
    name: 'Dexametasona 0,1mg/mL elixir (Decadron Elixir)',
    activeIngredient: 'Dexametasona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (120 mL)',
    defaultPosology: 'Tomar volume calculado em mL conforme indicação médica.',
    isPediatric: true,
    pediatricDoseMgKg: 0.15,
    pediatricConcentrationMgMl: 0.1,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 10
  },
  {
    id: 'dexametasona-ampola-4mg',
    name: 'Dexametasona 4mg/mL ampola 2,5mL (Decadron Injetável)',
    activeIngredient: 'Fosfato dissódico de dexametasona',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Aplicar 4mg a 10mg IV ou IM 1 vez ao dia.'
  },
  {
    id: 'hidrocortisona-injetavel',
    name: 'Hidrocortisona 100mg / 500mg pó injetável (Cortisonal, Flebocortid)',
    activeIngredient: 'Succinato sódico de hidrocortisona',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 frascos-ampola',
    defaultPosology: 'Adulto: 100mg a 500mg IV lento a cada 6 a 8 horas. Pediatria: 5mg/kg IV.'
  },
  {
    id: 'diprospan-ampola',
    name: 'Dipropionato + Fosfato de Betametasona (Diprospan, Celestone Soluspan)',
    activeIngredient: 'Dipropionato de betametasona + fosfato dissódico de betametasona',
    route: 'Uso Intramuscular',
    category: 'analgesicos',
    defaultQuantity: '1 ampola (1 mL)',
    defaultPosology: 'Aplicar 1 ampola (1mL) IM profundo em dose única (PROIBIDO USO IV).'
  },
  {
    id: 'cetorolaco-10mg-sl',
    name: 'Cetorolaco de Trometamol 10mg comprimido sublingual (Toragesic, Deocil SL)',
    activeIngredient: 'Trometamol cetorolaco',
    route: 'Uso Sublingual',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos sublinguais',
    defaultPosology: 'Colocar 1 comprimido abaixo da língua até dissolver de 8 em 8 horas se dor intensa por no máx 5 dias.'
  },
  {
    id: 'cetorolaco-gotas-20mg',
    name: 'Cetorolaco de Trometamol 20mg/mL solução oral gotas (Toragesic Gotas)',
    activeIngredient: 'Trometamol cetorolaco',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (10 mL)',
    defaultPosology: 'Tomar 10 gotas (10mg) via oral de 6 em 6 horas ou 8 em 8 horas por no máx 5 dias.'
  },
  {
    id: 'cetorolaco-ampola-30mg',
    name: 'Cetorolaco de Trometamol 30mg/mL ampola injetável IV/IM (Toragesic Injetável)',
    activeIngredient: 'Trometamol cetorolaco',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Aplicar 30mg IV lento ou IM profundo a cada 8 horas por no máx 2 dias.'
  },
  {
    id: 'etoricoxibe-60mg',
    name: 'Etoricoxibe 60mg comprimido (Arcoxia 60mg, Hetori)',
    activeIngredient: 'Etoricoxibe',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '14 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia por 5 a 7 dias.'
  },
  {
    id: 'celecoxibe-100mg',
    name: 'Celecoxibe 100mg cápsula (Celebra 100mg)',
    activeIngredient: 'Celecoxibe',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 12 em 12 horas por 5 a 7 dias.'
  },
  {
    id: 'naproxeno-250mg',
    name: 'Naproxeno 250mg comprimido (Naprosyn 250mg, Flanax 275mg)',
    activeIngredient: 'Naproxeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas ou de 12 em 12 horas por 3 a 5 dias.'
  },
  {
    id: 'naproxeno-sodico-550mg',
    name: 'Naproxeno Sódico 550mg comprimido (Flanax 550mg)',
    activeIngredient: 'Naproxeno sódico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia ou de 12 em 12 horas após refeição por 3 a 5 dias.'
  },
  {
    id: 'aceclofenaco-100mg',
    name: 'Aceclofenaco 100mg comprimido (Proflam)',
    activeIngredient: 'Aceclofenaco',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '12 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas após as refeições por 5 dias.'
  },
  {
    id: 'dexketoprofeno-25mg',
    name: 'Dexketoprofeno Trometamol 25mg comprimido (Enantyum)',
    activeIngredient: 'Dexketoprofeno trometamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 3 a 5 dias (máx 75mg/dia).'
  },
  {
    id: 'indometacina-25mg',
    name: 'Indometacina 25mg cápsula (Indocid 25mg)',
    activeIngredient: 'Indometacina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 8 em 8 horas após as refeições.'
  },
  {
    id: 'indometacina-50mg',
    name: 'Indometacina 50mg cápsula (Indocid 50mg)',
    activeIngredient: 'Indometacina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral de 8 em 8 horas ou de 12 em 12 horas após as refeições.'
  },
  {
    id: 'lornoxicam-8mg',
    name: 'Lornoxicam 8mg comprimido (Xefo)',
    activeIngredient: 'Lornoxicam',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas antes das refeições por 3 a 5 dias.'
  },
  {
    id: 'ciclobenzaprina-5mg',
    name: 'Cloridrato de Ciclobenzaprina 5mg comprimido (Miosan 5mg)',
    activeIngredient: 'Cloridrato de ciclobenzaprina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '15 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral à noite ao deitar (ou de 12/12h) por 5 a 7 dias.'
  },
  {
    id: 'ciclobenzaprina-10mg',
    name: 'Cloridrato de Ciclobenzaprina 10mg comprimido (Miosan 10mg)',
    activeIngredient: 'Cloridrato de ciclobenzaprina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '15 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral à noite ao deitar por 5 a 7 dias (pode causar sonolência).'
  },
  {
    id: 'baclofeno-10mg',
    name: 'Baclofeno 10mg comprimido (Lioresal)',
    activeIngredient: 'Baclofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar meio a 1 comprimido via oral de 8 em 8 horas junto às refeições.'
  },
  {
    id: 'prednisona-5mg',
    name: 'Prednisona 5mg comprimido (Meticorten 5mg)',
    activeIngredient: 'Prednisona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral pela manhã conforme esquema de titulação ou desmame.'
  },
  {
    id: 'prednisolona-20mg-comp',
    name: 'Prednisolona 20mg comprimido (Prelone 20mg)',
    activeIngredient: 'Fosfato sódico de prednisolona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral pela manhã por 5 dias.'
  },
  {
    id: 'deflazacorte-6mg',
    name: 'Deflazacorte 6mg comprimido (Calcort 6mg)',
    activeIngredient: 'Deflazacorte',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral pela manhã conforme orientação médica.'
  },
  {
    id: 'deflazacorte-30mg',
    name: 'Deflazacorte 30mg comprimido (Calcort 30mg)',
    activeIngredient: 'Deflazacorte',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral pela manhã por 5 dias.'
  },
  {
    id: 'ondansetrona-8mg-flash',
    name: 'Ondansetrona 8mg comprimido orodispersível (Vonau Flash 8mg)',
    activeIngredient: 'Cloridrato de ondansetrona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Dissolver 1 comprimido sobre a língua de 8 em 8 horas ou de 12 em 12 horas se náuseas ou vômitos.'
  },
  {
    id: 'tramadol-100mg-retard',
    name: 'Tramadol 100mg comprimido liberação prolongada (Tramal Retard 100mg)',
    activeIngredient: 'Cloridrato de tramadol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas sem mastigar (máx 400mg/dia).',
    isSpecialControl: true
  },
  {
    id: 'codeina-60mg',
    name: 'Codeína 60mg comprimido (Codein 60mg)',
    activeIngredient: 'Fosfato de codeína',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas se dor moderada a intensa (máx 360mg/dia).',
    isSpecialControl: true
  },

  // ==========================================
  // 1B. TRIPTANOS — CRISE AGUDA DE ENXAQUECA
  // ==========================================
  {
    id: 'sumatriptana-25mg',
    name: 'Succinato de Sumatriptana 25mg comprimido (Sumax 25mg)',
    activeIngredient: 'Succinato de sumatriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '4 comprimidos',
    defaultPosology: 'Tomar 1 comprimido no início da crise de enxaqueca. Se necessário, repetir após 2 horas (máx 200mg/24h).'
  },
  {
    id: 'sumatriptana-50mg',
    name: 'Succinato de Sumatriptana 50mg comprimido (Sumax 50mg, Imigran)',
    activeIngredient: 'Succinato de sumatriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '4 comprimidos',
    defaultPosology: 'Tomar 1 comprimido logo no início da crise de enxaqueca. Pode repetir após 2h se recorrência (máx 200mg/24h).'
  },
  {
    id: 'sumatriptana-100mg',
    name: 'Succinato de Sumatriptana 100mg comprimido (Sumax 100mg)',
    activeIngredient: 'Succinato de sumatriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '4 comprimidos',
    defaultPosology: 'Tomar 1 comprimido no início da crise de enxaqueca (máx 200mg/24h).'
  },
  {
    id: 'sumatriptana-spray-10mg',
    name: 'Sumatriptana 10mg/dose spray nasal (Sumax Spray Nasal)',
    activeIngredient: 'Sumatriptana',
    route: 'Uso Nasal',
    category: 'analgesicos',
    defaultQuantity: '1 frasco spray (2 doses)',
    defaultPosology: 'Aplicar 1 a 2 jatos (10 a 20mg) em uma narina no início da crise de enxaqueca ou cefaleia em salvas.'
  },
  {
    id: 'sumatriptana-sc-6mg',
    name: 'Succinato de Sumatriptana 6mg/0,5mL seringa injetável SC (Sumax Injetável)',
    activeIngredient: 'Succinato de sumatriptana',
    route: 'Uso Subcutâneo',
    category: 'analgesicos',
    defaultQuantity: '2 seringas preenchidas',
    defaultPosology: 'Aplicar 1 seringa (6mg) via subcutânea na crise aguda de cefaleia em salvas ou enxaqueca com vômitos (máx 12mg/24h).'
  },
  {
    id: 'sumatriptana-naproxeno-85-500mg',
    name: 'Sumatriptana 85mg + Naproxeno Sódico 500mg comprimido (Sumaxpro 500+85mg)',
    activeIngredient: 'Succinato de sumatriptana + naproxeno sódico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '3 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral no início da crise de enxaqueca (máx 2 comprimidos em 24h com intervalo mínimo de 2h).'
  },
  {
    id: 'naratriptana-2-5mg',
    name: 'Cloridrato de Naratriptana 2,5mg comprimido (Naramig)',
    activeIngredient: 'Cloridrato de naratriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '4 comprimidos',
    defaultPosology: 'Tomar 1 comprimido no início da crise de enxaqueca. Se necessário, repetir após 4 horas (máx 5mg/24h).'
  },
  {
    id: 'zolmitriptana-2-5mg',
    name: 'Zolmitriptana 2,5mg comprimido revestido (Zomig)',
    activeIngredient: 'Zolmitriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '3 comprimidos',
    defaultPosology: 'Tomar 1 comprimido no início da crise de enxaqueca. Pode repetir após 2 horas se necessário (máx 10mg/24h).'
  },
  {
    id: 'zolmitriptana-2-5mg-od',
    name: 'Zolmitriptana 2,5mg comprimido orodispersível (Zomig OD / Rapimelt)',
    activeIngredient: 'Zolmitriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '3 comprimidos orodispersíveis',
    defaultPosology: 'Dissolver 1 comprimido sobre a língua (sem necessidade de água) no início da crise de enxaqueca (máx 10mg/24h).'
  },
  {
    id: 'rizatriptana-10mg',
    name: 'Benzoato de Rizatriptana 10mg comprimido (Maxalt)',
    activeIngredient: 'Benzoato de rizatriptana',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '4 comprimidos',
    defaultPosology: 'Tomar 1 comprimido no início da crise de enxaqueca. Pode repetir após 2 horas se necessário (máx 30mg/24h).'
  },
];
