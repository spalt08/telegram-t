import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { callSdk } from '../../../api/gramjs';
import { addChatIds, updateChatScrollOffset } from '../../common/chats';
import { selectChat } from '../../selectors';

const LOAD_CHATS_LIMIT = 50;

addReducer('loadMoreChats', (global) => {
  const chatsWithLastMessages = Object.values(global.chats.byId).filter((chat) => Boolean(chat.last_message));
  const lastChat = chatsWithLastMessages[chatsWithLastMessages.length - 1];
  void loadChats(lastChat.id, lastChat.last_message!.date);
});

addReducer('setChatScrollOffset', (global, actions, payload) => {
  const { chatId, scrollOffset } = payload!;

  return updateChatScrollOffset(global, chatId, scrollOffset);
});

addReducer('loadFullChat', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const { id, access_hash: accessHash } = chat;

  void callSdk('fetchFullChat', { id, accessHash });
});

addReducer('loadChatOnlines', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const { id, access_hash: accessHash } = chat;

  void callSdk('fetchChatOnlines', { id, accessHash });
});

async function loadChats(offsetId?: number, offsetDate?: number) {
  const result = await callSdk('fetchChats', {
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

  setGlobal(addChatIds(getGlobal(), chat_ids));
}
