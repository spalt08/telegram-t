import { ApiUpdate } from '../../types';
import { OriginMessageEvent, WorkerMessageData } from './types';
import { initApi, callApi } from '../provider';

onmessage = async (message: OriginMessageEvent) => {
  const { data } = message;

  switch (data.type) {
    case 'initApi': {
      await initApi(onUpdate, data.args.sessionId);
      break;
    }
    case 'callMethod': {
      const { messageId, name, args } = data;
      try {
        const response = await callApi(name, ...args);

        if (messageId) {
          sendToOrigin({
            type: 'methodResponse',
            messageId,
            response,
          });
        }
      } catch (error) {
        if (messageId) {
          sendToOrigin({
            type: 'methodResponse',
            messageId,
            error,
          });
        }
      }
      break;
    }
  }
};

function onUpdate(update: ApiUpdate) {
  sendToOrigin({
    type: 'update',
    update,
  });
}

function sendToOrigin(data: WorkerMessageData) {
  postMessage(data);
}
