import parseEmojiOnlyString from '../../../../util/parseEmojiOnlyString';
import {
  getMessageText,
  getLastMessageText,
  getMessageContent,
  isOwnMessage,
} from '../../../../modules/helpers';
import {
  ApiMessage,
  ApiSticker,
  ApiPhoto,
  ApiVideo,
  ApiAudio,
  ApiVoice,
  ApiDocument,
  ApiContact,
  ApiPoll,
  ApiWebPage,
} from '../../../../api/types';

import { TextPart, enhanceTextParts } from './enhanceText';

export interface MessageContent {
  isEmojiOnly: boolean;
  text?: TextPart | TextPart[];
  photo?: ApiPhoto;
  video?: ApiVideo;
  audio?: ApiAudio;
  voice?: ApiVoice;
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

const SOLID_BACKGROUND_CLASSES = [
  'text', 'media', 'audio', 'voice', 'document', 'contact', 'poll', 'webPage', 'is-forwarded', 'is-reply',
];

export function buildMessageContent(message: ApiMessage, options: BuildMessageContentOptions = {}): MessageContent {
  const text = getMessageText(message);
  const {
    sticker, photo, video, audio, voice, document, poll, webPage, contact,
  } = getMessageContent(message);
  const classNames = ['message-content'];

  let contentParts: TextPart | TextPart[] | undefined;
  let isEmojiOnly = false;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text);

    if (!photo && emojiOnlyCount) {
      classNames.push('sticker');
      classNames.push(`emoji-only emoji-only-${emojiOnlyCount}`);
      contentParts = text;
      isEmojiOnly = true;
    } else {
      classNames.push('text');
      contentParts = !message.content.text ? text : enhanceTextParts(message.content.text);
    }
  }

  if (sticker) {
    classNames.push('sticker');
  } else if (photo || video) {
    if (video && video.isRound) {
      classNames.push('round', 'sticker');
    } else {
      classNames.push('media');
    }
  } else if (audio) {
    classNames.push('audio');
  } else if (voice) {
    classNames.push('voice');
  } else if (document) {
    classNames.push('document');
  } else if (contact) {
    classNames.push('contact');
  } else if (poll) {
    classNames.push('poll');
  } else if (webPage) {
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
    isEmojiOnly,
    text: contentParts,
    photo,
    video,
    document,
    sticker,
    contact,
    poll,
    webPage,
    voice,
    className: classNames.join(' '),
  };
}
