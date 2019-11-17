import {
  OnUpdate, OriginMessageData, WorkerMessageEvent, WorkerMessageResponse,
} from './types/types';

import { init as initAuth } from './methods/auth';
import { init as initChats } from './methods/chats';
import { init as initMessages } from './methods/messages';
import { init as initFiles } from './methods/files';
import { onGramJsUpdate } from './updaters';
import generateIdFor from '../../util/generateIdFor';

type WorkerPromiseStore = {
  promise: Promise<WorkerMessageResponse>;
  resolve: Function;
  reject: Function;
};

const worker = new Worker('./gramjs.worker.ts');
const workerPromises: Record<string, WorkerPromiseStore> = {};

function sendToWorker(message: OriginMessageData, shouldWaitForResponse = false) {
  if (!shouldWaitForResponse) {
    worker.postMessage(message);
    return null;
  }

  const messageId = generateIdFor(workerPromises);

  workerPromises[messageId] = {} as WorkerPromiseStore;
  workerPromises[messageId].promise = new Promise((resolve, reject) => {
    Object.assign(workerPromises[messageId], { resolve, reject });
  });

  workerPromises[messageId].promise.then(
    () => {
      delete workerPromises[messageId];
    },
    () => {
      delete workerPromises[messageId];
    },
  );

  worker.postMessage({
    messageId,
    ...message,
  });

  return workerPromises[messageId].promise;
}

export function init(onUpdate: OnUpdate, sessionId = '') {
  sendToWorker({
    type: 'init',
    sessionId,
  });

  worker.onmessage = (({ data }: WorkerMessageEvent) => {
    if (data.type === 'apiUpdate') {
      onUpdate(data.update);
    } else if (data.type === 'gramJsUpdate') {
      onGramJsUpdate(data, onUpdate);
    } else if (data.type === 'invokeResponse') {
      if (data.messageId && workerPromises[data.messageId]) {
        if (data.result) {
          workerPromises[data.messageId].resolve(data.result);
        } else if (data.error) {
          workerPromises[data.messageId].reject(data.error);
        }
      }
    }
  });

  initAuth(sendToWorker);
  initChats(sendToWorker, onUpdate);
  initMessages(sendToWorker, onUpdate);
  initFiles(sendToWorker);
}
