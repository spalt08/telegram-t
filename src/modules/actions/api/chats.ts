import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { CHAT_LIST_SLICE, SUPPORT_BOT_ID } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { addUsers, updateChatListIds, updateChats } from '../../reducers';
import { selectChat } from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { debounce, throttle } from '../../../util/schedulers';
import { isChatSummaryOnly } from '../../helpers';

const runDebouncedForFetchFullChat = debounce((cb) => cb(), 500, false, true);
const runDebouncedForFetchOnlines = debounce((cb) => cb(), 500, false, true);
const runThrottledForLoadTopChats = throttle((cb) => cb(), 3000, true);

addReducer('openChat', (global, actions, payload) => {
  const { id } = payload!;
  const { currentUserId } = global;
  const chat = selectChat(global, id);

  // Currently, there is no way to load Channel or User only with their ID.
  // Furthermore, outside of `Saved Messages` and `Help` links,
  // it is unlikely for user to open a chat that isn't already loaded
  if (!chat) {
    if (id === SUPPORT_BOT_ID) {
      void callApi('fetchSupportChat');
    } else if (id === currentUserId) {
      void callApi('fetchChatWithSelf');
    }
  } else if (isChatSummaryOnly(chat)) {
    actions.requestChatUpdate({ chatId: id });
  }
});

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
  if (!chat) {
    return;
  }

  void callApi('requestChatUpdate', chat);
});

addReducer('saveDraft', (global, actions, payload) => {
  const { chatId, draft } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat || !draft.text) {
    return global;
  }

  const draftsById = { ...global.chats.draftsById };
  draftsById[chatId] = draft;

  const { text, entities } = draft;

  void callApi('saveDraft', {
    chat,
    text,
    entities,
    replyToMsgId: global.chats.replyingToById[chatId],
  });

  return {
    ...global,
    chats: {
      ...global.chats,
      draftsById,
    },
  };
});

addReducer('clearDraft', (global, actions, payload) => {
  const { chatId, localOnly } = payload!;
  const chat = selectChat(global, chatId);

  const draftsById = { ...global.chats.draftsById };
  if (!chat || !draftsById[chatId]) {
    return global;
  }

  delete draftsById[chatId];

  if (!localOnly) {
    void callApi('clearDraft', chat);
  }

  return {
    ...global,
    chats: {
      ...global.chats,
      draftsById,
    },
  };
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
