import type { ManifestItem } from '../../utils/scores/scoreTypes';
import manifestJson from './manifest.json';

export const SCOREBOARD_MANIFEST: ManifestItem[] = manifestJson as ManifestItem[];

export const DEFAULT_QUICK_PIN_IDS: string[] = SCOREBOARD_MANIFEST.filter(
  (item) => item.starredDefault
)
  .map((item) => item.id)
  .slice(0, 10);

function normalizeSearchToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchScoreboardCatalog(
  query: string,
  blockFilter: string = 'ALL',
  favoriteIds?: Set<string>,
  onlyFavorites: boolean = false
): ManifestItem[] {
  const normalizedQuery = normalizeSearchToken(query);
  return SCOREBOARD_MANIFEST.filter((item) => {
    if (onlyFavorites && favoriteIds && !favoriteIds.has(item.id)) {
      return false;
    }
    const itemBlockId = item.blockId ?? item.blockFile.replace('.json', '');
    if (blockFilter !== 'ALL' && itemBlockId !== blockFilter) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const haystack = normalizeSearchToken(
      [
        item.acronym,
        item.name,
        item.summary,
        item.description ?? '',
        item.categoryName,
        item.moduleName,
        item.id,
        item.slug,
        ...(item.synonyms ?? []),
        ...item.searchSynonyms,
      ].join(' ')
    );
    return haystack.includes(normalizedQuery);
  }).sort((a, b) => a.acronym.localeCompare(b.acronym, 'pt-BR'));
}
