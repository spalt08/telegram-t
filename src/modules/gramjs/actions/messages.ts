import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';
import { ApiChat } from '../../../api/types';

import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import {
  updateChatMessageListedIds, replaceChatMessagesById, updateChatMessage, updateUsers,
} from '../../reducers';
import { selectChat, selectChatMessageListedIds, selectOpenChat } from '../../selectors';

const MESSAGE_SLICE_LIMIT = 50;

addReducer('loadMessagesForList', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const listedIds = selectChatMessageListedIds(global, chatId);
  const lowestMessageId = listedIds && listedIds.length ? Math.min(...listedIds) : undefined;

  void loadMessagesForList(chat, lowestMessageId);
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

  const { text, attachment } = payload!;
  const replyingTo = global.chats.replyingToById[chat.id];

  void callApi('sendMessage', {
    chat, currentUserId, text, replyingTo, attachment,
  });
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

async function loadMessagesForList(chat: ApiChat, fromMessageId = 0) {
  const result = await loadMessagesPart(chat, fromMessageId);

  if (!result) {
    return;
  }

  let { messages, users } = result;

  let wasLatestEmpty = !messages.length;

  while (messages.length < MESSAGE_SLICE_LIMIT && !wasLatestEmpty) {
    const nextPart = await loadMessagesPart(chat, messages[messages.length - 1].id);

    if (nextPart && nextPart.messages.length) {
      messages = [
        ...messages,
        ...nextPart.messages,
      ];
      users = [
        ...users,
        ...nextPart.users,
      ];
    } else {
      wasLatestEmpty = true;
    }
  }

  const byId = buildCollectionByKey(messages, 'id');
  const ids = Object.keys(byId).map(Number);

  let newGlobal = getGlobal();
  newGlobal = replaceChatMessagesById(newGlobal, chat.id, byId);
  newGlobal = updateChatMessageListedIds(newGlobal, chat.id, ids);
  newGlobal = updateUsers(newGlobal, buildCollectionByKey(users, 'id'));
  setGlobal(newGlobal);
}

async function loadMessagesPart(chat: ApiChat, fromMessageId = 0) {
  const result = await callApi('fetchMessages', {
    chat,
    fromMessageId,
    limit: MESSAGE_SLICE_LIMIT,
  });

  if (!result) {
    return null;
  }

  return result;
}

async function loadMessage(chat: ApiChat, messageId: number) {
  const message = await callApi('fetchMessage', { chat, messageId });

  if (!message) {
    return;
  }

  setGlobal(updateChatMessage(getGlobal(), chat.id, messageId, message));
}
