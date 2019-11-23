import { ApiMessage } from '../../types';
import { OnApiUpdate } from '../types/types';

import { invokeRequest } from '../client';
import { buildApiMessage } from '../builders/messages';
import { buildApiUser } from '../builders/users';
import { buildInputPeer, generateRandomBigInt } from '../inputHelpers';
import localDb from '../localDb';

let onUpdate: OnApiUpdate;
// We only support 100000 local pending messages here and expect it will not interfere with real IDs.
let localMessageCounter = -1;

export function init(_onUpdate: OnApiUpdate) {
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
      peer: buildInputPeer(chatId),
    },
  }) as MTP.messages$Messages;

  if (!result || !result.messages) {
    return null;
  }

  (result.users as MTP.user[]).forEach((mtpUser) => {
    const user = buildApiUser(mtpUser);

    onUpdate({
      '@type': 'updateUser',
      id: user.id,
      user,
    });
  });

  const messages = (result.messages as MTP.message[]).map(buildApiMessage);

  return {
    messages,
  };
}

export function sendMessage(chatId: number, text: string) {
  const localMessage = buildLocalMessage(chatId, text);
  onUpdate({
    '@type': 'updateMessage',
    id: localMessage.id,
    chat_id: chatId,
    message: localMessage,
  });

  onUpdate({
    '@type': 'updateChat',
    id: chatId,
    chat: {
      last_message: localMessage,
    },
  });

  const randomId = generateRandomBigInt();

  localDb.localMessages[randomId.toString()] = localMessage;

  void invokeRequest({
    namespace: 'messages',
    name: 'SendMessageRequest',
    args: {
      message: text,
      peer: buildInputPeer(chatId),
      randomId,
    },
  });
}

function buildLocalMessage(chatId: number, text: string): ApiMessage {
  const localId = localMessageCounter--;

  return {
    id: localId,
    chat_id: chatId,
    content: {
      '@type': 'textContent',
      text: { text },
    },
    date: Math.round(Date.now() / 1000),
    is_outgoing: true,
    sender_user_id: -1, // TODO
    sending_state: {
      '@type': 'messageSendingStatePending',
    },
  };
}
