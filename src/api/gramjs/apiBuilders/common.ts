import { Api as GramJs } from '../../../lib/gramjs';
import { strippedPhotoToJpg } from '../../../lib/gramjs/Utils';

import { ApiThumbnail } from '../../types';
import { bytesToDataUri } from './helpers';

const DEFAULT_THUMB_SIZE = { w: 100, h: 100 };

export function buildApiThumbnailFromStripped(sizes?: GramJs.TypePhotoSize[]): ApiThumbnail | undefined {
  if (!sizes || !sizes.length) {
    return undefined;
  }

  const thumb = sizes.find((s: any) => s instanceof GramJs.PhotoStrippedSize);

  if (!thumb) {
    return undefined;
  }

  const realSizes = sizes.filter((s): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize);
  const { w, h } = realSizes && realSizes.length ? realSizes[realSizes.length - 1] : DEFAULT_THUMB_SIZE;

  return {
    dataUri: bytesToDataUri(strippedPhotoToJpg((thumb as GramJs.PhotoStrippedSize).bytes)),
    width: w,
    height: h,
  };
}

export function buildApiThumbnailFromCached(photoSize: GramJs.PhotoCachedSize): ApiThumbnail | undefined {
  const { w, h, bytes } = photoSize;
  const dataUri = bytesToDataUri(strippedPhotoToJpg(bytes));

  return {
    dataUri,
    width: w,
    height: h,
  };
}
