import { addCallback, addReducer, removeCallback } from '../lib/teact/teactn';

import { GlobalState } from './types';

import { throttle } from '../util/schedulers';
import {
  DEBUG,
  GLOBAL_STATE_CACHE_CHAT_LIST_LIMIT,
  GLOBAL_STATE_CACHE_DISABLED,
  GLOBAL_STATE_CACHE_KEY,
  GRAMJS_SESSION_ID_KEY,
  MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN,
  MOBILE_SCREEN_MAX_WIDTH,
} from '../config';
import { pick } from '../util/iteratees';

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
    isStatisticsShown: false,
    isLeftColumnShown: true,
    users: reduceUsers(global),
    chats: reduceChats(global),
    connectionState: undefined,
    uiReadyState: 0,
    lastSyncTime: undefined,
    messages: reduceMessages(global),
    focusedMessage: {},
    fileUploads: { byMessageLocalId: {} },
    stickers: reduceStickers(global),
    gifs: reduceGifs(global),
    globalSearch: {
      recentlyFoundChatIds: global.globalSearch.recentlyFoundChatIds,
    },
    messageSearch: { byChatId: {} },
    mediaViewer: {},
    audioPlayer: {},
    webPagePreview: undefined,
    forwardMessages: {},
    chatCreation: undefined,
    profileEdit: undefined,
    settings: reduceSettings(global),
    errors: [],
  };

  const json = JSON.stringify(reducedGlobal);
  localStorage.setItem(GLOBAL_STATE_CACHE_KEY, json);
}

function reduceShowChatInfo(global: GlobalState): boolean {
  return window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN
    ? global.isChatInfoShown
    : false;
}

function reduceUsers(global: GlobalState): GlobalState['users'] {
  return window.innerWidth > MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN
    ? global.users
    : {
      ...global.users,
      selectedId: undefined,
    };
}

function reduceChats(global: GlobalState): GlobalState['chats'] {
  const chatIdsToSave = [
    ...(global.chats.listIds.active || []).slice(0, GLOBAL_STATE_CACHE_CHAT_LIST_LIMIT),
  ];

  return {
    ...global.chats,
    byId: pick(global.chats.byId, chatIdsToSave),
    listIds: {
      active: chatIdsToSave,
    },
    orderedPinnedIds: {
      active: global.chats.orderedPinnedIds.active,
    },
    replyingToById: {},
    editingById: {},
    ...(window.innerWidth <= MOBILE_SCREEN_MAX_WIDTH && { selectedId: undefined }),
  };
}

function reduceMessages(global: GlobalState): GlobalState['messages'] {
  const byChatId: GlobalState['messages']['byChatId'] = {};

  const chatIdsToSave = [
    ...(global.chats.listIds.active || []),
    ...(global.chats.selectedId ? [global.chats.selectedId] : []),
  ];

  chatIdsToSave.forEach((chatId) => {
    const current = global.messages.byChatId[chatId];
    if (!current || !current.viewportIds) {
      return;
    }

    byChatId[chatId] = {
      ...global.messages.byChatId[chatId],
      byId: pick(current.byId, current.viewportIds),
    };
  });

  return {
    ...global.messages,
    byChatId,
  };
}

// Remove `hash` so we can request all MTP entities on next load.
function reduceStickers(global: GlobalState): GlobalState['stickers'] {
  return {
    setsById: pick(global.stickers.setsById, global.stickers.added.setIds),
    added: {
      setIds: global.stickers.added.setIds,
    },
    recent: {
      stickers: global.stickers.recent.stickers,
    },
    favorite: {
      hash: 0,
      stickers: [],
    },
    featured: {
      setIds: [],
    },
    search: {},
  };
}

// Remove `hash` so we can request all MTP entities on next load.
function reduceGifs(global: GlobalState): GlobalState['gifs'] {
  return {
    saved: {
      gifs: global.gifs.saved.gifs,
    },
    search: {},
  };
}

function reduceSettings(global: GlobalState): GlobalState['settings'] {
  const { byKey } = global.settings;

  return {
    byKey,
  };
}
