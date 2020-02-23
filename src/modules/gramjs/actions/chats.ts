import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { callApi } from '../../../api/gramjs';
import { addUsers, updateChatIds, updateChats } from '../../reducers';
import { selectChat } from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { debounce, throttle } from '../../../util/schedulers';

const LOAD_CHATS_LIMIT = 50;

const runDebouncedForFetchFullChat = debounce((cb) => cb(), 500, false, true);
const runDebouncedForFetchOnlines = debounce((cb) => cb(), 500, false, true);
const runThrottledForLoadTopChats = throttle((cb) => cb(), 3000, true);

addReducer('loadMoreChats', (global) => {
  const chatsWithLastMessages = Object.values(global.chats.byId).filter((chat) => Boolean(chat.last_message));
  const lastChat = chatsWithLastMessages[chatsWithLastMessages.length - 1];

  void loadChats(lastChat.id, lastChat.last_message!.date);
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

async function loadChats(offsetId?: number, offsetDate?: number) {
  const result = await callApi('fetchChats', {
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

  let global = getGlobal();

  global = addUsers(global, buildCollectionByKey(result.users, 'id'));
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'));
  global = updateChatIds(global, chat_ids);

  setGlobal(global);
}
