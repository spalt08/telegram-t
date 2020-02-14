import {
  ApiChat,
  ApiMessage,
  ApiUser,
  ApiUpdateAuthorizationStateType,
  ApiUpdateConnectionStateType,
  ApiStickerSet,
  ApiSticker,
  ApiMessageSearchMediaType,
  ApiWebPage,
} from '../api/types';

export type GlobalState = {
  showRightColumn: boolean;
  isUiReady: boolean;
  connectionState?: ApiUpdateConnectionStateType;
  currentUserId?: number;
  lastSyncTime?: number;

  // TODO Move to `auth`.
  isLoggingOut?: boolean;
  authState?: ApiUpdateAuthorizationStateType;
  authPhoneNumber?: string;
  authIsLoading?: boolean;
  authError?: string;
  authRememberMe?: boolean;
  authIsSessionRemembered?: boolean;
  authNearestCountry?: string;

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
    isReversed?: boolean;
  };

  fileTransfers: {
    byMessageKey: Record<string, {
      progress: number;
    }>;
  };

  recentEmojis: string[];

  stickers: {
    all: {
      hash?: number;
      byId: Record<string, ApiStickerSet>;
    };
    recent: {
      hash?: number;
      stickers: ApiSticker[];
    };
  };

  messageSearch: {
    isTextSearch: boolean;
    query?: string;
    mediaType?: ApiMessageSearchMediaType;
    totalCount?: number;
    nextOffsetId?: number;
    foundIds?: number[];
  };

  mediaViewer: {
    chatId?: number;
    messageId?: number;
    isReversed?: boolean;
  };

  webPagePreview?: ApiWebPage;
};

export type ActionTypes = (
  // system and UI
  'init' | 'toggleRightColumn' | 'saveSession' | 'sync' | 'setIsUiReady' | 'addRecentEmoji' | 'addRecentSticker' |
  // auth
  'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'clearAuthError' | 'uploadProfilePhoto' |
  // chats
  'loadChats' | 'loadMoreChats' | 'openChat' | 'openChatWithInfo' | 'setChatScrollOffset' | 'setChatReplyingTo' |
  'loadFullChat' | 'loadChatOnlines' | 'loadTopChats' |
  // messages
  'loadMessagesForList' | 'selectMessage' | 'sendMessage' | 'cancelSendingMessage' | 'pinMessage' | 'deleteMessages' |
  'markMessagesRead' | 'loadMessage' | 'focusMessage' |
  // message search
  'openMessageSearch' | 'closeMessageSearch' | 'setMessageSearchQuery' | 'setMessageSearchMediaType' |
  'searchMessages' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry' | 'loadUserFromMessage' |
  // misc
  'openMediaViewer' |
  'loadStickers' | 'loadRecentStickers' | 'loadStickerSet' |
  'loadWebPagePreview' | 'clearWebPagePreview'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
