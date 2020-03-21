import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { CHAT_LIST_SLICE } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { addUsers, updateChatListIds, updateChats } from '../../reducers';
import { selectChat } from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { debounce, throttle } from '../../../util/schedulers';

const runDebouncedForFetchFullChat = debounce((cb) => cb(), 500, false, true);
const runDebouncedForFetchOnlines = debounce((cb) => cb(), 500, false, true);
const runThrottledForLoadTopChats = throttle((cb) => cb(), 3000, true);

addReducer('loadMoreChats', (global) => {
  const chatsWithLastMessages = Object.values(global.chats.byId).filter((chat) => Boolean(chat.last_message));
  const lastChat = chatsWithLastMessages[chatsWithLastMessages.length - 1];

  if (lastChat) {
    void loadChats(lastChat.id, lastChat.last_message!.date);
  } else {
    void loadChats();
  }
});

addReducer('loadFullChat', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  runDebouncedForFetchFullChat(() => callApi('fetchFullChat', chat));
});

addReducer('loadSuperGroupOnlines', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  runDebouncedForFetchOnlines(() => callApi('fetchSuperGroupOnlines', chat));
});

addReducer('loadTopChats', () => {
  runThrottledForLoadTopChats(() => loadChats());
});

addReducer('requestChatUpdate', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);

  void callApi('requestChatUpdate', chat);
});

async function loadChats(offsetId?: number, offsetDate?: number) {
  const result = await callApi('fetchChats', {
    limit: CHAT_LIST_SLICE,
    offsetDate,
  });

  if (!result) {
    return;
  }

  const { chat_ids } = result;

  if (chat_ids.length > 0 && chat_ids[0] === offsetId) {
    chat_ids.shift();
  }

  let global = getGlobal();

  global = addUsers(global, buildCollectionByKey(result.users, 'id'));
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'));
  global = updateChatListIds(global, chat_ids);

  setGlobal(global);
}
