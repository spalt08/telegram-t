import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../../api/types';
import { GlobalState, GlobalActions } from '../../../global/types';

import { CHAT_LIST_LOAD_SLICE, MESSAGE_LIST_SLICE } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  replaceChatListIds,
  replaceChats,
  updateSelectedChatId,
  replaceUsers,
  updateUsers,
  updateChats,
  updateSecondaryChatsInfo,
} from '../../reducers';
import { selectUser, selectChat } from '../../selectors';
import { isChatPrivate } from '../../helpers';

const TOP_MESSAGES_LIMIT = MESSAGE_LIST_SLICE * 2;

addReducer('sync', (global, actions) => {
  void sync(actions.afterSync);
});

addReducer('afterSync', (global, actions) => {
  void afterSync(actions);
});

async function afterSync(actions: GlobalActions) {
  await loadAndReplaceArchivedChats();

  // Until favorite stickers aren't loaded, adding and removing Favorite Stickers is not possible
  actions.loadFavoriteStickers();
}

async function sync(afterSyncCallback: () => void) {
  // This fetches only active chats and clears archived chats, which will be fetched in `afterSync`
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

  afterSyncCallback();
}

async function loadAndReplaceChats() {
  const result = await callApi('fetchChats', {
    limit: CHAT_LIST_LOAD_SLICE,
    isSync: true,
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
  global = replaceChatListIds(global, 'active', result.chatIds);

  global = {
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {},
    },
  };

  global = updateSecondaryChatsInfo(global, 'active', result);

  const currentSelectedId = global.chats.selectedId;
  if (
    currentSelectedId
    && !global.chats.byId[currentSelectedId]
  ) {
    global = updateSelectedChatId(global, undefined);
  }

  return global;
}

async function loadAndReplaceArchivedChats() {
  const result = await callApi('fetchChats', {
    limit: CHAT_LIST_LOAD_SLICE,
    archived: true,
    isSync: true,
  });

  if (!result) {
    return;
  }

  let global = getGlobal();

  global = updateUsers(global, buildCollectionByKey(result.users, 'id'));
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'));
  global = replaceChatListIds(global, 'archived', result.chatIds);
  global = updateSecondaryChatsInfo(global, 'archived', result);

  setGlobal(global);
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
