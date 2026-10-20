import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface UseModalAccessibilityOptions {
  isOpen: boolean;
  onClose?: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Hook de acessibilidade para Modais e Drawers (modern-web-guidance & WCAG 2.1 AA).
 * Gerencia tecla Escape, Focus Trap cíclico (Tab / Shift+Tab) e restauração do foco ao fechar.
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

  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef?.current) {
        const firstFocusable = containerRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab' && containerRef?.current) {
        const focusableNodes = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);

        if (focusableNodes.length === 0) return;

        const firstEl = focusableNodes[0];
        const lastEl = focusableNodes[focusableNodes.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || !containerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl || !containerRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        try {
          previousFocusRef.current.focus();
        } catch {
          // Elemento original pode ter sido desmontado
        }
      }
    };
  }, [isOpen, onClose, containerRef, initialFocusRef]);
}
