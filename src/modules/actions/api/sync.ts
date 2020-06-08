import {
  addReducer, getDispatch, getGlobal, setGlobal,
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
import { pause } from '../../../util/schedulers';
import prepareChats from '../../../components/common/helpers/prepareChats';

const TOP_MESSAGES_LIMIT = MESSAGE_LIST_SLICE * 2;
const TOP_CHATS_PRELOAD_LIMIT = 10;
const TOP_CHATS_PRELOAD_PAUSE = 500;

addReducer('sync', (global, actions) => {
  const { afterSync } = actions;
  void sync(afterSync);
});

addReducer('afterSync', (global, actions) => {
  preloadTopChatMessages();

  // Until favorite stickers aren't loaded, adding and removing Favorite Stickers is not possible
  actions.loadFavoriteStickers();
});

async function sync(afterSyncCallback: () => void) {
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
  const resultActive = await callApi('fetchChats', {
    limit: CHAT_LIST_SLICE,
    isSync: true,
  });
  const resultArchived = await callApi('fetchChats', {
    limit: CHAT_LIST_SLICE,
    archived: true,
    isSync: true,
  });

  let global = getGlobal();

  if (!resultActive && !resultArchived) {
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

  if (resultActive) {
    savedUsers.push(...resultActive.users);
    savedChats.push(...resultActive.chats);
  }
  if (resultArchived) {
    savedUsers.push(...resultArchived.users);
    savedChats.push(...resultArchived.chats);
  }

  global = replaceUsers(global, buildCollectionByKey(savedUsers, 'id'));
  global = replaceChats(global, buildCollectionByKey(savedChats, 'id'));
  global = replaceChatListIds(global, 'active', resultActive ? resultActive.chatIds : undefined);
  global = replaceChatListIds(global, 'archived', resultArchived ? resultArchived.chatIds : undefined);
  global = {
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {},
      orderedPinnedIds: {
        ...global.chats.orderedPinnedIds,
        ...(resultActive && { active: resultActive.orderedPinnedIds }),
        ...(resultArchived && { archived: resultArchived.orderedPinnedIds }),
      },
      draftsById: {
        ...global.chats.draftsById,
        ...(resultActive && resultActive.draftsById),
        ...(resultArchived && resultArchived.draftsById),
      },
      replyingToById: {
        ...global.chats.replyingToById,
        ...(resultActive && resultActive.replyingToById),
        ...(resultArchived && resultArchived.replyingToById),
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

async function preloadTopChatMessages() {
  const preloadedChatIds: number[] = [];

  for (let i = 0; i < TOP_CHATS_PRELOAD_LIMIT; i++) {
    await pause(TOP_CHATS_PRELOAD_PAUSE);

    const {
      selectedId, byId, listIds, orderedPinnedIds,
    } = getGlobal().chats;
    if (!listIds.active) {
      return;
    }

    const { pinnedChats, otherChats } = prepareChats(byId, listIds.active, orderedPinnedIds.active);
    const topChats = [...pinnedChats, ...otherChats];
    const chatToPreload = topChats.find(({ id }) => id !== selectedId && !preloadedChatIds.includes(id));
    if (!chatToPreload) {
      return;
    }

    preloadedChatIds.push(chatToPreload.id);

    getDispatch().loadViewportMessages({ chatId: chatToPreload.id });
  }
}
