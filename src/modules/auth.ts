import { addReducer } from '../lib/teact/teactn';

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
