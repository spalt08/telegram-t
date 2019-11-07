import { getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate } from '../../../api/tdlib/updates';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateNewChat':
      const { byId = {} } = getGlobal().chats || {};

      const global = getGlobal();

      setGlobal({
        ...global,
        chats: {
          ...global.chats,
          byId: {
            ...global.chats.byId,
            [update.chat.id]: update.chat,
          },
        },
      });
      break;
  }
}
