import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate, ApiMessage } from '../../../api/types';
import { GlobalState } from '../../../store/types';

export function onUpdate(update: ApiUpdate) {
  switch (update['@type']) {
    case 'updateMessage': {
      const { chat_id, id, message } = update;

      updateMessage(chat_id, id, message);

      break;
    }

    case 'updateMessageSendSucceeded': {
      const { chat_id, old_message_id, message } = update;

      replaceMessage(chat_id, old_message_id, message);

      break;
    }

    // TODO @not-implemented.
    case 'updateMessageSendFailed': {
      const { chat_id, old_message_id, sending_state } = update;

      updateMessage(chat_id, old_message_id, { sending_state });

      break;
    }
  }
}

function updateMessage(chatId: number, messageId: number, messageUpdate: Partial<ApiMessage>) {
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
            [messageId]: {
              ...((global.messages.byChatId[chatId] || {}).byId || {})[messageId],
              ...messageUpdate,
            },
          },
        },
      },
    },
  });
}

function replaceMessage(chatId: number, oldMessageId: number, message: Pick<ApiMessage, 'id'> & Partial<ApiMessage>) {
  const global = getGlobal();

  const currentMessage = global.messages.byChatId[chatId].byId[oldMessageId];
  if (!currentMessage) {
    throw new Error('Local message not found');
  }

  const newGlobal: GlobalState = {
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chatId]: {
          byId: {
            ...(global.messages.byChatId[chatId] || {}).byId,
            [message.id]: {
              ...currentMessage,
              ...message,
            },
          },
        },
      },
    },
  };

  delete newGlobal.messages.byChatId[chatId].byId[oldMessageId];

  setGlobal(newGlobal);
}
