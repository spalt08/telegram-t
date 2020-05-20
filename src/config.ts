export const DEBUG = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'perf';
export const DEBUG_ALERT_MSG = 'Shoot!\nSomething went wrong, please see the error details in Dev Tools Console.';
export const DEBUG_GRAMJS = false;

export const GRAMJS_SESSION_ID_KEY = 'GramJs:sessionId';

export const GLOBAL_STATE_CACHE_DISABLED = false;
export const GLOBAL_STATE_CACHE_KEY = 'tt-global-state';

export const MEDIA_CACHE_DISABLED = false;
export const MEDIA_CACHE_NAME = 'tt-media';
export const MEDIA_CACHE_MAX_BYTES = 512000; // 512 KB

const isBigScreen = typeof window !== 'undefined' && window.innerHeight >= 900;

export const MESSAGE_LIST_SENSITIVE_AREA = 750;
export const MESSAGE_LIST_SLICE = isBigScreen ? 50 : 40;
export const MESSAGE_LIST_VIEWPORT_LIMIT = MESSAGE_LIST_SLICE * 3;

export const CHAT_LIST_SLICE = 50;
export const SHARED_MEDIA_SLICE = 30;
export const MESSAGE_SEARCH_SLICE = 30;
export const GLOBAL_SEARCH_SLICE = 20;

export const ANIMATION_SETTINGS_VIEWED_KEY = 'tt-animation-level-settings-viewed';
export const DEFAULT_ANIMATION_LEVEL = 1;
export const FULL_ANIMATION_LEVEL = 2;

export const SUPPORT_BOT_ID = 470000;

export const DRAFT_DEBOUNCE = 10000; // 10s

export const EDITABLE_INPUT_ID = 'editable-message-text';

export const MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN = 1275; // px
export const MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN = 925; // px
export const MOBILE_SCREEN_MAX_WIDTH = 600; // px

export const AUTO_LOAD_MEDIA = true;

export const LOCAL_MESSAGE_ID_BASE = 1e9;
