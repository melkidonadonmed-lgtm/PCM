import { textoDoMedicamento, type MedicamentoClassificavel } from './isSpecialControlOrAntibiotic';

/**
 * Medicamentos cuja dispensação em farmácia exige Notificação de Receita, em
 * talonário específico (Portaria SVS/MS nº 344/98, arts. 35 a 50). O app não
 * emite esse talonário: a folha de controle especial impressa aqui não o
 * substitui, e a tela precisa avisar o médico.
 *
 * Listas conferidas no Anexo I da Portaria 344/98, Atualização nº 101
 * (RDC Anvisa nº 1.036, de 09/07/2026). Reconferir a cada atualização do anexo.
 *
 * Ficam de fora, de propósito, os controlados que os adendos mandam para a
 * Receita de Controle Especial em 2 vias — a folha que o app já emite:
 *  - codeína (até 100 mg por unidade posológica e até 2,5% nas formas
 *    indivisíveis) e tramadol (até 100 mg por unidade) — adendos da Lista A2.
 *    Acima de 100 mg por unidade posológica a exigência passa a ser a
 *    Notificação de Receita A (amarela), que o app detecta e avisa;
 *  - fenobarbital (adendo da Lista B1);
 *  - toda a Lista C1 (antidepressivos, antipsicóticos, anticonvulsivantes).
 *
 * Também fica de fora, sem aviso: tretinoína (C2; o uso corrente é tópico, sem
 * retenção de receita). A Lista C3 (talidomida/lenalidomida) recebe aviso de
 * Notificação de Receita da Lista C3 com Termo de Responsabilidade.
 *
 * A busca é por nome: marca comercial que não esteja na tabela passa sem aviso.
 * Ausência de aviso não significa que a receita emitida pelo app basta.
 */
export interface NotificacaoDeReceita {
  lista: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C2' | 'C3';
  /** Nome do documento exigido, com a cor do talonário quando a portaria a define. */
  documento: string;
  /** Forma curta para selos: "Notificação A". */
  rotuloCurto: string;
  /** Apresentação que muda a exigência e que o app não consegue distinguir pelo nome. */
  ressalva?: string;
}

const NOTIFICACAO_A = { documento: 'Notificação de Receita A (amarela)', rotuloCurto: 'Notificação A' };
const NOTIFICACAO_B = { documento: 'Notificação de Receita B (azul)', rotuloCurto: 'Notificação B' };
const NOTIFICACAO_RETINOIDE: NotificacaoDeReceita = {
  lista: 'C2',
  documento: 'Notificação de Receita Especial de retinoides (branca)',
  rotuloCurto: 'Notificação Especial',
  ressalva: 'no uso sistêmico, com Termo de Consentimento Pós-Informação; o uso tópico não exige notificação'
};
const NOTIFICACAO_C3: NotificacaoDeReceita = {
  lista: 'C3',
  documento: 'Notificação de Receita da Lista C3 (branca)',
  rotuloCurto: 'Notificação C3',
  ressalva: 'com Termo de Responsabilidade e Esclarecimento obrigatório'
};

// `palavrasInteiras`: termos que só valem como palavra inteira ("morfina" não
// pode casar dentro de "apomorfina" nem de "etilmorfina").
const REGRAS: Array<{ termos: string[]; palavrasInteiras?: string[]; notificacao: NotificacaoDeReceita }> = [
  // Lista A1 — entorpecentes
  {
    termos: ['dimorf', 'metadona', 'fentanil', 'petidina', 'meperidina', 'hidromorfona', 'tapentadol'],
    palavrasInteiras: ['morfina'],
    notificacao: { lista: 'A1', ...NOTIFICACAO_A }
  },
  {
    termos: ['oxicodona'],
    notificacao: {
      lista: 'A1',
      ...NOTIFICACAO_A,
      ressalva: 'exceto comprimido de liberação controlada com até 40 mg por unidade, que sai em Receita de Controle Especial'
    }
  },
  {
    termos: ['buprenorfina'],
    notificacao: {
      lista: 'A1',
      ...NOTIFICACAO_A,
      ressalva: 'exceto adesivo transdérmico de matriz (sem reservatório), que sai em Receita de Controle Especial'
    }
  },
  // Lista A3 — psicotrópicos estimulantes
  {
    termos: ['metilfenidato', 'ritalina', 'concerta', 'lisdexanfetamina', 'venvanse'],
    notificacao: { lista: 'A3', ...NOTIFICACAO_A }
  },
  // Lista B1 — benzodiazepínicos, hipnóticos "Z" (zolpidem, zopiclona e eszopiclona desde 01/08/2024) e modafinila
  {
    termos: [
      'diazepam', 'valium', 'clonazepam', 'rivotril', 'alprazolam', 'frontin',
      'lorazepam', 'bromazepam', 'lexotan', 'midazolam', 'dormonid',
      'clobazam', 'cloxazolam', 'clordiazepoxido', 'clorazepato', 'nitrazepam', 'flunitrazepam',
      'flurazepam', 'estazolam', 'oxazepam', 'triazolam',
      'zolpidem', 'stilnox', 'zopiclona', 'zaleplona', 'lemborexant',
      'modafinila', 'stavigile'
    ],
    palavrasInteiras: ['frontal'],
    notificacao: { lista: 'B1', ...NOTIFICACAO_B }
  },
  // Lista B2 — anorexígenos
  {
    termos: ['sibutramina', 'anfepramona', 'femproporex', 'mazindol'],
    notificacao: { lista: 'B2', documento: 'Notificação de Receita B2', rotuloCurto: 'Notificação B2' }
  },
  // Lista C2 — retinoides
  { termos: ['isotretinoina', 'roacutan', 'acitretina'], notificacao: NOTIFICACAO_RETINOIDE },
  // Lista C3 — imunossupressores
  { termos: ['talidomida', 'lenalidomida'], notificacao: NOTIFICACAO_C3 }
];

/** Todos os termos que disparam o aviso (os testes conferem cada um contra o regime de controle especial). */
export const TERMOS_COM_NOTIFICACAO: string[] = REGRAS.flatMap(({ termos, palavrasInteiras = [] }) => [
  ...termos,
  ...palavrasInteiras
]);

const TERMOS_ADENDO_A2_REGEX = /\b(?:codeina|tramadol|tramal|sylador)\b/;
const DOSE_UNITARIA_MG_REGEX = /(\d+(?:[.,]\d+)?)\s*mg\b(?!\s*\/)/;

/**
 * Adendo da Lista A2 (Portaria SVS/MS nº 344/98): codeína e tramadol saem em
 * Receita de Controle Especial quando até 100 mg por unidade posológica; acima
 * de 100 mg por unidade, exigem Notificação de Receita A (amarela).
 * Ignora concentrações líquidas (`mg/mL`, `mg/5 mL`) e isola cada fármaco em
 * associações (`Paracetamol 500 mg + Fosfato de Codeína 30 mg`).
 */
function excedeAdendoListaA2(texto: string): NotificacaoDeReceita | null {
  if (!TERMOS_ADENDO_A2_REGEX.test(texto)) return null;

  const clausulas = texto.split(/\s*(?:\+|\bcom\b|\s\/\s)\s*/);
  const trechosAlvo = clausulas.filter((trecho) => TERMOS_ADENDO_A2_REGEX.test(trecho));
  const candidatos = trechosAlvo.length > 0 ? trechosAlvo : [texto];

  for (const trecho of candidatos) {
    const match = trecho.match(DOSE_UNITARIA_MG_REGEX);
    if (!match) continue;
    const mg = parseFloat(match[1].replace(',', '.'));
    if (Number.isFinite(mg) && mg > 100) {
      return {
        lista: 'A2',
        ...NOTIFICACAO_A,
        ressalva: 'acima de 100 mg por unidade posológica (adendo da Lista A2)'
      };
    }
  }
  return null;
}

/**
 * Devolve a Notificação de Receita que o medicamento exige, ou `null` quando o
 * nome não está na tabela. Olha só o nome e o princípio ativo.
 */
export function notificacaoExigida(med?: MedicamentoClassificavel): NotificacaoDeReceita | null {
  const texto = textoDoMedicamento(med);
  if (!texto) return null;
  const regra = REGRAS.find(
    ({ termos, palavrasInteiras = [] }) =>
      termos.some((termo) => texto.includes(termo)) ||
      palavrasInteiras.some((termo) => new RegExp(`\\b${termo}\\b`).test(texto))
  );
  if (regra) return regra.notificacao;
  return excedeAdendoListaA2(texto);
}

/** Frase da exigência para a tela: "Notificação de Receita B (azul) — Lista B1". */
export function descreverNotificacao(notificacao: NotificacaoDeReceita): string {
  const base = `${notificacao.documento} — Lista ${notificacao.lista}`;
  return notificacao.ressalva ? `${base}, ${notificacao.ressalva}` : base;
}

/**
 * Ressalva textual para cópia/WhatsApp quando há medicamentos que exigem
 * talonário próprio de Notificação de Receita (Portaria SVS/MS nº 344/98).
 * Retorna string vazia quando nenhum item exige notificação.
 */
export function avisoTextoNotificacao(items: Array<MedicamentoClassificavel & { name?: string }>): string {
  const exigencias = (items || [])
    .map((item) => {
      const notif = notificacaoExigida(item);
      return notif ? { nome: item?.name?.trim() || 'Medicamento controlado', notif } : null;
    })
    .filter((x): x is { nome: string; notif: NotificacaoDeReceita } => x !== null);

  if (exigencias.length === 0) return '';

  const detalhes = exigencias
    .map(({ nome, notif }) => `${nome} (${descreverNotificacao(notif)})`)
    .join('; ');

  return `⚠️ Nota sanitária (Portaria SVS/MS nº 344/98): a dispensação de ${detalhes} exige talonário próprio de Notificação de Receita emitido presencialmente pelo médico.`;
}

