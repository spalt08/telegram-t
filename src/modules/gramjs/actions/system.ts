import { addReducer, getDispatch } from '../../../lib/teact/teactn';

import { GlobalState } from '../../../store/types';
import { GRAMJS_SESSION_ID_KEY } from '../../../config';
import { initSdk, callSdk } from '../../../api/gramjs';
import onUpdate from '../updaters';

addReducer('init', (global: GlobalState) => {
  const sessionId = localStorage.getItem(GRAMJS_SESSION_ID_KEY) || undefined;
  void initSdk(onUpdate, sessionId);

  return {
    ...global,
    authIsSessionRemembered: Boolean(sessionId),
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  void callSdk('provideAuthPhoneNumber', phoneNumber);

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('setAuthCode', (global, actions, payload) => {
  const { code } = payload!;

  void callSdk('provideAuthCode', code);

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('setAuthPassword', (global, actions, payload) => {
  const { password } = payload!;

  void callSdk('provideAuthPassword', password);

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('signUp', (global, actions, payload) => {
  const { firstName, lastName } = payload!;

  void callSdk('provideAuthRegistration', { firstName, lastName });

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('returnToAuthPhoneNumber', () => {
  void callSdk('restartAuth');
});

addReducer('saveSession', (global, actions, payload) => {
  const { sessionId } = payload!;
  localStorage.setItem(GRAMJS_SESSION_ID_KEY, sessionId);
});

addReducer('signOut', () => {
  void signOut();
});

async function signOut() {
  await callSdk('destroy');
  localStorage.removeItem(GRAMJS_SESSION_ID_KEY);

  getDispatch().init();
}
