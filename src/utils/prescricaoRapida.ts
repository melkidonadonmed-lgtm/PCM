/**
 * prescricaoRapida.ts
 * Utilitário para o modo ágil de prescrição médica ambulatorial.
 * Monta posologia estruturada e calcula a quantidade total de comprimidos/cápsulas
 * a dispensar sem menção a caixas ou frascos desnecessários.
 */

export type FrequenciaHorario =
  | '4/4h'
  | '6/6h'
  | '8/8h'
  | '12/12h'
  | '24h'
  | 'manha'
  | 'noite'
  | 'DU'
  | 'SOS';

export type UnidadeDose =
  | 'comprimido'
  | 'cápsula'
  | 'gota'
  | 'mL'
  | 'sachê'
  | 'jato'
  | 'ampola'
  | 'aplicação';

export interface PrescricaoRapidaParams {
  dose: number;
  unidade: UnidadeDose | string;
  frequencia: FrequenciaHorario;
  diasTratamento?: number;
  usoContinuo?: boolean;
  via?: string;
  complemento?: string; // ex: "se dor ou febre", "após as refeições", "em jejum"
}

export interface PrescricaoRapidaResult {
  quantidadeTotalTexto: string;
  quantidadeTotalNumero: number;
  posologiaTexto: string;
}

/**
 * Retorna o número de tomadas por dia com base na frequência selecionada.
 */
export function getTomadasPorDia(frequencia: FrequenciaHorario): number {
  switch (frequencia) {
    case '4/4h':
      return 6;
    case '6/6h':
      return 4;
    case '8/8h':
      return 3;
    case '12/12h':
      return 2;
    case '24h':
    case 'manha':
    case 'noite':
      return 1;
    case 'DU':
    case 'SOS':
    default:
      return 1;
  }
}

/**
 * Pluraliza a unidade da forma farmacêutica respeitando o português brasileiro.
 */
export function formatarUnidadeDose(unidade: string, quantidade: number): string {
  const u = (unidade || 'comprimido').toLowerCase().trim();
  const isPlural = quantidade > 1;

  if (u.startsWith('comp')) {
    return isPlural ? 'comprimidos' : 'comprimido';
  }
  if (u.startsWith('cáps') || u.startsWith('caps')) {
    return isPlural ? 'cápsulas' : 'cápsula';
  }
  if (u.startsWith('sach') || u.startsWith('envelope')) {
    return isPlural ? 'sachês' : 'sachê';
  }
  if (u.startsWith('gota')) {
    return isPlural ? 'gotas' : 'gota';
  }
  if (u === 'ml') {
    return 'mL';
  }
  if (u.startsWith('jato')) {
    return isPlural ? 'jatos' : 'jato';
  }
  if (u.startsWith('ampola')) {
    return isPlural ? 'ampolas' : 'ampola';
  }
  if (u.startsWith('aplica')) {
    return isPlural ? 'aplicações' : 'aplicação';
  }
  if (u.startsWith('drágea') || u.startsWith('dragea')) {
    return isPlural ? 'drágeas' : 'drágea';
  }

  return isPlural ? `${u}s` : u;
}

/**
 * Calcula a quantidade total a dispensar e gera o texto da posologia de modo clínico.
 */
export function calcularPrescricaoRapida(params: PrescricaoRapidaParams): PrescricaoRapidaResult {
  const dose = Math.max(params.dose || 1, 0.25);
  const unidade = params.unidade || 'comprimido';
  const frequencia = params.frequencia || '8/8h';
  const dias = params.diasTratamento && params.diasTratamento > 0 ? params.diasTratamento : 0;
  const isContinuo = !!params.usoContinuo || (dias === 0 && frequencia !== 'DU' && frequencia !== 'SOS');
  const via = (params.via || 'Uso Oral').toLowerCase().replace('uso ', '');

  // 1. Cálculo da quantidade total
  let totalNum = 1;
  const tomadas = getTomadasPorDia(frequencia);

  if (frequencia === 'DU') {
    totalNum = Math.ceil(dose);
  } else if (frequencia === 'SOS') {
    // Para medicamentos SOS (analgésicos/antitérmicos), prescreve quantidade padrão de segurança (ex: 20 comprimidos)
    totalNum = Math.ceil(dose * (dias > 0 ? tomadas * dias : 20));
  } else if (isContinuo) {
    // Uso contínuo ambulatorial padrão: 30 dias (ou 60 se dias especificados)
    const baseDias = dias > 0 ? dias : 30;
    totalNum = Math.ceil(dose * tomadas * baseDias);
  } else {
    const baseDias = dias > 0 ? dias : 5;
    totalNum = Math.ceil(dose * tomadas * baseDias);
  }

  // 2. Formatação da quantidade total em texto limpo
  const unidadePlural = formatarUnidadeDose(unidade, totalNum);
  const quantidadeTotalTexto = `${totalNum} ${unidadePlural}`;

  // 3. Montagem da posologia textual
  const doseStr = dose % 1 === 0 ? dose.toString() : dose.toLocaleString('pt-BR');
  const doseUnidadeStr = `${doseStr} ${formatarUnidadeDose(unidade, dose)}`;

  let frequenciaStr = '';
  switch (frequencia) {
    case '4/4h':
      frequenciaStr = 'de 4 em 4 horas';
      break;
    case '6/6h':
      frequenciaStr = 'de 6 em 6 horas';
      break;
    case '8/8h':
      frequenciaStr = 'de 8 em 8 horas';
      break;
    case '12/12h':
      frequenciaStr = 'de 12 em 12 horas';
      break;
    case '24h':
      frequenciaStr = '1 vez ao dia';
      break;
    case 'manha':
      frequenciaStr = '1 vez ao dia, pela manhã';
      break;
    case 'noite':
      frequenciaStr = 'à noite, ao deitar';
      break;
    case 'DU':
      frequenciaStr = 'em dose única';
      break;
    case 'SOS':
      frequenciaStr = 'em caso de dor ou febre';
      break;
    default:
      frequenciaStr = 'conforme orientação';
  }

  let duracaoStr = '';
  if (frequencia === 'DU') {
    duracaoStr = '';
  } else if (isContinuo) {
    duracaoStr = ' em uso contínuo.';
  } else if (dias > 0) {
    duracaoStr = ` durante ${dias} dias.`;
  } else if (frequencia === 'SOS') {
    duracaoStr = ' se necessário.';
  } else {
    duracaoStr = '.';
  }

  const complementoStr = params.complemento?.trim() ? ` (${params.complemento.trim()})` : '';

  const posologiaTexto = `Tomar ${doseUnidadeStr} via ${via} ${frequenciaStr}${complementoStr}${duracaoStr}`.trim();

  return {
    quantidadeTotalTexto,
    quantidadeTotalNumero: totalNum,
    posologiaTexto
  };
}
