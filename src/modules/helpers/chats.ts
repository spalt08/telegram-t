import { ApiChat, ApiPrivateChat } from '../../api/tdlib/types/index';

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

export function getChatPhotoId(chat: ApiChat): number | null {
  const { photo, photo_locations } = chat;

  if (photo) {
    return photo.small.id;
  } else if (photo_locations) {
    return chat.id;
  }

  return null;
}
