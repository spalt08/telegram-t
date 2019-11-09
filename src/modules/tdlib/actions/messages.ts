import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiMessage } from '../types/messages';
import * as TdLib from '../../../api/tdlib';
import buildCollectionById from '../../../util/buildCollectionById';

const MESSAGE_SLICE_LIMIT = 20;

addReducer('loadChatMessages', (global, actions, payload) => {
  const { chatId, fromMessageId } = payload!;

  void loadChatMessages(chatId, fromMessageId);
});

addReducer('sendTextMessage', (global, actions, payload) => {
  const { chatId, text, fromMessageId } = payload!;

  void sendTextMessage(chatId, text, fromMessageId);
});

async function loadChatMessages(chatId: number, fromMessageId = 0) {
  let messages = await loadChatMessagesPart(chatId, fromMessageId);

  if (!messages) {
    return;
  }

  // Request without `fromMessageId` always returns only last message.
  if (!fromMessageId && messages.length) {
    const messages2 = await loadChatMessagesPart(chatId, messages[0].id);

    if (messages2) {
      messages = [
        ...messages,
        ...messages2,
      ];
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
    return;
  }

  return result.messages;
}

async function sendTextMessage(chatId: number, text: string, replyToMessageId?: number) {
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
    reply_to_message_id: replyToMessageId,
  });
}
