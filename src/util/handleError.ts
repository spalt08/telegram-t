import { DEBUG_ALERT_MSG, GLOBAL_STATE_CACHE_KEY, GRAMJS_SESSION_ID_KEY } from '../config';

window.onerror = handleError;
window.addEventListener('unhandledrejection', handleError);

// eslint-disable-next-line prefer-destructuring
const APP_ENV = process.env.APP_ENV;
const STARTUP_TIMEOUT = 5000;

const startedAt = Date.now();
let isReloading = false;

function handleError(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);

  if (isReloading) {
    return;
  }

  // For startup errors, we just clean the cache or the session and refresh the page.
  if (Date.now() - startedAt <= STARTUP_TIMEOUT) {
    if (localStorage.getItem(GLOBAL_STATE_CACHE_KEY)) {
      localStorage.removeItem(GLOBAL_STATE_CACHE_KEY);
    } else if (localStorage.getItem(GRAMJS_SESSION_ID_KEY)) {
      localStorage.removeItem(GRAMJS_SESSION_ID_KEY);
    } else {
      return;
    }

    isReloading = true;
    window.location.reload();

    return;
  }

  const error = typeof args[4] === 'object' ? args[4].error : undefined;
  // Parcel bug.
  if (APP_ENV === 'development' && error && error.message.includes('css-loader.js')) {
    return;
  }

  if (APP_ENV === 'development' || APP_ENV === 'staging') {
    // eslint-disable-next-line no-alert
    window.alert(DEBUG_ALERT_MSG);
  }
}
