import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { ApiChat, ApiUser } from '../../../api/types';
import { ChatCreationProgress } from '../../../types';

import { CHAT_LIST_SLICE, SUPPORT_BOT_ID, ARCHIVED_FOLDER_ID } from '../../../config';
import { callApi } from '../../../api/gramjs';
import {
  addUsers,
  updateChatListIds,
  updateChats,
  updateUsers,
  updateChat,
  updateSelectedChatId,
} from '../../reducers';
import { selectChat, selectOpenChat, selectUser } from '../../selectors';
import { buildCollectionByKey } from '../../../util/iteratees';
import { debounce, throttle } from '../../../util/schedulers';
import { isChatSummaryOnly, isChatArchived } from '../../helpers';

const runDebouncedForFetchFullChat = debounce((cb) => cb(), 500, false, true);
const runDebouncedForFetchOnlines = debounce((cb) => cb(), 500, false, true);
const runThrottledForLoadTopChats = throttle((cb) => cb(), 3000, true);

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
  const { folder } = payload!;
  const chatsWithLastMessages = Object.values(global.chats.byId)
    .filter((chat) => (
      Boolean(chat.lastMessage)
      && (folder === 'archived' ? chat.folderId === ARCHIVED_FOLDER_ID : chat.folderId !== ARCHIVED_FOLDER_ID)
    ));
  const lastChat = chatsWithLastMessages[chatsWithLastMessages.length - 1];

  if (lastChat) {
    void loadChats(folder, lastChat.id, lastChat.lastMessage!.date);
  } else {
    void loadChats(folder);
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
  const { id } = payload!;
  const chat = selectChat(global, id);
  if (chat) {
    void callApi('toggleChatPinned', chat);
  }
});

addReducer('toggleChatArchived', (global, actions, payload) => {
  const { id } = payload!;
  const chat = selectChat(global, id);
  if (chat) {
    void callApi('editChatFolder', {
      chat,
      folderId: isChatArchived(chat) ? 0 : ARCHIVED_FOLDER_ID,
    });
  }
});

async function loadChats(folder: 'active' | 'archived', offsetId?: number, offsetDate?: number) {
  const result = await callApi('fetchChats', {
    limit: CHAT_LIST_SLICE,
    offsetDate,
    archived: folder === 'archived',
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
  global = updateChatListIds(global, folder, chatIds);

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
