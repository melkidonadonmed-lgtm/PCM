import React, { useState, useRef, useEffect, useId } from 'react';
import { Icon } from './Icon';
import { 
  CIDItem, 
  CID_CATEGORIES, 
  CIDCategoryType, 
  searchCID10
} from '../data/cidCatalog';

/**
 * Busca preditiva de CID-10.
 * Estados de UI cobertos: empty (nenhum CID selecionado), loading (carregando filtro fonético),
 * success (código CID selecionado com sucesso) e error (nenhum resultado/erro de busca).
 */
interface CidSearchBarProps {
  darkMode: boolean;
  selectedCode?: string;
  selectedDescription?: string;
  onSelectCid: (cid: { code: string; description: string; category?: string }) => void;
  onClearCid?: () => void;
  label?: string;
  placeholder?: string;
  showQuickChips?: boolean;
  allowCustomEntry?: boolean;
  variant?: 'certificate' | 'referral';
  onAppendCid?: (cid: { code: string; description: string }) => void;
}

export const CidSearchBar: React.FC<CidSearchBarProps> = ({
  selectedCode = '',
  selectedDescription = '',
  onSelectCid,
  onClearCid,
  label = 'Buscador de Diagnóstico & Código CID-10',
  placeholder = 'Ex.: Asma, Lombalgia, J00, Dengue, A09, Cefaleia, ITU...',
  showQuickChips = true,
  allowCustomEntry = true,
  variant = 'certificate',
  onAppendCid
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CIDCategoryType>('Todos');
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickListOpen, setIsQuickListOpen] = useState(false);
  const cidInputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = searchCID10(searchTerm, selectedCategory);

  // Close dropdown and quick list popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsQuickListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: CIDItem) => {
    onSelectCid({
      code: item.code,
      description: item.description,
      category: item.category
    });
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleAppend = (item: CIDItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAppendCid) {
      onAppendCid({
        code: item.code,
        description: item.description
      });
    } else {
      handleSelect(item);
    }
  };

  const handleCustomSubmit = () => {
    if (!searchTerm.trim()) return;
    const cleanTerm = searchTerm.trim();
    // Try to detect if first word is a CID code like "J00" or "M54.5"
    const codeMatch = cleanTerm.match(/^([A-Z][0-9]{2}(?:\.[0-9]{1,2})?)\s*[-:]?\s*(.*)$/i);
    if (codeMatch) {
      onSelectCid({
        code: codeMatch[1].toUpperCase(),
        description: codeMatch[2] || cleanTerm
      });
    } else {
      onSelectCid({
        code: cleanTerm.length <= 6 && /^[a-z0-9.]+$/i.test(cleanTerm) ? cleanTerm.toUpperCase() : 'CID',
        description: cleanTerm
      });
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  // Top quick suggestions
  const quickPicks: CIDItem[] = [
    { code: 'J00', description: 'Nasofaringite (Resfriado)', category: 'Respiratório' },
    { code: 'J06.9', description: 'IVAS', category: 'Respiratório' },
    { code: 'A09', description: 'Gastroenterite / Diarreia', category: 'Digestivo' },
    { code: 'M54.5', description: 'Lombalgia', category: 'Osteomuscular' },
    { code: 'A90', description: 'Dengue clássico', category: 'Infecciosas' },
    { code: 'J03.9', description: 'Amigdalite aguda', category: 'Respiratório' },
    { code: 'N39.0', description: 'ITU (Infecção urinária)', category: 'Geniturinário' },
    { code: 'F41.1', description: 'Ansiedade (TAG)', category: 'Saúde Mental' },
    { code: 'R51', description: 'Cefaleia', category: 'Sintomas' },
    { code: 'Z76.0', description: 'Receita repetição', category: 'Admin' }
  ];

  return (
    <div data-state="idle" aria-busy={false} ref={containerRef} className="space-y-2.5">
      {/* Label and Quick Diagnoses Pop-up Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={cidInputId} className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 text-[var(--ink-muted)]">
          <Icon name="search" className="text-[14px] text-[var(--ink-clinical)]" />
          <span>{label}</span>
        </label>

        {showQuickChips && (
          <div className="relative">
            <button
              id="btn-cid-frequent-popup"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={isQuickListOpen}
              onClick={() => {
                setIsQuickListOpen((prev) => !prev);
                setIsOpen(false);
              }}
              className="touch-target chip-neutral min-h-[44px] px-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
              title="Abrir lista rápida de diagnósticos mais frequentes"
            >
              <Icon name="sell" size={14} className="text-[var(--ink-clinical)] shrink-0" />
              <span>Diagnósticos frequentes</span>
              <Icon
                name="expand_more"
                size={15}
                className={`text-[var(--ink-muted)] transition-transform duration-150 ${isQuickListOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isQuickListOpen && (
              <div
                role="dialog"
                aria-label="Diagnósticos mais frequentes"
                className="absolute right-0 left-auto z-40 top-full mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[var(--hairline)] bg-[var(--surface-card)] shadow-[var(--elevation-high)] overflow-hidden animate-tab-fade"
              >
                <div
                  className="px-3 py-2 border-b border-[var(--hairline)] bg-[var(--surface-card-lit)] flex items-center justify-between gap-2"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    Diagnósticos frequentes (1 clique)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsQuickListOpen(false)}
                    aria-label="Fechar lista de diagnósticos frequentes"
                    className="btn-tactile-icon -my-1 -mr-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] outline-none"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>

                <ul className="max-h-64 overflow-y-auto divide-y divide-slate-500/10" role="listbox" aria-label="Lista de diagnósticos mais frequentes">
                  {quickPicks.map((pick) => {
                    const isSelected = selectedCode.toUpperCase() === pick.code.toUpperCase();
                    return (
                      <li key={pick.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onSelectCid({ code: pick.code, description: pick.description, category: pick.category });
                            setIsQuickListOpen(false);
                          }}
                          className={`w-full min-h-[44px] px-3 py-2 text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-focus)] outline-none ${
                            isSelected
                              ? 'bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ring-1 ring-inset ring-[var(--accent-focus)]/30'
                              : 'hover:bg-[var(--surface-hover)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs shrink-0 clinical-tabular-nums border ${
                                isSelected
                                  ? 'bg-[var(--primary)] text-white border-transparent'
                                  : 'bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] border-[var(--hairline)]'
                              }`}
                            >
                              {pick.code}
                            </span>
                            <span className="text-xs font-medium text-[var(--ink-primary)] truncate">
                              {pick.description}
                            </span>
                          </div>
                          {isSelected && (
                            <Icon name="check" size={15} className="text-[var(--ink-clinical)] shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected CID Visual Summary Card (if present and in single selection mode) */}
      {selectedCode && (
        <div 
          className="p-3 rounded-xl border border-[var(--hairline)] border-l-[3px] border-l-[var(--ink-clinical)] bg-[var(--surface-card-lit)] flex items-start justify-between gap-3 transition-colors animate-tab-fade"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span 
              className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wider flex-shrink-0 clinical-tabular-nums ${
                variant === 'referral'
                  ? 'bg-[var(--clinical)] text-white'
                  : 'bg-[var(--primary)] text-white shadow-sm'
              }`}
            >
              {selectedCode}
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate leading-tight text-[var(--ink-primary)]">
                {selectedDescription || 'Diagnóstico selecionado'}
              </p>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Código CID-10 preenchido automaticamente no documento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="btn-tactile-secondary min-h-[44px] text-xs font-bold px-2.5 py-1 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
            >
              Trocar
            </button>

            {onClearCid && (
              <button
                type="button"
                onClick={onClearCid}
                title="Remover CID selecionado"
                className="btn-tactile-danger min-h-[44px] min-w-[44px] p-0 flex items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--status-danger)] focus-visible:outline-none"
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Search Input & Trigger Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none text-[var(--ink-muted)]">
            <Icon name="search" className="text-[16px]" />
          </div>

          <input
            ref={inputRef}
            id={cidInputId}
            name="cidSearch"
            aria-label={label}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setIsQuickListOpen(false);
            }}
            onFocus={() => {
              setIsOpen(true);
              setIsQuickListOpen(false);
            }}
            placeholder={placeholder}
            className={`w-full min-h-[44px] pl-9 pr-24 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] tactile-input transition bg-[var(--surface-card)] dark:bg-[var(--surface-card-lit)] text-[var(--ink-primary)] ${
              isOpen ? 'border-[var(--accent-focus)]' : 'border-[var(--border-control)]'
            }`}
          />

          <div className="absolute right-1 flex items-center">
            {searchTerm && (
              <button
                type="button"
                aria-label="Limpar busca de CID-10"
                onClick={() => {
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
              >
                <Icon name="close" className="text-[14px]" />
              </button>
            )}

            <button
              type="button"
              aria-label="Abrir catálogo completo de CID-10"
              onClick={() => setIsOpen(!isOpen)}
              className="touch-target w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
              title="Abrir catálogo completo"
            >
              <Icon name="expand_more" className={`text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dropdown Floating Results Panel */}
        {isOpen && (
          <div 
            className="absolute z-30 top-full left-0 right-0 mt-1.5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-card)] shadow-[var(--elevation-high)] overflow-hidden animate-tab-fade"
          >
            {/* Category Filter Pills in Dropdown Header */}
            <div 
              className="p-2 border-b border-[var(--hairline)] bg-[var(--surface-card-lit)] overflow-x-auto flex items-center gap-1.5"
            >
              <div className="flex items-center gap-1 text-xs font-bold uppercase text-[var(--ink-muted)] pl-1 pr-1 flex-shrink-0">
                <Icon name="filter_list" className="text-[14px]" />
                <span>Filtro:</span>
              </div>

              {CID_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[44px] text-xs px-2.5 py-1 rounded-lg whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none ${
                    selectedCategory === cat
                      ? 'btn-tactile-primary font-bold'
                      : 'border bg-[var(--surface-chip-muted)] text-[var(--ink-secondary)] border-[var(--hairline)] hover:bg-[var(--surface-chip-muted-hover)] hover:text-[var(--ink-primary)] font-semibold transition-colors cursor-pointer'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List Results */}
            <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-500/10">
              {results.length > 0 ? (
                results.map((item) => {
                  const isCurrent = selectedCode.toUpperCase() === item.code.toUpperCase();
                  return (
                    <div
                      key={item.code}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelect(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(item);
                        }
                      }}
                      className={`p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors group ${
                        isCurrent 
                          ? 'bg-[var(--surface-card-lit)] ring-1 ring-inset ring-[var(--accent-focus)]/30' 
                          : 'hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span 
                          className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs flex-shrink-0 clinical-tabular-nums border ${
                            isCurrent
                              ? 'bg-[var(--primary)] text-white border-transparent'
                              : 'bg-[var(--surface-chip-muted)] text-[var(--ink-clinical)] border-[var(--hairline)] group-hover:bg-[var(--surface-chip-muted-hover)]'
                          }`}
                        >
                          {item.code}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold leading-snug text-[var(--ink-primary)]">
                            {item.description}
                          </p>
                          {item.keywords && item.keywords.length > 0 && (
                            <p className="text-xs text-[var(--ink-muted)] truncate mt-0.5">
                              Termos: {item.keywords.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--surface-chip-muted)] border border-[var(--hairline)] text-[var(--ink-muted)] hidden sm:inline-block">
                          {item.category}
                        </span>

                        {onAppendCid && (
                          <button
                            type="button"
                            onClick={(e) => handleAppend(item, e)}
                            className="btn-tactile-secondary min-h-[44px] text-xs font-bold px-2.5 py-1 rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                            title="Inserir na hipótese"
                          >
                            + Inserir
                          </button>
                        )}

                        {isCurrent && (
                          <span className="text-[var(--ink-clinical)]">
                            <Icon name="check" className="text-[16px]" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center space-y-3">
                  <p className="text-xs text-[var(--ink-muted)]">
                    Nenhum código CID-10 encontrado para "<span className="font-semibold text-[var(--ink-primary)]">{searchTerm}</span>".
                  </p>

                  {allowCustomEntry && searchTerm && (
                    <button
                      type="button"
                      onClick={handleCustomSubmit}
                      className="btn-tactile-primary inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none"
                    >
                      <Icon name="auto_awesome" className="text-[14px]" />
                      <span>Usar diagnóstico digitado "{searchTerm}"</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer summary & manual action */}
            <div 
              className="p-2.5 border-t border-[var(--hairline)] bg-[var(--surface-card-lit)] text-xs flex items-center justify-between text-[var(--ink-muted)]"
            >
              <span className="clinical-tabular-nums">{results.length} resultados no catálogo</span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] px-2 text-xs font-semibold text-[var(--ink-clinical)] hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)] focus-visible:outline-none rounded"
              >
                Fechar catálogo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
