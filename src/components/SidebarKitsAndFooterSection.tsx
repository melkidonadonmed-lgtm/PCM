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
        label: 'Receitas Médicas',
        shortLabel: 'Receitas',
        iconName: 'receita',
        shortcut: 'Alt+1',
        badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined,
      },
      {
        id: 'documents',
        label: 'Central de Documentos',
        fullLabel: 'Central de Documentos (Atestados, Encaminhamentos e Exames)',
        shortLabel: 'Documentos',
        iconName: 'documentos',
        shortcut: 'Alt+2',
        badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined,
      },
      {
        id: 'sus',
        label: 'Guias Oficiais SUS',
        fullLabel: 'Guias Oficiais SUS (APAC, LME, SISREG, GAL/LACEN, SISCAN, TRM-TB)',
        shortLabel: 'Guias SUS',
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
        label: 'Calculadora Ped.',
        fullLabel: 'Calculadora Pediátrica por Peso (mg/kg)',
        shortLabel: 'Doses',
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
        fullLabel: 'Escores Clínicos, Radar 60fps, BIC, EPARADA & Rastreio INCA',
        shortLabel: 'Scores',
        iconName: 'monitor_heart',
        shortcut: 'Alt+8',
        badge: '114',
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
        className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center transition duration-200 cursor-pointer group hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative text-slate-300 bg-white/[0.02] hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15"
        aria-label="Kits de plantão"
      >
        <Icon
          name="medication"
          size={20}
          className="transition-transform duration-200 group-hover:scale-110 text-slate-300 group-hover:text-white"
        />
        <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
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
        className="w-full h-9 px-2.5 rounded-xl text-[13px] tracking-[-0.01em] font-medium text-[var(--sidebar-text-secondary,#E2E8F0)] border border-transparent flex items-center justify-between hover:text-white hover:bg-white/[0.07] hover:border-white/10 active:translate-y-px transition-colors duration-150 ease-out cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.10] group-hover:border-white/15 transition-colors duration-150 flex items-center justify-center shrink-0">
            <Icon name="medication" size={15} opticalSize={20} className="text-slate-300 group-hover:text-white" />
          </span>
          <span className="truncate">Kits de plantão ({CLINICAL_KITS.length})</span>
        </div>
        <Icon
          name={showKits ? 'expand_less' : 'expand_more'}
          size={16}
          className="text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0"
        />
      </button>

      {showKits && (
        <div id="sidebar-kits-list" className="space-y-1 pt-1 pl-1 pr-0.5">
          {CLINICAL_KITS.map((kit) => (
            <button
              key={kit.id}
              type="button"
              onClick={() => onApplyKit(kit)}
              className="w-full text-left px-2.5 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 active:translate-y-px transition-colors duration-150 cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              title={`Aplicar kit: ${kit.name} (${kit.badge})`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                  {kit.name}
                </span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0 clinical-tabular-nums">
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
      className={`shrink-0 border-t border-white/10 bg-black/15 rounded-b-2xl overflow-hidden ${
        isOpen
          ? 'p-2 space-y-1.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] lg:pb-2'
          : 'py-2.5 px-1.5 space-y-2 flex flex-col items-center'
      }`}
    >
      {isOpen ? (
        <>
          {/* Botão dedicado de Download / Instalação do App no Celular ou PC */}
          {isInstallable && onInstallApp && (
            <button
              id="btn-sidebar-install-pwa"
              type="button"
              onClick={() => {
                onInstallApp();
                if (!isDesktop) onClose?.();
              }}
              className="w-full h-9 min-h-9 px-2.5 rounded-xl border border-sky-400/35 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30 hover:text-white hover:border-sky-400/50 active:translate-y-[1px] transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shadow-tactile-sm"
              title="Baixar e instalar PresCMed como aplicativo offline no celular ou computador"
            >
              <Icon name="download" size={15} className="text-sky-300 shrink-0" />
              <span className="truncate">Baixar / Instalar App</span>
            </button>
          )}

          {/* Novo Atendimento em linha única limpa */}
          <button
            type="button"
            onClick={onTriggerResetAll}
            className="w-full h-9 flex items-center justify-center gap-1.5 px-2.5 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] hover:border-white/20 active:translate-y-px border border-white/10 transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap group"
            title="Iniciar uma nova consulta do zero"
          >
            <Icon
              name="refresh"
              size={15}
              className="text-sky-300 group-hover:rotate-45 transition-transform duration-200 shrink-0"
            />
            <span className="truncate">Novo Atendimento</span>
          </button>

          {/* Utilitários secundários uniformes: Backup, LGPD e Recolher Menu */}
          <div className="flex items-center gap-1.5 w-full min-w-0">
            {onOpenBackupModal && (
              <button
                type="button"
                onClick={onOpenBackup}
                className="flex-1 min-w-0 h-8 px-1 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.10] hover:border-white/20 active:translate-y-px transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1 text-[11px] tracking-tight font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                title="Exportar ou restaurar arquivo de backup (.pcm.json)"
              >
                <Icon name="cloud_download" size={13} className="text-slate-300 shrink-0" />
                <span className="truncate">Backup (.pcm)</span>
              </button>
            )}

            {onOpenLgpdModal && (
              <button
                id="btn-sidebar-lgpd-security"
                type="button"
                onClick={onOpenLgpd}
                className="h-8 px-2 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.10] hover:border-white/20 active:translate-y-px transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1 text-[11px] tracking-tight font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-400 shrink-0"
                title="Segurança, Seleção de Cookies e Conformidade LGPD"
                aria-label="Segurança, Seleção de Cookies e LGPD"
              >
                <Icon name="shield" size={13} className="text-emerald-400 shrink-0" />
                <span>LGPD</span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleOpen}
              className="hidden lg:flex w-8 h-8 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.10] hover:border-white/20 items-center justify-center transition duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none shrink-0"
              title="Recolher menu lateral"
              aria-label="Recolher Menu"
            >
              <Icon name="chevron_left" size={15} />
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onTriggerResetAll}
            className="w-11 h-11 mx-auto rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
            aria-label="Novo Atendimento"
          >
            <Icon name="refresh" size={20} />
            <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
              Novo Atendimento
            </span>
          </button>

          {onOpenBackupModal && (
            <button
              type="button"
              onClick={onOpenBackup}
              className="w-11 h-11 mx-auto rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
              aria-label="Backup e Portabilidade"
            >
              <Icon name="cloud_download" size={20} />
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Backup (.pcm.json)
              </span>
            </button>
          )}

          {onOpenLgpdModal && (
            <button
              type="button"
              onClick={onOpenLgpd}
              className="w-11 h-11 mx-auto rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
              aria-label="Segurança, Cookies e LGPD"
            >
              <Icon name="shield" size={20} className="text-emerald-400" />
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Segurança, Cookies &amp; LGPD
              </span>
            </button>
          )}

          {isInstallable && onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="w-11 h-11 mx-auto rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
              aria-label="Instalar App Offline"
            >
              <Icon name="download" size={20} />
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Instalar App Offline
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOpen}
            className="hidden lg:flex w-11 h-10 mx-auto rounded-xl text-slate-300 hover:text-white hover:bg-white/10 items-center justify-center transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none"
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
