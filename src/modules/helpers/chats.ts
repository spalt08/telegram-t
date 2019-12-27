import { ApiChat } from '../../api/types';

export function isPrivateChat(chatId: number) {
  return chatId > 0;
}

export function isGroupChat(chatId: number) {
  return !isPrivateChat(chatId);
}

export function isSuperGroupChat(chatId: number) {
  return chatId < -1000000000;
}

export function isChannelChat(chatId: number) {
  // TODO This is temporary, as not all supergroups are channels.
  return isSuperGroupChat(chatId);
}

export function isChannel(chat: ApiChat) {
  return chat.type['@type'] === 'chatTypeChannel';
}

export function getChatTypeString(chat: ApiChat) {
  switch (chat.type['@type']) {
    case 'chatTypePrivate':
      return 'Private Chat';
    case 'chatTypeBasicGroup':
    case 'chatTypeSuperGroup':
      return 'Group Chat';
    case 'chatTypeChannel':
      return 'Channel';
    default:
      return 'Chat';
  }
}

export function getPrivateChatUserId(chat: ApiChat) {
  if (chat.type['@type'] !== 'chatTypePrivate' && chat.type['@type'] !== 'chatTypeSecret') {
    return undefined;
  }
  return chat.type.user_id;
}

export function getChatTitle(chat: ApiChat) {
  return chat.title || 'Deleted account';
}

export function getChatDescription(chat: ApiChat) {
  if (!chat.full_info) {
    return null;
  }
  return chat.full_info.about;
}

export function getChatLink(chat: ApiChat) {
  const { username } = chat;
  const invite_link = chat.full_info && chat.full_info.invite_link;

  if (invite_link && invite_link.length) {
    return invite_link;
  }

  return username ? `t.me/${username}` : '';
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
