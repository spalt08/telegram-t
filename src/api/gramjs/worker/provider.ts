import { OnApiUpdate } from '../../types';
import { Methods, MethodArgs, MethodResponse } from '../methods/types';
import { WorkerMessageEvent, OriginMessageData, ThenArg } from './types';

import { DEBUG } from '../../../config';
import generateIdFor from '../../../util/generateIdFor';

type RequestStates = {
  promise: Promise<ThenArg<MethodResponse<keyof Methods>>>; // Re-wrap because of `postMessage`
  resolve: Function;
  reject: Function;
  callback: AnyToVoidFunction;
};

let worker: Worker;
const requestStates: Record<string, RequestStates> = {};

export function initApi(onUpdate: OnApiUpdate, sessionId = '') {
  if (!worker) {
    worker = new Worker('./worker.ts');
    subscribeToWorker(onUpdate);
  }

  return sendToWorker({
    type: 'initApi',
    args: [sessionId],
  });
}

export function callApi<T extends keyof Methods>(fnName: T, ...args: MethodArgs<T>) {
  if (!worker) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('API is not initialized');
    }

    return undefined;
  }

  return sendToWorker({
    type: 'callMethod',
    name: fnName,
    args,
  }) as MethodResponse<T>;
}

function subscribeToWorker(onUpdate: OnApiUpdate) {
  worker.addEventListener('message', ({ data }: WorkerMessageEvent) => {
    if (data.type === 'update') {
      onUpdate(data.update);
    } else if (data.type === 'methodResponse') {
      if (requestStates[data.messageId]) {
        if (data.error) {
          requestStates[data.messageId].reject(data.error);
        } else {
          requestStates[data.messageId].resolve(data.response);
        }
      }
    } else if (data.type === 'methodCallback') {
      if (requestStates[data.messageId]) {
        requestStates[data.messageId].callback(...data.callbackArgs);
      }
    } else if (data.type === 'unhandledError') {
      throw data;
    }
  });
}

function sendToWorker(message: OriginMessageData) {
  const messageId = generateIdFor(requestStates);
  const payload = {
    messageId,
    ...message,
  };

  requestStates[messageId] = {} as RequestStates;
  requestStates[messageId].promise = new Promise((resolve, reject) => {
    Object.assign(requestStates[messageId], { resolve, reject });
  });

  requestStates[messageId].promise.then(
    () => {
      delete requestStates[messageId];
    },
    () => {
      delete requestStates[messageId];
    },
  );

  if (typeof payload.args[1] === 'function') {
    requestStates[messageId].callback = payload.args.pop() as AnyToVoidFunction;
  }

  worker.postMessage(payload);

  return requestStates[messageId].promise;
}
