import { useEffect, useCallback } from 'react';
import type { ActiveTab } from '../types';
import type { DocumentsSubTab } from '../components/ClinicalDocumentsHub';

interface UseNavigationSyncOptions {
  activeTab: ActiveTab;
  documentsSubTab: DocumentsSubTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCommandPalette: () => void;
  isAnyModalOpen: boolean;
}

/**
 * Sincroniza atalhos de teclado globais (Alt+1..6 e Ctrl+K / Cmd+K)
 * e hash semântico leve (#prescription, #documents/sus, etc.) sem recarregar a página.
 */
export function useNavigationSync({
  activeTab,
  documentsSubTab,
  onSelectTab,
  onOpenCommandPalette,
  isAnyModalOpen,
}: UseNavigationSyncOptions) {
  // Atualiza hash silenciosamente para preservar contexto visual
  useEffect(() => {
    if (typeof window === 'undefined' || !window.history?.replaceState) return;
    const hashValue =
      activeTab === 'documents' ? `#documents/${documentsSubTab}` : `#${activeTab}`;
    if (window.location.hash !== hashValue) {
      try {
        window.history.replaceState(null, '', hashValue);
      } catch {
        // Ignora em ambientes restritos / sandboxed
      }
    }
  }, [activeTab, documentsSubTab]);

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Command Palette Global: Ctrl+K ou Cmd+K
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
        // Se estiver na tela de receitas e o usuário ainda não abriu modal, permite que Ctrl+K abra a Command Palette global
        // a menos que o foco já esteja no input de busca de medicamentos com texto digitado
        const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
        if (activeEl && activeEl.id === 'med-search-input' && (activeEl as HTMLInputElement).value.trim().length > 0) {
          return;
        }
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (isAnyModalOpen) return;
      if (
        typeof document !== 'undefined' &&
        document.querySelector('[role="dialog"], [aria-modal="true"]')
      ) {
        return;
      }

      const shortcutMap: Record<string, ActiveTab> = {
        '1': 'prescription',
        '2': 'documents',
        '3': 'pediatric_calc',
        '4': 'protocols',
        '5': 'editor',
        '6': 'sus',
      };
      const targetTab = shortcutMap[e.key];
      if (targetTab) {
        e.preventDefault();
        onSelectTab(targetTab);
      }
    },
    [isAnyModalOpen, onOpenCommandPalette, onSelectTab]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);
}

/**
 * Executa transição de aba com View Transitions API quando suportada e permitida pela preferência vestibular.
 */
export function runTabViewTransition(updateFn: () => void) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    updateFn();
    return;
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPrinting = document.body?.classList?.contains('pcm-imprimindo');
  const docWithVT = document as Document & {
    startViewTransition?: (cb: () => void) => unknown;
  };

  if (!prefersReducedMotion && !isPrinting && typeof docWithVT.startViewTransition === 'function') {
    try {
      docWithVT.startViewTransition(() => {
        updateFn();
      });
      return;
    } catch {
      // Fallback imediato
    }
  }

  updateFn();
}
