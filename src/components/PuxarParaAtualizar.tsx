import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface PuxarParaAtualizarProps {
  desativado: boolean;
}

type GestoStatus = 'ocioso' | 'puxando' | 'limiar_atingido' | 'atualizando';

const LIMIAR_PX = 70;
const RESISTENCIA = 0.5;
const MAX_PULL_PX = 100;

/**
 * Verifica se um elemento possui rolagem vertical própria ativa.
 */
function isScrollableElement(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
}

/**
 * Ignora o gesto se iniciado em campos de formulário, modais/diálogos
 * ou contêineres roláveis que não estejam no topo (scrollTop > 0).
 */
function shouldIgnoreTouch(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  if (
    target.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""], [role="dialog"]'
    )
  ) {
    return true;
  }

  let current: HTMLElement | null = target;
  while (current && current !== document.body && current !== document.documentElement) {
    if (isScrollableElement(current) && current.scrollTop > 0) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}

/**
 * Componente autocontido de Puxar para Atualizar (Pull to Refresh).
 * Voltado especialmente para o PWA instalado em dispositivos móveis touch.
 */
export function PuxarParaAtualizar({ desativado }: PuxarParaAtualizarProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<GestoStatus>('ocioso');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const trackingRef = useRef(false);
  const gestureActiveRef = useRef(false);
  const isUpdatingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  // Mantém a ref sincronizada para uso seguro dentro de event listeners nativos
  useEffect(() => {
    pullDistanceRef.current = pullDistance;
  }, [pullDistance]);

  // Contenção do overscroll para evitar conflito com gestos nativos do browser
  useEffect(() => {
    const originalOverscroll = document.documentElement.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = 'contain';
    return () => {
      document.documentElement.style.overscrollBehaviorY = originalOverscroll;
    };
  }, []);

  // Observa preferência por redução de movimento
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mql.addEventListener('change', handleChange);
    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, []);

  // Registro e ciclo de vida dos listeners de toque
  useEffect(() => {
    if (desativado) {
      trackingRef.current = false;
      gestureActiveRef.current = false;
      if (!isUpdatingRef.current) {
        setPullDistance(0);
        setStatus('ocioso');
      }
      return;
    }

    if (typeof window === 'undefined' || !window.matchMedia) return;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (!isCoarse) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isUpdatingRef.current) return;
      if (e.touches.length !== 1) return;
      if (window.scrollY > 0) return;
      if (shouldIgnoreTouch(e.target)) return;

      trackingRef.current = true;
      gestureActiveRef.current = false;
      startYRef.current = e.touches[0].clientY;
      startXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!trackingRef.current || isUpdatingRef.current) return;
      if (e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = currentX - startXRef.current;

      // Se a página rolou para baixo, cancela o gesto
      if (window.scrollY > 0) {
        trackingRef.current = false;
        gestureActiveRef.current = false;
        setPullDistance(0);
        setStatus('ocioso');
        return;
      }

      // Se ainda não ativou o gesto
      if (!gestureActiveRef.current) {
        if (diffY <= 0) {
          // Rolagem ascendente normal
          return;
        }
        if (Math.abs(diffX) > diffY) {
          // Deslocamento horizontal predominante (swipe)
          trackingRef.current = false;
          return;
        }
        if (diffY > 6 && window.scrollY === 0) {
          gestureActiveRef.current = true;
        }
      }

      // Gesto de pull-to-refresh ativo
      if (gestureActiveRef.current) {
        if (e.cancelable) {
          e.preventDefault();
        }
        const visualDistance = Math.min(diffY * RESISTENCIA, MAX_PULL_PX);
        setPullDistance(visualDistance);

        if (visualDistance >= LIMIAR_PX) {
          setStatus('limiar_atingido');
        } else {
          setStatus('puxando');
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!trackingRef.current && !gestureActiveRef.current) return;
      const wasActive = gestureActiveRef.current;
      trackingRef.current = false;
      gestureActiveRef.current = false;

      if (wasActive && pullDistanceRef.current >= LIMIAR_PX && !isUpdatingRef.current) {
        // Dispara atualização
        isUpdatingRef.current = true;
        setStatus('atualizando');
        setPullDistance(52); // Mantém o indicador visível confortavelmente

        try {
          if ('serviceWorker' in navigator) {
            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
            const regPromise = navigator.serviceWorker.getRegistration();
            const registration = await Promise.race([regPromise, timeoutPromise]);

            if (registration && typeof (registration as ServiceWorkerRegistration).update === 'function') {
              await Promise.race([
                (registration as ServiceWorkerRegistration).update(),
                timeoutPromise
              ]);
            }
          }
        } catch (err) {
          console.error('Falha ao atualizar service worker:', err);
        } finally {
          window.location.reload();
        }
      } else if (!isUpdatingRef.current) {
        // Retorna e oculta o indicador
        setPullDistance(0);
        setStatus('ocioso');
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [desativado]);

  if (status === 'ocioso' && pullDistance === 0) {
    return null;
  }

  const isUpdating = status === 'atualizando';
  const isThreshold = status === 'limiar_atingido';

  return (
    <div
      role="status"
      aria-live={isUpdating ? 'polite' : 'off'}
      className="fixed top-16 left-1/2 z-40 pointer-events-none select-none transition-transform duration-100 ease-out"
      style={{
        transform: `translate(-50%, ${Math.max(8, pullDistance - 28)}px)`,
        opacity: pullDistance > 10 ? 1 : 0
      }}
    >
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-tactile-sm backdrop-blur-md bg-[var(--surface-card)] text-[var(--text-main)] border-[var(--border-subtle)] text-xs font-medium">
        {isUpdating ? (
          <Icon
            name="sync"
            spin={!prefersReducedMotion}
            size="sm"
            className="text-sky-600 dark:text-sky-400"
          />
        ) : (
          <span
            className={`flex items-center justify-center transition-transform duration-200 ${
              isThreshold && !prefersReducedMotion ? 'rotate-180' : ''
            }`}
          >
            <Icon
              name="arrow_downward"
              size="sm"
              className={isThreshold ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}
            />
          </span>
        )}

        <span>
          {isUpdating
            ? 'Atualizando…'
            : isThreshold
            ? 'Solte para atualizar'
            : 'Puxe para atualizar'}
        </span>
      </div>
    </div>
  );
}

export default PuxarParaAtualizar;
