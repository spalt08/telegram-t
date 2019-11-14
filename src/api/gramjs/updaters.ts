import { OnUpdate, WorkerMessageGramJsUpdate } from './types/types';

import { buildApiMessageFromUpdate } from './connectors/messages';
import { getApiChatIdFromMtpPeer } from './connectors/chats';

export function onGramJsUpdate({ constructorName, update }: WorkerMessageGramJsUpdate, onUpdate: OnUpdate) {
  if (
    constructorName === 'UpdateShortMessage'
    || constructorName === 'UpdateShortChatMessage'
  ) {
    const chatId = getApiChatIdFromMtpPeer(update as MTP.Peer);
    const message = buildApiMessageFromUpdate(chatId, update);

    onUpdate({
      '@type': 'updateNewMessage',
      chat_id: message.chat_id,
      message,
    });
  }
}
