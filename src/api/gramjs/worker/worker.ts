import { ApiOnProgress, ApiUpdate } from '../../types';
import { OriginMessageEvent, WorkerMessageData } from './types';

import { DEBUG } from '../../../config';
import { initApi, callApi, cancelApiProgress } from '../provider';

declare const self: WorkerGlobalScope;

handleErrors();

const callbackState: Record<string, ApiOnProgress> = {};

if (DEBUG) {
  // eslint-disable-next-line no-console
  console.log('>>> FINISH WORKER LOAD');
}

onmessage = async (message: OriginMessageEvent) => {
  const { data } = message;

  switch (data.type) {
    case 'initApi': {
      await initApi(onUpdate, data.args[0]);
      break;
    }
    case 'callMethod': {
      const { messageId, name, args } = data;
      try {
        if (messageId) {
          callbackState[messageId] = (...callbackArgs: any[]) => {
            sendToOrigin({
              type: 'methodCallback',
              messageId,
              callbackArgs,
            });
          };

          args.push(callbackState[messageId] as never);
        }

        const response = await callApi(name, ...args);

        if (messageId) {
          sendToOrigin({
            type: 'methodResponse',
            messageId,
            response,
          });
        }
      } catch (error) {
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.error(error);
        }

        if (messageId) {
          sendToOrigin({
            type: 'methodResponse',
            messageId,
            error: { message: error.message },
          });
        }
      }

      if (messageId) {
        delete callbackState[messageId];
      }

      break;
    }
    case 'cancelProgress': {
      if (callbackState[data.messageId]) {
        cancelApiProgress(callbackState[data.messageId]);
      }

      break;
    }
  }
};

function handleErrors() {
  // eslint-disable-next-line no-restricted-globals
  self.onerror = (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    sendToOrigin({ type: 'unhandledError', error: { message: 'Uncaught exception in worker' } });
  };
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener('unhandledrejection', (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    sendToOrigin({ type: 'unhandledError', error: { message: 'Uncaught rejection in worker' } });
  });
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
