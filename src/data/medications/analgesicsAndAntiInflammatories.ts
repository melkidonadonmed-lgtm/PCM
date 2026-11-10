import type { UnifiedMedication } from '../medicationDatabase';
import { OPIOIDS_STEROIDS_AND_TRIPTANS_MEDS } from './opioidsSteroidsAndTriptans';

export const ANALGESICS_AND_AINES: UnifiedMedication[] = [
  // ==========================================
  // 1. ANALGÉSICOS, ANTITÉRMICOS E ANTI-INFLAMATÓRIOS (AINES)
  // ==========================================
  {
    id: 'dipirona-500mg',
    name: 'Dipirona Sódica 500mg comprimido (Novalgina, Anador)',
    activeIngredient: 'Dipirona monoidratada',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre.'
  },
  {
    id: 'dipirona-1g',
    name: 'Dipirona Sódica 1g comprimido (Novalgina 1g)',
    activeIngredient: 'Dipirona monoidratada',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas se dor ou febre intensa.'
  },
  {
    id: 'dipirona-gotas-500mg',
    name: 'Dipirona Sódica 500mg/mL gotas (Novalgina Gotas)',
    activeIngredient: 'Dipirona monoidratada',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar 1 gota por kg de peso de 6 em 6 horas se dor ou febre (máx 40 gotas).',
    isPediatric: true,
    pediatricDoseMgKg: 20,
    pediatricConcentrationMgMl: 500,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 1000
  },
  {
    id: 'dipirona-ampola',
    name: 'Dipirona Sódica 500mg/mL ampola 2mL (1g) / 5mL (2,5g)',
    activeIngredient: 'Dipirona monoidratada',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Aplicar 1 ampola (1g) IV lenta diluída em 100mL SF 0,9% de 6/6h.'
  },
  {
    id: 'paracetamol-500mg',
    name: 'Paracetamol 500mg comprimido (Tylenol, Sonridor)',
    activeIngredient: 'Paracetamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas em caso de dor ou febre (máx 4g/dia).'
  },
  {
    id: 'paracetamol-750mg',
    name: 'Paracetamol 750mg comprimido (Tylenol 750)',
    activeIngredient: 'Paracetamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 6 em 6 horas se dor ou febre.'
  },
  {
    id: 'paracetamol-gotas-200mg',
    name: 'Paracetamol 200mg/mL gotas (Tylenol Gotas)',
    activeIngredient: 'Paracetamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Tomar 1 gota por kg de peso de 6 em 6 horas se dor ou febre (máx 35 gotas).',
    isPediatric: true,
    pediatricDoseMgKg: 15,
    pediatricConcentrationMgMl: 200,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 750
  },
  {
    id: 'paracetamol-gotas-100mg-bebe',
    name: 'Paracetamol 100mg/mL gotas bebê (Tylenol Bebê)',
    activeIngredient: 'Paracetamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Administrar 1 dose calculada com seringa dosadora de 6 em 6 horas.',
    isPediatric: true,
    pediatricDoseMgKg: 15,
    pediatricConcentrationMgMl: 100,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 500
  },
  {
    id: 'paracetamol-solucao-32mg',
    name: 'Paracetamol 32mg/mL (160mg/5mL) solução oral',
    activeIngredient: 'Paracetamol',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (60 mL)',
    defaultPosology: 'Dar volume calculado em mL de 6 em 6 horas se dor ou febre.',
    isPediatric: true,
    pediatricDoseMgKg: 15,
    pediatricConcentrationMgMl: 32,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 750
  },
  {
    id: 'ibuprofeno-600mg',
    name: 'Ibuprofeno 600mg comprimido (Advil, Alivium, Buprovil)',
    activeIngredient: 'Ibuprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas após refeições por 3 a 5 dias.'
  },
  {
    id: 'ibuprofeno-400mg',
    name: 'Ibuprofeno 400mg comprimido / cápsula (Advil 400)',
    activeIngredient: 'Ibuprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '16 cápsulas',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 3 a 5 dias.'
  },
  {
    id: 'ibuprofeno-100mg-gotas',
    name: 'Ibuprofeno 100mg/mL gotas (Alivium 100)',
    activeIngredient: 'Ibuprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar 1 gota por kg de peso de 8 em 8 horas por 3 dias se dor ou febre (máx 30-40 gotas).',
    isPediatric: true,
    pediatricDoseMgKg: 10,
    pediatricConcentrationMgMl: 100,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 400
  },
  {
    id: 'ibuprofeno-50mg-gotas',
    name: 'Ibuprofeno 50mg/mL gotas (Alivium 50)',
    activeIngredient: 'Ibuprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (30 mL)',
    defaultPosology: 'Tomar 2 gotas por kg de peso de 8 em 8 horas por 3 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 10,
    pediatricConcentrationMgMl: 50,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 400
  },
  {
    id: 'ibuprofeno-30mg-susp',
    name: 'Ibuprofeno 30mg/mL suspensão oral (Alivium)',
    activeIngredient: 'Ibuprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (100 mL)',
    defaultPosology: 'Dar volume calculado em mL de 8 em 8 horas por 3 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 10,
    pediatricConcentrationMgMl: 30,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 400
  },
  {
    id: 'cetoprofeno-100mg',
    name: 'Cetoprofeno 100mg comprimido (Profenid)',
    activeIngredient: 'Cetoprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas por 3 a 5 dias.'
  },
  {
    id: 'cetoprofeno-150mg-biprofenid',
    name: 'Cetoprofeno 150mg comprimido lib. prolongada (Bi-Profenid)',
    activeIngredient: 'Cetoprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia por 3 a 5 dias.'
  },
  {
    id: 'cetoprofeno-gotas-20mg',
    name: 'Cetoprofeno 20mg/mL gotas (Profenid Gotas)',
    activeIngredient: 'Cetoprofeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar 1 gota por kg de peso corporal de 8 em 8 horas por 3 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 1,
    pediatricConcentrationMgMl: 20,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 50
  },
  {
    id: 'cetoprofeno-injetavel-100mg',
    name: 'Cetoprofeno 100mg pó liofilizado injetável IV/IM',
    activeIngredient: 'Cetoprofeno',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 frascos-ampola',
    defaultPosology: 'Infundir 100mg diluído em 100mL SF 0,9% IV de 12/12h por até 48h.'
  },
  {
    id: 'diclofenaco-sodico-50mg',
    name: 'Diclofenaco Sódico 50mg comprimido (Voltaren)',
    activeIngredient: 'Diclofenaco sódico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 3 a 5 dias.'
  },
  {
    id: 'diclofenaco-sodico-75mg-retard',
    name: 'Diclofenaco Sódico 75mg / 100mg lib. prolongada (Voltaren Retard/SR)',
    activeIngredient: 'Diclofenaco sódico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia após refeição.'
  },
  {
    id: 'diclofenaco-potassico-50mg',
    name: 'Diclofenaco Potássico 50mg comprimido (Cataflam)',
    activeIngredient: 'Diclofenaco potássico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 drágeas',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 3 dias.'
  },
  {
    id: 'diclofenaco-potassico-gotas-15mg',
    name: 'Diclofenaco Potássico 15mg/mL gotas (Cataflam Gotas)',
    activeIngredient: 'Diclofenaco potássico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (20 mL)',
    defaultPosology: 'Tomar 1 gota por kg de peso corporal de 8 em 8 horas por 3 dias.',
    isPediatric: true,
    pediatricDoseMgKg: 1,
    pediatricConcentrationMgMl: 15,
    pediatricUnitType: 'drops',
    pediatricMaxDoseMg: 50
  },
  {
    id: 'diclofenaco-ampola-75mg',
    name: 'Diclofenaco Sódico 75mg/3mL ampola IM (Voltaren)',
    activeIngredient: 'Diclofenaco sódico',
    route: 'Uso Intramuscular',
    category: 'analgesicos',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Aplicar 1 ampola (75mg) IM profundo 1 vez ao dia por no máx 2 dias.'
  },
  {
    id: 'meloxicam-15mg',
    name: 'Meloxicam 15mg comprimido (Movatec, Bioflac)',
    activeIngredient: 'Meloxicam',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia após o almoço por 5 a 7 dias.'
  },
  {
    id: 'meloxicam-7-5mg',
    name: 'Meloxicam 7,5mg comprimido (Movatec, Bioflac)',
    activeIngredient: 'Meloxicam',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia.'
  },
  {
    id: 'nimesulida-100mg',
    name: 'Nimesulida 100mg comprimido (Nisulid, Maxsulid)',
    activeIngredient: 'Nimesulida',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '12 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 12 em 12 horas após refeições por no máx 5 dias (Adultos e ≥ 12 anos).'
  },
  {
    id: 'nimesulida-gotas-50mg',
    name: 'Nimesulida 50mg/mL gotas (Nisulid Gotas)',
    activeIngredient: 'Nimesulida',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (15 mL)',
    defaultPosology: 'Tomar 1 gota por kg a cada 12 horas por no máx 5 dias (Restrito a ≥ 12 anos).'
  },
  {
    id: 'celecoxibe-200mg',
    name: 'Celecoxibe 200mg cápsulas (Celebra)',
    activeIngredient: 'Celecoxibe',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 a 2 vezes ao dia por 5 a 7 dias.'
  },
  {
    id: 'etoricoxibe-90mg',
    name: 'Etoricoxibe 90mg comprimido (Arcoxia)',
    activeIngredient: 'Etoricoxibe',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '7 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral 1 vez ao dia por até 5 dias.'
  },
  {
    id: 'naproxeno-500mg',
    name: 'Naproxeno 500mg comprimido (Flanax 550mg)',
    activeIngredient: 'Naproxeno',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 12 em 12 horas por 3 a 5 dias.'
  },
  {
    id: 'tenoxicam-20mg',
    name: 'Tenoxicam 20mg comprimido / pó injetável (Tilatil, Teflan)',
    activeIngredient: 'Tenoxicam',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (ou 1 ampola IV/IM) 1 vez ao dia por 5 dias.'
  },
  {
    id: 'piroxicam-20mg',
    name: 'Piroxicam 20mg cápsula (Feldene)',
    activeIngredient: 'Piroxicam',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '15 cápsulas',
    defaultPosology: 'Tomar 1 cápsula via oral 1 vez ao dia junto à refeição.'
  },
  {
    id: 'acido-mefenamico-500mg',
    name: 'Ácido Mefenâmico 500mg comprimido (Ponstan)',
    activeIngredient: 'Ácido mefenâmico',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '24 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas durante o período de dor.'
  },
  {
    id: 'clonixinato-lisina-ciclobenzaprina',
    name: 'Clonixinato de Lisina + Ciclobenzaprina (Dolamin Flex)',
    activeIngredient: 'Clonixinato de lisina + ciclobenzaprina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '15 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas por 3 a 5 dias.'
  },
  {
    id: 'buscopan-composto-comp',
    name: 'Escopolamina + Dipirona comprimido (Buscopan Composto)',
    activeIngredient: 'Butilbrometo de escopolamina + dipirona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos via oral de 8 em 8 horas se dor em cólica.'
  },
  {
    id: 'buscopan-composto-ampola',
    name: 'Escopolamina + Dipirona ampola 5mL (Buscopan Composto)',
    activeIngredient: 'Butilbrometo de escopolamina + dipirona',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Infundir 1 ampola diluída em 100mL SF 0,9% IV lento.'
  },
  {
    id: 'dorflex-comp',
    name: 'Dipirona + Orfenadrina + Cafeína (Dorflex)',
    activeIngredient: 'Dipirona + citrato de orfenadrina + cafeína',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '24 comprimidos',
    defaultPosology: 'Tomar 1 a 2 comprimidos (ou 30 a 60 gotas) de 6 em 6 horas se dor muscular.'
  },
  {
    id: 'torsilax-comp',
    name: 'Paracetamol + Cafeína + Carisoprodol + Diclofenaco (Torsilax, Tandrilax)',
    activeIngredient: 'Paracetamol + carisoprodol + diclofenaco + cafeína',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '30 comprimidos',
    defaultPosology: 'Tomar 1 comprimido de 12 em 12 horas por no máx 5 dias.'
  },
  {
    id: 'neosaldina-drageas',
    name: 'Dipirona + Isometepteno + Cafeína (Neosaldina)',
    activeIngredient: 'Dipirona + mucato de isometepteno + cafeína',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 drágeas',
    defaultPosology: 'Tomar 1 a 2 drágeas (ou 30 a 60 gotas) de 6 em 6 horas se cefaleia.'
  },
  {
    id: 'dramin-b6-comp',
    name: 'Dimenidrinato + Piridoxina (Dramin B6)',
    activeIngredient: 'Dimenidrinato + cloridrato de piridoxina',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido (ou 20 a 40 gotas) de 6 em 6 horas se náuseas ou vômitos.'
  },
  {
    id: 'plasil-10mg',
    name: 'Metoclopramida 10mg comprimido (Plasil)',
    activeIngredient: 'Cloridrato de metoclopramida',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '20 comprimidos',
    defaultPosology: 'Tomar 1 comprimido via oral de 8 em 8 horas 30 min antes das refeições.'
  },
  {
    id: 'ondansetrona-4mg-flash',
    name: 'Ondansetrona 4mg orodispersível (Vonau Flash, Ono)',
    activeIngredient: 'Cloridrato de ondansetrona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '10 comprimidos',
    defaultPosology: 'Dissolver 1 comprimido sobre a língua de 8 em 8 horas se náuseas/vômitos.'
  },
  {
    id: 'ondansetrona-sol-oral-0-8mg',
    name: 'Ondansetrona 0,8mg/mL (4mg/5mL) solução oral (Vonau)',
    activeIngredient: 'Cloridrato de ondansetrona',
    route: 'Uso Oral',
    category: 'analgesicos',
    defaultQuantity: '1 frasco (50 mL)',
    defaultPosology: 'Dar 0,15 mg/kg de 8 em 8 horas se náuseas ou vômitos persistentes.',
    isPediatric: true,
    pediatricDoseMgKg: 0.15,
    pediatricConcentrationMgMl: 0.8,
    pediatricUnitType: 'ml',
    pediatricMaxDoseMg: 8
  },
  {
    id: 'ondansetrona-ampola-4mg',
    name: 'Ondansetrona 2mg/mL ampola 2mL (4mg) e 4mL (8mg)',
    activeIngredient: 'Cloridrato de ondansetrona',
    route: 'Uso Intravenoso',
    category: 'analgesicos',
    defaultQuantity: '2 ampolas',
    defaultPosology: 'Infundir 4mg a 8mg IV lento ou diluído em 100mL SF 0,9% a cada 8 horas.'
  },
  ...OPIOIDS_STEROIDS_AND_TRIPTANS_MEDS,
];
