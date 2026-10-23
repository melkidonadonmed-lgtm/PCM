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
  shortcut?: string;
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
  onOpenPatientModal,
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
  const hasPatient = Boolean(patient?.name?.trim());
  const patientName = patient?.name?.trim() || '';

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

  // Grupo 1: Atendimento Clínico Principal (5 Destinos Canônicos)
  const coreHubNavItems: SidebarNavItem[] = [
    {
      id: 'prescription',
      label: 'Receitas Médicas',
      shortLabel: 'Receitas',
      iconName: 'receita',
      shortcut: 'Alt+1',
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'documents',
      label: 'Central de Documentos',
      fullLabel: 'Central de Documentos (Atestados, Encaminhamentos e Exames)',
      shortLabel: 'Documentos',
      iconName: 'documentos',
      shortcut: 'Alt+2',
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    },
    {
      id: 'sus',
      label: 'Guias Oficiais SUS',
      fullLabel: 'Guias Oficiais SUS (APAC, LME, SISREG, GAL/LACEN, SISCAN, TRM-TB)',
      shortLabel: 'Guias SUS',
      iconName: 'sus',
      shortcut: 'Alt+6'
    },
    {
      id: 'editor',
      label: 'Editor A4 & Timbrados',
      fullLabel: 'Editor de Prescrições e Laudos A4',
      shortLabel: 'Editor',
      iconName: 'editor',
      shortcut: 'Alt+5'
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
      iconName: 'calculate',
      shortcut: 'Alt+3',
      badge: patientWeight > 0 ? `${patientWeight}kg` : undefined
    },
    {
      id: 'protocols',
      label: 'Protocolos Clínicos',
      shortLabel: 'Protocolos',
      iconName: 'coracao',
      shortcut: 'Alt+4'
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

  const handleOpenPatient = () => {
    onOpenPatientModal?.();
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
          aria-label={item.fullLabel || item.label}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative ${
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
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-black flex items-center justify-center shadow-sm border border-white/20 clinical-unit clinical-tabular-nums">
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
        className={`relative w-full h-9 flex items-center justify-between px-2.5 rounded-xl text-xs transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group hover:translate-x-1 active:translate-x-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-400 outline-none ${
          isActive
            ? 'nav-item-active sidebar-active-surface text-white font-semibold'
            : 'text-slate-300 hover:bg-white/[0.07] hover:border-white/10 hover:text-white font-medium border border-transparent'
        }`}
        title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
      >
        {isActive && <span aria-hidden="true" className="sidebar-active-bar" />}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 border ${
              isActive
                ? 'bg-sky-400/20 text-sky-300 border-sky-400/30 shadow-xs'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.06] group-hover:bg-white/[0.10] group-hover:border-white/15 group-hover:text-white group-hover:scale-105'
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
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ml-1 clinical-unit clinical-tabular-nums ${
              isActive ? 'bg-sky-500/30 text-sky-100 border border-sky-400/30' : 'bg-white/10 text-slate-300'
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
                : 'text-slate-400/80 group-hover:text-slate-200 bg-white/[0.04]'
            }`}
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
        aria-label="Fechar menu lateral"
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
        className={`panel-navy fixed top-0 left-0 h-dvh z-[60] w-72 sm:w-80 max-w-[85vw] flex flex-col flex-shrink-0 no-print rounded-r-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full pointer-events-none'
        } lg:pointer-events-auto lg:sticky lg:top-[4.25rem] lg:h-[calc(100dvh-4.75rem)] lg:translate-x-0 lg:z-40 lg:rounded-2xl lg:transition-[width] lg:duration-200 lg:ease-in-out ${
          isOpen
            ? 'lg:w-[260px] shadow-tactile-navy border'
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
            ? 'overflow-y-auto overscroll-contain custom-scrollbar p-2 space-y-1.5'
            : 'overflow-visible py-3 px-1.5 space-y-2.5 flex flex-col items-center'
        }`}>
          
          {/* Header da Navegação Clínica (Mobile & Desktop Expandido) */}
          {isOpen ? (
            <div className="flex items-center justify-between px-1 pb-1.5 pt-0.5 border-b border-white/10">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon name="layers" size={15} className="text-sky-400 shrink-0" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 truncate">
                  Navegação Clínica
                </span>
              </div>
              <button
                type="button"
                onClick={onClose || onToggleOpen}
                aria-label="Fechar menu lateral"
                title={isDesktop ? 'Recolher menu lateral' : 'Fechar menu lateral'}
                className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.12] hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none transition-all duration-150 shrink-0"
              >
                <Icon name={isDesktop ? 'chevron_left' : 'close'} size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleOpen}
              aria-label="Abrir Janela de Navegação"
              className="hidden lg:flex w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 text-sky-300 items-center justify-center transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
            >
              <Icon name="menu_open" size={20} className="rotate-180" />
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Expandir Navegação Clínica
              </span>
            </button>
          )}

          {/* Context Switcher (SUS Multi-Instituição) — Prioridade 1 no Topo */}
          {contexts && contexts.length > 0 && activeContext && onSwitchContext && (
            <ContextSwitcher
              contexts={contexts}
              activeContext={activeContext}
              onSwitchContext={onSwitchContext}
              collapsed={!isOpen}
            />
          )}

          {/* Doctor Profile Badge Compacto — Prioridade 2 no Topo */}
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
              className="px-2.5 py-1.5 min-h-[42px] rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 cursor-pointer group active:scale-[0.98] shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-400 outline-none flex items-center justify-between gap-2 surface-inset"
              title="Clique para editar CRM e dados profissionais"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-200 border border-sky-400/25 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-tactile-sm transition-transform duration-200 group-hover:scale-105">
                  CRM
                </div>
                <div className="overflow-hidden min-w-0 flex-1 leading-tight">
                  <p className="text-[11px] font-bold truncate text-white">
                    {hasDoctor ? doctor?.name : 'Configurar médico'}
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium truncate clinical-tabular-nums">
                    {hasDoctor 
                      ? `CRM ${doctor?.crm}/${doctor?.crmState || 'SP'}${doctor?.rqe ? ' • RQE ' + doctor.rqe : ''}` 
                      : 'Toque para informar CRM'}
                  </p>
                </div>
              </div>
              <Icon name="edit" size={14} className="text-slate-400 group-hover:text-sky-300 transition-colors shrink-0" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenDoctor}
              className="w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl bg-sky-500/15 text-sky-200 border border-sky-400/25 hover:bg-sky-500/25 font-bold text-xs flex items-center justify-center shadow-tactile-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
              aria-label="Perfil do Médico"
            >
              <span>CRM</span>
              <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasDoctor ? `Dr(a). ${doctor?.name}` : 'Configurar CRM'}
              </span>
            </button>
          )}

          {/* Patient Identification Badge Compacto — Prioridade 3 no Topo */}
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
              className={`px-2.5 py-1.5 min-h-[42px] rounded-xl border transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer group active:scale-[0.98] shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-400 outline-none flex items-center justify-between gap-2 surface-inset ${
                hasPatient
                  ? 'border-sky-400/30 bg-sky-500/[0.10] hover:bg-sky-500/[0.16] hover:border-sky-400/45'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20'
              }`}
              title="Clique para identificar o paciente, peso e histórico clínico"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-tactile-sm border transition-transform duration-200 group-hover:scale-105 ${
                    hasPatient
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400/30'
                      : 'bg-white/10 text-slate-300 border-white/15'
                  }`}
                >
                  <Icon name={hasPatient ? 'person' : 'person_add'} size={15} filled={hasPatient} />
                </div>
                <div className="overflow-hidden min-w-0 flex-1 leading-tight">
                  <p className="text-[11px] font-bold truncate text-white">
                    {hasPatient ? patientName : 'Identificar paciente'}
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium truncate clinical-tabular-nums">
                    {hasPatient
                      ? patientWeight > 0
                        ? `Peso: ${patientWeight.toLocaleString('pt-BR')} kg${patient?.documentNumber ? ' • ' + patient.documentNumber : ''}`
                        : patient?.documentNumber
                          ? `CPF/CNS: ${patient.documentNumber}`
                          : 'Toque para editar dados ou peso'
                      : 'Nome, peso (kg) e CPF/CNS'}
                  </p>
                </div>
              </div>
              {hasPatient && patientWeight > 0 ? (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-sky-500/25 text-sky-200 border border-sky-400/30 shrink-0 clinical-unit clinical-tabular-nums">
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
              className={`w-11 h-11 min-w-[44px] min-h-[44px] mx-auto rounded-xl border flex items-center justify-center shadow-tactile-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group ${
                hasPatient
                  ? 'bg-sky-500/20 text-sky-200 border-sky-400/30 hover:bg-sky-500/30'
                  : 'bg-white/[0.06] text-slate-300 border-white/10 hover:bg-white/15 hover:text-white'
              }`}
              aria-label="Identificar paciente"
            >
              <Icon name={hasPatient ? 'person' : 'person_add'} size={20} filled={hasPatient} />
              {hasPatient && patientWeight > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm border border-white/20 clinical-unit clinical-tabular-nums">
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

          {/* Navegação por Grupos */}
          <div className={isOpen ? 'w-full space-y-1.5 relative' : 'w-full flex flex-col items-center space-y-2 relative'}>
            {/* Grupo 1: Atendimento Clínico Principal */}
            <div>
              {isOpen && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 mb-0.5 leading-none">
                  Atendimento
                </p>
              )}
              <nav className={isOpen ? 'space-y-0.5' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {coreHubNavItems.map(renderNavButton)}
              </nav>
            </div>

            {/* Grupo 2: Ferramentas de Apoio */}
            <div>
              {isOpen && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 mb-0.5 leading-none">
                  Apoio clínico
                </p>
              )}
              <nav className={isOpen ? 'space-y-0.5' : 'space-y-1.5 w-full flex flex-col items-center'}>
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
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-medium text-slate-300 border border-transparent flex items-center justify-between hover:text-white hover:bg-white/[0.07] hover:border-white/10 hover:translate-x-1 active:translate-x-0 active:scale-[0.98] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.10] group-hover:border-white/15 group-hover:scale-105 transition-all duration-200 flex items-center justify-center shrink-0">
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
                  <div
                    id="sidebar-kits-list"
                    className="space-y-1 pt-1 pl-1 pr-0.5"
                  >
                    {CLINICAL_KITS.map(kit => (
                      <button
                        key={kit.id}
                        type="button"
                        onClick={() => handleAplicarKitWithClose(kit)}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 hover:translate-x-1 active:translate-x-0 transition-all duration-200 cursor-pointer group active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                        title={`Aplicar kit: ${kit.name} (${kit.badge})`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                            {kit.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0 clinical-tabular-nums">
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
                className="w-11 h-11 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer group hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative text-slate-300 bg-white/[0.02] hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15"
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
            )}

            {/* Seletor Compacto de Macro-Módulos do Ecossistema (MOD-01 Ativo | MOD-02 PEP | MOD-03 Hospitalar) */}
            {isOpen && (
              <div
                className="px-2 py-1 rounded-xl bg-white/[0.03] border border-white/10 space-y-0.5"
                title="01. Clínico & Prescrição ativo • 02. PEP/SOAP e 03. Hospitalar prontos na arquitetura multi-módulo"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    Ecossistema Clínico
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-1.5 py-0.5 rounded shrink-0 leading-none clinical-tabular-nums">
                    MOD-01 Ativo
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[9px] clinical-tabular-nums">
                  <div className="px-1 py-0.5 rounded bg-sky-500/15 border border-sky-400/25 text-white font-semibold truncate text-center">
                    01. Clínico
                  </div>
                  <div className="px-1 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-400 font-medium opacity-70 truncate text-center select-none">
                    02. PEP
                  </div>
                  <div className="px-1 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-400 font-medium opacity-70 truncate text-center select-none">
                    03. Hosp.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Footer: Ações da Consulta, Backup e Recolher Menu */}
        <div className={`shrink-0 border-t border-white/10 bg-black/15 rounded-b-2xl overflow-hidden ${
          isOpen ? 'p-2 space-y-1 pb-3 lg:pb-2' : 'py-2.5 px-1.5 space-y-2 flex flex-col items-center'
        }`}>
          {isOpen ? (
            <>
              {/* Novo Atendimento em linha única limpa */}
              <button
                type="button"
                onClick={handleTriggerResetAll}
                className="w-full h-9 flex items-center justify-center gap-1.5 px-2.5 rounded-xl text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] hover:border-white/20 hover:-translate-y-[1px] active:translate-y-0 border border-white/10 transition-all duration-150 cursor-pointer active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-sky-400 whitespace-nowrap group"
                title="Iniciar uma nova consulta do zero"
              >
                <Icon name="refresh" size={15} className="text-sky-300 group-hover:rotate-45 transition-transform duration-200 shrink-0" />
                <span className="truncate">Novo Atendimento</span>
              </button>

              {/* Utilitários secundários uniformes: Backup, Instalar e Recolher Menu (sem overflow horizontal) */}
              <div className="flex items-center gap-1.5 w-full min-w-0">
                {onOpenBackupModal && (
                  <button
                    type="button"
                    onClick={handleOpenBackup}
                    className="flex-1 min-w-0 h-8 px-1 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.10] hover:border-white/20 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 text-[11px] tracking-tight font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    title="Exportar ou restaurar arquivo de backup (.pcm.json)"
                  >
                    <Icon name="cloud_download" size={13} className="text-slate-300 shrink-0" />
                    <span className="truncate">Backup (.pcm)</span>
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
                    className="flex-1 min-w-0 h-8 px-1 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.10] hover:border-white/20 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 text-[11px] tracking-tight font-medium outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    title="Instalar PresCMed como aplicativo offline"
                  >
                    <Icon name="download" size={13} className="text-sky-300 shrink-0" />
                    <span className="truncate">Instalar App</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onToggleOpen}
                  className="hidden lg:flex w-8 h-8 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.10] hover:border-white/20 items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 outline-none shrink-0"
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
                onClick={handleTriggerResetAll}
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
                  onClick={handleOpenBackup}
                  className="w-11 h-11 mx-auto rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 outline-none relative group"
                  aria-label="Backup e Portabilidade"
                >
                  <Icon name="cloud_download" size={20} />
                  <span className="absolute left-[calc(100%+10px)] bg-slate-900 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                    Backup (.pcm.json)
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

