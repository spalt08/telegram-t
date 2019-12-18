import { OnApiUpdate } from '../types';
import {
  Sdk, SdkArgs, SdkResponse,
} from './types';

import { init as initUpdater } from './onGramJsUpdate';
import { init as initAuth } from './connectors/auth';
import { init as initChats } from './connectors/chats';
import { init as initMessages } from './connectors/messages';
import { init as initClient } from './client';
import sdk from './sdk';

export async function initSdk(onUpdate: OnApiUpdate, sessionId = '') {
  initUpdater(onUpdate);
  initAuth(onUpdate);
  initChats(onUpdate);
  initMessages(onUpdate);

  await initClient(sessionId);
}

export function callSdk<T extends keyof Sdk>(fnName: T, args: SdkArgs<T>): SdkResponse<T> {
  return sdk[fnName](args as any) as SdkResponse<T>;
}
