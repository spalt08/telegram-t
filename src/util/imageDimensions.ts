import { ApiPhoto, ApiSticker } from '../api/types';

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

export function getImageDimensions(photo: ApiPhoto, fromOwnMessage: boolean, isForwarded?: boolean) {
  const mediumSize = photo.sizes.find((size) => size.type === 'm');
  const { width, height } = mediumSize || photo.minithumbnail;
  const aspectRatio = height / width;
  const availableWidth = getAvailableWidth(fromOwnMessage, isForwarded);
  const calculatedHeight = Math.round(availableWidth * aspectRatio);
  const availableHeight = getAvailableHeight();

  if (calculatedHeight > availableHeight) {
    return {
      width: Math.round(availableHeight / aspectRatio),
      height: availableHeight,
    };
  }

  return {
    width: availableWidth,
    height: Math.round(availableWidth * aspectRatio),
  };
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
  const baseWidth = 12.5 * rem;

  return {
    width: baseWidth,
    height: aspectRatio ? baseWidth * aspectRatio : baseWidth,
  };
}
