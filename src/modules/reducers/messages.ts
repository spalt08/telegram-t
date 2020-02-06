import { GlobalState } from '../../store/types';
import { ApiMessage } from '../../api/types';
import { selectChatMessageListedIds, selectChatMessages } from '../selectors';

function replaceChatMessages(global: GlobalState, chatId: number, newById: Record<number, ApiMessage>): GlobalState {
  return {
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chatId]: {
          ...global.messages.byChatId[chatId],
          byId: newById,
        },
      },
    },
  };
}

function replaceChatMessageListedIds(
  global: GlobalState, chatId: number, newListedIds: number[] | undefined,
): GlobalState {
  return {
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chatId]: {
          ...global.messages.byChatId[chatId],
          listedIds: newListedIds,
        },
      },
    },
  };
}

export function replaceChatMessagesById(
  global: GlobalState, chatId: number, updatedById: Record<number, ApiMessage>,
): GlobalState {
  const byId = selectChatMessages(global, chatId);

  return replaceChatMessages(global, chatId, {
    ...byId,
    ...updatedById,
  });
}

export function updateChatMessage(
  global: GlobalState, chatId: number, messageId: number, messageUpdate: Partial<ApiMessage>,
): GlobalState {
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
): GlobalState {
  const byId = selectChatMessages(global, chatId) || {};
  let listedIds = selectChatMessageListedIds(global, chatId);
  const newById = { ...byId };

  messageIds.forEach((messageId) => {
    delete newById[messageId];

    if (listedIds) {
      const index = listedIds.indexOf(messageId);
      if (index !== -1) {
        listedIds = Array.prototype.concat(listedIds.slice(0, index), listedIds.slice(index + 1));
      }
    }
  });

  let newGlobal = global;

  newGlobal = replaceChatMessages(newGlobal, chatId, newById);
  newGlobal = replaceChatMessageListedIds(newGlobal, chatId, listedIds);

  return newGlobal;
}

export function updateChatMessageListedIds(global: GlobalState, chatId: number, idsUpdate: number[]): GlobalState {
  const listedIds = selectChatMessageListedIds(global, chatId) || [];
  const newIds = listedIds.length ? idsUpdate.filter((id) => !listedIds.includes(id)) : idsUpdate;

  if (!newIds.length) {
    return global;
  }

  return replaceChatMessageListedIds(global, chatId, [
    ...listedIds,
    ...newIds,
  ]);
}
