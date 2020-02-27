import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import {
  updateStickerSets,
  updateStickerSet,
} from '../../reducers';

addReducer('loadStickerSets', (global) => {
  const { hash } = global.stickers.all || {};
  void loadStickerSets(hash);
});

addReducer('loadRecentStickers', (global) => {
  const { hash } = global.stickers.recent || {};
  void loadRecentStickers(hash);
});

addReducer('loadStickers', (global, actions, payload) => {
  const { stickerSetId } = payload!;
  const set = global.stickers.all.byId[stickerSetId];
  if (!set) {
    return;
  }
  void loadStickers(stickerSetId, set.accessHash);
});

addReducer('loadSavedGifs', (global) => {
  const { hash } = global.savedGifs || {};
  void loadSavedGifs(hash);
});

async function loadStickerSets(hash = 0) {
  const allStickers = await callApi('fetchStickerSets', { hash });
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

async function loadStickers(stickerSetId: string, accessHash: string) {
  const stickerSet = await callApi('fetchStickers', { stickerSetId, accessHash });
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

async function loadSavedGifs(hash = 0) {
  const savedGifs = await callApi('fetchSavedGifs', { hash });
  if (!savedGifs) {
    return;
  }

  setGlobal({
    ...getGlobal(),
    savedGifs,
  });
}
