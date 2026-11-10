import { CID_SPECIALTY_AND_ADMIN_ITEMS } from './cidSpecialtyAndAdminItems';

export interface CIDItem {
  code: string;
  description: string;
  category: string;
  keywords?: string[];
  frequent?: boolean;
}

export const CID_CATEGORIES = [
  'Todos',
  'Frequentes',
  'Respiratório',
  'Digestivo',
  'Infecciosas',
  'Osteomuscular',
  'Sintomas Gerais',
  'Neurologia',
  'Saúde Mental',
  'Cardiovascular',
  'Geniturinário',
  'Pele & Dermatologia',
  'Olhos & Ouvidos',
  'Endócrino',
  'Administrativo'
] as const;

export type CIDCategoryType = typeof CID_CATEGORIES[number];

export const COMMON_CID10: CIDItem[] = [
  // RESPIRATÓRIO
  { 
    code: 'J00', 
    description: 'Nasofaringite aguda (resfriado comum)', 
    category: 'Respiratório', 
    keywords: ['resfriado', 'coriza', 'obstrucao nasal', 'gripe leve'], 
    frequent: true 
  },
  { 
    code: 'J06.9', 
    description: 'Infecção aguda das vias aéreas superiores (IVAS), não especificada', 
    category: 'Respiratório', 
    keywords: ['ivas', 'infeccao respiratoria alta', 'resfriado'], 
    frequent: true 
  },
  { 
    code: 'J01.9', 
    description: 'Sinusite aguda, não especificada', 
    category: 'Respiratório', 
    keywords: ['sinusite', 'dor na face', 'congestao nasal', 'rinossinusite'], 
    frequent: true 
  },
  { 
    code: 'J02.9', 
    description: 'Faringite aguda não especificada', 
    category: 'Respiratório', 
    keywords: ['dor de garganta', 'faringite', 'inflamacao garganta'], 
    frequent: true 
  },
  { 
    code: 'J03.9', 
    description: 'Amigdalite aguda não especificada', 
    category: 'Respiratório', 
    keywords: ['amigdalite', 'dor de garganta', 'placas na garganta', 'tonsilite'], 
    frequent: true 
  },
  { 
    code: 'J04.0', 
    description: 'Laringite aguda (Crupe)', 
    category: 'Respiratório', 
    keywords: ['laringite', 'rouquidao', 'tosse rouca', 'tosse de cachorro', 'estridor'] 
  },
  { 
    code: 'J11.1', 
    description: 'Influenza (gripe) com outras manifestações respiratórias', 
    category: 'Respiratório', 
    keywords: ['gripe', 'influenza', 'sindrome gripal', 'febre e dor'], 
    frequent: true 
  },
  { 
    code: 'J18.9', 
    description: 'Pneumonia não especificada', 
    category: 'Respiratório', 
    keywords: ['pneumonia', 'pac', 'infeccao pulmonar', 'infiltrado'] 
  },
  { 
    code: 'J20.9', 
    description: 'Bronquite aguda não especificada', 
    category: 'Respiratório', 
    keywords: ['bronquite', 'tosse produtiva', 'catarro', 'bronquica'] 
  },
  { 
    code: 'J21.9', 
    description: 'Bronquiolite aguda não especificada', 
    category: 'Respiratório', 
    keywords: ['bronquiolite', 'vias aereas inferiores', 'lactente', 'chiado no peito'] 
  },
  { 
    code: 'J45.9', 
    description: 'Asma não especificada / Crise asmática', 
    category: 'Respiratório', 
    keywords: ['asma', 'broncoespasmo', 'crise asmatica', 'falta de ar', 'chiado'], 
    frequent: true 
  },
  { 
    code: 'J30.4', 
    description: 'Rinite alérgica não especificada', 
    category: 'Respiratório', 
    keywords: ['rinite', 'alergia', 'espirros', 'prurido nasal', 'coriza alergica'] 
  },
  { 
    code: 'J44.9', 
    description: 'Doença pulmonar obstrutiva crônica (DPOC) não especificada', 
    category: 'Respiratório', 
    keywords: ['dpoc', 'enfisema', 'bronquite cronica', 'tabagismo'] 
  },
  { 
    code: 'U07.1', 
    description: 'COVID-19, vírus identificado', 
    category: 'Respiratório', 
    keywords: ['covid', 'coronavirus', 'sars-cov-2', 'positivo'], 
    frequent: true 
  },
  { 
    code: 'U07.2', 
    description: 'COVID-19, vírus não identificado (suspeita clínica)', 
    category: 'Respiratório', 
    keywords: ['covid suspeita', 'sindrome respiratoria aguda', 'contato covid'] 
  },

  // GASTROINTESTINAL & DIGESTIVO
  { 
    code: 'A09', 
    description: 'Gastroenterite e colite de origem infecciosa presumível', 
    category: 'Digestivo', 
    keywords: ['diarreia', 'vomito', 'virose gastrointestinal', 'geca', 'dor de barriga'], 
    frequent: true 
  },
  { 
    code: 'K29.7', 
    description: 'Gastrite não especificada', 
    category: 'Digestivo', 
    keywords: ['gastrite', 'queimacao no estomago', 'azia', 'dor epigastrica', 'azia'], 
    frequent: true 
  },
  { 
    code: 'K21.9', 
    description: 'Doença do refluxo gastroesofágico (DRGE) sem esofagite', 
    category: 'Digestivo', 
    keywords: ['refluxo', 'drge', 'pirose', 'azia', 'regurgitacao'] 
  },
  { 
    code: 'K59.0', 
    description: 'Constipação intestinal (prisão de ventre)', 
    category: 'Digestivo', 
    keywords: ['constipacao', 'prisao de ventre', 'fezes ressecadas', 'intestino preso'] 
  },
  { 
    code: 'K58.9', 
    description: 'Síndrome do intestino irritável sem diarreia', 
    category: 'Digestivo', 
    keywords: ['sii', 'intestino irritavel', 'distensao abdominal', 'dispepsia'] 
  },
  { 
    code: 'K80.2', 
    description: 'Calculose da vesícula biliar sem colecistite (Colelitíase)', 
    category: 'Digestivo', 
    keywords: ['pedra na vesicula', 'colelitiase', 'colica biliar'] 
  },
  { 
    code: 'K35.8', 
    description: 'Apendicite aguda, outras e não especificadas', 
    category: 'Digestivo', 
    keywords: ['apendicite', 'dor na fossa iliaca direita', 'abdomen agudo'] 
  },
  { 
    code: 'R10.4', 
    description: 'Outras dores abdominais e as não especificadas', 
    category: 'Digestivo', 
    keywords: ['dor abdominal', 'colica abdominal', 'dor na barriga'], 
    frequent: true 
  },
  { 
    code: 'R11', 
    description: 'Náusea e vômitos', 
    category: 'Digestivo', 
    keywords: ['vomito', 'nausea', 'enjoo', 'ansia de vomito'], 
    frequent: true 
  },

  // INFECCIOSAS & ARBOVIROSES
  { 
    code: 'A90', 
    description: 'Dengue clássico', 
    category: 'Infecciosas', 
    keywords: ['dengue', 'arbovirose', 'febre alta', 'dor retroorbital', 'mialgia intensa'], 
    frequent: true 
  },
  { 
    code: 'A91', 
    description: 'Febre hemorrágica devida ao vírus do dengue', 
    category: 'Infecciosas', 
    keywords: ['dengue grave', 'dengue hemorragica', 'plaquetopenia'] 
  },
  { 
    code: 'A92.0', 
    description: 'Febre de Chikungunya', 
    category: 'Infecciosas', 
    keywords: ['chikungunya', 'artralgia intensa', 'febre e dor articular'] 
  },
  { 
    code: 'A92.8', 
    description: 'Outras febres virais especificadas transmitidas por mosquitos (Zika)', 
    category: 'Infecciosas', 
    keywords: ['zika', 'exantema', 'prurido', 'olho vermelho'] 
  },
  { 
    code: 'B34.9', 
    description: 'Infecção viral não especificada (Virose)', 
    category: 'Infecciosas', 
    keywords: ['virose', 'quadro viral', 'infeccao viral'], 
    frequent: true 
  },
  { 
    code: 'B01.9', 
    description: 'Varicela sem complicação (Catapora)', 
    category: 'Infecciosas', 
    keywords: ['catapora', 'varicela', 'vesiculas', 'exantema vesicular'] 
  },
  { 
    code: 'B08.4', 
    description: 'Estomatite vesicular enteroviral com exantema (Mão-pé-boca)', 
    category: 'Infecciosas', 
    keywords: ['mao pe boca', 'coxsackie', 'estomatite enteroviral', 'lesoes orais'], 
    frequent: true 
  },
  { 
    code: 'B02.9', 
    description: 'Herpes zoster sem complicação (Cobreiro)', 
    category: 'Infecciosas', 
    keywords: ['herpes zoster', 'cobreiro', 'dor neuropatica', 'vesiculas dermatomo'] 
  },
  { 
    code: 'B00.9', 
    description: 'Infecção por vírus do herpes simples, não especificada', 
    category: 'Infecciosas', 
    keywords: ['herpes labial', 'herpes simples', 'vesiculas nos labios'] 
  },
  { 
    code: 'B82.9', 
    description: 'Parasitose intestinal não especificada', 
    category: 'Infecciosas', 
    keywords: ['vermes', 'parasitose', 'helmintos', 'amebiase', 'giardiase'] 
  },

  // OSTEOMUSCULAR, ORTOPEDIA & TRAUMA
  { 
    code: 'M54.5', 
    description: 'Dor lombar baixa (Lombalgia)', 
    category: 'Osteomuscular', 
    keywords: ['lombalgia', 'dor na coluna', 'coluna lombar', 'dor nas costas', 'bico de papagaio'], 
    frequent: true 
  },
  { 
    code: 'M54.2', 
    description: 'Cervicalgia (Dor na coluna cervical / Pescoço)', 
    category: 'Osteomuscular', 
    keywords: ['cervicalgia', 'dor no pescoco', 'torcicolo', 'coluna cervical'], 
    frequent: true 
  },
  { 
    code: 'M54.4', 
    description: 'Lombociatalgia (Lombalgia com ciática)', 
    category: 'Osteomuscular', 
    keywords: ['ciatico', 'lombociatalgia', 'hernia de disco', 'dor irradiada para perna'] 
  },
  { 
    code: 'M79.1', 
    description: 'Mialgia (Dor muscular generalizada ou localizada)', 
    category: 'Osteomuscular', 
    keywords: ['mialgia', 'dor muscular', 'tensao muscular', 'contratura'], 
    frequent: true 
  },
  { 
    code: 'M79.7', 
    description: 'Fibromialgia', 
    category: 'Osteomuscular', 
    keywords: ['fibromialgia', 'dor cronica generalizada', 'pontos dolorosos'] 
  },
  { 
    code: 'M25.5', 
    description: 'Dor articular (Artralgia)', 
    category: 'Osteomuscular', 
    keywords: ['artralgia', 'dor nas articulacoes', 'dor no joelho', 'dor no ombro'] 
  },
  { 
    code: 'M65.9', 
    description: 'Sinovite e tendinite não especificadas (Tendinopatia / LER / DORT)', 
    category: 'Osteomuscular', 
    keywords: ['tendinite', 'sinovite', 'ler', 'dort', 'inflamacao no tendao'] 
  },
  { 
    code: 'M75.1', 
    description: 'Síndrome do manguito rotador (Ombro doloroso)', 
    category: 'Osteomuscular', 
    keywords: ['manguito rotador', 'dor no ombro', 'tendinite supraespinhal'] 
  },
  { 
    code: 'M77.1', 
    description: 'Epicondilite lateral (Cotovelo de tenista)', 
    category: 'Osteomuscular', 
    keywords: ['epicondilite', 'dor no cotovelo', 'cotovelo de tenista'] 
  },
  { 
    code: 'M77.3', 
    description: 'Esporão do calcâneo / Fascite plantar', 
    category: 'Osteomuscular', 
    keywords: ['fascite plantar', 'esporao calcaneo', 'dor no calcanhar'] 
  },
  { 
    code: 'S93.4', 
    description: 'Entorse e distensão do tornozelo', 
    category: 'Osteomuscular', 
    keywords: ['entorse tornozelo', 'torcao no pe', 'virou o pe', 'distensao ligamentar'], 
    frequent: true 
  },
  { 
    code: 'S63.5', 
    description: 'Entorse e distensão do punho', 
    category: 'Osteomuscular', 
    keywords: ['entorse punho', 'torcao no pulso', 'queda sobre a mao'] 
  },
  { 
    code: 'S83.6', 
    description: 'Entorse e distensão do joelho', 
    category: 'Osteomuscular', 
    keywords: ['entorse de joelho', 'torcao no joelho', 'lesao meniscal'] 
  },
  { 
    code: 'S52.5', 
    description: 'Fratura da extremidade distal do rádio (Punho)', 
    category: 'Osteomuscular', 
    keywords: ['fratura do radio', 'fratura no punho', 'braco quebrado'] 
  },
  { 
    code: 'T14.0', 
    description: 'Traumatismo superficial de região não especificada (Contusão / Escoriação)', 
    category: 'Osteomuscular', 
    keywords: ['contusao', 'queda', 'escoriacao', 'trauma superficial', 'pancada'] 
  },

  // GENITURINÁRIO & SAÚDE DA MULHER
  { 
    code: 'N39.0', 
    description: 'Infecção do trato urinário de localização não especificada (ITU)', 
    category: 'Geniturinário', 
    keywords: ['itu', 'infeccao urinaria', 'ardor ao urinar', 'disuria', 'polaciuria'], 
    frequent: true 
  },
  { 
    code: 'N30.0', 
    description: 'Cistite aguda', 
    category: 'Geniturinário', 
    keywords: ['cistite', 'ardor miccional', 'urina presa', 'bexiga inflamada'], 
    frequent: true 
  },
  { 
    code: 'N10', 
    description: 'Nefrite tubulointersticial aguda (Pielonefrite aguda)', 
    category: 'Geniturinário', 
    keywords: ['pielonefrite', 'infeccao renal', 'dor lombar e febre alta', 'giordano'] 
  },
  { 
    code: 'N20.1', 
    description: 'Cálculo do ureter (Cólica nefrética / Cólica renal)', 
    category: 'Geniturinário', 
    keywords: ['colica renal', 'pedra no rim', 'calculo ureteral', 'dor lombar intensa'], 
    frequent: true 
  },
  { 
    code: 'N40', 
    description: 'Hiperplasia da próstata (HPB)', 
    category: 'Geniturinário', 
    keywords: ['prostata aumentada', 'hpb', 'jato urinario fraco', 'nocturia'] 
  },
  { 
    code: 'N76.0', 
    description: 'Vaginite aguda (Vulvovaginite / Corrimento vaginal)', 
    category: 'Geniturinário', 
    keywords: ['vulvovaginite', 'corrimento', 'candidiase vaginal', 'prurido vaginal'] 
  },
  { 
    code: 'N94.6', 
    description: 'Dismenorreia não especificada (Cólica menstrual)', 
    category: 'Geniturinário', 
    keywords: ['colica menstrual', 'dismenorreia', 'dor no periodo menstrual'], 
    frequent: true 
  },

  // SINTOMAS GERAIS & SINAIS
  { 
    code: 'R50.9', 
    description: 'Febre não especificada (Febre a esclarecer)', 
    category: 'Sintomas Gerais', 
    keywords: ['febre', 'hipertermia', 'temperatura elevada', 'febril'], 
    frequent: true 
  },
  { 
    code: 'R51', 
    description: 'Cefaleia / Dor de cabeça', 
    category: 'Sintomas Gerais', 
    keywords: ['dor de cabeca', 'cefaleia', 'pressao na cabeca'], 
    frequent: true 
  },
  { 
    code: 'R53', 
    description: 'Mal-estar e fadiga (Astenia / Prostração)', 
    category: 'Sintomas Gerais', 
    keywords: ['astenia', 'fadiga', 'cansaco', 'fraqueza', 'prostracao', 'moleza'], 
    frequent: true 
  },
  { 
    code: 'R55', 
    description: 'Síncope e colapso (Desmaio / Lipotimia)', 
    category: 'Sintomas Gerais', 
    keywords: ['desmaio', 'sincope', 'lipotimia', 'perda de consciencia transitoria'] 
  },
  { 
    code: 'R42', 
    description: 'Tontura e instabilidade (Vertigem / Labirintite)', 
    category: 'Sintomas Gerais', 
    keywords: ['tontura', 'vertigem', 'labirintite', 'sensacao de rotacao', 'desequilibrio'], 
    frequent: true 
  },
  { 
    code: 'R07.4', 
    description: 'Dor torácica, não especificada', 
    category: 'Sintomas Gerais', 
    keywords: ['dor no peito', 'dor toracica', 'desconforto precordial'] 
  },
  { 
    code: 'R05', 
    description: 'Tosse', 
    category: 'Sintomas Gerais', 
    keywords: ['tosse seca', 'tosse persistente', 'tosse noturna'], 
    frequent: true 
  },
  { 
    code: 'R06.0', 
    description: 'Dispneia (Falta de ar)', 
    category: 'Sintomas Gerais', 
    keywords: ['falta de ar', 'dispneia', 'cansaco respiratorio', 'dificuldade para respirar'] 
  },
  { 
    code: 'R04.0', 
    description: 'Epistaxe (Sangramento nasal)', 
    category: 'Sintomas Gerais', 
    keywords: ['sangramento no nariz', 'epistaxe', 'hemorragia nasal'] 
  },

  ...CID_SPECIALTY_AND_ADMIN_ITEMS
];

/**
 * Normalizes text removing accents, punctuation and lowercasing for accurate search
 */
export function normalizeCidSearchText(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Filter CID-10 items based on query string and optional category filter
 */
export function searchCID10(query: string, categoryFilter: CIDCategoryType = 'Todos'): CIDItem[] {
  const safeQuery = typeof query === 'string' ? query : '';
  const normQuery = normalizeCidSearchText(safeQuery);
  if (safeQuery.trim().length > 0 && !normQuery) {
    return [];
  }
  const cleanCodeQuery = safeQuery.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  return COMMON_CID10.filter(item => {
    // Category match
    if (categoryFilter === 'Frequentes' && !item.frequent) {
      return false;
    }
    if (categoryFilter !== 'Todos' && categoryFilter !== 'Frequentes' && item.category !== categoryFilter) {
      return false;
    }

    if (!normQuery) {
      return true;
    }

    // Direct Code Match (e.g. "J00", "A09", "M54.5", "J069")
    const itemCodeClean = item.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (itemCodeClean.includes(cleanCodeQuery) || item.code.toLowerCase().includes(normQuery)) {
      return true;
    }

    // Description match
    const normDesc = normalizeCidSearchText(item.description);
    const queryTokens = normQuery.split(/\s+/).filter(Boolean);
    
    // All tokens must match either description, keywords or category
    const allTokensMatch = queryTokens.every(token => {
      if (normDesc.includes(token)) return true;
      if (item.keywords?.some(kw => normalizeCidSearchText(kw).includes(token))) return true;
      if (normalizeCidSearchText(item.category).includes(token)) return true;
      return false;
    });

    return allTokensMatch;
  });
}
