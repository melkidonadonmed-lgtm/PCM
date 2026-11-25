import React, { useState, useEffect } from 'react';
import { ActiveTab, DoctorProfile, Patient, WorkContext } from '../types';
import type { DocumentsSubTab } from './ClinicalDocumentsHub';
import { ClinicalKit } from '../data/clinicalKits';
import { ConfirmationModal } from './ConfirmationModal';
import { ContextSwitcher } from './ContextSwitcher';
import { Icon } from './Icon';
import { storageService } from '../services/storageService';
import {
  SidebarNavItem,
  buildSidebarNavGroups,
  SidebarKitsGroupSection,
  SidebarPinnedFooterSection,
} from './SidebarKitsAndFooterSection';

/**
 * Deep Navy Clinical Sidebar and On-Call Clinical Kits.
 * Covered UI states: empty (no kit expanded), loading (applying kit),
 * success (kit applied), and error (destructive reset confirmation gate).
 */
interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  activeTab: ActiveTab;
  documentsSubTab?: DocumentsSubTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose?: () => void;
  doctor?: DoctorProfile;
  patient?: Patient;
  prescriptionCount?: number;
  selectedExamsCount?: number;
  contexts?: WorkContext[];
  activeContext?: WorkContext | null;
  onSwitchContext?: (id: string) => void;
  onOpenDoctorModal?: () => void;
  onOpenPatientModal?: () => void;
  onOpenBackupModal?: () => void;
  onOpenLgpdModal?: () => void;
  isInstallable?: boolean;
  onInstallApp?: () => void;
  onClearPrescription?: () => void;
  onClearPatient?: () => void;
  onResetAll?: () => void;
  onAplicarKit?: (kit: ClinicalKit) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  darkMode,
  activeTab,
  documentsSubTab,
  onSelectTab,
  isOpen,
  onToggleOpen,
  onClose,
  doctor,
  patient,
  prescriptionCount = 0,
  selectedExamsCount = 0,
  contexts = [],
  activeContext = null,
  onSwitchContext,
  onOpenDoctorModal,
  onOpenPatientModal,
  onOpenBackupModal,
  onOpenLgpdModal,
  isInstallable = false,
  onInstallApp,
  onClearPrescription,
  onClearPatient,
  onResetAll,
  onAplicarKit
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasDoctor = Boolean(doctor?.name?.trim());
  const hasPatient = Boolean(patient?.name?.trim());
  const patientName = patient?.name?.trim() || '';

  // Estado de recolhimento dos Kits de Plantão (salvo no localStorage, padrão recolhido)
  const [showKits, setShowKits] = useState<boolean>(
    () => storageService.loadRawString('prescmed_show_kits') === 'true'
  );

  const handleToggleKits = () => {
    setShowKits(prev => {
      const next = !prev;
      storageService.saveRawString('prescmed_show_kits', String(next));
      return next;
    });
  };

  // Detecção de breakpoint desktop (>= 1024px) via matchMedia
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const onMediaChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', onMediaChange);
    return () => mediaQuery.removeEventListener('change', onMediaChange);
  }, []);

  // Fechamento pelo teclado (Escape) no modo mobile
  useEffect(() => {
    if (!isOpen || isDesktop) return;
    const onEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onEscapeKey);
    return () => window.removeEventListener('keydown', onEscapeKey);
  }, [isOpen, isDesktop, onClose]);

  // Estado do Modal de Confirmação HITL para Ações Destrutivas
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'danger' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmar',
    variant: 'danger',
    onConfirm: () => {}
  });

  const handleTriggerResetAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Iniciar Novo Atendimento Completo?',
      description: 'Esta ação limpará todas as receitas, os exames selecionados e os dados cadastrais do paciente atual para iniciar uma nova consulta do zero.',
      confirmLabel: 'Iniciar Novo Atendimento',
      variant: 'warning',
      onConfirm: () => {
        onResetAll?.();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Grupos 1 e 2: Atendimento Clínico Principal e Módulo de Apoio Clínico
  const { coreHubNavItems, clinicalToolsNavItems } = buildSidebarNavGroups(
    prescriptionCount,
    selectedExamsCount,
    patientWeight
  );

  const runMobileAwareAction = (action?: () => void) => {
    action?.();
    if (!isDesktop) {
      onClose?.();
    }
  };

  const handleNavClick = (tabId: ActiveTab) => runMobileAwareAction(() => onSelectTab(tabId));
  const handleOpenDoctor = () => runMobileAwareAction(onOpenDoctorModal);
  const handleOpenPatient = () => runMobileAwareAction(onOpenPatientModal);
  const handleOpenBackup = () => runMobileAwareAction(onOpenBackupModal);
  const handleOpenLgpd = () => runMobileAwareAction(onOpenLgpdModal);

  const renderNavButton = (item: SidebarNavItem) => {
    const isSusActive =
      activeTab === 'sus' || (activeTab === 'documents' && documentsSubTab === 'sus');
    const isActive =
      item.id === 'documents'
        ? (activeTab === 'documents' && documentsSubTab !== 'sus') ||
          activeTab === 'certificate' ||
          activeTab === 'referral' ||
          activeTab === 'exams'
        : item.id === 'sus'
          ? isSusActive
          : activeTab === item.id;

    if (!isOpen) {
      return (
        <button
          key={item.id}
          id={`nav-btn-${item.id}`}
          type="button"
          onClick={() => handleNavClick(item.id)}
          aria-current={isActive ? 'page' : undefined}
          aria-label={item.fullLabel || item.label}
          className={`sidebar-nav-item w-11 h-11 min-w-[44px] min-h-[44px] mx-auto flex items-center justify-center cursor-pointer group active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 outline-none ${
            isActive ? 'font-bold' : ''
          }`}
        >
          {isActive && <span aria-hidden="true" className="sidebar-active-bar" />}
          <Icon
            name={item.iconName}
            size={20}
            filled={isActive}
            className={`transition-transform duration-150 group-hover:scale-105 ${
              isActive
                ? 'text-[var(--sidebar-text-primary)]'
                : 'text-[var(--sidebar-text-secondary)] group-hover:text-[var(--sidebar-text-primary)]'
            }`}
          />
          {item.badge && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-[var(--clinical)] text-white text-[11px] font-bold flex items-center justify-center border border-white/20 clinical-unit clinical-tabular-nums">
              {item.badge}
            </span>
          )}
          <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50 flex items-center gap-2">
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="kbd-shortcut-chip bg-white/10 text-[var(--sidebar-text-secondary)] font-semibold">
                {item.shortcut}
              </span>
            )}
          </span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        id={`nav-btn-${item.id}`}
        type="button"
        onClick={() => handleNavClick(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`sidebar-nav-item w-full min-h-[44px] py-1.5 pl-3 pr-2.5 flex items-center justify-between text-[13px] tracking-[-0.01em] cursor-pointer group active:translate-y-px focus-visible:ring-2 focus-visible:ring-white/40 outline-none ${
          isActive ? 'font-semibold' : 'font-medium'
        }`}
        title={item.shortcut ? `${item.fullLabel || item.label} (${item.shortcut})` : (item.fullLabel || item.label)}
      >
        {isActive && <span aria-hidden="true" className="sidebar-active-bar" />}
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            name={item.iconName}
            size={18}
            opticalSize={20}
            filled={isActive}
            className={`shrink-0 transition-colors duration-150 ${
              isActive
                ? 'text-[var(--sidebar-text-primary)]'
                : 'text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)]'
            }`}
          />
          <span className="truncate">
            {item.label}
          </span>
        </div>
        {item.badge ? (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-[6px] flex-shrink-0 ml-1 clinical-unit clinical-tabular-nums ${
              isActive
                ? 'bg-white/[0.14] text-[var(--sidebar-text-primary)] border border-white/[0.14]'
                : 'bg-white/[0.08] text-[var(--sidebar-text-secondary)]'
            }`}
          >
            {item.badge}
          </span>
        ) : item.shortcut ? (
          <span
            aria-hidden="true"
            className="kbd-shortcut-chip flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 bg-white/[0.08] text-[var(--sidebar-text-secondary)] font-semibold"
          >
            {item.shortcut}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <>
      {/* Overlay Backdrop on Mobile */}
      <div
        onClick={onClose || onToggleOpen}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-[oklch(0.14_0.02_258/0.70)] lg:hidden transition-opacity duration-300 cursor-pointer ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        id="prescmed-sidebar"
        data-state="idle"
        aria-busy={false}
        aria-label="Menu clínico"
        aria-hidden={!isOpen && !isDesktop}
        inert={!isOpen && !isDesktop ? true : undefined}
        className={`panel-navy fixed top-0 left-0 h-dvh z-[60] w-72 sm:w-80 max-w-[85vw] flex flex-col flex-shrink-0 no-print rounded-r-2xl transform will-change-transform lg:will-change-auto max-lg:transition-transform max-lg:duration-250 max-lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:transition-none border border-white/10 dark:border-white/[0.15] ${
          isOpen ? 'translate-x-0 shadow-tactile-navy lg:shadow-tactile-sm' : '-translate-x-full pointer-events-none shadow-none lg:shadow-tactile-sm'
        } lg:pointer-events-auto lg:sticky lg:top-[4.25rem] lg:h-[calc(100dvh-4.75rem)] lg:translate-x-0 lg:z-40 lg:rounded-2xl ${
          isOpen
            ? 'lg:w-64'
            : 'lg:w-16 overflow-visible'
        }`}
      >
        {/* Fixed Top Section: Context Switcher (SUS), Doctor, and Patient Identity */}
        <div
          id="sidebar-top-fixed"
          className={`shrink-0 border-b border-white/[0.08] ${
            isOpen
              ? 'p-2 pb-1.5 space-y-1'
              : 'pt-2 pb-1.5 px-1.5 space-y-1.5 flex flex-col items-center overflow-visible'
          }`}
        >
          {/* Mobile Drawer Close Header / Collapsed Desktop Expand Trigger */}
          {isOpen ? (
            <div className="flex items-center justify-between px-1 pt-0.5 lg:hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon name="layers" size={14} className="text-[var(--sidebar-text-muted)] shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-text-secondary)] truncate">
                  Menu
                </span>
              </div>
              <button
                type="button"
                onClick={onClose || onToggleOpen}
                aria-label="Fechar menu lateral"
                title="Fechar menu lateral"
                className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] rounded-[10px] border border-[oklch(1_0_0/0.12)] bg-[var(--sidebar-chip-bg)] hover:bg-[var(--sidebar-chip-hover)] flex items-center justify-center text-[var(--sidebar-text-secondary)] hover:text-[var(--sidebar-text-primary)] cursor-pointer active:translate-y-px focus-visible:ring-2 focus-visible:ring-white/40 outline-none transition-colors duration-150 shrink-0"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleOpen}
              aria-label="Abrir Janela de Navegação"
              className="hidden lg:flex w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] bg-[var(--sidebar-chip-bg)] hover:bg-[var(--sidebar-chip-hover)] border border-[oklch(1_0_0/0.12)] text-[var(--sidebar-text-secondary)] hover:text-[var(--sidebar-text-primary)] items-center justify-center transition-colors duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group"
            >
              <Icon name="menu_open" size={20} className="rotate-180" />
              <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Expandir Navegação Clínica
              </span>
            </button>
          )}

          {/* Context Switcher (SUS Multi-Institution) */}
          {contexts && contexts.length > 0 && activeContext && onSwitchContext && (
            <ContextSwitcher
              contexts={contexts}
              activeContext={activeContext}
              onSwitchContext={onSwitchContext}
              collapsed={!isOpen}
            />
          )}

          {/* Doctor Profile Identity Button */}
          {isOpen ? (
            <button
              id="sidebar-doctor-chip"
              type="button"
              onClick={handleOpenDoctor}
              className="w-full text-left min-h-[44px] py-1.5 px-2.5 rounded-[10px] border border-[oklch(1_0_0/0.12)] bg-[var(--sidebar-chip-bg)] hover:bg-[var(--sidebar-chip-hover)] active:translate-y-px transition-colors duration-150 cursor-pointer group focus-visible:ring-2 focus-visible:ring-white/40 outline-none flex items-center justify-between gap-2"
              title={
                hasDoctor
                  ? `${doctor?.name} — CRM ${doctor?.crm}/${doctor?.crmState || 'SP'}${doctor?.rqe ? ' • RQE ' + doctor.rqe : ''}`
                  : 'Configurar médico e CRM'
              }
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Icon
                  name="badge"
                  size={18}
                  className="text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)] transition-colors duration-150 shrink-0"
                />
                <span className="text-[13px] font-semibold tracking-[-0.01em] truncate text-[var(--sidebar-text-primary)]">
                  {hasDoctor ? doctor?.name : 'Configurar médico'}
                </span>
              </div>
              {hasDoctor && doctor?.crm ? (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-[6px] bg-white/[0.08] text-[var(--sidebar-text-secondary)] shrink-0 clinical-unit clinical-tabular-nums">
                  {doctor.crm}/{doctor.crmState || 'SP'}
                </span>
              ) : (
                <Icon
                  name="edit"
                  size={14}
                  className="text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)] transition-colors duration-150 shrink-0"
                />
              )}
            </button>
          ) : (
            <button
              id="sidebar-doctor-chip"
              type="button"
              onClick={handleOpenDoctor}
              className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] bg-[var(--sidebar-chip-bg)] text-[var(--sidebar-text-secondary)] border border-[oklch(1_0_0/0.12)] hover:bg-[var(--sidebar-chip-hover)] hover:text-[var(--sidebar-text-primary)] font-bold text-xs flex items-center justify-center transition-colors duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group"
              aria-label="Perfil do Médico"
            >
              <span>CRM</span>
              <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasDoctor ? `Dr(a). ${doctor?.name}` : 'Configurar médico'}
              </span>
            </button>
          )}

          {/* Patient Identification Button */}
          {isOpen ? (
            <button
              id="sidebar-patient-chip"
              type="button"
              onClick={handleOpenPatient}
              className={`w-full text-left min-h-[44px] py-1.5 px-2.5 rounded-[10px] border border-[oklch(1_0_0/0.12)] transition-colors duration-150 active:translate-y-px cursor-pointer group focus-visible:ring-2 focus-visible:ring-white/40 outline-none flex items-center justify-between gap-2 ${
                hasPatient
                  ? 'bg-white/[0.08] hover:bg-white/[0.12]'
                  : 'bg-[var(--sidebar-chip-bg)] hover:bg-[var(--sidebar-chip-hover)]'
              }`}
              title={
                hasPatient
                  ? `${patientName}${patientWeight > 0 ? ` • ${patientWeight.toLocaleString('pt-BR')} kg` : ''}`
                  : 'Identificar paciente'
              }
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Icon
                  name={hasPatient ? 'person' : 'person_add'}
                  size={18}
                  filled={hasPatient}
                  className={`shrink-0 transition-colors duration-150 ${
                    hasPatient
                      ? 'text-[oklch(0.840_0.110_180)]'
                      : 'text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)]'
                  }`}
                />
                <span className="text-[13px] font-semibold tracking-[-0.01em] truncate text-[var(--sidebar-text-primary)]">
                  {hasPatient ? patientName : 'Identificar paciente'}
                </span>
              </div>
              {hasPatient && patientWeight > 0 ? (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-[6px] bg-white/[0.12] text-[var(--sidebar-text-primary)] shrink-0 clinical-unit clinical-tabular-nums">
                  {patientWeight.toLocaleString('pt-BR')} kg
                </span>
              ) : (
                <Icon
                  name="edit"
                  size={14}
                  className="text-[var(--sidebar-text-muted)] group-hover:text-[var(--sidebar-text-primary)] transition-colors duration-150 shrink-0"
                />
              )}
            </button>
          ) : (
            <button
              id="sidebar-patient-chip"
              type="button"
              onClick={handleOpenPatient}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-[10px] border border-[oklch(1_0_0/0.12)] flex items-center justify-center transition-colors duration-150 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/40 outline-none relative group ${
                hasPatient
                  ? 'bg-white/[0.12] text-[var(--sidebar-text-primary)] hover:bg-white/[0.16]'
                  : 'bg-[var(--sidebar-chip-bg)] text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-chip-hover)] hover:text-[var(--sidebar-text-primary)]'
              }`}
              aria-label="Identificar paciente"
            >
              <Icon name={hasPatient ? 'person' : 'person_add'} size={20} filled={hasPatient} />
              {hasPatient && patientWeight > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-[var(--clinical)] text-white text-[11px] font-bold flex items-center justify-center border border-white/20 clinical-unit clinical-tabular-nums">
                  {patientWeight.toLocaleString('pt-BR')}kg
                </span>
              )}
              <span className="absolute left-[calc(100%+10px)] bg-[var(--sidebar-surface-elevated)] border border-white/15 text-[var(--sidebar-text-primary)] text-xs px-2.5 py-1.5 rounded-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasPatient
                  ? `${patientName}${patientWeight > 0 ? ` • ${patientWeight.toLocaleString('pt-BR')} kg` : ''}`
                  : 'Identificar paciente'}
              </span>
            </button>
          )}
        </div>

        {/* Grouped Navigation Area (overflow-visible when collapsed for floating tooltips) */}
        <div
          id="sidebar-nav-scroll"
          className={`flex-1 min-h-0 ${
            isOpen
              ? 'overflow-y-auto overscroll-contain custom-scrollbar px-2 py-1.5 space-y-1.5'
              : 'overflow-visible py-2 px-1.5 space-y-1.5 flex flex-col items-center'
          }`}
        >
          <nav
            aria-label="Módulos principais"
            className={isOpen ? 'w-full flex flex-col gap-0.5 relative' : 'w-full flex flex-col items-center gap-1 relative'}
          >
            {/* Group 1: Primary Clinical Care (4 items <= 6 per <nav>) */}
            <div role="group" aria-label="Atendimento" className="w-full">
              {isOpen && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sidebar-text-muted)] px-3 mb-0.5 leading-tight">
                  Atendimento
                </p>
              )}
              <div className={isOpen ? 'flex flex-col gap-0.5' : 'space-y-1 w-full flex flex-col items-center'}>
                {coreHubNavItems.map(renderNavButton)}
              </div>
            </div>
          </nav>

          {/* Group 2: Clinical Decision Support Tools (outside <nav> to keep <= 6 items per nav landmark) */}
          <div role="region" aria-label="Módulo de Apoio Clínico" className="w-full">
            {isOpen && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--sidebar-text-muted)] px-3 mb-0.5 leading-tight">
                Módulo de Apoio Clínico
              </p>
            )}
            <div className={isOpen ? 'flex flex-col gap-0.5' : 'space-y-1 w-full flex flex-col items-center'}>
              {clinicalToolsNavItems.map(renderNavButton)}
            </div>
          </div>

          {/* Group 3: On-Call Clinical Kits */}
          <div role="region" aria-label="Kits de Plantão" className="w-full">
            <SidebarKitsGroupSection
              isOpen={isOpen}
              showKits={showKits}
              onToggleKits={handleToggleKits}
              onExpandAndShowKits={() => {
                onToggleOpen();
                setShowKits(true);
              }}
              onApplyKit={(kit) => runMobileAwareAction(() => onAplicarKit?.(kit))}
            />
          </div>
        </div>

        {/* Pinned Footer: Ações da Consulta, Download do App, Backup e Recolher Menu */}
        <SidebarPinnedFooterSection
          isOpen={isOpen}
          isDesktop={isDesktop}
          isInstallable={isInstallable}
          onInstallApp={onInstallApp}
          onClose={onClose}
          onToggleOpen={onToggleOpen}
          onTriggerResetAll={handleTriggerResetAll}
          onOpenBackupModal={onOpenBackupModal}
          onOpenBackup={handleOpenBackup}
          onOpenLgpdModal={onOpenLgpdModal}
          onOpenLgpd={handleOpenLgpd}
        />
      </aside>

      {/* Modal de Confirmação Zero-Trust HITL */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        darkMode={darkMode}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

