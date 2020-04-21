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
}

export interface ApiChatMember {
  userId: number;
  inviterId?: number;
  joinedDate?: number;
}
