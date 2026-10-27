import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon, IconName } from '../Icon';
import { ActiveTab, SusDocumentId } from '../../types';
import type { HospitalBedPatientRecord } from '../../core/domain/clinicalEntities';
import { CLINICAL_KITS, ClinicalKit } from '../../data/clinicalKits';
import { PATHOLOGY_PROTOCOLS } from '../../data/clinicalProtocols';
import { CLINICAL_PROTOCOLS } from '../../data/pediatricMeds';
import { SUS_DOCUMENTS_CATALOG } from '../../data/susDocumentsCatalog';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../../data/medicationDatabase';
import { searchUnifiedMedicationsFuzzy } from '../../utils/fuzzySearch';
import { searchScoreboardCatalog } from '../../data/scores/scoreboardCatalog';
import { Badge } from '../ui/Badge';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

/**
 * Paleta de Comandos Global (Ctrl+K / Cmd+K).
 * Estados de UI cobertos: empty (nenhum módulo encontrado), loading (carregando índice),
 * success (item selecionado/resolvido) e error (alerta de busca sem correspondência).
 */
export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectSusDoc?: (docId: SusDocumentId) => void;
  onSelectScore?: (calculatorId: string) => void;
  onSelectProtocol?: (protocolSearchQuery: string) => void;
  hospitalBeds?: HospitalBedPatientRecord[];
  onSelectHospitalBed?: (bedId: string) => void;
  onAplicarKit: (kit: ClinicalKit) => void;
  onUsarMedicamento: (med: UnifiedMedication) => void;
  onOpenPatientModal: () => void;
  onOpenDoctorModal: () => void;
}

interface CommandOption {
  id: string;
  group:
    | 'Navegação Rápida'
    | 'Leitos Hospitalares (MOD-03)'
    | 'Protocolos Clínicos & Urgência'
    | 'Escores Clínicos (Scoreboard)'
    | 'Formulários SUS'
    | 'Kits de Plantão'
    | 'Medicamentos (RENAME/SUS)';
  title: string;
  subtitle: string;
  badge?: string;
  shortcut?: string;
  icon: IconName;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectSusDoc,
  onSelectScore,
  onSelectProtocol,
  hospitalBeds = [],
  onSelectHospitalBed,
  onAplicarKit,
  onUsarMedicamento,
  onOpenPatientModal,
  onOpenDoctorModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useModalAccessibility(isOpen, onClose, dialogRef, inputRef);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allOptions = useMemo<CommandOption[]>(() => {
    const navOptions: CommandOption[] = [
      {
        id: 'nav-prescription',
        group: 'Navegação Rápida',
        title: 'Receitas Médicas',
        subtitle: 'Construtor de prescrição simples, antimicrobianos e controle especial',
        shortcut: 'Alt+1',
        icon: 'receita',
        action: () => {
          onSelectTab('prescription');
          onClose();
        },
      },
      {
        id: 'nav-documents',
        group: 'Navegação Rápida',
        title: 'Central de Documentos (Atestado, Encaminhamento, Exames)',
        subtitle: 'Emissão de atestados CFM, encaminhamentos e pedidos de exames',
        shortcut: 'Alt+2',
        icon: 'documentos',
        action: () => {
          onSelectTab('documents');
          onClose();
        },
      },
      {
        id: 'nav-certificate',
        group: 'Navegação Rápida',
        title: 'Atestado Médico (Res. CFM 1.658/2002)',
        subtitle: 'Abrir diretamente o formulário de Atestado Médico com sigilo de CID-10',
        badge: 'CFM',
        icon: 'atestado',
        action: () => {
          onSelectTab('certificate');
          onClose();
        },
      },
      {
        id: 'nav-referral',
        group: 'Navegação Rápida',
        title: 'Encaminhamento Médico Especializado',
        subtitle: 'Abrir diretamente a guia de Encaminhamento e Regulação Clínica',
        badge: 'Regulação',
        icon: 'encaminhamento',
        action: () => {
          onSelectTab('referral');
          onClose();
        },
      },
      {
        id: 'nav-exams',
        group: 'Navegação Rápida',
        title: 'Pedidos de Exames (SADT / Laboratório e Imagem)',
        subtitle: 'Abrir diretamente a solicitação de exames complementares e kits laboratoriais',
        badge: 'SADT',
        icon: 'exame',
        action: () => {
          onSelectTab('exams');
          onClose();
        },
      },
      {
        id: 'nav-sus',
        group: 'Navegação Rápida',
        title: 'Formulários Oficiais do SUS (APAC, LME, SISREG, GAL, SISCAN)',
        subtitle: 'Abrir aba de guias e impressos oficiais do SUS',
        shortcut: 'Alt+6',
        icon: 'description',
        action: () => {
          onSelectTab('sus');
          onClose();
        },
      },
      {
        id: 'nav-pediatric',
        group: 'Navegação Rápida',
        title: 'Calculadora Pediátrica por Peso',
        subtitle: 'Cálculo determinístico mg/kg → mL e gotas',
        shortcut: 'Alt+3',
        icon: 'calculate',
        action: () => {
          onSelectTab('pediatric_calc');
          onClose();
        },
      },
      {
        id: 'nav-protocols',
        group: 'Navegação Rápida',
        title: 'Protocolos Clínicos & Urgência',
        subtitle: 'Condutas ambulatoriais e diluições de emergência por peso',
        shortcut: 'Alt+4',
        icon: 'coracao',
        action: () => {
          onSelectTab('protocols');
          onClose();
        },
      },
      {
        id: 'nav-scores',
        group: 'Navegação Rápida',
        title: 'Escores Clínicos & Scoreboard CDSS (114 Escores, BIC & EPARADA)',
        subtitle: 'Catálogo monográfico de 114 escores, Radar SVG 60fps, Drogas Vasoativas em BIC, EPARADA e Rastreio INCA',
        shortcut: 'Alt+8',
        icon: 'monitor_heart',
        action: () => {
          onSelectTab('scores');
          onClose();
        },
      },
      {
        id: 'nav-editor',
        group: 'Navegação Rápida',
        title: 'Editor A4 & Timbrados',
        subtitle: 'Processador de texto livre em folha A4 com 1 ou 2 vias',
        shortcut: 'Alt+5',
        icon: 'editor',
        action: () => {
          onSelectTab('editor');
          onClose();
        },
      },
      {
        id: 'nav-hospital',
        group: 'Navegação Rápida',
        title: 'Módulo Hospitalar e Gestão de Pacientes (Leitos EF/LT)',
        subtitle: 'Admissão manual e multimodal via IA, evolução 24h, curva de exames, Conduta x Evolução e Agente Science',
        shortcut: 'Alt+7',
        icon: 'local_hospital',
        action: () => {
          onSelectTab('hospital');
          onClose();
        },
      },
      {
        id: 'nav-patient',
        group: 'Navegação Rápida',
        title: 'Identificar Paciente & Peso (kg)',
        subtitle: 'Cadastrar nome, CPF/CNS, peso e alergias do paciente',
        icon: 'person_add',
        action: () => {
          onClose();
          onOpenPatientModal();
        },
      },
      {
        id: 'nav-doctor',
        group: 'Navegação Rápida',
        title: 'Configurar Médico Emitente (CRM / RQE / CNES)',
        subtitle: 'Editar identificação profissional e posto de atendimento',
        icon: 'badge',
        action: () => {
          onClose();
          onOpenDoctorModal();
        },
      },
    ];

    const susOptions: CommandOption[] = SUS_DOCUMENTS_CATALOG.map((doc) => ({
      id: `sus-${doc.id}`,
      group: 'Formulários SUS',
      title: doc.shortTitle,
      subtitle: `${doc.system} • ${doc.description}`,
      badge: doc.badge,
      icon: 'description',
      action: () => {
        if (onSelectSusDoc) {
          onSelectSusDoc(doc.id);
        } else {
          onSelectTab('sus');
        }
        onClose();
      },
    }));

    const kitOptions: CommandOption[] = CLINICAL_KITS.map((kit) => ({
      id: `kit-${kit.id}`,
      group: 'Kits de Plantão',
      title: `Kit: ${kit.name}`,
      subtitle: kit.description || `${kit.items.length} medicamentos padronizados`,
      badge: kit.badge,
      icon: 'medication',
      action: () => {
        onAplicarKit(kit);
        onClose();
      },
    }));

    const bedOptions: CommandOption[] = hospitalBeds.map((bed) => ({
      id: `bed-${bed.id}`,
      group: 'Leitos Hospitalares (MOD-03)',
      title: `Leito ${bed.wardAndBed} — ${bed.patientNameOrInitials || 'Paciente Internado'}`,
      subtitle: `${bed.diagnosticHypotheses?.[0]?.diseaseAndDate || 'Enfermaria Clínica'} • DIH: ${bed.dihDateBr || '—'}`,
      badge: 'MOD-03',
      icon: 'local_hospital',
      action: () => {
        if (onSelectHospitalBed) {
          onSelectHospitalBed(bed.id);
        } else {
          onSelectTab('hospital');
        }
        onClose();
      },
    }));

    const pathologyProtocolOptions: CommandOption[] = PATHOLOGY_PROTOCOLS.map((prot) => ({
      id: `prot-path-${prot.id}`,
      group: 'Protocolos Clínicos & Urgência',
      title: `Protocolo: ${prot.name}`,
      subtitle: `${prot.category} • ${prot.firstLineSummary}`,
      badge: prot.category,
      icon: 'coracao',
      action: () => {
        if (onSelectProtocol) {
          onSelectProtocol(prot.name);
        } else {
          onSelectTab('protocols');
        }
        onClose();
      },
    }));

    const emergencyProtocolOptions: CommandOption[] = CLINICAL_PROTOCOLS.map((em) => ({
      id: `prot-em-${em.id}`,
      group: 'Protocolos Clínicos & Urgência',
      title: `Urgência: ${em.title} (${em.condition})`,
      subtitle: `${em.ruleFormula} • ${em.routeDilution}`,
      badge: 'Urgência',
      icon: 'emergency',
      action: () => {
        if (onSelectProtocol) {
          onSelectProtocol(em.title);
        } else {
          onSelectTab('protocols');
        }
        onClose();
      },
    }));

    return [
      ...navOptions,
      ...bedOptions,
      ...pathologyProtocolOptions,
      ...emergencyProtocolOptions,
      ...susOptions,
      ...kitOptions,
    ];
  }, [
    hospitalBeds,
    onAplicarKit,
    onClose,
    onOpenDoctorModal,
    onOpenPatientModal,
    onSelectHospitalBed,
    onSelectProtocol,
    onSelectSusDoc,
    onSelectTab,
  ]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allOptions.slice(0, 14);
    }
    const matchedNonMeds = allOptions.filter(
      (opt) =>
        opt.title.toLowerCase().includes(q) ||
        opt.subtitle.toLowerCase().includes(q) ||
        opt.group.toLowerCase().includes(q) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
    const matchedScores: CommandOption[] = searchScoreboardCatalog(query, 'ALL')
      .slice(0, 8)
      .map((scoreItem) => ({
        id: `score-${scoreItem.id}`,
        group: 'Escores Clínicos (Scoreboard)',
        title: `${scoreItem.acronym} — ${scoreItem.name}`,
        subtitle: scoreItem.summary,
        badge: scoreItem.hasInfusionProtocol ? 'Escore + BIC' : 'Escore CDSS',
        icon: 'monitor_heart',
        action: () => {
          if (onSelectScore) {
            onSelectScore(scoreItem.id);
          } else {
            onSelectTab('scores');
          }
          onClose();
        },
      }));
    const matchedMeds: CommandOption[] = searchUnifiedMedicationsFuzzy(UNIFIED_MEDICATIONS, query, 'all')
      .slice(0, 10)
      .map((med) => ({
        id: `med-${med.id}`,
        group: 'Medicamentos (RENAME/SUS)',
        title: med.name,
        subtitle: `${med.defaultPosology} (${med.defaultQuantity})`,
        badge: med.route,
        icon: 'pill',
        action: () => {
          onUsarMedicamento(med);
          onClose();
        },
      }));
    return [...matchedNonMeds, ...matchedScores, ...matchedMeds].slice(0, 20);
  }, [allOptions, onClose, onSelectScore, onSelectTab, onUsarMedicamento, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : 0
      );
    } else if (e.key === 'Enter' && filteredOptions[selectedIndex]) {
      e.preventDefault();
      filteredOptions[selectedIndex].action();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Busca Rápida e Navegação Global"
      data-state="idle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1200] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-xs animate-backdrop-fade no-print"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl tactile-modal modal-content modal-surface-spring overflow-hidden border border-subtle dark:border-strong"
      >
        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle dark:border-strong bg-[var(--surface-card)]">
          <Icon name="search" size={20} className="text-sky-600 dark:text-sky-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-command-palette-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ex.: APAC, Amoxicilina, Kit Dengue, Calculadora Pediátrica..."
            aria-label="Pesquisar módulo, guia SUS, kit de plantão ou medicamento"
            className="w-full bg-transparent text-sm sm:text-base font-medium text-[var(--text-main)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="btn-tactile-icon !w-9 !h-9 !min-w-9 !min-h-9"
            >
              <Icon name="close" size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca rápida"
            className="px-2.5 py-1.5 rounded-lg border border-subtle dark:border-strong text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Lista de Resultados */}
        <div
          role="listbox"
          aria-label="Resultados da busca rápida"
          className="max-h-[62vh] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-[var(--bg-app)]"
        >
          {filteredOptions.length === 0 ? (
            <div className="p-8 text-center text-xs sm:text-sm text-[var(--text-muted)]">
              Nenhum módulo, kit ou medicamento encontrado para <strong className="text-[var(--text-main)]">"{query}"</strong>.
            </div>
          ) : (
            filteredOptions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-[#27354A] border-slate-300 dark:border-white/15 text-[var(--text-main)] shadow-tactile-sm'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border-transparent text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-[var(--bg-app)] text-sky-600 dark:text-sky-400 border-subtle dark:border-strong'
                      }`}
                    >
                      <Icon name={item.icon} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-semibold text-[var(--text-muted)] hidden sm:inline">
                          • {item.group}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && <Badge tone="info">{item.badge}</Badge>}
                    {item.shortcut && (
                      <Badge tone="neutral" tabular>
                        {item.shortcut}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Rodapé de Dicas de Teclado */}
        <div className="px-4 py-2.5 border-t border-subtle dark:border-strong bg-[var(--surface-card)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-[var(--text-main)]">↑↓</strong> navegar
            </span>
            <span>
              <strong className="text-[var(--text-main)]">Enter</strong> abrir
            </span>
            <span>
              <strong className="text-[var(--text-main)]">Esc</strong> fechar
            </span>
          </div>
          <span className="hidden sm:inline clinical-tabular-nums">
            Atalhos: Alt+1..8 • Ctrl+K
          </span>
        </div>
      </div>
    </div>
  );
};
