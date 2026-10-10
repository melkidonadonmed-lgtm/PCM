import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Renderiza um elemento "folha A4" do DOM em um PDF vetorialmente fiel,
 * SEM cortar o conteúdo e SEM deixar papel de fundo aparecendo atrás.
 *
 * Corre dois bugs clássicos do pipeline antigo (html2canvas -> addImage):
 *  1. `Math.min(pdfHeight, 297)` esmagava/encurtava a imagem quando o canvas
 *     era mais alto que a página -> conteúdo cortado ("só até 3/4 da folha").
 *  2. Fundo creme/rosa do app vazando pelo html2canvas ao fotografar elementos
 *     estreitos (largura < scrollWidth) ou com rootBackgroundColor transparente
 *     -> faixa de cor estranha "por trás" da folha no PDF.
 *
 * Estratégia:
 *  - Força largura real de renderização = offsetWidth (sem scroll lateral).
 *  - Mede o conteúdo real (maior entre bounding rect e scroll) para definir a
 *    altura da página do PDF.
 *  - Se a altura real <= 297mm: uma única página A4 exata, sem faixas vazias.
 *  - Se estourar A4: fatia o canvas em páginas A4 em sequência (page break),
 *    aproveitando que a folha é branca nas margens para cortes suaves.
 */

const A4_W_MM = 210;
const A4_H_MM = 297;

export interface RenderSheetOptions {
  orientation?: 'portrait' | 'landscape';
  /** escala do html2canvas (default 2) */
  scale?: number;
}

async function captureCanvas(el: HTMLElement, opts: RenderSheetOptions): Promise<HTMLCanvasElement> {
  const widthPx = el.offsetWidth || Math.round((A4_W_MM * 96) / 25.4); // fallback ~794px

  // Garante fundo branco opaco na cópia clonada (evita raiz transparente -> vazamento de cor)
  const html2canvasOpts: Parameters<typeof html2canvas>[1] = {
    scale: opts.scale ?? 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    windowWidth: widthPx,
    onclone: (clonedDoc) => {
      const root = clonedDoc.documentElement;
      const body = clonedDoc.body;
      if (root) {
        root.style.backgroundColor = '#FFFFFF';
        root.style.background = '#FFFFFF';
      }
      if (body) {
        body.style.backgroundColor = '#FFFFFF';
        body.style.background = '#FFFFFF';
      }
      // Neutraliza transform: scale() do preview responsivo (fitToMobile),
      // que distorceria a proporção da folha no PDF
      const sheet = clonedDoc.getElementById('printable-a4-sheet');
      if (sheet) {
        const anyStyle = (sheet as HTMLElement).style;
        anyStyle.transform = 'none';
        anyStyle.zoom = '1';
      }
    },
  };

  return html2canvas(el, html2canvasOpts);
}

function mmToPx(mm: number): number {
  return (mm * 96) / 25.4;
}

export async function renderSheetToPdf(
  el: HTMLElement,
  filename: string,
  opts: RenderSheetOptions = {},
): Promise<void> {
  const orientation = opts.orientation ?? 'portrait';
  const pageWmm = orientation === 'landscape' ? A4_H_MM : A4_W_MM;
  const pageHmm = orientation === 'landscape' ? A4_W_MM : A4_H_MM;

  const canvas = await captureCanvas(el, opts);

  // Proporção direta do canvas para mm de largura (sem Math.min que cortava conteúdo)
  const naturalHeightMm = (canvas.height * pageWmm) / canvas.width;

  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4', compress: true });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  if (naturalHeightMm <= pageHmm + 0.5) {
    // Cabe numa página: desenha a folha inteira (usa a altura natural, sem Math.min que corta)
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWmm, naturalHeightMm);
  } else {
    // Estourou A4: fatia o canvas em páginas consecutivas
    const pxPerFullPage = Math.floor((pageHmm * canvas.width) / pageWmm);
    let y = 0;
    let first = true;
    while (y < canvas.height) {
      const sliceH = Math.min(pxPerFullPage, canvas.height - y);
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceH;
      const ctx = slice.getContext('2d')!;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

      const sliceImg = slice.toDataURL('image/jpeg', 0.95);
      const sliceHeightMm = (sliceH * pageWmm) / canvas.width;
      if (!first) pdf.addPage();
      pdf.addImage(sliceImg, 'JPEG', 0, 0, pageWmm, sliceHeightMm);
      first = false;
      y += sliceH;
    }
  }

  const { downloadPdfDoc } = await import('./downloadPdf');
  await downloadPdfDoc(pdf, filename);
}

// util exportado p/ testes/cálculos futuros
export { mmToPx };
