import {
  ApiChat,
  ApiUser,
  ApiChatBannedRights,
  ApiChatAdminRights,
  ApiChatFolder,
} from '../../api/types';

import { ARCHIVED_FOLDER_ID } from '../../config';
import { orderBy } from '../../util/iteratees';

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
  return chat.adminRights ? chat.adminRights[key] : false;
}

export function isUserRightBanned(chat: ApiChat, key: keyof ApiChatBannedRights) {
  return (chat.currentUserBannedRights && chat.currentUserBannedRights[key])
    || (chat.defaultBannedRights && chat.defaultBannedRights[key]);
}

export function getCanPostInChat(chat: ApiChat) {
  if (chat.isRestricted || chat.migratedTo) {
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

export function getAllowedAttachmentOptions(chat?: ApiChat, isChatWithBot?: boolean): IAllowedAttachmentOptions {
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
    canAttachPolls: isChatWithBot || (!isChatPrivate(chat.id) && !isUserRightBanned(chat, 'sendPolls')),
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

export function isChatArchived(chat: ApiChat) {
  return chat.folderId === ARCHIVED_FOLDER_ID;
}

export function getCanDeleteChat(chat: ApiChat) {
  return isChatBasicGroup(chat) || ((isChatSuperGroup(chat) || isChatChannel(chat)) && chat.isCreator);
}

function chatFolderFilter(
  chat: ApiChat,
  folder: ApiChatFolder,
  usersById: Record<number, ApiUser>,
): boolean {
  const { excludedChatIds, includedChatIds } = folder;

  if (excludedChatIds && excludedChatIds.includes(chat.id)) {
    return false;
  }

  if (includedChatIds && includedChatIds.includes(chat.id)) {
    return true;
  }

  if (isChatArchived(chat) && folder.excludeArchived) {
    return false;
  }

  if (chat.isMuted && folder.excludeMuted) {
    return false;
  }

  if (!chat.unreadCount && !chat.unreadMentionsCount && folder.excludeRead) {
    return false;
  }

  if (isChatPrivate(chat.id)) {
    const privateChatUser = usersById[chat.id];

    const isChatWithBot = privateChatUser && privateChatUser.type === 'userTypeBot';
    if (folder.bots && isChatWithBot) {
      return true;
    }

    if (folder.contacts) {
      return privateChatUser.isContact;
    } else if (folder.nonContacts) {
      return !privateChatUser.isContact;
    }
  } else if (isChatBasicGroup(chat) || isChatSuperGroup(chat)) {
    return !!folder.groups;
  } else if (isChatChannel(chat)) {
    return !!folder.channels;
  }

  return false;
}

export function prepareFolderListIds(
  chatsById: Record<number, ApiChat>,
  usersById: Record<number, ApiUser>,
  folder: ApiChatFolder,
) {
  const chatFilter = (chat?: ApiChat) => {
    return chat ? chatFolderFilter(chat, folder, usersById) : false;
  };

  const listIds = Object.values(chatsById)
    .filter(chatFilter)
    .map(({ id }) => id);

  const { pinnedChatIds } = folder;

  return [listIds, pinnedChatIds];
}

export function prepareChatList(
  chatsById: Record<number, ApiChat>,
  listIds: number[],
  orderedPinnedIds?: number[],
  folderType: 'all' | 'archived' | 'folder' = 'all',
) {
  const chatFilter = (chat?: ApiChat) => {
    if (!chat || !chat.lastMessage || !listIds.includes(chat.id)) {
      return false;
    }

    switch (folderType) {
      case 'all':
        if (isChatArchived(chat)) {
          return false;
        }
        break;
      case 'archived':
        if (!isChatArchived(chat)) {
          return false;
        }
        break;
    }

    return !chat.isRestricted && !chat.hasLeft;
  };

  const listedChats = listIds.map((id) => chatsById[id]).filter(chatFilter);

  const pinnedChats = orderedPinnedIds
    ? orderedPinnedIds.map((id) => chatsById[id]).filter(chatFilter)
    : [];
  const otherChats = orderBy(
    orderedPinnedIds
      ? listedChats.filter((chat) => !orderedPinnedIds.includes(chat.id))
      : listedChats,
    getChatOrder,
    'desc',
  );

  return {
    pinnedChats,
    otherChats,
  };
}

export function getFolderUnreadDialogs(
  chatsById: Record<number, ApiChat>,
  usersById: Record<number, ApiUser>,
  folder: ApiChatFolder,
) {
  const [listIds] = prepareFolderListIds(chatsById, usersById, folder);
  if (!listIds) {
    return undefined;
  }

  const listedChats = listIds.map((id) => chatsById[id]).filter((chat) => (
    chat && chat.lastMessage && !chat.isRestricted && !chat.hasLeft
  ));

  const unreadDialogsCount = listedChats.reduce((total, chat) => {
    return chat.unreadCount ? total + 1 : total;
  }, 0);

  const hasActiveDialogs = listedChats.some((chat) => chat.unreadMentionsCount || (!chat.isMuted && chat.unreadCount));

  return {
    unreadDialogsCount,
    hasActiveDialogs,
  };
}
