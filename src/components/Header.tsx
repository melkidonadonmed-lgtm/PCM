import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { ActiveTab, DoctorProfile, Patient } from '../types';
import { medicoConfigurado } from '../utils/medicoConfigurado';
import { cloudAuthService, type DoctorUserProfile } from '../services/cloud/cloudAuthService';
import { cloudSyncManager, type SyncStatus } from '../services/cloud/cloudSyncManager';

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
          <span className="font-semibold text-[11px] max-w-[85px] sm:max-w-[110px] truncate hidden sm:inline">
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
      className="flex items-center gap-1.5 px-2.5 sm:px-3 min-h-[38px] rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
      title="Conectar Conta Google para sincronização em nuvem (opcional)"
      aria-label="Conectar Nuvem"
    >
      <Icon name="cloud" size={16} className={`text-sky-600 dark:text-sky-400 ${loading ? 'animate-pulse' : ''}`} />
      <span className="hidden 2xl:inline text-[11px] font-semibold">
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
  onInstallApp
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
      shortcut: 'Alt+3'
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
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors no-print isolate bg-[var(--surface-card)] border-[var(--border-subtle)]"
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
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition cursor-pointer shadow-tactile-sm active:scale-95 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"
          >
            <Icon name="menu" size={20} />
          </button>

          {/* Brand Emblem + Name / Botão Início */}
          <button
            type="button"
            aria-label="Início"
            onClick={onGoHome}
            className="flex items-center gap-2 sm:gap-2.5 pr-1 sm:pr-2 rounded-xl transition cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none group"
            title="Voltar ao início (Receitas)"
          >
            <span
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 border shadow-tactile-sm transition group-hover:brightness-110"
              style={{
                backgroundColor: 'var(--nav-bg, #0F172A)',
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.15)'
              }}
            >
              <img 
                src="/logo.png" 
                alt="" 
                className="w-7 h-7 object-contain rounded-lg select-none" 
              />
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                PresC<span className="text-blue-600 dark:text-blue-400 font-black">Med</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold tracking-wider bg-blue-600/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300 border border-blue-600/20 dark:border-blue-400/25">
                PRO
              </span>
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
                ? (activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams')
                : activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${tab.label} (${tab.shortcut})`}
                  className={`px-2 xl:px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                    isActive
                      ? 'bg-[var(--surface-card)] text-[var(--text-main)] font-bold shadow-tactile-sm border border-[var(--border-subtle)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] border border-transparent'
                  }`}
                >
                  <Icon
                    name={tab.icon}
                    size={16}
                    className={isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-75'}
                  />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-blue-600 text-white'
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
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition cursor-pointer group w-full max-w-[220px] sm:max-w-[260px] xl:max-w-[280px] min-h-[38px] min-w-0 shadow-tactile-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
              hasPatient 
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-200' 
                : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--surface-hover)]'
            }`}
            title="Clique para identificar o paciente, peso e histórico clínico"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
              hasPatient 
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              <Icon name={hasPatient ? 'person' : 'person_add'} size={15} />
            </div>
            <div className="text-left overflow-hidden min-w-0 flex-1">
              <div className="text-[11px] sm:text-xs font-bold truncate text-slate-900 dark:text-white flex items-center justify-between gap-1">
                <span className="truncate">
                  {hasPatient ? patientName : 'Identificar paciente'}
                </span>
                <Icon name="chevron_right" size={14} className="group-hover:translate-x-0.5 transition-transform opacity-60 flex-shrink-0 text-[var(--text-muted)]" />
              </div>
              {hasPatient && (patientWeight > 0 || patient?.ageText) && (
                <div className="text-[10px] font-semibold flex items-center gap-1.5 truncate">
                  {patientWeight > 0 && (
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-0.5">
                      <Icon name="scale" size={11} className="inline-block" />
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

        {/* Right side: CRM Status, Atalhos & Alternador de Tema */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {onOpenDoctorModal && (
            <button
              id="header-doctor-chip"
              type="button"
              onClick={onOpenDoctorModal}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                isDoctorReady
                  ? 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/15'
              }`}
              title={
                isDoctorReady
                  ? `Médico emitente: ${doctor?.name} (CRM ${doctor?.crm}/${doctor?.crmState}) — clique para editar`
                  : 'Configurar nome e CRM do médico emitente'
              }
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isDoctorReady ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="truncate max-w-[115px] xl:max-w-[130px]">
                {isDoctorReady ? `CRM ${doctor?.crm}/${doctor?.crmState || 'UF'}` : 'Configurar CRM'}
              </span>
            </button>
          )}

          {onNavigateToEditor && !onSelectTab && (
            <button
              type="button"
              onClick={onNavigateToEditor}
              className="hidden md:flex items-center gap-1.5 px-2.5 min-h-[38px] rounded-xl border text-xs font-semibold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-[var(--surface-hover)] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
              title="Abrir Editor Livre de Documentos A4"
            >
              <Icon name="editor" size={16} className="text-sky-600 dark:text-sky-400" />
              <span>Editor</span>
            </button>
          )}

          <CloudAuthButton />

          {isInstallable && onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="hidden lg:flex items-center gap-1.5 px-2.5 min-h-[38px] rounded-xl border text-xs font-bold transition cursor-pointer shadow-tactile-sm active:scale-95 bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
              title="Instalar PresCMed como aplicativo offline"
              aria-label="Instalar Aplicativo PresCMed"
            >
              <Icon name="download" size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden 2xl:inline">Instalar</span>
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
              <Icon name="light_mode" size={20} className="text-amber-400" />
            ) : (
              <Icon name="dark_mode" size={20} className="text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

