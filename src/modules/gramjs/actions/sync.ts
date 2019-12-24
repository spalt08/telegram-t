import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { callSdk } from '../../../api/gramjs';
import { ApiChat } from '../../../api/types';
import { GlobalState } from '../../../store/types';
import { buildCollectionByKey } from '../../../util/iteratees';

const INITIAL_CHATS_LIMIT = 50;
const INITIAL_MESSAGES_LIMIT = 50;

addReducer('sync', () => {
  void sync();
});

async function sync() {
  await loadAndReplaceChats();
  await loadAndReplaceMessages();
}

async function loadAndReplaceChats() {
  const result = await callSdk('fetchChats', {
    limit: INITIAL_CHATS_LIMIT,
  });

  if (!result) {
    return;
  }

  const newIds = result.chat_ids;

  const global = getGlobal();

  setGlobal({
    ...global,
    chats: {
      ...global.chats,
      ids: newIds,
      ...(global.chats.selectedId && !newIds.includes(global.chats.selectedId) && { selectedId: undefined }),
    },
  });
}

async function loadAndReplaceMessages() {
  let global = getGlobal();
  const byChatId: GlobalState['messages']['byChatId'] = {};

  if (global.chats.selectedId) {
    const messages = await loadTopMessages(global.chats.byId[global.chats.selectedId]);

    if (messages) {
      const byId = buildCollectionByKey(messages, 'id');
      byChatId[global.chats.selectedId] = { byId };
    }
  }

  global = getGlobal();

  setGlobal({
    ...getGlobal(),
    chats: {
      ...global.chats,
      scrollOffsetById: {},
    },
    messages: {
      ...global.messages,
      byChatId,
    },
  });
}

async function loadTopMessages(chat: ApiChat) {
  const result = await callSdk('fetchMessages', {
    chat,
    fromMessageId: 0,
    limit: INITIAL_MESSAGES_LIMIT,
  });

  if (!result) {
    return null;
  }

  return result.messages;
}
