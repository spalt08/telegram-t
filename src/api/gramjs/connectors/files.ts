import { invokeRequest } from '../client';
import { ApiFileLocation } from '../../types';

export function init() {
}

export async function loadFile(id: number, fileLocation: ApiFileLocation): Promise<string | null> {
  const result = await invokeRequest({
    namespace: 'upload',
    name: 'GetFileRequest',
    args: {
      flags: 0,
      offset: 0,
      limit: 1024 * 1024,
    },
    enhancers: {
      location: ['buildInputPeerPhotoFileLocation', { id, fileLocation }],
    },
  });

  // eslint-disable-next-line no-underscore-dangle
  return result && result._bytes ? bytesToUrl(result._bytes) : null;
}

function bytesToUrl(bytes: Uint8Array, mimeType?: string) {
  if (!mimeType) {
    mimeType = 'image/jpg';
  }

  return `data:${mimeType};base64,${btoa(
    bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
}
