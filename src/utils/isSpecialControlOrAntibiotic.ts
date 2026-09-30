import { PrescriptionItem, AdultMedication, UnifiedMedication } from '../types';

/**
 * Palavras-chave clínicas determinísticas para detecção de antimicrobianos
 * (sujeitos à retenção de receita em 2 vias pela RDC 20/2011 e RDC 471/2021 da ANVISA)
 * e medicamentos sob controle especial (Portaria SVS/MS 344/98 - Listas A, B e C).
 */
const ANTIMICROBIAL_AND_CONTROLLED_KEYWORDS = [
  // 1. Antibióticos / Antimicrobianos (RDC 20/2011 e RDC 471/2021)
  'amoxicilina', 'clavulanato', 'clavulin', 'amoxil', 'novocilin',
  'azitromicina', 'zitromax', 'astro',
  'cefalexina', 'keflex', 'cefaclor', 'cefadroxila', 'cefuroxima', 'ceftriaxona', 'rocefin', 'cefalotina',
  'ciprofloxacino', 'levofloxacino', 'levaquin', 'moxifloxacino', 'norfloxacino',
  'claritromicina', 'klacid', 'eritromicina',
  'doxiciclina', 'vibramicina', 'minociclina',
  'clindamicina', 'dalacin',
  'metronidazol', 'flagyl',
  'sulfametoxazol', 'trimetoprima', 'bactrim', 'infectrin',
  'nitrofurantoina', 'macrodantina',
  'fosfomicina', 'monuril',
  'penicilina', 'benzetacil', 'ampicilina', 'oxacilina',
  'gentamicina', 'amicacina', 'tobramicina',
  'rifampicina', 'isoniazida', 'pirazinamida', 'etambutol',
  'linezolida', 'vancomicina', 'meropenem', 'imipenem',

  // 2. Psicotrópicos, Ansiolíticos, Sedativos e Hipnóticos (Portaria 344/98 - Listas B1, B2)
  'diazepam', 'clonazepam', 'rivotril', 'alprazolam', 'frontin',
  'lorazepam', 'bromazepam', 'lexotan', 'midazolam', 'dormonid',
  'zolpidem', 'stilnox', 'zopiclona', 'eszopiclona',

  // 3. Antidepressivos e Estabilizadores (Portaria 344/98 - Lista C1)
  'fluoxetina', 'prozac', 'daforin', 'sertralina', 'zoloft', 'assert',
  'escitalopram', 'lexapro', 'reconter', 'citalopram', 'cipramil',
  'paroxetina', 'aropax', 'venlafaxina', 'efexor', 'desvenlafaxina', 'pristiq',
  'duloxetina', 'cymbalta', 'bupropiona', 'wellbutrin',
  'mirtazapina', 'remeron', 'trazodona', 'donaren',
  'amitriptilina', 'tryptanol', 'nortriptilina', 'pamelor', 'imipramina', 'clomipramina', 'anafranil',
  'carbonato de litio', 'carbolitium',

  // 4. Antipsicóticos (Portaria 344/98 - Lista C1)
  'haloperidol', 'haldol', 'risperidona', 'risperdal',
  'olanzapina', 'zyprexa', 'quetiapina', 'seroquel',
  'aripiprazol', 'abilify', 'clorpromazina', 'amplictil', 'levomepromazina',

  // 5. Anticonvulsivantes e Moduladores (Portaria 344/98 - Lista C1)
  'carbamazepina', 'tegretol', 'oxcarbazepina', 'trileptal',
  'valproato', 'depakene', 'depakote', 'divalproato',
  'lamotrigina', 'lamictal', 'topiramato', 'topamax',
  'fenobarbital', 'gardenal', 'primidona',
  'gabapentina', 'pregabalina', 'lyrica',

  // 6. Opioides e Analgésicos Narcóticos (Portaria 344/98 - Listas A1, A2, C1)
  'tramadol', 'tramal', 'sylador', 'codeina', 'tylex', 'paco',
  'morfina', 'dimorf', 'metadona', 'fentanil', 'oxicodona', 'buprenorfina',

  // 7. Estimulantes do SNC (Portaria 344/98 - Lista A3)
  'metilfenidato', 'ritalina', 'concerta', 'lisdexanfetamina', 'venvanse', 'modafinila', 'stavigile',

  // 8. Retinoides e Anorexígenos
  'isotretinoina', 'roacutan', 'sibutramina'
];

// Termos curtos que exigem correspondência exata de limite de palavra (\b) para prevenir falsos positivos
const WORD_BOUNDARY_TERMS = ['cipro', 'bup', 'litio', 'tylex', 'paco'];

/**
 * Normaliza um texto removendo acentuação e convertendo para minúsculas.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Avalia se um medicamento (objeto ou nome em texto livre) é sujeito a controle
 * especial ou retenção de receita em 2 vias (RDC 20/2011 ou Portaria 344/98).
 */
export function isSpecialControlOrAntibiotic(
  med?: PrescriptionItem | AdultMedication | UnifiedMedication | {
    name?: string;
    activeIngredient?: string;
    category?: string;
    isSpecialControl?: boolean;
  } | string | null
): boolean {
  if (!med) return false;

  // 1. Verificação explícita de flag existente
  if (typeof med === 'object') {
    const obj = med as Record<string, any>;
    if (obj.isSpecialControl === true) return true;
    if (obj.category === 'antibioticos') return true;
    if (obj.category && typeof obj.category === 'string' && normalizeText(obj.category).includes('antibi')) return true;
  }

  // 2. Verificação textual pelo nome, princípio ativo e categoria
  let textToScan = '';
  if (typeof med === 'string') {
    textToScan = normalizeText(med);
  } else {
    const obj = med as Record<string, any>;
    const namePart = obj.name || obj.tradeName || '';
    const activePart = obj.activeIngredient || '';
    const catPart = obj.category || '';
    textToScan = normalizeText(`${namePart} ${activePart} ${catPart}`);
  }

  // Checagem de palavras-chave principais
  const matchesKeyword = ANTIMICROBIAL_AND_CONTROLLED_KEYWORDS.some(kw => {
    const cleanKw = normalizeText(kw);
    return textToScan.includes(cleanKw);
  });

  if (matchesKeyword) return true;

  // Checagem de termos curtos com limite de palavra
  return WORD_BOUNDARY_TERMS.some(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(textToScan);
  });
}
