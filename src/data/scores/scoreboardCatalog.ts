import type {
  BlockData,
  Calculator,
  ManifestItem,
  ScoreBlockMeta,
} from '../../utils/scores/scoreTypes';
import {
  DEFAULT_QUICK_PIN_IDS,
  SCOREBOARD_BLOCKS_META,
  SCOREBOARD_MANIFEST,
  SCOREBOARD_TOTAL_COUNT,
  getManifestItemByIdOrSlug,
  searchScoreboardCatalog,
} from './scoreboardManifest';
import block01Json from './blocks/block_01.json';
import block02Json from './blocks/block_02.json';
import block03Json from './blocks/block_03.json';
import block04Json from './blocks/block_04.json';
import block05Json from './blocks/block_05.json';
import block06Json from './blocks/block_06.json';
import block07Json from './blocks/block_07.json';
import block08Json from './blocks/block_08.json';
import block09Json from './blocks/block_09.json';

export {
  DEFAULT_QUICK_PIN_IDS,
  SCOREBOARD_BLOCKS_META,
  SCOREBOARD_MANIFEST,
  SCOREBOARD_TOTAL_COUNT,
  getManifestItemByIdOrSlug,
  searchScoreboardCatalog,
};
export type { ManifestItem, ScoreBlockMeta };

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

export function getCalculatorByIdOrSlug(idOrSlug: string): Calculator | undefined {
  if (typeof idOrSlug !== 'string') {
    return undefined;
  }
  const normalized = idOrSlug.trim();
  if (!normalized) {
    return undefined;
  }
  return CALCULATOR_BY_ID.get(normalized) ?? CALCULATOR_BY_SLUG.get(normalized);
}
