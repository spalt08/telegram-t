import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat, ApiMessage, ApiOnProgress } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import { MESSAGE_LIST_SLICE } from '../../../config';
import { callApi, cancelApiProgress } from '../../../api/gramjs';
import { areSortedArraysIntersecting, buildCollectionByKey } from '../../../util/iteratees';
import {
  addUsers,
  addChatMessagesById,
  safeReplaceViewportIds,
  updateChatMessage,
  updateListedIds,
  updateOutlyingIds,
  replaceOutlyingIds,
} from '../../reducers';
import {
  selectChat,
  selectOpenChat,
  selectListedIds,
  selectOutlyingIds,
  selectViewportIds,
  selectFocusedMessageId,
  selectRealLastReadId,
  selectChatMessage,
} from '../../selectors';

const uploadProgressCallbacks: Record<string, ApiOnProgress> = {};

addReducer('loadViewportMessages', (global, actions, payload) => {
  const {
    direction,
    shouldRelocate = false,
  } = payload || {};
  const chat = selectOpenChat(global);

  if (!chat || chat.isRestricted) {
    return undefined;
  }

  const chatId = chat.id;
  const viewportIds = selectViewportIds(global, chatId);
  const listedIds = selectListedIds(global, chatId);
  const outlyingIds = selectOutlyingIds(global, chatId);

  let newGlobal = global;

  if (!viewportIds || !viewportIds.length || shouldRelocate) {
    const offsetId = selectFocusedMessageId(newGlobal, chatId) || selectRealLastReadId(newGlobal, chatId);
    const isOutlying = Boolean(offsetId && listedIds && !listedIds.includes(offsetId));
    const historyIds = (isOutlying ? outlyingIds : listedIds) || [];
    const {
      newViewportIds, areSomeLocal, areAllLocal,
    } = getViewportSlice(historyIds, offsetId, LoadMoreDirection.Around);

    if (areSomeLocal && newViewportIds.length >= MESSAGE_LIST_SLICE) {
      newGlobal = safeReplaceViewportIds(newGlobal, chatId, newViewportIds);
    }

    if (!areAllLocal) {
      const loadLimit = isOutlying ? MESSAGE_LIST_SLICE : MESSAGE_LIST_SLICE * 2;
      void loadViewportMessages(chat, offsetId, LoadMoreDirection.Around, loadLimit, isOutlying);
    }
  } else {
    const isOutlying = Boolean(outlyingIds);
    const historyIds = (isOutlying ? outlyingIds : listedIds)!;

    if (direction === LoadMoreDirection.Backwards || direction === LoadMoreDirection.Both) {
      const offsetId = viewportIds[0];
      const {
        newViewportIds, areSomeLocal, areAllLocal,
      } = getViewportSlice(historyIds, offsetId, LoadMoreDirection.Backwards);

      if (areSomeLocal) {
        newGlobal = safeReplaceViewportIds(newGlobal, chatId, newViewportIds);
      }

      if (!areAllLocal) {
        void loadViewportMessages(chat, offsetId, LoadMoreDirection.Backwards, undefined, isOutlying);
      }
    }

    if (direction === LoadMoreDirection.Forwards || direction === LoadMoreDirection.Both) {
      const offsetId = viewportIds[viewportIds.length - 1];
      const {
        newViewportIds, areSomeLocal, areAllLocal,
      } = getViewportSlice(historyIds!, offsetId, LoadMoreDirection.Forwards);

      if (areSomeLocal) {
        newGlobal = safeReplaceViewportIds(newGlobal, chatId, newViewportIds);
      }

      if (!areAllLocal) {
        void loadViewportMessages(chat, offsetId, LoadMoreDirection.Forwards, undefined, isOutlying);
      }
    }
  }

  return newGlobal;
});

addReducer('loadMessage', (global, actions, payload) => {
  const { chatId, messageId } = payload!;
  const chat = selectChat(global, chatId);

  if (!chat) {
    return;
  }

  void loadMessage(chat, messageId);
});

addReducer('sendMessage', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  const { currentUserId } = global;

  if (!chat || !currentUserId) {
    return;
  }

  const {
    text, entities, attachment, sticker, gif, poll,
  } = payload!;
  const replyingTo = global.chats.replyingToById[chat.id];

  const progressCallback = attachment ? (progress: number, messageLocalId: number) => {
    if (!uploadProgressCallbacks[messageLocalId]) {
      uploadProgressCallbacks[messageLocalId] = progressCallback!;
    }

    const newGlobal = getGlobal();

    setGlobal({
      ...newGlobal,
      fileUploads: {
        byMessageLocalId: {
          ...newGlobal.fileUploads.byMessageLocalId,
          [messageLocalId]: { progress },
        },
      },
    });
  } : undefined;

  (async () => {
    await callApi('sendMessage', {
      chat, currentUserId, text, entities, replyingTo, attachment, sticker, gif, poll,
    }, progressCallback);

    if (progressCallback) {
      const callbackKey = Object.keys(uploadProgressCallbacks).find((key) => (
        uploadProgressCallbacks[key] === progressCallback
      ));
      if (callbackKey) {
        delete uploadProgressCallbacks[callbackKey];
      }
    }

    actions.setChatReplyingTo({ chatId: chat.id, messageId: undefined });
  })();
});

addReducer('editMessage', (global, actions, payload) => {
  const { messageId, text, entities } = payload!;

  const chat = selectOpenChat(global);
  const message = chat && selectChatMessage(global, chat.id, messageId);

  if (!chat || !message) {
    return;
  }

  void callApi('editMessage', {
    chat, message, text, entities,
  });

  actions.setChatEditing({ chatId: chat.id, messageId: undefined });
});

addReducer('cancelSendingMessage', (global, actions, payload) => {
  const { chatId, messageId } = payload!;
  const message = selectChatMessage(global, chatId, messageId);
  const progressCallback = message && uploadProgressCallbacks[message.previousLocalId || message.id];
  if (progressCallback) {
    cancelApiProgress(progressCallback);
  }

  actions.apiUpdate({
    '@type': 'deleteMessages',
    ids: [messageId],
    chatId,
  });
});

addReducer('pinMessage', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  if (!chat) {
    return;
  }

  const { messageId } = payload!;

  void callApi('pinMessage', { chat, messageId });
});

addReducer('deleteMessages', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  if (!chat) {
    return;
  }

  const { messageIds, shouldDeleteForAll } = payload!;

  void callApi('deleteMessages', { chat, messageIds, shouldDeleteForAll });
  if (messageIds.includes(global.chats.editingById[chat.id])) {
    actions.setChatEditing({ chatId: chat.id, messageId: undefined });
  }
});

addReducer('deleteHistory', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  if (!chat) {
    return;
  }

  const { maxId, shouldDeleteForAll } = payload!;

  void callApi('deleteHistory', { chat, shouldDeleteForAll, maxId });
});

addReducer('markMessagesRead', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  if (!chat) {
    return;
  }

  const { messageIds } = payload!;

  void callApi('markMessagesRead', { chat, messageIds });
});

addReducer('loadWebPagePreview', (global, actions, payload) => {
  const { text } = payload!;
  void loadWebPagePreview(text);
});

addReducer('clearWebPagePreview', (global) => {
  if (!global.webPagePreview) {
    return undefined;
  }

  return {
    ...global,
    webPagePreview: undefined,
  };
});

addReducer('sendPollVote', (global, actions, payload) => {
  const { chatId, messageId, options } = payload!;
  const chat = selectChat(global, chatId);

  if (chat) {
    void callApi('sendPollVote', { chat, messageId, options });
  }
});

addReducer('forwardMessages', (global) => {
  const { currentUserId } = global;
  const { fromChatId, messageIds, toChatIds } = global.forwardMessages;
  const fromChat = fromChatId ? selectChat(global, fromChatId) : undefined;
  const toChats = toChatIds && toChatIds.map((id) => selectChat(global, id)).filter<ApiChat>(Boolean as any);
  const messages = fromChatId && messageIds
    ? messageIds.map((id) => selectChatMessage(global, fromChatId, id)).filter<ApiMessage>(Boolean as any)
    : undefined;

  if (currentUserId && fromChat && toChats && toChats.length && messages && messages.length) {
    void forwardMessages(fromChat, toChats, messages, currentUserId);
  }
});

async function loadWebPagePreview(message: string) {
  const webPagePreview = await callApi('fetchWebPagePreview', { message });
  setGlobal({
    ...getGlobal(),
    webPagePreview,
  });
}

async function loadViewportMessages(
  chat: ApiChat,
  offsetId: number | undefined,
  direction: LoadMoreDirection,
  limit = MESSAGE_LIST_SLICE,
  isOutlying = false,
) {
  const chatId = chat.id;

  let addOffset: number | undefined;
  switch (direction) {
    case LoadMoreDirection.Backwards:
      addOffset = undefined;
      break;
    case LoadMoreDirection.Around:
      addOffset = -(Math.round(limit / 2) + 1);
      break;
    case LoadMoreDirection.Forwards:
      addOffset = -(limit + 1);
      break;
  }

  const result = await callApi('fetchMessages', {
    chat, offsetId, addOffset, limit,
  });

  if (!result) {
    return;
  }

  const { messages, users } = result;

  const byId = buildCollectionByKey(messages, 'id');
  const ids = Object.keys(byId).map(Number);

  let newGlobal = getGlobal();

  newGlobal = addChatMessagesById(newGlobal, chatId, byId);
  newGlobal = isOutlying ? updateOutlyingIds(newGlobal, chatId, ids) : updateListedIds(newGlobal, chatId, ids);
  newGlobal = addUsers(newGlobal, buildCollectionByKey(users, 'id'));

  let listedIds = selectListedIds(newGlobal, chatId);
  const outlyingIds = selectOutlyingIds(newGlobal, chatId);

  if (isOutlying && listedIds && outlyingIds) {
    if (areSortedArraysIntersecting(listedIds, outlyingIds)) {
      newGlobal = updateListedIds(newGlobal, chatId, outlyingIds);
      listedIds = selectListedIds(newGlobal, chatId);
      newGlobal = replaceOutlyingIds(newGlobal, chatId, undefined);
      isOutlying = false;
    }
  }

  const historyIds = isOutlying ? outlyingIds! : listedIds!;
  const { newViewportIds } = getViewportSlice(historyIds, offsetId, direction);
  newGlobal = safeReplaceViewportIds(newGlobal, chatId, newViewportIds!);

  setGlobal(newGlobal);
}

async function loadMessage(chat: ApiChat, messageId: number) {
  const result = await callApi('fetchMessage', { chat, messageId });

  if (!result) {
    return;
  }

  let newGlobal = getGlobal();
  newGlobal = updateChatMessage(newGlobal, chat.id, messageId, result.message);
  newGlobal = addUsers(newGlobal, buildCollectionByKey(result.users, 'id'));
  setGlobal(newGlobal);
}

function findClosestIndex(sourceIds: number[], offsetId: number) {
  return sourceIds.findIndex((id, i) => (
    id === offsetId
    || (id < offsetId && sourceIds[i + 1] > offsetId)
  ));
}

function getViewportSlice(
  sourceIds: number[],
  offsetId: number | undefined,
  direction: LoadMoreDirection,
) {
  const { length } = sourceIds;
  const index = offsetId ? findClosestIndex(sourceIds, offsetId) : -1;
  const isBackwards = direction === LoadMoreDirection.Backwards;
  const indexForDirection = isBackwards ? index : (index + 1) || length;
  const from = indexForDirection - MESSAGE_LIST_SLICE;
  const to = indexForDirection + MESSAGE_LIST_SLICE - 1;
  const newViewportIds = sourceIds.slice(Math.max(0, from), to + 1);

  let areSomeLocal;
  let areAllLocal;
  switch (direction) {
    case LoadMoreDirection.Backwards:
      areSomeLocal = indexForDirection > 0;
      areAllLocal = from >= 0;
      break;
    case LoadMoreDirection.Forwards:
      areSomeLocal = indexForDirection < length;
      areAllLocal = to <= length - 1;
      break;
    case LoadMoreDirection.Around:
    default:
      areSomeLocal = newViewportIds.length > 0;
      areAllLocal = newViewportIds.length === MESSAGE_LIST_SLICE * 2;
      break;
  }

  return { newViewportIds, areSomeLocal, areAllLocal };
}

async function forwardMessages(
  fromChat: ApiChat,
  toChats: ApiChat[],
  messages: ApiMessage[],
  currentUserId: number,
) {
  const global = getGlobal();
  setGlobal({
    ...global,
    forwardMessages: {
      ...global.forwardMessages,
      inProgress: true,
    },
  });
  const isAnySucceeded = await callApi('forwardMessages', {
    fromChat,
    toChats,
    messages,
    currentUserId,
  });

  if (isAnySucceeded) {
    setGlobal({
      ...getGlobal(),
      forwardMessages: {},
    });
  }
}
