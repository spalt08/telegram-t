import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { ApiChat } from '../../../api/types';
import { GlobalState } from '../../../global/types';

import { CHAT_LIST_SLICE, MESSAGE_LIST_SLICE } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  replaceChatListIds, replaceChats, updateSelectedChatId, replaceUsers, updateUsers,
} from '../../reducers';

const TOP_MESSAGES_LIMIT = MESSAGE_LIST_SLICE * 2;

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
    limit: CHAT_LIST_SLICE,
  });

  let global = getGlobal();

  if (!result) {
    return global;
  }

  const { recentlyFoundChatIds } = global.globalSearch;

  const savedUsers = recentlyFoundChatIds ? [
    ...Object.values(global.users.byId).filter((user) => recentlyFoundChatIds.includes(user.id)),
    ...result.users,
  ] : result.users;

  const savedChats = recentlyFoundChatIds ? [
    ...Object.values(global.chats.byId).filter((chat) => recentlyFoundChatIds.includes(chat.id)),
    ...result.chats,
  ] : result.chats;

  global = replaceUsers(global, buildCollectionByKey(savedUsers, 'id'));
  global = replaceChats(global, buildCollectionByKey(savedChats, 'id'));
  global = replaceChatListIds(global, result.chat_ids);
  global = {
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {},
      draftsById: {
        ...global.chats.draftsById,
        ...result.draftsById,
      },
      replyingToById: {
        ...global.chats.replyingToById,
        ...result.replyingToById,
      },
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
    const result = await loadTopMessages(global.chats.byId[selectedChatId]);
    const newSelectedChatId = getGlobal().chats.selectedId;

    if (newSelectedChatId !== selectedChatId) {
      global = updateSelectedChatId(global, newSelectedChatId);
    } else if (result) {
      const byId = buildCollectionByKey(result.messages, 'id');
      const listedIds = Object.keys(byId).map(Number);

      messages = {
        byChatId: {
          [selectedChatId]: {
            byId,
            listedIds,
            viewportIds: listedIds,
            outlyingIds: undefined,
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

function loadTopMessages(chat: ApiChat) {
  return callApi('fetchMessages', {
    chat,
    offsetId: chat.last_read_inbox_message_id,
    addOffset: -(Math.round(TOP_MESSAGES_LIMIT / 2) + 1),
    limit: TOP_MESSAGES_LIMIT,
  });
}
