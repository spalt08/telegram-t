import { OnUpdate } from '../types/types';

import { buildApiMessage, buildApiMessageFromShortUpdate } from '../builders/messages';
import { getApiChatIdFromMtpPeer } from '../builders/chats';

let onUpdate: OnUpdate;

export function init(_onUpdate: OnUpdate) {
  onUpdate = _onUpdate;
}

export function onGramJsUpdate(update: AnyLiteral) {
  const { constructorName } = update;
  if (
    constructorName === 'UpdateShortMessage'
    || constructorName === 'UpdateShortChatMessage'
  ) {
    const chatId = getApiChatIdFromMtpPeer(update as MTP.Peer);
    const message = buildApiMessageFromShortUpdate(chatId, update);

    onUpdate({
      '@type': 'updateNewMessage',
      chat_id: message.chat_id,
      message,
    });

    onUpdate({
      '@type': 'updateChatLastMessage',
      chat_id: message.chat_id,
      last_message: message,
    });
  } else if (
    constructorName === 'UpdateNewMessage'
  ) {
    const message = buildApiMessage(update.message);

    onUpdate({
      '@type': 'updateNewMessage',
      chat_id: message.chat_id,
      message,
    });

    onUpdate({
      '@type': 'updateChatLastMessage',
      chat_id: message.chat_id,
      last_message: message,
    });
  }
}
