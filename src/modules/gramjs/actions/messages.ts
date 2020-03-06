import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import { MESSAGE_SLICE_LIMIT } from '../../../config';
import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
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
    if (!offsetId) {
      return undefined;
    }

    const isOutlying = listedIds && !listedIds.includes(offsetId);
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
      const loadLimit = isOutlying ? MESSAGE_SLICE_LIMIT : MESSAGE_SLICE_LIMIT * 2;
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

async function loadWebPagePreview(message: string) {
  const webPagePreview = await callApi('fetchWebPagePreview', { message });
  setGlobal({
    ...getGlobal(),
    webPagePreview,
  });
}

async function loadViewportMessages(
  chat: ApiChat,
  offsetId: number,
  direction: LoadMoreDirection,
  limit = MESSAGE_SLICE_LIMIT,
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

  const historyIds = isOutlying ? selectOutlyingIds(newGlobal, chatId)! : selectListedIds(newGlobal, chatId)!;
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
  offsetId: number,
  direction: LoadMoreDirection,
  forceMax = false,
) {
  const { length } = sourceIds;
  const index = sourceIds.indexOf(offsetId);
  const isForwards = direction === LoadMoreDirection.Forwards;
  const indexForDirection = isForwards ? index + 1 : index;
  const from = indexForDirection - MESSAGE_SLICE_LIMIT;
  const to = indexForDirection + MESSAGE_SLICE_LIMIT;
  const newViewportIds = sourceIds.slice(Math.max(0, from), to);
  const areSomeLocal = (isForwards && indexForDirection < length) || (!isForwards && indexForDirection > 0);
  const areAllLocal = (isForwards && to <= length) || (!isForwards && from >= 0);

  if (!areAllLocal && forceMax) {
    return {
      newViewportIds: indexForDirection <= (length / 2 - 1)
        ? sourceIds.slice(0, MESSAGE_SLICE_LIMIT * 2)
        : sourceIds.slice(Math.max(0, length - MESSAGE_SLICE_LIMIT * 2), length),
    };
  }

  return { newViewportIds, areSomeLocal, areAllLocal };
}
