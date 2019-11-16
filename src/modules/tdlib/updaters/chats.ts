import { getDispatch, getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate, ApiChat } from '../../../api/tdlib/types';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateNewChat': {
      updateChat(update.chat.id, update.chat);

      getDispatch().loadChatPhoto({ chat: update.chat });

      break;
    }

    case 'updateChatLastMessage': {
      const { chat_id, order, last_message } = update;
      const chat = getGlobal().chats.byId[chat_id] || {};

      updateChat(chat_id, {
        last_message,
        // @magic
        order: (order === '0' && chat.order) || order,
      });

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

    case 'updateChatReadOutbox': {
      const { chat_id, last_read_outbox_message_id } = update;

      updateChat(chat_id, {
        last_read_outbox_message_id,
      });

      break;
    }

    case 'updateChatIsPinned': {
      const { chat_id, is_pinned } = update;

      updateChat(chat_id, {
        is_pinned,
      });

      break;
    }
  }
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
