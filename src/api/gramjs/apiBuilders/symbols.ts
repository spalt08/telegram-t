import { Api as GramJs } from '../../../lib/gramjs';
import { ApiSticker, ApiStickerSet } from '../../types';

import { buildApiThumbnailFromCached } from './common';
import localDb from '../localDb';

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

  const stickerSetInfo = stickerAttribute.stickerset as GramJs.InputStickerSetID;
  const emoji = stickerAttribute.alt;
  const isAnimated = document.mimeType === 'application/x-tgsticker';
  const cachedThumb = document.thumbs && document.thumbs.find((s: any) => s instanceof GramJs.PhotoCachedSize);
  const thumbnail = cachedThumb && buildApiThumbnailFromCached(cachedThumb as GramJs.PhotoCachedSize);
  const { w: width, h: height } = cachedThumb as GramJs.PhotoCachedSize || sizeAttribute || {};

  return {
    id: String(document.id),
    stickerSetId: String(stickerSetInfo.id),
    stickerSetAccessHash: String(stickerSetInfo.accessHash),
    emoji,
    isAnimated,
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
    hasThumbnail: Boolean(thumb),
    count,
    hash,
  };
}

export function buildStickerSetCovered(coveredStickerSet: GramJs.TypeStickerSetCovered): ApiStickerSet {
  const stickerSet = buildStickerSet(coveredStickerSet.set);

  const stickerSetCovers = (coveredStickerSet instanceof GramJs.StickerSetMultiCovered)
    ? coveredStickerSet.covers
    : [coveredStickerSet.cover];

  stickerSet.covers = [];
  stickerSetCovers.forEach((cover) => {
    if (cover instanceof GramJs.Document) {
      const coverSticker = buildStickerFromDocument(cover);
      if (coverSticker) {
        stickerSet.covers!.push(coverSticker);
        localDb.documents[String(cover.id)] = cover;
      }
    }
  });

  return stickerSet;
}
