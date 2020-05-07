import {
  addReducer, getGlobal, setGlobal,
} from '../../../lib/teact/teactn';

import { GlobalState } from '../../../global/types';

import { ANIMATION_SETTINGS_VIEWED_KEY } from '../../../config';
import { initApi, callApi } from '../../../api/gramjs';

addReducer('initApi', (global: GlobalState, actions) => {
  const isAnimationLevelSettingViewed = Boolean(localStorage.getItem(ANIMATION_SETTINGS_VIEWED_KEY));

  void initApi(actions.apiUpdate);

  return {
    ...global,
    authIsSessionRemembered: true,
    settings: {
      ...global.settings,
      isAnimationLevelSettingViewed,
    },
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

addReducer('uploadProfilePhoto', (global, actions, payload) => {
  const { file } = payload!;

  void callApi('uploadProfilePhoto', file);
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

addReducer('signOut', () => {
  void signOut();
});

function signOut() {
  // eslint-disable-next-line no-alert
  window.alert('Not Allowed');
}

addReducer('loadNearestCountry', (global) => {
  const { connectionState } = global;

  if (connectionState === 'connectionStateReady') {
    void loadNearestCountry();
  }
});

async function loadNearestCountry() {
  const authNearestCountry = await callApi('fetchNearestCountry');
  setGlobal({
    ...getGlobal(),
    authNearestCountry,
  });
}
