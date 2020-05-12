import {
  ApiChat,
  ApiUser,
  ApiChatBannedRights,
  ApiChatAdminRights,
} from '../../api/types';

export function isChatPrivate(chatId: number) {
  return chatId > 0;
}

export function isChatBasicGroup(chat: ApiChat) {
  return chat.type === 'chatTypeBasicGroup';
}

export function isChatSuperGroup(chat: ApiChat) {
  return chat.type === 'chatTypeSuperGroup';
}

export function isChatChannel(chat: ApiChat) {
  return chat.type === 'chatTypeChannel';
}

export function isCommonBoxChat(chat: ApiChat) {
  return chat.type === 'chatTypePrivate' || chat.type === 'chatTypeBasicGroup';
}

export function getChatTypeString(chat: ApiChat) {
  switch (chat.type) {
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
  if (chat.type !== 'chatTypePrivate' && chat.type !== 'chatTypeSecret') {
    return undefined;
  }
  return chat.id;
}

export function getChatTitle(chat: ApiChat, user?: ApiUser) {
  if (user && chat.id === user.id && user.isSelf) {
    return 'Saved Messages';
  }
  return chat.title || 'Deleted account';
}

export function getChatDescription(chat: ApiChat) {
  if (!chat.fullInfo) {
    return undefined;
  }
  return chat.fullInfo.about;
}

export function getChatLink(chat: ApiChat) {
  const { username } = chat;
  const { inviteLink } = chat.fullInfo || {};

  if (inviteLink && inviteLink.length) {
    return inviteLink;
  }

  return username ? `t.me/${username}` : '';
}

export function getChatAvatarHash(
  owner: ApiChat | ApiUser,
  size: 'normal' | 'big' = 'normal',
) {
  if (!owner.avatar) {
    return undefined;
  }

  const base = `avatar${owner.id}`;

  switch (size) {
    case 'big':
      return `${base}?size=big&${owner.avatar.hash}`;
    default:
      return `${base}?${owner.avatar.hash}`;
  }
}

export function isChatSummaryOnly(chat: ApiChat) {
  return !chat.lastMessage;
}

export function getHasAdminRight(chat: ApiChat, key: keyof ApiChatAdminRights) {
  return chat.adminRights && chat.adminRights[key];
}

export function isUserRightBanned(chat: ApiChat, key: keyof ApiChatBannedRights) {
  return (chat.currentUserBannedRights && chat.currentUserBannedRights[key])
    || (chat.defaultBannedRights && chat.defaultBannedRights[key]);
}

export function getCanPostInChat(chat: ApiChat) {
  if (chat.isRestricted) {
    return false;
  }

  if (chat.isCreator) {
    return true;
  }

  if (isChatPrivate(chat.id)) {
    return true;
  }

  if (isChatChannel(chat)) {
    return getHasAdminRight(chat, 'postMessages');
  }

  return !isUserRightBanned(chat, 'sendMessages');
}

export interface IAllowedAttachmentOptions {
  canAttachMedia: boolean;
  canAttachPolls: boolean;
  canSendStickers: boolean;
  canSendGifs: boolean;
  canAttachEmbedLinks: boolean;
}

export function getAllowedAttachmentOptions(chat?: ApiChat): IAllowedAttachmentOptions {
  if (!chat) {
    return {
      canAttachMedia: false,
      canAttachPolls: false,
      canSendStickers: false,
      canSendGifs: false,
      canAttachEmbedLinks: false,
    };
  }

  return {
    canAttachMedia: !isUserRightBanned(chat, 'sendMedia'),
    canAttachPolls: !isChatPrivate(chat.id) && !isUserRightBanned(chat, 'sendPolls'),
    canSendStickers: !isUserRightBanned(chat, 'sendStickers'),
    canSendGifs: !isUserRightBanned(chat, 'sendGifs'),
    canAttachEmbedLinks: !isUserRightBanned(chat, 'embedLinks'),
  };
}

export function getMessageSendingRestrictionReason(chat: ApiChat) {
  if (chat.currentUserBannedRights && chat.currentUserBannedRights.sendMessages) {
    return 'You are not allowed to send messages in this chat.';
  }
  if (chat.defaultBannedRights && chat.defaultBannedRights.sendMessages) {
    return 'Sending messages is not allowed in this chat.';
  }

  return undefined;
}

export function getChatSlowModeOptions(chat?: ApiChat) {
  if (!chat || !chat.fullInfo) {
    return undefined;
  }

  return chat.fullInfo.slowMode;
}

export function getChatOrder(chat: ApiChat) {
  return Math.max(chat.joinDate || 0, chat.lastMessage ? chat.lastMessage.date : 0);
}
