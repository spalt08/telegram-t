import { GlobalState } from '../../global/types';
import { ApiMessage } from '../../api/types';
import { selectChatMessageListedIds, selectChatMessages, selectChatMessageViewportIds } from '../selectors';

type MessageStoreSections = {
  byId: Record<number, ApiMessage>;
  listedIds?: number[];
  viewportIds?: number[];
  focusedMessageId?: number;
};

function replaceStoreSection(global: GlobalState, chatId: number, update: Partial<MessageStoreSections>): GlobalState {
  return {
    ...global,
    messages: {
      ...global.messages,
      byChatId: {
        ...global.messages.byChatId,
        [chatId]: {
          ...global.messages.byChatId[chatId],
          ...update,
        },
      },
    },
  };
}

function replaceChatMessages(global: GlobalState, chatId: number, newById: Record<number, ApiMessage>): GlobalState {
  return replaceStoreSection(global, chatId, {
    byId: newById,
  });
}

function replaceChatMessageListedIds(
  global: GlobalState, chatId: number, newListedIds: number[] | undefined,
): GlobalState {
  return replaceStoreSection(global, chatId, {
    listedIds: newListedIds,
  });
}

export function replaceChatMessageViewportIds(
  global: GlobalState, chatId: number, newViewportIds: number[] | undefined,
): GlobalState {
  return replaceStoreSection(global, chatId, {
    viewportIds: newViewportIds,
  });
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

export function addChatMessagesById(
  global: GlobalState, chatId: number, newById: Record<number, ApiMessage>,
): GlobalState {
  const byId = selectChatMessages(global, chatId);

  if (byId && Object.keys(newById).every((newId) => Boolean(byId[Number(newId)]))) {
    return global;
  }

  return replaceChatMessages(global, chatId, {
    ...newById,
    ...byId,
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
  const newById = { ...byId };

  let listedIds = selectChatMessageListedIds(global, chatId);
  let viewportIds = selectChatMessageViewportIds(global, chatId);

  messageIds.forEach((messageId) => {
    delete newById[messageId];

    if (listedIds) {
      const index = listedIds.indexOf(messageId);
      if (index !== -1) {
        listedIds = Array.prototype.concat(listedIds.slice(0, index), listedIds.slice(index + 1));
      }
    }

    if (viewportIds) {
      const index = viewportIds.indexOf(messageId);
      if (index !== -1) {
        viewportIds = Array.prototype.concat(viewportIds.slice(0, index), viewportIds.slice(index + 1));
      }
    }
  });

  let newGlobal = global;

  newGlobal = replaceChatMessages(newGlobal, chatId, newById);
  newGlobal = replaceChatMessageListedIds(newGlobal, chatId, listedIds);
  newGlobal = replaceChatMessageViewportIds(newGlobal, chatId, viewportIds);

  return newGlobal;
}

export function updateChatMessageListedIds(
  global: GlobalState,
  chatId: number,
  idsUpdate: number[],
): GlobalState {
  const listedIds = selectChatMessageListedIds(global, chatId) || [];
  const newIds = listedIds.length ? idsUpdate.filter((id) => !listedIds.includes(id)) : idsUpdate;

  if (!newIds.length) {
    return global;
  }

  return replaceChatMessageListedIds(global, chatId, orderListedIds([
    ...listedIds,
    ...newIds,
  ]));
}

// Expected result: `[1, 2, ..., n, -1, -2, ..., -n]`
function orderListedIds(listedIds: number[]) {
  return listedIds.sort((a, b) => (a > 0 && b > 0 ? a - b : b - a));
}

export function updateChatMessageViewportIds(
  global: GlobalState,
  chatId: number,
  idsUpdate: number[],
): GlobalState {
  const viewportIds = selectChatMessageViewportIds(global, chatId) || [];
  const newIds = viewportIds.length ? idsUpdate.filter((id) => !viewportIds.includes(id)) : idsUpdate;

  if (!newIds.length) {
    return global;
  }

  return replaceChatMessageViewportIds(global, chatId, [
    ...viewportIds,
    ...newIds,
  ]);
}

export function updateFocusedMessageId(global: GlobalState, chatId: number, focusedMessageId?: number) {
  return replaceStoreSection(global, chatId, {
    focusedMessageId,
  });
}
