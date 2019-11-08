import { getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate } from '../../../api/tdlib/updates';

function updateChat(chatId: number, update: AnyLiteral) {
  const global = getGlobal();

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      byId: {
        ...global.chats.byId,
        [chatId]: {
          ...(global.chats.byId[chatId] || {}),
          ...update,
        },
      },
    },
  });
}

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateNewChat': {
      updateChat(update.chat.id, update.chat);
      break;
    }
    case 'updateChatReadInbox': {
      const { chat_id, last_read_inbox_message_id, unread_count } = update;

      updateChat(chat_id, {
        last_read_inbox_message_id,
        unread_count,
      });
      break;
    }
  }
}
