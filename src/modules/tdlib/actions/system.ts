import { addReducer, GlobalState, setGlobal } from '../../../lib/teactn';

import * as TdLib from '../../../api/tdlib';
import onUpdate from '../updaters';

addReducer('init', (global: GlobalState) => {
  TdLib.init(onUpdate);

  return {
    ...global,
    isInitialized: true,
  };
});

addReducer('returnToAuthPhoneNumber', (global: GlobalState) => {
  return {
    ...global,
    authState: 'authorizationStateWaitPhoneNumber',
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
  }, () => {
    setGlobal({
      ...global,
      authError: 'Invalid Code',
    });
  });
});

addReducer('setAuthPassword', (global, actions, payload) => {
  const { password } = payload!;

  void TdLib.send({
    '@type': 'checkAuthenticationPassword',
    password,
  }, () => {
    setGlobal({
      ...global,
      authError: 'Invalid Password',
    });
  });
});

addReducer('signUp', (global, actions, payload) => {
  const { firstName, lastName } = payload!;

  // TODO Support avatar.
  TdLib.send({
    '@type': 'registerUser',
    first_name: firstName,
    last_name: lastName,
  });
});

addReducer('signOut', (global) => {
  void TdLib.send({ '@type': 'logOut' });

  setGlobal({
    ...global,
    authError: undefined,
  });
});
