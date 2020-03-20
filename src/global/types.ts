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
import { FocusDirection } from '../types';

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

  contactList?: {
    hash: number;
    userIds: number[];
  };

  users: {
    byId: Record<number, ApiUser>;
    selectedId?: number;
  };

  chats: {
    selectedId?: number;
    listIds?: number[];
    // TODO Replace with Partial<Record> to handle missing keys
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
    replyingToById: Record<number, number | undefined>;
    editingById: Record<number, number | undefined>;
    orderedPinnedIds?: number[];
  };

  messages: {
    byChatId: Record<number, {
      byId: Record<number, ApiMessage>;
      listedIds?: number[];
      outlyingIds?: number[];
      viewportIds?: number[];
    }>;
    isReversed?: boolean;
  };

  focusedMessage?: {
    chatId?: number;
    messageId?: number;
    direction?: FocusDirection;
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
    gifs?: ApiVideo[];
  };

  globalSearch: {
    query?: string;
    recentlyFoundChatIds?: number[];
    fetchingStatus?: {
      chats?: boolean;
      messages?: boolean;
    };
    localResults?: {
      chats?: ApiChat[];
      users?: ApiUser[];
    };
    globalResults?: {
      chats?: ApiChat[];
      users?: ApiUser[];
      messages?: {
        totalCount: number;
        nextRate?: number;
        byId: Record<number, ApiMessage>;
      };
    };
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
    hashes?: Record<string, number>;
    lastRequestedAt?: Record<string, number>;
    users?: ApiUser[];
  };

  webPagePreview?: ApiWebPage;

  forwardMessages: {
    fromChatId?: number;
    messageIds?: number[];
    toChatIds?: number[];
    inProgress?: boolean;
  };
};

export type ActionTypes = (
  // system and UI
  'init' | 'toggleChatInfo' | 'saveSession' | 'sync' | 'setIsUiReady' | 'addRecentEmoji' | 'addRecentSticker' |
  // auth
  'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'clearAuthError' | 'uploadProfilePhoto' |
  // chats
  'loadChats' | 'loadMoreChats' | 'openChat' | 'openChatWithInfo' | 'setChatScrollOffset' | 'setChatReplyingTo' |
  'setChatEditing' | 'editLastChatMessage' |
  'loadFullChat' | 'loadSuperGroupOnlines' | 'loadTopChats' | 'requestChatUpdate' |
  // messages
  'loadViewportMessages' | 'selectMessage' | 'sendMessage' | 'cancelSendingMessage' | 'pinMessage' | 'deleteMessages' |
  'markMessagesRead' | 'loadMessage' | 'focusMessage' | 'focusLastReadMessage' | 'sendPollVote' | 'editMessage' |
  // forwarding messages
  'openForwardMenu' | 'closeForwardMenu' | 'setForwardChatIds' | 'forwardMessages' |
  // global search
  'setGlobalSearchQuery' | 'searchMessagesGlobal' | 'addRecentlyFoundChatId' |
  // message search
  'openMessageTextSearch' | 'closeMessageTextSearch' | 'setMessageSearchQuery' | 'setMessageSearchMediaType' |
  'searchMessages' | 'readMessageContents' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry' | 'loadTopUsers' | 'loadContactList' |
  // misc
  'openMediaViewer' |
  'loadStickerSets' | 'loadRecentStickers' | 'loadStickers' | 'loadSavedGifs' |
  'loadWebPagePreview' | 'clearWebPagePreview'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
