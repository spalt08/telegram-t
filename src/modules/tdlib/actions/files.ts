import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';
import { ApiChat, ApiUser } from '../../../api/types';
import { getChatPhotoKey, getUserPhotoKey } from '../../helpers';

addReducer('loadChatPhoto', (global, actions, payload) => {
  const { chat } = payload!;

  void loadChatPhoto(chat);
});

addReducer('loadUserPhoto', (global, actions, payload) => {
  const { user } = payload!;

  void loadUserPhoto(user);
});

async function loadChatPhoto(chat: ApiChat) {
  const fileKey = getChatPhotoKey(chat);

  if (!fileKey) {
    return;
  }

  const blob = await TdLib.loadChatPhoto(chat) as Blob;

  if (!blob) {
    return;
  }

  updateFile(fileKey, blob);
}

async function loadUserPhoto(user: ApiUser) {
  const fileKey = getUserPhotoKey(user);

  if (!fileKey) {
    return;
  }

  const blob = await TdLib.loadUserPhoto(user) as Blob;

  if (!blob) {
    return;
  }

  updateFile(fileKey, blob);
}

function updateFile(fileKey: string, blob: Blob) {
  const dataUri = URL.createObjectURL(blob);
  const global = getGlobal();

  setGlobal({
    ...global,
    files: {
      ...global.files,
      byKey: {
        ...global.files.byKey,
        [fileKey]: {
          ...(global.files.byKey[fileKey] || {}),
          dataUri,
        },
      },
    },
  });
}
