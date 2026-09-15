import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check, Tag, Sparkles, Filter, AlertCircle, ChevronDown } from 'lucide-react';
import { 
  CIDItem, 
  CID_CATEGORIES, 
  CIDCategoryType, 
  searchCID10, 
  COMMON_CID10 
} from '../data/cidCatalog';

interface CidSearchBarProps {
  darkMode: boolean;
  selectedCode?: string;
  selectedDescription?: string;
  selectedCodes?: string[];
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
  darkMode,
  selectedCode = '',
  selectedDescription = '',
  selectedCodes = [],
  onSelectCid,
  onClearCid,
  label = 'Buscador de Diagnóstico & Código CID-10',
  placeholder = 'Digite o diagnóstico ou código (ex: Asma, Lombalgia, J00, Dengue, A09, Cefaleia, ITU)...',
  showQuickChips = true,
  allowCustomEntry = true,
  variant = 'certificate',
  onAppendCid
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CIDCategoryType>('Todos');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [justAddedCode, setJustAddedCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerJustAdded = (code: string) => {
    setJustAddedCode(code);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setJustAddedCode(null), 2000);
  };

  const results = searchCID10(searchTerm, selectedCategory);

  // Check if a code is currently active/selected
  const isCodeSelected = (code: string) => {
    const clean = code.toUpperCase();
    if (selectedCode && selectedCode.toUpperCase() === clean) return true;
    if (selectedCodes && selectedCodes.some(c => c.toUpperCase() === clean)) return true;
    return false;
  };

  const handleSelect = (item: CIDItem) => {
    if (variant === 'referral' && onAppendCid) {
      onAppendCid({
        code: item.code,
        description: item.description
      });
      triggerJustAdded(item.code);
    } else {
      onSelectCid({
        code: item.code,
        description: item.description,
        category: item.category
      });
      triggerJustAdded(item.code);
      setSearchTerm('');
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleAppend = (item: CIDItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAppendCid) {
      onAppendCid({
        code: item.code,
        description: item.description
      });
    } else {
      onSelectCid({
        code: item.code,
        description: item.description,
        category: item.category
      });
    }
    triggerJustAdded(item.code);
  };

  const handleCustomSubmit = () => {
    if (!searchTerm.trim()) return;
    const cleanTerm = searchTerm.trim();
    // Try to detect if first word is a CID code like "J00" or "M54.5"
    const codeMatch = cleanTerm.match(/^([A-Z][0-9]{2}(?:\.[0-9]{1,2})?)\s*[-:]?\s*(.*)$/i);
    const parsedCode = codeMatch ? codeMatch[1].toUpperCase() : (cleanTerm.length <= 6 && /^[a-z0-9.]+$/i.test(cleanTerm) ? cleanTerm.toUpperCase() : 'CID');
    const parsedDesc = codeMatch ? (codeMatch[2] || cleanTerm) : cleanTerm;

    if (variant === 'referral' && onAppendCid) {
      onAppendCid({ code: parsedCode, description: parsedDesc });
    } else {
      onSelectCid({ code: parsedCode, description: parsedDesc });
    }
    triggerJustAdded(parsedCode);
    setSearchTerm('');
    if (variant === 'certificate') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else if (results.length > 0) {
        setActiveIndex(prev => (prev + 1 < results.length ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(results.length - 1);
      } else if (results.length > 0) {
        setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      } else if (allowCustomEntry && searchTerm.trim()) {
        e.preventDefault();
        handleCustomSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
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
    <div ref={containerRef} className="space-y-2.5">
      {/* Label and Helper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label 
          htmlFor="cid-search-input"
          className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 cursor-pointer" 
          style={{ color: darkMode ? '#94A3B8' : '#475569' }}
        >
          <Search className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>{label}</span>
        </label>
        <div className="flex items-center gap-2">
          {justAddedCode && (
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>CID {justAddedCode} adicionado!</span>
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-400">
            Pesquisa por código ou termo clínico
          </span>
        </div>
      </div>

      {/* Selected CID Visual Summary Card (for single selection mode e.g. Atestado) */}
      {selectedCode && variant !== 'referral' && (
        <div 
          className="p-3 rounded-xl border flex items-start justify-between gap-3 transition-all animate-fadeIn"
          style={{
            backgroundColor: darkMode ? '#161A21' : '#F0F7FF',
            borderColor: darkMode ? 'rgba(56, 142, 230, 0.3)' : 'rgba(15, 98, 146, 0.25)'
          }}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span 
              className="px-2.5 py-1 rounded-lg text-xs font-black tracking-wider flex-shrink-0 bg-sky-700 dark:bg-sky-600 text-white shadow-xs"
            >
              {selectedCode}
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate leading-tight" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                {selectedDescription || 'Diagnóstico selecionado'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
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
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg border hover:bg-slate-500/10 cursor-pointer transition-colors"
              style={{
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
                color: darkMode ? '#93C5FD' : '#0369A1'
              }}
            >
              Trocar
            </button>

            {onClearCid && (
              <button
                type="button"
                onClick={onClearCid}
                title="Remover CID selecionado"
                aria-label="Remover CID selecionado"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Search Input & Trigger Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>

          <input
            id="cid-search-input"
            ref={inputRef}
            type="text"
            aria-label={label}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-9 pr-24 py-2.5 rounded-xl border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/40 tactile-input transition-all"
            style={{
              backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--surface-card)',
              borderColor: isOpen 
                ? (darkMode ? '#388EE6' : '#0F6292') 
                : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'),
              color: darkMode ? '#F1F5F9' : '#0F172A'
            }}
          />

          <div className="absolute right-2 flex items-center gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                }}
                aria-label="Limpar termo de busca do CID"
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-500/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fechar catálogo de CID-10" : "Abrir catálogo completo de CID-10"}
              aria-expanded={isOpen}
              className="px-2 py-1 inline-flex items-center gap-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-500/10 cursor-pointer transition-colors"
              title={isOpen ? "Recolher catálogo" : "Abrir catálogo"}
            >
              <span className="text-[11px] hidden sm:inline">{isOpen ? 'Fechar' : 'Catálogo'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-sky-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Inline Expandable Results Panel - Lives in document flow to prevent viewport clipping and accidental dismiss */}
        {isOpen && (
          <div 
            className="w-full mt-2.5 rounded-2xl border shadow-lg overflow-hidden animate-slideDown relative"
            style={{
              backgroundColor: darkMode ? 'var(--surface-elevated)' : 'var(--surface-card)',
              borderColor: darkMode ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.14)',
              boxShadow: darkMode 
                ? '0 10px 25px -5px rgba(0,0,0,0.5)' 
                : '0 10px 25px -5px rgba(15,23,42,0.1)'
            }}
          >
            {/* Category Filter Pills in Panel Header */}
            <div 
              className="p-2.5 border-b flex items-center justify-between gap-2 overflow-hidden"
              style={{
                backgroundColor: darkMode ? 'var(--surface-inset)' : '#FAF7F1',
                borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
              }}
            >
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 pl-1 pr-1 flex-shrink-0">
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">Filtro:</span>
                </div>

                {CID_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 font-bold shadow-tactile-navy dark:shadow-tactile-cream'
                        : darkMode
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                        : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-500/10 cursor-pointer flex-shrink-0 flex items-center gap-1 border border-slate-500/20"
                title="Fechar catálogo"
              >
                <X className="w-3.5 h-3.5" />
                <span className="text-[11px]">Fechar</span>
              </button>
            </div>

            {/* List Results */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-500/10">
              {results.length > 0 ? (
                results.map((item, index) => {
                  const isCurrent = isCodeSelected(item.code);
                  const isJustAdded = justAddedCode === item.code;
                  const isActive = index === activeIndex;

                  return (
                    <div
                      key={item.code}
                      onClick={() => handleSelect(item)}
                      aria-selected={isActive}
                      className={`p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors group ${
                        isActive
                          ? (darkMode ? 'bg-sky-500/20 ring-1 ring-inset ring-sky-400/40' : 'bg-sky-100 ring-1 ring-inset ring-sky-300')
                          : isJustAdded
                          ? 'bg-emerald-500/20 dark:bg-emerald-950/40'
                          : isCurrent 
                          ? (darkMode ? 'bg-sky-950/40' : 'bg-sky-50') 
                          : 'hover:bg-slate-500/10'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span 
                          className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs flex-shrink-0 ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? (variant === 'referral' ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white')
                              : darkMode
                              ? 'bg-slate-800 text-sky-400 group-hover:bg-sky-900/50 group-hover:text-sky-300'
                              : 'bg-sky-100 text-sky-800 group-hover:bg-sky-200'
                          }`}
                        >
                          {item.code}
                        </span>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold leading-snug" style={{ color: darkMode ? '#F1F5F9' : '#0F172A' }}>
                            {item.description}
                          </p>
                          {item.keywords && item.keywords.length > 0 && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              Termos: {item.keywords.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 hidden sm:inline-block">
                          {item.category}
                        </span>

                        {variant === 'referral' ? (
                          isJustAdded ? (
                            <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white flex items-center gap-1 animate-pulse">
                              <Check className="w-3.5 h-3.5" />
                              <span>Inserido!</span>
                            </span>
                          ) : isCurrent ? (
                            <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="hidden sm:inline">Na hipótese</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleAppend(item, e)}
                              className="text-xs font-bold px-3 py-1.5 min-h-[44px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                              title="Inserir na hipótese diagnóstica"
                            >
                              <Tag className="w-3 h-3" />
                              <span>Inserir</span>
                            </button>
                          )
                        ) : (
                          isCurrent && (
                            <span className="text-sky-600 dark:text-sky-400">
                              <Check className="w-4 h-4" />
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center space-y-3">
                  <p className="text-xs text-slate-400">
                    Nenhum código CID-10 encontrado para "<span className="font-semibold text-slate-200">{searchTerm}</span>".
                  </p>

                  {allowCustomEntry && searchTerm && (
                    <button
                      type="button"
                      onClick={handleCustomSubmit}
                      className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Usar diagnóstico digitado "{searchTerm}"</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer summary & manual action */}
            <div 
              className="p-2.5 border-t text-[11px] flex items-center justify-between text-slate-400"
              style={{
                backgroundColor: darkMode ? 'var(--surface-inset)' : 'var(--surface-card)',
                borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
              }}
            >
              <span>{results.length} diagnósticos disponíveis</span>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setActiveIndex(-1);
                }}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer min-h-[44px] px-2 flex items-center gap-1"
              >
                <span>Concluir seleção</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Picks / Top Diagnósticos Bar */}
      {showQuickChips && (
        <details className="space-y-1.5 pt-0.5">
          <summary className="cursor-pointer min-h-[44px] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            <span>Diagnósticos frequentes (Atalhos rápidos)</span>
          </summary>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {quickPicks.map((pick) => {
              const isSelected = isCodeSelected(pick.code);
              return (
                <button
                  key={pick.code}
                  type="button"
                  onClick={() => handleSelect(pick)}
                  className={`text-[11px] px-3 py-1.5 min-h-[44px] rounded-xl font-medium transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? (variant === 'referral' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-sky-700 text-white font-bold shadow-xs')
                      : darkMode
                      ? 'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:bg-slate-700 hover:text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50 hover:border-sky-300'
                  }`}
                  title={`${pick.code} - ${pick.description}`}
                >
                  <span className={`font-mono font-bold text-[10px] ${isSelected ? 'text-white' : 'text-sky-500 dark:text-sky-400'}`}>{pick.code}</span>
                  <span className="truncate max-w-[150px]">{pick.description.split('(')[0].trim()}</span>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
};

