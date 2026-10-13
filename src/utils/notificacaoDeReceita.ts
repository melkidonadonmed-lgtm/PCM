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
 *    Acima desses limites a exigência é a Notificação A, e o app não detecta;
 *  - fenobarbital (adendo da Lista B1);
 *  - toda a Lista C1 (antidepressivos, antipsicóticos, anticonvulsivantes).
 *
 * Também ficam de fora, sem aviso: tretinoína (C2; o uso corrente é tópico, sem
 * retenção de receita) e talidomida/lenalidomida (C3, com regras próprias).
 *
 * A busca é por nome: marca comercial que não esteja na tabela passa sem aviso.
 * Ausência de aviso não significa que a receita emitida pelo app basta.
 */
export interface NotificacaoDeReceita {
  lista: 'A1' | 'A3' | 'B1' | 'B2' | 'C2';
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
  { termos: ['isotretinoina', 'roacutan', 'acitretina'], notificacao: NOTIFICACAO_RETINOIDE }
];

/** Todos os termos que disparam o aviso (os testes conferem cada um contra o regime de controle especial). */
export const TERMOS_COM_NOTIFICACAO: string[] = REGRAS.flatMap(({ termos, palavrasInteiras = [] }) => [
  ...termos,
  ...palavrasInteiras
]);

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
  return regra ? regra.notificacao : null;
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

