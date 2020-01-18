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
  let global = getGlobal();
  global = await loadAndReplaceChats(global);
  global = await loadAndReplaceMessages(global);
  global = {
    ...global,
    lastSyncTime: Date.now(),
  };
  setGlobal(global);
}

async function loadAndReplaceChats(global: GlobalState) {
  const result = await callSdk('fetchChats', {
    limit: INITIAL_CHATS_LIMIT,
  });

  if (!result) {
    return global;
  }

  global = updateUsers(global, buildCollectionByKey(result.users, 'id'), true);
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'), true);
  global = updateChatIds(global, result.chat_ids, true);

  const currentSelectedId = global.chats.selectedId;
  global = {
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {},
      selectedId: currentSelectedId && result.chat_ids.includes(currentSelectedId) ? currentSelectedId : undefined,
    },
  };

  return global;
}

async function loadAndReplaceMessages(global: GlobalState) {
  if (global.chats.selectedId) {
    const result = await loadNewestMessages(global.chats.byId[global.chats.selectedId]);

    if (result && global.chats.selectedId) {
      let selectedMediaMessageId;
      const currentSelectedMessageMediaId = global.messages.selectedMediaMessageId;
      if (currentSelectedMessageMediaId) {
        const newIds = result.messages.map(({ id }) => id);
        if (newIds.includes(currentSelectedMessageMediaId)) {
          selectedMediaMessageId = currentSelectedMessageMediaId;
        }
      }

      global = {
        ...global,
        messages: {
          selectedMediaMessageId,
          byChatId: {
            [global.chats.selectedId]: {
              byId: buildCollectionByKey(result.messages, 'id'),
            },
          },
        },
      };

      global = updateUsers(global, buildCollectionByKey(result.users, 'id'));

      return global;
    }
  }

  global = {
    ...global,
    messages: { byChatId: {} },
  };

  return global;
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

  return result;
}
