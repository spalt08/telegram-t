import { GlobalState } from '../../global/types';
import { ApiStickerSet, ApiSticker } from '../../api/types';
import { buildCollectionByKey } from '../../util/iteratees';

export function updateStickerSets(global: GlobalState, hash: number, sets: ApiStickerSet[]): GlobalState {
  const { byId: existingSets } = global.stickers.all || {};

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
      all: {
        hash,
        byId: updatedSets,
      },
    },
  };
}

export function updateStickerSet(global: GlobalState, set: ApiStickerSet, stickers: ApiSticker[]): GlobalState {
  const allStickers = global.stickers.all;
  const existingSet = allStickers.byId[set.id] || {};

  return {
    ...global,
    stickers: {
      ...global.stickers,
      all: {
        ...allStickers,
        byId: {
          ...allStickers.byId,
          [set.id]: {
            ...existingSet,
            ...set,
            stickers,
          },
        },
      },
    },
  };
}
