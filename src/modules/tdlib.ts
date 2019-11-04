import { addReducer, getGlobal, GlobalState, updateGlobal } from '../lib/reactnt';
import * as TdLib from '../api/tdlib';
import { TdLibUpdate, TdLibUpdateAuthorizationState } from '../api/tdlib/updates';

addReducer('init', (global: GlobalState) => {
  TdLib.init(onUpdate);

  return {
    global,
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

function onUpdate(update: TdLibUpdate) {
  console.log('[TdLib] UPDATE', { update });

  switch (update['@type']) {
    case 'updateAuthorizationState':
      onUpdateAuthorizationState(update);
      break;
  }
}

function onUpdateAuthorizationState(update: TdLibUpdateAuthorizationState) {
  updateGlobal({ authState: update.authorization_state['@type'] });

  switch (update.authorization_state['@type']) {
    case 'authorizationStateLoggingOut':
      updateGlobal({ isLoggingOut: true });
      break;
    case 'authorizationStateWaitTdlibParameters':
      TdLib.sendParameters();
      break;
    case 'authorizationStateWaitEncryptionKey':
      TdLib.send({ '@type': 'checkDatabaseEncryptionKey' });
      break;
    case 'authorizationStateWaitPhoneNumber':
      break;
    case 'authorizationStateWaitCode':
      break;
    case 'authorizationStateWaitPassword':
      break;
    case 'authorizationStateReady':
      updateGlobal({ isLoggingOut: false });
      break;
    case 'authorizationStateClosing':
      break;
    case 'authorizationStateClosed':
      if (!getGlobal().isLoggingOut) {
        document.title += ': Zzz…';
        // this.emit('clientUpdateAppInactive');
      } else {
        TdLib.init(onUpdate);
      }
      break;
    default:
      break;
  }
}
