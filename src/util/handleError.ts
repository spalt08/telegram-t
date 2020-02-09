import { GLOBAL_STATE_CACHE_KEY, GRAMJS_SESSION_ID_KEY } from '../config';

const ERROR_TEXT = `Shoot!
Something went wrong and we need to refresh the app.

Do you want to also re-login?
Confirm if it happens constantly.`;

if (process.env.NODE_ENV !== 'development') {
  window.onerror = handleError;
  window.addEventListener('unhandledrejection', handleError);
}

let isReloading = false;

function handleError(...args: any[]) {
  // eslint-disable-next-line no-console
  console.error(...args);

  if (isReloading) {
    return;
  }

  // eslint-disable-next-line no-alert
  if (window.confirm(ERROR_TEXT)) {
    localStorage.removeItem(GRAMJS_SESSION_ID_KEY);
  }

  localStorage.removeItem(GLOBAL_STATE_CACHE_KEY);

  isReloading = true;
  window.location.reload();
}
