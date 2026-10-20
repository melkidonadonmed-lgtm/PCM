import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icon, IconName } from '../Icon';
import { ActiveTab } from '../../types';
import { CLINICAL_KITS, ClinicalKit } from '../../data/clinicalKits';
import { SUS_DOCUMENTS_CATALOG } from '../../data/susDocumentsCatalog';
import { UNIFIED_MEDICATIONS, UnifiedMedication } from '../../data/medicationDatabase';
import { Badge } from '../ui/Badge';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onAplicarKit: (kit: ClinicalKit) => void;
  onUsarMedicamento: (med: UnifiedMedication) => void;
  onOpenPatientModal: () => void;
  onOpenDoctorModal: () => void;
}

interface CommandOption {
  id: string;
  group: 'Navegação Rápida' | 'Formulários SUS' | 'Kits de Plantão' | 'Medicamentos (RENAME/SUS)';
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
        icon: 'balanca',
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
        onSelectTab('sus');
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

    const medOptions: CommandOption[] = UNIFIED_MEDICATIONS.slice(0, 60).map((med) => ({
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

    return [...navOptions, ...susOptions, ...kitOptions, ...medOptions];
  }, [onAplicarKit, onClose, onOpenDoctorModal, onOpenPatientModal, onSelectTab, onUsarMedicamento]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allOptions.filter((opt) => opt.group !== 'Medicamentos (RENAME/SUS)').slice(0, 14);
    }
    return allOptions
      .filter(
        (opt) =>
          opt.title.toLowerCase().includes(q) ||
          opt.subtitle.toLowerCase().includes(q) ||
          opt.group.toLowerCase().includes(q) ||
          (opt.badge && opt.badge.toLowerCase().includes(q))
      )
      .slice(0, 18);
  }, [allOptions, query]);

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
        className="w-full max-w-2xl tactile-modal modal-surface-spring overflow-hidden border border-subtle dark:border-strong shadow-tactile-lg"
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
              className="btn-tactile-icon !w-9 !h-9 !min-w-[36px] !min-h-[36px]"
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
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600/12 dark:bg-sky-500/20 border border-info text-[var(--text-main)] shadow-tactile-sm'
                      : 'bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-transparent text-[var(--text-secondary)]'
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
            Atalhos: Alt+1..6 • Ctrl+K
          </span>
        </div>
      </div>
    </div>
  );
};
