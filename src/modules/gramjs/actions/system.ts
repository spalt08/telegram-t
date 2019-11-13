import { addReducer, GlobalState } from '../../../lib/teactn';

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

  void provideAuthPhoneNumber(phoneNumber);
});

addReducer('setAuthCode', (global, actions, payload) => {
  const { code } = payload!;

  void provideAuthCode(code);
});

// addReducer('setPassword', (global, actions, payload) => {
//   const { code } = payload!;
//
//   void provideAuthPassword(code);
// });
//
// addReducer('signOut', () => {
//   void TdLib.send({ '@type': 'logOut' });
// });
