import { ApiPhoto, ApiVideo, ApiSticker } from '../../../api/types';
import { getPhotoInlineDimensions, getVideoDimensions, IDimensions } from '../../../modules/helpers';
import windowSize from '../../../util/windowSize';
import { MOBILE_SCREEN_MAX_WIDTH } from '../../../config';

export type AlbumMediaParameters = {
  mediaCount: number;
  columnCount: number;
  isVerticalLayout?: boolean;
  isFullWidth?: boolean;
};

export const MEDIA_VIEWER_MEDIA_QUERY = '(max-height: 640px)';
const DEFAULT_MEDIA_DIMENSIONS: IDimensions = { width: 100, height: 100 };
export const REM = parseInt(getComputedStyle(document.documentElement).fontSize, 10);
export const ROUND_VIDEO_DIMENSIONS = 200;
export const AVATAR_FULL_DIMENSIONS = { width: 640, height: 640 };

function getMaxMessageWidthRem(fromOwnMessage: boolean) {
  const regularMaxWidth = fromOwnMessage ? 30 : 29;
  if (window.innerWidth > MOBILE_SCREEN_MAX_WIDTH) {
    return regularMaxWidth;
  }

  return Math.min(regularMaxWidth, Math.floor(window.innerWidth * 0.75) / REM);
}

function getAvailableWidth(
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  isWebPagePhoto?: boolean,
  albumMediaParams?: AlbumMediaParameters,
) {
  const { columnCount, isFullWidth } = albumMediaParams || {};
  let extraPaddingRem = isForwarded ? 1.75 : isWebPagePhoto ? 1.625 : 0;
  if (columnCount && !isFullWidth) {
    extraPaddingRem += 0.125 * (columnCount - 1);
  }
  const availableWidthRem = (getMaxMessageWidthRem(fromOwnMessage) - extraPaddingRem)
    / (columnCount && !isFullWidth ? columnCount : 1);

  return availableWidthRem * REM;
}

function getAvailableHeight(isGif?: boolean, aspectRatio?: number) {
  if (
    isGif && aspectRatio
    && aspectRatio >= 0.75 && aspectRatio <= 1.25
  ) {
    return 20 * REM;
  }

  return 27 * REM;
}

function calculateDimensionsForMessageMedia({
  width,
  height,
  fromOwnMessage,
  isForwarded,
  isWebPagePhoto,
  isGif,
  albumMediaParams,
}: {
  width: number;
  height: number;
  fromOwnMessage: boolean;
  isForwarded?: boolean;
  isWebPagePhoto?: boolean;
  isGif?: boolean;
  albumMediaParams?: AlbumMediaParameters;
}): IDimensions {
  const aspectRatio = height / width;
  const availableWidth = getAvailableWidth(fromOwnMessage, isForwarded, isWebPagePhoto, albumMediaParams);
  const availableHeight = getAvailableHeight(isGif, aspectRatio);

  return calculateDimensions(availableWidth, availableHeight, width, height, albumMediaParams);
}

export function getMediaViewerAvailableDimensions(withFooter: boolean): IDimensions {
  const mql = window.matchMedia(MEDIA_VIEWER_MEDIA_QUERY);
  const { width: windowWidth, height: windowHeight } = windowSize.get();
  let occupiedHeightRem = 8.25;
  if (withFooter) {
    occupiedHeightRem = mql.matches ? 10 : 15;
  }

  return {
    width: windowWidth,
    height: windowHeight - occupiedHeightRem * REM,
  };
}

export function calculateInlineImageDimensions(
  photo: ApiPhoto,
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  isWebPagePhoto?: boolean,
  albumMediaParams?: AlbumMediaParameters,
) {
  const { width, height } = getPhotoInlineDimensions(photo) || DEFAULT_MEDIA_DIMENSIONS;

  return calculateDimensionsForMessageMedia({
    width,
    height,
    fromOwnMessage,
    isForwarded,
    isWebPagePhoto,
    albumMediaParams,
  });
}

export function calculateVideoDimensions(
  video: ApiVideo,
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  albumMediaParams?: AlbumMediaParameters,
) {
  const { width, height } = getVideoDimensions(video) || DEFAULT_MEDIA_DIMENSIONS;

  return calculateDimensionsForMessageMedia({
    width,
    height,
    fromOwnMessage,
    isForwarded,
    isGif: video.isGif,
    albumMediaParams,
  });
}

export function getPictogramDimensions(): IDimensions {
  return {
    width: 2 * REM,
    height: 2 * REM,
  };
}

export function getDocumentThumbnailDimensions(smaller?: boolean): IDimensions {
  if (smaller) {
    return {
      width: 3 * REM,
      height: 3 * REM,
    };
  }

  return {
    width: 3.375 * REM,
    height: 3.375 * REM,
  };
}

export function getStickerDimensions(sticker: ApiSticker): IDimensions {
  const { width, height } = sticker;
  const aspectRatio = (height && width) && height / width;
  const baseWidth = 16 * REM;
  const calculatedHeight = aspectRatio ? baseWidth * aspectRatio : baseWidth;

  if (aspectRatio && calculatedHeight > baseWidth) {
    return {
      width: Math.round(baseWidth / aspectRatio),
      height: baseWidth,
    };
  }

  return {
    width: baseWidth,
    height: calculatedHeight,
  };
}

export function calculateMediaViewerDimensions({ width, height }: IDimensions, withFooter: boolean): IDimensions {
  const { width: availableWidth, height: availableHeight } = getMediaViewerAvailableDimensions(withFooter);

  return calculateDimensions(availableWidth, availableHeight, width, height);
}

export function calculateDimensions(
  availableWidth: number,
  availableHeight: number,
  mediaWidth: number,
  mediaHeight: number,
  albumMediaParams?: AlbumMediaParameters,
): IDimensions {
  const aspectRatio = mediaHeight / mediaWidth;
  const calculatedWidth = Math.min(mediaWidth, availableWidth);
  const calculatedHeight = Math.round(calculatedWidth * aspectRatio);

  if (albumMediaParams) {
    return {
      width: availableWidth,
      height: Math.round(availableWidth * aspectRatio),
    };
  }

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
