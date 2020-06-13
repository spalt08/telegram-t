import { GlobalState } from '../../global/types';
import { ApiMessage } from '../../api/types';
import { FocusDirection } from '../../types';

import {
  selectListedIds, selectChatMessages, selectViewportIds, selectOutlyingIds,
} from '../selectors';
import { areSortedArraysEqual } from '../../util/iteratees';
import { MESSAGE_LIST_VIEWPORT_LIMIT } from '../../config';

type MessageStoreSections = {
  byId: Record<number, ApiMessage>;
  listedIds?: number[];
  outlyingIds?: number[];
  viewportIds?: number[];
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

function replaceListedIds(
  global: GlobalState, chatId: number, newListedIds: number[] | undefined,
): GlobalState {
  return replaceStoreSection(global, chatId, {
    listedIds: newListedIds,
  });
}

export function replaceOutlyingIds(
  global: GlobalState, chatId: number, newOutlyingIds: number[] | undefined,
): GlobalState {
  return replaceStoreSection(global, chatId, {
    outlyingIds: newOutlyingIds,
  });
}

export function replaceViewportIds(
  global: GlobalState, chatId: number, newViewportIds: number[] | undefined,
): GlobalState {
  return replaceStoreSection(global, chatId, {
    viewportIds: newViewportIds,
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

  let listedIds = selectListedIds(global, chatId);
  let outlyingIds = selectOutlyingIds(global, chatId);
  let viewportIds = selectViewportIds(global, chatId);

  messageIds.forEach((messageId) => {
    delete newById[messageId];

    if (listedIds) {
      const index = listedIds.indexOf(messageId);
      if (index !== -1) {
        listedIds = Array.prototype.concat(listedIds.slice(0, index), listedIds.slice(index + 1));
      }
    }

    if (outlyingIds) {
      const index = outlyingIds.indexOf(messageId);
      if (index !== -1) {
        outlyingIds = Array.prototype.concat(outlyingIds.slice(0, index), outlyingIds.slice(index + 1));
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
  newGlobal = replaceListedIds(newGlobal, chatId, listedIds);
  newGlobal = replaceOutlyingIds(newGlobal, chatId, outlyingIds);
  newGlobal = replaceViewportIds(newGlobal, chatId, viewportIds);

  return newGlobal;
}

export function updateListedIds(
  global: GlobalState,
  chatId: number,
  idsUpdate: number[],
): GlobalState {
  const listedIds = selectListedIds(global, chatId);
  const newIds = listedIds && listedIds.length
    ? idsUpdate.filter((id) => !listedIds.includes(id))
    : idsUpdate;

  if (listedIds && !newIds.length) {
    return global;
  }

  return replaceListedIds(global, chatId, orderHistoryIds([
    ...(listedIds || []),
    ...newIds,
  ]));
}

export function updateOutlyingIds(
  global: GlobalState,
  chatId: number,
  idsUpdate: number[],
): GlobalState {
  const outlyingIds = selectOutlyingIds(global, chatId);
  const newIds = outlyingIds && outlyingIds.length
    ? idsUpdate.filter((id) => !outlyingIds.includes(id))
    : idsUpdate;

  if (outlyingIds && !newIds.length) {
    return global;
  }

  return replaceOutlyingIds(global, chatId, orderHistoryIds([
    ...(outlyingIds || []),
    ...newIds,
  ]));
}

function orderHistoryIds(listedIds: number[]) {
  return listedIds.sort((a, b) => a - b);
}

export function addViewportId(
  global: GlobalState,
  chatId: number,
  newId: number,
): GlobalState {
  const viewportIds = selectViewportIds(global, chatId) || [];
  if (viewportIds.includes(newId)) {
    return global;
  }

  const newIds = orderHistoryIds([...viewportIds, newId].slice(-MESSAGE_LIST_VIEWPORT_LIMIT));

  return replaceViewportIds(global, chatId, newIds);
}

export function safeReplaceViewportIds(
  global: GlobalState,
  chatId: number,
  newViewportIds: number[],
): GlobalState {
  const viewportIds = selectViewportIds(global, chatId) || [];

  if (areSortedArraysEqual(viewportIds, newViewportIds)) {
    return global;
  }

  return replaceViewportIds(global, chatId, newViewportIds);
}

export function updateFocusedMessage(
  global: GlobalState, chatId?: number, messageId?: number, noHighlight = false,
): GlobalState {
  return {
    ...global,
    focusedMessage: {
      ...global.focusedMessage,
      chatId,
      messageId,
      noHighlight,
    },
  };
}

export function updateFocusDirection(
  global: GlobalState, direction?: FocusDirection,
): GlobalState {
  return {
    ...global,
    focusedMessage: {
      ...global.focusedMessage,
      direction,
    },
  };
}
