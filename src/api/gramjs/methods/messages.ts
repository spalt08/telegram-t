import { ApiMessage } from '../../tdlib/types/index';
import { OnUpdate, SendToWorker } from '../types/types';

import { buildApiMessage } from '../connectors/messages';
import { buildApiUser } from '../connectors/users';

let sendToClient: SendToWorker;
let onUpdate: OnUpdate;

export function init(_sendToClient: SendToWorker, _onUpdate: OnUpdate) {
  sendToClient = _sendToClient;
  onUpdate = _onUpdate;
}

export async function fetchMessages({ chatId, fromMessageId, limit }: {
  chatId: number;
  fromMessageId: number;
  limit: number;
}): Promise<{ messages: ApiMessage[] } | null> {
  const result = await sendToClient({
    type: 'invokeRequest',
    namespace: 'messages',
    name: 'GetHistoryRequest',
    args: {
      offsetId: fromMessageId,
      limit,
    },
    enhancers: {
      peer: ['buildInputPeerByApiChatId', chatId],
    },
  }, true) as MTP.messages$Messages;

  if (!result || !result.messages) {
    return null;
  }

  (result.users as MTP.user[]).forEach((mtpUser) => {
    const user = buildApiUser(mtpUser);

    onUpdate({
      '@type': 'updateUser',
      user,
    });
  });

  const messages = (result.messages as MTP.message[]).map(buildApiMessage);

  return {
    messages,
  };
}

export async function sendMessage(chatId: number, message: string) {
  void sendToClient({
    type: 'invokeRequest',
    namespace: 'messages',
    name: 'SendMessageRequest',
    args: {
      message,
    },
    enhancers: {
      peer: ['buildInputPeerByApiChatId', chatId],
      randomId: ['generateRandomBigInt'],
    },
  });
}
