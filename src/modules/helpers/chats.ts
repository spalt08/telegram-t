import { ApiChat, ApiUser } from '../../api/types';

export function isPrivateChat(chatId: number) {
  return chatId > 0;
}

export function isSuperGroup(chat: ApiChat) {
  return chat.type['@type'] === 'chatTypeSuperGroup';
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
  return chat.id;
}

export function getChatTitle(chat: ApiChat, user?: ApiUser) {
  if (user && user.is_self) {
    return 'Saved Messages';
  }
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
  const { invite_link } = chat.full_info || {};

  if (invite_link && invite_link.length) {
    return invite_link;
  }

  return username ? `t.me/${username}` : '';
}

export function getChatAvatarHash(chat: ApiChat): string | null {
  if (!chat.avatar) {
    return null;
  }

  return `avatar${chat.id}?${chat.avatar.hash}`;
}
