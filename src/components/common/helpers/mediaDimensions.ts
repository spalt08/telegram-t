import { ApiPhoto, ApiVideo, ApiSticker } from '../../../api/types';
import { getPhotoInlineDimensions, getVideoDimensions, IDimensions } from '../../../modules/helpers';

export type AlbumMediaParameters = {
  mediaCount: number;
  columnCount: number;
  isVerticalLayout?: boolean;
  isFullWidth?: boolean;
};

export const MEDIA_VIEWER_MEDIA_QUERY = '(max-height: 640px)';
const DEFAULT_MEDIA_DIMENSIONS: IDimensions = { width: 100, height: 100 };
const REM = 16;

function getAvailableWidth(
  fromOwnMessage: boolean,
  isForwarded?: boolean,
  isWebPagePhoto?: boolean,
  albumMediaParams?: AlbumMediaParameters,
) {
  const { columnCount, isFullWidth } = albumMediaParams || {};
  let extraPadding = isForwarded ? 1.75 : isWebPagePhoto ? 1.625 : 0;
  if (columnCount && !isFullWidth) {
    extraPadding += 0.125 * (columnCount - 1);
  }
  const maxMessageWidth = fromOwnMessage ? 30 : 29;
  const availableWidth = (maxMessageWidth - extraPadding) / (columnCount && !isFullWidth ? columnCount : 1);

  return availableWidth * REM;
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

function calculateDimensions({
  width,
  height,
  fromOwnMessage,
  isForwarded,
  isWebPagePhoto,
  isGif,
  albumMediaParams,
} : {
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
  const calculatedWidth = Math.min(width, availableWidth);
  const calculatedHeight = Math.round(calculatedWidth * aspectRatio);
  const availableHeight = getAvailableHeight(isGif, aspectRatio);

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

function getMediaViewerAvailableDimensions(withFooter: boolean): IDimensions {
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
  albumMediaParams?: AlbumMediaParameters,
) {
  const { width, height } = getPhotoInlineDimensions(photo) || DEFAULT_MEDIA_DIMENSIONS;
  return calculateDimensions({
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
  return calculateDimensions({
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
