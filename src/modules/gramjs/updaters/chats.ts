import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate } from '../../../api/types';
import { buildCollectionByKey } from '../../../util/iteratees';
import { setChats, updateChat } from '../../common/chats';

export function onUpdate(update: ApiUpdate) {
  const global = getGlobal();

  switch (update['@type']) {
    case 'chats': {
      const byId = buildCollectionByKey(update.chats, 'id');

      setGlobal(setChats(global, byId));

      break;
    }

    case 'updateChat': {
      setGlobal(updateChat(global, update.id, update.chat));

      break;
    }

    case 'newMessage': {
      if (update.message.is_outgoing) {
        return;
      }

      const currentUnreadCount = global.chats.byId[update.chat_id].unread_count || 0;

      setGlobal(updateChat(global, update.chat_id, {
        unread_count: currentUnreadCount + 1,
      }));

      break;
    }

    case 'updateChatFullInfo': {
      const { full_info } = update;
      const targetChat = global.chats.byId[update.id];
      if (!targetChat) {
        return;
      }

      setGlobal(updateChat(global, update.id, {
        full_info: {
          ...targetChat.full_info,
          ...full_info,
        },
      }));
    }
  }
}
