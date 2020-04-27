import { addReducer } from '../lib/teact/teactn';

import { GlobalState } from './types';

import { DEFAULT_ANIMATION_LEVEL, MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN } from '../config';
import { initCache, loadCache } from './cache';

const INITIAL_STATE: GlobalState = {
  isChatInfoShown: window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN,
  isLeftColumnShown: true,
  isUiReady: false,

  authRememberMe: true,

  users: {
    byId: {},
  },

  chats: {
    byId: {},
    scrollOffsetById: {},
    replyingToById: {},
    editingById: {},
    draftsById: {},
  },

  messages: {
    byChatId: {},
  },

  fileUploads: {
    byMessageKey: {},
  },

  recentEmojis: ['grinning', 'kissing_heart', 'christmas_tree', 'brain', 'trophy'],

  stickers: {
    all: {
      byId: {},
    },
    recent: {
      stickers: [],
    },
  },

  savedGifs: {},

  globalSearch: {},

  messageSearch: {
    byChatId: {},
  },

  topPeers: {},

  mediaViewer: {},

  forwardMessages: {},

  settings: {
    byKey: {
      animationLevel: DEFAULT_ANIMATION_LEVEL,
    },
  },

  errors: [],
};

initCache();

addReducer('init', () => {
  return loadCache(INITIAL_STATE) || INITIAL_STATE;
});
