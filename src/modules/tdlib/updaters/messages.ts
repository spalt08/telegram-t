import { getGlobal, setGlobal } from '../../../lib/teactn';

import { TdLibUpdate } from '../../../api/tdlib/updates';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateChatLastMessage':
      onUpdateChatLastMessage(update);
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
          order: order === '0' && chat.order || order
        }
      }
    }
  });
}
