import {
  addReducer, getDispatch, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { fetchChats } from '../../../api/gramjs';

const LOAD_CHATS_LIMIT = 50;

addReducer('loadChats', () => {
  void loadChats();
});

addReducer('loadMoreChats', (global) => {
  const chatsWithLastMessages = Object.values(global.chats.byId).filter((chat) => Boolean(chat.last_message));
  const lastChat = chatsWithLastMessages[chatsWithLastMessages.length - 1];
  void loadChats(lastChat.id, lastChat.last_message!.date);
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

async function loadChats(offsetId?: number, offsetDate?: number) {
  const result = await fetchChats({
    limit: LOAD_CHATS_LIMIT,
    offsetDate,
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
