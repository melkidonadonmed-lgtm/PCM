import React from 'react';
import { ActiveTab } from '../types';
import { CLINICAL_KITS, ClinicalKit } from '../data/clinicalKits';
import { Icon, IconName } from './Icon';
import { storageService } from '../services/storageService';

export interface SidebarNavItem {
  id: ActiveTab;
  label: string;
  fullLabel?: string;
  shortLabel: string;
  iconName: IconName;
  shortcut?: string;
  badge?: string;
}

export function buildSidebarNavGroups(
  prescriptionCount: number,
  selectedExamsCount: number,
  patientWeight: number
): {
  coreHubNavItems: SidebarNavItem[];
  clinicalToolsNavItems: SidebarNavItem[];
} {
  return {
    coreHubNavItems: [
      {
        id: 'prescription',
        label: 'Prescrever',
        fullLabel: 'Prescrição Médica',
        shortLabel: 'Prescrever',
        iconName: 'receita',
        shortcut: 'Alt+1',
        badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined,
      },
      {
        id: 'documents',
        label: 'Documentos',
        fullLabel: 'Central de Documentos (Atestados, Encaminhamentos e Exames)',
        shortLabel: 'Documentos',
        iconName: 'documentos',
        shortcut: 'Alt+2',
        badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined,
      },
      {
        id: 'sus',
        label: 'APAC',
        fullLabel: 'Guias Oficiais SUS (APAC, LME, SISREG, GAL/LACEN, SISCAN, TRM-TB)',
        shortLabel: 'APAC',
        iconName: 'sus',
        shortcut: 'Alt+6',
      },
      {
        id: 'editor',
        label: 'Editor A4',
        fullLabel: 'Editor de Prescrições e Laudos A4',
        shortLabel: 'Editor',
        iconName: 'editor',
        shortcut: 'Alt+5',
      },
    ],
    clinicalToolsNavItems: [
      {
        id: 'pediatric_calc',
        label: 'Pediatria',
        fullLabel: 'Calculadora Pediátrica por Peso (mg/kg)',
        shortLabel: 'Pediatria',
        iconName: 'calculate',
        shortcut: 'Alt+3',
        badge: patientWeight > 0 ? `${patientWeight}kg` : undefined,
      },
      {
        id: 'protocols',
        label: 'Protocolos',
        fullLabel: 'Protocolos Clínicos e Condutas',
        shortLabel: 'Protocolos',
        iconName: 'coracao',
        shortcut: 'Alt+4',
      },
      {
        id: 'scores',
        label: 'Scores',
        fullLabel: 'Escores Clínicos, Radar Fisiológico, BIC, EPARADA & Rastreio INCA',
        shortLabel: 'Scores',
        iconName: 'monitor_heart',
        shortcut: 'Alt+8',
      },
      {
        id: 'hospital',
        label: 'Hospitalar',
        fullLabel: 'Módulo Hospitalar e Gestão de Pacientes (EF/LT, Evolução, Exames e Science)',
        shortLabel: 'Hospitalar',
        iconName: 'local_hospital',
        shortcut: 'Alt+7',
      },
    ],
  };
}

export interface SidebarKitsGroupSectionProps {
  isOpen: boolean;
  showKits: boolean;
  onToggleKits: () => void;
  onExpandAndShowKits: () => void;
  onApplyKit: (kit: ClinicalKit) => void;
}

export const SidebarKitsGroupSection: React.FC<SidebarKitsGroupSectionProps> = ({
  isOpen,
  showKits,
  onToggleKits,
  onExpandAndShowKits,
  onApplyKit,
}) => {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          onExpandAndShowKits();
          storageService.saveRawString('prescmed_show_kits', 'true');
        }}
        className="sidebar-nav-item w-11 h-11 min-w-[44px] min-h-[44px] mx-auto flex items-center justify-center cursor-pointer group active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative"
        aria-label="Kits de plantão"
      >
        <Icon
          name="medication"
          size={20}
          className="transition-transform duration-150 group-hover:scale-105 text-[var(--sidebar-text-secondary)] group-hover:text-[var(--sidebar-text-primary)]"
        />
        <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
          Kits de plantão
        </span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggleKits}
        aria-expanded={showKits}
        aria-controls="sidebar-kits-list"
        className="sidebar-nav-item w-full min-h-[44px] py-1.5 pl-3 pr-2.5 text-[13px] tracking-[-0.01em] font-medium flex items-center justify-between active:translate-y-px cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            name="medication"
            size={18}
            opticalSize={20}
            className="text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)] transition-colors duration-150 shrink-0"
          />
          <span className="truncate">Kits de plantão ({CLINICAL_KITS.length})</span>
        </div>
        <Icon
          name={showKits ? 'expand_less' : 'expand_more'}
          size={16}
          className="text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)] transition-colors duration-150 shrink-0"
        />
      </button>

      {showKits && (
        <div id="sidebar-kits-list" className="space-y-1 pt-1 pl-1 pr-0.5">
          {CLINICAL_KITS.map((kit) => (
            <button
              key={kit.id}
              type="button"
              onClick={() => onApplyKit(kit)}
              className="w-full min-h-[44px] text-left px-2.5 py-2 rounded-[10px] border border-[oklch(1_0_0/0.08)] bg-[var(--sidebar-chip-bg)] hover:bg-[var(--sidebar-chip-hover)] hover:border-white/15 active:translate-y-px transition-colors duration-150 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-white/40 flex items-center"
              title={`Aplicar kit: ${kit.name} (${kit.badge})`}
            >
              <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
                <span className="text-xs font-medium text-[var(--sidebar-text-secondary)] group-hover:text-[var(--sidebar-text-primary)] truncate">
                  {kit.name}
                </span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[6px] bg-white/10 text-[var(--sidebar-text-secondary)] shrink-0 clinical-tabular-nums">
                  {kit.badge}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface SidebarPinnedFooterSectionProps {
  isOpen: boolean;
  isDesktop: boolean;
  isInstallable: boolean;
  onInstallApp?: () => void;
  onClose?: () => void;
  onToggleOpen: () => void;
  onTriggerResetAll: () => void;
  onOpenBackupModal?: () => void;
  onOpenBackup: () => void;
  onOpenLgpdModal?: () => void;
  onOpenLgpd: () => void;
}

export const SidebarPinnedFooterSection: React.FC<SidebarPinnedFooterSectionProps> = ({
  isOpen,
  isDesktop,
  isInstallable,
  onInstallApp,
  onClose,
  onToggleOpen,
  onTriggerResetAll,
  onOpenBackupModal,
  onOpenBackup,
  onOpenLgpdModal,
  onOpenLgpd,
}) => {
  return (
    <div
      className={`shrink-0 border-t border-white/[0.08] rounded-b-2xl overflow-hidden ${
        isOpen
          ? 'px-2 py-1.5 space-y-0.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:pb-1.5'
          : 'py-1.5 px-1.5 space-y-1 flex flex-col items-center'
      }`}
    >
      {isOpen ? (
        <>
          {/* Row 1: Primary session reset + Collapse sidebar */}
          <div className="flex items-center gap-0.5 w-full">
            <button
              type="button"
              onClick={onTriggerResetAll}
              className="flex-1 min-w-0 min-h-[44px] py-1 px-2.5 rounded-[10px] text-xs font-medium text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] active:translate-y-px transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40 whitespace-nowrap flex items-center gap-2 group"
              title="Iniciar uma nova consulta do zero"
            >
              <Icon
                name="refresh"
                size={16}
                className="text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)] group-hover:rotate-45 transition-transform duration-200 shrink-0"
              />
              <span className="truncate">Novo Atendimento</span>
            </button>

            <button
              type="button"
              onClick={onToggleOpen}
              className="hidden lg:flex w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] items-center justify-center transition-colors duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 outline-none shrink-0"
              title="Recolher menu lateral"
              aria-label="Recolher Menu"
            >
              <Icon name="chevron_left" size={16} />
            </button>
          </div>

          {/* Row 2: Quiet utilities (AAA contrast >= 7.8:1 via --sidebar-text-muted) */}
          <div className="flex items-center justify-between gap-0.5 pt-0.5 border-t border-white/[0.06] w-full min-w-0">
            {onOpenBackupModal && (
              <button
                type="button"
                onClick={onOpenBackup}
                aria-label="Backup (.pcm)"
                className="min-h-[44px] px-2 rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] active:translate-y-px transition-colors duration-150 cursor-pointer flex items-center gap-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-white/40 shrink-0"
                title="Exportar ou restaurar arquivo de backup (.pcm.json)"
              >
                <Icon name="cloud_download" size={14} className="shrink-0" />
                <span>Backup</span>
              </button>
            )}

            {onOpenLgpdModal && (
              <button
                id="btn-sidebar-lgpd-security"
                type="button"
                onClick={onOpenLgpd}
                className="min-h-[44px] min-w-[44px] px-2 rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] active:translate-y-px transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-white/40 shrink-0"
                title="Segurança, Seleção de Cookies e Conformidade LGPD"
                aria-label="Segurança, Seleção de Cookies e LGPD"
              >
                <Icon name="shield" size={14} className="shrink-0" />
                <span>LGPD</span>
              </button>
            )}

            {isInstallable && onInstallApp && (
              <button
                id="btn-sidebar-install-pwa"
                type="button"
                onClick={() => {
                  onInstallApp();
                  if (!isDesktop) onClose?.();
                }}
                className="min-h-[44px] min-w-[44px] px-2 rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] active:translate-y-px transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/40 shrink-0"
                title="Baixar e instalar PresCMed como aplicativo offline no celular ou computador"
                aria-label="Baixar / Instalar App"
              >
                <Icon name="download" size={14} className="shrink-0" />
                <span>App</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onTriggerResetAll}
            className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] flex items-center justify-center transition-colors duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group"
            aria-label="Novo Atendimento"
          >
            <Icon name="refresh" size={20} />
            <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
              Novo Atendimento
            </span>
          </button>

          {onOpenBackupModal && (
            <button
              type="button"
              onClick={onOpenBackup}
              className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] flex items-center justify-center transition-colors duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group"
              aria-label="Backup e Portabilidade"
            >
              <Icon name="cloud_download" size={20} />
              <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Backup (.pcm.json)
              </span>
            </button>
          )}

          {onOpenLgpdModal && (
            <button
              type="button"
              onClick={onOpenLgpd}
              className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] flex items-center justify-center transition-colors duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group"
              aria-label="Segurança, Cookies e LGPD"
            >
              <Icon name="shield" size={20} />
              <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Segurança, Cookies &amp; LGPD
              </span>
            </button>
          )}

          {isInstallable && onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] flex items-center justify-center transition-colors duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group"
              aria-label="Instalar App Offline"
            >
              <Icon name="download" size={20} />
              <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Instalar App Offline
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="hidden lg:flex w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-primary)] hover:bg-[var(--sidebar-chip-hover)] items-center justify-center transition-colors duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
            title="Expandir Menu Lateral"
            aria-label="Expandir Menu Lateral"
          >
            <Icon name="chevron_right" size={20} />
          </button>
        </>
      )}
    </div>
  );
};
