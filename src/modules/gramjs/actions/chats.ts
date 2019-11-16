import {
  addReducer, getDispatch, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { fetchChats } from '../../../api/gramjs';

const LOAD_CHATS_LIMIT = 50;

addReducer('loadChats', () => {
  void loadChats();
});

addReducer('loadMoreChats', (global) => {
  const lastChatId = global.chats.ids[global.chats.ids.length - 1];
  void loadChats(lastChatId);
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

async function loadChats(offsetId?: number) {
  const result = await fetchChats({
    limit: LOAD_CHATS_LIMIT,
    offsetId,
  });

  if (!result) {
    return;
  }

  const { chat_ids } = result;

  if (chat_ids.length > 0 && chat_ids[0] === offsetId) {
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

  const currentSelectedId = global.chats.selectedId;
  const prevSelectedId = Number(localStorage.getItem('selectedChatId'));

  if (!currentSelectedId && prevSelectedId && newIds.includes(prevSelectedId)) {
    getDispatch().selectChat({ id: prevSelectedId });
  }
}
