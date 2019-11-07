import { addReducer, getGlobal, setGlobal } from '../../lib/teactn';

import * as TdLib from '../../api/tdlib';
import { TdLibUpdate } from '../../api/tdlib/updates';

const MESSAGE_SLICE_LIMIT = 20;

addReducer('loadChatMessages', (global, actions, payload) => {
  const { chatId, fromMessageId } = payload!;

  void loadChatMessages(chatId, fromMessageId);
});

export function onUpdate(update: TdLibUpdate) {
}

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
      ]
    }
  }

  const global = getGlobal();

  setGlobal({
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chatId]: [
          ...(global.messages.byChatId[chatId] || []),
          ...messages,
        ],
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
    messages: Record<string, any>[];
  };

  if (!result) {
    return;
  }

  return result.messages;
}
