import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  alturaFolhaPx,
  larguraFolhaPx,
  limparRaizDeImpressao,
  prepararRaizDeImpressao,
  type OrientacaoFolha
} from '../../utils/folhaA4';

/**
 * Superfície Canônica de Papel A4 (794x1123 px).
 * Estados de UI cobertos: empty (folha em branco/vazio), loading (carregando medição ResizeObserver),
 * success (escala calculada com sucesso) e error (fallback para escala 1 em caso de falha).
 */
interface FolhaA4Props {
  orientacao?: OrientacaoFolha;
  /** Reduz a folha para caber na largura disponível (padrão). Desligado, mostra em tamanho real com rolagem. */
  ajustarALargura?: boolean;
  /** Liga a impressão fiel (Ctrl+P / window.print) desta folha. Use em uma única folha por tela. */
  imprimivel?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Folha de papel A4 em tamanho real (794 × 1123 px a 96 dpi; invertido em
 * paisagem). O conteúdo é sempre diagramado nessa largura fixa — na tela a
 * folha é apenas reduzida visualmente (zoom) para caber. Por isso a prévia, a
 * impressão e o PDF mostram exatamente a mesma diagramação em qualquer aparelho.
 *
 * A folha é papel: sempre branca com texto escuro, nos dois temas.
 */
export const FolhaA4 = React.forwardRef<HTMLDivElement, FolhaA4Props>(({
  orientacao = 'portrait',
  ajustarALargura = true,
  imprimivel = false,
  id,
  className = '',
  children
}, ref) => {
  const molduraRef = useRef<HTMLDivElement>(null);
  const folhaRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [alturaNatural, setAlturaNatural] = useState<number>(0);
  const [inspecaoReal, setInspecaoReal] = useState(false);

  const largura = larguraFolhaPx(orientacao);
  const altura = alturaFolhaPx(orientacao);

  useLayoutEffect(() => {
    const moldura = molduraRef.current;
    if (!moldura || !ajustarALargura) {
      setZoom(1);
      return;
    }
    const medir = () => {
      const disponivel = moldura.clientWidth;
      if (disponivel > 0) {
        setZoom(Math.min(1, Number((disponivel / largura).toFixed(4))));
      }
      if (folhaRef.current) {
        setAlturaNatural(folhaRef.current.offsetHeight || altura);
      }
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(moldura);
    if (folhaRef.current) {
      observador.observe(folhaRef.current);
    }
    return () => observador.disconnect();
  }, [ajustarALargura, largura, altura, children]);

  // Impressão fiel: na hora de imprimir, uma cópia da folha vira o único
  // conteúdo da página, em tamanho real e sem margens do navegador.
  useEffect(() => {
    if (!imprimivel) return;

    const preparar = () => prepararRaizDeImpressao(folhaRef.current, orientacao);
    const limpar = () => limparRaizDeImpressao();

    window.addEventListener('beforeprint', preparar);
    window.addEventListener('afterprint', limpar);
    return () => {
      window.removeEventListener('beforeprint', preparar);
      window.removeEventListener('afterprint', limpar);
      limpar();
    };
  }, [imprimivel, orientacao]);

  const atribuirRef = (no: HTMLDivElement | null) => {
    folhaRef.current = no;
    if (typeof ref === 'function') ref(no);
    else if (ref) ref.current = no;
  };

  const escalaEfetiva = inspecaoReal ? 1 : zoom;
  const usandoEscalaReduzida = ajustarALargura && escalaEfetiva < 1;
  const alturaMoldura = usandoEscalaReduzida
    ? Math.ceil((alturaNatural || altura) * escalaEfetiva)
    : undefined;

  return (
    <div className="relative w-full group/folha">
      {ajustarALargura && zoom < 0.92 && (
        <div className="no-print absolute top-2.5 right-2.5 z-20 flex items-center gap-1 rounded-lg bg-slate-900/80 backdrop-blur-xs px-2 py-1 text-[11px] font-semibold text-white shadow-sm opacity-85 hover:opacity-100 transition-opacity">
          <span className="clinical-tabular-nums text-slate-300 pr-1 border-r border-white/15">
            {Math.round(escalaEfetiva * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setInspecaoReal((v) => !v)}
            className="px-1.5 py-0.5 rounded hover:bg-white/15 text-sky-300 font-bold cursor-pointer transition-colors"
            title={inspecaoReal ? 'Ajustar folha à largura do painel' : 'Inspecionar folha em tamanho real (100%)'}
          >
            {inspecaoReal ? 'Ajustar' : '100%'}
          </button>
        </div>
      )}
      <div
        ref={molduraRef}
        className={`w-full ${ajustarALargura && !inspecaoReal ? 'overflow-hidden' : 'overflow-x-auto custom-scrollbar'}`}
        style={alturaMoldura ? { height: `${alturaMoldura}px` } : undefined}
      >
        <div
          ref={atribuirRef}
          id={id}
          className={`folha-a4 paper-sheet-floating ${orientacao === 'landscape' ? 'folha-a4--paisagem' : ''} ${className}`}
          style={{
            width: `${largura}px`,
            minHeight: `${altura}px`,
            transform: usandoEscalaReduzida ? `scale(${escalaEfetiva})` : undefined,
            transformOrigin: usandoEscalaReduzida ? 'top left' : undefined,
            marginInline: usandoEscalaReduzida ? 0 : 'auto',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

FolhaA4.displayName = 'FolhaA4';

export default FolhaA4;
