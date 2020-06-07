import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiSticker } from '../../../api/types';
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

addReducer('loadFavoriteStickers', (global) => {
  const { hash } = global.stickers.favorite || {};
  void loadFavoriteStickers(hash);
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

addReducer('faveSticker', (global, actions, payload) => {
  const { sticker } = payload!;

  if (sticker) {
    void callApi('faveSticker', { sticker });
  }
});

addReducer('unfaveSticker', (global, actions, payload) => {
  const { sticker } = payload!;

  if (sticker) {
    void unfaveSticker(sticker);
  }
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
      ...global.stickers,
      recent: recentStickers,
    },
  });
}

async function loadFavoriteStickers(hash = 0) {
  const favoriteStickers = await callApi('fetchFavoriteStickers', { hash });
  if (!favoriteStickers) {
    return;
  }

  const global = getGlobal();

  setGlobal({
    ...global,
    stickers: {
      ...global.stickers,
      favorite: favoriteStickers,
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

function unfaveSticker(sticker: ApiSticker) {
  const global = getGlobal();

  // Remove sticker preemptively to get instant feedback when user removes sticker
  // from favorites while in Sticker Picker
  setGlobal({
    ...global,
    stickers: {
      ...global.stickers,
      favorite: {
        ...global.stickers.favorite,
        stickers: global.stickers.favorite.stickers.filter(({ id }) => id !== sticker.id),
      },
    },
  });

  void callApi('faveSticker', { sticker, unfave: true });
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
