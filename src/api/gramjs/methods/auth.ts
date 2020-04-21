import { errors } from '../../../lib/gramjs';
import { ApiUpdateAuthorizationState, ApiUpdateAuthorizationStateType, OnApiUpdate } from '../../types';

import { DEBUG } from '../../../config';

const ApiErrors: { [k: string]: string } = {
  PHONE_NUMBER_INVALID: 'Invalid Phone Number',
  PHONE_CODE_INVALID: 'Invalid Code',
  PASSWORD_HASH_INVALID: 'Invalid Password',
};

const authPromiseResolvers: {
  resolvePhoneNumber: null | Function;
  resolveCode: null | Function;
  rejectCode: null | Function;
  resolvePassword: null | Function;
  resolveRegistration: null | Function;
} = {
  resolvePhoneNumber: null,
  resolveCode: null,
  rejectCode: null,
  resolvePassword: null,
  resolveRegistration: null,
};

let onUpdate: OnApiUpdate;

export function init(_onUpdate: OnApiUpdate) {
  onUpdate = _onUpdate;
}

export function onRequestPhoneNumber() {
  onUpdate(buildAuthStateUpdate('authorizationStateWaitPhoneNumber'));

  return new Promise<string>((resolve) => {
    authPromiseResolvers.resolvePhoneNumber = resolve;
  });
}

export function onRequestCode() {
  onUpdate(buildAuthStateUpdate('authorizationStateWaitCode'));

  return new Promise<string>((resolve, reject) => {
    authPromiseResolvers.resolveCode = resolve;
    authPromiseResolvers.rejectCode = reject;
  });
}

export function onRequestPassword() {
  onUpdate(buildAuthStateUpdate('authorizationStateWaitPassword'));

  return new Promise<string>((resolve) => {
    authPromiseResolvers.resolvePassword = resolve;
  });
}

export function onRequestRegistration() {
  onUpdate(buildAuthStateUpdate('authorizationStateWaitRegistration'));

  return new Promise<[string, string?]>((resolve) => {
    authPromiseResolvers.resolveRegistration = resolve;
  });
}

export function onAuthError(err: Error) {
  let message: string;

  if (err instanceof errors.FloodWaitError) {
    const hours = Math.ceil(Number(err.seconds) / 60 / 60);
    message = `Too many attempts. Try again in ${hours > 1 ? `${hours} hours` : 'an hour'}`;
  } else {
    message = ApiErrors[err.message];
  }

  if (!message) {
    message = 'Unexpected Error';

    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  onUpdate({
    '@type': 'updateAuthorizationError',
    message,
  });
}

export function onAuthReady(sessionId: string) {
  onUpdate({
    ...buildAuthStateUpdate('authorizationStateReady'),
    sessionId,
  });
}

export function onCurrentUserId(currentUserId: number) {
  onUpdate({
    '@type': 'updateCurrentUserId',
    currentUserId,
  });
}

export function buildAuthStateUpdate(authorizationState: ApiUpdateAuthorizationStateType): ApiUpdateAuthorizationState {
  return {
    '@type': 'updateAuthorizationState',
    authorizationState,
  };
}

export function provideAuthPhoneNumber(phoneNumber: string) {
  if (!authPromiseResolvers.resolvePhoneNumber) {
    return;
  }

  authPromiseResolvers.resolvePhoneNumber(phoneNumber);
}

export function provideAuthCode(code: string) {
  if (!authPromiseResolvers.resolveCode) {
    return;
  }

  authPromiseResolvers.resolveCode(code);
}

export function provideAuthPassword(password: string) {
  if (!authPromiseResolvers.resolvePassword) {
    return;
  }

  authPromiseResolvers.resolvePassword(password);
}

export function provideAuthRegistration(registration: { firstName: string; lastName: string }) {
  const { firstName, lastName } = registration;

  if (!authPromiseResolvers.resolveRegistration) {
    return;
  }

  authPromiseResolvers.resolveRegistration([firstName, lastName]);
}

export function restartAuth() {
  if (!authPromiseResolvers.rejectCode) {
    return;
  }

  authPromiseResolvers.rejectCode(new Error('RESTART_AUTH'));
}
