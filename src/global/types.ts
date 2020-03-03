import {
  ApiChat,
  ApiMessage,
  ApiUser,
  ApiUpdateAuthorizationStateType,
  ApiUpdateConnectionStateType,
  ApiStickerSet,
  ApiSticker,
  ApiMessageSearchType,
  ApiWebPage,
  ApiVideo,
} from '../api/types';

export type GlobalState = {
  showChatInfo: boolean;
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
    // TODO Replace with Partial<Record> to handle missing keys
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
    replyingToById: Record<number, number>;
    orderedPinnedIds?: number[];
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

  savedGifs: {
    hash?: number;
    gifs: ApiVideo[];
  };

  messageSearch: {
    byChatId: Record<number, {
      currentType?: ApiMessageSearchType;
      query?: string;
      resultsByType?: Record<ApiMessageSearchType, {
        totalCount?: number;
        nextOffsetId: number;
        foundIds: number[];
      }>;
    }>;
  };

  mediaViewer: {
    chatId?: number;
    messageId?: number;
    isReversed?: boolean;
  };

  topPeers: {
    users?: ApiUser[];
  };

  webPagePreview?: ApiWebPage;
};

export type ActionTypes = (
  // system and UI
  'init' | 'toggleChatInfo' | 'saveSession' | 'sync' | 'setIsUiReady' | 'addRecentEmoji' | 'addRecentSticker' |
  // auth
  'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'clearAuthError' | 'uploadProfilePhoto' |
  // chats
  'loadChats' | 'loadMoreChats' | 'openChat' | 'openChatWithInfo' | 'setChatScrollOffset' | 'setChatReplyingTo' |
  'loadFullChat' | 'loadSuperGroupOnlines' | 'loadTopChats' |
  // messages
  'loadMessagesForList' | 'selectMessage' | 'sendMessage' | 'cancelSendingMessage' | 'pinMessage' | 'deleteMessages' |
  'markMessagesRead' | 'loadMessage' | 'focusMessage' |
  // message search
  'openMessageTextSearch' | 'closeMessageTextSearch' | 'setMessageSearchQuery' | 'setMessageSearchMediaType' |
  'searchMessages' | 'readMessageContents' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry' | 'loadTopUsers' |
  // misc
  'openMediaViewer' |
  'loadStickerSets' | 'loadRecentStickers' | 'loadStickers' | 'loadSavedGifs' |
  'loadWebPagePreview' | 'clearWebPagePreview'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
