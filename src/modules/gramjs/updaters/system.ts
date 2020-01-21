import { getDispatch, getGlobal, setGlobal } from '../../../lib/teact/teactn';

import {
  ApiUpdate,
  ApiUpdateAuthorizationState,
  ApiUpdateAuthorizationError,
  ApiUpdateConnectionState,
} from '../../../api/types';

export function onUpdate(update: ApiUpdate) {
  switch (update['@type']) {
    case 'updateAuthorizationState':
      onUpdateAuthorizationState(update);
      break;

    case 'updateAuthorizationError':
      onUpdateAuthorizationError(update);
      break;

    case 'updateConnectionState':
      onUpdateConnectionState(update);
      break;
  }
}

function onUpdateAuthorizationState(update: ApiUpdateAuthorizationState) {
  const global = getGlobal();
  const authState = update.authorization_state['@type'];

  setGlobal({
    ...global,
    authState,
    authIsLoading: false,
  });

  if (global.authState === authState) {
    return;
  }

  switch (authState) {
    case 'authorizationStateLoggingOut':
      setGlobal({
        ...getGlobal(),
        isLoggingOut: true,
      });
      break;
    case 'authorizationStateReady': {
      setGlobal({
        ...getGlobal(),
        isLoggingOut: false,
      });

      const { session_id } = update;
      if (session_id && getGlobal().authRememberMe) {
        getDispatch().saveSession({ sessionId: session_id });
      }

      onConnect();

      break;
    }
  }
}

function onUpdateAuthorizationError(update: ApiUpdateAuthorizationError) {
  setGlobal({
    ...getGlobal(),
    authError: update.message,
  });
}

function onUpdateConnectionState(update: ApiUpdateConnectionState) {
  const connectionState = update.connection_state['@type'];

  setGlobal({
    ...getGlobal(),
    connectionState,
  });

  switch (connectionState) {
    case 'connectionStateReady': {
      onConnect();

      break;
    }
    default:
      break;
  }
}

function onConnect() {
  const { connectionState, authState } = getGlobal();
  if (connectionState === 'connectionStateReady' && authState === 'authorizationStateReady') {
    getDispatch().sync();
  }
}
