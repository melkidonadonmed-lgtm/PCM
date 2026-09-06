import { useEffect, useRef, useState } from 'react';
import type { PrescriptionPage } from '../utils/prescriptionPdf';

export function PrescriptionPages({ pages }: { pages: PrescriptionPage[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(794);
  const [fit, setFit] = useState(true);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const scale = fit ? Math.min(1, width / (210 * 96 / 25.4)) : 1;
  return <div>
    <button className="clinical-button secondary mb-3 no-print" onClick={() => setFit(v => !v)}>{fit ? 'Ampliar para ler' : 'Ajustar à largura'}</button>
    <div ref={container} className="overflow-x-auto pb-4" aria-label="Páginas da receita selecionada">
      {pages.map((page, index) => <div key={`${page.documentId}-${index}`} className="rx-page-frame" style={{ width: `${210 * scale}mm`, height: `${297 * scale}mm`, margin: '0 auto 24px' }}>
        <article className="rx-page" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} aria-label={`Página ${page.page}, via ${page.copy}`}>
          {page.boxes.map((box, i) => <div key={`box-${i}`} style={{ position: 'absolute', left: `${box.x}mm`, top: `${box.y}mm`, width: `${box.width}mm`, height: `${box.height}mm`, border: '0.25mm solid #505050' }} />)}
          {page.texts.map((text, i) => <span key={i} style={{ position: 'absolute', left: `${text.x}mm`, top: `${text.y}mm`, transform: 'translateY(-80%)', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${text.size}pt`, lineHeight: 1, fontWeight: text.bold ? 700 : 400, whiteSpace: 'pre', color: '#141414' }}>{text.text}</span>)}
        </article>
      </div>)}
    </div>
  </div>;
}
