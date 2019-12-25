import { ApiMessage, ApiPhoto } from '../../api/types';

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

// TODO Add chat ID and file reference.
export function getMessageMediaHash(message: ApiMessage): string | null {
  const { photo, sticker } = message.content;

  if (photo) {
    const size = getMessagePhotoInlineSize(photo);

    if (size && ('photo' in size) && size.photo !== undefined) {
      // TdLib way.
      return `msg${size.photo.id}`;
    } else {
      // GramJs way.
      return `msg${message.id}`;
    }
  }

  if (sticker) {
    if (sticker.sticker && sticker.sticker.photo) {
      // TdLib way.
      return `msg${sticker.sticker.photo.id}`;
    } else {
      // GramJs way.
      return `msg${message.id}`;
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
