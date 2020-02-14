import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiChat } from '../../../api/types';
import { GlobalState } from '../../../global/types';

import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  updateChatMessageListedIds,
  replaceChatMessagesById,
  updateChatMessage,
  updateUsers,
  replaceChatMessageViewportIds,
} from '../../reducers';
import {
  selectChat, selectChatMessageListedIds, selectChatMessageViewportIds, selectOpenChat,
} from '../../selectors';

const MESSAGE_SLICE_LIMIT = 50;

addReducer('loadMessagesForList', (global, actions, payload) => {
  const { direction } = payload || {};
  const chat = selectOpenChat(global);
  if (!chat) {
    return undefined;
  }

  if (direction) {
    const { newViewportIds, anchorId } = getUpdatedViewportIds(global, chat.id, direction);
    if (newViewportIds) {
      return replaceChatMessageViewportIds(global, chat.id, newViewportIds);
    } else if (anchorId) {
      void loadMessagesForList(chat, anchorId, direction);
    }
  } else {
    void loadMessagesForList(chat);
  }

  return undefined;
});

function getUpdatedViewportIds(global: GlobalState, chatId: number, direction?: 1 | -1, force = false) {
  const listedIds = selectChatMessageListedIds(global, chatId);
  const viewportIds = selectChatMessageViewportIds(global, chatId);

  if (!listedIds) {
    return {};
  }

  if (!viewportIds) {
    return { newViewportIds: listedIds };
  }

  const anchorId = direction === -1 ? viewportIds[0] : viewportIds[viewportIds.length - 1];
  const indexInListed = listedIds.indexOf(anchorId);
  const newViewportIds = listedIds.slice(
    Math.max((direction === 1 ? indexInListed + 1 : indexInListed) - MESSAGE_SLICE_LIMIT, 0),
    (direction === 1 ? indexInListed + 1 : indexInListed) + MESSAGE_SLICE_LIMIT,
  );

  if (force || newViewportIds.length === MESSAGE_SLICE_LIMIT * 2) {
    if (
      viewportIds[0] === newViewportIds[0]
      && viewportIds[viewportIds.length - 1] === newViewportIds[newViewportIds.length - 1]
    ) {
      return { newViewportIds: viewportIds };
    }
    return { newViewportIds };
  } else {
    return { anchorId };
  }
}

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

  const { text, attachment, sticker } = payload!;
  const replyingTo = global.chats.replyingToById[chat.id];

  void callApi('sendMessage', {
    chat, currentUserId, text, replyingTo, attachment, sticker,
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

async function loadMessagesForList(chat: ApiChat, offsetId?: number, direction ?: 1 | -1) {
  const result = await callApi('fetchMessages', {
    chat,
    offsetId,
    limit: MESSAGE_SLICE_LIMIT,
    ...(direction === 1 && { addOffset: -MESSAGE_SLICE_LIMIT }),
  });

  if (!result) {
    return;
  }

  const { messages, users } = result;

  const byId = buildCollectionByKey(messages, 'id');
  const ids = Object.keys(byId).map(Number);

  let newGlobal = getGlobal();
  newGlobal = replaceChatMessagesById(newGlobal, chat.id, byId);
  newGlobal = updateChatMessageListedIds(newGlobal, chat.id, ids);
  newGlobal = updateUsers(newGlobal, buildCollectionByKey(users, 'id'));

  const { newViewportIds } = getUpdatedViewportIds(newGlobal, chat.id, direction, true);
  newGlobal = replaceChatMessageViewportIds(newGlobal, chat.id, newViewportIds!);

  setGlobal(newGlobal);
}

async function loadMessage(chat: ApiChat, messageId: number) {
  const message = await callApi('fetchMessage', { chat, messageId });

  if (!message) {
    return;
  }

  setGlobal(updateChatMessage(getGlobal(), chat.id, messageId, message));
}
