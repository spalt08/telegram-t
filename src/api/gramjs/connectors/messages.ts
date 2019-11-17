import { getApiChatIdFromMtpPeer } from './chats';
import { ApiMessage } from '../../tdlib/types';
import { isPeerUser } from './peers';

const DEFAULT_CHAT_ID = 0;

export function buildApiMessage(mtpMessage: MTP.message): ApiMessage {
  const isPrivateToMe = isPeerUser(mtpMessage.toId);
  const chatId = isPrivateToMe
    ? (mtpMessage.fromId || DEFAULT_CHAT_ID)
    : getApiChatIdFromMtpPeer(mtpMessage.toId);

  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: mtpMessage.out === true,
    content: {
      '@type': 'message',
      ...(mtpMessage.message && {
        text: {
          text: mtpMessage.message,
        },
      }),
    },
    date: mtpMessage.date,
    sender_user_id: mtpMessage.fromId || DEFAULT_CHAT_ID, // TODO
  };
}

// @ts-ignore
export function buildApiMessageFromUpdate(chatId: number, mtpMessage: UpdateShortMessage): ApiMessage {
  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: mtpMessage.out === true,
    content: {
      '@type': 'message',
      ...(mtpMessage.message && {
        text: {
          text: mtpMessage.message,
        },
      }),
    },
    date: mtpMessage.date,
    sender_user_id: mtpMessage.fromId || -1,
  };
}
