import { ApiChat } from '../../api/types';
import { GlobalState } from '../../global/types';

import { getPrivateChatUserId, isChatSuperGroup, isUserOnline } from '../helpers';
import { selectUser } from './users';

export function selectChat(global: GlobalState, chatId: number) {
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

  return user && user.is_self;
}

export function selectChatOnlineCount(global: GlobalState, chat: ApiChat) {
  if (isChatSuperGroup(chat)) {
    return chat.online_count;
  }

  if (!chat.full_info || !chat.full_info.members) {
    return undefined;
  }

  const memberIds = chat.full_info.members.map((m) => m.user_id);
  return memberIds.reduce((onlineCount, memberId) => {
    if (global.users.byId[memberId] && isUserOnline(global.users.byId[memberId])) {
      return onlineCount + 1;
    }

    return onlineCount;
  }, 0);
}

export function selectLastReadId(global: GlobalState, chatId: number) {
  const chat = selectChat(global, chatId);

  return chat.unread_count ? chat.last_read_inbox_message_id : undefined;
}
