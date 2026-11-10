import type { UnifiedMedication } from '../medicationDatabase';
import { CNS_ANTIDEPRESSANTS_MEDS } from './cnsAntidepressantsMeds';
import { CNS_MOOD_STABILIZERS_AND_ANTICONVULSANTS_MEDS } from './cnsMoodStabilizersAndAnticonvulsantsMeds';
import { CNS_ANTIPSYCHOTICS_SEDATIVES_AND_OPHTHALMIC_MEDS } from './cnsAntipsychoticsSedativesAndOphthalmicMeds';

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

  ...CNS_ANTIDEPRESSANTS_MEDS,
  ...CNS_MOOD_STABILIZERS_AND_ANTICONVULSANTS_MEDS,
  ...CNS_ANTIPSYCHOTICS_SEDATIVES_AND_OPHTHALMIC_MEDS
];
