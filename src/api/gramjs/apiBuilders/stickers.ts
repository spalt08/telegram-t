import { Api as GramJs } from '../../../lib/gramjs';
import { ApiSticker, ApiStickerSet } from '../../types';

import { buildApiThumbnailFromCached, buildApiThumbnailFromStripped } from './common';

export function buildStickerFromDocument(document: GramJs.TypeDocument): ApiSticker | undefined {
  if (document instanceof GramJs.DocumentEmpty) {
    return undefined;
  }

  const stickerAttribute = document.attributes
    .find((attr: any): attr is GramJs.DocumentAttributeSticker => (
      attr instanceof GramJs.DocumentAttributeSticker
    ));

  if (!stickerAttribute) {
    return undefined;
  }

  const sizeAttribute = document.attributes
    .find((attr: any): attr is GramJs.DocumentAttributeImageSize => (
      attr instanceof GramJs.DocumentAttributeImageSize
    ));

  const emoji = stickerAttribute.alt;
  const isAnimated = document.mimeType === 'application/x-tgsticker';
  const cachedThumb = document.thumbs && document.thumbs.find((s: any) => s instanceof GramJs.PhotoCachedSize);
  const thumbnail = cachedThumb && buildApiThumbnailFromCached(cachedThumb as GramJs.PhotoCachedSize);
  const { w: width, h: height } = cachedThumb as GramJs.PhotoCachedSize || sizeAttribute || {};

  return {
    id: String(document.id),
    emoji,
    is_animated: isAnimated,
    width,
    height,
    thumbnail,
  };
}

export function buildStickerSet(set: GramJs.StickerSet): ApiStickerSet {
  const {
    archived,
    animated,
    installedDate,
    id,
    accessHash,
    title,
    thumb,
    count,
    hash,
  } = set;

  return {
    archived,
    isAnimated: animated,
    installedDate,
    id: String(id),
    accessHash: String(accessHash),
    title,
    thumbnail: thumb ? buildApiThumbnailFromStripped([thumb]) : undefined,
    count,
    hash,
    stickers: [],
  };
}
