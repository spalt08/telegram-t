import {
  Sdk,
  SdkArgs,
  SdkResponse,
  OriginMessageEvent,
  WorkerMessageData,
} from './types';
import { ApiUpdate } from '../types';

import { init as initUpdater } from './onGramJsUpdate';
import { init as initAuth } from './connectors/auth';
import { init as initChats } from './connectors/chats';
import { init as initMessages } from './connectors/messages';
import { init as initUsers } from './connectors/users';
import { init as initClient } from './client';
import sdk from './sdk';

onmessage = async (message: OriginMessageEvent) => {
  const { data } = message;

  switch (data.type) {
    case 'init': {
      await initSdk(data.args.sessionId);
      break;
    }
    case 'callSdk': {
      const { messageId, name, args } = data;
      try {
        const response = await callSdk(name, args);

        if (messageId) {
          sendToOrigin({
            type: 'sdkResponse',
            messageId,
            response,
          });
        }
      } catch (error) {
        if (messageId) {
          sendToOrigin({
            type: 'sdkResponse',
            messageId,
            error,
          });
        }
      }
      break;
    }
  }
};

async function initSdk(sessionId = '') {
  initUpdater(onUpdate);
  initAuth(onUpdate);
  initChats(onUpdate);
  initMessages(onUpdate);
  initUsers(onUpdate);

  await initClient(sessionId);
}

function callSdk<T extends keyof Sdk>(fnName: T, args: SdkArgs<T>): SdkResponse<T> {
  return sdk[fnName](args as any) as SdkResponse<T>;
}

function onUpdate(update: ApiUpdate) {
  sendToOrigin({
    type: 'update',
    update,
  });
}

function sendToOrigin(data: WorkerMessageData) {
  postMessage(data);
}
