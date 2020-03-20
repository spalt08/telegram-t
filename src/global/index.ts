import { addCallback, addReducer, removeCallback } from '../lib/teact/teactn';

import { GlobalState } from './types';

import { throttle } from '../util/schedulers';
import { GLOBAL_STATE_CACHE_DISABLED, GLOBAL_STATE_CACHE_KEY, GRAMJS_SESSION_ID_KEY } from '../config';
import { filterKeys } from '../util/iteratees';

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

  fileTransfers: {
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

  savedGifs: {
    gifs: [],
  },

  globalSearch: {},

  messageSearch: {
    byChatId: {},
  },

  topPeers: {},

  mediaViewer: {},

  forwardMessages: {},
};
const CACHE_THROTTLE_TIMEOUT = 1000;

const updateCacheThrottled = throttle(updateCache, CACHE_THROTTLE_TIMEOUT, false);

addReducer('init', () => {
  const hasActiveSession = localStorage.getItem(GRAMJS_SESSION_ID_KEY);
  if (!GLOBAL_STATE_CACHE_DISABLED && hasActiveSession) {
    addCallback(updateCacheThrottled);

    const cached = getCache();
    if (cached) {
      return cached;
    }
  }

  return INITIAL_STATE;
});

if (!GLOBAL_STATE_CACHE_DISABLED) {
  addReducer('saveSession', () => {
    addCallback(updateCacheThrottled);
  });

  addReducer('signOut', () => {
    removeCallback(updateCacheThrottled);
    localStorage.removeItem(GLOBAL_STATE_CACHE_KEY);
  });
}

function updateCache(global: GlobalState) {
  if (global.isLoggingOut) {
    return;
  }

  const reducedState: GlobalState = {
    ...global,
    chats: {
      ...global.chats,
      replyingToById: {},
      editingById: {},
    },
    connectionState: undefined,
    isUiReady: false,
    lastSyncTime: undefined,
    messages: reduceMessagesForCache(global),
    fileTransfers: { byMessageKey: {} },
    stickers: {
      all: {
        byId: {},
      },
      recent: {
        stickers: [],
      },
    },
    savedGifs: {
      gifs: [],
    },
    globalSearch: {
      recentlyFoundChatIds: global.globalSearch.recentlyFoundChatIds,
    },
    messageSearch: { byChatId: {} },
    mediaViewer: {},
    webPagePreview: undefined,
    forwardMessages: {},
  };

  const json = JSON.stringify(reducedState);
  localStorage.setItem(GLOBAL_STATE_CACHE_KEY, json);
}

function reduceMessagesForCache(global: GlobalState) {
  const byChatId: GlobalState['messages']['byChatId'] = {};

  if (global.chats.listIds) {
    global.chats.listIds.forEach((chatId) => {
      const current = global.messages.byChatId[chatId];
      if (!current || !current.viewportIds) {
        return;
      }

      byChatId[chatId] = {
        ...global.messages.byChatId[chatId],
        byId: filterKeys(current.byId, current.viewportIds),
      };
    });
  }

  return {
    ...global.messages,
    byChatId,
  };
}

function getCache(): GlobalState | null {
  const json = localStorage.getItem(GLOBAL_STATE_CACHE_KEY);
  return json ? JSON.parse(json) : null;
}
