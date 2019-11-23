import { ApiMessage, ApiPhoto } from '../../api/types';

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

  return '%MEDIA_CONTENT%';
}

export function getMessageText(message: ApiMessage) {
  const {
    text,
    photo,
    sticker,
    caption,
  } = message.content;
  if (text) {
    return text.text;
  }

  if (photo && caption) {
    return caption.text;
  }

  if (sticker) {
    return undefined;
  }

  return '%MEDIA_CONTENT%';
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
  const mediumSize = photo.sizes.find((size) => size.type === 'm');
  if (!mediumSize || !mediumSize.photo.local.is_downloading_completed) {
    return undefined;
  }

  return mediumSize.photo.local.path;
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
