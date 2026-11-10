import type { CIDItem } from './cidCatalog';

export const CID_SPECIALTY_AND_ADMIN_ITEMS: CIDItem[] = [
  // NEUROLOGIA
  { 
    code: 'G43.9', 
    description: 'Enxaqueca sem especificação (Migrânea)', 
    category: 'Neurologia', 
    keywords: ['enxaqueca', 'migranea', 'dor de cabeca pulsante', 'fotofobia', 'aura'], 
    frequent: true 
  },
  { 
    code: 'G44.2', 
    description: 'Cefaleia tensional', 
    category: 'Neurologia', 
    keywords: ['cefaleia tensional', 'dor em faixa na cabeca', 'tensao muscular nuca'] 
  },
  { 
    code: 'G40.9', 
    description: 'Epilepsia não especificada (Crise convulsiva)', 
    category: 'Neurologia', 
    keywords: ['epilepsia', 'convulsao', 'crise epileptica'] 
  },
  { 
    code: 'H81.1', 
    description: 'Vertigem posicional paroxística benigna (VPPB)', 
    category: 'Neurologia', 
    keywords: ['vppb', 'labirintite posicional', 'vertigem ao deitar'] 
  },
  { 
    code: 'G51.0', 
    description: 'Paralisia de Bell (Paralisia facial periférica)', 
    category: 'Neurologia', 
    keywords: ['paralisia facial', 'paralisia de bell', 'boca torta'] 
  },

  // SAÚDE MENTAL / PSIQUIATRIA
  { 
    code: 'F41.1', 
    description: 'Transtorno de ansiedade generalizada (TAG)', 
    category: 'Saúde Mental', 
    keywords: ['ansiedade', 'tag', 'crise de ansiedade', 'preocupacao excessiva', 'nervosismo'], 
    frequent: true 
  },
  { 
    code: 'F41.0', 
    description: 'Transtorno de pânico (Ansiedade paroxística episódica)', 
    category: 'Saúde Mental', 
    keywords: ['panico', 'crise de panico', 'taquicardia ansiosa', 'medo de morrer'], 
    frequent: true 
  },
  { 
    code: 'F32.9', 
    description: 'Episódio depressivo não especificado', 
    category: 'Saúde Mental', 
    keywords: ['depressao', 'tristeza profunda', 'anedonia', 'episodio depressivo'], 
    frequent: true 
  },
  { 
    code: 'F43.0', 
    description: 'Reação aguda ao estresse', 
    category: 'Saúde Mental', 
    keywords: ['estresse agudo', 'sobrecarga emocional', 'trauma psicologico recente'] 
  },
  { 
    code: 'F43.2', 
    description: 'Transtornos de adaptação', 
    category: 'Saúde Mental', 
    keywords: ['adaptacao', 'luto', 'estresse situacional'] 
  },
  { 
    code: 'Z73.0', 
    description: 'Esgotamento profissional (Síndrome de Burnout)', 
    category: 'Saúde Mental', 
    keywords: ['burnout', 'esgotamento', 'estresse no trabalho', 'estafa'], 
    frequent: true 
  },
  { 
    code: 'F90.0', 
    description: 'Distúrbios da atividade e da atenção (TDAH)', 
    category: 'Saúde Mental', 
    keywords: ['tdah', 'deficit de atencao', 'hiperatividade', 'desatencao'] 
  },
  { 
    code: 'F51.0', 
    description: 'Insônia não-orgânica', 
    category: 'Saúde Mental', 
    keywords: ['insonia', 'dificuldade para dormir', 'sono fragmentado'] 
  },

  // CARDIOVASCULAR
  { 
    code: 'I10', 
    description: 'Hipertensão essencial (primária) / Pressão Alta', 
    category: 'Cardiovascular', 
    keywords: ['hipertensao', 'pressao alta', 'has', 'picos pressoricos'], 
    frequent: true 
  },
  { 
    code: 'I20.9', 
    description: 'Angina pectoris não especificada', 
    category: 'Cardiovascular', 
    keywords: ['angina', 'isquemia miocardica', 'dor no peito ao esforco'] 
  },
  { 
    code: 'I50.9', 
    description: 'Insuficiência cardíaca não especificada (ICC)', 
    category: 'Cardiovascular', 
    keywords: ['icc', 'insuficiencia cardiaca', 'edema de pernas', 'coracao fraco'] 
  },
  { 
    code: 'I83.9', 
    description: 'Varizes dos membros inferiores sem úlcera ou inflamação', 
    category: 'Cardiovascular', 
    keywords: ['varizes', 'insuficiencia venosa', 'pernas pesadas', 'edema venoso'] 
  },
  { 
    code: 'I80.2', 
    description: 'Flebite e tromboflebite de vasos profundos dos membros inferiores (TVP)', 
    category: 'Cardiovascular', 
    keywords: ['tvp', 'trombose venosa profunda', 'edema unilateral de perna'] 
  },

  // PELE & DERMATOLOGIA
  { 
    code: 'L20.9', 
    description: 'Dermatite atópica não especificada (Eczema)', 
    category: 'Pele & Dermatologia', 
    keywords: ['dermatite atopica', 'eczema', 'pele seca e coceira', 'alergia de pele'], 
    frequent: true 
  },
  { 
    code: 'L50.9', 
    description: 'Urticária não especificada', 
    category: 'Pele & Dermatologia', 
    keywords: ['urticaria', 'placas vermelhas', 'coceira no corpo', 'alergia cutanea'], 
    frequent: true 
  },
  { 
    code: 'L02.9', 
    description: 'Abscesso cutâneo, furúnculo e antraz não especificados', 
    category: 'Pele & Dermatologia', 
    keywords: ['furunculo', 'abscesso', 'nodulo com pus', 'foliculite grave'] 
  },
  { 
    code: 'L03.9', 
    description: 'Celulite bacteriana / Erisipela de localização não especificada', 
    category: 'Pele & Dermatologia', 
    keywords: ['erisipela', 'celulite bacteriana', 'pele quente e vermelha'] 
  },
  { 
    code: 'L70.0', 
    description: 'Acne vulgar', 
    category: 'Pele & Dermatologia', 
    keywords: ['acne', 'espinhas', 'cravos', 'foliculite facial'] 
  },
  { 
    code: 'L23.9', 
    description: 'Dermatite alérgica de contato de causa não especificada', 
    category: 'Pele & Dermatologia', 
    keywords: ['dermatite de contato', 'alergia a bijuteria', 'alergia a cosmetico'] 
  },
  { 
    code: 'B35.9', 
    description: 'Dermatofitose não especificada (Micose de pele / Pé de atleta)', 
    category: 'Pele & Dermatologia', 
    keywords: ['micose', 'tinea', 'pe de atleta', 'frieira', 'fungo na pele'] 
  },

  // OLHOS & OUVIDOS
  { 
    code: 'H10.9', 
    description: 'Conjuntivite não especificada (Bacteriana / Viral)', 
    category: 'Olhos & Ouvidos', 
    keywords: ['conjuntivite', 'olho vermelho', 'secrecao nos olhos', 'olhos colando'], 
    frequent: true 
  },
  { 
    code: 'H10.1', 
    description: 'Conjuntivite atópica aguda (Alérgica)', 
    category: 'Olhos & Ouvidos', 
    keywords: ['conjuntivite alergica', 'coceira nos olhos', 'olho lacrimejando'] 
  },
  { 
    code: 'H00.0', 
    description: 'Hordéolo e outras inflamações profundas da pálpebra (Terçol)', 
    category: 'Olhos & Ouvidos', 
    keywords: ['tercol', 'hordeolo', 'caroco na palpebra', 'nodulo doloroso olho'] 
  },
  { 
    code: 'H66.9', 
    description: 'Otite média não especificada', 
    category: 'Olhos & Ouvidos', 
    keywords: ['otite media', 'dor de ouvido', 'otalgia', 'ouvido inflamado'], 
    frequent: true 
  },
  { 
    code: 'H60.9', 
    description: 'Otite externa não especificada (Otite do nadador)', 
    category: 'Olhos & Ouvidos', 
    keywords: ['otite externa', 'dor ao tracionar orelha', 'ouvido com agua'] 
  },
  { 
    code: 'H93.1', 
    description: 'Tinnitus (Zumbido nos ouvidos)', 
    category: 'Olhos & Ouvidos', 
    keywords: ['zumbido', 'tinnitus', 'apito no ouvido', 'ruido no ouvido'] 
  },

  // ENDÓCRINO & METABOLOGIA
  { 
    code: 'E11.9', 
    description: 'Diabetes mellitus não-insulino-dependente sem complicações (DM tipo 2)', 
    category: 'Endócrino', 
    keywords: ['diabetes', 'dm2', 'glicemia alta', 'hiperglicemia'], 
    frequent: true 
  },
  { 
    code: 'E10.9', 
    description: 'Diabetes mellitus insulino-dependente sem complicações (DM tipo 1)', 
    category: 'Endócrino', 
    keywords: ['diabetes tipo 1', 'dm1', 'uso de insulina'] 
  },
  { 
    code: 'E03.9', 
    description: 'Hipotireoidismo não especificado', 
    category: 'Endócrino', 
    keywords: ['hipotireoidismo', 'tsh elevado', 'tireoide lenta', 'levotiroxina'] 
  },
  { 
    code: 'E66.9', 
    description: 'Obesidade não especificada', 
    category: 'Endócrino', 
    keywords: ['obesidade', 'excesso de peso', 'imc elevado', 'sobrepeso'] 
  },
  { 
    code: 'E78.0', 
    description: 'Hipercolesterolemia pura (Colesterol alto / Dislipidemia)', 
    category: 'Endócrino', 
    keywords: ['colesterol alto', 'dislipidemia', 'ldl elevado', 'estatina'] 
  },

  // ADMINISTRATIVO & CHECK-UP / ROTINA
  { 
    code: 'Z76.0', 
    description: 'Emissão de prescrição de repetição (Renovação de receita médica)', 
    category: 'Administrativo', 
    keywords: ['receita de uso continuo', 'renovacao de receita', 'prescricao'], 
    frequent: true 
  },
  { 
    code: 'Z00.0', 
    description: 'Exame médico geral (Check-up / Avaliação periódica de rotina)', 
    category: 'Administrativo', 
    keywords: ['check-up', 'exame de rotina', 'avaliacao preventiva', 'saude geral'], 
    frequent: true 
  },
  { 
    code: 'Z02.1', 
    description: 'Exame pré-admissional (Aptidão para o trabalho)', 
    category: 'Administrativo', 
    keywords: ['admissional', 'exame admissional', 'apto para o trabalho', 'aso'] 
  },
  { 
    code: 'Z02.7', 
    description: 'Emissão de atestado médico (Finalidade de comparecimento / Afastamento)', 
    category: 'Administrativo', 
    keywords: ['emissao atestado', 'atestado comparecimento', 'atestado simples'], 
    frequent: true 
  },
  { 
    code: 'Z76.2', 
    description: 'Consulta para supervisão de saúde de criança sadia (Puericultura)', 
    category: 'Administrativo', 
    keywords: ['puericultura', 'consulta pediatrica de rotina', 'crescimento e desenvolvimento'] 
  },
  { 
    code: 'Z76.3', 
    description: 'Pessoa saudável acompanhando pessoa doente (Atestado de acompanhante)', 
    category: 'Administrativo', 
    keywords: ['acompanhante', 'atestado de acompanhamento', 'declaracao acompanhante'], 
    frequent: true 
  }
];
