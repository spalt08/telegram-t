import {
  ApiChat,
  ApiMessage,
  ApiUser,
  ApiGroup,
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

  groups: {
    ids: number[];
    byId: Record<number, ApiGroup>;
  };

  messages: {
    selectedMediaMessageId?: number;
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
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
  'loadFullChat' | 'loadChatOnlines' |
  // messages
  'loadMessages' | 'loadMoreMessages' | 'selectMessage' | 'sendTextMessage' | 'pinMessage' | 'deleteMessages' |
  'selectMediaMessage' | 'markMessagesRead' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
