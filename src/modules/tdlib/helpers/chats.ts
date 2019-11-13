import { ApiChat, ApiPrivateChat } from '../../../api/tdlib/types';
import { getFileSrc } from '../../../api/tdlib/files';

export function isPrivateChat(chatId: number) {
  return chatId > 0;
}

export function isGroupChat(chat: ApiChat) {
  return chat.type['@type'] === 'chatTypeBasicGroup' || chat.type['@type'] === 'chatTypeSupergroup';
}

export function getPrivateChatUserId(chat: ApiPrivateChat) {
  return chat.type.user_id;
}

export function getChatTitle(chat: ApiChat) {
  return chat.title || 'Deleted account';
}

export function getChatImage(chat: ApiChat) {
  const smallPhoto = chat.photo && chat.photo.small;

  return smallPhoto ? getFileSrc(smallPhoto) : null;
}
