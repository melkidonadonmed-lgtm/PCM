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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
            />
            <input
              id="score-catalog-search-input"
              name="scoreCatalogSearch"
              type="text"
              aria-label="Buscar escore clínico por sigla, nome, síndrome ou CID"
              placeholder="Ex.: qSOFA, SOFA, Glasgow-P, Wells TEP, CHA2DS2-VASc, Child-Pugh, Balanço Sagital..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full h-11 min-h-[44px] rounded-xl border border-[var(--border-control)] bg-[var(--surface-inset)] py-2 pl-9 pr-4 text-xs text-[var(--ink-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
            />
          </div>

          {(searchQuery || selectedBlockId !== 'ALL' || onlyFavoritesFilter) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="touch-target btn-tactile-danger min-h-[44px] min-w-[44px] px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--accent-focus)]"
              title="Limpar busca e filtros do catálogo"
            >
              <Icon name="close" size={14} />
              <span>Limpar</span>
            </button>
          )}

          <button
            type="button"
            aria-pressed={onlyFavoritesFilter}
            onClick={onToggleOnlyFavorites}
            className={`touch-target min-h-[44px] inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer ${
              onlyFavoritesFilter
                ? 'btn-tactile-primary'
                : 'btn-tactile-secondary'
            }`}
          >
            <Icon
              name="star"
              className={`text-sm ${onlyFavoritesFilter ? 'text-white' : 'text-[var(--accent-amber)]'}`}
            />
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
                aria-pressed={isSelected}
                onClick={() => onSelectBlockId(blk.blockId)}
                className={`touch-target min-h-[44px] inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  isSelected
                    ? 'btn-tactile-primary'
                    : 'btn-tactile-secondary'
                }`}
              >
                <Icon name={blk.icon} className="text-sm" />
                <span>{blk.shortLabel}</span>
                <span
                  className={`rounded-[6px] px-1.5 py-0.5 font-mono text-[11px] clinical-tabular-nums ${
                    isSelected
                      ? 'bg-white/15 text-white'
                      : 'bg-[var(--surface-chip-muted)] border border-[var(--hairline)] text-[var(--ink-secondary)]'
                  }`}
                >
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
              className="cq-card card-surface surface-card-minimal flex flex-col justify-between rounded-2xl border border-subtle dark:border-strong p-3.5 sm:p-4 transition hover:-translate-y-0.5 hover:border-[var(--border-control)] hover:shadow-elevation-medium"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ink-primary)]">
                    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" />
                    {item.acronym}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.hasInfusionProtocol ? (
                      <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--surface-chip-muted)] border border-[var(--hairline)] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[var(--ink-primary)]">
                        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--ink-clinical)] shrink-0" />
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
                          ? 'text-[var(--accent-amber)]'
                          : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      <Icon name="star" className="text-sm" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-1.5 text-sm font-bold text-[var(--ink-primary)] leading-snug">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--ink-secondary)] line-clamp-2">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[var(--hairline)] pt-2.5">
                <span className="text-[11px] font-medium text-[var(--ink-muted)] truncate max-w-44">
                  {item.categoryName}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectScore(item.id)}
                  className="touch-target btn-tactile-primary min-h-[44px] inline-flex items-center gap-1 px-3 py-2 text-xs font-bold cursor-pointer"
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
