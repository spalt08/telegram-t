import { ApiMessage } from '../../api/types';
import { LOCAL_MESSAGE_ID_BASE, SERVICE_NOTIFICATIONS_USER_ID } from '../../config';

const CONTENT_NOT_SUPPORTED = 'The message is not supported on this version of Telegram';
const RE_LINK = /(^|\s)(([a-z]{3,}?:\/\/)?([a-z0-9]+([-.@][a-z0-9]+)*\.[a-z]{2,}\.?(:[0-9]{1,5})?)([/#?][^\s]*)?)\b/;

export function getMessageKey(message: ApiMessage) {
  const { chatId, id } = message;

  return `msg${chatId}-${id}`;
}

export function getMessageOriginalId(message: ApiMessage) {
  return message.previousLocalId || message.id;
}

export function getMessageSummaryText(message: ApiMessage, hasPictogram = false) {
  const {
    text, photo, video, audio, voice, document, sticker, contact, poll,
  } = message.content;

  if (message.groupedId) {
    if (text && text.text.length) {
      return `${!hasPictogram ? '🖼 ' : ''}${text.text}`;
    }
    return 'Album';
  }

  if (photo) {
    if (text && text.text.length) {
      return `${!hasPictogram ? '🖼 ' : ''}${text.text}`;
    }
    return 'Photo';
  }

  if (video) {
    if (text && text.text.length) {
      return `${!hasPictogram ? `${video.isGif ? 'GIF' : '📹'} ` : ''}${text.text}`;
    }

    return video.isGif ? 'GIF' : 'Video';
  }

  if (text) {
    return text.text;
  }

  if (sticker) {
    return `Sticker ${sticker.emoji}`;
  }

  if (audio) {
    return 'Audio';
  }

  if (voice) {
    return 'Voice Message';
  }

  if (document) {
    return document.fileName;
  }

  if (contact) {
    return 'Contact';
  }

  if (poll) {
    return `📊 ${poll.summary.question}`;
  }

  return CONTENT_NOT_SUPPORTED;
}

export function getMessageText(message: ApiMessage) {
  const {
    text, sticker, photo, video, audio, voice, document, poll, webPage, contact,
  } = message.content;

  if (text) {
    return text.text;
  }

  if (sticker || photo || video || audio || voice || document || contact || poll || webPage) {
    return undefined;
  }

  return CONTENT_NOT_SUPPORTED;
}

export function matchLinkInMessageText(message: ApiMessage) {
  const { text } = message.content;
  const match = text && text.text.match(RE_LINK);

  if (!match) {
    return undefined;
  }

  return {
    url: match[2],
    domain: match[4],
  };
}

export function isOwnMessage(message: ApiMessage) {
  return message.isOutgoing;
}

export function isReplyMessage(message: ApiMessage) {
  return Boolean(message.replyToMessageId);
}

export function isForwardedMessage(message: ApiMessage) {
  return Boolean(message.forwardInfo);
}

export function isActionMessage(message: ApiMessage) {
  return !!message.content.action;
}

export function isServiceNotificationMessage(message: ApiMessage) {
  return message.chatId === SERVICE_NOTIFICATIONS_USER_ID && isMessageLocal(message);
}

export function getSendingState(message: ApiMessage) {
  if (!message.sendingState) {
    return 'succeeded';
  }

  return message.sendingState === 'messageSendingStateFailed' ? 'failed' : 'pending';
}

export function isMessageLocal(message: ApiMessage) {
  return message.id >= LOCAL_MESSAGE_ID_BASE;
}

export function getMessageAction(message: ApiMessage) {
  return message.content.action;
}
