import { addReducer, getGlobal, updateGlobal } from '../../lib/reactnt';

import * as TdLib from '../../api/tdlib';
import { TdLibUpdate } from '../../api/tdlib/updates';

addReducer('loadChats', () => {
  void loadChats();
});

addReducer('selectChat', (global, actions, payload) => {
  const { id } = payload!;

  void loadChat(id);

  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId: id,
    }
  };
});

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateNewChat':
      const { byId = {} } = getGlobal().chats || {};

      updateGlobal({
        chats: {
          byId: {
            ...byId,
            [update.chat.id]: update.chat,
          },
        },
      });
      break;
  }
}

async function loadChats() {
  let offsetOrder = '9223372036854775807'; // 2^63 - 1
  let offsetChatId = 0;
  // if (!replace && chats && chats.length > 0) {
  //   const chat = ChatStore.get(chats[chats.length - 1]);
  //   if (chat) {
  //     offsetOrder = chat.order;
  //     offsetChatId = chat.id;
  //   }
  // }

  const result = await TdLib.send({
    '@type': 'getChats',
    offset_chat_id: offsetChatId,
    offset_order: offsetOrder,
    limit: 25,
  });

  // updateGlobal({
  //   chats: {
  //     ...getGlobal().chats.
  //   },
  // });
}

async function loadChat(id: number) {
}
