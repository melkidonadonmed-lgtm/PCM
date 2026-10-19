import React, { useState, useEffect } from 'react';
import { ActiveTab, DoctorProfile, Patient, WorkContext } from '../types';
import { CLINICAL_KITS, ClinicalKit } from '../data/clinicalKits';
import { ConfirmationModal } from './ConfirmationModal';
import { ContextSwitcher } from './ContextSwitcher';
import { Icon, IconName } from './Icon';
import { storageService } from '../services/storageService';

/**
 * Menu Lateral Deep Navy e Kits Clínicos de Plantão.
 * Estados de UI cobertos: empty (nenhum kit expandido), loading (carregando aplicação de kit),
 * success (kit aplicado com sucesso) e error (confirmação/alerta de limpeza).
 */
interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode?: () => void;
  activeTab: ActiveTab;
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
  isInstallable?: boolean;
  onInstallApp?: () => void;
  onClearPrescription?: () => void;
  onClearPatient?: () => void;
  onResetAll?: () => void;
  onAplicarKit?: (kit: ClinicalKit) => void;
}

interface SidebarNavItem {
  id: ActiveTab;
  label: string;
  fullLabel?: string;
  shortLabel: string;
  iconName: IconName;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  darkMode,
  activeTab,
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
  onOpenBackupModal,
  isInstallable = false,
  onInstallApp,
  onClearPrescription,
  onClearPatient,
  onResetAll,
  onAplicarKit
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasDoctor = Boolean(doctor?.name?.trim());

  // Estado de recolhimento dos Kits de Plantão (salvo no localStorage, padrão recolhido)
  const [showKits, setShowKits] = useState<boolean>(() => {
    try {
      return localStorage.getItem('prescmed_show_kits') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleKits = () => {
    setShowKits(prev => {
      const next = !prev;
      storageService.saveRawString('prescmed_show_kits', String(next));
      return next;
    });
  };

  // Detecção de breakpoint desktop (>= 1024px) via matchMedia
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fechamento pelo teclado (Escape) no modo mobile
  useEffect(() => {
    if (!isOpen || isDesktop) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleTriggerClearPrescription = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Zerar Receita Atual?',
      description: 'Esta ação removerá todos os medicamentos prescritos na receita atual. Os dados do paciente e exames serão preservados.',
      confirmLabel: 'Zerar Receita',
      variant: 'danger',
      onConfirm: () => {
        onClearPrescription?.();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleTriggerClearPatient = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpar Dados do Paciente?',
      description: 'Esta ação resetará o nome, peso, idade e dados cadastrais do paciente em atendimento.',
      confirmLabel: 'Limpar Paciente',
      variant: 'danger',
      onConfirm: () => {
        onClearPatient?.();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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

  // Grupo 1: Atendimento Clínico Principal (4 Hubs Canônicos)
  const coreHubNavItems: SidebarNavItem[] = [
    {
      id: 'prescription',
      label: 'Receitas Médicas',
      shortLabel: 'Receitas',
      iconName: 'receita',
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'documents',
      label: 'Central de Documentos',
      fullLabel: 'Central de Documentos (Atestados, Encaminhamentos, Exames e SUS)',
      shortLabel: 'Documentos',
      iconName: 'documentos',
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'editor',
      label: 'Editor A4 & Timbrados',
      fullLabel: 'Editor de Prescrições e Laudos A4',
      shortLabel: 'Editor',
      iconName: 'editor'
    },
    {
      id: 'print_preview',
      label: 'Exportar & Imprimir PDF',
      shortLabel: 'Exportar',
      iconName: 'imprimir'
    }
  ];

  // Grupo 2: Ferramentas Clínicas & Apoio Diagnóstico
  const clinicalToolsNavItems: SidebarNavItem[] = [
    {
      id: 'pediatric_calc',
      label: 'Calculadora Pediátrica',
      shortLabel: 'Doses',
      iconName: 'balanca',
      badge: patientWeight > 0 ? `${patientWeight}kg` : undefined
    },
    {
      id: 'protocols',
      label: 'Protocolos Clínicos',
      shortLabel: 'Protocolos',
      iconName: 'coracao'
    }
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    if (!isDesktop) {
      onClose?.();
    }
  };

  const handleOpenDoctor = () => {
    onOpenDoctorModal?.();
    if (!isDesktop) onClose?.();
  };

  const handleOpenBackup = () => {
    onOpenBackupModal?.();
    if (!isDesktop) onClose?.();
  };

  const handleAplicarKitWithClose = (kit: ClinicalKit) => {
    onAplicarKit?.(kit);
    if (!isDesktop) onClose?.();
  };

  const renderNavButton = (item: SidebarNavItem) => {
    const isActive = item.id === 'documents'
      ? (activeTab === 'documents' || activeTab === 'certificate' || activeTab === 'referral' || activeTab === 'exams')
      : activeTab === item.id;

    if (!isOpen) {
      return (
        <button
          key={item.id}
          id={`nav-btn-${item.id}`}
          type="button"
          onClick={() => handleNavClick(item.id)}
          aria-current={isActive ? 'page' : undefined}
          className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center transition cursor-pointer group active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative ${
            isActive
              ? 'bg-sky-600/30 text-white border border-info shadow-tactile-sm font-bold'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title={item.fullLabel || item.label}
        >
          <Icon
            name={item.iconName}
            size={20}
            className={`transition-transform group-hover:scale-105 ${
              isActive ? 'text-sky-300' : 'text-slate-300 group-hover:text-white'
            }`}
          />
          {item.badge && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center shadow-sm border border-white/20">
              {item.badge}
            </span>
          )}
          <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
            {item.label}
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
        className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-400 outline-none ${
          isActive
            ? 'bg-sky-600/30 text-white border border-info shadow-tactile-sm font-bold'
            : 'text-slate-300 hover:bg-white/[0.06] hover:text-white border border-transparent'
        }`}
        title={item.label}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon 
            name={item.iconName}
            size={18}
            className={`transition-transform group-hover:scale-105 ${
              isActive ? 'text-sky-300' : 'text-slate-300 group-hover:text-white'
            }`} 
          />
          <span className="truncate">
            {item.label}
          </span>
        </div>
        {item.badge && (
          <span 
            className={`text-xs font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1.5 ${
              isActive ? 'bg-sky-500/30 text-sky-200 border border-info' : 'bg-white/10 text-slate-300'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Overlay Backdrop on Mobile */}
      <div 
        onClick={onClose || onToggleOpen}
        aria-label="Fechar menu lateral"
        className={`fixed inset-0 z-50 bg-black/70 lg:hidden transition-opacity duration-300 cursor-pointer ${
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
        className={`panel-navy fixed top-0 left-0 h-dvh z-50 w-72 sm:w-80 max-w-[85vw] flex flex-col flex-shrink-0 no-print rounded-r-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full pointer-events-none'
        } lg:pointer-events-auto lg:sticky lg:top-20 lg:h-[calc(100dvh-6rem)] lg:translate-x-0 lg:z-40 lg:rounded-2xl lg:transition-[width] lg:duration-200 lg:ease-in-out ${
          isOpen
            ? 'lg:w-64 shadow-tactile-navy border'
            : 'lg:w-[68px] overflow-visible border'
        }`}
        style={{
          backgroundColor: darkMode ? '#0B1120' : '#0F172A',
          borderColor: (!isOpen && isDesktop) ? 'rgba(255, 255, 255, 0.08)' : (isOpen ? 'rgba(255, 255, 255, 0.12)' : 'transparent'),
          boxShadow: !isDesktop
            ? (isOpen ? '0 20px 40px rgba(0,0,0,0.7), 4px 0 24px rgba(0,0,0,0.5)' : 'none')
            : darkMode
            ? '0 12px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 10px 25px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Scrollable Main Area (overflow-visible when collapsed so floating tooltips are never clipped) */}
        <div className={`flex-1 ${
          isOpen
            ? 'overflow-y-auto overscroll-contain custom-scrollbar p-3 space-y-3.5'
            : 'overflow-visible py-3 px-1.5 space-y-2.5 flex flex-col items-center'
        }`}>
          
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between pb-2.5 pt-0.5 border-b border-white/10 lg:hidden">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Navegação & Recursos
            </span>
            <button
              type="button"
              onClick={onClose || onToggleOpen}
              aria-label="Fechar menu lateral"
              className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none transition-colors"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Context Switcher (SUS Multi-Instituição) */}
          {contexts && contexts.length > 0 && activeContext && onSwitchContext && (
            <ContextSwitcher
              contexts={contexts}
              activeContext={activeContext}
              onSwitchContext={onSwitchContext}
              collapsed={!isOpen}
            />
          )}

          {/* Doctor Profile Badge Compacto */}
          {isOpen ? (
            <div
              onClick={handleOpenDoctor}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDoctor();
                }
              }}
              role="button"
              tabIndex={0}
              className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition cursor-pointer group active:scale-[0.98] shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-400 outline-none flex items-center justify-between gap-2 surface-inset"
              title="Clique para editar CRM e dados profissionais"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-sky-200 border border-white/15 flex items-center justify-center font-bold text-xs shrink-0 shadow-tactile-sm">
                  CRM
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-white">
                    {hasDoctor ? doctor?.name : 'Configurar médico'}
                  </p>
                  <p className="text-xs text-slate-300 font-medium truncate">
                    {hasDoctor 
                      ? `CRM ${doctor?.crm}/${doctor?.crmState || 'SP'}${doctor?.rqe ? ' • RQE ' + doctor.rqe : ''}` 
                      : 'Toque para informar CRM'}
                  </p>
                </div>
              </div>
              <Icon name="edit" size={15} className="text-slate-400 group-hover:text-white transition-colors shrink-0" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenDoctor}
              className="w-11 h-11 mx-auto rounded-xl bg-white/10 text-sky-200 border border-white/15 hover:bg-white/15 font-bold text-xs flex items-center justify-center shadow-tactile-sm transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
              title={hasDoctor ? `Dr(a). ${doctor?.name} (CRM: ${doctor?.crm}/${doctor?.crmState})` : 'Configurar CRM / Perfil Médico'}
              aria-label="Perfil do Médico"
            >
              <span>CRM</span>
              <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasDoctor ? `Dr(a). ${doctor?.name}` : 'Configurar CRM'}
              </span>
            </button>
          )}

          {/* Navegação por Grupos */}
          <div className={isOpen ? 'w-full space-y-3.5 relative' : 'w-full flex flex-col items-center space-y-2.5 relative'}>
            <div id="sidebar-active-tracker" aria-hidden="true" className="sr-only" />
            {/* Grupo 1: Atendimento Clínico Principal */}
            <div>
              {isOpen && (
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Atendimento
                </p>
              )}
              <nav className={isOpen ? 'space-y-1' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {coreHubNavItems.map(renderNavButton)}
              </nav>
            </div>

            {/* Grupo 2: Ferramentas de Apoio */}
            <div>
              {isOpen && (
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Apoio clínico
                </p>
              )}
              <nav className={isOpen ? 'space-y-1' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {clinicalToolsNavItems.map(renderNavButton)}
              </nav>
            </div>

            {/* Grupo 3: Kits de Plantão */}
            {isOpen ? (
              <div>
                <button
                  type="button"
                  onClick={handleToggleKits}
                  aria-expanded={showKits}
                  aria-controls="sidebar-kits-list"
                  className="w-full text-xs font-bold uppercase tracking-wider text-slate-300 px-2 py-1.5 rounded-lg flex items-center justify-between hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span className="flex items-center gap-1.5">
                    <Icon name="medication" size={15} className="text-amber-400" />
                    <span>Kits de plantão ({CLINICAL_KITS.length})</span>
                  </span>
                  <Icon
                    name={showKits ? 'expand_less' : 'expand_more'}
                    size={16}
                    className="text-slate-400 group-hover:text-white transition-transform"
                  />
                </button>

                {showKits && (
                  <div
                    id="sidebar-kits-list"
                    className="space-y-1 pt-1 pl-1 pr-0.5"
                  >
                    {CLINICAL_KITS.map(kit => (
                      <button
                        key={kit.id}
                        type="button"
                        onClick={() => handleAplicarKitWithClose(kit)}
                        className="w-full text-left px-2.5 py-2 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-warning transition cursor-pointer group active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        title={`Aplicar kit: ${kit.name} (${kit.badge})`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                            {kit.name}
                          </span>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-warning shrink-0">
                            {kit.badge}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onToggleOpen();
                  setShowKits(true);
                  storageService.saveRawString('prescmed_show_kits', 'true');
                }}
                className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center transition cursor-pointer group active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-400 outline-none relative text-amber-400 hover:text-amber-300 hover:bg-white/10"
                title="Kits de plantão"
                aria-label="Kits de plantão"
              >
                <Icon
                  name="medication"
                  size={20}
                  className="transition-transform group-hover:scale-105 text-amber-400"
                />
                <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                  Kits de plantão
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Pinned Footer: Ações da Consulta, Backup e Recolher Menu */}
        <div className={`shrink-0 border-t border-white/10 bg-black/15 rounded-b-2xl ${
          isOpen ? 'p-3 space-y-2 pb-14 lg:pb-3' : 'py-2.5 px-1.5 space-y-2 flex flex-col items-center'
        }`}>
          {isOpen ? (
            <>
              {/* Novo Atendimento + Ações Rápidas de Limpeza */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTriggerResetAll}
                  className="flex-1 min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-200 bg-sky-500/15 hover:bg-sky-500/25 border border-info transition cursor-pointer shadow-tactile-sm active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  title="Iniciar uma nova consulta do zero"
                >
                  <Icon name="refresh" size={16} />
                  <span>Novo Atendimento</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerClearPrescription}
                  className="w-9 h-[38px] rounded-xl border border-white/10 text-slate-300 hover:text-rose-300 hover:bg-rose-500/15 hover:border-rose-400/30 transition cursor-pointer flex items-center justify-center shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  title="Zerar medicamentos da receita atual"
                  aria-label="Zerar Receita"
                >
                  <Icon name="delete" size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleTriggerClearPatient}
                  className="w-9 h-[38px] rounded-xl border border-white/10 text-slate-300 hover:text-rose-300 hover:bg-rose-500/15 hover:border-rose-400/30 transition cursor-pointer flex items-center justify-center shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                  title="Limpar dados cadastrais do paciente"
                  aria-label="Limpar Paciente"
                >
                  <Icon name="person_remove" size={16} />
                </button>
              </div>

              {/* Backup + Recolher Menu */}
              <div className="flex items-center gap-1.5">
                {onOpenBackupModal && (
                  <button
                    type="button"
                    onClick={handleOpenBackup}
                    className="flex-1 min-h-[36px] py-1.5 px-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-amber-200 hover:bg-amber-500/10 transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    title="Exportar ou restaurar arquivo de backup (.pcm.json)"
                  >
                    <Icon name="cloud_download" size={15} className="text-amber-400" />
                    <span className="truncate">Backup (.pcm)</span>
                  </button>
                )}

                {isInstallable && onInstallApp && (
                  <button
                    type="button"
                    onClick={onInstallApp}
                    className="min-h-[36px] py-1.5 px-2.5 rounded-xl border border-clinical text-emerald-300 hover:bg-emerald-500/15 transition cursor-pointer flex items-center justify-center gap-1 text-xs font-bold outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    title="Instalar PresCMed como aplicativo offline"
                  >
                    <Icon name="download" size={15} className="text-emerald-400" />
                    <span>Instalar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onToggleOpen}
                  className="hidden lg:flex w-9 h-[36px] rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 items-center justify-center transition cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none shrink-0"
                  title="Recolher menu lateral"
                  aria-label="Recolher Menu"
                >
                  <Icon name="chevron_left" size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleTriggerResetAll}
                className="w-11 h-11 mx-auto rounded-xl text-sky-300 hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
                title="Novo Atendimento"
                aria-label="Novo Atendimento"
              >
                <Icon name="refresh" size={20} />
                <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                  Novo Atendimento
                </span>
              </button>

              {onOpenBackupModal && (
                <button
                  type="button"
                  onClick={handleOpenBackup}
                  className="w-11 h-11 mx-auto rounded-xl text-amber-400 hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 outline-none relative group"
                  title="Backup / Portabilidade (.pcm.json)"
                  aria-label="Backup e Portabilidade"
                >
                  <Icon name="cloud_download" size={20} />
                  <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                    Backup (.pcm.json)
                  </span>
                </button>
              )}

              {isInstallable && onInstallApp && (
                <button
                  type="button"
                  onClick={onInstallApp}
                  className="w-11 h-11 mx-auto rounded-xl text-emerald-400 hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none relative group"
                  title="Instalar PresCMed no dispositivo (100% Offline)"
                  aria-label="Instalar App Offline"
                >
                  <Icon name="download" size={20} />
                  <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
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

