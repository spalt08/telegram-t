import { GlobalState } from '../../store/types';
import { ApiChat } from '../../api/types';

export function addChatIds(global: GlobalState, chatIds: number[]) {
  const currentIds = global.chats.ids;
  const newIds = (currentIds && currentIds.length) ? chatIds.filter((id) => !currentIds.includes(id)) : chatIds;

  return {
    ...global,
    chats: {
      ...global.chats,
      ids: [
        ...(currentIds || []),
        ...newIds,
      ],
    },
  };
}

export function updateChatScrollOffset(
  global: GlobalState,
  chatId: number,
  scrollOffset: number,
) {
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
) {
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

export function updateChats(global: GlobalState, byId: Record<number, ApiChat>) {
  return {
    ...global,
    chats: {
      ...global.chats,
      byId: {
        ...global.chats.byId,
        ...byId,
      },
    },
  };
}

export function updateChat(global: GlobalState, chatId: number, chatUpdate: Partial<ApiChat>) {
  return updateChats(global, {
    [chatId]: {
      ...global.chats.byId[chatId],
      ...chatUpdate,
    },
  });
}
