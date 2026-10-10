import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  ChevronRight, 
  UserPlus,
  FileText,
  Download,
  Cloud,
  LogOut
} from 'lucide-react';
import { Icon } from './Icon';
import { Patient } from '../types';
import { cloudAuthService, type DoctorUserProfile } from '../services/cloud/cloudAuthService';
import { cloudSyncManager, type SyncStatus } from '../services/cloud/cloudSyncManager';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onGoHome?: () => void;
  onToggleSidebar: () => void;
  patient?: Patient;
  onOpenPatientModal?: () => void;
  onNavigateToEditor?: () => void;
  isInstallable?: boolean;
  onInstallApp?: () => void;
}

export const CloudAuthButton: React.FC = () => {
  const [user, setUser] = useState<DoctorUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    cloudAuthService.subscribe((profile) => {
      setUser(profile);
    }).then(unsub => {
      unsubscribeAuth = unsub;
    });

    const unsubscribeSync = cloudSyncManager.subscribe((status) => {
      setSyncStatus(status);
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      unsubscribeSync();
    };
  }, []);

  const handleToggleAuth = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (user) {
        await cloudAuthService.logout();
      } else {
        await cloudAuthService.loginWithGoogle();
      }
    } catch (error) {
      console.error('Falha na autenticação Google:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div 
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl border text-xs shadow-tactile-sm transition bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)]"
        title={`Conectado à nuvem: ${user.email || user.displayName} | Status: ${syncStatus}`}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || 'Médico'} 
            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
            {user.displayName ? user.displayName[0].toUpperCase() : 'M'}
          </div>
        )}
        <div className="flex flex-col items-start leading-tight min-w-0">
          <span className="font-semibold text-[11px] max-w-[85px] sm:max-w-[120px] truncate hidden sm:inline">
            {user.displayName?.split(' ')[0] || 'Dr(a).'}
          </span>
          <div className="hidden sm:flex items-center gap-1 text-[9px]">
            {syncStatus === 'syncing' && (
              <span className="text-sky-500 font-medium flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                Sincronizando...
              </span>
            )}
            {syncStatus === 'synced' && (
              <span className="text-emerald-500 font-medium flex items-center gap-0.5" title="Modelos e postos sincronizados">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sincronizado
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="text-amber-500 font-medium flex items-center gap-0.5" title="Operando localmente">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Modo Local
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="text-rose-500 font-medium flex items-center gap-0.5" title="Erro ao sincronizar na nuvem">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Erro Sync
              </span>
            )}
            {syncStatus === 'idle' && (
              <span className="text-[var(--text-muted)] dark:text-slate-400 font-normal">
                Pronto
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleAuth}
          className="p-1 hover:text-rose-500 rounded transition-colors text-[var(--text-muted)] dark:text-slate-400 cursor-pointer ml-0.5 focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
          title="Desconectar da nuvem"
          aria-label="Desconectar da Nuvem"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleAuth}
      disabled={loading}
      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-slate-600 dark:text-slate-300 hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
      title="Conectar Conta Google para sincronização em nuvem (opcional)"
      aria-label="Conectar Nuvem"
    >
      <Cloud className={`w-4 h-4 text-sky-600 dark:text-sky-400 ${loading ? 'animate-pulse' : ''}`} strokeWidth={1.75} />
      <span className="hidden lg:inline text-[11px] font-medium text-[var(--text-muted)] dark:text-slate-400">
        {loading ? 'Conectando...' : 'Nuvem'}
      </span>
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onGoHome,
  onToggleSidebar,
  patient,
  onOpenPatientModal,
  onNavigateToEditor,
  isInstallable = false,
  onInstallApp
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasPatient = Boolean(patient?.name?.trim());
  const patientName = patient?.name?.trim() || '';

  return (
    <header 
      id="prescmed-header" 
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors no-print isolate bg-[var(--surface-card)] border-[var(--border-subtle)]"
      style={{
        boxShadow: darkMode 
          ? '0 12px 28px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 4px 20px -2px rgba(20, 32, 50, 0.07), inset 0 1px 0 rgba(255,255,255,0.95)'
      }}
    >
      <div className="w-full max-w-screen-2xl container mx-auto h-16 px-2.5 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Left side: Menu trigger & Sculpted Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            aria-label="Abrir ou fechar menu lateral"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Brand Emblem / Botão Início */}
            <button
              type="button"
              aria-label="Início"
              onClick={onGoHome}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 border transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              style={{
                backgroundColor: 'var(--nav-bg, #0F172A)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.15)'
              }}
            >
              <img 
                src="/logo.png" 
                alt="" 
                className="w-8 h-8 object-contain rounded-lg select-none" 
              />
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  PresC<span className="text-blue-600 dark:text-blue-400 font-black">Med</span>
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-extrabold tracking-wider bg-blue-600/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300 border border-blue-600/20 dark:border-blue-400/25">
                  PRO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Active Patient Chip com Peso Integrado */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center sm:justify-start">
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
            className={`flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-xl border transition cursor-pointer group w-full max-w-[280px] sm:max-w-[360px] min-h-[40px] min-w-0 shadow-tactile-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              hasPatient 
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-200' 
                : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
            title="Clique para identificar o paciente, peso e histórico clínico"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
              hasPatient 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              {hasPatient ? <User className="w-4 h-4" strokeWidth={2} /> : <UserPlus className="w-4 h-4" strokeWidth={1.75} />}
            </div>
            <div className="text-left overflow-hidden min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold truncate text-slate-900 dark:text-white flex items-center justify-between gap-1">
                <span className="truncate">
                  {hasPatient ? patientName : 'Identificar paciente'}
                </span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform opacity-70 flex-shrink-0 text-[var(--text-muted)] dark:text-slate-400" strokeWidth={1.75} />
              </div>
              {hasPatient && (
                <div className="text-[10px] font-semibold flex items-center gap-1.5 truncate mt-0.5">
                  {patientWeight > 0 && (
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/10 px-1 rounded flex items-center gap-1">
                      <Icon name="scale" size="xs" className="inline-block" />
                      <span>{patientWeight.toLocaleString('pt-BR')} kg</span>
                    </span>
                  )}
                  {patient?.ageText && (
                    <span className="text-[var(--text-muted)] dark:text-slate-400 hidden sm:inline">• {patient.ageText}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Atalhos Essenciais & Alternador de Tema */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {onNavigateToEditor && (
            <button
              type="button"
              onClick={onNavigateToEditor}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              title="Abrir Editor Livre de Documentos A4"
            >
              <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
              <span>Editor</span>
            </button>
          )}

          <CloudAuthButton />

          {isInstallable && onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              title="Instalar PresCMed como aplicativo offline"
              aria-label="Instalar Aplicativo PresCMed"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>Instalar</span>
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-theme"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
            title={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.75} />
            ) : (
              <Moon className="w-5 h-5 text-slate-800" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
