import { addCallback, addReducer, removeCallback } from '../lib/teact/teactn';

import { GlobalState } from './types';

import { throttle } from '../util/schedulers';
import {
  DEBUG,
  GLOBAL_STATE_CACHE_DISABLED,
  GLOBAL_STATE_CACHE_KEY,
  GRAMJS_SESSION_ID_KEY,
  MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN,
  MOBILE_SCREEN_MAX_WIDTH,
} from '../config';
import { filterKeys } from '../util/iteratees';

const CACHE_THROTTLE_TIMEOUT = 1000;

const updateCacheThrottled = throttle(updateCache, CACHE_THROTTLE_TIMEOUT, false);

export function initCache() {
  if (GLOBAL_STATE_CACHE_DISABLED) {
    return;
  }

  addReducer('saveSession', () => {
    addCallback(updateCacheThrottled);
  });

  addReducer('signOut', () => {
    removeCallback(updateCacheThrottled);
    localStorage.removeItem(GLOBAL_STATE_CACHE_KEY);
  });
}

export function loadCache(initialState: GlobalState) {
  if (!GLOBAL_STATE_CACHE_DISABLED) {
    const hasActiveSession = localStorage.getItem(GRAMJS_SESSION_ID_KEY);
    if (hasActiveSession) {
      addCallback(updateCacheThrottled);
      return readCache(initialState);
    }
  }

  return undefined;
}

function readCache(initialState: GlobalState) {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.time('global-state-cache-read');
  }

  const json = localStorage.getItem(GLOBAL_STATE_CACHE_KEY);
  const global = json ? JSON.parse(json) as GlobalState : undefined;

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.timeEnd('global-state-cache-read');
  }

  return {
    ...initialState,
    ...global,
  };
}

function updateCache(global: GlobalState) {
  if (global.isLoggingOut) {
    return;
  }

  const reducedGlobal: GlobalState = {
    ...global,
    isChatInfoShown: reduceShowChatInfo(global),
    isLeftColumnShown: true,
    users: reduceUsers(global),
    chats: reduceChats(global),
    connectionState: undefined,
    isUiReady: false,
    lastSyncTime: undefined,
    messages: reduceMessages(global),
    focusedMessage: {},
    fileUploads: { byMessageKey: {} },
    stickers: reduceStickers(global),
    savedGifs: reduceSavedGifs(global),
    globalSearch: {
      recentlyFoundChatIds: global.globalSearch.recentlyFoundChatIds,
    },
    messageSearch: { byChatId: {} },
    mediaViewer: {},
    webPagePreview: undefined,
    forwardMessages: {},
    settings: reduceSettings(global),
    errors: [],
  };

  const json = JSON.stringify(reducedGlobal);
  localStorage.setItem(GLOBAL_STATE_CACHE_KEY, json);
}

function reduceShowChatInfo(global: GlobalState) {
  return window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN
    ? global.isChatInfoShown
    : false;
}

function reduceUsers(global: GlobalState) {
  return window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN
    ? global.users
    : {
      ...global.users,
      selectedId: undefined,
    };
}

function reduceChats(global: GlobalState) {
  return {
    ...global.chats,
    replyingToById: {},
    editingById: {},
    ...(window.innerWidth <= MOBILE_SCREEN_MAX_WIDTH && { selectedId: undefined }),
  };
}

function reduceMessages(global: GlobalState) {
  const byChatId: GlobalState['messages']['byChatId'] = {};

  const savedIds = [
    ...(global.chats.listIds || []),
    ...(global.chats.selectedId ? [global.chats.selectedId] : []),
  ];

  savedIds.forEach((chatId) => {
    const current = global.messages.byChatId[chatId];
    if (!current || !current.viewportIds) {
      return;
    }

    byChatId[chatId] = {
      ...global.messages.byChatId[chatId],
      byId: filterKeys(current.byId, current.viewportIds),
    };
  });

  return {
    ...global.messages,
    byChatId,
  };
}

// Remove `hash` so we can request all MTP entities on next load.
function reduceStickers(global: GlobalState) {
  return {
    all: {
      byId: global.stickers.all.byId,
    },
    recent: {
      stickers: global.stickers.recent.stickers,
    },
  };
}

// Remove `hash` so we can request all MTP entities on next load.
function reduceSavedGifs(global: GlobalState) {
  return {
    gifs: global.savedGifs.gifs,
  };
}

function reduceSettings(global: GlobalState) {
  const { byKey } = global.settings;

  return {
    byKey,
  };
}
