import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export interface ModalA11yOptions {
  /** Contêiner do diálogo — o elemento que carrega role="dialog". */
  dialogRef: RefObject<HTMLElement | null>;
  /** Monta e desmonta o trap junto com o diálogo. */
  isOpen: boolean;
  /** Fechamento solicitado por Escape. */
  onClose: () => void;
  /** Elemento que recebe o foco inicial. Padrão: primeiro focável do diálogo. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Acessibilidade de diálogo modal, em um único lugar:
 *
 * - contenção circular de Tab / Shift+Tab dentro do diálogo (WCAG 2.4.3);
 * - `inert` + `aria-hidden` no restante da aplicação, para que leitores de tela
 *   e o cursor virtual não alcancem conteúdo obscurecido pelo overlay;
 * - bloqueio da rolagem de fundo sem provocar salto de layout;
 * - fechamento por Escape;
 * - restauração do foco ao elemento disparador na desmontagem.
 *
 * Antes deste hook os cinco overlays da aplicação definiam apenas foco inicial e
 * Escape: com um diálogo aberto, 99 elementos permaneciam focáveis atrás dele.
 */
export function useModalA11y({ dialogRef, isOpen, onClose, initialFocusRef }: ModalA11yOptions): void {
  const triggerRef = useRef<HTMLElement | null>(null);
  // Mantém o onClose corrente sem remontar o efeito a cada render do pai.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const doc = dialog.ownerDocument;
    const body = doc.body;

    // 1. Memoriza o disparador para devolver o foco no fechamento.
    triggerRef.current = doc.activeElement as HTMLElement | null;

    // 2. Inertiza a árvore inteira exceto a linhagem do diálogo.
    //    Os overlays desta aplicação são montados dentro de #root, não como
    //    filhos diretos de <body>: inertizar apenas os filhos do body não
    //    isolaria nada. Subimos do diálogo até o body inertizando, em cada
    //    nível, todos os irmãos que não contêm o diálogo.
    //    O aria-hidden anterior é memorizado: um elemento pode já tê-lo por
    //    conta própria, e removê-lo na limpeza o apagaria em definitivo.
    const inerted: Array<{ el: HTMLElement; previousAriaHidden: string | null }> = [];
    for (let node = dialog; node && node !== body; node = node.parentElement as HTMLElement) {
      const parent = node.parentElement;
      if (!parent) break;
      for (const sibling of Array.from(parent.children)) {
        if (!(sibling instanceof HTMLElement)) continue;
        if (sibling === node) continue;
        if (sibling.hasAttribute('inert')) continue;
        inerted.push({ el: sibling, previousAriaHidden: sibling.getAttribute('aria-hidden') });
        sibling.setAttribute('inert', '');
        sibling.setAttribute('aria-hidden', 'true');
      }
    }

    // 3. Trava a rolagem de fundo compensando a largura da barra de rolagem.
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - doc.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const focusables = (): HTMLElement[] => {
      const nodes = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
      return nodes.filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === doc.activeElement
      );
    };

    // 4. Foco inicial.
    (initialFocusRef?.current ?? focusables()[0] ?? dialog).focus({ preventScroll: true });

    // 5. Escape e contenção circular de Tab.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = doc.activeElement;

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    // 6. Rede de segurança: foco que escapar por outro caminho volta ao diálogo.
    const handleFocusIn = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) {
        event.stopPropagation();
        (focusables()[0] ?? dialog).focus({ preventScroll: true });
      }
    };

    doc.addEventListener('keydown', handleKeyDown, true);
    doc.addEventListener('focusin', handleFocusIn, true);

    return () => {
      doc.removeEventListener('keydown', handleKeyDown, true);
      doc.removeEventListener('focusin', handleFocusIn, true);

      for (const { el, previousAriaHidden } of inerted) {
        el.removeAttribute('inert');
        if (previousAriaHidden === null) {
          el.removeAttribute('aria-hidden');
        } else {
          el.setAttribute('aria-hidden', previousAriaHidden);
        }
      }

      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;

      triggerRef.current?.focus({ preventScroll: true });
      triggerRef.current = null;
    };
  }, [isOpen, dialogRef, initialFocusRef]);
}
