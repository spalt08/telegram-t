import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../../api/types';
import { GlobalState } from '../../../global/types';

import { CHAT_LIST_SLICE, MESSAGE_LIST_SLICE } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  replaceChatListIds, replaceChats, updateSelectedChatId, replaceUsers, updateUsers,
} from '../../reducers';
import { selectUser, selectChat } from '../../selectors';
import { isChatPrivate } from '../../helpers';

const TOP_MESSAGES_LIMIT = MESSAGE_LIST_SLICE * 2;

addReducer('sync', () => {
  void sync();
});

async function sync() {
  let global = await loadAndReplaceChats();
  setGlobal(await loadAndReplaceMessages(global));

  global = await loadAndUpdateUsers();
  global = {
    ...global,
    lastSyncTime: Date.now(),
  };
  setGlobal(global);

  // Full info of current user can be erased during sync, so we fetch it again afterwards.
  await callApi('fetchCurrentUser');
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
  const { userIds: contactIds } = global.contactList || {};
  const { selectedId: selectedChatId } = global.chats;
  const { currentUserId } = global;

  const savedPrivateChatIds = [
    ...(recentlyFoundChatIds || []),
    ...(contactIds || []),
    ...(currentUserId ? [currentUserId] : []),
  ];

  const savedUsers = savedPrivateChatIds
    .map((id) => selectUser(global, id))
    .filter<ApiUser>(Boolean as any);

  const savedChats = savedPrivateChatIds
    .map((id) => selectChat(global, id))
    .filter<ApiChat>(Boolean as any);

  if (selectedChatId) {
    const selectedChat = selectChat(global, selectedChatId);
    if (selectedChat && !savedPrivateChatIds.includes(selectedChatId)) {
      savedChats.push(selectedChat);
    }

    if (isChatPrivate(selectedChatId)) {
      const selectedChatUser = selectUser(global, selectedChatId);
      if (selectedChatUser && !savedPrivateChatIds.includes(selectedChatId)) {
        savedUsers.push(selectedChatUser);
      }
    }
  }

  savedUsers.push(...result.users);
  savedChats.push(...result.chats);

  global = replaceUsers(global, buildCollectionByKey(savedUsers, 'id'));
  global = replaceChats(global, buildCollectionByKey(savedChats, 'id'));
  global = replaceChatListIds(global, result.chatIds);
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
  if (
    currentSelectedId
    && !global.chats.byId[currentSelectedId]
  ) {
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

    if (result && newSelectedChatId === selectedChatId) {
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

  return {
    ...global,
    messages,
  } as GlobalState;
}

async function loadAndUpdateUsers() {
  let global = getGlobal();
  const { recentlyFoundChatIds } = global.globalSearch;
  const { userIds: contactIds } = global.contactList || {};
  if (
    (!contactIds || !contactIds.length)
    && (!recentlyFoundChatIds || !recentlyFoundChatIds.length)
  ) {
    return global;
  }

  const users = [
    ...(recentlyFoundChatIds || []),
    ...(contactIds || []),
  ].map((id) => selectUser(global, id)).filter<ApiUser>(Boolean as any);

  const updatedUsers = await callApi('fetchUsers', { users });
  global = getGlobal();

  if (!updatedUsers) {
    return global;
  }

  return updateUsers(global, buildCollectionByKey(updatedUsers, 'id'));
}

function loadTopMessages(chat: ApiChat) {
  return callApi('fetchMessages', {
    chat,
    offsetId: chat.lastReadInboxMessageId,
    addOffset: -(Math.round(TOP_MESSAGES_LIMIT / 2) + 1),
    limit: TOP_MESSAGES_LIMIT,
  });
}
