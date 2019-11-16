import { addReducer, getGlobal, setGlobal } from '../../../lib/teactn';

import { GlobalState } from '../../../store/types';
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
  const { authShouldRememberMe } = global;


  void setAuthPhoneNumber(phoneNumber, authShouldRememberMe);
});

addReducer('setAuthCode', (global, actions, payload) => {
  const { code } = payload!;

  void setAuthCode(code);
});

addReducer('setAuthPassword', (global, actions, payload) => {
  const { password } = payload!;

  void setAuthPassword(password);
});

addReducer('signUp', (global, actions, payload) => {
  const { firstName, lastName } = payload!;

  void signUp(firstName, lastName);
});

addReducer('signOut', () => {
  void TdLib.send({ '@type': 'logOut' });

  return {
    ...getGlobal(),
  };
});

async function setAuthPhoneNumber(phoneNumber: string, authShouldRememberMe = false) {
  setGlobal({
    ...getGlobal(),
    authIsLoading: true,
    authError: undefined,
  });

  await TdLib.send({
    '@type': 'setAuthenticationPhoneNumber',
    phone_number: phoneNumber,
    // TODO Not implemented.
    authShouldRememberMe,
  }, () => {
    setGlobal({
      ...getGlobal(),
      authError: 'Try Again Later',
    });
  });

  setGlobal({
    ...getGlobal(),
    authIsLoading: false,
  });
}

async function setAuthCode(code: string) {
  setGlobal({
    ...getGlobal(),
    authIsLoading: true,
    authError: undefined,
  });

  await TdLib.send({
    '@type': 'checkAuthenticationCode',
    code,
  }, () => {
    setGlobal({
      ...getGlobal(),
      authError: 'Invalid Code',
    });
  });

  setGlobal({
    ...getGlobal(),
    authIsLoading: false,
  });
}

async function setAuthPassword(password: string) {
  setGlobal({
    ...getGlobal(),
    authIsLoading: true,
    authError: undefined,
  });

  await TdLib.send({
    '@type': 'checkAuthenticationPassword',
    password,
  }, () => {
    setGlobal({
      ...getGlobal(),
      authError: 'Invalid Password',
    });
  });

  setGlobal({
    ...getGlobal(),
    authIsLoading: false,
  });
}

async function signUp(firstName: string, lastName: string) {
  setGlobal({
    ...getGlobal(),
    authIsLoading: true,
    authError: undefined,
  });

  // TODO Support avatar.
  await TdLib.send({
    '@type': 'registerUser',
    first_name: firstName,
    last_name: lastName,
  }, () => {
    setGlobal({
      ...getGlobal(),
      authError: 'Registration Error',
    });
  });

  setGlobal({
    ...getGlobal(),
    authIsLoading: false,
  });
}
