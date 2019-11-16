import { ApiMessage, ApiPhoto } from '../../../api/tdlib/types';

export function getLastMessageText(message: ApiMessage) {
  if (message.content.text) {
    return message.content.text.text;
  }

  if (message.content.photo) {
    if (message.content.caption && message.content.caption.text.length) {
      return `(Photo) ${message.content.caption.text}`;
    }
    return 'Photo';
  }

  return '%CONTENT_NOT_IMPLEMENTED%';
}

export function getMessageText(message: ApiMessage) {
  if (message.content.text) {
    return message.content.text.text;
  }

  if (message.content.photo && message.content.caption) {
    return message.content.caption.text;
  }

  return '%CONTENT_NOT_IMPLEMENTED%';
}

export function getMessagePhoto(message: ApiMessage) {
  if (!message.content.photo) {
    return undefined;
  }

  return message.content.photo;
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
