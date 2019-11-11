import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';

// https://core.telegram.org/tdlib/docs/classtd_1_1td__api_1_1get_chats.html
const OFFSET_ORDER = '9223372036854775807';
// Each call to `getChats` produce 100 `updateNewChat` updates, no matter what the next limit is.
const LOAD_CHATS_LIMIT = 100;

addReducer('loadChats', () => {
  void loadChats();
});

addReducer('loadMoreChats', (global) => {
  const lastChatId = global.chats.ids[global.chats.ids.length - 1];
  const lastOrder = global.chats.byId[lastChatId].order;
  void loadChats(lastChatId, lastOrder);
});

addReducer('setChatScrollOffset', (global, actions, payload) => {
  const { chatId, scrollOffset } = payload!;

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {
        ...global.chats.scrollOffsetById,
        [chatId]: scrollOffset,
      },
    },
  });
});

async function loadChats(offsetChatId: number | null = null, offsetOrder = OFFSET_ORDER) {
  const result = await TdLib.send({
    '@type': 'getChats',
    offset_chat_id: offsetChatId,
    offset_order: offsetOrder,
    limit: LOAD_CHATS_LIMIT,
  }) as {
    chat_ids: number[];
  };

  if (!result) {
    return;
  }

  const { chat_ids } = result;

  if (chat_ids.length > 0 && chat_ids[0] === offsetChatId) {
    chat_ids.shift();
  }

  const global = getGlobal();
  const currentIds = global.chats.ids;
  const newIds = (currentIds && currentIds.length) ? chat_ids.filter((id) => !currentIds.includes(id)) : chat_ids;

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
