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
  ApiNewPoll,
  ApiWebPage,
  ApiMessageEntity,
  ApiFormattedText,
} from '../../types';

import { LOCAL_MESSAGE_ID_BASE, SERVICE_NOTIFICATIONS_USER_ID } from '../../../config';
import { pick } from '../../../util/iteratees';
import { reduceWaveform } from '../gramjsBuilders';
import { getApiChatIdFromMtpPeer } from './chats';
import { isPeerUser } from './peers';
import { buildStickerFromDocument } from './symbols';
import { buildApiThumbnailFromStripped } from './common';

const LOCAL_VIDEO_TEMP_ID = 'temp';
let localMessageCounter = LOCAL_MESSAGE_ID_BASE;

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

export function buildApiMessageFromShort(mtpMessage: GramJs.UpdateShortMessage, currentUserId: number): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer({ userId: mtpMessage.userId } as GramJs.TypePeer);

  return buildApiMessageWithChatId(chatId, {
    ...mtpMessage,
    fromId: mtpMessage.out ? currentUserId : mtpMessage.userId,
  });
}

export function buildApiMessageFromShortChat(mtpMessage: GramJs.UpdateShortChatMessage): ApiMessage {
  const chatId = getApiChatIdFromMtpPeer({ chatId: mtpMessage.chatId } as GramJs.TypePeer);

  return buildApiMessageWithChatId(chatId, mtpMessage);
}

export function buildApiMessageFromNotification(
  notification: GramJs.UpdateServiceNotification,
  currentDate: number,
): ApiMessage {
  const localId = localMessageCounter++;
  let content: ApiMessage['content'] = {};

  if (notification.media) {
    content = {
      ...buildMessageMediaContent(notification.media),
    };
  }

  if (notification.message && !content.sticker && !content.poll && !content.contact) {
    content = {
      ...content,
      text: buildMessageTextContent(notification.message, notification.entities),
    };
  }

  return {
    id: localId,
    chatId: SERVICE_NOTIFICATIONS_USER_ID,
    date: notification.inboxDate || (currentDate / 1000),
    content,
    isOutgoing: false,
  };
}

type UniversalMessage = (
  Pick<GramJs.Message & GramJs.MessageService, ('id' | 'date')>
  & Pick<Partial<GramJs.Message & GramJs.MessageService>, (
    'out' | 'message' | 'entities' | 'fromId' | 'toId' | 'fwdFrom' | 'replyToMsgId' |
    'media' | 'action' | 'views' | 'editDate' | 'editHide' | 'mediaUnread' | 'groupedId' | 'mentioned'
  )>
);

export function buildApiMessageWithChatId(chatId: number, mtpMessage: UniversalMessage): ApiMessage {
  let content: ApiMessage['content'] = {};

  if (mtpMessage.media) {
    content = {
      ...buildMessageMediaContent(mtpMessage.media),
    };
  }

  if (mtpMessage.message && !content.sticker && !content.poll && !content.contact) {
    content = {
      ...content,
      text: buildMessageTextContent(mtpMessage.message, mtpMessage.entities),
    };
  }

  const action = mtpMessage.action && buildAction(mtpMessage.action, mtpMessage.fromId);
  if (action) {
    content.action = action;
  }

  const toId = mtpMessage.toId ? getApiChatIdFromMtpPeer(mtpMessage.toId) : undefined;
  const isChatWithSelf = Boolean(toId) && mtpMessage.fromId === toId;
  const isEdited = mtpMessage.editDate && !mtpMessage.editHide;
  const isMediaUnread = mtpMessage.mediaUnread;

  return {
    id: mtpMessage.id,
    chatId,
    isOutgoing: Boolean(mtpMessage.out) || (isChatWithSelf && !mtpMessage.fwdFrom),
    content,
    date: mtpMessage.date,
    senderUserId: mtpMessage.fromId,
    replyToMessageId: mtpMessage.replyToMsgId,
    ...(mtpMessage.fwdFrom && { forwardInfo: buildApiMessageForwardInfo(mtpMessage.fwdFrom) }),
    views: mtpMessage.views,
    ...(isEdited && { isEdited }),
    ...(isMediaUnread && { isMediaUnread }),
    ...(mtpMessage.mentioned && isMediaUnread && { hasUnreadMention: true }),
    ...(mtpMessage.groupedId && { groupedId: mtpMessage.groupedId.toString() }),
  };
}

export function buildMessageTextContent(
  message: string,
  entities?: GramJs.TypeMessageEntity[],
): ApiFormattedText {
  return {
    text: message,
    ...(entities && { entities: entities.map(buildApiMessageEntity) }),
  };
}

export function buildMessageDraft(draft: GramJs.TypeDraftMessage) {
  if (draft instanceof GramJs.DraftMessageEmpty || !draft.message) {
    return undefined;
  }

  return {
    formattedText: buildMessageTextContent(draft.message, draft.entities),
    replyingToId: draft.replyToMsgId,
  };
}

export function buildMessageMediaContent(media: GramJs.TypeMessageMedia): ApiMessage['content'] | undefined {
  const sticker = buildSticker(media);
  if (sticker) return { sticker };

  const photo = buildPhoto(media);
  if (photo) return { photo };

  const video = buildVideo(media);
  if (video) return { video };

  const audio = buildAudio(media);
  if (audio) return { audio };

  const voice = buildVoice(media);
  if (voice) return { voice };

  const document = buildDocumentFromMedia(media);
  if (document) return { document };

  const contact = buildContact(media);
  if (contact) return { contact };

  const poll = buildPollFromMedia(media);
  if (poll) return { poll };

  const webPage = buildWebPage(media);
  if (webPage) return { webPage };

  return undefined;
}

function buildApiMessageForwardInfo(fwdFrom: GramJs.MessageFwdHeader): ApiMessageForwardInfo {
  const fromChatId = fwdFrom.channelId
    ? getApiChatIdFromMtpPeer({ channelId: fwdFrom.channelId } as GramJs.PeerChannel)
    : fwdFrom.fromId;

  return {
    fromChatId,
    origin: {
      senderUserId: fwdFrom.fromId,
      channelPostId: fwdFrom.channelPost,
      // TODO @gramjs Not supported?
      // senderUsername: fwdFrom.fromName,
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

export function buildVideoFromDocument(document: GramJs.Document): ApiVideo | undefined {
  if (document instanceof GramJs.DocumentEmpty) {
    return undefined;
  }

  const videoAttr = document.attributes
    .find((a: any): a is GramJs.DocumentAttributeVideo => a instanceof GramJs.DocumentAttributeVideo);

  if (!videoAttr) {
    return undefined;
  }

  const gifAttr = document.attributes
    .find((a: any): a is GramJs.DocumentAttributeAnimated => a instanceof GramJs.DocumentAttributeAnimated);

  const {
    duration,
    w: width,
    h: height,
    supportsStreaming = false,
    roundMessage: isRound = false,
  } = videoAttr;

  return {
    id: String(document.id),
    duration,
    fileName: getFilenameFromDocument(document, 'video'),
    width,
    height,
    supportsStreaming,
    isRound,
    isGif: Boolean(gifAttr),
    thumbnail: buildApiThumbnailFromStripped(document.thumbs),
    size: document.size,
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

  return buildVideoFromDocument(media.document);
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

  return {
    fileName: getFilenameFromDocument(media.document, 'audio'),
    ...pick(media.document, ['size', 'mimeType']),
    ...pick(audioAttribute, ['duration', 'performer', 'title']),
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

  return {
    duration,
    waveform: waveform ? Array.from(waveform) : undefined,
  };
}

function buildDocumentFromMedia(media: GramJs.TypeMessageMedia) {
  if (!(media instanceof GramJs.MessageMediaDocument) || !media.document) {
    return undefined;
  }

  return buildApiDocument(media.document);
}

export function buildApiDocument(document: GramJs.TypeDocument): ApiDocument | undefined {
  if (!(document instanceof GramJs.Document)) {
    return undefined;
  }

  const {
    id, size, mimeType, date, thumbs,
  } = document;

  const thumbnail = thumbs && buildApiThumbnailFromStripped(thumbs);

  return {
    id: String(id),
    size,
    mimeType,
    timestamp: date,
    fileName: getFilenameFromDocument(document),
    thumbnail,
  };
}

function buildContact(media: GramJs.TypeMessageMedia): ApiContact | undefined {
  if (!(media instanceof GramJs.MessageMediaContact)) {
    return undefined;
  }

  return pick(media, [
    'firstName',
    'lastName',
    'phoneNumber',
    'userId',
  ]);
}

function buildPollFromMedia(media: GramJs.TypeMessageMedia): ApiPoll | undefined {
  if (!(media instanceof GramJs.MessageMediaPoll)) {
    return undefined;
  }

  return buildPoll(media.poll, media.results);
}

export function buildPoll(poll: GramJs.Poll, pollResults: GramJs.PollResults): ApiPoll {
  const { id, answers: rawAnswers } = poll;
  const answers = rawAnswers.map((answer) => ({
    text: answer.text,
    option: String.fromCharCode(...answer.option),
  }));

  return {
    id: id.toString(),
    summary: {
      ...pick(poll, [
        'closed',
        'publicVoters',
        'multipleChoice',
        'quiz',
        'question',
        'closePeriod',
        'closeDate',
      ]),
      answers,
    },
    results: buildPollResults(pollResults),
  };
}

export function buildPollResults(pollResults: GramJs.PollResults): ApiPoll['results'] {
  const {
    results: rawResults, min, totalVoters, recentVoters, solution, solutionEntities: entities,
  } = pollResults;
  const results = rawResults && rawResults.map(({
    option, chosen, correct, voters,
  }) => ({
    chosen,
    correct,
    voters,
    option: String.fromCharCode(...option),
  }));

  return {
    min,
    totalVoters,
    recentVoters,
    results,
    solution,
    ...(entities && { solutionEntities: entities.map(buildApiMessageEntity) }),
  };
}

export function buildWebPage(media: GramJs.TypeMessageMedia): ApiWebPage | undefined {
  if (
    !(media instanceof GramJs.MessageMediaWebPage)
    || !(media.webpage instanceof GramJs.WebPage)
  ) {
    return undefined;
  }

  const { id, photo, document } = media.webpage;

  return {
    id: Number(id),
    ...pick(media.webpage, [
      'url',
      'displayUrl',
      'siteName',
      'title',
      'description',
    ]),
    photo: photo && photo instanceof GramJs.Photo
      ? {
        thumbnail: buildApiThumbnailFromStripped(photo.sizes),
        sizes: photo.sizes
          .filter((s: any): s is GramJs.PhotoSize => s instanceof GramJs.PhotoSize)
          .map(buildApiPhotoSize),
      }
      : undefined,
    // TODO support video and embed
    ...(document && { hasDocument: true }),
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
    // TODO: Add distinct message for Channels
    text = `%origin_user% changed group name to «${action.title}»`;
  } else if (action instanceof GramJs.MessageActionChatEditPhoto) {
    // TODO: Add distinct message for Channels
    text = '%origin_user% updated group photo';
  } else if (action instanceof GramJs.MessageActionChatDeletePhoto) {
    text = 'Chat photo was deleted';
  } else if (action instanceof GramJs.MessageActionChatAddUser) {
    text = !senderId || senderId === targetUserId
      ? '%target_user% joined the group'
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

function getFilenameFromDocument(document: GramJs.Document, defaultBase = 'file') {
  const { mimeType, attributes } = document;
  const filenameAttribute = attributes
    .find((a: any): a is GramJs.DocumentAttributeFilename => a instanceof GramJs.DocumentAttributeFilename);

  if (filenameAttribute) {
    return filenameAttribute.fileName;
  }

  const extension = mimeType.split('/')[1];

  return `${defaultBase}${String(document.id)}.${extension}`;
}

export function buildLocalMessage(
  chatId: number,
  currentUserId: number,
  text?: string,
  entities?: ApiMessageEntity[],
  replyingTo?: number,
  attachment?: ApiAttachment,
  sticker?: ApiSticker,
  gif?: ApiVideo,
  poll?: ApiNewPoll,
  groupedId?: string,
): ApiMessage {
  const localId = localMessageCounter++;

  return {
    id: localId,
    chatId,
    content: {
      ...(text && {
        text: {
          text,
          entities,
        },
      }),
      ...(attachment && buildUploadingMedia(attachment)),
      ...(sticker && { sticker }),
      ...(gif && { video: gif }),
      ...(poll && buildNewPoll(poll, localId)),
    },
    date: Math.round(Date.now() / 1000),
    isOutgoing: true,
    senderUserId: currentUserId,
    sendingState: 'messageSendingStatePending',
    ...(replyingTo && { replyToMessageId: replyingTo }),
    groupedId,
  };
}

export function buildForwardedMessage(
  toChatId: number,
  currentUserId: number,
  message: ApiMessage,
): ApiMessage {
  const localId = localMessageCounter++;
  const {
    content,
    chatId: fromChatId,
    id: fromMessageId,
    senderUserId,
  } = message;

  return {
    id: localId,
    chatId: toChatId,
    content,
    date: Math.round(Date.now() / 1000),
    isOutgoing: true,
    senderUserId: currentUserId,
    sendingState: 'messageSendingStatePending',
    // Forward info doesn't get added when users forwards his own messages
    ...(senderUserId !== currentUserId && {
      forwardInfo: {
        fromChatId,
        fromMessageId,
        origin: {
          senderUserId,
        },
      },
    }),
  };
}

function buildUploadingMedia(
  attachment: ApiAttachment,
): ApiMessage['content'] {
  const {
    filename: fileName,
    blobUrl,
    previewBlobUrl,
    mimeType,
    size,
  } = attachment;

  if (attachment.quick) {
    const { width, height, duration } = attachment.quick;

    if (mimeType.startsWith('image/')) {
      return {
        photo: {
          sizes: [],
          thumbnail: { width, height, dataUri: '' }, // Used only for dimensions.
          blobUrl,
        },
      };
    } else {
      return {
        video: {
          id: LOCAL_VIDEO_TEMP_ID,
          duration: duration || 0,
          fileName,
          width,
          height,
          blobUrl,
          ...(previewBlobUrl && { thumbnail: { width, height, dataUri: previewBlobUrl } }),
          size,
        },
      };
    }
  } else if (attachment.voice) {
    const { duration, waveform } = attachment.voice;
    return {
      voice: {
        duration,
        waveform: reduceWaveform(waveform),
      },
    };
  } else if (mimeType.startsWith('audio/')) {
    return {
      audio: {
        mimeType,
        fileName,
        size,
        duration: 200, // Arbitrary.
      },
    };
  } else {
    return {
      document: {
        mimeType,
        fileName,
        size,
        ...(previewBlobUrl && { previewBlobUrl }),
      },
    };
  }
}

function buildNewPoll(poll: ApiNewPoll, localId: number) {
  return {
    poll: {
      id: localId.toString(),
      summary: pick(poll.summary, ['question', 'answers']),
      results: {},
    },
  };
}

function buildApiMessageEntity(entity: GramJs.TypeMessageEntity): ApiMessageEntity {
  const { className: type, offset, length } = entity;
  return {
    type,
    offset,
    length,
    ...('userId' in entity && typeof entity.userId === 'number' && { userId: entity.userId }),
    ...('url' in entity && { url: entity.url }),
  };
}
