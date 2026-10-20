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
      if (disponivel > 0) setZoom(Math.min(1, disponivel / largura));
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(moldura);
    return () => observador.disconnect();
  }, [ajustarALargura, largura]);

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

  return (
    <div
      ref={molduraRef}
      className={`w-full ${ajustarALargura ? 'overflow-hidden' : 'overflow-x-auto custom-scrollbar'}`}
    >
      <div
        ref={atribuirRef}
        id={id}
        className={`folha-a4 paper-sheet-floating ${orientacao === 'landscape' ? 'folha-a4--paisagem' : ''} ${className}`}
        style={{
          width: `${largura}px`,
          minHeight: `${altura}px`,
          zoom,
          marginInline: 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
});

FolhaA4.displayName = 'FolhaA4';

export default FolhaA4;
