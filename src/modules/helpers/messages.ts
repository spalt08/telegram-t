import { ApiMessage, ApiPhoto } from '../../api/types';

const MAX_INLINE_VIDEO_DURATION = 10;

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

export function getMessagePhoto(message: ApiMessage) {
  if (!message.content.photo) {
    return undefined;
  }

  return message.content.photo;
}

export function getMessageVideo(message: ApiMessage) {
  if (!message.content.video) {
    return undefined;
  }

  return message.content.video;
}

export function getMessageDocument(message: ApiMessage) {
  if (
    !message.content.document
    || getMessageSticker(message)
    || getMessageVideo(message)
  ) {
    return undefined;
  }

  return message.content.document;
}

export function getMessageSticker(message: ApiMessage) {
  return message.content.sticker;
}

export function getMessageContact(message: ApiMessage) {
  return message.content.contact;
}

export function getMessageMediaHash(message: ApiMessage, isInline = false): string | null {
  const { chat_id, content: { photo, video, sticker } } = message;

  const base = `msg${chat_id}-${message.id}`;

  if (photo) {
    return `${base}?size=x`;
  }

  if (sticker) {
    return base;
  }

  if (video) {
    if (isInline) {
      if (video.duration <= MAX_INLINE_VIDEO_DURATION) {
        // TODO Support inline video.
        // return base;
        return null;
      }

      return `${base}?size=m`;
    } else {
      return base;
    }
  }

  return null;
}

export function getMessagePhotoInlineSize(photo: ApiPhoto) {
  return (
    photo.sizes.find((size) => size.type === 'm')
    || photo.sizes.find((size) => size.type === 's')
    || photo.minithumbnail
  );
}

export function getMessagePhotoMaxSize(photo: ApiPhoto) {
  return (
    photo.sizes.find((size) => size.type === 'y')
    || photo.sizes.find((size) => size.type === 'x')
    || getMessagePhotoInlineSize(photo)
  );
}

export function isOwnMessage(message: ApiMessage) {
  return message.is_outgoing;
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

export function getChatMediaMessageIds(messages: Record<number, ApiMessage>) {
  return Object.keys(messages)
    .reduce((result, id) => {
      const messageId = Number(id);
      if (messages[messageId].content.photo) {
        result.push(messageId);
      }

      return result;
    }, [] as Array<number>);
}
