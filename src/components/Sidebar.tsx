import React, { useState } from 'react';
import { 
  FileEdit, 
  FileText,
  Calculator, 
  FlaskConical, 
  Award, 
  Share2, 
  Download, 
  Users, 
  Stethoscope, 
  HeartPulse, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Trash2, 
  UserX, 
  RotateCcw, 
  Pencil, 
  Sun, 
  Moon, 
  UserPlus, 
  UserCheck,
  Database
} from 'lucide-react';
import { ActiveTab, DoctorProfile, Patient, WorkContext } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { ContextSwitcher } from './ContextSwitcher';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  darkMode,
  onToggleDarkMode,
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
  onResetAll
}) => {
  const patientWeight = patient?.weightKg && patient.weightKg > 0 ? patient.weightKg : 0;
  const hasPatient = Boolean(patient?.name?.trim());
  const patientName = patient?.name?.trim() || '';
  const hasDoctor = Boolean(doctor?.name?.trim());

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

  // Grupo 1: Atendimento Clínico
  const clinicalNavItems = [
    {
      id: 'prescription' as ActiveTab,
      label: 'Receitas Médicas',
      shortLabel: 'Receitas',
      icon: FileEdit,
      badge: prescriptionCount > 0 ? `${prescriptionCount}` : undefined
    },
    {
      id: 'pediatric_calc' as ActiveTab,
      label: 'Calculadora Pediátrica',
      shortLabel: 'Doses',
      icon: Calculator,
      badge: patientWeight > 0 ? `${patientWeight}kg` : undefined
    },
    {
      id: 'exams' as ActiveTab,
      label: 'Solicitação de Exames',
      shortLabel: 'Exames',
      icon: FlaskConical,
      badge: selectedExamsCount > 0 ? `${selectedExamsCount}` : undefined
    }
  ];

  // Grupo 2: Documentos & Emissão
  const documentsNavItems = [
    {
      id: 'certificate' as ActiveTab,
      label: 'Atestados Médicos',
      fullLabel: 'Atestados Médicos (CFM)',
      shortLabel: 'Atestado',
      icon: Award
    },
    {
      id: 'referral' as ActiveTab,
      label: 'Encaminhamentos',
      shortLabel: 'Encam.',
      icon: Share2
    },
    {
      id: 'editor' as ActiveTab,
      label: 'Editor de Prescrições',
      fullLabel: 'Editor de Prescrições e Documentos',
      shortLabel: 'Editor',
      icon: FileText
    },
    {
      id: 'protocols' as ActiveTab,
      label: 'Protocolos Clínicos',
      shortLabel: 'Protocolos',
      icon: HeartPulse
    },
    {
      id: 'print_preview' as ActiveTab,
      label: 'Exportar & Imprimir PDF',
      shortLabel: 'Exportar',
      icon: Download
    }
  ];

  const renderNavButton = (item: { id: ActiveTab; label: string; fullLabel?: string; shortLabel: string; icon: React.ElementType; badge?: string }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    if (!isOpen) {
      return (
        <button
          key={item.id}
          id={`nav-btn-${item.id}`}
          type="button"
          onClick={() => onSelectTab(item.id)}
          aria-current={isActive ? 'page' : undefined}
          className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer group active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 outline-none relative ${
            isActive
              ? 'bg-blue-600/30 text-white border border-blue-400/30 shadow-tactile-sm font-bold'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title={item.fullLabel || item.label}
        >
          <Icon
            className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
              isActive ? 'text-sky-300' : 'text-slate-400 group-hover:text-slate-200'
            }`}
            strokeWidth={isActive ? 2.2 : 1.75}
          />
          {item.badge && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm border border-white/20">
              {item.badge}
            </span>
          )}
          {/* Tooltip Tátil Flutuante */}
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
        onClick={() => onSelectTab(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
          isActive
            ? 'bg-blue-600/30 text-white border border-blue-400/30 shadow-tactile-sm font-bold'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`}
        title={item.label}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon 
            className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
              isActive ? 'text-sky-300' : 'text-slate-400 group-hover:text-slate-200'
            }`} 
            strokeWidth={isActive ? 2.2 : 1.75} 
          />
          <span className="truncate">
            {item.label}
          </span>
        </div>
        {item.badge && (
          <span 
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1.5 ${
              isActive ? 'bg-blue-500/30 text-sky-200 border border-blue-400/30' : 'bg-white/10 text-slate-300'
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
      {isOpen && (
        <div 
          onClick={onClose || onToggleOpen}
          aria-label="Fechar menu lateral"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity cursor-pointer"
        />
      )}

      <aside
        id="prescmed-sidebar"
        aria-label="Menu Lateral de Navegação"
        className={`fixed lg:sticky top-16 left-0 h-[calc(100dvh-4rem)] z-40 flex flex-col flex-shrink-0 transition-all duration-300 no-print rounded-r-2xl lg:rounded-2xl border ${
          isOpen ? 'w-64 sm:w-72 shadow-tactile-navy' : 'w-0 lg:w-[68px] overflow-hidden'
        }`}
        style={{
          backgroundColor: darkMode ? '#0B1120' : '#0F172A',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          boxShadow: darkMode
            ? '0 12px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 10px 25px rgba(15, 23, 42, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        <div className={`overflow-y-auto flex-1 custom-scrollbar ${
          isOpen ? 'p-3 space-y-4' : 'py-3 px-1.5 space-y-3 flex flex-col items-center'
        }`}>
          
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 lg:hidden">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Menu de Navegação
            </span>
            <button
              onClick={onClose || onToggleOpen}
              aria-label="Fechar menu lateral"
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
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
              onClick={onOpenDoctorModal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenDoctorModal?.();
                }
              }}
              role="button"
              tabIndex={0}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group active:scale-[0.98] shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-500 outline-none flex items-center justify-between gap-2"
              title="Clique para editar CRM e dados profissionais"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-sky-200 border border-white/15 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-tactile-sm">
                  CRM
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs font-bold truncate text-white">
                    {hasDoctor ? doctor?.name : 'Configurar Médico'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    {hasDoctor 
                      ? `CRM: ${doctor?.crm}/${doctor?.crmState || 'SP'} ${doctor?.rqe ? '• RQE ' + doctor.rqe : ''}` 
                      : 'Toque para preencher'}
                  </p>
                </div>
              </div>
              <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenDoctorModal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenDoctorModal?.();
                }
              }}
              className="w-11 h-11 mx-auto rounded-xl bg-white/10 text-sky-200 border border-white/15 hover:bg-white/15 font-bold text-xs flex items-center justify-center shadow-tactile-sm transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 outline-none relative group"
              title={hasDoctor ? `Dr(a). ${doctor?.name} (CRM: ${doctor?.crm}/${doctor?.crmState})` : 'Configurar CRM / Perfil Médico'}
              aria-label="Perfil do Médico"
            >
              <span>CRM</span>
              {/* Tooltip Tátil Flutuante */}
              <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                {hasDoctor ? `Dr(a). ${doctor?.name}` : 'Configurar CRM'}
              </span>
            </button>
          )}

          {/* Navegação por Grupos */}
          <div className={isOpen ? 'w-full space-y-4' : 'w-full flex flex-col items-center space-y-3'}>
            {/* Grupo 1: Atendimento Clínico */}
            <div>
              {isOpen && (
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                  <span>Atendimento Clínico</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </p>
              )}
              <nav className={isOpen ? 'space-y-1' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {clinicalNavItems.map(renderNavButton)}
              </nav>
            </div>

            {/* Grupo 2: Documentos & Emissão */}
            <div>
              {isOpen && (
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2 mb-1.5">
                  Documentos & Emissão
                </p>
              )}
              <nav className={isOpen ? 'space-y-1' : 'space-y-1.5 w-full flex flex-col items-center'}>
                {documentsNavItems.map(renderNavButton)}
              </nav>
            </div>
          </div>

          {/* Active Patient Badge */}
          {isOpen ? (
            <div
              onClick={onOpenPatientModal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenPatientModal?.();
                }
              }}
              role="button"
              tabIndex={0}
              className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group active:scale-[0.98] shadow-tactile-inset focus-visible:ring-2 focus-visible:ring-sky-500 outline-none flex items-center justify-between gap-2"
              title="Clique para editar paciente"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Paciente em Atendimento
                  </p>
                  <p className="text-xs font-bold truncate text-white">
                    {hasPatient ? patientName : 'Não identificado'}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-400">
                    {patientWeight > 0 ? `${patientWeight} kg` : 'Sem peso'} {patient?.ageText ? `• ${patient.ageText}` : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenPatientModal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenPatientModal?.();
                }
              }}
              className="w-11 h-11 mx-auto rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none shadow-tactile-sm"
              title={hasPatient ? `Paciente: ${patientName} (${patientWeight ? patientWeight + 'kg' : 'sem peso'})` : 'Definir / Identificar Paciente'}
              aria-label="Dados do Paciente"
            >
              <Users className="w-5 h-5" />
            </button>
          )}

          {/* Quick Actions (Limpeza / Novo Atendimento) */}
          {isOpen && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2">
                Ações da Consulta
              </p>
              
              {/* Novo Atendimento */}
              <button
                type="button"
                onClick={handleTriggerResetAll}
                className="w-full min-h-[40px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-sky-200 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/20 transition cursor-pointer shadow-tactile-sm active:scale-95 outline-none"
                title="Iniciar uma nova consulta do zero"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Novo Atendimento</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                {/* Zerar Receita */}
                <button
                  type="button"
                  onClick={handleTriggerClearPrescription}
                  className="py-2 px-2 rounded-xl border border-white/10 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-semibold"
                  title="Zerar medicamentos da receita atual"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400/80" />
                  <span className="truncate">Zerar Receita</span>
                </button>

                {/* Limpar Paciente */}
                <button
                  type="button"
                  onClick={handleTriggerClearPatient}
                  className="py-2 px-2 rounded-xl border border-white/10 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-semibold"
                  title="Limpar dados cadastrais do paciente"
                >
                  <UserX className="w-3.5 h-3.5 text-rose-400/80" />
                  <span className="truncate">Limpar Paciente</span>
                </button>
              </div>

              {/* Backup & Portabilidade */}
              {onOpenBackupModal && (
                <button
                  type="button"
                  onClick={onOpenBackupModal}
                  className="w-full py-2 px-3 rounded-xl border border-white/10 text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold"
                  title="Exportar ou restaurar arquivo de backup (.pcm.json)"
                >
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Backup / Portabilidade</span>
                </button>
              )}

              {/* Instalação PWA Offline */}
              {isInstallable && onInstallApp && (
                <button
                  type="button"
                  onClick={onInstallApp}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold"
                  title="Instalar PresCMed como aplicativo no computador ou celular"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Instalar App Offline</span>
                </button>
              )}
            </div>
          )}

          {/* Backup Icon Button in Collapsed Mode */}
          {!isOpen && onOpenBackupModal && (
            <button
              type="button"
              onClick={onOpenBackupModal}
              className="w-11 h-11 mx-auto rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 outline-none shadow-tactile-sm relative group"
              title="Backup / Portabilidade (.pcm.json)"
              aria-label="Backup e Portabilidade"
            >
              <Database className="w-5 h-5" />
              {/* Tooltip Tátil Flutuante */}
              <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Backup (.pcm.json)
              </span>
            </button>
          )}

          {/* Install PWA Icon Button in Collapsed Mode */}
          {!isOpen && isInstallable && onInstallApp && (
            <button
              type="button"
              onClick={onInstallApp}
              className="w-11 h-11 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none shadow-tactile-sm animate-pulse relative group"
              title="Instalar PresCMed no dispositivo (100% Offline)"
              aria-label="Instalar App Offline"
            >
              <Download className="w-5 h-5" />
              {/* Tooltip Tátil Flutuante */}
              <span className="absolute left-[58px] bg-slate-900 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-tactile-md z-50">
                Instalar App Offline
              </span>
            </button>
          )}

          {/* Toggle Collapse on Desktop */}
          <div className="hidden lg:block pt-2 border-t border-white/10 w-full">
            <button
              type="button"
              onClick={onToggleOpen}
              className={`min-h-[40px] py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 flex items-center transition cursor-pointer active:scale-95 ${
                isOpen ? 'w-full justify-center gap-1.5 px-3' : 'w-11 h-11 mx-auto justify-center'
              }`}
              title={isOpen ? 'Recolher Menu Lateral' : 'Expandir Menu Lateral'}
            >
              {isOpen ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Recolher Menu</span>
                </>
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

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
