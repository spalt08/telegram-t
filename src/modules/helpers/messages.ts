import { ApiMessage } from '../../api/types';
import searchWords from '../../util/searchWords';

export function getMessageKey(chatId: number, messageId: number) {
  return `msg${chatId}-${messageId}`;
}

export function getLastMessageText(message: ApiMessage) {
  const {
    text,
    photo,
    video,
    document,
    sticker,
    contact,
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

  if (document) {
    return document.fileName;
  }

  if (contact) {
    return 'Contact';
  }

  return '%UNSUPPORTED_CONTENT%';
}

export function getMessageText(message: ApiMessage) {
  const {
    text,
    document,
    photo,
    video,
    sticker,
    contact,
  } = message.content;
  if (text) {
    return text.text;
  }

  if (sticker || document || photo || video || contact) {
    return undefined;
  }

  return '%UNSUPPORTED_CONTENT%';
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
