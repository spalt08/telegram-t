import { ApiChat, ApiPrivateChat } from '../../api/types';

export function isPrivateChat(chatId: number) {
  return chatId > 0;
}

export function isGroupChat(chatId: number) {
  return !isPrivateChat(chatId);
}

export function isSuperGroupChat(chatId: number) {
  return chatId < -1000000000;
}

export function getPrivateChatUserId(chat: ApiPrivateChat) {
  return chat.type.user_id;
}

export function getChatTitle(chat: ApiChat) {
  return chat.title || 'Deleted account';
}

// TdLib only.
export function getChatPhotoKey(chat: ApiChat): string | null {
  const { photo } = chat;

  if (photo) {
    return `chat${photo.small.id}`;
  }

  return null;
}

export function getChatAvatarHash(chat: ApiChat): string | null {
  if (!chat.avatar) {
    return null;
  }

  return `avatar${chat.id}?${chat.avatar.hash}`;
}
