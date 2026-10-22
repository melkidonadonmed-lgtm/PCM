import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { ActiveTab, DoctorProfile, Patient } from '../types';
import { medicoConfigurado } from '../utils/medicoConfigurado';
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
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 h-10 rounded-xl border text-xs shadow-tactile-sm transition bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)]"
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
          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
            {user.displayName ? user.displayName[0].toUpperCase() : 'M'}
          </div>
        )}
        <div className="flex flex-col items-start leading-tight min-w-0">
          <span className="font-semibold text-xs max-w-[85px] sm:max-w-[110px] truncate hidden sm:inline">
            {user.displayName?.split(' ')[0] || 'Dr(a).'}
          </span>
          <div className="hidden sm:flex items-center gap-1 text-xs">
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
      className="flex items-center gap-1.5 px-2.5 sm:px-3 h-10 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
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
  activeTab = 'prescription',
  onSelectTab,
  doctor,
  onOpenDoctorModal,
  patient,
  onOpenPatientModal,
  onNavigateToEditor,
  prescriptionCount = 0,
  selectedExamsCount = 0,
  isInstallable = false,
  onInstallApp,
  onOpenCommandPalette
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasPatient = Boolean(patient?.name?.trim());
  const patientName = patient?.name?.trim() || '';
  const isDoctorReady = medicoConfigurado(doctor);

  const quickNavTabs: Array<{
    id: ActiveTab;
    label: string;
    icon: string;
    shortcut: string;
    badge?: string;
  }> = [
    {
      id: 'prescription',
      label: 'Receitas',
      icon: 'receita',
      shortcut: 'Alt+1',
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: 'documentos',
      shortcut: 'Alt+2',
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'pediatric_calc',
      label: 'Doses',
      icon: 'balanca',
      shortcut: 'Alt+3',
      badge: patientWeight > 0 ? `${patientWeight}kg` : undefined
    },
    {
      id: 'protocols',
      label: 'Protocolos',
      icon: 'coracao',
      shortcut: 'Alt+4'
    },
    {
      id: 'editor',
      label: 'Editor',
      icon: 'editor',
      shortcut: 'Alt+5'
    }
  ];

  return (
    <header 
      id="prescmed-header" 
      className="sticky top-0 z-50 w-full border-b transition-colors no-print isolate bg-[var(--surface-card)] border-[var(--border-subtle)]"
      style={{
        boxShadow: darkMode 
          ? '0 10px 24px -6px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 2px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.95)'
      }}
    >
      <div className="w-full max-w-screen-2xl container mx-auto h-16 px-2.5 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left side: Menu trigger & Unified Brand Home Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Abrir ou fechar menu lateral"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
          >
            <Icon name="menu" size={18} />
          </button>

          {/* Brand Emblem + Name / Botão Início */}
          <button
            type="button"
            aria-label="Início"
            onClick={onGoHome}
            className="flex items-center gap-2 px-1.5 h-10 rounded-xl transition cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none group"
            title="Voltar ao início (Receitas)"
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 border transition group-hover:brightness-110"
              style={{
                backgroundColor: 'var(--nav-bg, #0F172A)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.12)'
              }}
            >
              <img 
                src="/logo.png" 
                alt="" 
                className="w-6 h-6 object-contain rounded-md select-none" 
              />
            </span>
            <span className="hidden sm:inline font-bold text-base tracking-tight text-slate-900 dark:text-white">
              PresCMed
            </span>
          </button>
        </div>

        {/* Desktop Fluid Segmented Workspace Navigation */}
        {onSelectTab && (
          <nav
            aria-label="Navegação rápida entre áreas clínicas"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 p-1 rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] flex-shrink-0"
          >
            {quickNavTabs.map((tab) => {
              const isActive = tab.id === 'documents'
                ? (activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams' || activeTab === 'sus')
                : activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${tab.label} (${tab.shortcut})`}
                  className={`px-2 xl:px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                    isActive
                      ? 'bg-[var(--surface-card)] text-[var(--text-main)] font-bold shadow-tactile-sm border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    size={16}
                    className={isActive ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.2 rounded-full clinical-tabular-nums ${
                        isActive
                          ? 'bg-sky-600 text-white'
                          : 'bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Middle: Active Patient Chip com Peso Integrado */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center lg:justify-end">
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
            className={`flex items-center gap-2 px-3 h-10 rounded-xl border transition cursor-pointer group max-w-[220px] xl:max-w-[260px] shrink-0 shadow-tactile-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              hasPatient 
                ? 'bg-sky-50/70 dark:bg-sky-950/35 border-sky-200 dark:border-sky-800/50 text-slate-900 dark:text-slate-100 hover:bg-sky-100/70 dark:hover:bg-sky-900/40' 
                : 'bg-[var(--bg-app)] dark:bg-[#1E293B] border-[var(--border-subtle)] dark:border-white/10 text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
            title="Clique para identificar o paciente, peso e histórico clínico"
          >
            <Icon
              name={hasPatient ? 'person' : 'person_add'}
              size={16}
              className={hasPatient ? 'text-sky-600 dark:text-sky-400' : 'text-[var(--text-muted)]'}
            />
            <div className="text-left overflow-hidden min-w-0 flex-1">
              <div className="text-xs font-semibold truncate text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="truncate whitespace-nowrap">
                  {hasPatient ? patientName : 'Identificar paciente'}
                </span>
                {hasPatient && patientWeight > 0 && (
                  <span className="text-sky-700 dark:text-sky-300 font-bold shrink-0 clinical-tabular-nums">
                    • {patientWeight.toLocaleString('pt-BR')} kg
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side: CRM Status, Atalhos & Alternador de Tema */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {onOpenCommandPalette && (
            <button
              id="btn-open-command-palette"
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Busca rápida e navegação global (Ctrl+K)"
              title="Busca rápida de medicamentos, kits, protocolos e guias SUS (Ctrl+K)"
              className="w-10 h-10 xl:w-auto xl:px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] dark:bg-[#1E293B] text-[var(--text-main)] border border-[var(--border-subtle)] dark:border-white/10 hover:bg-[var(--surface-hover)]"
            >
              <Icon name="search" size={16} className="text-sky-600 dark:text-sky-400" />
              <span className="hidden xl:inline text-[11px] font-bold text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 clinical-tabular-nums">
                Ctrl+K
              </span>
            </button>
          )}

          {onOpenDoctorModal && (
            <button
              id="header-doctor-chip"
              type="button"
              onClick={onOpenDoctorModal}
              className="hidden md:flex items-center gap-1.5 px-2.5 h-10 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] dark:bg-[#1E293B] border-[var(--border-subtle)] dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-[var(--surface-hover)] hover:text-slate-900 dark:hover:text-white"
              title={
                isDoctorReady
                  ? `Médico emitente: ${doctor?.name} (CRM ${doctor?.crm}/${doctor?.crmState}) — clique para editar`
                  : 'Configurar nome e CRM do médico emitente'
              }
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isDoctorReady ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="truncate max-w-[115px] xl:max-w-[130px] clinical-tabular-nums">
                {isDoctorReady ? `CRM ${doctor?.crm}/${doctor?.crmState || 'UF'}` : 'Configurar CRM'}
              </span>
            </button>
          )}

          {onNavigateToEditor && !onSelectTab && (
            <button
              type="button"
              onClick={onNavigateToEditor}
              className="hidden md:flex items-center gap-1.5 px-2.5 h-10 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
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
              className="flex items-center justify-center gap-1.5 w-10 sm:w-auto sm:px-2.5 h-10 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none shrink-0"
              title="Instalar PresCMed como aplicativo offline"
              aria-label="Instalar Aplicativo PresCMed"
            >
              <Icon name="download" size={16} className="text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-theme"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
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

