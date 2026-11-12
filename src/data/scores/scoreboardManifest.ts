import type { ManifestItem, ScoreBlockMeta } from '../../utils/scores/scoreTypes';
import manifestJson from './manifest.json';

export const SCOREBOARD_MANIFEST: ManifestItem[] = manifestJson as ManifestItem[];
export const SCOREBOARD_TOTAL_COUNT: number = SCOREBOARD_MANIFEST.length;

export const DEFAULT_QUICK_PIN_IDS: string[] = SCOREBOARD_MANIFEST.filter(
  (item) => item.starredDefault
)
  .map((item) => item.id)
  .slice(0, 10);

const MANIFEST_BY_ID = new Map<string, ManifestItem>();
const MANIFEST_BY_SLUG = new Map<string, ManifestItem>();
const COUNT_BY_BLOCK_ID = new Map<string, number>();

for (const item of SCOREBOARD_MANIFEST) {
  MANIFEST_BY_ID.set(item.id, item);
  MANIFEST_BY_SLUG.set(item.slug, item);
  const blockKey = item.blockId ?? item.blockFile.replace('.json', '');
  COUNT_BY_BLOCK_ID.set(blockKey, (COUNT_BY_BLOCK_ID.get(blockKey) ?? 0) + 1);
}

const BLOCK_STATIC_DEFINITIONS: ReadonlyArray<{
  blockId: string;
  blockName: string;
  shortLabel: string;
  icon: ScoreBlockMeta['icon'];
}> = [
  {
    blockId: 'block_01',
    blockName: 'Emergência, Choque e Terapia Intensiva',
    shortLabel: 'Emergência & UTI',
    icon: 'monitor_heart',
  },
  {
    blockId: 'block_02',
    blockName: 'Cardiologia e Hemodinâmica',
    shortLabel: 'Cardio & TEP',
    icon: 'favorite',
  },
  {
    blockId: 'block_03',
    blockName: 'Neurologia e Neurocirurgia',
    shortLabel: 'Neuro & Coluna',
    icon: 'neurology',
  },
  {
    blockId: 'block_04',
    blockName: 'Pneumologia e Vias Aéreas',
    shortLabel: 'Pneumo & VM',
    icon: 'pulmonology',
  },
  {
    blockId: 'block_05',
    blockName: 'Cirurgia Geral, Trauma e Queimados',
    shortLabel: 'Cirurgia & Trauma',
    icon: 'emergency',
  },
  {
    blockId: 'block_06',
    blockName: 'Nefrologia e Distúrbios Hidroeletrolíticos',
    shortLabel: 'Nefro & Meio Interno',
    icon: 'water_drop',
  },
  {
    blockId: 'block_07',
    blockName: 'Gastroenterologia e Hepatologia',
    shortLabel: 'Gastro & Hepato',
    icon: 'gastroenterology',
  },
  {
    blockId: 'block_08',
    blockName: 'Pediatria, Neonatologia e Obstetrícia',
    shortLabel: 'Pediatria & Neo',
    icon: 'child_care',
  },
  {
    blockId: 'block_09',
    blockName: 'Hematologia, Oncologia e Toxicologia',
    shortLabel: 'Hemato & Hemostasia',
    icon: 'biotech',
  },
];

export const SCOREBOARD_BLOCKS_META: ScoreBlockMeta[] = [
  {
    blockId: 'ALL',
    blockName: 'Todas as Especialidades (A–Z)',
    shortLabel: `Todos (${SCOREBOARD_TOTAL_COUNT})`,
    icon: 'apps',
    count: SCOREBOARD_TOTAL_COUNT,
  },
  ...BLOCK_STATIC_DEFINITIONS.map((def) => ({
    blockId: def.blockId,
    blockName: def.blockName,
    shortLabel: def.shortLabel,
    icon: def.icon,
    count: COUNT_BY_BLOCK_ID.get(def.blockId) ?? 0,
  })),
];

export function getManifestItemByIdOrSlug(
  idOrSlug: string
): ManifestItem | undefined {
  if (typeof idOrSlug !== 'string') {
    return undefined;
  }
  const normalized = idOrSlug.trim();
  if (!normalized) {
    return undefined;
  }
  return MANIFEST_BY_ID.get(normalized) ?? MANIFEST_BY_SLUG.get(normalized);
}

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
  const safeQuery = typeof query === 'string' ? query : '';
  const safeBlockFilter = typeof blockFilter === 'string' && blockFilter ? blockFilter : 'ALL';
  const normalizedQuery = normalizeSearchToken(safeQuery);
  return SCOREBOARD_MANIFEST.filter((item) => {
    if (onlyFavorites && favoriteIds && !favoriteIds.has(item.id)) {
      return false;
    }
    const itemBlockId = item.blockId ?? item.blockFile.replace('.json', '');
    if (safeBlockFilter !== 'ALL' && itemBlockId !== safeBlockFilter) {
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
