import React from 'react';
import {
  Pill,
  Calculator,
  FlaskConical,
  FileText,
  Download,
  Menu
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  darkMode?: boolean;
  activeTab: ActiveTab;
  sidebarOpen?: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  prescriptionCount: number;
  selectedExamsCount: number;
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
  const items = [
    {
      id: 'prescription' as ActiveTab,
      label: 'Receitas',
      icon: Pill,
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'pediatric_calc' as ActiveTab,
      label: 'Doses',
      icon: Calculator
    },
    {
      id: 'exams' as ActiveTab,
      label: 'Exames',
      icon: FlaskConical,
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'editor' as ActiveTab,
      label: 'Editor',
      icon: FileText
    },
    {
      id: 'print_preview' as ActiveTab,
      label: 'Exportar',
      icon: Download
    }
  ];

  // Itens secundários (Atestados, Encaminhamentos, Protocolos) acessíveis via "Mais"
  const isMoreActive = activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'protocols';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navegação Inferior Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-1 xs:px-2 border-t backdrop-blur-md no-print pb-safe isolate panel-navy panel-projected-top overflow-x-hidden"
      style={{
        borderColor: 'var(--surface-panel-border)'
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 max-w-[68px] min-w-0 min-h-[48px] h-12 px-0.5 xs:px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
              isActive ? 'nav-item-active' : 'opacity-80 hover:opacity-100'
            }`}
            style={
              isActive
                ? { backgroundColor: 'var(--surface-panel-hover)' }
                : {}
            }
          >
            <div className="relative">
              <Icon
                className="w-5 h-5 icon-sculpted transition-colors"
                style={{ color: isActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
                strokeWidth={1.75}
              />
              {item.badge && (
                <span className="absolute -top-1 -right-2.5 min-w-[16px] h-3.5 px-0.5 rounded-full font-extrabold text-[8px] flex items-center justify-center bg-white/10 text-slate-200 border border-white/15">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className="text-[9px] xs:text-[10px] font-extrabold mt-0.5 tracking-tight transition-colors truncate max-w-full text-center"
              style={{ color: isActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Mais: abre o menu lateral completo (inclui Exames e Encaminhamentos) */}
      <button
        id="mobile-nav-more"
        type="button"
        onClick={onOpenMenu}
        aria-haspopup="dialog"
        aria-expanded={sidebarOpen}
        aria-controls="prescmed-sidebar"
        aria-label="Mais opções: Exames, Encaminhamentos e menu completo"
        className={`flex flex-col items-center justify-center flex-1 max-w-[68px] min-w-0 min-h-[48px] h-12 px-0.5 xs:px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
          isMoreActive ? 'nav-item-active' : 'opacity-80 hover:opacity-100'
        }`}
        style={
          isMoreActive
            ? { backgroundColor: 'var(--surface-panel-hover)' }
            : {}
        }
      >
        <div className="relative">
          <Menu
            className="w-5 h-5 icon-sculpted transition-colors"
            style={{ color: isMoreActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
            strokeWidth={1.75}
          />
          {selectedExamsCount > 0 && (
            <span className="absolute -top-1 -right-2.5 min-w-[16px] h-3.5 px-0.5 rounded-full font-extrabold text-[8px] flex items-center justify-center bg-white/10 text-slate-200 border border-white/15">
              {selectedExamsCount}
            </span>
          )}
        </div>
        <span
          className="text-[9px] xs:text-[10px] font-extrabold mt-0.5 tracking-tight transition-colors truncate max-w-full text-center"
          style={{ color: isMoreActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
        >
          Mais
        </span>
      </button>
    </nav>
  );
};
