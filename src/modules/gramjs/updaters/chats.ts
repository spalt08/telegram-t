import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate, ApiChat } from '../../../api/types';
import { buildCollectionByKey } from '../../../util/iteratees';

export function onUpdate(update: ApiUpdate) {
  switch (update['@type']) {
    case 'chats': {
      setChats(update.chats);

      break;
    }

    case 'updateChat': {
      updateChat(update.id, update.chat);

      // TODO Only watch for new chats and avatar updates
      // getDispatch().loadChatPhoto({ chat: update.chat });

      break;
    }

    case 'updateMessage': {
      if (update.message.is_outgoing) {
        return;
      }

      const currentUnreadCount = getGlobal().chats.byId[update.chat_id].unread_count || 0;

      updateChat(update.chat_id, {
        unread_count: currentUnreadCount + 1,
      });

      break;
    }

    case 'updateMessageSendSucceeded': {
      const global = getGlobal();

      const { chat_id, old_message_id, message } = update;
      const currentLastMessage = global.chats.byId[chat_id].last_message;

      if (currentLastMessage && currentLastMessage.id !== old_message_id) {
        return;
      }

      updateChat(update.chat_id, {
        last_message: message,
      });

      break;
    }
  }
}

function setChats(chats: ApiChat[]) {
  const global = getGlobal();

  const byId = buildCollectionByKey(chats, 'id');

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      byId: {
        ...global.chats.byId,
        ...byId,
      },
    },
  });
}

function updateChat(chatId: number, chatUpdate: Partial<ApiChat>) {
  const global = getGlobal();

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      byId: {
        ...global.chats.byId,
        [chatId]: {
          ...global.chats.byId[chatId],
          ...chatUpdate,
        },
      },
    },
  });
}
