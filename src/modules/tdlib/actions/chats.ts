import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';

addReducer('loadChats', () => {
  void loadChats();
});

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
  }) as {
    chat_ids: number[];
  };

  if (!result) {
    return;
  }

  const { chat_ids } = result;
  const global = getGlobal();
  const currentIds = global.chats.ids;
  const newIds = currentIds && currentIds.length ? chat_ids.filter((id) => !currentIds.includes(id)) : chat_ids;

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      ids: [
        ...currentIds,
        ...newIds,
      ],
    },
  });
}
