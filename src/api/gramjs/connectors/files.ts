import { downloadAvatar, downloadMessageImage } from '../client';
import localDb from '../localDb';
import { bytesToDataUri } from '../builders/common';

export function init() {
}

export function loadAvatar(entity: MTP.user | MTP.chat): Promise<string | null> {
  const entityId = entity.id;

  if (!localDb.avatarRequests[entityId]) {
    localDb.avatarRequests[entityId] = downloadAvatar(entity)
      .then(
        (fileBuffer: Buffer) => {
          if (fileBuffer) {
            return bytesToDataUri(fileBuffer);
          } else {
            delete localDb.avatarRequests[entityId];
            return null;
          }
        },
        () => {
          delete localDb.avatarRequests[entityId];
          return null;
        },
      );
  }

  return localDb.avatarRequests[entityId];
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
