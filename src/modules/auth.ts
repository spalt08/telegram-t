import { addReducer, GlobalState } from '../lib/teactn';

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
