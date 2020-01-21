import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';
import { ApiChat } from '../../../api/types';

import { callSdk } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';
import { updateMessages } from '../../common/messages';
import { updateUsers } from '../../common/users';

const MESSAGE_SLICE_LIMIT = 50;

addReducer('loadChatMessages', (global, actions, payload) => {
  const { chatId } = payload!;
  const chat = global.chats.byId[chatId];

  void loadChatMessages(chat);
});

addReducer('loadMoreChatMessages', (global, actions, payload) => {
  const { chatId } = payload!;

  const chat = global.chats.byId[chatId];
  const byChatId = global.messages.byChatId[chatId];
  const chatMessageIds = byChatId ? Object.keys(byChatId.byId || {}) : null;
  const lowestMessageId = chatMessageIds && chatMessageIds.length && Math.min(...chatMessageIds.map(Number));

  void loadChatMessages(chat, lowestMessageId || undefined);
});

addReducer('sendTextMessage', (global, actions, payload) => {
  const { chatId, text } = payload!;
  const chat = global.chats.byId[chatId];
  const replyingTo = global.chats.replyingToById[chatId];

  void sendTextMessage(chat, text, replyingTo);
});

addReducer('pinMessage', (global, actions, payload) => {
  const { chatId, messageId } = payload!;
  const chat = global.chats.byId[chatId];

  void pinMessage(chat, messageId);
});

addReducer('deleteMessages', (global, actions, payload) => {
  const { chatId, messageIds, shouldDeleteForAll } = payload!;
  const chat = global.chats.byId[chatId];

  void deleteMessages(chat, messageIds, shouldDeleteForAll);
});

async function loadChatMessages(chat: ApiChat, fromMessageId = 0) {
  const result = await loadChatMessagesPart(chat, fromMessageId);

  if (!result) {
    return;
  }

  let { messages, users } = result;

  let wasLatestEmpty = !messages.length;

  while (messages.length < MESSAGE_SLICE_LIMIT && !wasLatestEmpty) {
    const nextPart = await loadChatMessagesPart(chat, messages[messages.length - 1].id);

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

async function loadChatMessagesPart(chat: ApiChat, fromMessageId = 0) {
  const result = await callSdk('fetchMessages', {
    chat,
    fromMessageId,
    limit: MESSAGE_SLICE_LIMIT,
  });

  if (!result) {
    return null;
  }

  return result;
}

function sendTextMessage(chat: ApiChat, text: string, replyingTo?: number) {
  void callSdk('sendMessage', { chat, text, replyingTo });
}

function pinMessage(chat: ApiChat, messageId: number) {
  void callSdk('pinMessage', { chat, messageId });
}

function deleteMessages(chat: ApiChat, messageIds: number[], shouldDeleteForAll?: boolean) {
  void callSdk('deleteMessages', { chat, messageIds, shouldDeleteForAll });
}
