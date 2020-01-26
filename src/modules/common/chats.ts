import { GlobalState } from '../../store/types';
import { ApiChat } from '../../api/types';

export function updateChatIds(global: GlobalState, chatIds: number[], shouldReplaceExisting = false) {
  const currentIds = !shouldReplaceExisting ? global.chats.ids : null;
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

export function updateChats(global: GlobalState, byId: Record<number, ApiChat>, shouldReplaceExisting = false) {
  return {
    ...global,
    chats: {
      ...global.chats,
      byId: {
        ...(!shouldReplaceExisting && global.chats.byId),
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

export function updateSelectedChatId(global: GlobalState, selectedId?: number) {
  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId,
    },
  };
}
