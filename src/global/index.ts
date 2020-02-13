import { addCallback, addReducer, removeCallback } from '../lib/teact/teactn';

import { GlobalState } from './types';

import { throttle } from '../util/schedulers';
import { GLOBAL_STATE_CACHE_DISABLED, GLOBAL_STATE_CACHE_KEY, GRAMJS_SESSION_ID_KEY } from '../config';
import { filterKeys } from '../util/iteratees';

const INITIAL_STATE: GlobalState = {
  showRightColumn: true,
  messageSearch: {
    isTextSearch: false,
  },

  users: {
    byId: {},
  },

  chats: {
    ids: null,
    byId: {},
    scrollOffsetById: {},
    replyingToById: {},
  },

  messages: {
    byChatId: {},
  },

  fileTransfers: {
    byMessageKey: {},
  },

  authRememberMe: true,

  isUiReady: false,

  recentEmojis: [],
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
    chats: reduceChatsForCache(global),
    messages: reduceMessagesForCache(global),
    fileTransfers: { byMessageKey: {} },
    connectionState: undefined,
    lastSyncTime: undefined,
    isUiReady: false,
    messageSearch: { isTextSearch: false },
  };

  const json = JSON.stringify(reducedState);
  localStorage.setItem(GLOBAL_STATE_CACHE_KEY, json);
}

function reduceChatsForCache(global: GlobalState) {
  const byId: GlobalState['chats']['byId'] = {};
  const scrollOffsetById: GlobalState['chats']['scrollOffsetById'] = {};
  const replyingToById: GlobalState['chats']['replyingToById'] = {};

  if (global.chats.ids) {
    global.chats.ids.forEach((id) => {
      byId[id] = global.chats.byId[id];
      scrollOffsetById[id] = global.chats.scrollOffsetById[id];
      replyingToById[id] = global.chats.replyingToById[id];
    });
  }

  return {
    ...global.chats,
    byId,
    scrollOffsetById,
    replyingToById,
  };
}

function reduceMessagesForCache(global: GlobalState) {
  const byChatId: GlobalState['messages']['byChatId'] = {};

  if (global.chats.ids) {
    global.chats.ids.forEach((chatId) => {
      const current = global.messages.byChatId[chatId];
      if (!current || !current.listedIds) {
        return;
      }

      byChatId[chatId] = {
        ...global.messages.byChatId[chatId],
        byId: filterKeys(current.byId, current.listedIds),
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
