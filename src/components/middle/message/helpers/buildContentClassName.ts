import { ApiMessage } from '../../../../api/types';

import { getMessageContent } from '../../../../modules/helpers';

export function buildContentClassName(
  message: ApiMessage,
  {
    hasReply,
    customShape,
    isLastInGroup,
  }: {
    hasReply?: boolean;
    customShape?: boolean | number;
    isLastInGroup?: boolean;
  } = {},
) {
  const {
    text, photo, video, audio, voice, document, poll, webPage, contact,
  } = getMessageContent(message);

  const classNames = ['message-content'];
  const isMediaWithNoText = (photo || video) && !text;

  if (typeof customShape === 'number') {
    classNames.push(`emoji-only emoji-only-${customShape}`);
  } else if (text) {
    classNames.push('text');
  }

  if (customShape) {
    classNames.push('custom-shape');
    if (video && video.isRound) {
      classNames.push('round');
    }
  }
  if (photo || video) {
    classNames.push('media');
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

  if (message.forwardInfo && !customShape) {
    classNames.push('is-forwarded');
  }

  if (hasReply) {
    classNames.push('is-reply');
  }

  if (!customShape) {
    classNames.push('has-shadow');

    if (hasReply || message.forwardInfo || !isMediaWithNoText) {
      classNames.push('has-solid-background');
    }

    if (isLastInGroup && (photo || !isMediaWithNoText)) {
      classNames.push('has-appendix');
    }
  }

  return classNames.join(' ');
}
