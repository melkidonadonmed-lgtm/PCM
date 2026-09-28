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
  let matches = 0;
  let consecutive = 0;
  let maxConsecutive = 0;
  let wordBoundaryBonus = 0;

  while (tIdx < t.length && qIdx < q.length) {
    if (t[tIdx] === q[qIdx]) {
      matches++;
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
 * Avalia a pontuação de relevância de um medicamento em relação à query.
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

  // 1. MATCH EXATO NO NOME OU PRINCÍPIO ATIVO
  if (normName === normQuery || normActive === normQuery) {
    return { med, score: 110 };
  }

  // 2. MATCH POR PREFIXO
  if (normName.startsWith(normQuery)) {
    return { med, score: 100 + Math.min(8, (normQuery.length / normName.length) * 8) };
  }
  if (normActive.startsWith(normQuery)) {
    return { med, score: 98 + Math.min(8, (normQuery.length / normActive.length) * 8) };
  }

  let bestScore = 0;

  // 3. MATCH EM NOMES COMERCIAIS / MARCAS (ex: conteúdo entre parênteses "Novalgina, Anador")
  const brandMatches = med.name.match(/\(([^)]+)\)/);
  if (brandMatches && brandMatches[1]) {
    const brands = brandMatches[1].split(/[,;/]/).map(b => normalizeText(b));
    for (const b of brands) {
      if (b === normQuery) {
        bestScore = Math.max(bestScore, 105);
      } else if (b.startsWith(normQuery)) {
        bestScore = Math.max(bestScore, 95 + Math.min(7, (normQuery.length / b.length) * 7));
      } else if (b.includes(normQuery)) {
        bestScore = Math.max(bestScore, 85);
      }
    }
  }

  // 4. MATCH NO INÍCIO DE QUALQUER PALAVRA
  const words = normName.split(/\s+/).concat(normActive.split(/\s+/));
  for (const w of words) {
    if (w.startsWith(normQuery)) {
      bestScore = Math.max(bestScore, 90 + Math.min(5, (normQuery.length / w.length) * 5));
    }
  }

  // 5. SUBSTRING INCLUSION
  if (normName.includes(normQuery) || normActive.includes(normQuery)) {
    bestScore = Math.max(bestScore, 80);
  } else if (normRoute.includes(normQuery)) {
    bestScore = Math.max(bestScore, 70);
  }

  // 6. CLASSES TERAPÊUTICAS E SINTOMAS
  const matchingClass = THERAPEUTIC_CLASSES.find(tc => 
    tc.keywords.some(kw => kw === normQuery || (normQuery.length >= 4 && kw.startsWith(normQuery)))
  );
  if (matchingClass) {
    if (med.category === matchingClass.canonicalCategory) {
      bestScore = Math.max(bestScore, 75);
    } else {
      const medKeywordsMatch = matchingClass.keywords.some(kw => 
        normName.includes(kw) || normActive.includes(kw)
      );
      if (medKeywordsMatch) {
        bestScore = Math.max(bestScore, 72);
      }
    }
  }

  // 7. FUZZY SUBSEQUENCE E LEVENSHTEIN (tolerância a pequenos erros de digitação)
  if (normQuery.length >= 3 && bestScore < 70) {
    const subScore = Math.max(
      fuzzySubsequenceScore(normName, normQuery),
      fuzzySubsequenceScore(normActive, normQuery)
    );
    if (subScore > 0) {
      bestScore = Math.max(bestScore, subScore);
    }

    // Levenshtein nas palavras principais
    for (const w of words) {
      if (w.length >= 4 && normQuery.length >= 3 && Math.abs(w.length - normQuery.length) <= 2) {
        const sim = calculateStringSimilarity(w, normQuery);
        if (sim >= 0.75) {
          bestScore = Math.max(bestScore, 60 + Math.round(sim * 20));
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
 * Busca inteligente e fuzzy de medicamentos com classificação por relevância.
 */
export const searchUnifiedMedicationsFuzzy = (
  medications: UnifiedMedication[],
  query: string,
  categoryFilter: string = 'all'
): UnifiedMedication[] => {
  const normQuery = normalizeText(query);

  let pool = medications;
  if (categoryFilter && categoryFilter !== 'all') {
    pool = pool.filter(m => m.category === categoryFilter);
  }

  if (!normQuery) {
    return pool;
  }

  const scored: ScoredUnifiedMedication[] = [];

  for (const med of pool) {
    const result = scoreUnifiedMedication(med, normQuery);
    if (result) {
      scored.push(result);
    }
  }

  // Ordena por maior pontuação (relevância); desempate por nome alfabético
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.med.name.localeCompare(b.med.name, 'pt-BR');
  });

  return scored.map(s => s.med);
};
