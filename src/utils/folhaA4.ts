/**
 * Geometria da folha A4 na tela e ponto de entrada (leve) da exportação em PDF.
 * As bibliotecas pesadas de PDF só são carregadas quando o médico exporta.
 */

const A4_W_MM = 210;
const A4_H_MM = 297;
const PX_POR_MM = 96 / 25.4;

export type OrientacaoFolha = 'portrait' | 'landscape';

export interface OpcoesExportacao {
  orientation?: OrientacaoFolha;
  /** Escala da captura (padrão 3 ≈ 288 dpi; cai para 2 se o aparelho não suportar). */
  scale?: number;
}

export function mmToPx(mm: number): number {
  return mm * PX_POR_MM;
}

/** Largura da folha A4 em pixels CSS (96 dpi) para a orientação informada. */
export function larguraFolhaPx(orientation: OrientacaoFolha = 'portrait'): number {
  return Math.round(mmToPx(orientation === 'landscape' ? A4_H_MM : A4_W_MM));
}

/** Altura da folha A4 em pixels CSS (96 dpi) para a orientação informada. */
export function alturaFolhaPx(orientation: OrientacaoFolha = 'portrait'): number {
  return Math.round(mmToPx(orientation === 'landscape' ? A4_W_MM : A4_H_MM));
}

/**
 * Exporta a(s) folha(s) exibida(s) na tela como PDF A4 e dispara o download.
 * É o caminho único de PDF do app (receitas, atestado, encaminhamento, exames,
 * editor A4 e documentos SUS) — ver `renderSheetToPdf.ts`.
 */
export async function exportarFolhaPdf(
  sheets: HTMLElement | HTMLElement[],
  filename: string,
  opts: OpcoesExportacao = {},
): Promise<void> {
  const { renderSheetToPdf } = await import('./renderSheetToPdf');
  await renderSheetToPdf(sheets, filename, opts);
}

export const ID_RAIZ_IMPRESSAO = 'pcm-print-root';
export const CLASSE_IMPRIMINDO = 'pcm-imprimindo';

const ESTILOS_DE_TEXTO = [
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'textAlign', 'textTransform', 'color', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'
] as const;

/**
 * Converte campos `<input>` e `<textarea>` de uma folha clonada em blocos `<div>`
 * com quebra natural de linha (sem truncar textos longos de cabeçalho/endereço)
 * e suprime qualquer campo vazio para que dicas de tela (`placeholder`) nunca
 * saiam impressas no papel ou no PDF.
 */
export function converterCamposEditaveisEmTexto(
  docAlvo: Document,
  folhaClonada: HTMLElement,
  folhaOriginal?: HTMLElement
): void {
  const janela = (folhaOriginal?.ownerDocument ?? docAlvo).defaultView;
  if (!janela) return;

  const camposOriginais = folhaOriginal
    ? Array.from(folhaOriginal.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'))
    : [];

  folhaClonada.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((campo, idx) => {
    const ehTextarea = campo.tagName === 'TEXTAREA';
    if (!ehTextarea && !['text', 'search', 'tel', 'email', 'url', 'number', 'date', ''].includes((campo as HTMLInputElement).type)) {
      return;
    }

    const origem = camposOriginais[idx] ?? campo;
    const valor = (origem.value ?? campo.value ?? '').trim();

    if (!valor) {
      campo.remove();
      return;
    }

    const estilo = janela.getComputedStyle(origem);
    const texto = docAlvo.createElement('div');
    texto.textContent = valor;
    ESTILOS_DE_TEXTO.forEach((prop) => {
      texto.style[prop] = estilo[prop];
    });
    texto.style.display = estilo.display.startsWith('inline') ? 'inline-block' : 'block';
    texto.style.boxSizing = 'border-box';
    texto.style.width = '100%';
    texto.style.maxWidth = '100%';
    texto.style.marginTop = estilo.marginTop;
    texto.style.marginRight = estilo.marginRight;
    texto.style.marginBottom = estilo.marginBottom;
    texto.style.marginLeft = estilo.marginLeft;
    texto.style.whiteSpace = ehTextarea ? 'pre-wrap' : 'normal';
    texto.style.overflowWrap = 'break-word';
    texto.style.wordBreak = 'break-word';
    campo.replaceWith(texto);
  });
}

/** Remove a raiz temporária de impressão e restaura o body após `window.print()`. */
export function limparRaizDeImpressao(): void {
  if (typeof document === 'undefined') return;
  document.getElementById(ID_RAIZ_IMPRESSAO)?.remove();
  document.body.classList.remove(CLASSE_IMPRIMINDO);
}

/**
 * Isola uma cópia fiel da folha A4 em `#pcm-print-root` com `@page { size: A4 ...; margin: 0; }`
 * e fundo 100% branco (`body.pcm-imprimindo`), evitando vazamento de tema escuro,
 * páginas extras em branco ou truncamento de `<input>` na impressão nativa (`Ctrl+P` / `window.print`).
 */
export function prepararRaizDeImpressao(folha: HTMLElement | null, orientacao: OrientacaoFolha): void {
  if (typeof document === 'undefined') return;
  limparRaizDeImpressao();
  if (!folha || folha.classList.contains('no-print')) return;

  const raiz = document.createElement('div');
  raiz.id = ID_RAIZ_IMPRESSAO;

  const regraPagina = document.createElement('style');
  regraPagina.textContent = `@page { size: A4 ${orientacao}; margin: 0; }`;
  raiz.appendChild(regraPagina);

  const copia = folha.cloneNode(true) as HTMLElement;
  copia.removeAttribute('id');
  copia.classList.add('folha-a4');
  if (orientacao === 'landscape') {
    copia.classList.add('folha-a4--paisagem');
  } else {
    copia.classList.remove('folha-a4--paisagem');
  }
  copia.style.setProperty('zoom', '1');
  copia.style.transform = 'none';
  copia.style.margin = '0';
  copia.style.borderRadius = '0';
  copia.style.boxShadow = 'none';
  copia.style.backgroundColor = '#FFFFFF';
  copia.style.color = '#0F172A';

  converterCamposEditaveisEmTexto(document, copia, folha);

  raiz.appendChild(copia);
  document.body.appendChild(raiz);
  document.body.classList.add(CLASSE_IMPRIMINDO);
}

