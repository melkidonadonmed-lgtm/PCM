import React from 'react';
import { Icon } from '../Icon';
import type { ManifestItem } from '../../utils/scores/scoreTypes';
import { SCOREBOARD_BLOCKS_META } from '../../data/scores/scoreboardManifest';

interface ScoreCatalogTabSectionProps {
  searchQuery: string;
  selectedBlockId: string;
  onlyFavoritesFilter: boolean;
  favoriteIdsCount: number;
  favoriteSet: Set<string>;
  filteredManifest: ManifestItem[];
  onSearchQueryChange: (q: string) => void;
  onSelectBlockId: (blockId: string) => void;
  onToggleOnlyFavorites: () => void;
  onClearFilters: () => void;
  onToggleFavorite: (calcId: string) => void;
  onSelectScore: (idOrSlug: string) => void;
}

export const ScoreCatalogTabSection: React.FC<ScoreCatalogTabSectionProps> = ({
  searchQuery,
  selectedBlockId,
  onlyFavoritesFilter,
  favoriteIdsCount,
  favoriteSet,
  filteredManifest,
  onSearchQueryChange,
  onSelectBlockId,
  onToggleOnlyFavorites,
  onClearFilters,
  onToggleFavorite,
  onSelectScore,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="cq-card card-surface surface-card-minimal rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[240px]">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              aria-label="Buscar escore clínico por sigla, nome, síndrome ou CID"
              placeholder="Ex.: qSOFA, SOFA, Glasgow-P, Wells TEP, CHA2DS2-VASc, Child-Pugh, Balanço Sagital..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {(searchQuery || selectedBlockId !== 'ALL' || onlyFavoritesFilter) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="touch-target chip-neutral min-h-[44px] min-w-[44px] px-3 rounded-xl border border-rose-300 dark:border-rose-400/35 bg-rose-50/90 dark:bg-rose-950/50 text-xs font-semibold text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/70 hover:text-rose-900 dark:hover:text-rose-100 inline-flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-500 transition"
              title="Limpar busca e filtros do catálogo"
            >
              <Icon name="close" size={14} />
              <span>Limpar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleOnlyFavorites}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
              onlyFavoritesFilter
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Icon name="star" className="text-sm" />
            Apenas Favoritos ({favoriteIdsCount})
          </button>
        </div>

        {/* Pílulas de Blocos de Especialidades */}
        <div className="flex flex-wrap gap-1.5">
          {SCOREBOARD_BLOCKS_META.map((blk) => {
            const isSelected = selectedBlockId === blk.blockId;
            return (
              <button
                key={blk.blockId}
                type="button"
                onClick={() => onSelectBlockId(blk.blockId)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <Icon name={blk.icon} className="text-sm" />
                <span>{blk.shortLabel}</span>
                <span className="rounded bg-[oklch(0.20_0.02_255/0.10)] dark:bg-white/10 px-1.5 py-0.5 font-mono text-[11px] clinical-tabular-nums">
                  {blk.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredManifest.map((item) => {
          const isFav = favoriteSet.has(item.id);
          return (
            <div
              key={item.id}
              className="cq-card card-surface surface-card-minimal flex flex-col justify-between rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4 transition hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-elevation-medium"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-blue-600/10 dark:bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                    {item.acronym}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.hasInfusionProtocol ? (
                      <span className="rounded bg-[var(--accent-emerald-subtle)] border border-[var(--accent-emerald-border)] px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-200">
                        +BIC
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      aria-label={
                        isFav
                          ? `Remover ${item.acronym} dos favoritos`
                          : `Fixar ${item.acronym} nos favoritos`
                      }
                      className={`touch-target w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 -mt-2 inline-flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                        isFav
                          ? 'text-amber-500'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Icon name="star" className="text-sm" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/70 pt-2.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-44">
                  {item.categoryName}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectScore(item.id)}
                  className="touch-target min-h-[44px] inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                >
                  Abrir Escore
                  <Icon name="arrow_forward" className="text-xs" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
