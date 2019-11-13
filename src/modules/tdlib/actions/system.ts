import { addReducer, GlobalState } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';
import onUpdate from '../updaters';

addReducer('init', (global: GlobalState) => {
  TdLib.init(onUpdate);

  return {
    ...global,
    isInitialized: true,
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  void TdLib.send({
    '@type': 'setAuthenticationPhoneNumber',
    phone_number: phoneNumber,
  });
});

addReducer('setAuthCode', (global, actions, payload) => {
  const { code } = payload!;

  void TdLib.send({
    '@type': 'checkAuthenticationCode',
    code,
  });
});

addReducer('signOut', () => {
  void TdLib.send({ '@type': 'logOut' });
});
