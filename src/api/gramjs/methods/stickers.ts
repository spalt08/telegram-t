import { Api as GramJs } from '../../../lib/gramjs';
import { ApiSticker, ApiVideo } from '../../types';

import { invokeRequest } from './client';
import { buildStickerFromDocument, buildStickerSet } from '../apiBuilders/stickers';
import { buildInputStickerSet } from '../gramjsBuilders';
import localDb from '../localDb';
import { buildVideoFromDocument } from '../apiBuilders/messages';

export function init() {
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
