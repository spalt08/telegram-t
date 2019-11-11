import { ApiChat, ApiPrivateChat } from '../../../api/tdlib/types';

export function isPrivateChat(chatId: number) {
  return chatId > 0;
}

export function getPrivateChatUserId(chat: ApiPrivateChat) {
  return chat.type.user_id;
}

export function getChatTitle(chat: ApiChat) {
  return chat.title || 'Deleted account';
}
