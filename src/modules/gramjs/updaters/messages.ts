import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiUpdate, ApiMessage } from '../../../api/types';

export function onUpdate(update: ApiUpdate) {
  switch (update['@type']) {
    case 'updateNewMessage': {
      const { message } = update;

      updateMessage(update.chat_id, message.id, message);

      break;
    }

    // TODO
    // case 'updateMessageSendSucceeded': {
    //   const { message, old_message_id } = update;
    //
    //   replaceMessage(update.chat_id, old_message_id, message);
    //
    //   break;
    // }

    // case 'updateMessageSendFailed': {
    //   const { message, old_message_id } = update;
    //
    //   updateMessage(message.chat_id, old_message_id, message);
    //
    //   break;
    // }
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
