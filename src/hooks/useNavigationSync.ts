import { useEffect, useCallback, useRef } from 'react';
import type { ActiveTab } from '../types';
import type { DocumentsSubTab } from '../components/ClinicalDocumentsHub';

interface UseNavigationSyncOptions {
  activeTab: ActiveTab;
  documentsSubTab: DocumentsSubTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCommandPalette: () => void;
  isAnyModalOpen: boolean;
}

const VALID_DIRECT_TABS = new Set<ActiveTab>([
  'prescription',
  'documents',
  'certificate',
  'referral',
  'exams',
  'sus',
  'pediatric_calc',
  'protocols',
  'editor',
  'hospital',
  'scores',
  'print_preview',
]);

/**
 * Converte um hash de URL (#scores, #documents/referral, #sus, etc.) em ActiveTab válido.
 */
export function parseTabFromHash(rawHash: string): ActiveTab | null {
  const clean = rawHash.replace(/^#+/, '').trim().toLowerCase();
  if (!clean) return null;
  if (clean === 'documents/certificate') return 'certificate';
  if (clean === 'documents/referral') return 'referral';
  if (clean === 'documents/exams') return 'exams';
  if (clean === 'documents/sus') return 'sus';
  if (VALID_DIRECT_TABS.has(clean as ActiveTab)) {
    return clean as ActiveTab;
  }
  return null;
}

/**
 * Sincroniza atalhos de teclado globais (Alt+1..8 e Ctrl+K / Cmd+K)
 * e hash semântico bidirecional (#prescription, #documents/sus, etc.) sem recarregar a página.
 */
export function useNavigationSync({
  activeTab,
  documentsSubTab,
  onSelectTab,
  onOpenCommandPalette,
  isAnyModalOpen,
}: UseNavigationSyncOptions) {
  const onSelectTabRef = useRef(onSelectTab);
  onSelectTabRef.current = onSelectTab;
  const didSyncInitialHashRef = useRef(false);

  // Sincroniza hash inicial na montagem e escuta mudanças externas de hash (hashchange)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!didSyncInitialHashRef.current) {
      didSyncInitialHashRef.current = true;
      const initialTarget = parseTabFromHash(window.location.hash);
      if (initialTarget && initialTarget !== activeTab) {
        onSelectTabRef.current(initialTarget);
      }
    }

    const handleHashChange = () => {
      const target = parseTabFromHash(window.location.hash);
      if (target) {
        onSelectTabRef.current(target);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

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
        '7': 'hospital',
        '8': 'scores',
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
 * Executa transição de aba sincronizada com a animação CSS `.animate-tab-fade` do container principal,
 * sem congelar o drawer da Sidebar ou capturar snapshots assíncronos do root viewport.
 */
export function runTabViewTransition(updateFn: () => void) {
  updateFn();
}
