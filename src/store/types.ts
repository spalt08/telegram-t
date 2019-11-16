import {
  ApiChat, ApiFile, ApiMessage, ApiUser, UpdateAuthorizationStateType,
} from '../api/tdlib/types';

export type GlobalState = {
  isInitialized: boolean;

  users: {
    byId: Record<number, ApiUser>;
  };

  chats: {
    selectedId?: number;
    ids: number[];
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
  };

  messages: {
    selectedId?: number;
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
    }>;
  };

  files: {
    byId: Record<number, ApiFile>;
  };

  // TODO Move to `auth`.
  isLoggingOut?: boolean;
  authState?: UpdateAuthorizationStateType;
  authPhoneNumber?: string;
  authIsLoading?: boolean;
  authError?: string;
  authShouldRememberMe?: boolean;
  authIsSessionRemembered?: boolean;
};

export type ActionTypes = (
  // system
  'init' | 'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' |
  // chats
  'loadChats' | 'loadMoreChats' | 'selectChat' | 'setChatScrollOffset' |
  // messages
  'loadChatMessages' | 'loadMoreChatMessages' | 'selectMessage' | 'sendTextMessage' |
  // files
  'loadChatPhoto' | 'loadUserPhoto'
);

export type GlobalActions = Record<ActionTypes, Function>;
