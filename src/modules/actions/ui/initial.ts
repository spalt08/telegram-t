import { addReducer } from '../../../lib/teact/teactn';

import { IS_TOUCH_ENV } from '../../../util/environment';

addReducer('init', (global) => {
  const { animationLevel, messageTextSize } = global.settings.byKey;

  document.documentElement.style.setProperty('--message-text-size', `${messageTextSize}px`);
  document.body.classList.add(`animation-level-${animationLevel}`);
  document.body.classList.add(IS_TOUCH_ENV ? 'is-touch-env' : 'is-pointer-env');
});

addReducer('setIsUiReady', (global, actions, payload) => {
  const { uiReadyState } = payload!;

  return {
    ...global,
    uiReadyState,
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  return {
    ...global,
    authPhoneNumber: phoneNumber,
  };
});

addReducer('setAuthRememberMe', (global, actions, payload) => {
  return {
    ...global,
    authRememberMe: Boolean(payload),
  };
});

addReducer('clearAuthError', (global) => {
  return {
    ...global,
    authError: undefined,
  };
});
