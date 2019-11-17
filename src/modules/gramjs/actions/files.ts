import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiChat } from '../../../api/tdlib/types';
import { loadFile } from '../../../api/gramjs/methods/files';

addReducer('loadChatPhoto', (global, actions, payload) => {
  const { chat } = payload!;

  void loadChatPhoto(chat);
});

async function loadChatPhoto(chat: ApiChat) {
  const fileLocation = chat.photo_locations && chat.photo_locations.small;

  if (!fileLocation) {
    return;
  }

  const dataUrl = await loadFile(chat);

  if (!dataUrl) {
    return;
  }

  updateFile(chat.id, dataUrl);
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
