import { ApiPhoto, ApiVideo, ApiSticker } from '../api/types';
import { getPhotoInlineDimensions, getVideoDimensions, IDimensions } from '../modules/helpers';

export const MEDIA_VIEWER_MEDIA_QUERY = '(max-height: 640px)';
const DEFAULT_MEDIA_DIMENSIONS = { width: 100, height: 100 };
const REM = 16;

function getAvailableWidth(
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  isWebPagePhoto?: boolean,
) {
  const extraPadding = isForwarded ? 1.75 : isWebPagePhoto ? 1.625 : 0;
  if (fromOwnMessage) {
    return (30 - extraPadding) * REM;
  }
  return (29 - extraPadding) * REM;
}

function getAvailableHeight() {
  return 27 * REM;
}

function calculateDimensions(
  width: number,
  height: number,
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  isWebPagePhoto?: boolean,
) {
  const aspectRatio = height / width;
  const availableWidth = getAvailableWidth(fromOwnMessage, isForwarded, isWebPagePhoto);
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

function getMediaViewerAvailableDimensions(withFooter: boolean) {
  const mql = window.matchMedia(MEDIA_VIEWER_MEDIA_QUERY);
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const bodyWidth = document.body.clientWidth;
  const bodyHeight = document.body.clientHeight;
  let occupiedHeight = 8.25;
  if (withFooter) {
    occupiedHeight = mql.matches ? 11.5 : 16.5;
  }

  return {
    width: bodyWidth - rem,
    height: bodyHeight - occupiedHeight * rem,
  };
}

export function calculateInlineImageDimensions(
  photo: ApiPhoto,
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  isWebPagePhoto?: boolean,
) {
  const { width, height } = getPhotoInlineDimensions(photo) || DEFAULT_MEDIA_DIMENSIONS;
  return calculateDimensions(width, height, fromOwnMessage, isForwarded, isWebPagePhoto);
}

export function calculateVideoDimensions(video: ApiVideo, fromOwnMessage: boolean, isForwarded?: boolean) {
  const { width, height } = getVideoDimensions(video) || DEFAULT_MEDIA_DIMENSIONS;
  return calculateDimensions(width, height, fromOwnMessage, isForwarded);
}

export function getPictogramDimensions() {
  return {
    width: 2 * REM,
    height: 2 * REM,
  };
}

export function getStickerDimensions(sticker: ApiSticker) {
  const { width, height } = sticker;
  const aspectRatio = (height && width) && height / width;
  const baseWidth = 16 * REM;

  return {
    width: baseWidth,
    height: aspectRatio ? baseWidth * aspectRatio : baseWidth,
  };
}

export function calculateMediaViewerVideoDimensions({ width, height }: IDimensions, withFooter: boolean): IDimensions {
  const aspectRatio = height / width;
  const { width: availableWidth, height: availableHeight } = getMediaViewerAvailableDimensions(withFooter);
  const calculatedWidth = Math.min(width, availableWidth);
  const calculatedHeight = Math.round(calculatedWidth * aspectRatio);

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
