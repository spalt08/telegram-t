import { ApiChat } from '../../api/types';
import { GlobalState } from '../../store/types';

export function selectChat(global: GlobalState, chatId: number) {
  return global.chats.byId[chatId];
}

export function selectChatGroupId(chat: ApiChat) {
  return chat.type.basic_group_id || chat.type.supergroup_id;
}
