import { ApiUpdate } from '../../types';
import { OriginMessageEvent, WorkerMessageData } from './types';
import { initApi, callApi } from '../provider';
import { DEBUG } from '../../../config';

handleErrors();

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
          args.push(((...callbackArgs: any[]) => {
            sendToOrigin({
              type: 'methodCallback',
              messageId,
              callbackArgs,
            });
          }) as never);
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
