import { ApiPrivateChat } from '../types/chats';

export function isPrivateChat(chatId: number) {
  return chatId > 0;
}

export function getPrivateChatUserId(chat: ApiPrivateChat) {
  return chat.type.user_id;
}
