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
  ApiError,
  ApiFormattedText,
  ApiChatFolder,
} from '../api/types';
import {
  FocusDirection,
  ISettings,
  MediaViewerOrigin,
  ChatCreationProgress,
  ProfileEditProgress,
} from '../types';

export type GlobalState = {
  isChatInfoShown: boolean;
  isStatisticsShown?: boolean;
  isLeftColumnShown: boolean;
  uiReadyState: 0 | 1 | 2;
  connectionState?: ApiUpdateConnectionStateType;
  currentUserId?: number;
  lastSyncTime?: number;

  // TODO Move to `auth`.
  isLoggingOut?: boolean;
  authState?: ApiUpdateAuthorizationStateType;
  authPhoneNumber?: string;
  authIsLoading?: boolean;
  authIsLoadingQrCode?: boolean;
  authError?: string;
  authRememberMe?: boolean;
  authIsSessionRemembered?: boolean;
  authNearestCountry?: string;
  authHint?: string;
  authQrCode?: {
    token: string;
    expires: number;
  };

  contactList?: {
    hash: number;
    userIds: number[];
  };

  users: {
    byId: Record<number, ApiUser>;
    selectedId?: number;
  };

  chats: {
    listIds: {
      active?: number[];
      archived?: number[];
    };
    isFullyLoaded: {
      active?: boolean;
      archived?: boolean;
    };
    orderedPinnedIds: {
      active?: number[];
      archived?: number[];
    };
    totalCount: {
      all?: number;
      archived?: number;
    };
    selectedId?: number;
    // TODO Replace with Partial<Record> to handle missing keys
    byId: Record<number, ApiChat>;
    scrollOffsetById: Record<number, number>;
    replyingToById: Record<number, number | undefined>;
    editingById: Record<number, number | undefined>;
    draftsById: Record<number, ApiFormattedText>;
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

  chatFolders: {
    orderedIds?: number[];
    byId: Record<number, ApiChatFolder>;
    recommended?: ApiChatFolder[];
  };

  focusedMessage?: {
    chatId?: number;
    messageId?: number;
    direction?: FocusDirection;
    noHighlight?: boolean;
  };

  fileUploads: {
    byMessageLocalId: Record<string, {
      progress: number;
    }>;
  };

  recentEmojis: string[];

  stickers: {
    setsById: Record<string, ApiStickerSet>;
    added: {
      hash?: number;
      setIds?: string[];
    };
    recent: {
      hash?: number;
      stickers: ApiSticker[];
    };
    favorite: {
      hash?: number;
      stickers: ApiSticker[];
    };
    featured: {
      hash?: number;
      setIds: string[];
    };
    search: {
      query?: string;
      resultIds?: string[];
    };
  };

  gifs: {
    saved: {
      hash?: number;
      gifs?: ApiVideo[];
    };
    search: {
      query?: string;
      offset?: number;
      results?: ApiVideo[];
    };
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
    avatarOwnerId?: number;
    origin?: MediaViewerOrigin;
  };

  audioPlayer: {
    chatId?: number;
    messageId?: number;
  };

  topPeers: {
    hashes?: Record<string, number>;
    lastRequestedAt?: Record<string, number>;
    users?: ApiUser[];
  };

  webPagePreview?: ApiWebPage;

  forwardMessages: {
    isColumnShown?: boolean;
    fromChatId?: number;
    messageIds?: number[];
    toChatIds?: number[];
    inProgress?: boolean;
  };

  pollResults: {
    chatId?: number;
    messageId?: number;
    voters?: Record<string, number[]>;
    offsets?: Record<string, string>;
  };

  chatCreation?: {
    progress: ChatCreationProgress;
    error?: string;
  };

  profileEdit?: {
    progress: ProfileEditProgress;
    isUsernameAvailable?: boolean;
  };

  settings: {
    byKey: ISettings;
  };

  errors: ApiError[];
};

export type ActionTypes = (
  // system
  'init' | 'initApi' | 'apiUpdate' | 'showError' | 'dismissError' | 'sync' | 'saveSession' | 'afterSync' |
  // ui
  'toggleChatInfo' | 'toggleStatistics' | 'setIsUiReady' | 'addRecentEmoji' | 'addRecentSticker' |
  // auth
  'setAuthPhoneNumber' | 'setAuthCode' | 'setAuthPassword' | 'signUp' | 'returnToAuthPhoneNumber' | 'signOut' |
  'setAuthRememberMe' | 'clearAuthError' | 'uploadProfilePhoto' | 'gotToAuthQrCode' |
  // chats
  'preloadTopChatMessages' | 'loadChats' | 'loadMoreChats' | 'openChat' | 'openChatWithInfo' | 'setChatScrollOffset' |
  'setChatReplyingTo' | 'setChatEditing' | 'editLastChatMessage' | 'openSupportChat' |
  'loadFullChat' | 'loadSuperGroupOnlines' | 'loadTopChats' | 'requestChatUpdate' | 'updateChatMutedState' |
  'joinChannel' | 'leaveChannel' | 'deleteChannel' | 'toggleChatPinned' | 'toggleChatArchived' | 'toggleChatUnread' |
  'loadChatFolders' | 'loadRecommendedChatFolders' | 'editChatFolder' | 'addChatFolder' | 'deleteChatFolder' |
  // messages
  'loadViewportMessages' | 'selectMessage' | 'sendMessage' | 'cancelSendingMessage' | 'pinMessage' | 'deleteMessages' |
  'markChatRead' | 'loadMessage' | 'focusMessage' | 'focusLastMessage' | 'sendPollVote' | 'editMessage' |
  'deleteHistory' |
  // poll result
  'openPollResults' | 'closePollResults' | 'loadPollOptionResults' |
  // forwarding messages
  'openForwardMenu' | 'closeForwardMenu' | 'setForwardChatIds' | 'forwardMessages' |
  // global search
  'setGlobalSearchQuery' | 'searchMessagesGlobal' | 'addRecentlyFoundChatId' |
  // message search
  'openMessageTextSearch' | 'closeMessageTextSearch' | 'setMessageSearchQuery' | 'setMessageSearchMediaType' |
  'searchMessages' | 'markMessagesRead' |
  // users
  'loadFullUser' | 'openUserInfo' | 'loadNearestCountry' | 'loadTopUsers' | 'loadContactList' | 'loadCurrentUser' |
  'updateProfile' | 'checkUsername' |
  // Channel / groups creation
  'createChannel' | 'createGroupChat' | 'resetChatCreation' |
  // settings
  'setSettingOption' |
  // Stickers & GIFs
  'loadStickerSets' | 'loadAddedStickers' | 'loadRecentStickers' | 'loadFavoriteStickers' | 'loadFeaturedStickers' |
  'loadStickers' | 'setStickerSearchQuery' | 'loadSavedGifs' | 'setGifSearchQuery' | 'searchMoreGifs' |
  'faveSticker' | 'unfaveSticker' | 'toggleStickerSet' |
  // misc
  'openMediaViewer' | 'openAudioPlayer' | 'closeAudioPlayer' |
  'loadWebPagePreview' | 'clearWebPagePreview' |
  'saveDraft' | 'clearDraft' | 'loadChatDrafts'
);

export type GlobalActions = Record<ActionTypes, (...args: any[]) => void>;
