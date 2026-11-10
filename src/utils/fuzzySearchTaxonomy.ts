/**
 * Prefixos de sais e ésteres farmacêuticos que não devem impedir o match direto
 * pelo nome da substância ativa principal (ex.: "Cloridrato de Metformina" -> "metformina",
 * "Dipropionato de Beclometasona" -> "beclometasona").
 */
export const SALT_AND_ESTER_PREFIXES: readonly string[] = [
  'dipropionato + fosfato de ',
  'fosfato dissodico de ',
  'succinato sodico de ',
  'fosfato sodico de ',
  'hemitartarato de ',
  'dicloridrato de ',
  'butilbrometo de ',
  'hemifumarato de ',
  'dipropionato de ',
  'cloridrato de ',
  'bromidrato de ',
  'bissulfato de ',
  'propionato de ',
  'etexilato de ',
  'tartarato de ',
  'succinato de ',
  'trometamol ',
  'besilato de ',
  'benzoato de ',
  'fumarato de ',
  'mesilato de ',
  'valerato de ',
  'maleato de ',
  'brometo de ',
  'oxalato de ',
  'fosfato de ',
  'hiclato de ',
  'furoato de ',
  'acetato de ',
  'citrato de ',
  'mucato de ',
  'axetil',
];

/**
 * Mapeamento clínico avançado de classes terapêuticas, sinônimos médicos, indicações e sintomas comuns.
 */
export interface TherapeuticCategoryMap {
  canonicalCategory: string;
  keywords: string[];
  displayName: string;
  badgeColor?: string;
}

export const THERAPEUTIC_CLASSES: TherapeuticCategoryMap[] = [
  {
    canonicalCategory: 'analgesicos',
    displayName: 'Analgésicos & Antitérmicos',
    keywords: [
      'analgesico', 'antitermico', 'antalgico', 'analgesia', 'antipiretico',
      'dor', 'febre', 'cefaleia', 'enxaqueca', 'dor de cabeca', 'dor muscular',
      'dipirona', 'paracetamol', 'novalgina', 'tylenol', 'tramadol', 'codeina',
      'antiinflamatorio', 'anti-inflamatorio', 'aine', 'inflamacao', 'edema',
      'dor de garganta', 'garganta inflamada', 'artrite', 'artrose', 'tendinite',
      'entorse', 'trauma', 'dor articular', 'ibuprofeno', 'cetoprofeno', 'advil',
      'alivium', 'profenid', 'nimesulida', 'diclofenaco', 'toragesic', 'cetorolaco',
      'etoricoxibe', 'arcoxia', 'celecoxibe', 'celebra', 'naproxeno', 'flanax',
      'aceclofenaco', 'proflam', 'dexketoprofeno', 'indometacina', 'lornoxicam',
      'ciclobenzaprina', 'mioson', 'baclofeno', 'deflazacorte', 'triptano',
      'triptanos', 'sumatriptana', 'sumax', 'naratriptana', 'naramig',
      'zolmitriptana', 'zomig', 'rizatriptana', 'maxalt'
    ]
  },
  {
    canonicalCategory: 'antibioticos',
    displayName: 'Antibióticos & Antimicrobianos',
    keywords: [
      'antibiotico', 'antimicrobiano', 'antibacteriano', 'atb', 'infeccao',
      'infeccao bacteriana', 'bacteria', 'penicilina', 'cefalosporina', 'macrolideo',
      'quinolona', 'amoxicilina', 'clavulanato', 'clavulin', 'azitromicina', 'astro',
      'cefalexina', 'keflex', 'cefuroxima', 'zinnat', 'ceftriaxona', 'rocefin',
      'ciprofloxacino', 'cipro', 'levofloxacino', 'bactrim', 'sulfametoxazol',
      'nitrofurantoina', 'macrodantina', 'sinusite', 'amigdalite', 'faringite',
      'pneumonia', 'otite', 'itu', 'infeccao urinaria', 'cistite', 'erisipela',
      'conjuntivite', 'colirio antibiotico', 'tobramicina', 'tobrex', 'tobradex',
      'moxifloxacino', 'vigamox', 'vigadexa', 'ciloxan', 'cilodex', 'gatifloxacino',
      'zymar', 'zypred', 'ofloxacino', 'floxestat'
    ]
  },
  {
    canonicalCategory: 'respiratorio',
    displayName: 'Broncodilatadores, Antialérgicos & Respiratório',
    keywords: [
      'broncodilatador', 'respiratorio', 'pulmonar', 'asma', 'bronquite', 'chiado',
      'dispneia', 'falta de ar', 'nebulizacao', 'inalacao', 'bombinha', 'tosse',
      'salbutamol', 'aerolin', 'atrovent', 'ipratropio', 'berotec', 'fenoterol',
      'corticoide', 'corticoesteroide', 'esteroide', 'anti-inflamatorio esteroidal',
      'prednisolona', 'prelone', 'prednisona', 'meticorten', 'dexametasona', 'decadron',
      'budesonida', 'pulmicort', 'fluticasona', 'avamys', 'flixotide', 'beclometasona',
      'clenil', 'mometasona', 'nasonex', 'montelucaste', 'singulair',
      'laringite', 'croup', 'estridor', 'crise de asma', 'edema de glote',
      'antialergico', 'anti-histaminico', 'antihistaminico', 'alergia', 'rinite',
      'urticaria', 'prurido', 'coceira', 'coriza', 'espirros', 'picada de inseto',
      'loratadina', 'claritin', 'desloratadina', 'desalex', 'cetirizina', 'zyrtec',
      'hidroxizina', 'hixizine', 'dexclorfeniramina', 'polaramine', 'bilastina',
      'alektos', 'fexofenadina', 'allegra', 'levocetirizina', 'zyxem', 'ebastina',
      'ebastel', 'rupatadina', 'rupafin', 'prometazina', 'fenergan'
    ]
  },
  {
    canonicalCategory: 'cardio',
    displayName: 'Anti-hipertensivos & Cardiovasculares',
    keywords: [
      'antihipertensivo', 'anti-hipertensivo', 'pressao', 'pressao alta', 'hipertensao',
      'has', 'cardiovascular', 'coracao', 'cardiologia', 'betabloqueador', 'ieca', 'bra',
      'diuretico', 'losartana', 'atenolol', 'propranolol', 'metoprolol', 'selozok',
      'carvedilol', 'anlodipino', 'norvasc', 'enalapril', 'renitec', 'captopril',
      'hidroclorotiazida', 'furosemida', 'lasix', 'espironolactona', 'aldactone',
      'olmesartana', 'benicar', 'valsartana', 'diovan', 'candesartana', 'atacand',
      'telmisartana', 'micardis', 'irbesartana', 'aprovel', 'ramipril', 'triatec',
      'perindopril', 'coversyl', 'lisinopril', 'levanlodipino', 'novanlo',
      'lercanidipino', 'zanidip', 'nifedipino', 'adalat', 'indapamida', 'natrilix',
      'clortalidona', 'higroton', 'nebivolol', 'nebilet', 'bisoprolol', 'concor',
      'sacubitril', 'entresto', 'hidralazina', 'clonidina', 'atensina', 'doxazosina',
      'apixabana', 'eliquis', 'dabigatrana', 'pradaxa', 'ezetimiba', 'zetia',
      'hipolipemiante', 'estatina', 'colesterol', 'triglicerideos', 'dislipidemia',
      'gordura no sangue', 'atorvastatina', 'lipitor', 'rosuvastatina', 'crestor',
      'sinvastatina'
    ]
  },
  {
    canonicalCategory: 'diabetes',
    displayName: 'Antidiabéticos, Tireoide & Metabólicos',
    keywords: [
      'antidiabetico', 'diabetes', 'glicemia', 'acucar no sangue', 'insulina',
      'hipoglicemiante', 'dm2', 'dm', 'metformina', 'glifage', 'gliclazida', 'diamicron',
      'insulina nph', 'insulina regular', 'glargina', 'lantus', 'basaglar', 'toujeo',
      'degludeca', 'tresiba', 'lispro', 'humalog', 'asparte', 'novorapid',
      'sglt2', 'dpp4', 'glp1', 'dapagliflozina', 'forxiga', 'xigduo',
      'empagliflozina', 'jardiance', 'glyxambi', 'sitagliptina', 'januvia', 'janumet',
      'vildagliptina', 'galvus', 'linagliptina', 'trayenta', 'alogliptina', 'nesina',
      'semaglutida', 'ozempic', 'rybelsus', 'wegovy', 'tirzepatida', 'mounjaro',
      'liraglutida', 'victoza', 'saxenda', 'dulaglutida', 'trulicity',
      'glimepirida', 'amaryl', 'pioglitazona', 'levotiroxina', 'tiroxina',
      'hipotireoidismo', 'tireoide', 'puran', 'euthyrox', 'synthroid', 'levoid'
    ]
  },
  {
    canonicalCategory: 'gastro',
    displayName: 'Gastrointestinais & Digestivos',
    keywords: [
      'gastro', 'gastrointestinal', 'gastroprotetor', 'protetor gastrico', 'estomago',
      'gastrite', 'refluxo', 'azia', 'pirose', 'ibp', 'pcab', 'drge', 'esofagite',
      'antiacido', 'ulcera', 'omeprazol', 'pantoprazol', 'esomeprazol', 'nexium',
      'lansoprazol', 'ogastro', 'dexlansoprazol', 'dexilant', 'rabeprazol', 'pariet',
      'vonoprazana', 'inzelm', 'antiemetico', 'enjoo', 'vomito',
      'nausea', 'ondansetrona', 'vonau', 'domperidona', 'motilium', 'metoclopramida',
      'plasil', 'simeticona', 'luftal', 'gases', 'colica intestinal',
      'laxativo', 'constipacao', 'prisao de ventre', 'intestino preso', 'evacuacao',
      'lactulose', 'polietilenoglicol', 'peg 4000', 'muvinlax', 'tamarine',
      'antiparasitario', 'vermifugo', 'verme', 'parasita', 'parasitose', 'lombriga',
      'ameba', 'giardia', 'oxiuro', 'escabiose', 'sarna', 'piolho', 'pediculose',
      'albendazol', 'zentel', 'mebendazol', 'pantelmin', 'ivermectina', 'revectina',
      'nitazoxanida', 'annita'
    ]
  },
  {
    canonicalCategory: 'snc',
    displayName: 'Sistema Nervoso Central & Psicotrópicos',
    keywords: [
      'psicotropico', 'saude mental', 'ansiolitico', 'calmante', 'sedativo',
      'tarja preta', 'benzodiazepinico', 'sono', 'insonia', 'ansiedade', 'tag',
      'antidepressivo', 'depressao', 'panico', 'isrs', 'irsn', 'humor',
      'estabilizador de humor', 'estabilizadores de humor', 'bipolar', 'tab',
      'antipsicotico', 'antipsicoticos', 'esquizofrenia', 'neuralgia', 'fibromialgia',
      'neuropatia', 'clonazepam', 'rivotril', 'diazepam', 'valium', 'alprazolam',
      'frontan', 'zolpidem', 'stilnox', 'fluoxetina', 'prozac', 'sertralina',
      'zoloft', 'escitalopram', 'lexapro', 'exodus', 'esc', 'citalopram',
      'paroxetina', 'pondera', 'venlafaxina', 'efexor', 'desvenlafaxina', 'pristiq',
      'deller', 'densvela', 'duloxetina', 'cymbalta', 'velija', 'vilazodona',
      'aymee', 'vortioxetina', 'brintellix', 'bupropiona', 'wellbutrin', 'zetron',
      'bup', 'trazodona', 'donaren', 'mirtazapina', 'remeron', 'amitriptilina',
      'tryptanol', 'amytril', 'nortriptilina', 'pamelor', 'clomipramina', 'anafranil',
      'pregabalina', 'lyrica', 'dorene', 'insit', 'gabapentina', 'neurontin',
      'anticonvulsivante', 'epilepsia', 'carbamazepina', 'tegretol', 'valproato',
      'acido valproico', 'depakene', 'divalproato', 'depakote', 'lamotrigina',
      'lamictal', 'neural', 'litio', 'carbolitium', 'topiramato', 'topamax', 'amato',
      'oxcarbazepina', 'trileptal', 'levetiracetam', 'keppra', 'etira', 'fenitoina',
      'hidantal', 'fenobarbital', 'gardenal', 'risperidona', 'risperdal',
      'olanzapina', 'zyprexa', 'quetiapina', 'seroquel', 'aripiprazol', 'aristab',
      'abilify', 'lurasidona', 'latuda', 'clorpromazina', 'amplictil',
      'levomepromazina', 'neozine', 'haloperidol', 'haldol'
    ]
  },
  {
    canonicalCategory: 'outros',
    displayName: 'Vitaminas, Suplementos & Oftalmologia',
    keywords: [
      'vitamina', 'vitaminas', 'suplemento', 'vitamina b12', 'b12', 'cianocobalamina',
      'mecobalamina', 'metilcobalamina', 'citoneurin', 'cronobe', 'rubranova',
      'vitamina d', 'vitamina d3', 'colecalciferol', 'addera', 'depura', 'doss',
      'calcio', 'carbonato de calcio', 'tiamina', 'vitamina b1', 'beneum',
      'acido folico', 'complexo b', 'colirio', 'colirios', 'oftalmico', 'oftalmologia',
      'lubrificante ocular', 'lagrima artificial', 'olho seco', 'carmelose', 'lacrifilm',
      'optive', 'fresh tears', 'hialuronato', 'hyabak', 'lacribell', 'hipromelose',
      'systane', 'olopatadina', 'patanol', 'cetotifeno', 'zaditen', 'acular',
      'pred fort', 'maxidex', 'glaucoma', 'timolol', 'timoptol', 'latanoprosta',
      'xalatan', 'travoprosta', 'travatan', 'bimatoprosta', 'lumigan', 'brimonidina',
      'alphagan', 'dorzolamida', 'trusopt', 'cosopt'
    ]
  }
];

/**
 * Extrai nomes comerciais/marcas contidos entre parênteses no nome do medicamento,
 * ignorando parênteses puramente posológicos/numéricos (ex.: "(1g)", "(160mg/5mL)").
 */
export const extractCommercialBrands = (
  medName: string,
  normalizeFn: (text: string) => string
): string[] => {
  const groups = Array.from(medName.matchAll(/\(([^)]+)\)/g)).map((m) => m[1]);
  const brands: string[] = [];
  for (const group of groups) {
    if (/^\d/.test(group.trim())) continue;
    const parts = group.split(/[,;/]/).map((p) => normalizeFn(p)).filter(Boolean);
    for (const part of parts) {
      if (/^\d/.test(part)) continue;
      brands.push(part);
    }
  }
  return brands;
};
