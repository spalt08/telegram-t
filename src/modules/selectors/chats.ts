import { ApiChat } from '../../api/types';
import { GlobalState } from '../../global/types';

import {
  getPrivateChatUserId, isChatSuperGroup, isUserBot, isUserOnline,
} from '../helpers';
import { selectUser } from './users';

export function selectChat(global: GlobalState, chatId: number): ApiChat | undefined {
  return global.chats.byId[chatId];
}

export function selectOpenChat(global: GlobalState) {
  const { byId, selectedId } = global.chats;
  return selectedId ? byId[selectedId] : undefined;
}

export function selectIsMediaViewerOpen(global: GlobalState) {
  const { mediaViewer } = global;
  return Boolean(mediaViewer.chatId);
}

export function selectIsChatWithSelf(global: GlobalState, chat: ApiChat) {
  const userId = getPrivateChatUserId(chat);

  if (!userId) {
    return false;
  }

  const user = selectUser(global, userId);

  return user && user.isSelf;
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

  return user && isUserBot(user);
}
