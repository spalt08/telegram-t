import { Api as GramJs } from '../../../lib/gramjs';
import { ApiSticker, ApiVideo, OnApiUpdate } from '../../types';

import { invokeRequest } from './client';
import { buildStickerFromDocument, buildStickerSet, buildStickerSetCovered } from '../apiBuilders/symbols';
import { buildInputStickerSet, buildInputDocument } from '../gramjsBuilders';
import { buildVideoFromDocument } from '../apiBuilders/messages';

import localDb from '../localDb';

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchStickerSets({ hash }: { hash: number }) {
  const allStickers = await invokeRequest(new GramJs.messages.GetAllStickers({ hash }));

  if (!allStickers || allStickers instanceof GramJs.messages.AllStickersNotModified) {
    return undefined;
  }

  allStickers.sets.forEach((stickerSet) => {
    if (stickerSet.thumb) {
      localDb.stickerSets[String(stickerSet.id)] = stickerSet;
    }
  });

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

  return {
    hash: result.hash,
    stickers: processStickerResult(result.stickers),
  };
}

export async function fetchFavoriteStickers({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetFavedStickers({ hash }));

  if (!result || result instanceof GramJs.messages.FavedStickersNotModified) {
    return undefined;
  }

  return {
    hash: result.hash,
    stickers: processStickerResult(result.stickers),
  };
}

export async function fetchFeaturedStickers({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetFeaturedStickers({ hash }));

  if (!result || result instanceof GramJs.messages.FeaturedStickersNotModified) {
    return undefined;
  }

  return {
    hash: result.hash,
    sets: result.sets.map(buildStickerSetCovered),
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

  return {
    set: buildStickerSet(result.set),
    stickers: processStickerResult(result.documents),
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

  return {
    hash: result.hash,
    sets: result.sets.map(buildStickerSetCovered),
  };
}

export async function fetchSavedGifs({ hash }: { hash: number }) {
  const result = await invokeRequest(new GramJs.messages.GetSavedGifs({ hash }));

  if (!result || result instanceof GramJs.messages.SavedGifsNotModified) {
    return undefined;
  }

  return {
    hash: result.hash,
    gifs: processGifResult(result.gifs),
  };
}

export async function installStickerSet({ stickerSetId, accessHash }: { stickerSetId: string; accessHash: string }) {
  const result = await invokeRequest(new GramJs.messages.InstallStickerSet({
    stickerset: buildInputStickerSet(stickerSetId, accessHash),
  }));

  if (result) {
    onUpdate({
      '@type': 'updateStickerSet',
      id: stickerSetId,
      stickerSet: { installedDate: Date.now() },
    });
  }
}

export async function uninstallStickerSet({ stickerSetId, accessHash }: { stickerSetId: string; accessHash: string }) {
  const result = await invokeRequest(new GramJs.messages.UninstallStickerSet({
    stickerset: buildInputStickerSet(stickerSetId, accessHash),
  }));

  if (result) {
    onUpdate({
      '@type': 'updateStickerSet',
      id: stickerSetId,
      stickerSet: { installedDate: undefined },
    });
  }
}

export async function searchGifs({ query, offset }: { query: string; offset?: number }) {
  const result = await invokeRequest(new GramJs.messages.SearchGifs({
    q: query,
    offset,
  }));

  if (!result) {
    return undefined;
  }

  const documents = result.results
    .map((foundGif) => {
      if (foundGif instanceof GramJs.FoundGifCached) {
        return foundGif.document;
      } else {
        // TODO
        return undefined;
      }
    })
    .filter<GramJs.TypeDocument>(Boolean as any);

  return {
    nextOffset: result.nextOffset,
    gifs: processGifResult(documents),
  };
}

function processStickerResult(stickers: GramJs.TypeDocument[]) {
  return stickers
    .map((document) => {
      if (document instanceof GramJs.Document) {
        const sticker = buildStickerFromDocument(document);
        if (sticker) {
          localDb.documents[String(document.id)] = document;

          return sticker;
        }
      }

      return undefined;
    })
    .filter<ApiSticker>(Boolean as any);
}

function processGifResult(gifs: GramJs.TypeDocument[]) {
  return gifs
    .map((document) => {
      if (document instanceof GramJs.Document) {
        const gif = buildVideoFromDocument(document);
        if (gif) {
          localDb.documents[String(document.id)] = document;

          return gif;
        }
      }

      return undefined;
    })
    .filter<ApiVideo>(Boolean as any);
}
