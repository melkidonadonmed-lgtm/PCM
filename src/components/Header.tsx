import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Scale, 
  User, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Patient } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  patient?: Patient;
  onOpenPatientModal?: () => void;
  prescriptionCount?: number;
  selectedExamsCount?: number;
  onQuickWeightChange?: (newWeight: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  sidebarOpen,
  onToggleSidebar,
  patient,
  onOpenPatientModal,
  prescriptionCount = 0,
  selectedExamsCount = 0,
  onQuickWeightChange
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasPatient = Boolean(patient?.name?.trim());
  const patientName = patient?.name?.trim() || '';

  return (
    <header 
      id="prescmed-header" 
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors no-print isolate panel-navy panel-projected-bottom"
      style={{
        backgroundColor: 'var(--surface-panel)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: darkMode 
          ? '0 12px 28px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 8px 24px -4px rgba(10, 17, 28, 0.35), inset 0 1px 0 rgba(255,255,255,0.12)'
      }}
    >
      <div className="w-full max-w-screen-2xl container mx-auto h-[68px] sm:h-[72px] px-2.5 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Left side: Menu trigger & Sculpted Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            aria-label="Abrir ou fechar menu lateral"
            aria-expanded={sidebarOpen}
            aria-controls="prescmed-sidebar"
            className="w-10 h-10 sm:w-11 sm:h-11 min-w-[44px] min-h-[44px] rounded-xl flex flex-col gap-0.5 items-center justify-center transition-all cursor-pointer shadow-tactile-sm active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-cream-100 outline-none panel-navy-inset hover:bg-white/10"
            style={{
              color: '#FDFBF7'
            }}
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} /><span className="text-[9px]">Menu</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
            {/* Brand Emblem */}
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 border"
              style={{
                backgroundColor: '#142032',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(20, 32, 50, 0.25)',
                boxShadow: '0 4px 12px rgba(10, 17, 28, 0.35), inset 0 1px 0 rgba(255,255,255,0.18)'
              }}
            >
              <img 
                src="/logo.png" 
                alt="PresCMed Logo" 
                className="w-full h-full object-cover rounded-xl select-none pointer-events-none" 
              />
            </div>
            <h1 className="sr-only">PresCMed — Prescrição Médica e Doses Pediátricas</h1>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1 sm:gap-1.5" aria-hidden="true">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  PresC<span className="text-cream-300 font-black">Med</span>
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-extrabold tracking-wider bg-white/10 text-white border border-white/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] hidden lg:block font-medium text-slate-300">
                Prescrições Rápidas & Doses Pediátricas Inteligentes
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Active Patient & Weight Quick Badge */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 justify-center sm:justify-start">
          <div 
            onClick={onOpenPatientModal}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenPatientModal?.();
              }
            }}
            id="header-patient-chip"
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 sm:gap-2.5 px-3 py-1 rounded-xl border transition-all cursor-pointer group w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] h-11 min-h-[44px] min-w-0 shadow-tactile-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-cream-100 outline-none panel-navy-inset hover:bg-white/10"
            style={{
              borderColor: 'var(--surface-panel-border)'
            }}
            title="Clique para definir ou editar os dados do paciente"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border border-white/10 bg-white/5 text-slate-200">
              {hasPatient ? <User className="w-4 h-4 text-slate-200" strokeWidth={1.75} /> : <UserPlus className="w-4 h-4 text-slate-400" strokeWidth={1.75} />}
            </div>
            <div className="text-left overflow-hidden min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold truncate text-white flex items-center justify-between gap-1">
                <span className="truncate flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      hasPatient ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{hasPatient ? patientName : 'Identificar Paciente'}</span>
                </span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform opacity-80 flex-shrink-0 text-slate-300" strokeWidth={1.75} />
              </div>
              <div className="text-[10px] font-semibold flex items-center gap-1.5 truncate">
                {patientWeight > 0 ? (
                  <span className="text-cream-200 font-bold">{patientWeight} kg</span>
                ) : (
                  <span className="text-slate-300">Toque para preencher</span>
                )}
                {patient?.ageText && (
                  <span className="text-slate-300 hidden xs:inline">• {patient.ageText}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Weight Input in Header */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 h-11 min-h-[44px] rounded-xl border shadow-tactile-sm transition-all panel-navy-inset"
            style={{
              borderColor: 'var(--surface-panel-border)'
            }}
          >
            <Scale className="w-4 h-4 text-cream-200 flex-shrink-0" strokeWidth={1.75} />
            <label htmlFor="header-input-weight" className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex-shrink-0">
              Peso
            </label>
            <div className="flex items-center gap-1">
              <input
                id="header-input-weight"
                aria-label="Peso rápido do paciente em quilogramas"
                type="number"
                step="0.1"
                min="0.5"
                max="200"
                value={patientWeight > 0 ? patientWeight : ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (onQuickWeightChange) {
                    onQuickWeightChange(isNaN(val) ? 0 : val);
                  }
                }}
                placeholder="--"
                inputMode="decimal"
                className="w-12 min-h-[44px] text-sm font-black text-center outline-none bg-transparent text-white rounded-lg"
              />
              <span className="text-[10px] font-bold text-slate-300">kg</span>
            </div>
          </div>
        </div>

        {/* Right side: Dark/Light Mode Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            id="btn-toggle-theme"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="w-10 h-10 sm:w-11 sm:h-11 min-w-[44px] min-h-[44px] rounded-xl flex flex-col gap-0.5 items-center justify-center transition-all cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 dark:focus-visible:ring-cream-100 outline-none panel-navy-inset hover:bg-white/10"
            style={{
              borderColor: 'var(--surface-panel-border)',
              color: '#FDFBF7'
            }}
            title={darkMode ? 'Ativar Modo Claro (Baunilha & Navy)' : 'Ativar Modo Escuro (Obsidian & Creme)'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-cream-200 animate-spin-slow" strokeWidth={1.75} />
            ) : (
              <Moon className="w-5 h-5 text-cream-100" strokeWidth={1.75} />
            )}
            <span className="text-[9px]">Tema</span>
          </button>
        </div>
      </div>
    </header>
  );
};
