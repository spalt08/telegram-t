import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiSticker } from '../../../api/types';
import { callApi } from '../../../api/gramjs';
import { throttle } from '../../../util/schedulers';
import { updateStickerSets, updateStickerSet } from '../../reducers';
import searchWords from '../../../util/searchWords';
import { selectStickerSet } from '../../selectors';

const searchThrottled = throttle((cb) => cb(), 500, false);

addReducer('loadStickerSets', (global) => {
  const { hash } = global.stickers.added || {};
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

addReducer('loadFeaturedStickers', (global) => {
  const { hash } = global.stickers.featured || {};
  void loadFeaturedStickers(hash);
});

addReducer('loadStickers', (global, actions, payload) => {
  const { stickerSetId } = payload!;
  let { stickerSetAccessHash } = payload!;

  if (!stickerSetAccessHash) {
    const stickerSet = selectStickerSet(global, stickerSetId);
    if (!stickerSet) {
      return;
    }

    stickerSetAccessHash = stickerSet.accessHash;
  }

  void loadStickers(stickerSetId, stickerSetAccessHash);
});

addReducer('loadSavedGifs', (global) => {
  const { hash } = global.gifs.saved;
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

addReducer('toggleStickerSet', (global, actions, payload) => {
  const { stickerSetId } = payload!;
  const stickerSet = selectStickerSet(global, stickerSetId);
  if (!stickerSet) {
    return;
  }

  const { accessHash, installedDate } = stickerSet;

  void callApi(!installedDate ? 'installStickerSet' : 'uninstallStickerSet', { stickerSetId, accessHash });
});

async function loadStickerSets(hash = 0) {
  const addedStickers = await callApi('fetchStickerSets', { hash });
  if (!addedStickers) {
    return;
  }

  setGlobal(updateStickerSets(
    getGlobal(),
    'added',
    addedStickers.hash,
    addedStickers.sets,
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

async function loadFeaturedStickers(hash = 0) {
  const featuredStickers = await callApi('fetchFeaturedStickers', { hash });
  if (!featuredStickers) {
    return;
  }

  setGlobal(updateStickerSets(
    getGlobal(),
    'featured',
    featuredStickers.hash,
    featuredStickers.sets,
  ));
}

async function loadStickers(stickerSetId: string, accessHash: string) {
  const stickerSet = await callApi('fetchStickers', { stickerSetId, accessHash });
  if (!stickerSet) {
    return;
  }

  const { set, stickers } = stickerSet;

  setGlobal(updateStickerSet(getGlobal(), set.id, { ...set, stickers }));
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

addReducer('setStickerSearchQuery', (global, actions, payload) => {
  const { query } = payload!;

  if (query) {
    void searchThrottled(() => {
      searchStickers(query);
    });
  }
});

addReducer('setGifSearchQuery', (global, actions, payload) => {
  const { query } = payload!;

  if (query) {
    void searchThrottled(() => {
      searchGifs(query);
    });
  }
});

addReducer('searchMoreGifs', (global, actions, payload) => {
  const { query } = payload!;
  const { offset } = global.gifs.search;

  if (query) {
    void searchThrottled(() => {
      searchGifs(query, offset);
    });
  }
});

async function searchStickers(query: string, hash = 0) {
  const result = await callApi('searchStickers', { query, hash });

  if (!result) {
    return;
  }

  const global = getGlobal();
  const { setsById, added } = global.stickers;

  const resultIds = result.sets.map(({ id }) => id);
  added.setIds.forEach((id) => {
    if (!resultIds.includes(id)) {
      const { title } = setsById[id] || {};
      if (title && searchWords(title, query)) {
        resultIds.unshift(id);
      }
    }
  });

  setGlobal(updateStickerSets(
    global,
    'search',
    result.hash,
    result.sets,
    resultIds,
  ));
}

async function searchGifs(query: string, offset?: number) {
  const result = await callApi('searchGifs', { query, offset });

  if (!result) {
    return;
  }

  const global = getGlobal();
  const { results } = global.gifs.search;

  setGlobal({
    ...global,
    gifs: {
      ...global.gifs,
      search: {
        ...global.gifs.search,
        offset: result.nextOffset,
        results: offset && results ? [...results, ...result.gifs] : result.gifs,
      },
    },
  });
}

async function loadSavedGifs(hash = 0) {
  const savedGifs = await callApi('fetchSavedGifs', { hash });
  if (!savedGifs) {
    return;
  }

  const global = getGlobal();

  setGlobal({
    ...global,
    gifs: {
      ...global.gifs,
      saved: savedGifs,
    },
  });
}
