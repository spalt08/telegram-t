import { addReducer } from '../lib/teact/teactn';

import { GlobalState } from './types';

import { DEFAULT_ANIMATION_LEVEL } from '../config';
import { initCache, loadCache } from './cache';

const INITIAL_STATE: GlobalState = {
  showChatInfo: true,
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
  return loadCache() || INITIAL_STATE;
});
