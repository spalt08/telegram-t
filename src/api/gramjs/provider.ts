import { ApiOnProgress, OnApiUpdate } from '../types';
import { Methods, MethodArgs, MethodResponse } from './methods/types';

import { init as initUpdater } from './updater';
import { init as initAuth } from './methods/auth';
import { init as initChats } from './methods/chats';
import { init as initMessages } from './methods/messages';
import { init as initUsers } from './methods/users';
import { init as initClient } from './methods/client';
import methods from './methods';

export async function initApi(onUpdate: OnApiUpdate, sessionId = '') {
  initUpdater(onUpdate);
  initAuth(onUpdate);
  initChats(onUpdate);
  initMessages(onUpdate);
  initUsers(onUpdate);

  await initClient(sessionId);
}

export function callApi<T extends keyof Methods>(fnName: T, ...args: MethodArgs<T>): MethodResponse<T> {
  // @ts-ignore
  return methods[fnName](...args) as MethodResponse<T>;
}

export function cancelApiProgress(progressCallback: ApiOnProgress) {
  progressCallback.isCanceled = true;
}
