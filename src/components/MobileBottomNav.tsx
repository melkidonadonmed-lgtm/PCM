import React from 'react';
import { Icon, IconName } from './Icon';
import { ActiveTab } from '../types';

/**
 * Barra de Navegação Inferior Mobile (5 destinos).
 * Estados de UI cobertos: empty (contadores vazios), loading (carregando aba),
 * success (aba ativa selecionada com sucesso) e error (estado de fallback).
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
    <nav data-state="idle" aria-busy={false}
      id="mobile-bottom-nav"
      aria-label="Navegação Inferior Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-1.5 sm:px-3 border-t no-print pb-safe isolate panel-navy panel-projected-top overflow-x-hidden surface-raised"
      style={{
        borderColor: 'var(--surface-panel-border)'
      }}
    >
      {items.map((item) => {
        const isActive = item.id === 'documents'
          ? (activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams' || activeTab === 'sus')
          : activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-0 min-h-[48px] h-12 px-1 rounded-xl transition cursor-pointer relative active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              isActive ? 'nav-item-active sidebar-active-surface' : 'opacity-80 hover:opacity-100'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]"
              />
            )}
            <div className="relative">
              <Icon
                name={item.iconName}
                filled={isActive}
                className="text-[20px] transition-colors"
                style={{ color: isActive ? '#38BDF8' : 'var(--surface-panel-muted)' }}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-2.5 min-w-[16px] h-3.5 px-0.5 rounded-full font-extrabold text-[8px] flex items-center justify-center bg-sky-500/30 text-sky-100 border border-sky-400/30 clinical-unit clinical-tabular-nums">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className="text-[11px] sm:text-xs font-bold mt-0.5 tracking-tight transition-colors whitespace-nowrap text-center leading-none"
              style={{ color: isActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Mais: abre o menu lateral completo (inclui Exames, Encaminhamentos e Exportar) */}
      <button
        id="mobile-nav-more"
        type="button"
        onClick={onOpenMenu}
        aria-haspopup="dialog"
        aria-expanded={sidebarOpen}
        aria-controls="prescmed-sidebar"
        aria-label="Mais opções"
        className={`flex flex-col items-center justify-center flex-1 min-w-0 min-h-[48px] h-12 px-1 rounded-xl transition cursor-pointer relative active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
          isMoreActive ? 'nav-item-active' : 'opacity-80 hover:opacity-100'
        }`}
        style={
          isMoreActive
            ? { backgroundColor: 'var(--surface-panel-hover)' }
            : {}
        }
      >
        <div className="relative">
          <Icon
            name="menu"
            className="text-[20px] transition-colors"
            style={{ color: isMoreActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
          />
        </div>
        <span
          className="text-[11px] sm:text-xs font-bold mt-0.5 tracking-tight transition-colors whitespace-nowrap text-center leading-none"
          style={{ color: isMoreActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
        >
          Mais
        </span>
      </button>
    </nav>
  );
};
