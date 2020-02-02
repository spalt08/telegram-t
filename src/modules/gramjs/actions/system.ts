import { addReducer, getDispatch } from '../../../lib/teact/teactn';

import { GlobalState } from '../../../store/types';
import { GRAMJS_SESSION_ID_KEY } from '../../../config';
import { initApi, callApi } from '../../../api/gramjs';
import onUpdate from '../updaters';

addReducer('init', (global: GlobalState) => {
  const sessionId = localStorage.getItem(GRAMJS_SESSION_ID_KEY) || undefined;
  void initApi(onUpdate, sessionId);

  return {
    ...global,
    authIsSessionRemembered: Boolean(sessionId),
  };
});

addReducer('setAuthPhoneNumber', (global, actions, payload) => {
  const { phoneNumber } = payload!;

  void callApi('provideAuthPhoneNumber', phoneNumber);

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('setAuthCode', (global, actions, payload) => {
  const { code } = payload!;

  void callApi('provideAuthCode', code);

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('setAuthPassword', (global, actions, payload) => {
  const { password } = payload!;

  void callApi('provideAuthPassword', password);

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('signUp', (global, actions, payload) => {
  const { firstName, lastName } = payload!;

  void callApi('provideAuthRegistration', { firstName, lastName });

  return {
    ...global,
    authIsLoading: true,
    authError: undefined,
  };
});

addReducer('returnToAuthPhoneNumber', (global) => {
  void callApi('restartAuth');

  return {
    ...global,
    authError: undefined,
  };
});

addReducer('saveSession', (global, actions, payload) => {
  const { sessionId } = payload!;
  localStorage.setItem(GRAMJS_SESSION_ID_KEY, sessionId);
});

addReducer('signOut', () => {
  void signOut();
});

async function signOut() {
  await callApi('destroy');
  localStorage.removeItem(GRAMJS_SESSION_ID_KEY);

  getDispatch().init();
}
