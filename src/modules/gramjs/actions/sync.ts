import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { ApiChat } from '../../../api/types';
import { GlobalState } from '../../../store/types';

import { callSdk } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import { updateChats } from '../../common/chats';
import { updateUsers } from '../../common/users';

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

  let global = getGlobal();

  global = updateUsers(global, buildCollectionByKey(result.users, 'id'));
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'));

  const newIds = result.chat_ids;

  global = {
    ...global,
    chats: {
      ...global.chats,
      ids: newIds,
      ...(global.chats.selectedId && !newIds.includes(global.chats.selectedId) && { selectedId: undefined }),
    },
  };

  setGlobal(global);
}

async function loadAndReplaceMessages() {
  let global = getGlobal();
  const newMessages: GlobalState['messages'] = { byChatId: {} };

  if (global.chats.selectedId) {
    const messages = await loadTopMessages(global.chats.byId[global.chats.selectedId]);

    if (messages) {
      const byId = buildCollectionByKey(messages, 'id');
      newMessages.byChatId[global.chats.selectedId] = { byId };

      newMessages.selectedMediaMessageId = undefined;
      const currentSelectedMessageMediaId = global.messages.selectedMediaMessageId;
      if (currentSelectedMessageMediaId) {
        const newIds = messages.map(({ id }) => id);
        if (newIds.includes(currentSelectedMessageMediaId)) {
          newMessages.selectedMediaMessageId = currentSelectedMessageMediaId;
        }
      }
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
      ...newMessages,
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
