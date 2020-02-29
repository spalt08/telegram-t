import { ApiMessage } from '../../../../api/types';

import parseEmojiOnlyString from '../../../common/helpers/parseEmojiOnlyString';
import { getMessageContent } from '../../../../modules/helpers';

const SOLID_BACKGROUND_CLASSES = [
  'text', 'media', 'audio', 'voice', 'document', 'contact', 'poll', 'webPage', 'is-forwarded', 'is-reply',
];

export function buildContentClassName(
  message: ApiMessage,
  {
    isOwn,
    hasReply,
    isLastInGroup,
  }: {
    isOwn?: boolean;
    hasReply?: boolean;
    isLastInGroup?: boolean;
  } = {},
) {
  const {
    text, sticker, photo, video, audio, voice, document, poll, webPage, contact,
  } = getMessageContent(message);

  const classNames = ['message-content'];
  let asSticker = false;

  if (text) {
    const emojiOnlyCount = parseEmojiOnlyString(text.text);

    if (!photo && emojiOnlyCount) {
      asSticker = true;
      classNames.push(`sticker emoji-only emoji-only-${emojiOnlyCount}`);
    } else {
      classNames.push('text');
    }
  }

  if (sticker) {
    asSticker = true;
    classNames.push('sticker');
  } else if (photo || video) {
    if (video && video.isRound) {
      asSticker = true;
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

  if (hasReply) {
    classNames.push('is-reply');
  }

  if (
    classNames.some((className) => SOLID_BACKGROUND_CLASSES.includes(className))
    && !asSticker
  ) {
    classNames.push('has-solid-background');

    if (!(classNames.includes('media') && !text && !classNames.includes('is-forwarded'))) {
      classNames.push('can-have-appendix');

      if (isLastInGroup) {
        classNames.push(isOwn ? 'has-appendix-own' : 'has-appendix-not-own');
      }
    }
  }

  classNames.push('status-read');

  return {
    contentClassName: classNames.join(' '),
    asSticker,
  };
}
