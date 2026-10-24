import type {
  BlockData,
  Calculator,
  ManifestItem,
  ScoreBlockMeta,
} from '../../utils/scores/scoreTypes';
import manifestJson from './manifest.json';
import block01Json from './blocks/block_01.json';
import block02Json from './blocks/block_02.json';
import block03Json from './blocks/block_03.json';
import block04Json from './blocks/block_04.json';
import block05Json from './blocks/block_05.json';
import block06Json from './blocks/block_06.json';
import block07Json from './blocks/block_07.json';
import block08Json from './blocks/block_08.json';
import block09Json from './blocks/block_09.json';

export const SCOREBOARD_MANIFEST: ManifestItem[] = manifestJson as ManifestItem[];

const BLOCK_DATA_MAP: Record<string, BlockData> = {
  block_01: block01Json as BlockData,
  block_02: block02Json as BlockData,
  block_03: block03Json as BlockData,
  block_04: block04Json as BlockData,
  block_05: block05Json as BlockData,
  block_06: block06Json as BlockData,
  block_07: block07Json as BlockData,
  block_08: block08Json as BlockData,
  block_09: block09Json as BlockData,
};

export const ALL_SCOREBOARD_CALCULATORS: Calculator[] = Object.values(BLOCK_DATA_MAP).flatMap(
  (block) => block.calculators
);

const CALCULATOR_BY_ID = new Map<string, Calculator>();
const CALCULATOR_BY_SLUG = new Map<string, Calculator>();

for (const calc of ALL_SCOREBOARD_CALCULATORS) {
  CALCULATOR_BY_ID.set(calc.id, calc);
  CALCULATOR_BY_SLUG.set(calc.slug, calc);
}

export const SCOREBOARD_BLOCKS_META: ScoreBlockMeta[] = [
  {
    blockId: 'ALL',
    blockName: 'Todas as Especialidades (A–Z)',
    shortLabel: `Todos (${ALL_SCOREBOARD_CALCULATORS.length})`,
    icon: 'apps',
    count: ALL_SCOREBOARD_CALCULATORS.length,
  },
  {
    blockId: 'block_01',
    blockName: BLOCK_DATA_MAP.block_01.blockName,
    shortLabel: 'Emergência & UTI',
    icon: 'monitor_heart',
    count: BLOCK_DATA_MAP.block_01.calculators.length,
  },
  {
    blockId: 'block_02',
    blockName: BLOCK_DATA_MAP.block_02.blockName,
    shortLabel: 'Cardio & TEP',
    icon: 'favorite',
    count: BLOCK_DATA_MAP.block_02.calculators.length,
  },
  {
    blockId: 'block_03',
    blockName: BLOCK_DATA_MAP.block_03.blockName,
    shortLabel: 'Neuro & Coluna',
    icon: 'neurology',
    count: BLOCK_DATA_MAP.block_03.calculators.length,
  },
  {
    blockId: 'block_04',
    blockName: BLOCK_DATA_MAP.block_04.blockName,
    shortLabel: 'Pneumo & VM',
    icon: 'pulmonology',
    count: BLOCK_DATA_MAP.block_04.calculators.length,
  },
  {
    blockId: 'block_05',
    blockName: BLOCK_DATA_MAP.block_05.blockName,
    shortLabel: 'Nefro & Ácido-Base',
    icon: 'water_drop',
    count: BLOCK_DATA_MAP.block_05.calculators.length,
  },
  {
    blockId: 'block_06',
    blockName: BLOCK_DATA_MAP.block_06.blockName,
    shortLabel: 'Gastro & Hepato',
    icon: 'gastroenterology',
    count: BLOCK_DATA_MAP.block_06.calculators.length,
  },
  {
    blockId: 'block_07',
    blockName: BLOCK_DATA_MAP.block_07.blockName,
    shortLabel: 'Trauma & Choque',
    icon: 'emergency',
    count: BLOCK_DATA_MAP.block_07.calculators.length,
  },
  {
    blockId: 'block_08',
    blockName: BLOCK_DATA_MAP.block_08.blockName,
    shortLabel: 'Infecto & Peri-Op',
    icon: 'biotech',
    count: BLOCK_DATA_MAP.block_08.calculators.length,
  },
  {
    blockId: 'block_09',
    blockName: BLOCK_DATA_MAP.block_09.blockName,
    shortLabel: 'Ped, GO & Tox',
    icon: 'child_care',
    count: BLOCK_DATA_MAP.block_09.calculators.length,
  },
];

export const DEFAULT_QUICK_PIN_IDS: string[] = SCOREBOARD_MANIFEST.filter(
  (item) => item.starredDefault
)
  .map((item) => item.id)
  .slice(0, 10);

export function getCalculatorByIdOrSlug(idOrSlug: string): Calculator | undefined {
  const normalized = idOrSlug.trim();
  return CALCULATOR_BY_ID.get(normalized) ?? CALCULATOR_BY_SLUG.get(normalized);
}

export function getCalculatorsByBlockId(blockId: string): Calculator[] {
  if (blockId === 'ALL') {
    return ALL_SCOREBOARD_CALCULATORS;
  }
  return BLOCK_DATA_MAP[blockId]?.calculators ?? [];
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
