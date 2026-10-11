import { PrescriptionItem, AdultMedication, UnifiedMedication, RegimeReceita } from '../types';

export type { RegimeReceita };

/**
 * Regime sanitário da receita de um medicamento:
 *  - 'simples': receituário comum, 1 via.
 *  - 'antimicrobiano': receita em 2 vias, válida por 10 dias; a farmácia retém a
 *    2ª via e devolve a 1ª ao paciente (RDC Anvisa nº 471/2021).
 *  - 'controle_especial': receita de controle especial em 2 vias; a farmácia
 *    retém a 1ª via (Portaria SVS/MS nº 344/98).
 * São documentos diferentes e nunca dividem a mesma folha.
 */

/** Antibióticos / antimicrobianos (RDC 471/2021). */
const ANTIMICROBIANOS = [
  'amoxicilina', 'clavulanato', 'clavulin', 'amoxil', 'novocilin',
  'azitromicina', 'zitromax',
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
  'linezolida', 'vancomicina', 'meropenem', 'imipenem'
];

/** Medicamentos sob controle especial (Portaria 344/98 — Listas A, B e C). */
const CONTROLADOS = [
  // Psicotrópicos, ansiolíticos, sedativos e hipnóticos (Listas B1, B2)
  'diazepam', 'clonazepam', 'rivotril', 'alprazolam', 'frontin',
  'lorazepam', 'bromazepam', 'lexotan', 'midazolam', 'dormonid',
  'zolpidem', 'stilnox', 'zopiclona', 'eszopiclona',

  // Antidepressivos e estabilizadores (Lista C1)
  'fluoxetina', 'prozac', 'daforin', 'sertralina', 'zoloft', 'assert',
  'escitalopram', 'lexapro', 'reconter', 'citalopram', 'cipramil',
  'paroxetina', 'aropax', 'venlafaxina', 'efexor', 'desvenlafaxina', 'pristiq',
  'duloxetina', 'cymbalta', 'bupropiona', 'wellbutrin',
  'mirtazapina', 'remeron', 'trazodona', 'donaren',
  'amitriptilina', 'tryptanol', 'nortriptilina', 'pamelor', 'imipramina', 'clomipramina', 'anafranil',
  'carbonato de litio', 'carbolitium',

  // Antipsicóticos (Lista C1)
  'haloperidol', 'haldol', 'risperidona', 'risperdal',
  'olanzapina', 'zyprexa', 'quetiapina', 'seroquel',
  'aripiprazol', 'abilify', 'clorpromazina', 'amplictil', 'levomepromazina',

  // Anticonvulsivantes e moduladores (Lista C1)
  'carbamazepina', 'tegretol', 'oxcarbazepina', 'trileptal',
  'valproato', 'depakene', 'depakote', 'divalproato',
  'lamotrigina', 'lamictal', 'topiramato', 'topamax',
  'fenobarbital', 'gardenal', 'primidona',
  'gabapentina', 'pregabalina', 'lyrica',

  // Opioides e analgésicos narcóticos (Listas A1, A2, C1)
  'tramadol', 'tramal', 'sylador', 'codeina', 'tylex', 'paco',
  'morfina', 'dimorf', 'metadona', 'fentanil', 'oxicodona', 'buprenorfina',

  // Estimulantes do SNC (Lista A3)
  'metilfenidato', 'ritalina', 'concerta', 'lisdexanfetamina', 'venvanse', 'modafinila', 'stavigile',

  // Retinoides e anorexígenos
  'isotretinoina', 'roacutan', 'sibutramina'
];

// Termos curtos só valem como palavra inteira, para não casar dentro de outras
// palavras ("astro" dentro de "gastro", por exemplo).
const ANTIMICROBIANOS_PALAVRA_INTEIRA = ['cipro', 'astro'];
const CONTROLADOS_PALAVRA_INTEIRA = ['bup', 'litio', 'tylex', 'paco'];

/**
 * Normaliza um texto removendo acentuação e convertendo para minúsculas.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function contemTermo(texto: string, termos: string[], palavrasInteiras: string[]): boolean {
  return (
    termos.some((termo) => texto.includes(termo)) ||
    palavrasInteiras.some((termo) => new RegExp(`\\b${termo}\\b`).test(texto))
  );
}

type MedicamentoClassificavel =
  | PrescriptionItem
  | AdultMedication
  | UnifiedMedication
  | { name?: string; activeIngredient?: string; category?: string; isSpecialControl?: boolean; regimeReceita?: RegimeReceita }
  | string
  | null
  | undefined;

/**
 * Classifica o regime de receita de um medicamento (objeto ou nome em texto
 * livre). A busca por palavra-chave olha apenas o nome e o princípio ativo —
 * a categoria só conta quando é, ela própria, a de antibióticos.
 */
export function classificarReceita(med?: MedicamentoClassificavel): RegimeReceita {
  if (!med) return 'simples';

  const obj = typeof med === 'string' ? null : (med as Record<string, any>);
  const texto = normalizeText(
    typeof med === 'string' ? med : `${obj!.name || obj!.tradeName || ''} ${obj!.activeIngredient || ''}`
  );

  // O regime mais restritivo prevalece.
  if (contemTermo(texto, CONTROLADOS, CONTROLADOS_PALAVRA_INTEIRA)) return 'controle_especial';

  // Tipo de receita escolhido pelo médico no formulário (nunca rebaixa um controlado detectado acima)
  if (obj?.regimeReceita === 'antimicrobiano' || obj?.regimeReceita === 'controle_especial') {
    return obj.regimeReceita;
  }

  const categoria = obj && typeof obj.category === 'string' ? normalizeText(obj.category) : '';
  if (categoria.includes('antibi') || contemTermo(texto, ANTIMICROBIANOS, ANTIMICROBIANOS_PALAVRA_INTEIRA)) {
    return 'antimicrobiano';
  }

  // Marcação manual de "2 vias" em um medicamento que a detecção não reconheceu.
  if (obj?.isSpecialControl === true) return 'controle_especial';

  return 'simples';
}

/**
 * Indica se o medicamento sai em receita de 2 vias (antimicrobiano ou controle
 * especial). Para saber qual dos dois documentos usar, chame `classificarReceita`.
 */
export function isSpecialControlOrAntibiotic(med?: MedicamentoClassificavel): boolean {
  return classificarReceita(med) !== 'simples';
}
