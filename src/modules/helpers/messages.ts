import { ApiMessage } from '../../api/types';
import searchWords from '../../util/searchWords';

const CONTENT_NOT_SUPPORTED = 'The message is not supported on this version of Telegram';

export function getMessageKey(chatId: number, messageId: number) {
  return `msg${chatId}-${messageId}`;
}

export function getMessageRenderKey(message: ApiMessage) {
  return message.prev_local_id || message.id;
}

export function getLastMessageText(message: ApiMessage) {
  const {
    text,
    photo,
    video,
    audio,
    voice,
    document,
    sticker,
    contact,
    poll,
  } = message.content;

  if (photo) {
    if (text && text.text.length) {
      return `(Photo) ${text.text}`;
    }
    return 'Photo';
  }

  if (video) {
    if (text && text.text.length) {
      return `(Video) ${text.text}`;
    }
    return 'Video';
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

export function searchMessageText(message: ApiMessage, query: string) {
  const text = getMessageText(message);
  return text && searchWords(text, query);
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
