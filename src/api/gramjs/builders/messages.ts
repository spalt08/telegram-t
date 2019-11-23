import { getApiChatIdFromMtpPeer } from './chats';
import { ApiMessage, ApiMessageForwardInfo } from '../../types';
import { isPeerUser } from './peers';

// TODO Maybe we do not need it.
const DEFAULT_CHAT_ID = 0;

export function buildApiMessage(mtpMessage: MTP.message): ApiMessage {
  const isPrivateToMe = mtpMessage.out !== true && isPeerUser(mtpMessage.toId);
  const chatId = isPrivateToMe
    ? (mtpMessage.fromId || DEFAULT_CHAT_ID)
    : getApiChatIdFromMtpPeer(mtpMessage.toId);

  return buildApiMessageWithChatId(chatId, mtpMessage);
}

export function buildApiMessageFromShort(
  chatId: number, mtpMessage: Omit<MTP.updateShortMessage, 'flags'>,
): ApiMessage {
  return buildApiMessageWithChatId(chatId, {
    ...mtpMessage,
    // TODO Current user ID needed here.
    fromId: mtpMessage.out ? DEFAULT_CHAT_ID : mtpMessage.userId,
  });
}

export function buildApiMessageWithChatId(
  chatId: number,
  mtpMessage: Pick<MTP.message, 'id' | 'out' | 'message' | 'date' | 'fromId' | 'fwdFrom' | 'replyToMsgId'>,
): ApiMessage {
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
    sender_user_id: mtpMessage.fromId || DEFAULT_CHAT_ID,
    reply_to_message_id: mtpMessage.replyToMsgId,
    ...(mtpMessage.fwdFrom && { forward_info: buildApiMessageForwardInfo(mtpMessage.fwdFrom) }),
  };
}

function buildApiMessageForwardInfo(fwdFrom: MTP.messageFwdHeader): ApiMessageForwardInfo {
  return {
    '@type': 'messageForwardInfo',
    from_chat_id: fwdFrom.fromId,
    origin: {
      '@type': 'messageForwardOriginUser',
      // TODO Handle when empty `fromId`.
      sender_user_id: fwdFrom.fromId!,
      // TODO @gramjs Not supported?
      // sender_user_name: fwdFrom.fromName,
    },
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
