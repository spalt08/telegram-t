import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import {
  getMessageText,
  getMessagePhoto,
  getMessageSticker,
  getMessageVideo,
  getMessageDocument,
  getLastMessageText,
  getMessageContact,
  isOwnMessage,
  getMessagePoll,
  getMessageWebPage,
} from '../../../../modules/helpers';
import {
  ApiMessage,
  ApiPhoto,
  ApiSticker,
  ApiVideo,
  ApiDocument,
  ApiContact,
  ApiPoll,
  ApiWebPage,
} from '../../../../api/types';

import { TextPart, enhanceTextParts } from './enhanceText';

export interface MessageContent {
  text?: TextPart | TextPart[];
  photo?: ApiPhoto;
  video?: ApiVideo;
  document?: ApiDocument;
  sticker?: ApiSticker;
  contact?: ApiContact;
  poll?: ApiPoll;
  webPage?: ApiWebPage;
  className?: string;
}

interface BuildMessageContentOptions {
  isReply?: boolean;
  hasReply?: boolean;
  isLastInGroup?: boolean;
}

const SOLID_BACKGROUND_CLASSES = ['text', 'media', 'contact', 'document', 'poll', 'is-forwarded', 'is-reply'];

export function buildMessageContent(message: ApiMessage, options: BuildMessageContentOptions = {}): MessageContent {
  const text = getMessageText(message);
  const photo = getMessagePhoto(message);
  const video = getMessageVideo(message);
  const document = getMessageDocument(message);
  const sticker = getMessageSticker(message);
  const contact = getMessageContact(message);
  const poll = getMessagePoll(message);
  const webPage = getMessageWebPage(message);
  const classNames = ['message-content'];
  let contentParts: TextPart | TextPart[] | undefined;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (!photo && emojiOnlyCount) {
      classNames.push('sticker');
      classNames.push(`emoji-only emoji-only-${emojiOnlyCount}`);
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
  }

  if (sticker) {
    classNames.push('sticker');
  }

  if (document) {
    classNames.push('document');
  }

  if (contact) {
    classNames.push('contact');
  }

  if (poll) {
    classNames.push('poll');
  }

  if (webPage) {
    classNames.push('web-page');

    if (webPage.photo) {
      classNames.push('media');
    }
  }

  if (message.forward_info && !classNames.includes('sticker')) {
    classNames.push('is-forwarded');
  }

  if (options.hasReply) {
    classNames.push('is-reply');
  }

  if (options.isReply) {
    contentParts = getLastMessageText(message);
  }

  if (
    !classNames.includes('sticker')
    && classNames.some((className) => SOLID_BACKGROUND_CLASSES.includes(className))
  ) {
    classNames.push('has-solid-background');

    if (!(classNames.includes('media') && !text && !classNames.includes('is-forwarded'))) {
      classNames.push('can-have-appendix');

      if (options.isLastInGroup) {
        classNames.push(isOwnMessage(message) ? 'has-appendix-own' : 'has-appendix-not-own');
      }
    }
  }

  classNames.push('status-read');

  return {
    text: contentParts,
    photo,
    video,
    document,
    sticker,
    contact,
    poll,
    webPage,
    className: classNames.join(' '),
  };
}
