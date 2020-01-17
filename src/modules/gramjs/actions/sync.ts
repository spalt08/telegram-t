import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { ApiChat } from '../../../api/types';
import { GlobalState } from '../../../store/types';

import { callSdk } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import { updateChatIds, updateChats } from '../../common/chats';
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

  global = updateUsers(global, buildCollectionByKey(result.users, 'id'), true);
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'), true);
  global = updateChatIds(global, result.chat_ids, true);

  if (global.chats.selectedId && !result.chat_ids.includes(global.chats.selectedId)) {
    global = {
      ...global,
      chats: {
        ...global.chats,
        selectedId: undefined,
      },
    };
  }

  setGlobal(global);
}

async function loadAndReplaceMessages() {
  let global = getGlobal();
  const newMessages: GlobalState['messages'] = { byChatId: {} };

  if (global.chats.selectedId) {
    const messages = await loadNewestMessages(global.chats.byId[global.chats.selectedId]);

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
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {},
    },
    messages: newMessages,
  });
}

async function loadNewestMessages(chat: ApiChat) {
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
