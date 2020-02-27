import { ApiMessage } from './messages';

type ApiChatType = 'chatTypePrivate' | 'chatTypeSecret' |
'chatTypeBasicGroup' | 'chatTypeSuperGroup' |
'chatTypeChannel';

export interface ApiChat {
  id: number;
  type: {
    '@type': ApiChatType;
  };
  title?: string;
  last_message?: ApiMessage;
  last_read_outbox_message_id: number;
  last_read_inbox_message_id: number;
  unread_count: number;
  unread_mention_count: number;
  is_pinned: boolean;
  is_verified: boolean;
  is_muted: boolean;
  access_hash?: string;
  avatar?: {
    hash: string;
  };
  username?: string;
  // Obtained from GetFullChat / GetFullChannel
  full_info?: ApiChatFullInfo;
  // Obtained from GetOnlines
  online_count?: number;
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
  member_count?: number;
  pinned_message_id?: number;
  invite_link?: string;
}

export interface ApiChatMember {
  '@type': 'chatMember';
  user_id: number;
  inviter_id?: number;
  joined_date?: number;
}

export interface ApiPrivateChat extends ApiChat {
  type: {
    '@type': 'chatTypePrivate' | 'chatTypeSecret';
    user_id: number;
  };
}
