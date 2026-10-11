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
