import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import {
  updateStickerSets,
  updateStickerSet,
} from '../../reducers';

addReducer('loadStickers', (global) => {
  const { hash } = global.stickers.all || {};
  void loadStickers(hash);
});

addReducer('loadRecentStickers', (global) => {
  const { hash } = global.stickers.recent || {};
  void loadRecentStickers(hash);
});

addReducer('loadStickerSet', (global, actions, payload) => {
  const { id } = payload!;
  const set = global.stickers.all.byId[id];
  if (!set) {
    return;
  }
  void loadStickerSet(id, set.accessHash);
});

async function loadStickers(hash = 0) {
  const allStickers = await callApi('fetchStickers', { hash });
  if (!allStickers) {
    return;
  }

  setGlobal(updateStickerSets(
    getGlobal(),
    allStickers.hash,
    allStickers.sets,
  ));
}

async function loadRecentStickers(hash = 0) {
  const recentStickers = await callApi('fetchRecentStickers', { hash });
  if (!recentStickers) {
    return;
  }

  const global = getGlobal();

  setGlobal({
    ...global,
    stickers: {
      all: global.stickers.all,
      recent: recentStickers,
    },
  });
}

async function loadStickerSet(id: string, accessHash: string) {
  const stickerSet = await callApi('fetchStickerSet', { id, accessHash });
  if (!stickerSet) {
    return;
  }

  const { set, stickers } = stickerSet;

  setGlobal(updateStickerSet(
    getGlobal(),
    set,
    stickers,
  ));
}
