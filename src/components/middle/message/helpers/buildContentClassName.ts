import { ApiMessage } from '../../../../api/types';

import { getMessageContent } from '../../../../modules/helpers';

export function buildContentClassName(
  message: ApiMessage,
  {
    isOwn,
    hasReply,
    isLastInGroup,
    customShape,
  }: {
    isOwn?: boolean;
    hasReply?: boolean;
    isLastInGroup?: boolean;
    customShape?: boolean | number;
  } = {},
) {
  const {
    text, photo, video, audio, voice, document, poll, webPage, contact,
  } = getMessageContent(message);

  const classNames = ['message-content'];

  if (typeof customShape === 'number') {
    classNames.push(`emoji-only emoji-only-${customShape}`);
  } else if (text) {
    classNames.push('text');
  }

  if (customShape) {
    classNames.push('sticker');
  } else if (photo || video) {
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

  if (message.forward_info && !customShape) {
    classNames.push('is-forwarded');
  }

  if (hasReply) {
    classNames.push('is-reply');
  }

  if (!customShape) {
    classNames.push('has-solid-background');

    if (!(classNames.includes('media') && !text && !classNames.includes('is-forwarded'))) {
      classNames.push('can-have-appendix');

      if (isLastInGroup) {
        classNames.push(isOwn ? 'has-appendix-own' : 'has-appendix-not-own');
      }
    }
  }

  classNames.push('status-read');

  return classNames.join(' ');
}
