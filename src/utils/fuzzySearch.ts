import { UnifiedMedication } from '../data/medicationDatabase';

/**
 * Normaliza strings para busca insensível a acentos, maiúsculas e caracteres especiais.
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\-\/\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Prefixos de sais e ésteres farmacêuticos que não devem impedir o match direto
 * pelo nome da substância ativa principal (ex.: "Cloridrato de Metformina" -> "metformina",
 * "Dipropionato de Beclometasona" -> "beclometasona").
 */
const SALT_AND_ESTER_PREFIXES: readonly string[] = [
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
  'bissulfato de ',
  'propionato de ',
  'tartarato de ',
  'succinato de ',
  'besilato de ',
  'fumarato de ',
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
];

/**
 * Remove prefixos de sal/éster farmacêutico mantendo minerais onde o sal é o próprio nome
 * usual de busca (ex.: "sulfato ferroso", "sulfato de zinco", "cloreto de sodio").
 */
export const stripSaltPrefix = (normalizedText: string): string => {
  let clean = normalizedText.trim();
  for (const prefix of SALT_AND_ESTER_PREFIXES) {
    if (clean.startsWith(prefix)) {
      return clean.slice(prefix.length).trim();
    }
  }
  if (clean.startsWith('sulfato de ')) {
    const rest = clean.slice('sulfato de '.length).trim();
    if (!rest.startsWith('zinco') && !rest.startsWith('ferro') && !rest.startsWith('magnesio') && !rest.startsWith('bario')) {
      return rest;
    }
  }
  return clean;
};

/**
 * Identifica se o medicamento é uma associação/combinação de múltiplos princípios ativos
 * (ex.: "Dipirona + Orfenadrina + Cafeína", "Amoxicilina + Clavulanato").
 */
export const isCombinationMedication = (med: UnifiedMedication): boolean => {
  const nameWithoutParens = med.name.replace(/\([^)]*\)/g, '');
  if (med.activeIngredient.includes('+')) return true;
  if (nameWithoutParens.includes('+')) return true;
  return false;
};

/**
 * Extrai a primeira palavra da substância ativa principal (sem prefixo de sal/éster).
 * Ex.: "Dipirona Sódica 500mg comprimido (Novalgina)" -> "dipirona"
 * Ex.: "Cloridrato de Metformina 850mg (Glifage)" -> "metformina"
 * Ex.: "Dipropionato de Beclometasona 50mcg (Clenil)" -> "beclometasona"
 */
export const extractPrimarySubstanceWord = (med: UnifiedMedication): string => {
  const nameHead = normalizeText(med.name.replace(/\([^)]*\)/g, '').split('+')[0] || '');
  const activeHead = normalizeText(med.activeIngredient.split('+')[0] || '');

  const coreFromActive = stripSaltPrefix(activeHead);
  const coreFromName = stripSaltPrefix(nameHead);

  const primary = coreFromActive || coreFromName;
  return primary.split(/\s+/)[0] || '';
};

/**
 * Calcula distância de Damerau-Levenshtein entre duas strings (suporta inserções, deleções, substituições e transposições).
 */
export const damerauLevenshteinDistance = (source: string, target: string): number => {
  const s = source.toLowerCase();
  const t = target.toLowerCase();
  const sLen = s.length;
  const tLen = t.length;

  if (sLen === 0) return tLen;
  if (tLen === 0) return sLen;

  const d: number[][] = Array.from({ length: sLen + 1 }, () => Array(tLen + 1).fill(0));

  for (let i = 0; i <= sLen; i++) d[i][0] = i;
  for (let j = 0; j <= tLen; j++) d[0][j] = j;

  for (let i = 1; i <= sLen; i++) {
    for (let j = 1; j <= tLen; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deleção
        d[i][j - 1] + 1, // inserção
        d[i - 1][j - 1] + cost // substituição
      );

      // Transposição (troca de letras adjacentes, ex: 'dipr' vs 'dpir')
      if (i > 1 && j > 1 && s[i - 1] === t[j - 2] && s[i - 2] === t[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[sLen][tLen];
};

/**
 * Calcula o índice de similaridade (0 a 1) entre duas strings.
 */
export const calculateStringSimilarity = (strA: string, strB: string): number => {
  const normA = normalizeText(strA);
  const normB = normalizeText(strB);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;

  const maxLen = Math.max(normA.length, normB.length);
  if (maxLen === 0) return 1;

  const distance = damerauLevenshteinDistance(normA, normB);
  return Math.max(0, 1 - distance / maxLen);
};

/**
 * Verifica se os caracteres da query aparecem em subsequência ordenada dentro do target.
 */
export const fuzzySubsequenceScore = (target: string, query: string): number => {
  const t = normalizeText(target);
  const q = normalizeText(query);
  if (!t || !q) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 90 + Math.min(10, (q.length / t.length) * 10);
  if (t.includes(q)) return 80 + Math.min(10, (q.length / t.length) * 10);

  let tIdx = 0;
  let qIdx = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  let wordBoundaryBonus = 0;

  while (tIdx < t.length && qIdx < q.length) {
    if (t[tIdx] === q[qIdx]) {
      consecutive++;
      if (consecutive > maxConsecutive) maxConsecutive = consecutive;
      if (tIdx === 0 || t[tIdx - 1] === ' ' || t[tIdx - 1] === '-' || t[tIdx - 1] === '+') {
        wordBoundaryBonus += 5;
      }
      qIdx++;
    } else {
      consecutive = 0;
    }
    tIdx++;
  }

  if (qIdx === q.length) {
    const coverage = q.length / t.length;
    const baseScore = 55 + (coverage * 20) + (maxConsecutive * 3) + Math.min(15, wordBoundaryBonus);
    return Math.min(85, baseScore);
  }

  return 0;
};

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
      'alivium', 'profenid', 'nimesulida', 'diclofenaco', 'toragesic'
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
      'pneumonia', 'otite', 'itu', 'infeccao urinaria', 'cistite', 'erisipela'
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
      'clenil', 'laringite', 'croup', 'estridor', 'crise de asma', 'edema de glote',
      'antialergico', 'anti-histaminico', 'antihistaminico', 'alergia', 'rinite',
      'urticaria', 'prurido', 'coceira', 'coriza', 'espirros', 'picada de inseto',
      'loratadina', 'claritin', 'desloratadina', 'desalex', 'cetirizina', 'zyrtec',
      'hidroxizina', 'hixizine', 'dexclorfeniramina', 'polaramine'
    ]
  },
  {
    canonicalCategory: 'cardio',
    displayName: 'Anti-hipertensivos & Cardiovasculares',
    keywords: [
      'antihipertensivo', 'anti-hipertensivo', 'pressao', 'pressao alta', 'hipertensao',
      'cardiovascular', 'coracao', 'cardiologia', 'betabloqueador', 'ieca', 'bra',
      'diuretico', 'losartana', 'atenolol', 'propranolol', 'metoprolol', 'selozok',
      'carvedilol', 'anlodipino', 'norvasc', 'enalapril', 'renitec', 'captopril',
      'hidroclorotiazida', 'furosemida', 'lasix', 'espironolactona', 'aldactone',
      'hipolipemiante', 'estatina', 'colesterol', 'triglicerideos', 'dislipidemia',
      'gordura no sangue', 'atorvastatina', 'lipitor', 'rosuvastatina', 'crestor',
      'sinvastatina'
    ]
  },
  {
    canonicalCategory: 'diabetes',
    displayName: 'Antidiabéticos & Metabólicos',
    keywords: [
      'antidiabetico', 'diabetes', 'glicemia', 'acucar no sangue', 'insulina',
      'hipoglicemiante', 'dm2', 'metformina', 'glifage', 'gliclazida', 'diamicron',
      'insulina nph', 'insulina regular'
    ]
  },
  {
    canonicalCategory: 'gastro',
    displayName: 'Gastrointestinais & Digestivos',
    keywords: [
      'gastro', 'gastrointestinal', 'gastroprotetor', 'protetor gastrico', 'estomago',
      'gastrite', 'refluxo', 'azia', 'pirose', 'ibp', 'antiacido', 'ulcera',
      'omeprazol', 'pantoprazol', 'esomeprazol', 'antiemetico', 'enjoo', 'vomito',
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
      'antidepressivo', 'depressao', 'panico', 'isrs', 'humor', 'clonazepam',
      'rivotril', 'diazepam', 'valium', 'alprazolam', 'frontan', 'zolpidem',
      'stilnox', 'fluoxetina', 'prozac', 'sertralina', 'zoloft', 'escitalopram',
      'lexapro', 'venlafaxina', 'duloxetina', 'pregabalina', 'lyrica', 'gabapentina',
      'anticonvulsivante', 'epilepsia', 'carbamazepina', 'valproato', 'depakene'
    ]
  }
];

export interface ScoredUnifiedMedication {
  med: UnifiedMedication;
  score: number;
}

/**
 * Extrai nomes comerciais/marcas contidos entre parênteses no nome do medicamento,
 * ignorando parênteses puramente posológicos/numéricos (ex.: "(1g)", "(160mg/5mL)").
 */
const extractCommercialBrands = (medName: string): string[] => {
  const groups = Array.from(medName.matchAll(/\(([^)]+)\)/g)).map((m) => m[1]);
  const brands: string[] = [];
  for (const group of groups) {
    const parts = group.split(/[,;/]/).map((p) => normalizeText(p)).filter(Boolean);
    for (const part of parts) {
      // Ignora grupos que começam apenas com números/unidades (ex: "1g", "2.5g", "160mg/5ml")
      if (/^\d/.test(part)) continue;
      brands.push(part);
    }
  }
  return brands;
};

/**
 * Avalia a pontuação de relevância clínica de um medicamento em relação à query.
 *
 * Princípios de priorização clínica:
 * 1. Monofármacos (substância ativa isolada) têm prioridade sobre associações/combinações ("+")
 *    quando o médico digita apenas o nome ou prefixo do fármaco principal (ex.: "dip" -> Dipirona Sódica
 *    antes de Dorflex, Neosaldina ou Buscopan Composto).
 * 2. A pontuação de prefixo do fármaco é calculada sobre a palavra da substância ativa principal
 *    (ignorando prefixos de sais/ésteres como "Cloridrato de", "Dipropionato de" e o tamanho da
 *    lista de marcas entre parênteses), evitando penalizar medicamentos com mais sinônimos comerciais.
 * 3. Buscas multi-token (ex.: "dip gotas", "dip 1g", "amox clav", "amox susp") bonificam apresentações
 *    que contemplam todos os termos digitados.
 */
export const scoreUnifiedMedication = (
  med: UnifiedMedication,
  normQuery: string
): ScoredUnifiedMedication | null => {
  if (!normQuery) {
    return { med, score: 100 };
  }

  const normName = normalizeText(med.name);
  const normActive = normalizeText(med.activeIngredient);
  const normRoute = normalizeText(med.route);

  const nameWithoutParens = normalizeText(med.name.replace(/\([^)]*\)/g, ''));
  const coreName = stripSaltPrefix(nameWithoutParens);
  const coreActive = stripSaltPrefix(normActive);

  const isCombination = isCombinationMedication(med);
  const primaryWord = extractPrimarySubstanceWord(med);

  // Ingredientes separados em caso de associação (ex: ["escopolamina", "dipirona"])
  const activeIngredientsList = normActive
    .split('+')
    .map((part) => stripSaltPrefix(part.trim()))
    .filter(Boolean);
  const secondaryIngredients = activeIngredientsList.slice(1);

  const brands = extractCommercialBrands(med.name);

  // Tokens da query (sem '+' isolado)
  const queryHasPlus = normQuery.includes('+');
  const queryTokens = normQuery
    .replace(/\+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const headToken = queryTokens[0] || normQuery;

  // Verifica se o usuário pediu explicitamente uma associação (digitou '+' ou múltiplos tokens de ingredientes distintos)
  const matchesSecondaryIngredientOnExtraToken =
    queryTokens.length > 1 &&
    queryTokens.slice(1).some((tok) =>
      secondaryIngredients.some((sec) => sec.startsWith(tok) || sec.split(/\s+/).some((w) => w.startsWith(tok)))
    );
  const userExplicitlyWantsCombination = queryHasPlus || matchesSecondaryIngredientOnExtraToken;

  // Penalidade para associações quando o usuário busca apenas um fármaco simples
  const combinationPenalty = isCombination && !userExplicitlyWantsCombination ? 12 : 0;

  let bestScore = 0;

  // 1. MATCH EXATO NO NOME COMPLETO, PRINCÍPIO ATIVO OU SUBSTÂNCIA PRINCIPAL
  if (normName === normQuery || normActive === normQuery || coreActive === normQuery) {
    bestScore = 122 - combinationPenalty;
  } else if (primaryWord && (primaryWord === normQuery || primaryWord === headToken && queryTokens.length === 1)) {
    bestScore = 120 - combinationPenalty;
  }

  // 2. MATCH POR PREFIXO NA SUBSTÂNCIA ATIVA PRINCIPAL (ex: "dip" -> "dipirona", "metf" -> "metformina")
  if (primaryWord && primaryWord.startsWith(headToken)) {
    const prefixRatio = Math.min(1, headToken.length / primaryWord.length);
    const primaryPrefixScore = 110 + prefixRatio * 8 - combinationPenalty;
    bestScore = Math.max(bestScore, primaryPrefixScore);
  } else if (coreName.startsWith(headToken) || coreActive.startsWith(headToken)) {
    const refLen = Math.max(headToken.length, primaryWord.length || coreName.length);
    const prefixRatio = Math.min(1, headToken.length / refLen);
    const corePrefixScore = 108 + prefixRatio * 8 - combinationPenalty;
    bestScore = Math.max(bestScore, corePrefixScore);
  }

  // 3. MATCH EM NOMES COMERCIAIS / MARCAS ENTRE PARÊNTESES (ex: "Novalgina", "Dorflex", "Clavulin", "Tylenol")
  for (const brand of brands) {
    const brandWords = brand.split(/\s+/);
    const primaryBrandWord = brandWords[0] || brand;
    if (brand === normQuery || brand === headToken || primaryBrandWord === headToken) {
      // Se o médico digitou o nome exato da marca comercial (ex: "dorflex", "clavulin"), não penaliza combinação
      bestScore = Math.max(bestScore, 109);
    } else if (primaryBrandWord.startsWith(headToken) || brandWords.some((bw) => bw.startsWith(headToken))) {
      const targetWord = brandWords.find((bw) => bw.startsWith(headToken)) || primaryBrandWord;
      const ratio = Math.min(1, headToken.length / targetWord.length);
      // Prefixo curto (< 4 letras, ex: "dip" em "diprospan") recebe penalidade de combinação se aplicável
      const brandPenalty = headToken.length < 4 ? combinationPenalty * 0.5 : 0;
      bestScore = Math.max(bestScore, 96 + ratio * 7 - brandPenalty);
    } else if (brand.includes(headToken)) {
      bestScore = Math.max(bestScore, 85);
    }
  }

  // 4. MATCH EM SEGUNDO/TERCEIRO PRINCÍPIO ATIVO DE ASSOCIAÇÃO (ex: "dip" em "Escopolamina + Dipirona")
  for (const secIng of secondaryIngredients) {
    const secWords = secIng.split(/\s+/);
    const secPrimary = secWords[0] || secIng;
    if (secPrimary === headToken || secIng === headToken) {
      bestScore = Math.max(bestScore, 96);
    } else if (secPrimary.startsWith(headToken) || secWords.some((w) => w.startsWith(headToken))) {
      const ratio = Math.min(1, headToken.length / secPrimary.length);
      bestScore = Math.max(bestScore, 92 + ratio * 4);
    }
  }

  // 5. MATCH NO INÍCIO DE QUALQUER OUTRA PALAVRA (inclusive prefixo de sal/éster como "dipropionato", "cloridrato")
  const allWords = normName.split(/\s+/).concat(normActive.split(/\s+/));
  for (const w of allWords) {
    if (w.startsWith(headToken)) {
      const ratio = Math.min(1, headToken.length / w.length);
      // Palavras secundárias ou de sal (quando não são a substância principal) pontuam abaixo da substância ativa
      bestScore = Math.max(bestScore, 88 + ratio * 5 - (isCombination ? 4 : 0));
    }
  }

  // 6. SUBSTRING INCLUSION
  if (bestScore === 0) {
    if (normName.includes(normQuery) || normActive.includes(normQuery)) {
      bestScore = Math.max(bestScore, 80 - (isCombination ? 4 : 0));
    } else if (normRoute.includes(normQuery)) {
      bestScore = Math.max(bestScore, 70);
    }
  }

  // 7. CLASSES TERAPÊUTICAS E SINTOMAS
  const matchingClass = THERAPEUTIC_CLASSES.find((tc) =>
    tc.keywords.some((kw) => kw === normQuery || (normQuery.length >= 4 && kw.startsWith(normQuery)))
  );
  if (matchingClass) {
    if (med.category === matchingClass.canonicalCategory) {
      bestScore = Math.max(bestScore, 75);
    } else {
      const medKeywordsMatch = matchingClass.keywords.some(
        (kw) => normName.includes(kw) || normActive.includes(kw)
      );
      if (medKeywordsMatch) {
        bestScore = Math.max(bestScore, 72);
      }
    }
  }

  // 8. REFINAMENTO MULTI-TOKEN (ex.: "dip gotas", "dip 1g", "amox clav", "amox susp")
  if (queryTokens.length > 1 && bestScore > 0) {
    const extraTokens = queryTokens.slice(1);
    const searchableOutsideParens = `${nameWithoutParens} ${normActive} ${normRoute}`;
    const searchableFull = `${normName} ${normActive} ${normRoute}`;
    const outsideWords = searchableOutsideParens.split(/\s+/);
    const fullWords = searchableFull.split(/\s+/);

    let matchedExtraCount = 0;
    let extraBonus = 0;

    for (const tok of extraTokens) {
      const matchesOutsideWord = outsideWords.some((w) => w.startsWith(tok) || w.includes(tok));
      const matchesFullWord = fullWords.some((w) => w.startsWith(tok) || w.includes(tok));

      if (matchesOutsideWord) {
        matchedExtraCount++;
        extraBonus += 16;
      } else if (matchesFullWord) {
        matchedExtraCount++;
        extraBonus += 12;
      }
    }

    if (matchedExtraCount === extraTokens.length) {
      bestScore += extraBonus;
    } else {
      const missingCount = extraTokens.length - matchedExtraCount;
      bestScore = Math.max(0, bestScore - missingCount * 28 + extraBonus);
    }
  }

  // 9. FUZZY SUBSEQUENCE E LEVENSHTEIN (tolerância a pequenos erros de digitação)
  if (normQuery.length >= 3 && bestScore < 70) {
    const subScore = Math.max(
      fuzzySubsequenceScore(normName, normQuery),
      fuzzySubsequenceScore(normActive, normQuery)
    );
    if (subScore > 0) {
      bestScore = Math.max(bestScore, subScore - (isCombination ? 4 : 0));
    }

    // Levenshtein nas palavras principais
    for (const w of allWords) {
      if (w.length >= 4 && normQuery.length >= 3 && Math.abs(w.length - normQuery.length) <= 2) {
        const sim = calculateStringSimilarity(w, normQuery);
        if (sim >= 0.75) {
          bestScore = Math.max(bestScore, 60 + Math.round(sim * 20) - (isCombination ? 4 : 0));
        }
      }
    }
  }

  if (bestScore >= 45) {
    return { med, score: bestScore };
  }

  return null;
};

/**
 * Busca inteligente e fuzzy de medicamentos com classificação por relevância clínica.
 * Em caso de empate de pontuação (ex.: diferentes apresentações do mesmo monofármaco),
 * preserva a prioridade de monofármaco sobre combinação e a ordem canônica do catálogo clínico.
 */
export const searchUnifiedMedicationsFuzzy = (
  medications: UnifiedMedication[],
  query: string,
  categoryFilter: string = 'all'
): UnifiedMedication[] => {
  const normQuery = normalizeText(query);

  let pool = medications;
  if (categoryFilter && categoryFilter !== 'all') {
    pool = pool.filter((m) => m.category === categoryFilter);
  }

  if (!normQuery) {
    return pool;
  }

  const scored: Array<ScoredUnifiedMedication & { catalogIndex: number; isCombination: boolean }> = [];

  for (let idx = 0; idx < pool.length; idx++) {
    const med = pool[idx];
    const result = scoreUnifiedMedication(med, normQuery);
    if (result) {
      scored.push({
        ...result,
        catalogIndex: idx,
        isCombination: isCombinationMedication(med),
      });
    }
  }

  scored.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) > 0.001) {
      return scoreDiff;
    }
    if (a.isCombination !== b.isCombination) {
      return a.isCombination ? 1 : -1;
    }
    return a.catalogIndex - b.catalogIndex;
  });

  return scored.map((s) => s.med);
};
