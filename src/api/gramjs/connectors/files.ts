import { ApiFileLocation } from '../../types';

import { downloadFile } from '../client';
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
