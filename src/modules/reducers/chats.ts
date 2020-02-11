import { GlobalState } from '../../global/types';
import { ApiChat } from '../../api/types';

export function replaceChatIds(global: GlobalState, newIds: number[]): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      ids: newIds,
    },
  };
}

export function updateChatIds(global: GlobalState, idsUpdate: number[]): GlobalState {
  const ids = global.chats.ids || [];
  const newIds = ids.length ? idsUpdate.filter((id) => !ids.includes(id)) : idsUpdate;

  if (!newIds.length) {
    return global;
  }

  return replaceChatIds(global, [
    ...ids,
    ...newIds,
  ]);
}

export function replaceChats(global: GlobalState, newById: Record<number, ApiChat>): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      byId: newById,
    },
  };
}

export function updateChat(global: GlobalState, chatId: number, chatUpdate: Partial<ApiChat>): GlobalState {
  const { byId } = global.chats;
  const chat = byId[chatId];
  const updatedChat = {
    ...chat,
    ...chatUpdate,
  };

  if (!updatedChat.id || !updatedChat.type) {
    return global;
  }

  return replaceChats(global, {
    ...byId,
    [chatId]: updatedChat,
  });
}

export function updateChats(global: GlobalState, updatedById: Record<number, ApiChat>): GlobalState {
  let newGlobal = global;

  Object.keys(updatedById).forEach((id) => {
    newGlobal = updateChat(newGlobal, Number(id), updatedById[Number(id)]);
  });

  return newGlobal;
}

export function updateSelectedChatId(global: GlobalState, selectedId?: number): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId,
    },
    messageSearch: {
      isActive: false,
    },
  };
}

export function updateChatScrollOffset(
  global: GlobalState,
  chatId: number,
  scrollOffset: number,
): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      scrollOffsetById: {
        ...global.chats.scrollOffsetById,
        [chatId]: scrollOffset,
      },
    },
  };
}

export function updateChatReplyingTo(
  global: GlobalState,
  chatId: number,
  messageId: number,
): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      replyingToById: {
        ...global.chats.replyingToById,
        [chatId]: messageId,
      },
    },
  };
}
