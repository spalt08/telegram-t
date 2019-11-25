import { ApiFileLocation } from '../../types';

import { downloadFile } from '../client';
import localDb from '../localDb';

export function init() {
}

export function loadAvatar(chatOrUserId: any, fileLocation: ApiFileLocation): Promise<string | null> {
  if (!localDb.avatarRequests[chatOrUserId]) {
    localDb.avatarRequests[chatOrUserId] = downloadFile(chatOrUserId, fileLocation)
      .then(
        (fileBuffer: Buffer) => {
          if (fileBuffer) {
            return bytesToDataUri(fileBuffer);
          } else {
            delete localDb.avatarRequests[chatOrUserId];
            return null;
          }
        },
        () => {
          delete localDb.avatarRequests[chatOrUserId];
          return null;
        },
      );
  }

  return localDb.avatarRequests[chatOrUserId];
}

function bytesToDataUri(bytes: Uint8Array, mimeType?: string) {
  if (!mimeType) {
    mimeType = 'image/jpg';
  }

  return `data:${mimeType};base64,${btoa(
    bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''),
  )}`;
}
