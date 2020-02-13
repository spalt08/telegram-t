import { Api as GramJs } from '../../../lib/gramjs';
import {
  ApiMessage,
  ApiMessageForwardInfo,
  ApiPhoto,
  ApiPhotoSize,
  ApiSticker,
  ApiVideo,
  ApiVoice,
  ApiAudio,
  ApiDocument,
  ApiAction,
  ApiContact,
  ApiAttachment,
  ApiPoll,
  ApiWebPage,
} from '../../types';

import { getApiChatIdFromMtpPeer } from './chats';
import { isPeerUser } from './peers';
import { omitGramJsFields } from './helpers';
import { buildStickerFromDocument } from './stickers';
import { buildApiThumbnailFromStripped } from './common';

export function buildApiMessage(mtpMessage: GramJs.TypeMessage): ApiMessage | undefined {
  const chatId = resolveMessageApiChatId(mtpMessage);
  if (
    !chatId
    || !(mtpMessage instanceof GramJs.Message || mtpMessage instanceof GramJs.MessageService)) {
    return undefined;
  }

  return buildApiMessageWithChatId(chatId, mtpMessage);
}

export function resolveMessageApiChatId(mtpMessage: GramJs.TypeMessage) {
  if (!(mtpMessage instanceof GramJs.Message || mtpMessage instanceof GramJs.MessageService)) {
    return undefined;
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

export function buildApiMessageWithChatId(chatId: number, mtpMessage: UniversalMessage): ApiMessage {
  const { message, entities, media } = mtpMessage;

  let content: ApiMessage['content'] = {};

  if (message) {
    content.text = {
      '@type': 'formattedText' as const,
      text: message,
      ...(entities && { entities: entities.map(omitGramJsFields) }),
    };
  }

  if (media) {
    const sticker = buildSticker(media);
    const photo = buildPhoto(media);
    const video = buildVideo(media);
    const audio = buildAudio(media);
    const voice = buildVoice(media);
    const document = !(sticker || video || audio || voice) && buildDocument(media);
    const contact = buildContact(media);
    const poll = buildPoll(media);
    const webPage = buildWebPage(media);

    content = {
      ...content,
      ...(sticker && { sticker }),
      ...(photo && { photo }),
      ...(video && { video }),
      ...(audio && { audio }),
      ...(voice && { voice }),
      ...(document && { document }),
      ...(contact && { contact }),
      ...(poll && { poll }),
      ...(webPage && { webPage }),
    };
  }

  const action = mtpMessage.action && buildAction(mtpMessage.action, mtpMessage.fromId);
  if (action) {
    content.action = action;
  }

  const toId = mtpMessage.toId ? getApiChatIdFromMtpPeer(mtpMessage.toId) : undefined;
  const isChatWithSelf = Boolean(toId) && mtpMessage.fromId === toId;
  const isEdited = mtpMessage.editDate && !mtpMessage.editHide;

  return {
    id: mtpMessage.id,
    chat_id: chatId,
    is_outgoing: Boolean(mtpMessage.out) || (isChatWithSelf && !mtpMessage.fwdFrom),
    content,
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

function buildSticker(media: GramJs.TypeMessageMedia): ApiSticker | undefined {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !media.document
    || !(media.document instanceof GramJs.Document)
  ) {
    return undefined;
  }

  return buildStickerFromDocument(media.document);
}

function buildPhoto(media: GramJs.TypeMessageMedia): ApiPhoto | undefined {
  if (!(media instanceof GramJs.MessageMediaPhoto) || !media.photo || !(media.photo instanceof GramJs.Photo)) {
    return undefined;
  }

  const sizes = media.photo.sizes
    .filter((s: any): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize)
    .map(buildApiPhotoSize);

  return {
    thumbnail: buildApiThumbnailFromStripped(media.photo.sizes),
    sizes,
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

function buildVideo(media: GramJs.TypeMessageMedia): ApiVideo | undefined {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !(media.document instanceof GramJs.Document)
    || !media.document.mimeType.startsWith('video')
  ) {
    return undefined;
  }

  const videoAttr = media.document.attributes
    .find((a: any): a is GramJs.DocumentAttributeVideo => a instanceof GramJs.DocumentAttributeVideo);

  if (!videoAttr) {
    return undefined;
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


function buildAudio(media: GramJs.TypeMessageMedia): ApiAudio | undefined {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !media.document
    || !(media.document instanceof GramJs.Document)
  ) {
    return undefined;
  }

  const audioAttribute = media.document.attributes
    .find((attr: any): attr is GramJs.DocumentAttributeAudio => (
      attr instanceof GramJs.DocumentAttributeAudio
    ));

  if (!audioAttribute || audioAttribute.voice) {
    return undefined;
  }

  const { size, mimeType } = media.document;
  const { duration, performer, title } = audioAttribute;
  const filenameAttribute = media.document.attributes
    .find((a: any): a is GramJs.DocumentAttributeFilename => a instanceof GramJs.DocumentAttributeFilename);

  return {
    size,
    mimeType,
    fileName: (filenameAttribute && filenameAttribute.fileName) || 'Audio',
    duration,
    performer,
    title,
  };
}

function buildVoice(media: GramJs.TypeMessageMedia): ApiVoice | undefined {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !media.document
    || !(media.document instanceof GramJs.Document)
  ) {
    return undefined;
  }

  const audioAttribute = media.document.attributes
    .find((attr: any): attr is GramJs.DocumentAttributeAudio => (
      attr instanceof GramJs.DocumentAttributeAudio
    ));

  if (!audioAttribute || !audioAttribute.voice) {
    return undefined;
  }

  const { duration, waveform } = audioAttribute;

  return { duration, waveform };
}

function buildDocument(media: GramJs.TypeMessageMedia): ApiDocument | undefined {
  if (
    !(media instanceof GramJs.MessageMediaDocument)
    || !(media.document instanceof GramJs.Document)
    || !media.document
  ) {
    return undefined;
  }

  const { size, mimeType } = media.document;
  const filenameAttribute = media.document.attributes
    .find((a: any): a is GramJs.DocumentAttributeFilename => a instanceof GramJs.DocumentAttributeFilename);

  return {
    size,
    mimeType,
    fileName: (filenameAttribute && filenameAttribute.fileName) || 'File',
  };
}

function buildContact(media: GramJs.TypeMessageMedia): ApiContact | undefined {
  if (!(media instanceof GramJs.MessageMediaContact)) {
    return undefined;
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

function buildPoll(media: GramJs.TypeMessageMedia): ApiPoll | undefined {
  if (!(media instanceof GramJs.MessageMediaPoll)) {
    return undefined;
  }

  const { id, ...summary } = media.poll;

  return {
    id: Number(id),
    summary,
    results: media.results,
  };
}

export function buildWebPage(media: GramJs.TypeMessageMedia): ApiWebPage | undefined {
  if (
    !(media instanceof GramJs.MessageMediaWebPage)
    || !(media.webpage instanceof GramJs.WebPage)
  ) {
    return undefined;
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

function buildAction(action: GramJs.TypeMessageAction, senderId?: number): ApiAction | undefined {
  if (action instanceof GramJs.MessageActionEmpty) {
    return undefined;
  }

  let text = '';

  const targetUserId = 'users' in action
    // Api returns array of userIds, but no action currently has multiple users in it
    ? action.users && action.users[0]
    : ('userId' in action && action.userId) || undefined;

  if (action instanceof GramJs.MessageActionChatCreate) {
    text = `%origin_user% created the group «${action.title}»`;
  } else if (action instanceof GramJs.MessageActionChatEditTitle) {
    text = `%origin_user% changed group name to «${action.title}»`;
  } else if (action instanceof GramJs.MessageActionChatEditPhoto) {
    text = '%origin_user% updated group photo';
  } else if (action instanceof GramJs.MessageActionChatDeletePhoto) {
    text = 'Chat photo was deleted';
  } else if (action instanceof GramJs.MessageActionChatAddUser) {
    text = !senderId || senderId === targetUserId
      ? '%target_use% joined the group'
      : '%origin_user% added %target_user% to the group';
  } else if (action instanceof GramJs.MessageActionChatDeleteUser) {
    text = !senderId || senderId === targetUserId
      ? '%target_user% left the group'
      : '%origin_user% removed %target_user% from the group';
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
    targetUserId,
  };
}

let localMessageCounter = -1;

export function buildLocalMessage(
  chatId: number,
  currentUserId: number,
  text?: string,
  replyingTo?: number,
  attachment?: ApiAttachment,
  sticker?: ApiSticker,
): ApiMessage {
  const localId = localMessageCounter--;

  return {
    id: localId,
    chat_id: chatId,
    content: {
      ...(text && {
        text: {
          '@type': 'formattedText',
          text,
        },
      }),
      ...(attachment && buildUploadingMedia(attachment)),
      ...(sticker && { sticker }),
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
