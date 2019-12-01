import { ApiFileLocation } from '../../types';

import { downloadFile, downloadMessageImage } from '../client';
import localDb from '../localDb';
import { bytesToDataUri } from '../builders/common';

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

export function loadMessageMedia(message: MTP.message): Promise<string | null> {
  const messageId = message.id;

  if (!localDb.mediaRequests[messageId]) {
    localDb.mediaRequests[messageId] = downloadMessageImage(message)
      .then(
        (fileBuffer: Buffer) => {
          if (fileBuffer) {
            return bytesToDataUri(fileBuffer);
          } else {
            delete localDb.mediaRequests[messageId];
            return null;
          }
        },
        () => {
          delete localDb.mediaRequests[messageId];
          return null;
        },
      );
  }

  return localDb.mediaRequests[messageId];
}
