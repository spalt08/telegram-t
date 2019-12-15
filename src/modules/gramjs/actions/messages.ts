import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';
import { ApiChat, ApiMessage } from '../../../api/types';

import { callSdk } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';

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

  void sendTextMessage(chat, text);
});

async function loadChatMessages(chat: ApiChat, fromMessageId = 0) {
  let messages = await loadChatMessagesPart(chat, fromMessageId);

  if (!messages) {
    return;
  }

  let wasLatestEmpty = !messages.length;

  while (messages.length < MESSAGE_SLICE_LIMIT && !wasLatestEmpty) {
    const nextPart: ApiMessage[] | null = await loadChatMessagesPart(chat, messages[messages.length - 1].id);

    if (nextPart && nextPart.length) {
      messages = [
        ...messages,
        ...nextPart,
      ];
    } else {
      wasLatestEmpty = true;
    }
  }

  const messagesById = buildCollectionByKey(messages, 'id');

  const global = getGlobal();

  setGlobal({
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chat.id]: {
          byId: {
            ...(global.messages.byChatId[chat.id] || {}).byId,
            ...messagesById,
          },
        },
      },
    },
  });
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

  return result.messages;
}

function sendTextMessage(chat: ApiChat, text: string) {
  void callSdk('sendMessage', { chat, text });
}
