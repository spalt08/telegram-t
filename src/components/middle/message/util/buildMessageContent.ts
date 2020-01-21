import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import {
  getMessageText,
  getMessagePhoto,
  getMessageSticker,
  getMessageVideo,
  getMessageDocument,
  getLastMessageText,
  getMessageContact,
} from '../../../../modules/helpers';
import {
  ApiMessage,
  ApiPhoto,
  ApiSticker,
  ApiVideo,
  ApiDocument,
  ApiMiniThumbnail,
  ApiPhotoCachedSize,
  ApiContact,
} from '../../../../api/types';

import { TextPart, enhanceTextParts } from './enhanceText';

export interface MessageContent {
  text?: TextPart | TextPart[];
  photo?: ApiPhoto;
  video?: ApiVideo;
  document?: ApiDocument;
  sticker?: ApiSticker;
  contact?: ApiContact;
  replyThumbnail?: ApiMiniThumbnail | ApiPhotoCachedSize;
  className?: string;
}

interface BuildMessageContentOptions {
  isReply?: boolean;
}

export function buildMessageContent(message: ApiMessage, options: BuildMessageContentOptions = {}): MessageContent {
  const text = getMessageText(message);
  const photo = getMessagePhoto(message);
  const video = getMessageVideo(message);
  const document = getMessageDocument(message);
  const sticker = getMessageSticker(message);
  const contact = getMessageContact(message);
  const classNames = ['content'];
  let contentParts: TextPart | TextPart[] | undefined;
  let replyThumbnail: ApiMiniThumbnail | ApiPhotoCachedSize | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (!photo && emojiOnlyCount) {
      classNames.push('sticker');
      classNames.push(`emoji-only-${emojiOnlyCount}`);
      contentParts = text;
    } else {
      classNames.push('text');
      contentParts = !message.content.text ? text : enhanceTextParts(message.content.text);
    }
  }

  if (photo || video) {
    if (video && video.isRound) {
      classNames.push('round', 'sticker');
    } else {
      classNames.push('media');
    }

    if (options.isReply) {
      replyThumbnail = getReplyThumbnail(photo || video);
    }
  }

  if (sticker) {
    classNames.push('sticker');
    if (options.isReply) {
      replyThumbnail = sticker.thumbnail;
    }
  }

  if (document) {
    classNames.push('document');
  }

  if (contact) {
    classNames.push('contact');
  }

  if (message.forward_info && !classNames.includes('sticker')) {
    classNames.push('is-forwarded');
  }

  if (message.reply_to_message_id && !classNames.includes('sticker')) {
    classNames.push('is-reply');
  }

  if (options.isReply) {
    contentParts = getLastMessageText(message);
  }

  classNames.push('status-read');

  return {
    text: contentParts,
    photo,
    video,
    document,
    sticker,
    contact,
    replyThumbnail,
    className: classNames.join(' '),
  };
}

function getReplyThumbnail(media?: ApiPhoto | ApiVideo) {
  if (!media) {
    return undefined;
  }
  const { minithumbnail } = media;
  return minithumbnail;
}
