import { ApiChat } from '../../api/types';
import { GlobalState } from '../../store/types';

import { getPrivateChatUserId } from '../helpers';
import { selectUser } from './users';

export function selectChat(global: GlobalState, chatId: number) {
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

  return user && user.is_self;
}
