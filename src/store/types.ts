import {
  ApiChat, ApiMessage, ApiUser, ApiUpdateAuthorizationStateType, ApiGroup, ApiFileSource,
} from '../api/types';

export type GlobalState = {
  isInitialized: boolean;
  showRightColumn: boolean;

  users: {
    byId: Record<number, ApiUser>;
  };

  chats: {
    selectedId?: number;
    ids: number[];
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
  };

  groups: {
    ids: number[];
    byId: Record<number, ApiGroup>;
  };

  messages: {
    selectedId?: number;
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
    }>;
  };

  files: {
    byKey: Record<string, ApiFileSource>;
  };

  // TODO Move to `auth`.
  isLoggingOut?: boolean;
  authState?: ApiUpdateAuthorizationStateType;
  authPhoneNumber?: string;
  authIsLoading?: boolean;
  authError?: string;
  authRememberMe?: boolean;
  authIsSessionRemembered?: boolean;
};

export type ActionTypes = (
  // system
  'init' | 'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'toggleRightColumn' |
  // chats
  'loadChats' | 'loadMoreChats' | 'selectChat' | 'setChatScrollOffset' |
  // messages
  'loadChatMessages' | 'loadMoreChatMessages' | 'selectMessage' | 'sendTextMessage' |
  // files
  'loadChatPhoto' | 'loadUserPhoto'
);

export type GlobalActions = Record<ActionTypes, Function>;
