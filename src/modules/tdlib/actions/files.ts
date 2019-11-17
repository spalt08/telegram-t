import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';
import { ApiChat, ApiUser } from '../../../api/tdlib/types';
import { getChatPhotoId, getUserPhotoId } from '../../helpers';

addReducer('loadChatPhoto', (global, actions, payload) => {
  const { chat } = payload!;

  void loadChatPhoto(chat);
});

addReducer('loadUserPhoto', (global, actions, payload) => {
  const { user } = payload!;

  void loadUserPhoto(user);
});

async function loadChatPhoto(chat: ApiChat) {
  const fileId = getChatPhotoId(chat);

  if (!fileId) {
    return;
  }

  const blob = await TdLib.loadChatPhoto(chat) as Blob;

  if (!blob) {
    return;
  }

  updateFile(fileId, blob);
}

async function loadUserPhoto(user: ApiUser) {
  const fileId = getUserPhotoId(user);

  if (!fileId) {
    return;
  }

  const blob = await TdLib.loadUserPhoto(user) as Blob;

  if (!blob) {
    return;
  }

  updateFile(fileId, blob);
}

function updateFile(fileId: number, blob: Blob) {
  const blobUrl = URL.createObjectURL(blob);
  const global = getGlobal();

  setGlobal({
    ...global,
    files: {
      ...global.files,
      byId: {
        ...global.files.byId,
        [fileId]: {
          ...(global.files.byId[fileId] || {}),
          blob,
          blobUrl,
        },
      },
    },
  });
}
