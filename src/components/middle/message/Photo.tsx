import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { calculateInlineImageDimensions } from '../../../util/mediaDimensions';
import getMinMediaWidth from './util/minMediaWidth';
import {
  getMessageText,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessageTransferParams,
  isForwardedMessage,
  isOwnMessage,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useShowTransition from '../../../hooks/useShowTransition';

import ProgressSpinner from '../../ui/ProgressSpinner';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  fileTransferProgress?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelTransfer?: () => void;
};

const SMALL_IMAGE_THRESHOLD = 12;

const Photo: FC<IProps> = ({
  message,
  load,
  fileTransferProgress,
  onClick,
  onCancelTransfer,
}) => {
  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const { width, height, isSmall } = calculateDimensions(message);
  const mediaData = useMedia(getMessageMediaHash(message, 'inline'), !load);
  const {
    isShown: isSpinnerShown,
    transitionClassNames: spinnerClassNames,
    handleHideTransitionEnd: handleSpinnerTransitionEnd,
  } = useShowTransition(!mediaData && load);
  const {
    isUploading, isDownloading, transferProgress, isHighQualityThumb,
  } = getMessageTransferParams(message, fileTransferProgress);
  const isTransferring = isUploading || isDownloading;

  let className = 'media-inner';
  if (!isTransferring) {
    className += ' has-viewer';
  }
  if (isSmall) {
    className += ' small-image';
  }

  let thumbClassName = 'thumbnail';
  if (!mediaData && !isHighQualityThumb) {
    thumbClassName += ' blur';
  }
  if (!thumbDataUri) {
    thumbClassName += ' empty';
  }

  return (
    <div
      className={className}
      onClick={!isTransferring ? onClick : undefined}
    >
      {isTransferring && (
        <span className="message-upload-progress">{Math.round(transferProgress * 100)}%</span>
      )}
      <img
        src={thumbDataUri}
        className={thumbClassName}
        width={width}
        height={height}
        alt=""
      />
      {isSpinnerShown && (
        <div
          className={['message-media-loading', ...spinnerClassNames].join(' ')}
          onTransitionEnd={handleSpinnerTransitionEnd}
        >
          <ProgressSpinner progress={transferProgress} onClick={onCancelTransfer} />
        </div>
      )}
      <img
        src={mediaData}
        className={mediaData ? 'full-media fade-in' : 'full-media'}
        width={width}
        height={height}
        alt=""
      />
    </div>
  );
};

function calculateDimensions(message: ApiMessage) {
  const isOwn = isOwnMessage(message);
  const isForwarded = isForwardedMessage(message);
  const { width, height } = calculateInlineImageDimensions(message.content.photo!, isOwn, isForwarded);

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

  const finalWidth = width * stretchFactor;
  const finalHeight = height * stretchFactor;

  return {
    width: finalWidth,
    height: finalHeight,
    isSmall: finalWidth < minMediaWidth || finalHeight < minMediaHeight,
  };
}

export default Photo;
