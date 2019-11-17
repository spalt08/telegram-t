import {
  addReducer, getDispatch, getGlobal, setGlobal,
} from '../../../lib/teactn';

import { GlobalState } from '../../../store/types';
import { GRAMJS_SESSION_ID_KEY } from '../../../config';
import {
  init, provideAuthPhoneNumber, provideAuthCode, provideAuthPassword,
} from '../../../api/gramjs';
import onUpdate from '../updaters';

addReducer('init', (global: GlobalState) => {
  const sessionId = localStorage.getItem(GRAMJS_SESSION_ID_KEY) || '';
  init(onUpdate, sessionId);

  return {
    ...global,
    isInitialized: true,
    authIsSessionRemembered: Boolean(sessionId),
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

addReducer('setAuthPassword', (global, actions, payload) => {
  const { password } = payload!;

  void provideAuthPassword(password);
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

addReducer('signOut', () => {
  localStorage.removeItem(GRAMJS_SESSION_ID_KEY);

  getDispatch().init();
});
