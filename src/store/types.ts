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
    selectedMediaMessageId?: number;
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
    }>;
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
};

export type ActionTypes = (
  // system and UI
  'init' | 'toggleRightColumn' | 'saveSession' | 'sync' | 'setIsUiReady' |
  // auth
  'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'clearAuthError' |
  // chats
  'loadChats' | 'loadMoreChats' | 'openChat' | 'openChatWithInfo' | 'setChatScrollOffset' | 'setChatReplyingTo' |
  'loadFullChat' | 'loadChatOnlines' | 'loadTopChats' |
  // messages
  'loadMessages' | 'selectMessage' | 'sendMessage' | 'pinMessage' | 'deleteMessages' |
  'selectMediaMessage' | 'markMessagesRead' | 'loadMessage' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry' | 'loadUserFromMessage'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
