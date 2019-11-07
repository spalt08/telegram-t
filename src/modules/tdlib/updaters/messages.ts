import { getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate } from '../../../api/tdlib/updates';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateChatLastMessage':
      onUpdateChatLastMessage(update);
      break;

    case 'updateNewMessage':
      onUpdateNewMessage(update);
      break;
  }
}

function onUpdateChatLastMessage(update: TdLibUpdate) {
  const { chat_id, order, last_message } = update;

  const global = getGlobal();
  const chat = global.chats.byId[chat_id] || {};

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      byId: {
        ...global.chats.byId,
        [chat_id]: {
          ...chat,
          last_message,
          // @magic
          order: order === '0' && chat.order || order,
        },
      },
    },
  });
}


function onUpdateNewMessage(update: TdLibUpdate) {
  const { message } = update;

  const global = getGlobal();

  setGlobal({
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [message.chat_id]: [
          ...(global.messages.byChatId[message.chat_id] || []),
          message,
        ],
      },
    },
  });
}
