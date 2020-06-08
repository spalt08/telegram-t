import { Api as GramJs } from '../../../lib/gramjs';
import {
  ApiSticker,
  ApiVideo,
  OnApiUpdate,
  ApiStickerSet,
} from '../../types';

import { invokeRequest } from './client';
import { buildStickerFromDocument, buildStickerSet } from '../apiBuilders/stickers';
import { buildInputStickerSet, buildInputDocument } from '../gramjsBuilders';
import localDb from '../localDb';
import { buildVideoFromDocument } from '../apiBuilders/messages';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchStickerSets({ hash }: { hash: number }) {
  const allStickers = await invokeRequest(new GramJs.messages.GetAllStickers({ hash }));

  if (!allStickers || allStickers instanceof GramJs.messages.AllStickersNotModified) {
    return undefined;
  }

  return {
    hash: allStickers.hash,
    sets: allStickers.sets.map(buildStickerSet),
  };
}

export async function fetchRecentStickers({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetRecentStickers({ hash }));

  if (!result || result instanceof GramJs.messages.RecentStickersNotModified) {
    return undefined;
  }

  const stickers: ApiSticker[] = [];

  result.stickers.forEach((document) => {
    if (document instanceof GramJs.Document) {
      const sticker = buildStickerFromDocument(document);
      if (sticker) {
        stickers.push(sticker);
        localDb.documents[String(document.id)] = document;
      }
    }
  });

  return {
    hash: result.hash,
    stickers,
  };
}

export async function fetchFavoriteStickers({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetFavedStickers({ hash }));

  if (!result || result instanceof GramJs.messages.FavedStickersNotModified) {
    return undefined;
  }

  const stickers: ApiSticker[] = [];

  result.stickers.forEach((document) => {
    if (document instanceof GramJs.Document) {
      const sticker = buildStickerFromDocument(document);
      if (sticker) {
        stickers.push(sticker);
        localDb.documents[String(document.id)] = document;
      }
    }
  });

  return {
    hash: result.hash,
    stickers,
  };
}

export async function fetchFeaturedStickers({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetFeaturedStickers({ hash }));

  if (!result || result instanceof GramJs.messages.FeaturedStickersNotModified) {
    return undefined;
  }

  const sets: ApiStickerSet[] = [];

  result.sets.forEach((coveredSet) => {
    const set = buildStickerSet(coveredSet.set);

    const setCovers = (coveredSet instanceof GramJs.StickerSetMultiCovered)
      ? coveredSet.covers
      : [coveredSet.cover];

    set.covers = [];
    setCovers.forEach((cover) => {
      if (cover instanceof GramJs.Document) {
        const coverSticker = buildStickerFromDocument(cover);
        if (coverSticker) {
          set.covers!.push(coverSticker);
          localDb.documents[String(cover.id)] = cover;
        }
      }
    });

    sets.push(set);
  });

  return {
    hash: result.hash,
    sets,
  };
}

export async function faveSticker({
  sticker,
  unfave,
}: {
  sticker: ApiSticker;
  unfave?: boolean;
}) {
  const request = new GramJs.messages.FaveSticker({
    id: buildInputDocument(sticker),
    unfave,
  });

  const result = await invokeRequest(request);
  if (result) {
    onUpdate({
      '@type': 'updateFavoriteStickers',
    });
  }
}

export async function fetchStickers({ stickerSetId, accessHash }: { stickerSetId: string; accessHash: string }) {
  const result = await invokeRequest(new GramJs.messages.GetStickerSet({
    stickerset: buildInputStickerSet(stickerSetId, accessHash),
  }));

  if (!result) {
    return undefined;
  }

  const stickers: ApiSticker[] = [];

  result.documents.forEach((document) => {
    if (document instanceof GramJs.Document) {
      const sticker = buildStickerFromDocument(document);
      if (sticker) {
        stickers.push(sticker);
        localDb.documents[String(document.id)] = document;
      }
    }
  });

  return {
    set: buildStickerSet(result.set),
    stickers,
  };
}

export async function searchStickers({ query, hash }: { query: string; hash: number }) {
  const result = await invokeRequest(new GramJs.messages.SearchStickerSets({
    q: query,
    hash,
  }));

  if (!result || result instanceof GramJs.messages.FoundStickerSetsNotModified) {
    return undefined;
  }

  const sets: ApiStickerSet[] = [];

  result.sets.forEach((coveredSet) => {
    const set = buildStickerSet(coveredSet.set);

    const setCovers = (coveredSet instanceof GramJs.StickerSetMultiCovered)
      ? coveredSet.covers
      : [coveredSet.cover];

    set.covers = [];
    setCovers.forEach((cover) => {
      if (cover instanceof GramJs.Document) {
        const coverSticker = buildStickerFromDocument(cover);
        if (coverSticker) {
          set.covers!.push(coverSticker);
          localDb.documents[String(cover.id)] = cover;
        }
      }
    });

    sets.push(set);
  });

  return {
    hash: result.hash,
    sets,
  };
}

export async function fetchSavedGifs({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetSavedGifs({ hash }));

  if (!result || result instanceof GramJs.messages.SavedGifsNotModified) {
    return undefined;
  }

  const gifs: ApiVideo[] = [];
  result.gifs.forEach((document) => {
    if (document instanceof GramJs.Document) {
      const video = buildVideoFromDocument(document);
      if (video) {
        gifs.push(video);
        localDb.documents[String(document.id)] = document;
      }
    }
  });

  return {
    hash: result.hash,
    gifs,
  };
}

export async function searchGifs({ query, offset }: { query: string; offset?: number }) {
  const result = await invokeRequest(new GramJs.messages.SearchGifs({
    q: query,
    offset,
  }));

  if (!result) {
    return undefined;
  }

  const { nextOffset, results } = result;

  const gifs: ApiVideo[] = [];

  results.forEach((foundGif) => {
    if (foundGif instanceof GramJs.FoundGifCached) {
      const { document } = foundGif;
      if (document instanceof GramJs.Document) {
        const video = buildVideoFromDocument(document);
        if (video) {
          gifs.push(video);
          localDb.documents[String(document.id)] = document;
        }
      }
    } else {
      // TODO
    }
  });

  return {
    nextOffset,
    gifs,
  };
}
