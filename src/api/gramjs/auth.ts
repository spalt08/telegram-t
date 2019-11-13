import { OnUpdate } from './types';
import { UpdateAuthorizationStateType } from '../tdlib/types';

let onUpdate: OnUpdate;

const authPromiseResolvers: {
  resolvePhoneNumber: null | Function,
  resolveCode: null | Function,
  resolvePassword: null | Function,
} = {
  resolvePhoneNumber: null,
  resolveCode: null,
  resolvePassword: null,
};

export function provideUpdater(_onUpdate: OnUpdate) {
  onUpdate = _onUpdate;
}

export function onRequestPhoneNumber() {
  if (!onUpdate) {
    return;
  }

  const authState: UpdateAuthorizationStateType = 'authorizationStateWaitPhoneNumber';
  onUpdate({ '@type': 'authState', authState });

  return new Promise((resolve) => {
    authPromiseResolvers.resolvePhoneNumber = resolve;
  });
}

export function onRequestCode() {
  if (!onUpdate) {
    return;
  }

  const authState: UpdateAuthorizationStateType = 'authorizationStateWaitCode';
  onUpdate({ '@type': 'authState', authState });

  return new Promise((resolve) => {
    authPromiseResolvers.resolveCode = resolve;
  });
}

export function onRequestPassword() {
  if (!onUpdate) {
    return;
  }
  return new Promise((resolve) => {
    authPromiseResolvers.resolvePassword = resolve;
  });
}

export function onReady() {
  if (!onUpdate) {
    return;
  }

  const authState: UpdateAuthorizationStateType = 'authorizationStateReady';
  onUpdate({ '@type': 'authState', authState });

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
