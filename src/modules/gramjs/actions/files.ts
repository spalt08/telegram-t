import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiChat, ApiUser } from '../../../api/types';
import { loadAvatar } from '../../../api/gramjs';

addReducer('loadChatPhoto', (global, actions, payload) => {
  const { chat } = payload!;

  void loadChatPhoto(chat);
});

addReducer('loadUserPhoto', (global, actions, payload) => {
  const { user } = payload!;

  void loadUserPhoto(user);
});

async function loadChatPhoto(chat: ApiChat) {
  const fileLocation = chat.photo_locations && chat.photo_locations.small;

  if (!fileLocation) {
    return;
  }

  const dataUri = await loadAvatar(chat);

  if (!dataUri) {
    return;
  }

  const fileKey = `chat${chat.id}`;
  updateFile(fileKey, dataUri);
}

async function loadUserPhoto(user: ApiUser) {
  const fileLocation = user.profile_photo_locations && user.profile_photo_locations.small;

  if (!fileLocation) {
    return;
  }

  const dataUri = await loadAvatar(user);

  if (!dataUri) {
    return;
  }

  const fileKey = `user${user.id}`;
  updateFile(fileKey, dataUri);
}

function updateFile(fileKey: string, dataUri: string) {
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
