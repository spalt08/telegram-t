import { ApiMessage } from '../../tdlib/types';
import { OnUpdate } from '../types/types';

import { invokeRequest } from '../client';
import { buildApiMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';

let onUpdate: OnUpdate;

export function init(_onUpdate: OnUpdate) {
  onUpdate = _onUpdate;
}

export async function fetchMessages({ chatId, fromMessageId, limit }: {
  chatId: number;
  fromMessageId: number;
  limit: number;
}): Promise<{ messages: ApiMessage[] } | null> {
  const result = await invokeRequest({
    namespace: 'messages',
    name: 'GetHistoryRequest',
    args: {
      offsetId: fromMessageId,
      limit,
    },
    enhancers: {
      peer: ['buildInputPeer', chatId],
    },
  }) as MTP.messages$Messages;

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

export function sendMessage(chatId: number, message: string) {
  void invokeRequest({
    namespace: 'messages',
    name: 'SendMessageRequest',
    args: {
      message,
    },
    enhancers: {
      peer: ['buildInputPeer', chatId],
      randomId: ['generateRandomBigInt'],
    },
  });
}
