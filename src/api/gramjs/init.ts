import {
  OnUpdate, OriginMessageData, WorkerMessageEvent, WorkerMessageResponse,
} from './types/types';

import { init as initAuth } from './methods/auth';
import { init as initChats } from './methods/chats';
import { init as initMessages } from './methods/messages';
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
    ...(shouldWaitForResponse && { messageId }),
    ...message,
  });

  return workerPromises[messageId].promise;
}

export function init(onUpdate: OnUpdate) {
  sendToWorker({ type: 'init' });

  worker.onmessage = (({ data }: WorkerMessageEvent) => {
    if (data.type === 'apiUpdate') {
      onUpdate(data.update);
    } else if (data.type === 'gramJsUpdate') {
      onGramJsUpdate(data, onUpdate);
    } else if (data.type === 'invokeResponse') {
      if (data.messageId && workerPromises[data.messageId]) {
        // TODO Support reject
        workerPromises[data.messageId].resolve(data.result);
      }
    }
  });

  initAuth(sendToWorker);
  initChats(sendToWorker, onUpdate);
  initMessages(sendToWorker, onUpdate);
}
