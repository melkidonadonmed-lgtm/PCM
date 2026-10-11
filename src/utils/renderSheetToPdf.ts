import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { downloadPdfDoc } from './downloadPdf';
import { alturaFolhaPx, larguraFolhaPx, type OpcoesExportacao, type OrientacaoFolha } from './folhaA4';

/**
 * Motor do caminho ÚNICO de exportação de PDF do PresCMed (os componentes o
 * chamam por `exportarFolhaPdf`, em `folhaA4.ts`, que carrega este módulo sob
 * demanda): o PDF é uma fotografia fiel
 * da folha exibida na tela (receita, atestado, encaminhamento, exames, editor
 * A4 e documentos SUS). Não existe um segundo desenho do documento em outro
 * lugar — o que o médico vê na prévia é exatamente o que sai no arquivo.
 *
 * Garantias:
 *  - Mesmo resultado em celular e desktop: a folha é clonada, isolada do resto
 *    da página e renderizada sempre na largura real do A4 (794 px retrato,
 *    1123 px paisagem a 96 dpi), em uma janela virtual de desktop.
 *  - Papel sempre branco, sem zoom/escala da prévia e sem tema escuro.
 *  - Conteúdo maior que uma página é dividido em páginas A4, cortando em
 *    linhas em branco (nunca no meio de uma linha de texto).
 */

const A4_W_MM = 210;
const A4_H_MM = 297;

/** Largura da janela virtual: fixa para que os breakpoints não dependam do aparelho. */
const LARGURA_JANELA_VIRTUAL_PX = 1440;
/** Margem aplicada apenas quando o documento passa de uma página. */
const MARGEM_QUEBRA_MM = 10;

async function aguardarRecursos(el: HTMLElement): Promise<void> {
  const fontes = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (fontes?.ready) {
    await fontes.ready;
  }
  const imagens = Array.from(el.querySelectorAll('img'));
  await Promise.all(
    imagens.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          })
    )
  );
}

const ESTILOS_DE_TEXTO = [
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'textAlign', 'textTransform', 'color', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'
] as const;

/**
 * Campos editáveis dentro da folha (cabeçalho do Editor A4) viram texto comum
 * na cópia capturada: a biblioteca de captura desenha <input> cortando o
 * conteúdo e ignorando caixa alta/alinhamento. Campo vazio não imprime nada
 * (o placeholder é só uma dica de tela).
 */
function trocarCamposPorTexto(clonedDoc: Document, folha: HTMLElement): void {
  const janela = clonedDoc.defaultView;
  if (!janela) return;
  folha.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((campo) => {
    const ehTextarea = campo.tagName === 'TEXTAREA';
    if (!ehTextarea && !['text', 'search', 'tel', 'email', 'url', 'number', 'date', ''].includes((campo as HTMLInputElement).type)) {
      return;
    }
    const estilo = janela.getComputedStyle(campo);
    const texto = clonedDoc.createElement('div');
    texto.textContent = campo.value;
    ESTILOS_DE_TEXTO.forEach((prop) => {
      texto.style[prop] = estilo[prop];
    });
    texto.style.display = estilo.display.startsWith('inline') ? 'inline-block' : 'block';
    texto.style.boxSizing = 'border-box';
    texto.style.minWidth = estilo.width;
    texto.style.minHeight = estilo.height;
    if (!ehTextarea) {
      // Campo de uma linha centraliza o texto na vertical: reproduz com a altura de linha.
      const interna = parseFloat(estilo.height) - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom)
        - parseFloat(estilo.borderTopWidth) - parseFloat(estilo.borderBottomWidth);
      if (interna > 0) texto.style.lineHeight = `${interna}px`;
    }
    texto.style.marginTop = estilo.marginTop;
    texto.style.marginRight = estilo.marginRight;
    texto.style.marginBottom = estilo.marginBottom;
    texto.style.marginLeft = estilo.marginLeft;
    texto.style.whiteSpace = ehTextarea ? 'pre-wrap' : 'nowrap';
    campo.replaceWith(texto);
  });
}

async function capturarFolha(el: HTMLElement, orientation: OrientacaoFolha, scale: number): Promise<HTMLCanvasElement> {
  const largura = larguraFolhaPx(orientation);
  const alturaMinima = alturaFolhaPx(orientation);

  return html2canvas(el, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    windowWidth: LARGURA_JANELA_VIRTUAL_PX,
    windowHeight: alturaMinima,
    scrollX: 0,
    scrollY: 0,
    // Controles de edição marcados como .no-print ficam fora do PDF, como na impressão.
    ignoreElements: (el) => el.classList.contains('no-print'),
    onclone: (clonedDoc, folha) => {
      trocarCamposPorTexto(clonedDoc, folha);

      // Papel é sempre claro: o tema escuro do app nunca entra no documento.
      clonedDoc.documentElement.classList.remove('dark');
      clonedDoc.documentElement.style.background = '#FFFFFF';

      // Isola a folha: vira o único conteúdo do body clonado, para que nenhum
      // contêiner da tela (rolagem, largura do celular, zoom da prévia) a corte.
      const body = clonedDoc.body;
      body.appendChild(folha);
      Array.from(body.children).forEach((filho) => {
        if (filho !== folha) (filho as HTMLElement).style.display = 'none';
      });
      body.style.cssText = 'margin:0;padding:0;background:#FFFFFF;overflow:visible;';

      const estilo = folha.style;
      estilo.setProperty('zoom', '1');
      estilo.transform = 'none';
      // "relative" (e não "static"): a folha continua sendo a referência das
      // camadas absolutas internas, como a marca d'água.
      estilo.position = 'relative';
      estilo.inset = 'auto';
      estilo.margin = '0';
      estilo.width = `${largura}px`;
      estilo.minWidth = `${largura}px`;
      estilo.maxWidth = 'none';
      estilo.minHeight = `${alturaMinima}px`;
      estilo.boxSizing = 'border-box';
      estilo.boxShadow = 'none';
      estilo.borderRadius = '0';
      estilo.backgroundColor = '#FFFFFF';
    }
  });
}

/** Indica se a linha `y` do canvas é inteiramente (quase) branca. */
function linhaEmBranco(ctx: CanvasRenderingContext2D, y: number, width: number): boolean {
  const { data } = ctx.getImageData(0, y, width, 1);
  for (let i = 0; i < data.length; i += 16) {
    if (data[i] < 244 || data[i + 1] < 244 || data[i + 2] < 244) return false;
  }
  return true;
}

/**
 * Procura, a partir do corte ideal para cima, uma linha em branco para quebrar
 * a página sem partir uma linha de texto. Se não achar na faixa, usa o corte ideal.
 */
function ajustarCorte(ctx: CanvasRenderingContext2D, corteIdeal: number, inicio: number, width: number): number {
  const limite = Math.max(inicio + 1, Math.floor(corteIdeal - (corteIdeal - inicio) * 0.2));
  for (let y = corteIdeal; y > limite; y -= 1) {
    if (linhaEmBranco(ctx, y, width)) return y;
  }
  return corteIdeal;
}

function adicionarCanvasAoPdf(pdf: jsPDF, canvas: HTMLCanvasElement, orientation: OrientacaoFolha, primeiraPagina: boolean): void {
  const pageWmm = orientation === 'landscape' ? A4_H_MM : A4_W_MM;
  const pageHmm = orientation === 'landscape' ? A4_W_MM : A4_H_MM;
  const pxPorMm = canvas.width / pageWmm;
  const alturaNaturalMm = canvas.height / pxPorMm;

  if (!primeiraPagina) pdf.addPage('a4', orientation);

  if (alturaNaturalMm <= pageHmm + 0.5) {
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, pageWmm, alturaNaturalMm, undefined, 'FAST');
    return;
  }

  // Estourou uma página: fatia em páginas A4 consecutivas, cortando em linhas em branco.
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  let y = 0;
  let indice = 0;
  while (y < canvas.height) {
    const topoMm = indice === 0 ? 0 : MARGEM_QUEBRA_MM;
    const areaUtilPx = Math.floor((pageHmm - topoMm - MARGEM_QUEBRA_MM) * pxPorMm);
    let fim = Math.min(y + areaUtilPx, canvas.height);
    if (fim < canvas.height) fim = ajustarCorte(ctx, fim, y, canvas.width);

    const fatia = document.createElement('canvas');
    fatia.width = canvas.width;
    fatia.height = fim - y;
    const fatiaCtx = fatia.getContext('2d')!;
    fatiaCtx.fillStyle = '#FFFFFF';
    fatiaCtx.fillRect(0, 0, fatia.width, fatia.height);
    fatiaCtx.drawImage(canvas, 0, y, canvas.width, fatia.height, 0, 0, canvas.width, fatia.height);

    if (indice > 0) pdf.addPage('a4', orientation);
    pdf.addImage(fatia.toDataURL('image/jpeg', 0.94), 'JPEG', 0, topoMm, pageWmm, fatia.height / pxPorMm, undefined, 'FAST');

    y = fim;
    indice += 1;
  }
}

/**
 * Monta um PDF A4 a partir de uma ou mais folhas do DOM (cada folha começa em
 * uma página nova). Não dispara download — use `renderSheetToPdf` para isso.
 */
export async function sheetsToPdf(
  sheets: HTMLElement | HTMLElement[],
  opts: OpcoesExportacao = {},
): Promise<jsPDF> {
  const folhas = Array.isArray(sheets) ? sheets : [sheets];
  if (folhas.length === 0) {
    throw new Error('Nenhuma folha para exportar.');
  }
  const orientation = opts.orientation ?? 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });

  for (let i = 0; i < folhas.length; i += 1) {
    await aguardarRecursos(folhas[i]);
    let canvas = await capturarFolha(folhas[i], orientation, opts.scale ?? 3);
    if (!canvas.width || !canvas.height || canvas.toDataURL('image/jpeg', 0.1).length < 64) {
      // Aparelhos com pouca memória recusam canvas grandes: refaz em escala menor.
      canvas = await capturarFolha(folhas[i], orientation, 2);
    }
    adicionarCanvasAoPdf(pdf, canvas, orientation, i === 0);
  }

  return pdf;
}

/** Exporta a(s) folha(s) exibida(s) na tela como PDF A4 e dispara o download. */
export async function renderSheetToPdf(
  sheets: HTMLElement | HTMLElement[],
  filename: string,
  opts: OpcoesExportacao = {},
): Promise<void> {
  const pdf = await sheetsToPdf(sheets, opts);
  await downloadPdfDoc(pdf, filename);
}
