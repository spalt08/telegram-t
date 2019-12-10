import { Api as GramJs } from '../../../lib/gramjs';
import { strippedPhotoToJpg } from '../../../lib/gramjs/Utils';
import {
  ApiMessage, ApiMessageForwardInfo, ApiPhoto, ApiPhotoCachedSize, ApiPhotoSize, ApiSticker, ApiVideo, ApiDocument,
} from '../../types';

import { getApiChatIdFromMtpPeer } from './chats';
import { isPeerUser } from './peers';
import { bytesToDataUri } from './common';

// TODO Maybe we do not need it.
const DEFAULT_USER_ID = 0;
const DEFAULT_THUMB_SIZE = { w: 100, h: 100 };

export function buildApiMessage(mtpMessage: GramJs.TypeMessage): ApiMessage {
  if (
    !(mtpMessage instanceof GramJs.Message)
    && !(mtpMessage instanceof GramJs.MessageService)) {
    throw new Error('Not supported');
  }

  const isPrivateToMe = mtpMessage.out !== true && isPeerUser(mtpMessage.toId);
  const chatId = isPrivateToMe
    ? (mtpMessage.fromId || DEFAULT_USER_ID)
    : getApiChatIdFromMtpPeer(mtpMessage.toId);

  return buildApiMessageWithChatId(chatId, mtpMessage);
}

export function buildApiMessageFromShort(
  mtpMessage: GramJs.UpdateShortMessage,
): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer({ userId: mtpMessage.userId } as GramJs.TypePeer);

  return buildApiMessageWithChatId(chatId, {
    ...mtpMessage,
    // TODO Current user ID needed here.
    fromId: mtpMessage.out ? DEFAULT_USER_ID : mtpMessage.userId,
  });
}

export function buildApiMessageFromShortChat(
  mtpMessage: GramJs.UpdateShortChatMessage,
): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer({ chatId: mtpMessage.chatId } as GramJs.TypePeer);

  return buildApiMessageWithChatId(chatId, mtpMessage);
}

export function buildApiMessageWithChatId(
  chatId: number,
  mtpMessage: Pick<Partial<GramJs.Message>, (
    'id' | 'out' | 'message' | 'entities' | 'date' | 'fromId' | 'fwdFrom' | 'replyToMsgId' | 'media'
  )>,
): ApiMessage {
  const sticker = mtpMessage.media && buildSticker(mtpMessage.media);
  const photo = mtpMessage.media && buildPhoto(mtpMessage.media);
  const video = mtpMessage.media && buildVideo(mtpMessage.media);
  const document = mtpMessage.media && buildDocument(mtpMessage.media);
  const text = mtpMessage.message && {
    '@type': 'formattedText' as const,
    text: mtpMessage.message,
    entities: mtpMessage.entities,
  };

  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: Boolean(mtpMessage.out),
    content: {
      '@type': 'message',
      ...(text && { text }),
      ...(sticker && { sticker }),
      ...(photo && { photo }),
      ...(video && { video }),
      ...(document && { document }),
    },
    date: mtpMessage.date,
    sender_user_id: mtpMessage.fromId || DEFAULT_USER_ID,
    reply_to_message_id: mtpMessage.replyToMsgId,
    ...(mtpMessage.fwdFrom && { forward_info: buildApiMessageForwardInfo(mtpMessage.fwdFrom) }),
  };
}

function buildApiMessageForwardInfo(fwdFrom: GramJs.MessageFwdHeader): ApiMessageForwardInfo {
  return {
    '@type': 'messageForwardInfo',
    from_chat_id: fwdFrom.fromId,
    origin: {
      '@type': 'messageForwardOriginUser',
      // TODO Handle when empty `fromId`.
      sender_user_id: fwdFrom.fromId,
      // TODO @gramjs Not supported?
      // sender_user_name: fwdFrom.fromName,
    },
  };
}

function buildSticker(media: GramJs.TypeMessageMedia): ApiSticker | null {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !media.document
    || !(media.document instanceof GramJs.Document)
  ) {
    return null;
  }

  const stickerAttribute = media.document.attributes
    .find((attr: any): attr is GramJs.DocumentAttributeSticker => (
      attr instanceof GramJs.DocumentAttributeSticker
    ));

  if (!stickerAttribute) {
    return null;
  }

  const emoji = stickerAttribute.alt;
  const isAnimated = media.document.mimeType === 'application/x-tgsticker';
  const thumb = media.document.thumbs && media.document.thumbs.find((s: any) => s instanceof GramJs.PhotoCachedSize);
  const thumbnail = thumb && buildApiPhotoCachedSize(thumb as GramJs.PhotoCachedSize);
  const { width, height } = thumbnail || {};

  return {
    '@type': 'sticker',
    emoji,
    is_animated: isAnimated,
    width,
    height,
    thumbnail,
  };
}

function buildPhoto(media: GramJs.TypeMessageMedia): ApiPhoto | null {
  if (!(media instanceof GramJs.MessageMediaPhoto) || !media.photo || !(media.photo instanceof GramJs.Photo)) {
    return null;
  }

  const hasStickers = Boolean(media.photo.hasStickers);
  const sizes = media.photo.sizes
    .filter((s: any): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize)
    .map(buildApiPhotoSize);

  return {
    '@type': 'photo',
    has_stickers: hasStickers,
    minithumbnail: buildApiPhotoMiniThumbnail(media.photo.sizes),
    sizes,
  };
}

function buildApiPhotoMiniThumbnail(sizes?: GramJs.TypePhotoSize[]): ApiPhoto['minithumbnail'] {
  if (!sizes || !sizes.length) {
    return undefined;
  }

  const thumb = sizes.find((s: any) => s instanceof GramJs.PhotoStrippedSize);

  if (!thumb) {
    return undefined;
  }

  const realSizes = sizes.filter((s): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize);
  const { w: width, h: height } = realSizes && realSizes.length ? realSizes[realSizes.length - 1] : DEFAULT_THUMB_SIZE;

  return {
    '@type': 'minithumbnail',
    data: bytesToDataUri(strippedPhotoToJpg((thumb as GramJs.PhotoStrippedSize).bytes as Buffer), true),
    width,
    height,
  };
}

function buildApiPhotoCachedSize(photoSize: GramJs.PhotoCachedSize): ApiPhotoCachedSize {
  const {
    w, h, type, bytes,
  } = photoSize;
  const dataUri = bytesToDataUri(strippedPhotoToJpg(bytes as Buffer));

  return {
    '@type': 'photoCachedSize',
    width: w,
    height: h,
    type: type as ('m' | 'x' | 'y'),
    dataUri,
  };
}

function buildApiPhotoSize(photoSize: GramJs.PhotoSize): ApiPhotoSize {
  const { w, h, type } = photoSize;

  return {
    '@type': 'photoSize',
    width: w,
    height: h,
    type: type as ('m' | 'x' | 'y'),
  };
}

function buildVideo(media: GramJs.TypeMessageMedia): ApiVideo | null {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !(media.document instanceof GramJs.Document)
    || !media.document.mimeType.startsWith('video')
  ) {
    return null;
  }

  const videoAttr = media.document.attributes
    .find((a: any): a is GramJs.DocumentAttributeVideo => a instanceof GramJs.DocumentAttributeVideo);

  return {
    '@type': 'video',
    duration: videoAttr && videoAttr.duration,
    minithumbnail: buildApiPhotoMiniThumbnail(media.document.thumbs),
  };
}

function buildDocument(media: GramJs.TypeMessageMedia): ApiDocument | null {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !(media.document instanceof GramJs.Document)
    || !media.document
  ) {
    return null;
  }

  const { size, mimeType } = media.document;
  const docAttr = media.document.attributes
    .find((a: any): a is GramJs.DocumentAttributeFilename => a instanceof GramJs.DocumentAttributeFilename);

  return {
    '@type': 'document',
    size,
    mimeType,
    fileName: (docAttr && docAttr.fileName) || 'File',
  };
}

// We only support 100000 local pending messages here and expect it will not interfere with real IDs.
let localMessageCounter = -1;

export function buildLocalMessage(chatId: number, text: string): ApiMessage {
  const localId = localMessageCounter--;

  return {
    id: localId,
    chat_id: chatId,
    content: {
      '@type': 'message',
      text: {
        '@type': 'formattedText',
        text,
      },
    },
    date: Math.round(Date.now() / 1000),
    is_outgoing: true,
    sender_user_id: DEFAULT_USER_ID, // TODO
    sending_state: {
      '@type': 'messageSendingStatePending',
    },
  };
}
