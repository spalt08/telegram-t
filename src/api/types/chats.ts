import { ApiMessage } from './messages';

type ApiChatType = 'chatTypePrivate' | 'chatTypeSecret' |
'chatTypeBasicGroup' | 'chatTypeSuperGroup' |
'chatTypeChannel';

export interface ApiChat {
  id: number;
  type: ApiChatType;
  title?: string;
  lastMessage?: ApiMessage;
  lastReadOutboxMessageId?: number;
  lastReadInboxMessageId?: number;
  unreadCount?: number;
  unreadMentionsCount?: number;
  isPinned?: boolean;
  isVerified?: boolean;
  isMuted?: boolean;
  accessHash?: string;
  avatar?: {
    hash: string;
  };
  username?: string;
  membersCount?: number;
  joinDate?: number;
  adminRights?: ApiChatAdminRights;
  currentUserBannedRights?: ApiChatBannedRights;
  defaultBannedRights?: ApiChatBannedRights;
  isCreator?: boolean;
  isRestricted?: boolean;
  hasLeft?: boolean;
  restrictionReason?: ApiRestrictionReason;

  migratedTo?: {
    chatId: number;
    accessHash?: string;
  };

  // Obtained from GetFullChat / GetFullChannel
  fullInfo?: ApiChatFullInfo;
  // Obtained from GetOnlines
  onlineCount?: number;
  // Obtained with UpdateUserTyping or UpdateChatUserTyping updates
  typingStatus?: ApiTypingStatus;
}

export interface ApiTypingStatus {
  userId?: number;
  action: string;
  timestamp: number;
}

export interface ApiChatFullInfo {
  about?: string;
  members?: ApiChatMember[];
  pinnedMessageId?: number;
  inviteLink?: string;
  slowMode?: {
    seconds: number;
    nextSendDate?: number;
  };
  migratedFrom?: {
    chatId: number;
    maxMessageId?: number;
  };
}

export interface ApiChatMember {
  userId: number;
  inviterId?: number;
  joinedDate?: number;
}

export interface ApiChatAdminRights {
  changeInfo?: boolean;
  postMessages?: boolean;
  editMessages?: boolean;
  deleteMessages?: boolean;
  banUsers?: boolean;
  inviteUsers?: boolean;
  pinMessages?: boolean;
  addAdmins?: boolean;
}

export interface ApiChatBannedRights {
  viewMessages?: boolean;
  sendMessages?: boolean;
  sendMedia?: boolean;
  sendStickers?: boolean;
  sendGifs?: boolean;
  sendGames?: boolean;
  sendInline?: boolean;
  embedLinks?: boolean;
  sendPolls?: boolean;
  changeInfo?: boolean;
  inviteUsers?: boolean;
  pinMessages?: boolean;
}

export interface ApiRestrictionReason {
  reason: string;
  text: string;
}
