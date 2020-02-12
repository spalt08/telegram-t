import {
  ApiChat,
  ApiMessage,
  ApiUser,
  ApiUpdateAuthorizationStateType,
  ApiUpdateConnectionStateType,
} from '../api/types';

export type GlobalState = {
  users: {
    byId: Record<number, ApiUser>;
    selectedId?: number;
  };

  chats: {
    selectedId?: number;
    ids: number[] | null;
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
    replyingToById: Record<number, number>;
  };

  messages: {
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
      listedIds?: number[];
      viewportIds?: number[];
      focusedMessageId?: number;
    }>;
    selectedMediaMessageId?: number;
    mediaReverseOrder?: boolean;
  };

  fileTransfers: {
    byMessageKey: Record<string, {
      progress: number;
    }>;
  };

  // TODO Move to `auth`.
  isLoggingOut?: boolean;
  authState?: ApiUpdateAuthorizationStateType;
  authPhoneNumber?: string;
  authIsLoading?: boolean;
  authError?: string;
  authRememberMe?: boolean;
  authIsSessionRemembered?: boolean;
  authNearestCountry?: string;

  isUiReady: boolean;
  connectionState?: ApiUpdateConnectionStateType;
  currentUserId?: number;
  showRightColumn: boolean;
  lastSyncTime?: number;

  recentEmojis: string[];

  messageSearch: {
    isActive: boolean;
    query?: string;
  };
};

export type ActionTypes = (
  // system and UI
  'init' | 'toggleRightColumn' | 'saveSession' | 'sync' | 'setIsUiReady' | 'addRecentEmoji' |
  // auth
  'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'clearAuthError' | 'uploadProfilePhoto' |
  // chats
  'loadChats' | 'loadMoreChats' | 'openChat' | 'openChatWithInfo' | 'setChatScrollOffset' | 'setChatReplyingTo' |
  'loadFullChat' | 'loadChatOnlines' | 'loadTopChats' |
  // messages
  'loadMessagesForList' | 'selectMessage' | 'sendMessage' | 'cancelSendingMessage' | 'pinMessage' | 'deleteMessages' |
  'selectMediaMessage' | 'markMessagesRead' | 'loadMessage' | 'focusMessage' |
  // message search
  'openMessageSearch' | 'closeMessageSearch' | 'setMessageSearchQuery' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry' | 'loadUserFromMessage'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
