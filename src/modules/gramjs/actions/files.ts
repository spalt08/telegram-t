import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiChat, ApiUser } from '../../../api/types';
import { loadFile } from '../../../api/gramjs';

// Wait for other requests to complete + fix GramJS sync requests bug.
const FILE_REQUEST_DELAY = 500;

addReducer('loadChatPhoto', (global, actions, payload) => {
  const { chat } = payload!;

  void loadChatPhoto(chat);
});

addReducer('loadUserPhoto', (global, actions, payload) => {
  const { user } = payload!;

  void loadUserPhoto(user);
});

function loadChatPhoto(chat: ApiChat) {
  const fileLocation = chat.photo_locations && chat.photo_locations.small;

  if (!fileLocation) {
    return;
  }

  setTimeout(async () => {
    const dataUrl = await loadFile(chat.id, fileLocation);

    if (!dataUrl) {
      return;
    }

    updateFile(chat.id, dataUrl);
  }, FILE_REQUEST_DELAY);
}

function loadUserPhoto(user: ApiUser) {
  const fileLocation = user.profile_photo_locations && user.profile_photo_locations.small;

  if (!fileLocation) {
    return;
  }

  // `requestAnimationFrame` is a workaround for some unknown bug in GramJS.
  setTimeout(async () => {
    const dataUrl = await loadFile(user.id, fileLocation);

    if (!dataUrl) {
      return;
    }

    updateFile(user.id, dataUrl);
  }, FILE_REQUEST_DELAY);
}


function updateFile(fileId: number, dataUrl: string) {
  const global = getGlobal();

  setGlobal({
    ...global,
    files: {
      ...global.files,
      byId: {
        ...global.files.byId,
        [fileId]: {
          ...(global.files.byId[fileId] || {}),
          blobUrl: dataUrl,
        },
      },
    },
  });
}
