import { GlobalState } from '../../store/types';
import { ApiMessage } from '../../api/types';
import { selectChatMessages } from '../selectors';

export function replaceChatMessages(global: GlobalState, chatId: number, newById: Record<number, ApiMessage>) {
  return {
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chatId]: {
          byId: newById,
        },
      },
    },
  };
}

// This is a shallow version of a full update reducer.
export function replaceChatMessagesById(global: GlobalState, chatId: number, newById: Record<number, ApiMessage>) {
  const byId = selectChatMessages(global, chatId) || {};

  return replaceChatMessages(global, chatId, {
    ...byId,
    ...newById,
  });
}

export function updateChatMessage(
  global: GlobalState, chatId: number, messageId: number, messageUpdate: Partial<ApiMessage>,
) {
  const byId = selectChatMessages(global, chatId) || {};
  const message = byId[messageId];
  const updatedMessage = {
    ...message,
    ...messageUpdate,
  };

  if (!updatedMessage.id) {
    return global;
  }

  return replaceChatMessages(global, chatId, {
    ...byId,
    [messageId]: updatedMessage,
  });
}

export function deleteChatMessages(
  global: GlobalState,
  chatId: number,
  messageIds: number[],
) {
  const byId = selectChatMessages(global, chatId) || {};
  const newById = { ...byId };

  messageIds.forEach((messageId) => {
    delete newById[messageId];
  });

  return replaceChatMessages(global, chatId, newById);
}
