import { OnApiUpdate } from '../../types';
import { Methods, MethodArgs, MethodResponse } from '../methods/types';
import { WorkerMessageEvent, OriginMessageData, ThenArg } from './types';

import generateIdFor from '../../../util/generateIdFor';

type WorkerPromiseStore = {
  promise: Promise<ThenArg<MethodResponse<keyof Methods>>>;
  resolve: Function;
  reject: Function;
};

const worker = new Worker('./worker.ts');
const workerPromises: Record<string, WorkerPromiseStore> = {};

export function initApi(onUpdate: OnApiUpdate, sessionId = '') {
  subscribeToWorker(onUpdate);

  return sendToWorker({
    type: 'initApi',
    args: {
      sessionId,
    },
  }, true);
}

export function callApi<T extends keyof Methods>(fnName: T, ...args: MethodArgs<T>): MethodResponse<T> {
  return sendToWorker({
    type: 'callMethod',
    name: fnName,
    args,
  }, true) as MethodResponse<T>;
}

function subscribeToWorker(onUpdate: OnApiUpdate) {
  worker.addEventListener('message', ({ data }: WorkerMessageEvent) => {
    if (data.type === 'update') {
      onUpdate(data.update);
    } else if (data.type === 'methodResponse') {
      if (data.messageId && workerPromises[data.messageId]) {
        if (data.error) {
          workerPromises[data.messageId].reject(data.error);
        } else {
          workerPromises[data.messageId].resolve(data.response);
        }
      }
    } else if (data.type === 'unhandledError') {
      throw data;
    }
  });
}

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
