import type { UnifiedMedication } from '../medicationDatabase';

export const CNS_ANTIDEPRESSANTS_MEDS: UnifiedMedication[] = [
  // ==========================================
  // 7. SISTEMA NERVOSO CENTRAL, PSIQUIATRIA E CONTROLE ESPECIAL
  // ==========================================
  // --- 7.1 ISRS, IRSN e Antidepressivos ---
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
    id: 'fluoxetina-gotas-20mg',
    name: 'Cloridrato de Fluoxetina 20mg/mL solução oral gotas (Daforin Gotas)',
    activeIngredient: 'Cloridrato de fluoxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar 20 gotas (20mg; 1 gota = 1mg) via oral pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'sertralina-25mg',
    name: 'Cloridrato de Sertralina 25mg comprimido revestido (Zoloft, Assert, Tolrest)',
    activeIngredient: 'Cloridrato de sertralina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral pela manhã.',
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
    id: 'sertralina-75mg',
    name: 'Cloridrato de Sertralina 75mg comprimido revestido (Assert, Tolrest)',
    activeIngredient: 'Cloridrato de sertralina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (75mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'sertralina-100mg',
    name: 'Cloridrato de Sertralina 100mg comprimido revestido (Zoloft, Assert, Tolrest)',
    activeIngredient: 'Cloridrato de sertralina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'escitalopram-10mg',
    name: 'Oxalato de Escitalopram 10mg comprimido (Lexapro, Exodus, Esc)',
    activeIngredient: 'Oxalato de escitalopram',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'escitalopram-15mg',
    name: 'Oxalato de Escitalopram 15mg comprimido revestido (Lexapro, Exodus, Esc)',
    activeIngredient: 'Oxalato de escitalopram',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (15mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'escitalopram-20mg',
    name: 'Oxalato de Escitalopram 20mg comprimido revestido (Lexapro, Exodus, Esc)',
    activeIngredient: 'Oxalato de escitalopram',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'escitalopram-gotas-20mg',
    name: 'Oxalato de Escitalopram 20mg/mL solução oral gotas (Lexapro Gotas, Exodus Gotas, Esc)',
    activeIngredient: 'Oxalato de escitalopram',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Tomar 10 gotas (10mg; 1 gota = 1mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'citalopram-20mg',
    name: 'Bromidrato de Citalopram 20mg comprimido (Cipramil, Procimax, Denyl)',
    activeIngredient: 'Bromidrato de citalopram',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'paroxetina-20mg',
    name: 'Cloridrato de Paroxetina 20mg comprimido revestido (Pondera, Cebrilin, Paxil)',
    activeIngredient: 'Cloridrato de paroxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia pela manhã com alimento.',
    isSpecialControl: true
  },
  {
    id: 'paroxetina-cr-12-5mg',
    name: 'Cloridrato de Paroxetina CR 12,5mg liberação controlada (Paxil CR)',
    activeIngredient: 'Cloridrato de paroxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (12,5mg) via oral 1 vez ao dia pela manhã sem mastigar.',
    isSpecialControl: true
  },
  {
    id: 'paroxetina-cr-25mg',
    name: 'Cloridrato de Paroxetina CR 25mg liberação controlada (Paxil CR)',
    activeIngredient: 'Cloridrato de paroxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral 1 vez ao dia pela manhã sem mastigar.',
    isSpecialControl: true
  },
  {
    id: 'venlafaxina-37-5mg',
    name: 'Cloridrato de Venlafaxina 37,5mg cápsula de liberação controlada (Efexor XR, Venlift OD)',
    activeIngredient: 'Cloridrato de venlafaxina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (37,5mg) via oral 1 vez ao dia pela manhã com alimentos.',
    isSpecialControl: true
  },
  {
    id: 'venlafaxina-75mg',
    name: 'Cloridrato de Venlafaxina 75mg cápsula de liberação controlada (Efexor XR, Venlift OD)',
    activeIngredient: 'Cloridrato de venlafaxina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (75mg) via oral 1 vez ao dia pela manhã com alimentos.',
    isSpecialControl: true
  },
  {
    id: 'venlafaxina-150mg',
    name: 'Cloridrato de Venlafaxina 150mg cápsula de liberação controlada (Efexor XR, Venlift OD)',
    activeIngredient: 'Cloridrato de venlafaxina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (150mg) via oral 1 vez ao dia pela manhã com alimentos.',
    isSpecialControl: true
  },
  {
    id: 'desvenlafaxina-50mg',
    name: 'Succinato de Desvenlafaxina Monoidratado 50mg liberação prolongada (Pristiq, Deller, Densvela)',
    activeIngredient: 'Succinato de desvenlafaxina monoidratado',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (50mg) via oral 1 vez ao dia sem partir ou mastigar.',
    isSpecialControl: true
  },
  {
    id: 'desvenlafaxina-100mg',
    name: 'Succinato de Desvenlafaxina Monoidratado 100mg liberação prolongada (Pristiq, Deller, Densvela)',
    activeIngredient: 'Succinato de desvenlafaxina monoidratado',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral 1 vez ao dia sem partir ou mastigar.',
    isSpecialControl: true
  },
  {
    id: 'duloxetina-30mg',
    name: 'Cloridrato de Duloxetina 30mg cápsula de liberação retardada (Cymbalta, Velija, Dual)',
    activeIngredient: 'Cloridrato de duloxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (30mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'duloxetina-60mg',
    name: 'Cloridrato de Duloxetina 60mg cápsula de liberação retardada (Cymbalta, Velija, Dual)',
    activeIngredient: 'Cloridrato de duloxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (60mg) via oral 1 vez ao dia pela manhã.',
    isSpecialControl: true
  },
  {
    id: 'vilazodona-10mg',
    name: 'Cloridrato de Vilazodona 10mg comprimido revestido (Aymee)',
    activeIngredient: 'Cloridrato de vilazodona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia junto com refeição (titulação inicial por 7 dias).',
    isSpecialControl: true
  },
  {
    id: 'vilazodona-20mg',
    name: 'Cloridrato de Vilazodona 20mg comprimido revestido (Aymee)',
    activeIngredient: 'Cloridrato de vilazodona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia obrigatoriamente junto com refeição.',
    isSpecialControl: true
  },
  {
    id: 'vilazodona-40mg',
    name: 'Cloridrato de Vilazodona 40mg comprimido revestido (Aymee)',
    activeIngredient: 'Cloridrato de vilazodona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (40mg) via oral 1 vez ao dia obrigatoriamente junto com refeição.',
    isSpecialControl: true
  },
  {
    id: 'vortioxetina-5mg',
    name: 'Bromidrato de Vortioxetina 5mg comprimido revestido (Brintellix)',
    activeIngredient: 'Bromidrato de vortioxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (5mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'vortioxetina-10mg',
    name: 'Bromidrato de Vortioxetina 10mg comprimido revestido (Brintellix)',
    activeIngredient: 'Bromidrato de vortioxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'vortioxetina-15mg',
    name: 'Bromidrato de Vortioxetina 15mg comprimido revestido (Brintellix)',
    activeIngredient: 'Bromidrato de vortioxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (15mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'vortioxetina-20mg',
    name: 'Bromidrato de Vortioxetina 20mg comprimido revestido (Brintellix)',
    activeIngredient: 'Bromidrato de vortioxetina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia.',
    isSpecialControl: true
  },
  {
    id: 'bupropiona-150mg-xl',
    name: 'Cloridrato de Bupropiona 150mg liberação prolongada XL/SR (Wellbutrin XL, Bup, Zetron)',
    activeIngredient: 'Cloridrato de bupropiona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (150mg) via oral pela manhã (ou de 12/12h se formulação SR com intervalo mínimo de 8h).',
    isSpecialControl: true
  },
  {
    id: 'bupropiona-300mg-xl',
    name: 'Cloridrato de Bupropiona 300mg liberação prolongada 24h XL (Wellbutrin XL, Zetron XL, Bup XL)',
    activeIngredient: 'Cloridrato de bupropiona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (300mg XL) via oral 1 vez ao dia pela manhã sem partir ou mastigar.',
    isSpecialControl: true
  },
  {
    id: 'trazodona-50mg',
    name: 'Cloridrato de Trazodona 50mg comprimido revestido (Donaren)',
    activeIngredient: 'Cloridrato de trazodona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos (50mg a 100mg) via oral à noite logo antes de deitar.',
    isSpecialControl: true
  },
  {
    id: 'trazodona-100mg',
    name: 'Cloridrato de Trazodona 100mg comprimido revestido (Donaren)',
    activeIngredient: 'Cloridrato de trazodona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'trazodona-150mg-retard',
    name: 'Cloridrato de Trazodona 150mg comprimido liberação prolongada (Donaren Retard)',
    activeIngredient: 'Cloridrato de trazodona',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (150mg; sulcado em 3 partes de 50mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'mirtazapina-15mg',
    name: 'Mirtazapina 15mg comprimido orodispersível (Remeron SolTab, Menelat, Razapina)',
    activeIngredient: 'Mirtazapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (15mg) via oral à noite antes de deitar.',
    isSpecialControl: true
  },
  {
    id: 'mirtazapina-30mg',
    name: 'Mirtazapina 30mg comprimido orodispersível (Remeron SolTab, Menelat, Razapina)',
    activeIngredient: 'Mirtazapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (30mg) via oral à noite antes de deitar.',
    isSpecialControl: true
  },
  {
    id: 'mirtazapina-45mg',
    name: 'Mirtazapina 45mg comprimido orodispersível (Remeron SolTab, Menelat)',
    activeIngredient: 'Mirtazapina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (45mg) via oral à noite antes de deitar.',
    isSpecialControl: true
  },
  {
    id: 'amitriptilina-10mg',
    name: 'Cloridrato de Amitriptilina 10mg comprimido (Amytril)',
    activeIngredient: 'Cloridrato de amitriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral à noite ao deitar.',
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
    id: 'amitriptilina-75mg',
    name: 'Cloridrato de Amitriptilina 75mg comprimido (Tryptanol, Amytril)',
    activeIngredient: 'Cloridrato de amitriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (75mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'nortriptilina-10mg',
    name: 'Cloridrato de Nortriptilina 10mg cápsula (Pamelor)',
    activeIngredient: 'Cloridrato de nortriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (10mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'nortriptilina-25mg',
    name: 'Cloridrato de Nortriptilina 25mg cápsula (Pamelor)',
    activeIngredient: 'Cloridrato de nortriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (25mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'nortriptilina-50mg',
    name: 'Cloridrato de Nortriptilina 50mg cápsula (Pamelor)',
    activeIngredient: 'Cloridrato de nortriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (50mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'nortriptilina-75mg',
    name: 'Cloridrato de Nortriptilina 75mg cápsula (Pamelor)',
    activeIngredient: 'Cloridrato de nortriptilina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (75mg) via oral à noite ao deitar.',
    isSpecialControl: true
  },
  {
    id: 'clomipramina-25mg',
    name: 'Cloridrato de Clomipramina 25mg comprimido revestido (Anafranil, Clo)',
    activeIngredient: 'Cloridrato de clomipramina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral 1 a 3 vezes ao dia.',
    isSpecialControl: true
  },
  {
    id: 'clomipramina-75mg-sr',
    name: 'Cloridrato de Clomipramina 75mg liberação lenta SR (Anafranil SR, Clo)',
    activeIngredient: 'Cloridrato de clomipramina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (75mg SR) via oral 1 vez ao dia à noite.',
    isSpecialControl: true
  },
];
