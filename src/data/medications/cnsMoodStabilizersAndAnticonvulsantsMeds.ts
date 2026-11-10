import type { UnifiedMedication } from '../medicationDatabase';

export const CNS_MOOD_STABILIZERS_AND_ANTICONVULSANTS_MEDS: UnifiedMedication[] = [
  // --- 7.2 Estabilizadores de Humor e Anticonvulsivantes ---
  {
    id: 'acido-valproico-250mg',
    name: 'Ácido Valproico (Valproato de Sódio) 250mg cápsula (Depakene)',
    activeIngredient: 'Ácido valproico (valproato de sódio)',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (250mg) via oral de 12 em 12 horas ou de 8 em 8 horas após refeição.',
    isSpecialControl: true
  },
  {
    id: 'acido-valproico-300mg',
    name: 'Valproato de Sódio (Ácido Valproico) 300mg comprimido revestido (Depakene)',
    activeIngredient: 'Valproato de sódio (ácido valproico)',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '50 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (300mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'acido-valproico-500mg',
    name: 'Valproato de Sódio (Ácido Valproico) 500mg comprimido revestido (Depakene)',
    activeIngredient: 'Valproato de sódio (ácido valproico)',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '50 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (500mg) via oral de 12 em 12 horas (ou à noite).',
    isSpecialControl: true
  },
  {
    id: 'acido-valproico-xarope-50mg',
    name: 'Valproato de Sódio (Ácido Valproico) 50mg/mL (250mg/5mL) xarope (Depakene Xarope)',
    activeIngredient: 'Valproato de sódio (ácido valproico)',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '1 frasco (100 mL)',
    defaultPosology: 'Administrar o volume prescrito em mL de 12 em 12 horas (15 a 60 mg/kg/dia).',
    isSpecialControl: true
  },
  {
    id: 'divalproato-250mg',
    name: 'Divalproato de Sódio 250mg comprimido revestido (Depakote)',
    activeIngredient: 'Divalproato de sódio',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (250mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'divalproato-500mg',
    name: 'Divalproato de Sódio 500mg comprimido revestido (Depakote)',
    activeIngredient: 'Divalproato de sódio',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (500mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'divalproato-er-250mg',
    name: 'Divalproato de Sódio ER 250mg liberação prolongada (Depakote ER)',
    activeIngredient: 'Divalproato de sódio',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos (250mg ER) via oral 1 vez ao dia à noite sem partir.',
    isSpecialControl: true
  },
  {
    id: 'divalproato-er-500mg',
    name: 'Divalproato de Sódio ER 500mg liberação prolongada (Depakote ER)',
    activeIngredient: 'Divalproato de sódio',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos (500mg ER) via oral 1 vez ao dia à noite sem partir.',
    isSpecialControl: true
  },
  {
    id: 'lamotrigina-25mg',
    name: 'Lamotrigina 25mg comprimido (Lamictal, Neural)',
    activeIngredient: 'Lamotrigina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral 1 vez ao dia nas primeiras 2 semanas (escalonamento lento conforme protocolo).',
    isSpecialControl: true
  },
  {
    id: 'lamotrigina-50mg',
    name: 'Lamotrigina 50mg comprimido (Lamictal, Neural)',
    activeIngredient: 'Lamotrigina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (50mg) via oral 1 a 2 vezes ao dia conforme escalonamento.',
    isSpecialControl: true
  },
  {
    id: 'lamotrigina-100mg',
    name: 'Lamotrigina 100mg comprimido (Lamictal, Neural)',
    activeIngredient: 'Lamotrigina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral de 12 em 12 horas (ou 1 vez ao dia).',
    isSpecialControl: true
  },
  {
    id: 'carbonato-litio-300mg',
    name: 'Carbonato de Lítio 300mg comprimido (Carbolitium)',
    activeIngredient: 'Carbonato de lítio',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (300mg) via oral de 12 em 12 horas (ajustar conforme litemia sérica).',
    isSpecialControl: true
  },
  {
    id: 'carbonato-litio-450mg-cr',
    name: 'Carbonato de Lítio CR 450mg liberação controlada (Carbolitium CR)',
    activeIngredient: 'Carbonato de lítio',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos (450mg CR) via oral à noite (ou de 12/12h conforme litemia).',
    isSpecialControl: true
  },
  {
    id: 'topiramato-25mg',
    name: 'Topiramato 25mg comprimido revestido (Topamax, Amato)',
    activeIngredient: 'Topiramato',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral à noite (ou de 12/12h).',
    isSpecialControl: true
  },
  {
    id: 'topiramato-50mg',
    name: 'Topiramato 50mg comprimido revestido (Topamax, Amato)',
    activeIngredient: 'Topiramato',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (50mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'topiramato-100mg',
    name: 'Topiramato 100mg comprimido revestido (Topamax, Amato)',
    activeIngredient: 'Topiramato',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral de 12 em 12 horas.',
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
    id: 'oxcarbazepina-300mg',
    name: 'Oxcarbazepina 300mg comprimido revestido (Trileptal)',
    activeIngredient: 'Oxcarbazepina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (300mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'oxcarbazepina-600mg',
    name: 'Oxcarbazepina 600mg comprimido revestido (Trileptal)',
    activeIngredient: 'Oxcarbazepina',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (600mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'levetiracetam-250mg',
    name: 'Levetiracetam 250mg comprimido revestido (Keppra, Etira)',
    activeIngredient: 'Levetiracetam',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (250mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'levetiracetam-500mg',
    name: 'Levetiracetam 500mg comprimido revestido (Keppra, Etira)',
    activeIngredient: 'Levetiracetam',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (500mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'levetiracetam-750mg',
    name: 'Levetiracetam 750mg comprimido revestido (Keppra, Etira)',
    activeIngredient: 'Levetiracetam',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '60 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (750mg) via oral de 12 em 12 horas.',
    isSpecialControl: true
  },
  {
    id: 'fenitoina-100mg',
    name: 'Fenitoína Sódica 100mg comprimido (Hidantal)',
    activeIngredient: 'Fenitoína sódica',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '90 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral de 8 em 8 horas (ou 300mg à noite).',
    isSpecialControl: true
  },
  {
    id: 'fenobarbital-100mg',
    name: 'Fenobarbital 100mg comprimido (Gardenal)',
    activeIngredient: 'Fenobarbital',
    route: 'Uso Oral',
    category: 'snc',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (100mg) via oral 1 vez ao dia à noite ao deitar.',
    isSpecialControl: true
  },
];
