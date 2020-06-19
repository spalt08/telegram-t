import { ApiChat } from '../../api/types';
import { GlobalState } from '../../global/types';

import {
  getPrivateChatUserId, isChatSuperGroup, isUserBot, isUserOnline,
} from '../helpers';
import { selectUser } from './users';
import { ALL_FOLDER_ID, ARCHIVED_FOLDER_ID } from '../../config';

export function selectChat(global: GlobalState, chatId: number): ApiChat | undefined {
  return global.chats.byId[chatId];
}

export function selectOpenChat(global: GlobalState) {
  const { byId, selectedId } = global.chats;
  return selectedId ? byId[selectedId] : undefined;
}

export function selectIsChatWithSelf(global: GlobalState, chat: ApiChat) {
  const userId = getPrivateChatUserId(chat);

  if (!userId) {
    return false;
  }

  const user = selectUser(global, userId);

  return user && user.isSelf;
}

export function selectSupportChat(global: GlobalState) {
  return Object.values(global.chats.byId).find(({ isSupport }: ApiChat) => isSupport);
}

export function selectChatOnlineCount(global: GlobalState, chat: ApiChat) {
  if (isChatSuperGroup(chat)) {
    return chat.onlineCount;
  }

  if (!chat.fullInfo || !chat.fullInfo.members) {
    return undefined;
  }

  const memberIds = chat.fullInfo.members.map((m) => m.userId);
  return memberIds.reduce((onlineCount, memberId) => {
    if (global.users.byId[memberId] && isUserOnline(global.users.byId[memberId])) {
      return onlineCount + 1;
    }

    return onlineCount;
  }, 0);
}

export function selectIsChatWithBot(global: GlobalState, chatId: number) {
  const chat = selectChat(global, chatId);
  const userId = chat && getPrivateChatUserId(chat);
  const user = userId && selectUser(global, userId);

  return user ? isUserBot(user) : false;
}

export function selectAreActiveChatsLoaded(global: GlobalState): boolean {
  return Boolean(global.chats.listIds.active);
}

export function selectIsChatListed(global: GlobalState, chatId: number, type?: 'active' | 'archived'): boolean {
  const { listIds } = global.chats;
  if (type) {
    const targetList = listIds[type];
    return Boolean(targetList && targetList.includes(chatId));
  }

  return Object.values(listIds).some((list) => list && list.includes(chatId));
}

export function selectChatListType(global: GlobalState, chatId: number): 'active' | 'archived' | undefined {
  const chat = selectChat(global, chatId);
  if (!chat || !selectIsChatListed(global, chatId)) {
    return undefined;
  }

  return chat.folderId === ARCHIVED_FOLDER_ID ? 'archived' : 'active';
}

export function selectChatFolder(global: GlobalState, folderId: number) {
  return global.chatFolders.byId[folderId];
}

export function selectTotalChatCount(global: GlobalState, listType: 'active' | 'archived'): number {
  const { totalCount } = global.chats;
  const allChatsCount = totalCount.all;
  const archivedChatsCount = totalCount.archived || 0;

  if (listType === 'archived') {
    return archivedChatsCount;
  }

  return allChatsCount ? allChatsCount - archivedChatsCount : 0;
}

export function selectIsChatPinned(global: GlobalState, chatId: number, folderId = ALL_FOLDER_ID): boolean {
  const { active, archived } = global.chats.orderedPinnedIds;

  if (folderId === ALL_FOLDER_ID) {
    return !!active && active.includes(chatId);
  }

  if (folderId === ARCHIVED_FOLDER_ID) {
    return !!archived && archived.includes(chatId);
  }

  const { byId: chatFoldersById } = global.chatFolders;

  const { pinnedChatIds } = chatFoldersById[folderId] || {};
  return !!pinnedChatIds && pinnedChatIds.includes(chatId);
}
