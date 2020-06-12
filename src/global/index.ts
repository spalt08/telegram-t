import { addReducer } from '../lib/teact/teactn';

import { GlobalState } from './types';

import {
  DEFAULT_ANIMATION_LEVEL,
  DEFAULT_MESSAGE_TEXT_SIZE_PX,
} from '../config';
import { initCache, loadCache } from './cache';

const INITIAL_STATE: GlobalState = {
  isLeftColumnShown: true,
  isChatInfoShown: false,
  uiReadyState: 0,

  authRememberMe: true,

  users: {
    byId: {},
  },

  chats: {
    listIds: {},
    orderedPinnedIds: {},
    totalCount: {},
    byId: {},
    scrollOffsetById: {},
    replyingToById: {},
    editingById: {},
    draftsById: {},
  },

  messages: {
    byChatId: {},
  },

  chatFolders: {
    byId: {},
  },

  fileUploads: {
    byMessageLocalId: {},
  },

  recentEmojis: ['grinning', 'kissing_heart', 'christmas_tree', 'brain', 'trophy'],

  stickers: {
    setsById: {},
    added: {
      setIds: [],
    },
    recent: {
      stickers: [],
    },
    favorite: {
      stickers: [],
    },
    featured: {
      setIds: [],
    },
    search: {},
  },

  gifs: {
    saved: {},
    search: {},
  },

  globalSearch: {},

  messageSearch: {
    byChatId: {},
  },

  topPeers: {},

  mediaViewer: {},

  audioPlayer: {},

  forwardMessages: {},

  settings: {
    byKey: {
      animationLevel: DEFAULT_ANIMATION_LEVEL,
      messageTextSize: DEFAULT_MESSAGE_TEXT_SIZE_PX,
      messageSendKeyCombo: 'enter',
      language: 'en',
    },
  },

  errors: [],
};

initCache();

addReducer('init', () => {
  return loadCache(INITIAL_STATE) || INITIAL_STATE;
});
