import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { callSdk } from '../../../api/gramjs';
import { updateChatIds, updateChats } from '../../common/chats';
import { selectChat } from '../../selectors';
import { updateUsers } from '../../common/users';
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

  runDebouncedForFetchFullChat(() => callSdk('fetchFullChat', chat));
});

addReducer('loadChatOnlines', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  runDebouncedForFetchOnlines(() => callSdk('fetchChatOnlines', chat));
});

addReducer('loadTopChats', () => {
  runThrottledForLoadTopChats(() => loadChats());
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

  let global = getGlobal();

  global = updateUsers(global, buildCollectionByKey(result.users, 'id'));
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'));
  global = updateChatIds(global, chat_ids);

  setGlobal(global);
}
