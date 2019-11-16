import { ApiMessage, ApiPhoto } from '../../../api/tdlib/types';

export function getLastMessageText(message: ApiMessage) {
  const {
    text,
    photo,
    sticker,
    caption,
  } = message.content;

  if (text) {
    return text.text;
  }

  if (photo) {
    if (caption && caption.text.length) {
      return `(Photo) ${caption.text}`;
    }
    return 'Photo';
  }

  if (sticker) {
    return `Sticker ${sticker.emoji}`;
  }

  return '%CONTENT_NOT_IMPLEMENTED%';
}

export function getMessageText(message: ApiMessage) {
  const { text, photo, caption } = message.content;
  if (text) {
    return text.text;
  }

  if (photo && caption) {
    return caption.text;
  }

  return undefined;
}

export function getMessagePhoto(message: ApiMessage) {
  if (!message.content.photo) {
    return undefined;
  }

  return message.content.photo;
}

export function getMessageSticker(message: ApiMessage) {
  return message.content.sticker;
}

export function getPhotoUrl(photo: ApiPhoto) {
  const mediumSize = photo.sizes[1].photo;
  if (!mediumSize || !mediumSize.local.is_downloading_completed) {
    return undefined;
  }

  return mediumSize.local.path;
}

export function isOwnMessage(message: ApiMessage) {
  return message.is_outgoing;
}

export function getSendingState(message: ApiMessage) {
  if (!message.sending_state) {
    return 'succeeded';
  }

  return message.sending_state['@type'] === 'messageSendingStateFailed' ? 'failed' : 'pending';
}
