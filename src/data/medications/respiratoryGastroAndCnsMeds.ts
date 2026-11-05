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
    id: 'mometasona-spray-nasal-50mcg',
    name: 'Furoato de Mometasona Spray Nasal 50mcg/jato (Nasonex, Neocort)',
    activeIngredient: 'Furoato de mometasona',
    route: 'Uso Nasal',
    category: 'respiratorio',
    defaultQuantity: '1 frasco spray (120 doses)',
    defaultPosology: 'Aplicar 2 jatos em cada narina 1 vez ao dia (crianças 2 a 11 anos: 1 jato em cada narina 1x/dia).'
  },
  {
    id: 'fluticasona-spray-nasal-27-5mcg',
    name: 'Furoato de Fluticasona Spray Nasal 27,5mcg/jato (Avamys, Flutican)',
    activeIngredient: 'Furoato de fluticasona',
    route: 'Uso Nasal',
    category: 'respiratorio',
    defaultQuantity: '1 frasco spray (120 doses)',
    defaultPosology: 'Aplicar 2 jatos em cada narina 1 vez ao dia (manutenção: 1 jato em cada narina 1x/dia).'
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
    id: 'montelucaste-10mg',
    name: 'Montelucaste de Sódio 10mg comprimido revestido (Singulair, Piemont)',
    activeIngredient: 'Montelucaste de sódio',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia à noite (a partir de 15 anos).'
  },
  {
    id: 'montelucaste-5mg',
    name: 'Montelucaste de Sódio 5mg comprimido mastigável (Singulair Baby/Ped, Piemont)',
    activeIngredient: 'Montelucaste de sódio',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '30 comprimidos mastigáveis',
    defaultPosology: 'Mastigar 1 comprimido (5mg) via oral 1 vez ao dia à noite (crianças de 6 a 14 anos).'
  },
  {
    id: 'montelucaste-4mg',
    name: 'Montelucaste de Sódio 4mg comprimido mastigável / sachê granulado (Singulair, Piemont)',
    activeIngredient: 'Montelucaste de sódio',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '30 comprimidos mastigáveis',
    defaultPosology: 'Administrar 1 comprimido mastigável ou sachê (4mg) 1 vez ao dia à noite (crianças de 2 a 5 anos).'
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
    id: 'desloratadina-xarope-0-5mg',
    name: 'Desloratadina 0,5mg/mL xarope / solução oral (Desalex, Esalerg)',
    activeIngredient: 'Desloratadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (60 mL)',
    defaultPosology: '6 a 11 meses: 2mL 1x/dia; 1 a 5 anos: 2,5mL 1x/dia; 6 a 11 anos: 5mL 1x/dia.',
    isPediatric: true,
    pediatricDoseMgKg: 0.1,
    pediatricConcentrationMgMl: 0.5,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 5
  },
  {
    id: 'bilastina-20mg',
    name: 'Bilastina 20mg comprimido (Alektos)',
    activeIngredient: 'Bilastina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia em jejum (1h antes ou 2h após refeição).'
  },
  {
    id: 'bilastina-sol-oral-2-5mg',
    name: 'Bilastina 2,5mg/mL solução oral pediátrica (Alektos Ped)',
    activeIngredient: 'Bilastina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (120 mL)',
    defaultPosology: 'Crianças 6 a 11 anos (≥ 20 kg): dar 4mL (10mg) via oral 1 vez ao dia longe das refeições.'
  },
  {
    id: 'fexofenadina-60mg',
    name: 'Cloridrato de Fexofenadina 60mg comprimido (Allegra)',
    activeIngredient: 'Cloridrato de fexofenadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (60mg) via oral de 12 em 12 horas.'
  },
  {
    id: 'fexofenadina-120mg',
    name: 'Cloridrato de Fexofenadina 120mg comprimido (Allegra)',
    activeIngredient: 'Cloridrato de fexofenadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (120mg) via oral 1 vez ao dia (rinite alérgica).'
  },
  {
    id: 'fexofenadina-180mg',
    name: 'Cloridrato de Fexofenadina 180mg comprimido (Allegra)',
    activeIngredient: 'Cloridrato de fexofenadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (180mg) via oral 1 vez ao dia (urticária).'
  },
  {
    id: 'fexofenadina-susp-6mg',
    name: 'Cloridrato de Fexofenadina 6mg/mL suspensão oral pediátrica (Allegra Pediátrico)',
    activeIngredient: 'Cloridrato de fexofenadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (150 mL)',
    defaultPosology: '6 meses a 2 anos: 2,5mL (15mg) de 12/12h; 2 a 11 anos: 5mL (30mg) de 12/12h.'
  },
  {
    id: 'levocetirizina-5mg',
    name: 'Dicloridrato de Levocetirizina 5mg comprimido (Zyxem, Zina)',
    activeIngredient: 'Dicloridrato de levocetirizina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (5mg) via oral 1 vez ao dia.'
  },
  {
    id: 'levocetirizina-gotas-5mg',
    name: 'Dicloridrato de Levocetirizina 5mg/mL gotas (Zyxem Gotas)',
    activeIngredient: 'Dicloridrato de levocetirizina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: '2 a 6 anos: 5 gotas de 12/12h; > 6 anos e adultos: 20 gotas (5mg) 1 vez ao dia.'
  },
  {
    id: 'ebastina-10mg',
    name: 'Ebastina 10mg comprimido (Ebastel)',
    activeIngredient: 'Ebastina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos (10mg a 20mg) via oral 1 vez ao dia.'
  },
  {
    id: 'ebastina-xarope-1mg',
    name: 'Ebastina 1mg/mL xarope (Ebastel Xarope)',
    activeIngredient: 'Ebastina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '1 frasco (120 mL)',
    defaultPosology: '2 a 5 anos: 2,5mL 1x/dia; 6 a 11 anos: 5mL 1x/dia.'
  },
  {
    id: 'rupatadina-10mg',
    name: 'Fumarato de Rupatadina 10mg comprimido (Rupafin)',
    activeIngredient: 'Fumarato de rupatadina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia.'
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
    id: 'prometazina-25mg',
    name: 'Cloridrato de Prometazina 25mg comprimido (Fenergan)',
    activeIngredient: 'Cloridrato de prometazina',
    route: 'Uso Oral',
    category: 'respiratorio',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (25mg) via oral à noite ao deitar (ou de 8/8h em reação alérgica aguda).'
  },
  {
    id: 'prometazina-ampola-50mg',
    name: 'Cloridrato de Prometazina 50mg/2mL solução injetável IM (Fenergan Injetável)',
    activeIngredient: 'Cloridrato de prometazina',
    route: 'Uso Intramuscular',
    category: 'respiratorio',
    defaultQuantity: '1 ampola (2 mL)',
    defaultPosology: 'Aplicar 1 ampola (50mg = 2mL) por via intramuscular profunda.'
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
  // 6. GASTROENTEROLOGIA, IBPs, P-CAB E REIDRATAÇÃO
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
    id: 'omeprazol-40mg',
    name: 'Omeprazol 40mg cápsula (Losec MUPS, Victrix, Peprazol)',
    activeIngredient: 'Omeprazol magnésico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (40mg) pela manhã em jejum 30 minutos antes do café da manhã.'
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
    id: 'pantoprazol-20mg',
    name: 'Pantoprazol 20mg comprimido revestido (Pantozol, Adipept)',
    activeIngredient: 'Pantoprazol sódico sesqui-hidratado',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) pela manhã em jejum 30 minutos antes do café.'
  },
  {
    id: 'esomeprazol-20mg',
    name: 'Esomeprazol Magnésico 20mg comprimido revestido (Nexium, Esomex)',
    activeIngredient: 'Esomeprazol magnésico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) pela manhã em jejum 30 minutos antes da refeição.'
  },
  {
    id: 'esomeprazol-40mg',
    name: 'Esomeprazol Magnésico 40mg comprimido revestido (Nexium, Esomex)',
    activeIngredient: 'Esomeprazol magnésico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (40mg) pela manhã em jejum 30 minutos antes da refeição.'
  },
  {
    id: 'lansoprazol-15mg',
    name: 'Lansoprazol 15mg cápsula de liberação retardada (Ogastro, Prazol)',
    activeIngredient: 'Lansoprazol',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (15mg) pela manhã em jejum 30 minutos antes do café.'
  },
  {
    id: 'lansoprazol-30mg',
    name: 'Lansoprazol 30mg cápsula de liberação retardada (Ogastro, Prazol)',
    activeIngredient: 'Lansoprazol',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (30mg) pela manhã em jejum 30 minutos antes do café.'
  },
  {
    id: 'dexlansoprazol-30mg',
    name: 'Dexlansoprazol 30mg cápsula de liberação dupla retardada (Dexilant)',
    activeIngredient: 'Dexlansoprazol',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (30mg) via oral 1 vez ao dia (independente das refeições).'
  },
  {
    id: 'dexlansoprazol-60mg',
    name: 'Dexlansoprazol 60mg cápsula de liberação dupla retardada (Dexilant)',
    activeIngredient: 'Dexlansoprazol',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '30 cápsulas',
    defaultPosology: 'Tomar 1 cápsula (60mg) via oral 1 vez ao dia por 4 a 8 semanas.'
  },
  {
    id: 'rabeprazol-10mg',
    name: 'Rabeprazol Sódico 10mg comprimido revestido (Pariet)',
    activeIngredient: 'Rabeprazol sódico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia pela manhã em jejum.'
  },
  {
    id: 'rabeprazol-20mg',
    name: 'Rabeprazol Sódico 20mg comprimido revestido (Pariet)',
    activeIngredient: 'Rabeprazol sódico',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '28 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia pela manhã em jejum.'
  },
  {
    id: 'vonoprazana-10mg',
    name: 'Fumarato de Vonoprazana 10mg comprimido revestido (Inzelm)',
    activeIngredient: 'Fumarato de vonoprazana',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (10mg) via oral 1 vez ao dia (manutenção DRGE, com ou sem alimentos).'
  },
  {
    id: 'vonoprazana-20mg',
    name: 'Fumarato de Vonoprazana 20mg comprimido revestido (Inzelm)',
    activeIngredient: 'Fumarato de vonoprazana',
    route: 'Uso Oral',
    category: 'gastro',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (20mg) via oral 1 vez ao dia por 4 a 8 semanas (esofagite erosiva / erradicação H. pylori).'
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
