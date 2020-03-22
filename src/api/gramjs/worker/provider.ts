import { OnApiUpdate } from '../../types';
import { Methods, MethodArgs, MethodResponse } from '../methods/types';
import { WorkerMessageEvent, OriginMessageData, ThenArg } from './types';

import generateIdFor from '../../../util/generateIdFor';

type RequestStates = {
  promise: Promise<ThenArg<MethodResponse<keyof Methods>>>;
  resolve: Function;
  reject: Function;
  callback: AnyToVoidFunction;
};

const worker = new Worker('./worker.ts');
const requestStates: Record<string, RequestStates> = {};

export function initApi(onUpdate: OnApiUpdate, sessionId = '') {
  subscribeToWorker(onUpdate);

  return sendToWorker({
    type: 'initApi',
    args: [sessionId],
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
      if (requestStates[data.messageId]) {
        if (data.error) {
          requestStates[data.messageId].reject(data.error);
        } else {
          requestStates[data.messageId].resolve(data.response);
        }
      }
    } else if (data.type === 'methodCallback') {
      if (requestStates[data.messageId]) {
        requestStates[data.messageId].callback(data.payload, data.arrayBuffer);
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
