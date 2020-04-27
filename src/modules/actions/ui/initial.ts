import { addReducer } from '../../../lib/teact/teactn';

import { IS_TOUCH_ENV } from '../../../util/environment';

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

addReducer('setIsUiReady', (global, actions, payload) => {
  const { isUiReady } = payload!;

  return {
    ...global,
    isUiReady,
  };
});

addReducer('init', () => {
  document.body.classList.add(IS_TOUCH_ENV ? 'is-touch-env' : 'is-pointer-env');
});
