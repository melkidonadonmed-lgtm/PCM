import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { ActiveTab, DoctorProfile, Patient } from '../types';
import { cloudAuthService, type DoctorUserProfile } from '../services/cloud/cloudAuthService';
import { cloudSyncManager, type SyncStatus } from '../services/cloud/cloudSyncManager';

/**
 * Cabeçalho Global da Aplicação.
 * Estados de UI cobertos: empty (nenhum paciente ou médico configurado), loading (carregando sincronização na nuvem),
 * success (sincronizado com sucesso) e error (erro de autenticação/sincronização).
 */
interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onGoHome?: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  activeTab?: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  doctor?: DoctorProfile;
  onOpenDoctorModal?: () => void;
  patient?: Patient;
  onOpenPatientModal?: () => void;
  onNavigateToEditor?: () => void;
  prescriptionCount?: number;
  selectedExamsCount?: number;
  isInstallable?: boolean;
  onInstallApp?: () => void;
  onOpenCommandPalette?: () => void;
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
    const cloudState = loading || syncStatus === 'syncing' ? 'loading' : syncStatus === 'error' ? 'error' : 'idle';
    return (
      <div data-state={cloudState} aria-busy={cloudState === 'loading'} 
        className="flex items-center gap-1.5 px-2 h-9 xl:h-10 rounded-xl border text-xs shadow-tactile-sm transition bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)] shrink-0"
        title={`Conectado à nuvem: ${user.email || user.displayName} | Status: ${syncStatus}`}
      >
        <div className="relative flex-shrink-0">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'Médico'} 
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
              {user.displayName ? user.displayName[0].toUpperCase() : 'M'}
            </div>
          )}
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-[var(--bg-app)] ${
              syncStatus === 'syncing'
                ? 'bg-sky-500 animate-ping'
                : syncStatus === 'error'
                  ? 'bg-rose-500'
                  : syncStatus === 'offline'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
            }`}
          />
        </div>
        <div className="hidden sm:flex lg:hidden 2xl:flex flex-col items-start leading-tight min-w-0">
          <span className="font-semibold text-xs max-w-[80px] 2xl:max-w-[96px] truncate">
            {user.displayName?.split(' ')[0] || 'Dr(a).'}
          </span>
          <div className="hidden 2xl:flex items-center gap-1 text-[10px]">
            {syncStatus === 'syncing' && (
              <span className="text-sky-500 font-medium">Sincronizando...</span>
            )}
            {syncStatus === 'synced' && (
              <span className="text-emerald-500 font-medium" title="Modelos e postos sincronizados">
                Sincronizado
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="text-amber-500 font-medium" title="Operando localmente">
                Modo Local
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="text-rose-500 font-medium" title="Erro ao sincronizar na nuvem">
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
          className="p-1 hover:text-rose-500 rounded transition-colors text-[var(--text-muted)] dark:text-slate-400 cursor-pointer ml-0.5 focus-visible:ring-2 focus-visible:ring-rose-500 outline-none shrink-0"
          title="Desconectar da nuvem"
          aria-label="Desconectar da Nuvem"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleAuth}
      disabled={loading}
      data-state={loading ? 'loading' : 'idle'}
      aria-busy={loading || undefined}
      className="flex items-center justify-center gap-1.5 w-9 h-9 xl:w-10 xl:h-10 2xl:w-auto 2xl:px-3 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none shrink-0"
      title="Conectar Conta Google para sincronização em nuvem (opcional)"
      aria-label="Conectar Nuvem"
    >
      <Icon name="cloud" size={16} className={`text-sky-600 dark:text-sky-400 ${loading ? 'animate-pulse' : ''}`} />
      <span className="hidden 2xl:inline text-xs font-semibold">
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
  isSidebarOpen = false,
  activeTab = 'prescription',
  onSelectTab,
  patient,
  onNavigateToEditor,
  prescriptionCount = 0,
  selectedExamsCount = 0,
  isInstallable = false,
  onInstallApp,
  onOpenCommandPalette
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;

  const quickNavTabs: Array<{
    id: ActiveTab;
    label: string;
    icon: string;
    shortcut: string;
    shortKey: string;
    badge?: string;
  }> = [
    {
      id: 'prescription',
      label: 'Receitas',
      icon: 'receita',
      shortcut: 'Alt+1',
      shortKey: '1',
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: 'documentos',
      shortcut: 'Alt+2',
      shortKey: '2',
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'sus',
      label: 'Guias SUS',
      icon: 'sus',
      shortcut: 'Alt+6',
      shortKey: '6'
    },
    {
      id: 'pediatric_calc',
      label: 'Doses',
      icon: 'calculate',
      shortcut: 'Alt+3',
      shortKey: '3',
      badge: patientWeight > 0 ? `${patientWeight}kg` : undefined
    },
    {
      id: 'protocols',
      label: 'Protocolos',
      icon: 'coracao',
      shortcut: 'Alt+4',
      shortKey: '4'
    },
    {
      id: 'scores',
      label: 'Escores',
      icon: 'monitor_heart',
      shortcut: 'Alt+8',
      shortKey: '8'
    },
    {
      id: 'editor',
      label: 'Editor',
      icon: 'editor',
      shortcut: 'Alt+5',
      shortKey: '5'
    },
    {
      id: 'hospital',
      label: 'Hospitalar',
      icon: 'local_hospital',
      shortcut: 'Alt+7',
      shortKey: '7'
    }
  ];

  return (
    <header 
      id="prescmed-header" 
      className="sticky top-0 z-50 w-full border-b transition-colors no-print isolate bg-[var(--surface-card)]/95 backdrop-blur-md border-[var(--border-subtle)]"
      style={{
        boxShadow: darkMode 
          ? '0 10px 24px -6px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 2px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.95)'
      }}
    >
      <div className="w-full max-w-screen-2xl container mx-auto h-16 px-2.5 sm:px-4 lg:px-4 xl:px-6 flex items-center justify-between gap-2">
        {/* Left side: Menu trigger & Unified Brand Home Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Abrir ou fechar menu lateral"
            className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--surface-inset)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
          >
            <Icon name="menu" size={18} />
          </button>

          {/* Brand Emblem + Name / Botão Início */}
          <button
            type="button"
            aria-label="Início"
            onClick={onGoHome}
            className="flex items-center gap-2 px-1 h-9 xl:h-10 rounded-xl transition cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none group"
            title="Voltar ao início (Receitas — Alt+1)"
          >
            <span
              className="w-8 h-8 xl:w-9 xl:h-9 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 border transition group-hover:brightness-110 shadow-tactile-sm"
              style={{
                backgroundColor: 'var(--nav-bg, #0F172A)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.16)'
              }}
            >
              <img 
                src="/logo.png" 
                alt="" 
                className="w-5 h-5 xl:w-6 xl:h-6 object-contain rounded-md select-none" 
              />
            </span>
            <div className="hidden sm:flex lg:hidden xl:flex flex-col items-start leading-none">
              <span className="font-bold text-sm xl:text-[15px] tracking-tight text-slate-900 dark:text-white">
                PresCMed
              </span>
              <span className="hidden 2xl:inline text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
                PEC • CFM • A4
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Fluid Segmented Workspace Navigation */}
        {onSelectTab && (
          <nav
            aria-label="Navegação rápida entre áreas clínicas"
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-2xl nav-segmented-track min-w-0 max-w-full overflow-x-auto scrollbar-none"
          >
            {quickNavTabs.map((tab) => {
              const isActive = tab.id === 'documents'
                ? (activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams')
                : activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${tab.label} (${tab.shortcut})`}
                  className={`px-1.5 xl:px-2 py-1 min-h-[32px] xl:min-h-[40px] rounded-xl text-[11px] xl:text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'nav-segmented-pill-active font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-semibold border border-transparent'
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    size={14}
                    filled={isActive}
                    className={`${isActive ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'} hidden xl:inline-flex`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge ? (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full clinical-unit clinical-tabular-nums ${
                        isActive
                          ? 'bg-sky-700 text-white shadow-xs'
                          : 'bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`sr-only kbd-shortcut-chip ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold'
                          : 'text-[var(--text-muted)] opacity-60'
                      }`}
                    >
                      {tab.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Command & Context Cluster: Busca Ctrl+K, Nuvem, Instalar e Tema */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
          {onOpenCommandPalette && (
            <button
              id="btn-open-command-palette"
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Busca rápida e navegação global (Ctrl+K)"
              title="Busca rápida de medicamentos, kits, protocolos e guias SUS (Ctrl+K)"
              className="w-9 h-9 sm:w-auto sm:px-2.5 xl:h-10 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--surface-inset)] dark:bg-[#1E293B] text-[var(--text-secondary)] hover:text-[var(--text-main)] border border-[var(--border-subtle)] dark:border-white/10 hover:bg-[var(--surface-hover)] shrink-0"
            >
              <Icon name="search" size={16} className="text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline text-xs font-medium text-[var(--text-muted)]">
                Buscar
              </span>
              <span className="hidden md:inline kbd-shortcut-chip font-bold text-[var(--text-secondary)] bg-white/80 dark:bg-white/10 border border-[var(--border-subtle)] dark:border-white/10 clinical-tabular-nums">
                Ctrl+K
              </span>
            </button>
          )}

          {onNavigateToEditor && !onSelectTab && (
            <button
              type="button"
              onClick={onNavigateToEditor}
              className="hidden md:flex items-center gap-1.5 px-2.5 h-9 xl:h-10 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none shrink-0"
              title="Abrir Editor Livre de Documentos A4"
            >
              <Icon name="editor" size={16} className="text-sky-600 dark:text-sky-400" />
              <span>Editor</span>
            </button>
          )}

          <CloudAuthButton />

          {isInstallable && onInstallApp && (
            <button
              id="btn-header-install-pwa"
              type="button"
              onClick={onInstallApp}
              className={`${
                isSidebarOpen ? 'flex lg:hidden 2xl:flex' : 'flex'
              } items-center justify-center gap-1.5 w-9 sm:w-auto sm:px-2.5 lg:w-9 lg:px-0 2xl:w-auto 2xl:px-2.5 h-9 xl:h-10 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--surface-inset)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none shrink-0`}
              title="Instalar PresCMed como aplicativo offline"
              aria-label="Instalar Aplicativo PresCMed"
            >
              <Icon name="download" size={16} className="text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline lg:hidden 2xl:inline">Instalar</span>
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-theme"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--surface-inset)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] shrink-0"
            title={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {darkMode ? (
              <Icon name="light_mode" size={18} className="text-amber-400" />
            ) : (
              <Icon name="dark_mode" size={18} className="text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

