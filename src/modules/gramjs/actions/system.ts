import {
  addReducer, getGlobal, GlobalState, setGlobal,
} from '../../../lib/teactn';

import { init, provideAuthPhoneNumber, provideAuthCode } from '../../../api/gramjs';
import onUpdate from '../updaters';

addReducer('init', (global: GlobalState) => {
  init(onUpdate);

  return {
    ...global,
    isInitialized: true,
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  void setAuthPhoneNumber(phoneNumber);
});

addReducer('setAuthCode', (global, actions, payload) => {
  const { code } = payload!;

  void provideAuthCode(code);
});

async function setAuthPhoneNumber(phoneNumber: string) {
  setGlobal({
    ...getGlobal(),
    authIsLoading: true,
    authError: undefined,
  });

  try {
    // TODO Not working: API method not handled by `invokeMethod`.
    await provideAuthPhoneNumber(phoneNumber);
  } catch (err) {
    setGlobal({
      ...getGlobal(),
      authError: 'Try Again Later',
    });
  }

  setGlobal({
    ...getGlobal(),
    authIsLoading: false,
  });
}

// addReducer('setPassword', (global, actions, payload) => {
//   const { code } = payload!;
//
//   void provideAuthPassword(code);
// });
//
// addReducer('signOut', () => {
//   void TdLib.send({ '@type': 'logOut' });
// });
