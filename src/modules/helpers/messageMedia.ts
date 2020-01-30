import { ApiMessage, ApiPhoto, ApiVideo } from '../../api/types';

const MAX_INLINE_VIDEO_DURATION = 10;

export function getMessagePhoto(message: ApiMessage) {
  return message.content.photo;
}

export function getMessageVideo(message: ApiMessage) {
  return message.content.video;
}

export function getMessageSticker(message: ApiMessage) {
  return message.content.sticker;
}

export function getMessageDocument(message: ApiMessage) {
  if (getMessageSticker(message) || getMessageVideo(message)) {
    return undefined;
  }

  return message.content.document;
}

export function getMessageContact(message: ApiMessage) {
  return message.content.contact;
}

export function getMessageMediaThumbDataUri(message: ApiMessage) {
  const { thumbnail } = message.content.photo || message.content.video || message.content.sticker || {};

  return thumbnail ? thumbnail.dataUri : undefined;
}

export function getMessageMediaHash(
  message: ApiMessage,
  target: 'inline' | 'pictogram' | 'viewerPreview' | 'viewerFull',
) {
  const { photo, video, sticker } = message.content;
  const base = `msg${message.chat_id}-${message.id}`;

  if (photo) {
    switch (target) {
      case 'inline':
        return `${base}?size=x`;
      case 'pictogram':
        return `${base}?size=m`;
      case 'viewerPreview':
        return `${base}?size=x`;
      case 'viewerFull':
        return `${base}?size=z`;
    }
  }

  if (video) {
    switch (target) {
      case 'inline':
        return canMessagePlayVideoInline(video) ? base : `${base}?size=m`;
      case 'pictogram':
        return `${base}?size=m`;
      case 'viewerPreview':
        return `${base}?size=m`;
      case 'viewerFull':
        return base;
    }
  }

  if (sticker) {
    switch (target) {
      case 'inline':
        return base;
    }
  }

  return undefined;
}

export function canMessagePlayVideoInline(video: ApiVideo): boolean {
  return video.duration <= MAX_INLINE_VIDEO_DURATION;
}

export function getMessagePhotoInlineSize(photo: ApiPhoto) {
  return (
    photo.sizes.find((size) => size.type === 'm')
    || photo.sizes.find((size) => size.type === 's')
    || photo.thumbnail
  );
}

export function getMessagePhotoMaxSize(photo: ApiPhoto) {
  return (
    photo.sizes.find((size) => size.type === 'y')
    || photo.sizes.find((size) => size.type === 'x')
    || getMessagePhotoInlineSize(photo)
  );
}

export function getChatMediaMessageIds(messages: Record<number, ApiMessage>) {
  return Object.keys(messages)
    .reduce((result, id) => {
      const messageId = Number(id);
      if (messages[messageId].content.photo || messages[messageId].content.video) {
        result.push(messageId);
      }

      return result;
    }, [] as Array<number>);
}
