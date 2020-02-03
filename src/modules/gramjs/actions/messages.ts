import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';
import { ApiChat } from '../../../api/types';

import { callApi } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import { updateMessages } from '../../common/messages';
import { updateUsers } from '../../common/users';
import { selectChat, selectChatMessages, selectOpenChat } from '../../selectors';

const MESSAGE_SLICE_LIMIT = 50;

addReducer('loadMessages', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = selectChat(global, chatId);
  if (!chat) {
    return;
  }

  const messages = selectChatMessages(global, chatId);
  const chatMessageIds = messages ? Object.keys(messages) : [];
  const lowestMessageId = chatMessageIds.length ? Math.min(...chatMessageIds.map(Number)) : undefined;

  void loadMessages(chat, lowestMessageId);
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

async function loadMessages(chat: ApiChat, fromMessageId = 0) {
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

  let global = getGlobal();
  global = updateMessages(global, chat.id, buildCollectionByKey(messages, 'id'));
  global = updateUsers(global, buildCollectionByKey(users, 'id'));
  setGlobal(global);
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
