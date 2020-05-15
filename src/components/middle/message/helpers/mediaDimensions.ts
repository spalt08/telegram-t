import { ApiMessage } from '../../../../api/types';
import {
  calculateInlineImageDimensions,
  calculateVideoDimensions,
  AlbumMediaParameters,
} from '../../../common/helpers/mediaDimensions';
import {
  getMessageText,
  getMessagePhoto,
  getMessageWebPagePhoto,
  isForwardedMessage,
  isOwnMessage,
  getMessageVideo,
} from '../../../../modules/helpers';

const MIN_MEDIA_WIDTH = 100;
const MIN_MEDIA_WIDTH_WITH_TEXT = 175;
const SMALL_IMAGE_THRESHOLD = 12;

export function getMinMediaWidth(hasText?: boolean) {
  return hasText ? MIN_MEDIA_WIDTH_WITH_TEXT : MIN_MEDIA_WIDTH;
}

export function calculateMediaDimensions(message: ApiMessage, albumMediaParams?: AlbumMediaParameters) {
  const isOwn = isOwnMessage(message);
  const isForwarded = isForwardedMessage(message);
  const photo = getMessagePhoto(message) || getMessageWebPagePhoto(message);
  const video = getMessageVideo(message);

  const isWebPagePhoto = Boolean(getMessageWebPagePhoto(message));
  const { width, height } = photo
    ? calculateInlineImageDimensions(photo, isOwn, isForwarded, isWebPagePhoto, albumMediaParams)
    : calculateVideoDimensions(video!, isOwn, isForwarded, albumMediaParams);

  const hasText = Boolean(getMessageText(message));
  const minMediaWidth = getMinMediaWidth(hasText);
  const minMediaHeight = getMinMediaWidth(false);

  let stretchFactor = 1;
  if (width < minMediaWidth && minMediaWidth - width < SMALL_IMAGE_THRESHOLD) {
    stretchFactor = minMediaWidth / width;
  }
  if (height * stretchFactor < minMediaHeight && minMediaHeight - height * stretchFactor < SMALL_IMAGE_THRESHOLD) {
    stretchFactor = minMediaHeight / height;
  }

  const finalWidth = Math.round(width * stretchFactor);
  const finalHeight = Math.round(height * stretchFactor);

  return {
    width: finalWidth,
    height: finalHeight,
    isSmall: finalWidth < minMediaWidth || finalHeight < minMediaHeight,
  };
}
