import { GlobalState } from '../../global/types';
import { ApiStickerSet } from '../../api/types';
import { buildCollectionByKey } from '../../util/iteratees';

export function updateStickerSets(
  global: GlobalState,
  category: 'added' | 'featured' | 'search',
  hash: number,
  sets: ApiStickerSet[],
  resultIds?: string[],
): GlobalState {
  const setIds = sets.map(({ id }) => id);
  const existingSets = buildCollectionByKey(
    setIds.map((id) => global.stickers.setsById[id]).filter(Boolean as any),
    'id',
  );

  let updatedSets: Record<string, ApiStickerSet> = {};
  if (!existingSets || !Object.keys(existingSets).length) {
    updatedSets = buildCollectionByKey(sets, 'id');
  } else {
    sets.forEach((set) => {
      if (!existingSets[set.id]) {
        updatedSets[set.id] = set;
      } else {
        updatedSets[set.id] = {
          ...set,
          stickers: existingSets[set.id].stickers,
        };
      }
    });
  }

  return {
    ...global,
    stickers: {
      ...global.stickers,
      setsById: {
        ...global.stickers.setsById,
        ...updatedSets,
      },
      [category]: {
        ...global.stickers[category],
        hash,
        ...(
          category === 'search'
            ? { resultIds }
            : { setIds }
        ),
      },
    },
  };
}

export function updateStickerSet(
  global: GlobalState, stickerSetId: string, update: Partial<ApiStickerSet>,
): GlobalState {
  const currentStickerSet = global.stickers.setsById[stickerSetId] || {};

  return {
    ...global,
    stickers: {
      ...global.stickers,
      setsById: {
        ...global.stickers.setsById,
        [stickerSetId]: {
          ...currentStickerSet,
          ...update,
        },
      },
    },
  };
}
