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
    <div className="space-y-4">
      {/* Header Card com Status e Ação Rápida */}
      <div
        className="tactile-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-navy-900 dark:bg-[#0369A1] border border-white/12 shadow-tactile-sm shrink-0">
            <Icon name="description" className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                Documentos & Requisições Oficiais do SUS
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#27354A] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 clinical-tabular-nums">
                9 Documentos
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
              Selecione um ou vários exames da lista para preenchimento com autofill do médico e paciente.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/formularios-sus-offline.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-[#27354A] text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-[#334155] transition flex items-center gap-2 clinical-tabular-nums"
            title="Abrir Central Regulatória SUS A4 Vetorial (9 modelos editáveis diretos na folha)"
          >
            <Icon name="print" className="w-4 h-4" />
            <span>Central A4 Vetorial (9 Modelos)</span>
          </a>

          {selectedDocIds.length > 0 && (
            <button
              type="button"
              onClick={onStartFillingMultiple}
              className="btn-tactile-primary text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shrink-0 clinical-tabular-nums"
            >
              <Icon name="layers" className="w-4 h-4" />
              <span>Preencher Selecionados ({selectedDocIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros e Barra de Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Categorias em Pílulas */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'todos', label: 'Todos (9)' },
            { id: 'apac', label: 'APAC Alta Complexidade (2)' },
            { id: 'sisreg', label: 'SISREG Regulação (1)' },
            { id: 'lme', label: 'LME Alto Custo (1)' },
            { id: 'siscan', label: 'SISCAN Mulher (3)' },
            { id: 'gal', label: 'GAL / LACEN (2)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`text-xs font-semibold px-3 py-1.5 min-h-[40px] rounded-xl border transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 clinical-tabular-nums ${
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
        <div className="relative min-w-[240px]">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar exame ou documento SUS..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder:text-[var(--text-placeholder)] focus:border-info focus-visible:ring-1 focus-visible:ring-sky-500 outline-none transition"
          />
        </div>
      </div>

      {/* Grid de Documentos Oficiais do SUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredCatalog.map((doc) => {
          const isSelected = selectedDocIds.includes(doc.id);
          return (
            <div
              key={doc.id}
              className={`tactile-card-interactive rounded-2xl p-4 flex flex-col justify-between border relative group ${
                isSelected
                  ? 'border-slate-400 dark:border-white/25 bg-slate-100/80 dark:bg-[#27354A] shadow-tactile-sm'
                  : 'hover:border-slate-300 dark:hover:border-white/15'
              }`}
              style={{
                backgroundColor: darkMode ? 'var(--surface-card)' : '#FFFFFF',
              }}
              onClick={() => onStartFillingSingle(doc.id)}
            >
              <div>
                {/* Header do Card com Checkbox e Badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#27354A] text-sky-700 dark:text-sky-300 border border-slate-300 dark:border-white/10">
                    {doc.badge}
                  </span>

                  {/* Checkbox de Seleção Múltipla */}
                  <button
                    type="button"
                    aria-label={`Selecionar ${doc.shortTitle}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDocSelection(doc.id);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition border cursor-pointer ${
                      isSelected
                        ? 'bg-navy-900 dark:bg-[#0369A1] border-navy-900 dark:border-sky-500/40 text-white shadow-tactile-sm'
                        : 'border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-[#27354A] hover:border-slate-400 text-transparent'
                    }`}
                  >
                    <Icon name="check" className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-main)] group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Sistema: <span className="text-[var(--text-main)]">{doc.system}</span>
                </p>
                <p
                  className={`text-xs font-bold mt-1 ${
                    formularioOficialDe(doc.id)
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {formularioOficialDe(doc.id)
                    ? 'Sai no impresso oficial'
                    : 'Modelo do app, com os logos do SUS e do órgão'}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-3 leading-relaxed">
                  {doc.description}
                </p>
              </div>

              {/* Rodapé com SIGTAP e Ação */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-xs font-mono text-slate-500">
                  SIGTAP: {doc.defaultSigtap || 'Diversos'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartFillingSingle(doc.id);
                  }}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Preencher</span>
                  <Icon name="edit_document" className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
