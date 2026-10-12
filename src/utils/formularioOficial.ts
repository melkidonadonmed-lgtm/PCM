/**
 * Encaixe de texto nos campos dos formulários oficiais do SUS.
 *
 * O formulário é uma imagem de fundo com caixas de tamanho fixo, então o texto
 * precisa caber na caixa: a fonte diminui até um mínimo legível e a quebra de
 * linha é calculada aqui (não pelo navegador), para que a prévia, a impressão e
 * o PDF quebrem exatamente no mesmo ponto em qualquer aparelho.
 *
 * Medidas em pontos tipográficos da página do formulário (A4 = 595 × 842 pt).
 */

/** [x0, y0, x1, y1] em pontos, origem no canto superior esquerdo da página. */
export type Caixa = [number, number, number, number];

export interface TextoAjustado {
  tamanho: number;
  linhas: string[];
  /** Falso quando nem na fonte mínima o texto coube: a última linha termina em "[…]". */
  cabe: boolean;
}

const ENTRELINHA = 1.14;
const MARCA_DE_CORTE = '[…]';

/** Largura aproximada de um caractere em Arial, em frações do tamanho da fonte (estimativa folgada). */
function larguraDoCaractere(c: string): number {
  if (c === ' ') return 0.28;
  if ('iljI.,;:\'!|'.includes(c)) return 0.27;
  if ('ftr()-/'.includes(c)) return 0.36;
  if ('mw'.includes(c)) return 0.84;
  if ('MW'.includes(c)) return 0.92;
  if (c >= '0' && c <= '9') return 0.56;
  if (c !== c.toLowerCase()) return 0.7;
  return 0.54;
}

export function larguraEstimada(texto: string, tamanho: number): number {
  let soma = 0;
  for (const c of texto) soma += larguraDoCaractere(c);
  return soma * tamanho;
}

/** Quebra o texto em linhas que cabem na largura, respeitando as quebras digitadas. */
export function quebrarEmLinhas(texto: string, largura: number, tamanho: number): string[] {
  const linhas: string[] = [];
  texto.split(/\r?\n/).forEach((paragrafo) => {
    let atual = '';
    paragrafo.split(/\s+/).filter(Boolean).forEach((palavra) => {
      let resto = palavra;
      // Palavra maior que a linha inteira (código sem espaços): parte no limite.
      while (larguraEstimada(resto, tamanho) > largura && resto.length > 1) {
        let corte = resto.length - 1;
        while (corte > 1 && larguraEstimada(resto.slice(0, corte), tamanho) > largura) corte -= 1;
        if (atual) {
          linhas.push(atual);
          atual = '';
        }
        linhas.push(resto.slice(0, corte));
        resto = resto.slice(corte);
      }
      const candidata = atual ? `${atual} ${resto}` : resto;
      if (larguraEstimada(candidata, tamanho) <= largura) {
        atual = candidata;
      } else {
        linhas.push(atual);
        atual = resto;
      }
    });
    if (atual) linhas.push(atual);
  });
  return linhas;
}

/**
 * Maior fonte (entre `max` e `min`) em que o texto cabe na caixa. Se não couber
 * nem na mínima, devolve o que cabe e marca o corte — quem chama deve avisar o
 * médico na tela; o texto nunca é cortado em silêncio.
 */
export function ajustarTexto(
  texto: string,
  largura: number,
  altura: number,
  { max = 9, min = 5.5 }: { max?: number; min?: number } = {}
): TextoAjustado {
  const valor = texto.trim();
  if (!valor) return { tamanho: max, linhas: [], cabe: true };

  for (let tamanho = max; tamanho >= min - 0.01; tamanho -= 0.5) {
    const linhas = quebrarEmLinhas(valor, largura, tamanho);
    if (linhas.length * tamanho * ENTRELINHA <= altura + 0.01) return { tamanho, linhas, cabe: true };
  }

  const linhas = quebrarEmLinhas(valor, largura, min);
  const cabem = Math.max(1, Math.floor((altura + 0.01) / (min * ENTRELINHA)));
  const visiveis = linhas.slice(0, cabem);
  let ultima = visiveis[visiveis.length - 1];
  while (ultima && larguraEstimada(`${ultima} ${MARCA_DE_CORTE}`, min) > largura) {
    ultima = ultima.slice(0, -1).trimEnd();
  }
  visiveis[visiveis.length - 1] = `${ultima} ${MARCA_DE_CORTE}`.trim();
  return { tamanho: min, linhas: visiveis, cabe: false };
}

export const ENTRELINHA_DO_FORMULARIO = ENTRELINHA;

export function soDigitos(valor?: string | null): string {
  return (valor || '').replace(/\D/g, '');
}

/** [dd, mm, aaaa] a partir de "aaaa-mm-dd" ou "dd/mm/aaaa"; `null` se não for uma data nesses formatos. */
export function partesDaData(valor?: string | null): [string, string, string] | null {
  const v = (valor || '').trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (iso) return [iso[3], iso[2], iso[1]];
  const br = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(v);
  if (br) return [br[1].padStart(2, '0'), br[2].padStart(2, '0'), br[3]];
  return null;
}

/** DDD e número de um telefone brasileiro digitado em qualquer formato. */
export function partesDoTelefone(valor?: string | null): { ddd: string; numero: string } {
  let digitos = soDigitos(valor);
  if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2);
  if (digitos.length === 11 && digitos.startsWith('0')) digitos = digitos.slice(1);
  if (digitos.length >= 10) return { ddd: digitos.slice(0, 2), numero: digitos.slice(2) };
  return { ddd: '', numero: digitos };
}
