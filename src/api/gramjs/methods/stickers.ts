import { Api as GramJs } from '../../../lib/gramjs';
import { ApiSticker } from '../../types';

import { invokeRequest } from './client';
import { buildStickerFromDocument, buildStickerSet } from '../apiBuilders/stickers';
import { buildInputStickerSet } from '../gramjsBuilders';
import localDb from '../localDb';

export function init() {
}

export async function fetchStickers({ hash }: { hash: number }) {
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

export async function fetchStickerSet({ id, accessHash }: { id: string; accessHash: string }) {
  const result = await invokeRequest(new GramJs.messages.GetStickerSet({
    stickerset: buildInputStickerSet(id, accessHash),
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
