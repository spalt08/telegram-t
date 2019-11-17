import { OnUpdate, WorkerMessageGramJsUpdate } from './types/types';

import { buildApiMessage, buildApiMessageFromShortUpdate } from './connectors/messages';
import { getApiChatIdFromMtpPeer } from './connectors/chats';

export function onGramJsUpdate({ constructorName, update }: WorkerMessageGramJsUpdate, onUpdate: OnUpdate) {
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
