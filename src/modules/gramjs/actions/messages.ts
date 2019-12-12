import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';
import { ApiMessage } from '../../../api/types';

import { callSdk } from '../../../api/gramjs';
import { buildCollectionByKey } from '../../../util/iteratees';

const MESSAGE_SLICE_LIMIT = 50;

addReducer('loadChatMessages', (global, actions, payload) => {
  const { chatId } = payload!;

  void loadChatMessages(chatId);
});

addReducer('loadMoreChatMessages', (global, actions, payload) => {
  const { chatId } = payload!;

  const byChatId = global.messages.byChatId[chatId];
  const chatMessageIds = byChatId ? Object.keys(byChatId.byId || {}) : null;
  const lowestMessageId = chatMessageIds && chatMessageIds.length && Math.min(...chatMessageIds.map(Number));

  void loadChatMessages(chatId, lowestMessageId || undefined);
});

addReducer('sendTextMessage', (global, actions, payload) => {
  const { chatId, text } = payload!;

  void sendTextMessage(chatId, text);
});

async function loadChatMessages(chatId: number, fromMessageId = 0) {
  let messages = await loadChatMessagesPart(chatId, fromMessageId);

  if (!messages) {
    return;
  }

  let wasLatestEmpty = !messages.length;

  while (messages.length < MESSAGE_SLICE_LIMIT && !wasLatestEmpty) {
    const nextPart: ApiMessage[] | null = await loadChatMessagesPart(chatId, messages[messages.length - 1].id);

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
        [chatId]: {
          byId: {
            ...(global.messages.byChatId[chatId] || {}).byId,
            ...messagesById,
          },
        },
      },
    },
  });
}

async function loadChatMessagesPart(chatId: number, fromMessageId = 0) {
  const result = await callSdk('fetchMessages', {
    chatId,
    fromMessageId,
    limit: MESSAGE_SLICE_LIMIT,
  });

  if (!result) {
    return null;
  }

  return result.messages;
}

function sendTextMessage(chatId: number, text: string) {
  void callSdk('sendMessage', { chatId, text });
}
