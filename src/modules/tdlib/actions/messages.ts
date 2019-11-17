import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiMessage } from '../../../api/tdlib/types';
import * as TdLib from '../../../api/tdlib';
import { buildCollectionById } from '../../../util/iteratees';

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

  const messagesById = buildCollectionById(messages);

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
  const result = await TdLib.send({
    '@type': 'getChatHistory',
    chat_id: chatId,
    from_message_id: fromMessageId,
    offset: 0,
    limit: MESSAGE_SLICE_LIMIT,
  }) as {
    messages: ApiMessage[];
  };

  if (!result) {
    return null;
  }

  return result.messages;
}

async function sendTextMessage(chatId: number, text: string) {
  await TdLib.send({
    '@type': 'sendMessage',
    chat_id: chatId,
    input_message_content: {
      '@type': 'inputMessageText',
      text: {
        '@type': 'formattedText',
        text,
        entities: [],
      },
      disable_web_page_preview: false,
      clear_draft: true,
    },
  });
}
