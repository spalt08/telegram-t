import { ApiUpdate, ApiUpdateAuthorizationState } from '../../../api/types';

import { getGlobal, setGlobal } from '../../../lib/teactn';
import { GRAMJS_SESSION_ID_KEY } from '../../../config';

export function onUpdate(update: ApiUpdate) {
  switch (update['@type']) {
    case 'updateAuthorizationState':
      onUpdateAuthorizationState(update);
      break;
  }
}

function onUpdateAuthorizationState(update: ApiUpdateAuthorizationState) {
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
      const { session_id } = update;
      if (session_id && getGlobal().authRememberMe) {
        localStorage.setItem(GRAMJS_SESSION_ID_KEY, session_id);
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
