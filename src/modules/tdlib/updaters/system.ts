import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import { ApiUpdate } from '../../../api/types';
import { TdLibUpdate, TdLibUpdateAuthorizationState } from '../../../api/tdlib/types/updates';

import * as TdLib from '../../../api/tdlib';
import { TDLIB_SESSION_ID_KEY } from '../../../config';

export function onUpdate(update: ApiUpdate | TdLibUpdate) {
  switch (update['@type']) {
    case 'updateAuthorizationState':
      onUpdateAuthorizationState(update);
      break;
  }
}

function onUpdateAuthorizationState(update: TdLibUpdateAuthorizationState) {
  setGlobal({
    ...getGlobal(),
    authState: update.authorization_state['@type'],
  });

  switch (update.authorization_state['@type']) {
    case 'authorizationStateLoggingOut':
      setGlobal({
        ...getGlobal(),
        isLoggingOut: true,
      });
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
    case 'authorizationStateWaitRegistration':
      break;
    case 'authorizationStateReady':
      // TODO Respect "Remember Me" and get session from TdLib.
      localStorage.setItem(TDLIB_SESSION_ID_KEY, 'STORED IN TDLIB');

      setGlobal({
        ...getGlobal(),
        isLoggingOut: false,
      });
      break;
    case 'authorizationStateClosing':
      break;
    case 'authorizationStateClosed':
      if (!getGlobal().isLoggingOut) {
        document.title += ': Zzz…';
      } else {
        getDispatch().init();
      }
      break;
    default:
      break;
  }
}
