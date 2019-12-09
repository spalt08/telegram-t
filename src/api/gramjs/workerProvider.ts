import generateIdFor from '../../util/generateIdFor';
import { OnApiUpdate } from '../types';
import {
  Sdk, SdkArgs, SdkResponse,
  WorkerMessageEvent, OriginMessageData, ThenArg,
} from './types';

type WorkerPromiseStore = {
  promise: Promise<ThenArg<SdkResponse<keyof Sdk>>>;
  resolve: Function;
  reject: Function;
};

const worker = new Worker('./worker.ts');
const workerPromises: Record<string, WorkerPromiseStore> = {};

export function initSdk(onUpdate: OnApiUpdate, sessionId = '') {
  worker.onmessage = (({ data }: WorkerMessageEvent) => {
    if (data.type === 'update') {
      onUpdate(data.update);
    } else if (data.type === 'sdkResponse') {
      if (data.messageId && workerPromises[data.messageId]) {
        if (data.response) {
          workerPromises[data.messageId].resolve(data.response);
        } else if (data.error) {
          workerPromises[data.messageId].reject(data.error);
        }
      }
    }
  });

  return sendToWorker({
    type: 'init',
    args: {
      sessionId,
    },
  }, true);
}

export function callSdk<T extends keyof Sdk>(fnName: T, args: SdkArgs<T>): SdkResponse<T> {
  return sendToWorker({
    type: 'callSdk',
    name: fnName,
    args,
  }, true) as SdkResponse<T>;
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
