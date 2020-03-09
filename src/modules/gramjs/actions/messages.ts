import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import { MESSAGE_LIST_SLICE } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { areSortedArraysIntersecting, buildCollectionByKey } from '../../../util/iteratees';
import {
  addUsers,
  replaceChatMessagesById,
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
  selectLastReadOrVeryLastId,
} from '../../selectors';

addReducer('loadViewportMessages', (global, actions, payload) => {
  const {
    direction,
    shouldRelocate = false,
  } = payload || {};
  const chat = selectOpenChat(global);

  if (!chat) {
    return undefined;
  }

  const chatId = chat.id;
  const viewportIds = selectViewportIds(global, chatId);
  const listedIds = selectListedIds(global, chatId);
  const outlyingIds = selectOutlyingIds(global, chatId);

  let newGlobal = global;

  if (!viewportIds || !viewportIds.length || shouldRelocate) {
    const offsetId = selectFocusedMessageId(newGlobal, chatId) || selectLastReadOrVeryLastId(newGlobal, chatId);
    const isOutlying = Boolean(offsetId && listedIds && !listedIds.includes(offsetId));
    const historyIds = (isOutlying ? outlyingIds : listedIds) || [];

    if (!isOutlying && outlyingIds) {
      newGlobal = replaceOutlyingIds(global, chatId, undefined);
    }

    const {
      newViewportIds, areSomeLocal, areAllLocal,
    } = getViewportSlice(historyIds, offsetId, LoadMoreDirection.Around);

    if (areSomeLocal) {
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

  void loadMessage(chat, messageId);
});

addReducer('sendMessage', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  const { currentUserId } = global;

  if (!chat || !currentUserId) {
    return;
  }

  const {
    text, entities, attachment, sticker, gif, pollSummary,
  } = payload!;
  const replyingTo = global.chats.replyingToById[chat.id];

  void callApi('sendMessage', {
    chat, currentUserId, text, entities, replyingTo, attachment, sticker, gif, pollSummary,
  });

  actions.setChatReplyingTo({ chatId: chat.id, messageId: undefined });
});

addReducer('cancelSendingMessage', () => {
  // const { chatId, messageId } = payload!;
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
});

addReducer('markMessagesRead', (global, actions, payload) => {
  const chat = selectOpenChat(global);
  if (!chat) {
    return;
  }

  const { maxId } = payload || {};

  void callApi('markMessagesRead', { chat, maxId });
});

addReducer('readMessageContents', (global, actions, payload) => {
  const { messageId } = payload!;

  void callApi('readMessageContents', { messageId });
});

addReducer('loadWebPagePreview', (global, actions, payload) => {
  const { text } = payload!;
  void loadWebPagePreview(text);
});

addReducer('clearWebPagePreview', (global) => {
  setGlobal({
    ...global,
    webPagePreview: undefined,
  });
});

addReducer('sendPollVote', (global, actions, payload) => {
  const { chatId, messageId, options } = payload!;
  const chat = selectChat(global, chatId);
  if (chat) {
    void callApi('sendPollVote', { chat, messageId, options });
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

  newGlobal = replaceChatMessagesById(newGlobal, chatId, byId);
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
  const { newViewportIds } = getViewportSlice(historyIds, offsetId, direction, true);
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

function getViewportSlice(
  sourceIds: number[],
  offsetId: number | undefined,
  direction: LoadMoreDirection,
  forceMax = false,
) {
  const { length } = sourceIds;
  const index = offsetId ? sourceIds.indexOf(offsetId) : -1;
  const isForwards = direction === LoadMoreDirection.Forwards;
  const indexForDirection = isForwards ? (index + 1) || length : index;
  const from = indexForDirection - MESSAGE_LIST_SLICE;
  const to = indexForDirection + MESSAGE_LIST_SLICE;
  const newViewportIds = sourceIds.slice(Math.max(0, from), to);
  const areSomeLocal = (isForwards && indexForDirection < length) || (!isForwards && indexForDirection > 0);
  const areAllLocal = (isForwards && to <= length) || (!isForwards && from >= 0);

  if (!areAllLocal && forceMax) {
    return {
      newViewportIds: isForwards
        ? sourceIds.slice(Math.max(0, length - MESSAGE_LIST_SLICE * 2), length)
        : sourceIds.slice(0, MESSAGE_LIST_SLICE * 2),
    };
  }

  return { newViewportIds, areSomeLocal, areAllLocal };
}
