import {
  ApiMessage, ApiMessageSearchType,
  ApiPhoto,
  ApiVideo,
} from '../../api/types';
import { getMessageKey, matchLinkInMessageText, isMessageLocal } from './messages';

export type IDimensions = {
  width: number;
  height: number;
};

const MAX_INLINE_VIDEO_DURATION = 10;

export function getMessageMedia(message: ApiMessage) {
  return getMessagePhoto(message)
    || getMessageVideo(message)
    || getMessageSticker(message)
    || getMessageWebPagePhoto(message);
}

export function getMessageContent(message: ApiMessage) {
  return message.content;
}

export function getMessagePhoto(message: ApiMessage) {
  return message.content.photo;
}

export function getMessageVideo(message: ApiMessage) {
  return message.content.video;
}

export function getMessageAudio(message: ApiMessage) {
  return message.content.audio;
}

export function getMessageVoice(message: ApiMessage) {
  return message.content.voice;
}

export function getMessageSticker(message: ApiMessage) {
  return message.content.sticker;
}

export function getMessageDocument(message: ApiMessage) {
  return message.content.document;
}

export function getMessageContact(message: ApiMessage) {
  return message.content.contact;
}

export function getMessagePoll(message: ApiMessage) {
  return message.content.poll;
}

export function getMessageWebPage(message: ApiMessage) {
  return message.content.webPage;
}

export function getMessageWebPagePhoto(message: ApiMessage) {
  const webPage = getMessageWebPage(message);
  return webPage ? webPage.photo : undefined;
}

export function getMessageMediaThumbnail(message: ApiMessage) {
  const media = getMessageMedia(message);

  if (!media) {
    return undefined;
  }

  return media.thumbnail;
}

export function getMessageMediaThumbDataUri(message: ApiMessage) {
  const thumbnail = getMessageMediaThumbnail(message);

  return thumbnail ? thumbnail.dataUri : undefined;
}

export function getMessageMediaHash(
  message: ApiMessage,
  target: 'inline' | 'pictogram' | 'viewerPreview' | 'viewerFull',
) {
  const {
    photo, video, sticker, audio, voice,
  } = message.content;
  const webPagePhoto = getMessageWebPagePhoto(message);

  if (!(photo || video || sticker || webPagePhoto || audio || voice)) {
    return undefined;
  }

  const base = getMessageKey(message.chat_id, message.id);

  if (photo || webPagePhoto) {
    switch (target) {
      case 'inline':
        if (hasMessageLocalBlobUrl(message)) {
          return undefined;
        }

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
        if (hasMessageLocalBlobUrl(message)) {
          return undefined;
        }

        return canMessagePlayVideoInline(video) ? base : `${base}?size=m`;
      case 'pictogram':
        return `${base}?size=m`;
      case 'viewerPreview':
        return `${base}?size=m`;
      case 'viewerFull':
        return base;
    }
  }

  if (sticker || audio || voice) {
    switch (target) {
      case 'inline':
        return base;
    }
  }

  return undefined;
}

export function getMessageMediaFilename(message: ApiMessage) {
  const { photo, video, webPage } = message.content;

  if (photo || (webPage && webPage.photo)) {
    return `photo${message.date}.jpeg`;
  }

  if (video) {
    return video.fileName;
  }

  return undefined;
}

export function hasMessageLocalBlobUrl(message: ApiMessage) {
  const { photo, video } = message.content;

  return (photo && photo.blobUrl) || (video && video.blobUrl);
}

export function canMessagePlayVideoInline(video: ApiVideo): boolean {
  return video.isGif || video.duration <= MAX_INLINE_VIDEO_DURATION;
}

export function getChatMediaMessageIds(messages: Record<number, ApiMessage>, reverseOrder = false) {
  const ids = Object.keys(messages)
    .reduce((result: number[], id) => {
      const messageId = Number(id);
      if (getMessagePhoto(messages[messageId]) || getMessageVideo(messages[messageId])) {
        result.push(messageId);
      }

      return result;
    }, []);

  return reverseOrder ? ids.reverse() : ids;
}

export function getPhotoFullDimensions(photo: ApiPhoto): IDimensions | undefined {
  return (
    photo.sizes.find((size) => size.type === 'z')
    || getPhotoInlineDimensions(photo)
  );
}

export function getPhotoInlineDimensions(photo: ApiPhoto): IDimensions | undefined {
  return (
    photo.sizes.find((size) => size.type === 'x')
    || photo.sizes.find((size) => size.type === 'm')
    || photo.sizes.find((size) => size.type === 's')
    || photo.thumbnail
  );
}

export function getVideoDimensions(video: ApiVideo): IDimensions | undefined {
  if (video.width && video.height) {
    return video as IDimensions;
  }

  return undefined;
}

export function getMessageTransferParams(message: ApiMessage, fileTransferProgress?: number, isDownloadNeeded = false) {
  const isUploading = isMessageLocal(message);
  const isDownloading = !isUploading && isDownloadNeeded;
  const isTransferring = isUploading || isDownloading;

  let transferProgress = 1;
  if (isUploading) {
    transferProgress = fileTransferProgress || 0;
  } else if (isDownloading) {
    transferProgress = fileTransferProgress || 0.15;
  }

  return {
    isUploading, isDownloading, isTransferring, transferProgress,
  };
}

export function getMessageContentIds(
  messages: Record<number, ApiMessage>, contentType: ApiMessageSearchType,
) {
  let validator: Function;

  switch (contentType) {
    case 'media':
      validator = (message: ApiMessage) => getMessagePhoto(message) || getMessageVideo(message);
      break;

    case 'documents':
      validator = getMessageDocument;
      break;

    case 'links':
      validator = (message: ApiMessage) => getMessageWebPage(message) || matchLinkInMessageText(message);
      break;

    case 'audio':
      validator = getMessageAudio;
      break;
  }

  return Object.keys(messages)
    .reduce((result, id) => {
      const messageId = Number(id);
      if (validator(messages[messageId])) {
        result.push(messageId);
      }

      return result;
    }, [] as Array<number>);
}
