import { GlobalState } from '../../store/types';
import { ApiMessage } from '../../api/types';

export function updateMessages(global: GlobalState, chatId: number, messagesById: Record<number, ApiMessage>) {
  return {
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
  };
}

export function updateMessage(
  global: GlobalState,
  chatId: number,
  messageId: number,
  messageUpdate: Partial<ApiMessage>,
) {
  return updateMessages(global, chatId, {
    [messageId]: {
      ...((global.messages.byChatId[chatId] || {}).byId || {})[messageId],
      ...messageUpdate,
    },
  });
}

export function deleteMessages(
  global: GlobalState,
  chatId: number,
  messageIds: number[],
) {
  const newGlobal = updateMessages(global, chatId, {});

  messageIds.forEach((messageId) => {
    delete newGlobal.messages.byChatId[chatId].byId[messageId];
  });

  return newGlobal;
}
