export const DEBUG = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'perf';
export const DEBUG_GRAMJS = false;

export const GRAMJS_SESSION_ID_KEY = 'GramJs:sessionId';

export const GLOBAL_STATE_CACHE_DISABLED = false;
export const GLOBAL_STATE_CACHE_KEY = 'tt-global-state';

export const MEDIA_CACHE_DISABLED = false;
export const MEDIA_CACHE_NAME = 'tt-media';

export const MESSAGE_LIST_SENSITIVE_AREA = 1000;
export const MESSAGE_LIST_SLICE = typeof window !== 'undefined' && window.innerHeight < 900 ? 30 : 50;
export const CHAT_LIST_SLICE = 50;
export const SHARED_MEDIA_SLICE = 30;
export const MESSAGE_SEARCH_SLICE = 30;
