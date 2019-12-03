import { Api as GramJs } from '../../../lib/gramjs';
import { ApiFileLocation } from '../../types';

export function buildApiPhotoLocations(entity: GramJs.User | GramJs.Chat): {
  small: ApiFileLocation;
  big: ApiFileLocation;
} | undefined {
  if (!entity.photo) {
    return undefined;
  }

  const { photoSmall, photoBig, dcId } = entity.photo as (GramJs.UserProfilePhoto | GramJs.ChatPhoto);

  return {
    small: {
      ...photoSmall,
      dcId,
    },
    big: {
      ...photoBig,
      dcId,
    },
  };
}

export function bytesToDataUri(bytes: Uint8Array, shouldOmitPrefix = false, mimeType: string = 'image/jpg') {
  const prefix = shouldOmitPrefix ? '' : `data:${mimeType};base64,`;

  return `${prefix}${btoa(
    bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
}
