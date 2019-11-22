import { getApiChatIdFromMtpPeer } from './chats';
import { ApiMessage } from '../../tdlib/types';
import { isPeerUser } from './peers';

const DEFAULT_CHAT_ID = 0;

export function buildApiMessage(mtpMessage: MTP.message): ApiMessage {
  const isPrivateToMe = mtpMessage.out !== true && isPeerUser(mtpMessage.toId);
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
      // ...(mtpMessage.media && buildPhoto(mtpMessage)),
    },
    date: mtpMessage.date,
    sender_user_id: mtpMessage.fromId || DEFAULT_CHAT_ID, // TODO
  };
}

// function buildPhoto(mtpMessage: MTP.message): Pick<ApiMessage['content'], 'photo' | 'caption'> | null {
//   const mtpMedia = mtpMessage.media as MTP.messageMediaPhoto;
//
//   if (!mtpMedia.photo) {
//     return null;
//   }
//
//   const { photo, caption } = mtpMedia;
//
//   return {
//     photo: {
//       has_stickers: photo.hasStickers,
//       minithumbnail: {
//         '@type': 'minithumbnail',
//         data: string,
//         height: number,
//         width: number,
//       },
//     },
//     ...(caption && {
//       '@type': 'formattedText',
//       text: caption,
//     }),
//   };
// }

// @ts-ignore
export function buildApiMessageFromShortUpdate(chatId: number, mtpMessage: UpdateShortMessage): ApiMessage {
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
