import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../../api/types';
import { ChatCreationProgress } from '../../../types';

import {
  CHAT_LIST_SLICE, SUPPORT_BOT_ID, ARCHIVED_FOLDER_ID, TOP_CHATS_PRELOAD_LIMIT,
} from '../../../config';
import { callApi } from '../../../api/gramjs';
import {
  addUsers,
  updateChatListIds,
  updateChats,
  updateUsers,
  updateChat,
  updateSelectedChatId,
} from '../../reducers';
import {
  selectChat,
  selectOpenChat,
  selectUser,
  selectChatListType,
  selectIsChatPinned,
  selectChatFolder,
} from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { debounce, pause, throttle } from '../../../util/schedulers';
import { isChatSummaryOnly, isChatArchived, prepareChatList } from '../../helpers';

const TOP_CHATS_PRELOAD_PAUSE = 500;

const runThrottledForLoadChats = throttle((cb) => cb(), 500, true);
const runThrottledForLoadTopChats = throttle((cb) => cb(), 3000, true);
const runDebouncedForFetchFullChat = debounce((cb) => cb(), 500, false, true);
const runDebouncedForFetchOnlines = debounce((cb) => cb(), 500, false, true);

addReducer('preloadTopChatMessages', (global, actions) => {
  (async () => {
    const preloadedChatIds: number[] = [];

    for (let i = 0; i < TOP_CHATS_PRELOAD_LIMIT; i++) {
      await pause(TOP_CHATS_PRELOAD_PAUSE);

      const {
        selectedId,
        byId,
        listIds: { active: listIds },
        orderedPinnedIds: { active: orderedPinnedIds },
      } = getGlobal().chats;
      if (!listIds) {
        return;
      }

      const { pinnedChats, otherChats } = prepareChatList(byId, listIds, orderedPinnedIds);
      const topChats = [...pinnedChats, ...otherChats];
      const chatToPreload = topChats.find(({ id }) => id !== selectedId && !preloadedChatIds.includes(id));
      if (!chatToPreload) {
        return;
      }

      preloadedChatIds.push(chatToPreload.id);

      actions.loadViewportMessages({ chatId: chatToPreload.id });
    }
  })();
});

addReducer('openChat', (global, actions, payload) => {
  const { id } = payload!;
  const { currentUserId } = global;
  const chat = selectChat(global, id);

  // TODO Support non-user chats
  if (!chat) {
    if (id === SUPPORT_BOT_ID) {
      void callApi('fetchChat', { type: 'support' });
    } else if (id === currentUserId) {
      void callApi('fetchChat', { type: 'self' });
    } else {
      const user = selectUser(global, id);
      if (user) {
        void callApi('fetchChat', { type: 'user', user });
      }
    }
  } else if (isChatSummaryOnly(chat)) {
    actions.requestChatUpdate({ chatId: id });
  }
});

addReducer('loadMoreChats', (global, actions, payload) => {
  const { listType = 'active' } = payload!;
  const listIds = global.chats.listIds[listType as ('active' | 'archived')];
  const oldestChat = listIds
    ? listIds
      .map((id) => global.chats.byId[id])
      .filter((chat) => Boolean(chat && chat.lastMessage))
      .sort((chat1, chat2) => (chat1.lastMessage!.date - chat2.lastMessage!.date))[0]
    : undefined;

  if (oldestChat) {
    runThrottledForLoadChats(() => loadChats(listType, oldestChat.id, oldestChat.lastMessage!.date));
  } else {
    runThrottledForLoadChats(() => loadChats(listType));
  }
});

addReducer('loadFullChat', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  runDebouncedForFetchFullChat(() => loadFullChat(chat));
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
  runThrottledForLoadTopChats(() => loadChats('active'));
});

addReducer('requestChatUpdate', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  void callApi('requestChatUpdate', chat);
});

addReducer('markChatRead', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  if (!chat) {
    return;
  }

  const { maxId } = payload || {};

  void callApi('markChatRead', { chat, maxId });
});

addReducer('updateChatMutedState', (global, actions, payload) => {
  const { chatId, isMuted } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  void callApi('updateChatMutedState', { chat, isMuted });
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

addReducer('createChannel', (global, actions, payload) => {
  const { title, about, photo } = payload!;
  void createChannel(title, about, photo);
});

addReducer('joinChannel', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const { id: channelId, accessHash } = chat;

  if (channelId && accessHash) {
    void callApi('joinChannel', { channelId, accessHash });
  }
});

addReducer('leaveChannel', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const { id: channelId, accessHash } = chat;

  if (channelId && accessHash) {
    void callApi('leaveChannel', { channelId, accessHash });
  }
});

addReducer('deleteChannel', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const { id: channelId, accessHash } = chat;

  if (channelId && accessHash) {
    void callApi('deleteChannel', { channelId, accessHash });
  }
});

addReducer('createGroupChat', (global, actions, payload) => {
  const { title, memberIds, photo } = payload!;
  const members = (memberIds as number[])
    .map((id: number) => selectUser(global, id))
    .filter<ApiUser>(Boolean as any);

  void createGroupChat(title, members, photo);
});

addReducer('toggleChatPinned', (global, actions, payload) => {
  const { id, folderId } = payload!;
  const chat = selectChat(global, id);
  if (!chat) {
    return;
  }


  if (folderId) {
    const folder = selectChatFolder(global, folderId);
    if (folder) {
      const shouldBePinned = !selectIsChatPinned(global, id, folderId);

      const { pinnedChatIds } = folder;
      const newPinnedIds = shouldBePinned
        ? [id, ...(pinnedChatIds || [])]
        : (pinnedChatIds || []).filter((pinnedId) => pinnedId !== id);

      void callApi('editChatFolder', {
        id: folderId,
        folderUpdate: {
          ...folder,
          pinnedChatIds: newPinnedIds,
        },
      });
    }
  } else {
    const listType = selectChatListType(global, id);
    const isPinned = selectIsChatPinned(global, id, listType === 'archived' ? ARCHIVED_FOLDER_ID : undefined);
    void callApi('toggleChatPinned', { chat, shouldBePinned: !isPinned });
  }
});

addReducer('toggleChatArchived', (global, actions, payload) => {
  const { id } = payload!;
  const chat = selectChat(global, id);
  if (chat) {
    void callApi('toggleChatArchived', {
      chat,
      folderId: isChatArchived(chat) ? 0 : ARCHIVED_FOLDER_ID,
    });
  }
});

addReducer('loadChatFolders', () => {
  void loadChatFolders();
});

addReducer('toggleChatUnread', (global, actions, payload) => {
  const { id } = payload!;
  const chat = selectChat(global, id);
  if (chat) {
    if (chat.unreadCount) {
      void callApi('markChatRead', { chat });
    } else {
      void callApi('toggleDialogUnread', {
        chat,
        hasUnreadMark: !chat.hasUnreadMark,
      });
    }
  }
});

async function loadChats(listType: 'active' | 'archived', offsetId?: number, offsetDate?: number) {
  const result = await callApi('fetchChats', {
    limit: CHAT_LIST_SLICE,
    offsetDate,
    archived: listType === 'archived',
  });

  if (!result) {
    return;
  }

  const { chatIds } = result;

  if (chatIds.length > 0 && chatIds[0] === offsetId) {
    chatIds.shift();
  }

  let global = getGlobal();

  global = addUsers(global, buildCollectionByKey(result.users, 'id'));
  global = updateChats(global, buildCollectionByKey(result.chats, 'id'));
  global = updateChatListIds(global, listType, chatIds);
  if (result.totalChatCount !== undefined) {
    global = {
      ...global,
      chats: {
        ...global.chats,
        totalCount: {
          ...global.chats.totalCount,
          [listType === 'active' ? 'all' : 'archived']: result.totalChatCount,
        },
      },
    };
  }

  setGlobal(global);
}

async function loadFullChat(chat: ApiChat) {
  const result = await callApi('fetchFullChat', chat);
  if (!result) {
    return;
  }

  const { users, fullInfo } = result;

  let global = getGlobal();
  global = updateUsers(global, buildCollectionByKey(users, 'id'));
  global = updateChat(global, chat.id, { fullInfo });

  setGlobal(global);
}

async function createChannel(title: string, about?: string, photo?: File) {
  setGlobal({
    ...getGlobal(),
    chatCreation: {
      progress: ChatCreationProgress.InProgress,
    },
  });

  const createdChannel = await callApi('createChannel', { title, about });
  if (!createdChannel) {
    return;
  }

  const { id: channelId, accessHash } = createdChannel;

  let global = updateChat(getGlobal(), channelId, createdChannel);
  global = updateSelectedChatId(global, channelId);
  setGlobal({
    ...global,
    chatCreation: {
      ...global.chatCreation,
      progress: createdChannel ? ChatCreationProgress.Complete : ChatCreationProgress.Error,
    },
  });

  if (channelId && accessHash && photo) {
    await callApi('editChannelPhoto', { channelId, accessHash, photo });
  }
}

async function createGroupChat(title: string, users: ApiUser[], photo?: File) {
  setGlobal({
    ...getGlobal(),
    chatCreation: {
      progress: ChatCreationProgress.InProgress,
    },
  });

  const createdChat = await callApi('createGroupChat', { title, users });
  if (!createdChat) {
    return;
  }

  const { id: chatId } = createdChat;

  let global = updateChat(getGlobal(), chatId, createdChat);
  global = updateSelectedChatId(global, chatId);

  setGlobal({
    ...global,
    chatCreation: {
      ...global.chatCreation,
      progress: createdChat ? ChatCreationProgress.Complete : ChatCreationProgress.Error,
    },
  });

  if (chatId && photo) {
    await callApi('editChatPhoto', { chatId, photo });
  }
}

async function loadChatFolders() {
  const chatFolders = await callApi('fetchChatFolders');

  if (chatFolders) {
    setGlobal({
      ...getGlobal(),
      chatFolders,
    });
  }
}
