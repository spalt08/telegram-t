import { addReducer } from '../lib/teactn';

import { GlobalState } from '../store/types';

addReducer('returnToAuthPhoneNumber', (global: GlobalState) => {
  return {
    ...global,
    authState: 'authorizationStateWaitPhoneNumber',
  };
});

addReducer('setAuthRememberMe', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  return {
    ...global,
    authPhoneNumber: phoneNumber,
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  return {
    ...global,
    authShouldRememberMe: Boolean(payload),
  };
});
