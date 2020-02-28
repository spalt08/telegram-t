import { GLOBAL_STATE_CACHE_KEY } from '../config';

const ERROR_TEXT = `Shoot!
Something went wrong, please see the error details in Dev Tools Console.`;

window.onerror = handleError;
window.addEventListener('unhandledrejection', handleError);

const { NODE_ENV } = process.env;
const STARTUP_TIMEOUT = 5000;

const startedAt = Date.now();
let isReloading = false;

function handleError(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);

  if (isReloading) {
    return;
  }

  // For startup errors, we just clean the cache and refresh the page.
  const hasCache = Boolean(localStorage.getItem(GLOBAL_STATE_CACHE_KEY));
  if (hasCache && Date.now() - startedAt <= STARTUP_TIMEOUT) {
    localStorage.removeItem(GLOBAL_STATE_CACHE_KEY);

    isReloading = true;
    window.location.reload();

    return;
  }

  const error = typeof args[4] === 'object' ? args[4].error : undefined;
  // Parcel bug.
  if (NODE_ENV === 'development' && error && error.message.includes('css-loader.js')) {
    return;
  }

  if (NODE_ENV === 'development' || NODE_ENV === 'staging') {
    // eslint-disable-next-line no-alert
    window.alert(ERROR_TEXT);
  }
}
