import { ApiMessage } from '../../api/types';

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

  if (photo) {
    return caption ? caption.text : undefined;
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

export function getMessageFileId(message: ApiMessage): number | null {
  const { photo, sticker } = message.content;

  if (photo) {
    const mSize = photo.sizes.find((size) => size.type === 'm');

    if (!mSize) {
      throw new Error('mSize not found');
    }

    if (mSize.photo) {
      // TdLib way.
      return mSize.photo.id;
    } else {
      // GramJs way.
      return message.id;
    }
  }

  if (sticker) {
    if (sticker.sticker && sticker.sticker.photo) {
      // TdLib way.
      return sticker.sticker.photo.id;
    } else {
      // GramJs way.
      return message.id;
    }
  }

  return null;
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

export function isMessageLocal(message: ApiMessage) {
  return message.id < 0;
}
