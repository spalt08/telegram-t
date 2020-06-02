import { ApiOnProgress, OnApiUpdate } from '../../types';
import { Methods, MethodArgs, MethodResponse } from '../methods/types';
import { WorkerMessageEvent, ThenArg, OriginRequest } from './types';

import { DEBUG } from '../../../config';
import generateIdFor from '../../../util/generateIdFor';

type RequestStates = {
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

  return makeRequest({
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

  return makeRequest({
    type: 'callMethod',
    name: fnName,
    args,
  }) as MethodResponse<T>;
}

export function cancelApiProgress(progressCallback: ApiOnProgress) {
  progressCallback.isCanceled = true;

  const callbackMessageId = Object.keys(requestStates).find((messageId) => {
    return requestStates[messageId].callback === progressCallback;
  });

  if (!callbackMessageId) {
    return;
  }

  worker.postMessage({
    type: 'cancelProgress',
    messageId: callbackMessageId,
  });
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
      if (requestStates[data.messageId] && requestStates[data.messageId].callback) {
        requestStates[data.messageId].callback(...data.callbackArgs);
      }
    } else if (data.type === 'unhandledError') {
      throw data;
    }
  });
}

function makeRequest(message: OriginRequest) {
  const messageId = generateIdFor(requestStates);
  const payload: OriginRequest = {
    messageId,
    ...message,
  };

  requestStates[messageId] = {} as RequestStates;

  // Re-wrap type because of `postMessage`
  const promise: Promise<ThenArg<MethodResponse<keyof Methods>>> = new Promise((resolve, reject) => {
    Object.assign(requestStates[messageId], { resolve, reject });
  });

  promise.then(
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

  return promise;
}
