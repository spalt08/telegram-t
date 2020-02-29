import { ApiMessage } from '../../api/types';

const CONTENT_NOT_SUPPORTED = 'The message is not supported on this version of Telegram';
const RE_LINK = /(^|\s)(([a-z]{3,}?:\/\/)?([a-z0-9]+([-.@][a-z0-9]+)*\.[a-z]{2,}\.?(:[0-9]{1,5})?)([/#?][^\s]*)?)\b/;

export function getMessageKey(chatId: number, messageId: number) {
  return `msg${chatId}-${messageId}`;
}

export function getMessageRenderKey(message: ApiMessage) {
  return message.prev_local_id || message.id;
}

export function getMessageSummaryText(message: ApiMessage, hasPictogram = false) {
  const {
    text, photo, video, audio, voice, document, sticker, contact, poll,
  } = message.content;

  if (photo) {
    if (text && text.text.length) {
      return `${!hasPictogram ? '(Photo) ' : ''}${text.text}`;
    }
    return 'Photo';
  }

  if (video) {
    const typeString = video.isGif ? 'GIF' : 'Video';

    if (text && text.text.length) {
      return `${!hasPictogram ? `(${typeString}) ` : ''}${text.text}`;
    }
    return typeString;
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
    return `(Poll) ${poll.summary.question}`;
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
  return message.is_outgoing;
}

export function isReplyMessage(message: ApiMessage) {
  return Boolean(message.reply_to_message_id);
}

export function isForwardedMessage(message: ApiMessage) {
  return Boolean(message.forward_info);
}

export function isActionMessage(message: ApiMessage) {
  return !!message.content.action;
}

export function getSendingState(message: ApiMessage) {
  if (!message.sending_state) {
    return 'succeeded';
  }

  return message.sending_state['@type'] === 'messageSendingStateFailed' ? 'failed' : 'pending';
}

export function isMessageLocal(message: ApiMessage) {
  return message.id < 0;
}

export function getMessageAction(message: ApiMessage) {
  return message.content.action;
}
