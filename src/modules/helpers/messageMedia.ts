import { ApiMessage, ApiPhoto, ApiVideo } from '../../api/types';

type IDimensions = {
  width: number;
  height: number;
};

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
  const { photo, video, sticker } = message.content;
  const media = photo || video || sticker;

  if (!media) {
    return undefined;
  }

  return media.thumbnail ? media.thumbnail.dataUri : undefined;
}

export function getMessageMediaHash(
  message: ApiMessage,
  target: 'inline' | 'pictogram' | 'viewerPreview' | 'viewerFull',
) {
  const { photo, video, sticker } = message.content;

  if (!(photo || video || sticker)) {
    return undefined;
  }

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

export function getPhotoDimensions(photo: ApiPhoto): IDimensions | undefined {
  return (
    photo.sizes.find((size) => size.type === 'x')
    || photo.sizes.find((size) => size.type === 'm')
    || photo.sizes.find((size) => size.type === 's')
    || photo.thumbnail
  );
}

export function getVideoDimensions(video: ApiVideo): IDimensions | undefined {
  if (video.thumbnail) {
    return video.thumbnail;
  }

  if (video.width && video.height) {
    return video! as IDimensions;
  }

  return undefined;
}
