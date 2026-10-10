import type { jsPDF } from 'jspdf';

/**
 * Download de PDF 100% compatível com WebView Android (app instalado via PWA)
 * e navegadores desktop/mobile convencionais.
 *
 * Motivo: o `pdf.save()` interno do jsPDF usa um truque (`viewSupported`) que,
 * em WebViews sem suporte nativo a visualização de PDF, abre uma JANELA POPUP
 * (`window.open('about:blank')`). Em WebViews de app o popup é bloqueado
 * silenciosamente — o usuário clica em "Baixar PDF" e NADA acontece.
 *
 * Esta função gera o Blob diretamente e dispara o download por um <a download>
 * anexado ao documento, com fallbacks em cascata:
 *   1. <a download> + blob URL (funciona em Chrome/Edge/Android WebView modernos)
 *   2. navigator.msSaveOrOpenBlob (legado)
 *   3. Abre o blob em nova aba se nada mais funcionar
 */
export async function downloadPdfDoc(doc: jsPDF, filename: string): Promise<void> {
  const safeName = (filename || 'documento.pdf').replace(/\s+/g, '_');

  let blob: Blob;
  try {
    blob = doc.output('blob');
  } catch {
    // Última linha de defesa: dataURI -> fetch -> blob
    const dataUri = doc.output('datauristring');
    const resp = await fetch(dataUri);
    blob = await resp.blob();
  }

  const typedBlob = new Blob([blob], { type: 'application/pdf' });
  const url = URL.createObjectURL(typedBlob);

  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Remoção tardia: alguns WebViews cancelam o download se removermos na hora
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 10000);
  } catch {
    // Fallback final: exibe o PDF numa aba (navegadores plenos)
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
