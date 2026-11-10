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
 * Menu Lateral Deep Navy e Kits Clínicos de Plantão.
 * Estados de UI cobertos: empty (nenhum kit expandido), loading (carregando aplicação de kit),
 * success (kit aplicado com sucesso) e error (confirmação/alerta de limpeza).
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
          className={`w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl flex items-center justify-center transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative ${
            isActive
              ? 'nav-item-active sidebar-active-surface text-white font-bold'
              : 'text-slate-300 bg-white/[0.02] hover:bg-white/[0.10] hover:border-white/15 hover:text-white border border-transparent'
          }`}
        >
          {isActive && <span aria-hidden="true" className="sidebar-active-bar" />}
          <Icon
            name={item.iconName}
            size={20}
            filled={isActive}
            className={`transition-transform duration-200 group-hover:scale-110 ${
              isActive ? 'text-sky-300' : 'text-slate-300 group-hover:text-white'
            }`}
          />
          {item.badge && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-sky-700 text-white text-[11px] font-black flex items-center justify-center shadow-sm border border-white/20 clinical-unit clinical-tabular-nums">
              {item.badge}
            </span>
          )}
          <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50 flex items-center gap-2">
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="kbd-shortcut-chip bg-white/10 text-sky-300 font-bold">
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
        className={`relative w-full h-9 flex items-center justify-between px-2.5 rounded-xl text-[13px] tracking-[-0.01em] transition-colors duration-150 ease-out cursor-pointer group active:translate-y-px focus-visible:ring-2 focus-visible:ring-sky-400 outline-none ${
          isActive
            ? 'nav-item-active sidebar-active-surface text-[var(--sidebar-text-primary,#F8FAFC)] font-semibold'
            : 'text-[var(--sidebar-text-secondary,#E2E8F0)] hover:bg-white/[0.07] hover:border-white/10 hover:text-white font-medium border border-transparent'
        }`}
        title={item.shortcut ? `${item.fullLabel || item.label} (${item.shortcut})` : (item.fullLabel || item.label)}
      >
        {isActive && <span aria-hidden="true" className="sidebar-active-bar" />}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150 border ${
              isActive
                ? 'bg-sky-400/20 text-sky-300 border-sky-400/30 shadow-xs'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.06] group-hover:bg-white/[0.10] group-hover:border-white/15 group-hover:text-white'
            }`}
          >
            <Icon 
              name={item.iconName}
              size={15}
              opticalSize={20}
              filled={isActive}
              className={isActive ? 'text-sky-300' : 'text-slate-300 group-hover:text-white'} 
            />
          </span>
          <span className="truncate">
            {item.label}
          </span>
        </div>
        {item.badge ? (
          <span 
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1 clinical-unit clinical-tabular-nums ${
              isActive ? 'bg-sky-500/30 text-sky-100 border border-sky-400/30' : 'bg-white/10 text-slate-200'
            }`}
          >
            {item.badge}
          </span>
        ) : item.shortcut ? (
          <span
            aria-hidden="true"
            className={`kbd-shortcut-chip flex-shrink-0 ml-1 transition-colors ${
              isActive
                ? 'bg-sky-400/20 text-sky-200 font-bold'
                : 'text-[var(--sidebar-text-muted,#94A3B8)] group-hover:text-slate-200 bg-white/[0.04]'
            }`}
          >
            {item.shortcut}
          </span>
        ) : null}
      </button>
    );
  };

  const activeMacroModuleLabel =
    activeTab === 'hospital'
      ? 'MOD-03 Ativo'
      : activeTab === 'scores'
        ? 'MOD-02 Ativo'
        : 'MOD-01 Ativo';

  return (
    <>
      {/* Overlay Backdrop on Mobile */}
      <div 
        onClick={onClose || onToggleOpen}
        aria-hidden="true"
        className={`fixed inset-0 z-[55] bg-black/70 lg:hidden transition-opacity duration-300 cursor-pointer ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        id="prescmed-sidebar"
        data-state="idle"
        aria-busy={false}
        aria-label="Menu Lateral de Navegação"
        aria-hidden={!isOpen && !isDesktop}
        inert={!isOpen && !isDesktop ? true : undefined}
        className={`panel-navy fixed top-0 left-0 h-dvh z-[60] w-72 sm:w-80 max-w-[85vw] flex flex-col flex-shrink-0 no-print rounded-r-2xl transform will-change-transform lg:will-change-auto transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] border border-white/10 ${
          isOpen ? 'translate-x-0 shadow-tactile-navy' : '-translate-x-full pointer-events-none shadow-none lg:shadow-tactile-navy'
        } lg:pointer-events-auto lg:sticky lg:top-[4.25rem] lg:h-[calc(100dvh-4.75rem)] lg:translate-x-0 lg:z-40 lg:rounded-2xl ${
          isOpen
            ? 'lg:w-64'
            : 'lg:w-16 overflow-visible'
        }`}
        style={{
          backgroundColor: darkMode ? '#1E293B' : '#0F172A'
        }}
      >
        {/* TOPO FIXO SEM SCROLL: Cabeçalho, Posto de Trabalho (SUS), Médico e Paciente */}
        <div
          id="sidebar-top-fixed"
          className={`shrink-0 border-b border-white/10 ${
            isOpen
              ? 'p-2 pb-2 space-y-1.5'
              : 'pt-2.5 pb-2 px-1.5 space-y-2 flex flex-col items-center overflow-visible'
          }`}
        >
          {/* Header da Navegação Clínica (Mobile & Desktop Expandido) */}
          {isOpen ? (
            <div className="flex items-center justify-between px-1 pb-1 pt-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon name="layers" size={15} className="text-sky-400 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sidebar-text-secondary,#E2E8F0)] truncate">
                  Navegação
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded shrink-0 leading-none clinical-tabular-nums">
                  {activeMacroModuleLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose || onToggleOpen}
                aria-label="Fechar menu lateral"
                title={isDesktop ? 'Recolher menu lateral' : 'Fechar menu lateral'}
                className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.12] hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer active:translate-y-px focus-visible:ring-2 focus-visible:ring-sky-400 outline-none transition-colors duration-150 shrink-0"
              >
                <Icon name={isDesktop ? 'chevron_left' : 'close'} size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleOpen}
              aria-label="Abrir Janela de Navegação"
              className="hidden lg:flex w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 text-sky-300 items-center justify-center transition duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
            >
              <Icon name="menu_open" size={20} className="rotate-180" />
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Expandir Navegação Clínica
              </span>
            </button>
          )}

          {/* Context Switcher (SUS Multi-Instituição) — Prioridade 1 no Topo Fixo */}
          {contexts && contexts.length > 0 && activeContext && onSwitchContext && (
            <ContextSwitcher
              contexts={contexts}
              activeContext={activeContext}
              onSwitchContext={onSwitchContext}
              collapsed={!isOpen}
            />
          )}

          {/* Doctor Profile Chip de Linha Única — Sem legenda secundária poluente */}
          {isOpen ? (
            <div
              id="sidebar-doctor-chip"
              onClick={handleOpenDoctor}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDoctor();
                }
              }}
              role="button"
              tabIndex={0}
              className="h-9 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:translate-y-px transition-colors duration-150 cursor-pointer group shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-400 outline-none flex items-center justify-between gap-2 surface-inset"
              title={
                hasDoctor
                  ? `${doctor?.name} — CRM ${doctor?.crm}/${doctor?.crmState || 'SP'}${doctor?.rqe ? ' • RQE ' + doctor.rqe : ''}`
                  : 'Configurar médico e CRM'
              }
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-200 border border-sky-400/25 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-tactile-sm">
                  CRM
                </div>
                <span className="text-[13px] font-semibold tracking-[-0.01em] truncate text-[var(--sidebar-text-primary,#F8FAFC)]">
                  {hasDoctor ? doctor?.name : 'Configurar médico'}
                </span>
              </div>
              {hasDoctor && doctor?.crm ? (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.08] text-sky-200 border border-white/10 shrink-0 clinical-unit clinical-tabular-nums">
                  {doctor.crm}/{doctor.crmState || 'SP'}
                </span>
              ) : (
                <Icon name="edit" size={14} className="text-slate-400 group-hover:text-sky-300 transition-colors shrink-0" />
              )}
            </div>
          ) : (
            <button
              id="sidebar-doctor-chip"
              type="button"
              onClick={handleOpenDoctor}
              className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl bg-sky-500/15 text-sky-200 border border-sky-400/25 hover:bg-sky-500/25 font-bold text-xs flex items-center justify-center shadow-tactile-sm transition duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
              aria-label="Perfil do Médico"
            >
              <span>CRM</span>
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasDoctor ? `Dr(a). ${doctor?.name}` : 'Configurar médico'}
              </span>
            </button>
          )}

          {/* Patient Identification Chip de Linha Única — Sem legenda secundária poluente */}
          {isOpen ? (
            <div
              id="sidebar-patient-chip"
              onClick={handleOpenPatient}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenPatient();
                }
              }}
              role="button"
              tabIndex={0}
              className={`h-9 px-2.5 rounded-xl border transition-colors duration-150 active:translate-y-px cursor-pointer group shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-400 outline-none flex items-center justify-between gap-2 surface-inset ${
                hasPatient
                  ? 'border-sky-400/30 bg-sky-500/[0.10] hover:bg-sky-500/[0.16] hover:border-sky-400/45'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'
              }`}
              title={
                hasPatient
                  ? `${patientName}${patientWeight > 0 ? ` • ${patientWeight.toLocaleString('pt-BR')} kg` : ''}`
                  : 'Identificar paciente'
              }
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-tactile-sm border ${
                    hasPatient
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400/30'
                      : 'bg-white/10 text-slate-300 border-white/15'
                  }`}
                >
                  <Icon name={hasPatient ? 'person' : 'person_add'} size={15} filled={hasPatient} />
                </div>
                <span className="text-[13px] font-semibold tracking-[-0.01em] truncate text-[var(--sidebar-text-primary,#F8FAFC)]">
                  {hasPatient ? patientName : 'Identificar paciente'}
                </span>
              </div>
              {hasPatient && patientWeight > 0 ? (
                <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-500/25 text-sky-200 border border-sky-400/30 shrink-0 clinical-unit clinical-tabular-nums">
                  {patientWeight.toLocaleString('pt-BR')} kg
                </span>
              ) : (
                <Icon name="edit" size={14} className="text-slate-400 group-hover:text-sky-300 transition-colors shrink-0" />
              )}
            </div>
          ) : (
            <button
              id="sidebar-patient-chip"
              type="button"
              onClick={handleOpenPatient}
              className={`w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl border flex items-center justify-center shadow-tactile-sm transition duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group ${
                hasPatient
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/30 hover:bg-sky-500/30'
                  : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/15 hover:text-white'
              }`}
              aria-label="Identificar paciente"
            >
              <Icon name={hasPatient ? 'person' : 'person_add'} size={20} filled={hasPatient} />
              {hasPatient && patientWeight > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-sky-700 text-white text-[11px] font-black flex items-center justify-center shadow-sm border border-white/20 clinical-unit clinical-tabular-nums">
                  {patientWeight.toLocaleString('pt-BR')}kg
                </span>
              )}
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasPatient
                  ? `${patientName}${patientWeight > 0 ? ` • ${patientWeight.toLocaleString('pt-BR')} kg` : ''}`
                  : 'Identificar paciente'}
              </span>
            </button>
          )}
        </div>

        {/* Área de Navegação por Grupos (overflow-visible quando recolhida para tooltips flutuantes) */}
        <div
          id="sidebar-nav-scroll"
          className={`flex-1 ${
            isOpen
              ? 'overflow-y-auto overscroll-contain custom-scrollbar p-2 space-y-2'
              : 'overflow-visible py-2.5 px-1.5 space-y-2 flex flex-col items-center'
          }`}
        >
          <div className={isOpen ? 'w-full space-y-2 relative' : 'w-full flex flex-col items-center space-y-2 relative'}>
            {/* Grupo 1: Atendimento Clínico Principal */}
            <div>
              {isOpen && (
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sidebar-text-muted,#94A3B8)] px-2.5 mb-1 leading-none">
                  Atendimento
                </p>
              )}
              <nav className={isOpen ? 'space-y-0.5' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {coreHubNavItems.map(renderNavButton)}
              </nav>
            </div>

            {/* Grupo 2: Módulo de Apoio Clínico */}
            <div>
              {isOpen && (
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sidebar-text-muted,#94A3B8)] px-2.5 mb-1 leading-none">
                  Módulo de Apoio Clínico
                </p>
              )}
              <nav className={isOpen ? 'space-y-0.5' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {clinicalToolsNavItems.map(renderNavButton)}
              </nav>
            </div>

            {/* Grupo 3: Kits de Plantão */}
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

