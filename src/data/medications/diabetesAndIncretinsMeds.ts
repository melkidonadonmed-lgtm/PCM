import type { UnifiedMedication } from '../medicationDatabase';

export const DIABETES_AND_INCRETINS_MEDS: UnifiedMedication[] = [
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
];
