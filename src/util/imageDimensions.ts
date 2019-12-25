import { ApiPhoto, ApiVideo, ApiSticker } from '../api/types';
import { getMessagePhotoMaxSize } from '../modules/helpers';

const DEFAULT_MEDIA_DIMENSIONS = { width: 100, height: 100 };

function getRemValue() {
  return window.innerWidth > 1440 ? 16 : 14;
}

function getAvailableWidth(fromOwnMessage: boolean, isForwarded?: boolean) {
  const rem = getRemValue();
  const extraPadding = isForwarded ? 1.75 : 0;
  if (fromOwnMessage) {
    return (30 - extraPadding) * rem;
  }
  return (29 - extraPadding) * rem;
}

function getAvailableHeight() {
  const rem = getRemValue();
  return 27 * rem;
}

function calculateDimensions(width: number, height: number, fromOwnMessage: boolean, isForwarded?: boolean) {
  const aspectRatio = height / width;
  const availableWidth = getAvailableWidth(fromOwnMessage, isForwarded);
  const calculatedWidth = Math.min(width, availableWidth);
  const calculatedHeight = Math.round(calculatedWidth * aspectRatio);
  const availableHeight = getAvailableHeight();

  if (calculatedHeight > availableHeight) {
    return {
      width: Math.round(availableHeight / aspectRatio),
      height: availableHeight,
    };
  }

  return {
    width: calculatedWidth,
    height: Math.round(calculatedWidth * aspectRatio),
  };
}

export function getImageDimensions(photo: ApiPhoto, fromOwnMessage: boolean, isForwarded?: boolean) {
  const { width, height } = getMessagePhotoMaxSize(photo) || DEFAULT_MEDIA_DIMENSIONS;
  return calculateDimensions(width, height, fromOwnMessage, isForwarded);
}

export function getVideoDimensions(video: ApiVideo, fromOwnMessage: boolean, isForwarded?: boolean) {
  const { width, height } = video.minithumbnail || DEFAULT_MEDIA_DIMENSIONS;
  return calculateDimensions(width, height, fromOwnMessage, isForwarded);
}

export function getReplyImageDimensions() {
  const rem = getRemValue();
  return {
    width: 2 * rem,
    height: 2 * rem,
  };
}

export function getStickerDimensions(sticker: ApiSticker) {
  const { width, height } = sticker;
  const aspectRatio = (height && width) && height / width;
  const rem = getRemValue();
  const baseWidth = 16 * rem;

  return {
    width: baseWidth,
    height: aspectRatio ? baseWidth * aspectRatio : baseWidth,
  };
}
