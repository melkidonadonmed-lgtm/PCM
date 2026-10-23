import React from 'react';
import { SusDocumentItem, SusDocumentId } from '../../types';
import { formularioOficialDe } from '../../data/formulariosOficiaisSus';
import { Icon } from '../Icon';

interface SusCatalogListViewProps {
  darkMode: boolean;
  selectedCategory: string;
  searchTerm: string;
  selectedDocIds: SusDocumentId[];
  filteredCatalog: SusDocumentItem[];
  onSelectCategory: (category: string) => void;
  onSearchTermChange: (term: string) => void;
  onToggleDocSelection: (id: SusDocumentId) => void;
  onStartFillingSingle: (id: SusDocumentId) => void;
  onStartFillingMultiple: () => void;
}

export const SusCatalogListView: React.FC<SusCatalogListViewProps> = ({
  darkMode,
  selectedCategory,
  searchTerm,
  selectedDocIds,
  filteredCatalog,
  onSelectCategory,
  onSearchTermChange,
  onToggleDocSelection,
  onStartFillingSingle,
  onStartFillingMultiple,
}) => {
  return (
    <div className="space-y-3">
      {/* Barra Compacta de Cabeçalho, Busca e Filtros */}
      <div
        className="tactile-card p-3 sm:p-3.5 rounded-2xl border space-y-2.5"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-navy-900 dark:bg-[#0369A1] border border-white/12 shadow-tactile-sm shrink-0">
              <Icon name="description" size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate">
                  Documentos & Requisições Oficiais do SUS
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 clinical-tabular-nums">
                  9 modelos
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">
                Toque em uma guia para preencher ou marque várias para emissão em lote.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/formularios-sus-offline.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-2.5 py-1.5 min-h-[36px] rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-[#27354A] text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-[#334155] transition flex items-center gap-1.5 clinical-tabular-nums"
              title="Abrir Central Regulatória SUS A4 Vetorial (9 modelos editáveis diretos na folha)"
            >
              <Icon name="print" size={14} />
              <span>Central A4 Vetorial</span>
            </a>

            {selectedDocIds.length > 0 && (
              <button
                type="button"
                onClick={onStartFillingMultiple}
                className="btn-tactile-primary text-xs font-semibold px-3 py-1.5 min-h-[36px] flex items-center gap-1.5 cursor-pointer shrink-0 clinical-tabular-nums"
              >
                <Icon name="layers" size={14} />
                <span>Preencher ({selectedDocIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros e Barra de Busca na mesma superfície compacta */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)]">
          {/* Categorias em Pílulas Compactas */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'todos', label: 'Todos (9)' },
              { id: 'apac', label: 'APAC (2)' },
              { id: 'sisreg', label: 'SISREG (1)' },
              { id: 'lme', label: 'LME Alto Custo (1)' },
              { id: 'siscan', label: 'SISCAN (3)' },
              { id: 'gal', label: 'GAL / LACEN (2)' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`text-xs font-semibold px-2.5 py-1 min-h-[32px] rounded-lg border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 clinical-tabular-nums ${
                  selectedCategory === cat.id
                    ? 'bg-navy-900 dark:bg-[#0369A1] text-white border-navy-900 dark:border-sky-500/30 shadow-tactile-sm'
                    : 'bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-[#334155]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Campo de Busca */}
          <div className="relative min-w-[220px] md:w-64">
            <Icon name="search" size={14} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Buscar exame ou documento SUS"
              placeholder="Ex.: APAC, LME, Tomografia, Mamografia, Dengue..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 min-h-[34px] text-xs rounded-xl bg-[var(--surface-inset)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder:text-[var(--text-placeholder)] focus:border-info focus-visible:ring-1 focus-visible:ring-sky-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Grid Compacto de Documentos Oficiais do SUS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
        {filteredCatalog.map((doc) => {
          const isSelected = selectedDocIds.includes(doc.id);
          const isOfficialForm = Boolean(formularioOficialDe(doc.id));
          return (
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              onClick={() => onStartFillingSingle(doc.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onStartFillingSingle(doc.id);
                }
              }}
              className={`tactile-card-interactive rounded-xl px-3 py-2.5 flex items-start gap-2.5 border relative group cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500 outline-none ${
                isSelected
                  ? 'border-sky-500/50 dark:border-sky-400/40 bg-sky-50/70 dark:bg-[#27354A] shadow-tactile-sm'
                  : 'hover:border-slate-300 dark:hover:border-white/15'
              }`}
              style={{
                backgroundColor: isSelected ? undefined : darkMode ? 'var(--surface-card)' : '#FFFFFF',
              }}
            >
              {/* Checkbox de Seleção Múltipla */}
              <button
                type="button"
                aria-label={`Selecionar ${doc.shortTitle}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDocSelection(doc.id);
                }}
                className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center transition border shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-navy-900 dark:bg-[#0369A1] border-navy-900 dark:border-sky-500/40 text-white shadow-xs'
                    : 'border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-[#27354A] hover:border-slate-400 text-transparent'
                }`}
              >
                <Icon name="check" size={12} />
              </button>

              {/* Conteúdo Enxuto em 2 Linhas */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <h3
                    title={doc.title}
                    className="text-xs sm:text-[13px] font-bold text-[var(--text-main)] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate leading-snug"
                  >
                    {doc.shortTitle}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    {isOfficialForm && (
                      <span
                        title="Emissão sobre o impresso oficial do Ministério da Saúde"
                        className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 whitespace-nowrap"
                      >
                        Impresso MS
                      </span>
                    )}
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#27354A] text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-white/10 whitespace-nowrap">
                      {doc.system.split(' ')[0].replace(',', '')}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5" title={doc.description}>
                  {doc.description}
                </p>

                <div className="flex items-center justify-between gap-2 mt-1 text-[11px]">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 clinical-tabular-nums truncate">
                    SIGTAP {doc.defaultSigtap || 'Diversos'}
                  </span>
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 group-hover:underline inline-flex items-center gap-0.5 shrink-0">
                    <span>Preencher</span>
                    <Icon name="chevron_right" size={13} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
