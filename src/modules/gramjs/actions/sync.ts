import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { ApiChat } from '../../../api/types';
import { GlobalState } from '../../../store/types';

import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  replaceChatIds, replaceChats, updateSelectedChatId, replaceUsers, updateUsers,
} from '../../reducers';

const INITIAL_CHATS_LIMIT = 50;
const INITIAL_MESSAGES_LIMIT = 50;

addReducer('sync', () => {
  void sync();
});

async function sync() {
  let global = await loadAndReplaceChats();
  global = await loadAndReplaceMessages(global);
  global = {
    ...global,
    lastSyncTime: Date.now(),
  };
  setGlobal(global);
}

async function loadAndReplaceChats() {
  const result = await callApi('fetchChats', {
    limit: INITIAL_CHATS_LIMIT,
  });

  let global = getGlobal();

  if (!result) {
    return global;
  }

  global = replaceUsers(global, buildCollectionByKey(result.users, 'id'));
  global = replaceChats(global, buildCollectionByKey(result.chats, 'id'));
  global = replaceChatIds(global, result.chat_ids);
  global = {
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {},
    },
  };

  const currentSelectedId = global.chats.selectedId;
  if (currentSelectedId && !result.chat_ids.includes(currentSelectedId)) {
    global = updateSelectedChatId(global, undefined);
  }

  return global;
}

async function loadAndReplaceMessages(global: GlobalState) {
  const selectedChatId = global.chats.selectedId;
  let messages: GlobalState['messages'] = { byChatId: {} };

  if (selectedChatId) {
    const result = await loadNewestMessages(global.chats.byId[selectedChatId]);
    const newSelectedChatId = getGlobal().chats.selectedId;

    if (newSelectedChatId !== selectedChatId) {
      global = updateSelectedChatId(global, newSelectedChatId);
    } else if (result) {
      const byId = buildCollectionByKey(result.messages, 'id');
      const listedIds = Object.keys(byId).map(Number);

      let selectedMediaMessageId;
      const currentSelectedMessageMediaId = global.messages.selectedMediaMessageId;
      if (currentSelectedMessageMediaId) {
        const newIds = result.messages.map(({ id }) => id);
        if (newIds.includes(currentSelectedMessageMediaId)) {
          selectedMediaMessageId = currentSelectedMessageMediaId;
        }
      }

      messages = {
        selectedMediaMessageId,
        byChatId: {
          [selectedChatId]: {
            byId,
            listedIds,
          },
        },
      };

      global = updateUsers(global, buildCollectionByKey(result.users, 'id'));
    }
  }

  global = {
    ...global,
    messages,
  };

  return global;
}

async function loadNewestMessages(chat: ApiChat) {
  const result = await callApi('fetchMessages', {
    chat,
    fromMessageId: 0,
    limit: INITIAL_MESSAGES_LIMIT,
  });

  if (!result) {
    return null;
  }

  return result;
}
