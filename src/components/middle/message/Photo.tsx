import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { calculateInlineImageDimensions } from '../../../util/mediaDimensions';
import getMinMediaWidth from './util/minMediaWidth';
import {
  getMessageText,
  getMessagePhoto,
  getMessageWebPagePhoto,
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
  const photo = (getMessagePhoto(message) || getMessageWebPagePhoto(message))!;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const localBlobUrl = load ? photo.blobUrl : undefined;
  const mediaData = useMedia(getMessageMediaHash(message, 'inline'), !load);

  const {
    isTransferring, transferProgress,
  } = getMessageTransferParams(message, fileTransferProgress, !mediaData && !localBlobUrl);

  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && load);

  const {
    shouldRender: shouldFullMediaRender,
    transitionClassNames: fullMediaClassNames,
  } = useShowTransition(Boolean(mediaData));

  const { width, height, isSmall } = calculateDimensions(message);

  let className = 'media-inner';
  if (!isTransferring) {
    className += ' has-viewer';
  }
  if (isSmall) {
    className += ' small-image';
  }
  if (width === height) {
    className += ' square-image';
  }

  let thumbClassName = 'thumbnail';
  if (!mediaData && !localBlobUrl) {
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
      <img
        src={localBlobUrl || thumbDataUri}
        className={thumbClassName}
        width={width}
        height={height}
        alt=""
      />
      {shouldFullMediaRender && (
        <img
          src={mediaData}
          className={['full-media', ...fullMediaClassNames].join(' ')}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldSpinnerRender && (
        <div className={['message-media-loading', ...spinnerClassNames].join(' ')}>
          <ProgressSpinner progress={transferProgress} onClick={onCancelTransfer} />
        </div>
      )}
      {isTransferring && (
        <span className="message-upload-progress">{Math.round(transferProgress * 100)}%</span>
      )}
    </div>
  );
};

function calculateDimensions(message: ApiMessage) {
  const isOwn = isOwnMessage(message);
  const isForwarded = isForwardedMessage(message);
  const photo = (getMessagePhoto(message) || getMessageWebPagePhoto(message))!;
  const isWebPagePhoto = Boolean(getMessageWebPagePhoto(message));
  const { width, height } = calculateInlineImageDimensions(photo, isOwn, isForwarded, isWebPagePhoto);

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
