import {
  addCallback, addReducer, removeCallback, setGlobal,
} from '../lib/teactn';

import { GlobalState } from './types';

import { throttle } from '../util/schedulers';
import { GRAMJS_SESSION_ID_KEY } from '../config';

const INITIAL_STATE: GlobalState = {
  isInitialized: false,
  showRightColumn: true,

  users: {
    byId: {},
  },

  chats: {
    ids: [],
    byId: {},
    scrollOffsetById: {},
  },

  groups: {
    ids: [],
    byId: {},
  },

  messages: {
    byChatId: {},
  },

  files: {
    byKey: {},
  },

  authRememberMe: true,
};
const CACHE_KEY = 'globalState';
const CACHE_THROTTLE_TIMEOUT = 1000;

addReducer('init', () => {
  const hasActiveSession = localStorage.getItem(GRAMJS_SESSION_ID_KEY);
  const cached = (hasActiveSession && getCache()) || null;
  setGlobal(cached || INITIAL_STATE);
});

const updateCacheThrottled = throttle(updateCache, CACHE_THROTTLE_TIMEOUT, false);

addReducer('saveSession', () => {
  addCallback(updateCacheThrottled);
});

addReducer('signOut', () => {
  removeCallback(updateCacheThrottled);
  localStorage.removeItem(CACHE_KEY);
});

function updateCache(state: GlobalState) {
  if (state.isLoggingOut) {
    return;
  }

  const byId: GlobalState['chats']['byId'] = {};
  const scrollOffsetById: GlobalState['chats']['scrollOffsetById'] = {};
  state.chats.ids.forEach((id) => {
    byId[id] = state.chats.byId[id];
    scrollOffsetById[id] = state.chats.scrollOffsetById[id];
  });
  const reducedState: GlobalState = {
    ...state,
    chats: reduceChatsForCache(state),
    messages: reduceMessagesForCache(state),
    // TODO Reduce `users` and `groups`?
    files: { byKey: {} },
  };

  const json = JSON.stringify(reducedState);
  localStorage.setItem(CACHE_KEY, json);
}

function reduceChatsForCache(state: GlobalState) {
  const byId: GlobalState['chats']['byId'] = {};
  const scrollOffsetById: GlobalState['chats']['scrollOffsetById'] = {};
  state.chats.ids.forEach((id) => {
    byId[id] = state.chats.byId[id];
    scrollOffsetById[id] = state.chats.scrollOffsetById[id];
  });

  return {
    ...state.chats,
    byId,
    scrollOffsetById,
  };
}

function reduceMessagesForCache(state: GlobalState) {
  const byChatId: GlobalState['messages']['byChatId'] = {};
  state.chats.ids.forEach((chatId) => {
    byChatId[chatId] = state.messages.byChatId[chatId];
  });

  return { byChatId };
}

function getCache(): GlobalState | null {
  const json = localStorage.getItem(CACHE_KEY);
  return json ? JSON.parse(json) : null;
}
