import type { BlockData, Calculator } from '../../utils/scores/scoreTypes';
import { getManifestItemByIdOrSlug } from './scoreboardManifest';
import block01Json from './blocks/block_01.json';

type DynamicBlockImporter = () => Promise<{ default: unknown }>;

const DYNAMIC_BLOCK_IMPORTERS = new Map<string, DynamicBlockImporter>([
  ['block_02', () => import('./blocks/block_02.json')],
  ['block_03', () => import('./blocks/block_03.json')],
  ['block_04', () => import('./blocks/block_04.json')],
  ['block_05', () => import('./blocks/block_05.json')],
  ['block_06', () => import('./blocks/block_06.json')],
  ['block_07', () => import('./blocks/block_07.json')],
  ['block_08', () => import('./blocks/block_08.json')],
  ['block_09', () => import('./blocks/block_09.json')],
]);

const LOADED_BLOCKS_CACHE = new Map<string, BlockData>();
const LOADED_CALCULATOR_BY_ID = new Map<string, Calculator>();
const LOADED_CALCULATOR_BY_SLUG = new Map<string, Calculator>();
const IN_FLIGHT_BLOCK_PROMISES = new Map<string, Promise<BlockData | undefined>>();

function registerBlockInCache(blockId: string, blockData: BlockData): BlockData {
  LOADED_BLOCKS_CACHE.set(blockId, blockData);
  for (const calc of blockData.calculators) {
    LOADED_CALCULATOR_BY_ID.set(calc.id, calc);
    LOADED_CALCULATOR_BY_SLUG.set(calc.slug, calc);
  }
  return blockData;
}

// Bloco 01 (Emergência, Choque e UTI — inclui qSOFA e SOFA) é registrado sincronamente
// para garantir renderização instantânea (0ms / SSR) na abertura do Scoreboard CDSS.
const INITIAL_BLOCK_01 = registerBlockInCache('block_01', block01Json as BlockData);

export const DEFAULT_SCOREBOARD_CALCULATOR: Calculator =
  LOADED_CALCULATOR_BY_ID.get('calc_qsofa') ?? INITIAL_BLOCK_01.calculators[0];

export function isScoreBlockLoaded(blockId: string): boolean {
  if (typeof blockId !== 'string') {
    return false;
  }
  const normalized = blockId.trim();
  return Boolean(normalized) && LOADED_BLOCKS_CACHE.has(normalized);
}

export function getLoadedCalculatorByIdOrSlug(
  idOrSlug: string
): Calculator | undefined {
  if (typeof idOrSlug !== 'string') {
    return undefined;
  }
  const normalized = idOrSlug.trim();
  if (!normalized) {
    return undefined;
  }
  return (
    LOADED_CALCULATOR_BY_ID.get(normalized) ??
    LOADED_CALCULATOR_BY_SLUG.get(normalized)
  );
}

export async function loadScoreBlock(
  blockId: string
): Promise<BlockData | undefined> {
  if (typeof blockId !== 'string') {
    return undefined;
  }
  const normalized = blockId.trim();
  if (!normalized) {
    return undefined;
  }

  const cached = LOADED_BLOCKS_CACHE.get(normalized);
  if (cached) {
    return cached;
  }

  const inFlight = IN_FLIGHT_BLOCK_PROMISES.get(normalized);
  if (inFlight) {
    return inFlight;
  }

  const importer = DYNAMIC_BLOCK_IMPORTERS.get(normalized);
  if (!importer) {
    return undefined;
  }

  const loadPromise = importer()
    .then((mod) => {
      const data = (mod?.default ?? mod) as BlockData;
      if (!data || !Array.isArray(data.calculators)) {
        return undefined;
      }
      return registerBlockInCache(normalized, data);
    })
    .finally(() => {
      IN_FLIGHT_BLOCK_PROMISES.delete(normalized);
    });

  IN_FLIGHT_BLOCK_PROMISES.set(normalized, loadPromise);
  return loadPromise;
}

export async function loadCalculatorByIdOrSlug(
  idOrSlug: string
): Promise<Calculator | undefined> {
  const alreadyLoaded = getLoadedCalculatorByIdOrSlug(idOrSlug);
  if (alreadyLoaded) {
    return alreadyLoaded;
  }

  const manifestEntry = getManifestItemByIdOrSlug(idOrSlug);
  if (!manifestEntry) {
    return undefined;
  }

  const targetBlockId =
    manifestEntry.blockId ?? manifestEntry.blockFile.replace('.json', '');
  await loadScoreBlock(targetBlockId);
  return getLoadedCalculatorByIdOrSlug(manifestEntry.id);
}
