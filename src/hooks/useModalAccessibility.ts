import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Pilha global de modais abertos para garantir que apenas o modal do topo
 * responda ao Escape e capture o ciclo de Tab (suporte a modais aninhados).
 */
const activeModalStack: symbol[] = [];

export function getActiveModalStackSize(): number {
  return activeModalStack.length;
}

export interface ModalStackRegistrationCallbacks {
  getOnClose: () => (() => void) | undefined;
  getContainer: () => HTMLElement | null | undefined;
  getInitialFocus: () => HTMLElement | null | undefined;
  doc?: Pick<Document, 'activeElement'>;
  win?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
}

/**
 * Registra um modal na pilha LIFO ativa e retorna a função de limpeza (cleanup).
 */
export function registerModalInStack({
  getOnClose,
  getContainer,
  getInitialFocus,
  doc = typeof document !== 'undefined' ? document : undefined,
  win = typeof window !== 'undefined' ? window : undefined,
}: ModalStackRegistrationCallbacks): () => void {
  if (!doc || !win) return () => {};

  const modalId = Symbol('prescmed-modal');
  activeModalStack.push(modalId);
  const previousFocusEl = doc.activeElement as HTMLElement | null;

  const focusTimer = setTimeout(() => {
    if (activeModalStack[activeModalStack.length - 1] !== modalId) return;
    const targetInitial = getInitialFocus();
    const targetContainer = getContainer();
    if (targetInitial) {
      targetInitial.focus();
    } else if (targetContainer) {
      if (!targetContainer.contains(doc.activeElement)) {
        const firstFocusable = targetContainer.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }
    }
  }, 20);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (activeModalStack[activeModalStack.length - 1] !== modalId) return;

    if (e.key === 'Escape') {
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      getOnClose()?.();
      return;
    }

    const currentContainer = getContainer();
    if (e.key === 'Tab' && currentContainer) {
      const allNodes = Array.from(
        currentContainer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true');

      const visibleNodes = allNodes.filter(
        (el) => el.offsetParent !== null || el === doc.activeElement || el.getClientRects().length > 0
      );
      const focusableNodes = visibleNodes.length > 0 ? visibleNodes : allNodes;

      if (focusableNodes.length === 0) return;

      const firstEl = focusableNodes[0];
      const lastEl = focusableNodes[focusableNodes.length - 1];

      if (e.shiftKey) {
        if (doc.activeElement === firstEl || !currentContainer.contains(doc.activeElement)) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (doc.activeElement === lastEl || !currentContainer.contains(doc.activeElement)) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  };

  win.addEventListener('keydown', handleKeyDown);
  return () => {
    clearTimeout(focusTimer);
    win.removeEventListener('keydown', handleKeyDown);
    const idx = activeModalStack.lastIndexOf(modalId);
    if (idx !== -1) {
      activeModalStack.splice(idx, 1);
    }
    if (previousFocusEl && typeof previousFocusEl.focus === 'function') {
      try {
        previousFocusEl.focus();
      } catch {
        // Elemento original pode ter sido desmontado
      }
    }
  };
}

export interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose?: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Hook de acessibilidade para Modais e Drawers (modern-web-guidance & WCAG 2.1 AA).
 * Gerencia pilha de modais aninhados, tecla Escape, Focus Trap cíclico (Tab / Shift+Tab)
 * e restauração determinística do foco ao fechar, sem roubar foco em re-renderizações.
 */
export function useModalAccessibility(
  isOpenOrOptions: boolean | UseModalAccessibilityOptions,
  onCloseArg?: () => void,
  containerRefArg?: React.RefObject<HTMLElement | null>,
  initialFocusRefArg?: React.RefObject<HTMLElement | null>
) {
  const isOpen = typeof isOpenOrOptions === 'boolean' ? isOpenOrOptions : isOpenOrOptions.isOpen;
  const onClose = typeof isOpenOrOptions === 'boolean' ? onCloseArg : isOpenOrOptions.onClose;
  const containerRef = typeof isOpenOrOptions === 'boolean' ? containerRefArg : isOpenOrOptions.containerRef;
  const initialFocusRef = typeof isOpenOrOptions === 'boolean' ? initialFocusRefArg : isOpenOrOptions.initialFocusRef;

  const onCloseRef = useRef(onClose);
  const containerRefHolder = useRef(containerRef);
  const initialFocusRefHolder = useRef(initialFocusRef);

  onCloseRef.current = onClose;
  containerRefHolder.current = containerRef;
  initialFocusRefHolder.current = initialFocusRef;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    return registerModalInStack({
      getOnClose: () => onCloseRef.current,
      getContainer: () => containerRefHolder.current?.current,
      getInitialFocus: () => initialFocusRefHolder.current?.current,
    });
  }, [isOpen]);
}


