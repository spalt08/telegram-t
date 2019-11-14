import { getApiChatIdFromMtpPeer } from './chats';
import { ApiMessage } from '../../tdlib/types';

export function buildApiMessage(mtpMessage: MTP.message): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer(mtpMessage.toId);

  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: mtpMessage.out === true,
    content: {
      ...(mtpMessage.message && {
        text: {
          text: mtpMessage.message,
        },
      }),
    },
    date: mtpMessage.date,
    sender_user_id: mtpMessage.fromId || -1, // TODO
  };
}

// @ts-ignore
export function buildApiMessageFromUpdate(chatId: number, mtpMessage: UpdateShortMessage): ApiMessage {
  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: mtpMessage.out === true,
    content: {
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
