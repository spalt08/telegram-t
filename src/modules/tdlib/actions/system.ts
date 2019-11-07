import { addReducer } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';

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
