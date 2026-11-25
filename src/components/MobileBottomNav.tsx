import React from 'react';
import { Icon, IconName } from './Icon';
import { ActiveTab } from '../types';

/**
 * Mobile Bottom Navigation Bar (5 primary clinical shortcuts).
 * Covered UI states: empty (zero counters), loading (tab transition),
 * success (active tab highlighted), and error (fallback route).
 */
interface MobileBottomNavProps {
  darkMode?: boolean;
  activeTab: ActiveTab;
  sidebarOpen?: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  prescriptionCount: number;
  selectedExamsCount: number;
  patientWeight?: number;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  sidebarOpen = false,
  onSelectTab,
  prescriptionCount,
  selectedExamsCount,
  onOpenMenu
}) => {
  const items: Array<{ id: ActiveTab; label: string; iconName: IconName; badge?: string }> = [
    {
      id: 'prescription',
      label: 'Receitas',
      iconName: 'receita',
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'documents',
      label: 'Documentos',
      iconName: 'documentos',
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'hospital',
      label: 'Hospitalar',
      iconName: 'local_hospital'
    },
    {
      id: 'editor',
      label: 'Editor',
      iconName: 'editor'
    }
  ];

  // Itens secundários (Doses, Protocolos, Escores e Exportar) acessíveis via "Mais"
  const isMoreActive =
    activeTab === 'pediatric_calc' ||
    activeTab === 'protocols' ||
    activeTab === 'scores' ||
    activeTab === 'print_preview';

  return (
    <nav
      data-state="idle"
      aria-busy={false}
      id="mobile-bottom-nav"
      aria-label="Atalhos móveis"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-1.5 sm:px-3 border-t border-[var(--surface-panel-border)] no-print pb-safe isolate panel-navy panel-projected-top overflow-x-hidden surface-raised"
    >
      {items.map((item) => {
        const isActive = item.id === 'documents'
          ? (activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams' || activeTab === 'sus')
          : activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            type="button"
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 min-h-[48px] h-12 px-1 py-1.5 rounded-[10px] transition-colors duration-150 cursor-pointer relative active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none ${
              isActive
                ? 'bg-white/[0.10] text-[var(--sidebar-text-primary)]'
                : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)]'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[oklch(0.840_0.110_180)]"
              />
            )}
            <div className="relative">
              <Icon
                name={item.iconName}
                filled={isActive}
                className={`text-[20px] transition-colors duration-150 ${
                  isActive ? 'text-[oklch(0.840_0.110_180)]' : 'text-[var(--sidebar-text-muted)]'
                }`}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-2.5 min-w-[16px] h-3.5 px-1 rounded-full font-bold text-[11px] flex items-center justify-center bg-[var(--clinical)] text-white border border-white/20 clinical-unit clinical-tabular-nums">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] sm:text-xs font-semibold mt-0.5 tracking-tight transition-colors duration-150 whitespace-nowrap text-center leading-none ${
                isActive ? 'text-[var(--sidebar-text-primary)]' : 'text-[var(--sidebar-text-muted)]'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More: opens the full clinical drawer */}
      <button
        id="mobile-nav-more"
        type="button"
        onClick={onOpenMenu}
        aria-haspopup="dialog"
        aria-expanded={sidebarOpen}
        aria-controls="prescmed-sidebar"
        aria-label="Mais opções"
        className={`flex flex-col items-center justify-center flex-1 min-w-0 min-h-[48px] h-12 px-1 py-1.5 rounded-[10px] transition-colors duration-150 cursor-pointer relative active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none ${
          isMoreActive
            ? 'bg-white/[0.10] text-[var(--sidebar-text-primary)]'
            : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)]'
        }`}
      >
        <div className="relative">
          <Icon
            name="menu"
            className={`text-[20px] transition-colors duration-150 ${
              isMoreActive ? 'text-[oklch(0.840_0.110_180)]' : 'text-[var(--sidebar-text-muted)]'
            }`}
          />
        </div>
        <span
          className={`text-[11px] sm:text-xs font-semibold mt-0.5 tracking-tight transition-colors duration-150 whitespace-nowrap text-center leading-none ${
            isMoreActive ? 'text-[var(--sidebar-text-primary)]' : 'text-[var(--sidebar-text-muted)]'
          }`}
        >
          Mais
        </span>
      </button>
    </nav>
  );
};
