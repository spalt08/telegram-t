import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat } from '../../../api/types';
import { LoadMoreDirection } from '../../../types';

import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  addUsers,
  replaceChatMessagesById,
  safeReplaceViewportIds,
  updateChatMessage,
  updateListedIds,
} from '../../reducers';
import {
  selectChat, selectListedIds, selectViewportIds, selectOpenChat,
} from '../../selectors';
import { MESSAGE_SLICE_LIMIT } from '../../../config';

addReducer('loadMessagesForList', (global, actions, payload) => {
  const { direction } = payload || {};
  const chat = selectOpenChat(global);

  if (!chat) {
    return undefined;
  }

  let newGlobal = global;

  const listedIds = selectListedIds(global, chat.id);
  const viewportIds = selectViewportIds(global, chat.id);

  if (!viewportIds) {
    void loadMessagesForList(chat, chat.last_read_inbox_message_id, LoadMoreDirection.Around, MESSAGE_SLICE_LIMIT * 2);
    return undefined;
  }

  if (direction === LoadMoreDirection.Backwards || direction === LoadMoreDirection.Both) {
    const offsetId = viewportIds[0];
    const {
      newViewportIds, areSomeLocal, areAllLocal,
    } = getViewportSlice(listedIds!, offsetId, LoadMoreDirection.Backwards);

    if (areSomeLocal) {
      newGlobal = safeReplaceViewportIds(newGlobal, chat.id, newViewportIds);
    }

    if (!areAllLocal) {
      void loadMessagesForList(chat, offsetId, LoadMoreDirection.Backwards);
    }
  }

  if (direction === LoadMoreDirection.Forwards || direction === LoadMoreDirection.Both) {
    const offsetId = viewportIds[viewportIds.length - 1];
    const {
      newViewportIds, areSomeLocal, areAllLocal,
    } = getViewportSlice(listedIds!, offsetId, LoadMoreDirection.Forwards);

    if (areSomeLocal) {
      newGlobal = safeReplaceViewportIds(newGlobal, chat.id, newViewportIds);
    }

    if (!areAllLocal) {
      void loadMessagesForList(chat, offsetId, LoadMoreDirection.Forwards);
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

async function loadMessagesForList(
  chat: ApiChat,
  offsetId: number,
  direction: LoadMoreDirection,
  limit = MESSAGE_SLICE_LIMIT,
) {
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

  newGlobal = replaceChatMessagesById(newGlobal, chat.id, byId);
  newGlobal = updateListedIds(newGlobal, chat.id, ids);
  newGlobal = addUsers(newGlobal, buildCollectionByKey(users, 'id'));

  const listedIds = selectListedIds(newGlobal, chat.id)!;
  const { newViewportIds } = getViewportSlice(listedIds, offsetId, direction, true);
  newGlobal = safeReplaceViewportIds(newGlobal, chat.id, newViewportIds!);

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

function getViewportSlice(sourceIds: number[], offsetId: number, direction: LoadMoreDirection, forceMax = false) {
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
      newViewportIds: index <= (length / 2 - 1)
        ? sourceIds.slice(0, MESSAGE_SLICE_LIMIT * 2)
        : sourceIds.slice(Math.max(0, length - MESSAGE_SLICE_LIMIT * 2), length),
    };
  }

  return { newViewportIds, areSomeLocal, areAllLocal };
}
