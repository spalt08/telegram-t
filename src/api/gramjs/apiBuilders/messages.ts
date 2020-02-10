import { Api as GramJs } from '../../../lib/gramjs';
import { strippedPhotoToJpg } from '../../../lib/gramjs/Utils';
import {
  ApiMessage,
  ApiMessageForwardInfo,
  ApiPhoto,
  ApiPhotoSize,
  ApiSticker,
  ApiVideo,
  ApiDocument,
  ApiAction,
  ApiContact,
  ApiAttachment,
  ApiThumbnail,
  ApiWebPage,
} from '../../types';

import { getApiChatIdFromMtpPeer } from './chats';
import { isPeerUser } from './peers';
import { bytesToDataUri, omitGramJsFields } from './helpers';

const DEFAULT_THUMB_SIZE = { w: 100, h: 100 };

export function buildApiMessage(mtpMessage: GramJs.TypeMessage): ApiMessage {
  if (
    !(mtpMessage instanceof GramJs.Message)
    && !(mtpMessage instanceof GramJs.MessageService)) {
    throw new Error('Not supported');
  }

  return buildApiMessageWithChatId(resolveMessageApiChatId(mtpMessage), mtpMessage);
}

export function resolveMessageApiChatId(mtpMessage: GramJs.TypeMessage) {
  if (!(mtpMessage instanceof GramJs.Message || mtpMessage instanceof GramJs.MessageService)) {
    throw new Error('Not supported');
  }

  const isPrivateToMe = !mtpMessage.out && isPeerUser(mtpMessage.toId);
  return isPrivateToMe
    ? mtpMessage.fromId!
    : getApiChatIdFromMtpPeer(mtpMessage.toId);
}

export function buildApiMessageFromShort(
  mtpMessage: GramJs.UpdateShortMessage,
): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer({ userId: mtpMessage.userId } as GramJs.TypePeer);

  return buildApiMessageWithChatId(chatId, {
    ...mtpMessage,
    fromId: mtpMessage.userId,
  });
}

export function buildApiMessageFromShortChat(
  mtpMessage: GramJs.UpdateShortChatMessage,
): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer({ chatId: mtpMessage.chatId } as GramJs.TypePeer);

  return buildApiMessageWithChatId(chatId, mtpMessage);
}

type UniversalMessage = (
  Pick<GramJs.Message & GramJs.MessageService, ('id' | 'date')>
  & Pick<Partial<GramJs.Message & GramJs.MessageService>, (
    'out' | 'message' | 'entities' | 'fromId' | 'toId' | 'fwdFrom' | 'replyToMsgId' |
    'media' | 'action' | 'views' | 'editDate' | 'editHide'
  )>
);

export function buildApiMessageWithChatId(
  chatId: number,
  mtpMessage: UniversalMessage,
): ApiMessage {
  const sticker = mtpMessage.media && buildSticker(mtpMessage.media);
  const photo = mtpMessage.media && buildPhoto(mtpMessage.media);
  const video = mtpMessage.media && buildVideo(mtpMessage.media);
  const document = mtpMessage.media && buildDocument(mtpMessage.media);
  const contact = mtpMessage.media && buildContact(mtpMessage.media);
  const webPage = mtpMessage.media && buildWebPage(mtpMessage.media);
  const text = mtpMessage.message && {
    '@type': 'formattedText' as const,
    text: mtpMessage.message,
    ...(mtpMessage.entities && { entities: mtpMessage.entities.map(omitGramJsFields) }),
  };
  const action = mtpMessage.action && buildAction(mtpMessage.action);
  const toId = mtpMessage.toId ? getApiChatIdFromMtpPeer(mtpMessage.toId) : undefined;
  const isChatWithSelf = Boolean(toId) && mtpMessage.fromId === toId;
  const isEdited = mtpMessage.editDate && !mtpMessage.editHide;

  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: Boolean(mtpMessage.out) || (isChatWithSelf && !mtpMessage.fwdFrom),
    content: {
      ...(text && { text }),
      ...(sticker && { sticker }),
      ...(photo && { photo }),
      ...(video && { video }),
      ...(document && { document }),
      ...(contact && { contact }),
      ...(action && { action }),
      ...(webPage && { webPage }),
    },
    date: mtpMessage.date,
    sender_user_id: mtpMessage.fromId,
    reply_to_message_id: mtpMessage.replyToMsgId,
    ...(mtpMessage.fwdFrom && { forward_info: buildApiMessageForwardInfo(mtpMessage.fwdFrom) }),
    views: mtpMessage.views,
    ...(isEdited && { isEdited }),
  };
}

function buildApiMessageForwardInfo(fwdFrom: GramJs.MessageFwdHeader): ApiMessageForwardInfo {
  return {
    '@type': 'messageForwardInfo',
    from_chat_id: fwdFrom.fromId,
    origin: {
      '@type': 'messageForwardOriginUser',
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
  const sizeAttribute = media.document.attributes
    .find((attr: any): attr is GramJs.DocumentAttributeImageSize => (
      attr instanceof GramJs.DocumentAttributeImageSize
    ));

  if (!stickerAttribute) {
    return null;
  }

  const emoji = stickerAttribute.alt;
  const isAnimated = media.document.mimeType === 'application/x-tgsticker';
  const thumb = media.document.thumbs && media.document.thumbs.find((s: any) => s instanceof GramJs.PhotoCachedSize);
  const thumbnail = thumb && buildApiThumbnailFromCached(thumb as GramJs.PhotoCachedSize);
  const { w: width, h: height } = thumb as GramJs.PhotoCachedSize || sizeAttribute || {};

  return {
    id: String(media.document.id),
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

  const sizes = media.photo.sizes
    .filter((s: any): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize)
    .map(buildApiPhotoSize);

  return {
    thumbnail: buildApiThumbnailFromStripped(media.photo.sizes),
    sizes,
  };
}

function buildApiThumbnailFromStripped(sizes?: GramJs.TypePhotoSize[]): ApiThumbnail | undefined {
  if (!sizes || !sizes.length) {
    return undefined;
  }

  const thumb = sizes.find((s: any) => s instanceof GramJs.PhotoStrippedSize);

  if (!thumb) {
    return undefined;
  }

  const realSizes = sizes.filter((s): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize);
  const { w, h } = realSizes && realSizes.length ? realSizes[realSizes.length - 1] : DEFAULT_THUMB_SIZE;

  return {
    dataUri: bytesToDataUri(strippedPhotoToJpg((thumb as GramJs.PhotoStrippedSize).bytes as Buffer)),
    width: w,
    height: h,
  };
}

function buildApiThumbnailFromCached(photoSize: GramJs.PhotoCachedSize): ApiThumbnail | undefined {
  const { w, h, bytes } = photoSize;
  const dataUri = bytesToDataUri(strippedPhotoToJpg(bytes as Buffer));

  return {
    dataUri,
    width: w,
    height: h,
  };
}

function buildApiPhotoSize(photoSize: GramJs.PhotoSize): ApiPhotoSize {
  const { w, h, type } = photoSize;

  return {
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

  if (!videoAttr) {
    return null;
  }

  const {
    duration,
    w: width,
    h: height,
    supportsStreaming = false,
    roundMessage: isRound = false,
  } = videoAttr;

  return {
    duration,
    width,
    height,
    supportsStreaming,
    isRound,
    thumbnail: buildApiThumbnailFromStripped(media.document.thumbs),
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
    size,
    mimeType,
    fileName: (docAttr && docAttr.fileName) || 'File',
  };
}

function buildContact(media: GramJs.TypeMessageMedia): ApiContact | null {
  if (!(media instanceof GramJs.MessageMediaContact)) {
    return null;
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    userId,
  } = media;

  return {
    firstName,
    lastName,
    phoneNumber,
    userId,
  };
}

function buildWebPage(media: GramJs.TypeMessageMedia): ApiWebPage | null {
  if (
    !(media instanceof GramJs.MessageMediaWebPage)
    || !(media.webpage instanceof GramJs.WebPage)
  ) {
    return null;
  }

  const {
    id,
    url,
    displayUrl,
    siteName,
    title,
    description,
    photo,
  } = media.webpage;

  return {
    id: Number(id),
    url,
    displayUrl,
    siteName,
    title,
    description,
    // TODO support video and embed
    photo: photo && photo instanceof GramJs.Photo
      ? {
        thumbnail: buildApiThumbnailFromStripped(photo.sizes),
        sizes: photo.sizes
          .filter((s: any): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize)
          .map(buildApiPhotoSize),
      } : undefined,
  };
}

function buildAction(action: GramJs.TypeMessageAction): ApiAction | null {
  let text = '';

  if (action instanceof GramJs.MessageActionEmpty) {
    return null;
  }

  if (action instanceof GramJs.MessageActionChatCreate) {
    text = `%origin_user% created the group «${action.title}»`;
  } else if (action instanceof GramJs.MessageActionChatEditTitle) {
    text = `%origin_user% changed group name to «${action.title}»`;
  } else if (action instanceof GramJs.MessageActionChatEditPhoto) {
    text = '%origin_user% updated group photo';
  } else if (action instanceof GramJs.MessageActionChatDeletePhoto) {
    text = 'Chat photo was deleted';
  } else if (action instanceof GramJs.MessageActionChatAddUser) {
    text = '%origin_user% added %target_user% to the chat';
  } else if (action instanceof GramJs.MessageActionChatDeleteUser) {
    text = '%origin_user% removed %target_user% from the chat';
  } else if (action instanceof GramJs.MessageActionChatJoinedByLink) {
    text = '%origin_user% joined the chat from invitation link';
  } else if (action instanceof GramJs.MessageActionChannelCreate) {
    text = 'Channel created';
  } else if (action instanceof GramJs.MessageActionChatMigrateTo) {
    text = 'Chat migrated';
  } else if (action instanceof GramJs.MessageActionChannelMigrateFrom) {
    text = 'Channel migrated';
  } else if (action instanceof GramJs.MessageActionPinMessage) {
    text = '%origin_user% pinned %message%';
  } else if (action instanceof GramJs.MessageActionHistoryClear) {
    text = 'Chat history was cleared';
  } else if (action instanceof GramJs.MessageActionPhoneCall) {
    text = 'Phone Call';
  } else if (action instanceof GramJs.MessageActionContactSignUp) {
    text = '%origin_user% joined Telegram';
  } else {
    text = '%ACTION_NOT_IMPLEMENTED%';
  }

  return {
    text,
    ...('users' in action && {
      // Api returns array of userIds, but no action currently has multiple users in it
      targetUserId: action.users && action.users[0],
    }),
    ...('userId' in action && {
      targetUserId: action.userId,
    }),
  };
}

let localMessageCounter = -1;

export function buildLocalMessage(
  chatId: number, currentUserId: number, text: string, replyingTo?: number, attachment?: ApiAttachment,
): ApiMessage {
  const localId = localMessageCounter--;

  return {
    id: localId,
    chat_id: chatId,
    content: {
      text: {
        '@type': 'formattedText',
        text,
      },
      ...(attachment && buildUploadingMedia(attachment)),
    },
    date: Math.round(Date.now() / 1000),
    is_outgoing: true,
    sender_user_id: currentUserId,
    sending_state: {
      '@type': 'messageSendingStatePending',
    },
    ...(replyingTo && { reply_to_message_id: replyingTo }),
  };
}

function buildUploadingMedia(
  attachment: ApiAttachment,
): { photo: ApiPhoto } | { video: ApiVideo } | { document: ApiDocument } {
  const { type: mimeType, name: fileName, size } = attachment.file;

  if (attachment.quick) {
    const { width, height, blobUrl } = attachment.quick;

    if (mimeType.startsWith('image/')) {
      return {
        photo: {
          thumbnail: {
            width,
            height,
            dataUri: blobUrl,
          },
          sizes: [],
          blobUrl,
        },
      };
    } else {
      return {
        video: {
          duration: 0,
          width,
          height,
          blobUrl,
        },
      };
    }
  } else {
    return {
      document: {
        mimeType,
        fileName,
        size,
      },
    };
  }
}
