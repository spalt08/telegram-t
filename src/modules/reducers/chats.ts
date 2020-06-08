import { GlobalState } from '../../global/types';
import { ApiChat } from '../../api/types';
import { ARCHIVED_FOLDER_ID } from '../../config';

export function replaceChatListIds(
  global: GlobalState,
  type: 'active' | 'archived',
  newIds: number[] | undefined,
): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      listIds: {
        ...global.chats.listIds,
        [type]: newIds,
      },
    },
  };
}

export function updateChatListIds(global: GlobalState, type: 'active' | 'archived', idsUpdate: number[]): GlobalState {
  const { [type]: listIds } = global.chats.listIds;
  const newIds = listIds && listIds.length
    ? idsUpdate.filter((id) => !listIds.includes(id))
    : idsUpdate;

  if (listIds && !newIds.length) {
    return global;
  }

  return replaceChatListIds(global, type, [
    ...(listIds || []),
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

  // Sometimes when receiving full chat update, its pinned status can be set as `true`,
  // (e.g. when un-archiving previosly pinned chat, when there are already max pinned chats)
  // even though it isn't present in pinned chats. This clears the pinned status in such case to prevent confusion.
  const orderedPinnedIds = chat
    && global.chats.orderedPinnedIds[chat.folderId === ARCHIVED_FOLDER_ID ? 'archived' : 'active'];
  if (orderedPinnedIds && !orderedPinnedIds.includes(chatId)) {
    updatedChat.isPinned = undefined;
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
  if (global.chats.selectedId === selectedId) {
    return global;
  }

  return {
    ...global,
    chats: {
      ...global.chats,
      selectedId,
    },
    forwardMessages: {},
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
  messageId: number | undefined,
): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      replyingToById: {
        ...global.chats.replyingToById,
        [chatId]: messageId,
      },
      editingById: {
        ...global.chats.editingById,
        [chatId]: undefined,
      },
    },
  };
}

export function updateChatEditing(
  global: GlobalState,
  chatId: number,
  messageId: number | undefined,
): GlobalState {
  return {
    ...global,
    chats: {
      ...global.chats,
      editingById: {
        ...global.chats.editingById,
        [chatId]: messageId,
      },
      replyingToById: {
        ...global.chats.replyingToById,
        [chatId]: undefined,
      },
    },
  };
}

export function updateChatFolder(
  global: GlobalState,
  chatId: number,
  folderId?: number,
) {
  const folder = folderId === ARCHIVED_FOLDER_ID ? 'archived' : 'active';

  let currentListIds = global.chats.listIds;
  (Object.keys(currentListIds) as Array<keyof typeof currentListIds>).forEach((folderKey) => {
    const currentFolderList = currentListIds[folderKey] || [];
    if (folderKey === folder && !currentFolderList.includes(chatId)) {
      currentListIds = {
        ...currentListIds,
        [folderKey]: [...currentFolderList, chatId],
      };
    } else if (folderKey !== folder && currentFolderList.includes(chatId)) {
      currentListIds = {
        ...currentListIds,
        [folderKey]: currentFolderList.filter((id) => id !== chatId),
      };
    }
  });

  let newGlobal = {
    ...global,
    chats: {
      ...global.chats,
      listIds: currentListIds,
    },
  };

  const pinnedIds = newGlobal.chats.orderedPinnedIds[folder] || [];
  newGlobal = updateChat(newGlobal, chatId, { folderId: folderId || undefined, isPinned: pinnedIds.includes(chatId) });

  return newGlobal;
}
