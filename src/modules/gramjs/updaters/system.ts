import { TdLibUpdate, TdLibUpdateAuthorizationState } from '../../../api/tdlib/types';

import { getGlobal, setGlobal } from '../../../lib/teactn';
import { GRAMJS_SESSION_ID_KEY } from '../../../config';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateAuthorizationState':
      onUpdateAuthorizationState(update as TdLibUpdateAuthorizationState);
      break;
  }
}

function onUpdateAuthorizationState(update: TdLibUpdateAuthorizationState) {
  const currentState = getGlobal().authState;
  const authState = update.authorization_state['@type'];
  let authError;

  if (currentState === 'authorizationStateWaitCode' && authState === 'authorizationStateWaitCode') {
    authError = 'Invalid Code';
  } else if (currentState === 'authorizationStateWaitPassword' && authState === 'authorizationStateWaitPassword') {
    authError = 'Invalid Password';
  }

  setGlobal({
    ...getGlobal(),
    authState,
    authIsLoading: false,
    authError,
  });

  switch (authState) {
    case 'authorizationStateLoggingOut':
      setGlobal({
        ...getGlobal(),
        isLoggingOut: true,
      });
      break;
    case 'authorizationStateWaitPhoneNumber':
      break;
    case 'authorizationStateWaitCode':
      break;
    case 'authorizationStateWaitPassword':
      break;
    case 'authorizationStateWaitRegistration':
      break;
    case 'authorizationStateReady': {
      const { sessionId } = update;
      if (sessionId && getGlobal().authRememberMe) {
        localStorage.setItem(GRAMJS_SESSION_ID_KEY, sessionId);
      }

      setGlobal({
        ...getGlobal(),
        isLoggingOut: false,
      });

      break;
    }
    default:
      break;
  }
}
