import React from 'react';
import {
  Pill,
  Calculator,
  FileText,
  FlaskConical,
  Download
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  darkMode?: boolean;
  activeTab: ActiveTab;
  sidebarOpen?: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  prescriptionCount: number;
  selectedExamsCount: number;
  hasPatient?: boolean;
  patientWeight?: number;
  onOpenMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  darkMode,
  activeTab,
  sidebarOpen = false,
  onSelectTab,
  prescriptionCount,
  selectedExamsCount,
  hasPatient = false,
  patientWeight,
  onOpenMenu
}) => {
  const items = [
    {
      id: 'prescription' as ActiveTab,
      label: 'Prescrever',
      icon: Pill,
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'pediatric_calc' as ActiveTab,
      label: 'Calculadora',
      icon: Calculator,
      badge: patientWeight && patientWeight > 0 ? `${patientWeight}kg` : undefined
    },
    {
      id: 'exams' as ActiveTab,
      label: 'Exames',
      icon: FlaskConical,
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'certificate' as ActiveTab,
      label: 'Documentos',
      icon: FileText,
      badge: undefined
    },
    {
      id: 'print_preview' as ActiveTab,
      label: 'Emitir PDF',
      icon: Download,
      badge: undefined
    }
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Navegação Inferior Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 border-t backdrop-blur-md no-print isolate panel-navy panel-projected-top h-mobile-nav pb-safe"
      style={{
        borderColor: 'var(--surface-panel-border)'
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id || (item.id === 'certificate' && activeTab === 'referral');

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            type="button"
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.badge ? `${item.label} (${item.badge})` : item.label}
            className={`flex flex-col items-center justify-center min-w-0 flex-1 min-h-[48px] h-12 px-1 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
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
                <span className="absolute -top-1 -right-2.5 min-w-[18px] h-4 px-1 rounded-full font-extrabold text-[9px] flex items-center justify-center bg-white/10 text-slate-200 border border-white/15">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-extrabold mt-0.5 tracking-tight transition-colors truncate max-w-[68px]"
              style={{ color: isActive ? 'var(--nav-accent)' : 'var(--surface-panel-muted)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
