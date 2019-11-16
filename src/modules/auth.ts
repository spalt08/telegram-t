import { addReducer } from '../lib/teactn';

import { GlobalState } from '../store/types';

addReducer('returnToAuthPhoneNumber', (global: GlobalState) => {
  return {
    ...global,
    authState: 'authorizationStateWaitPhoneNumber',
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
