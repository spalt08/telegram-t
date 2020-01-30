import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { getImageDimensions } from '../../../util/mediaDimensions';
import getMinMediaWidth from './util/minMediaWidth';
import Spinner from '../../ui/Spinner';

import {
  getMessageMediaHash,
  getMessageMediaThumbDataUri, getMessageText,
  isForwardedMessage,
  isOwnMessage,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
};

const SMALL_IMAGE_THRESHOLD = 12;

const Photo: FC<IProps> = ({
  message, load, onClick,
}) => {
  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaData = useMedia(getMessageMediaHash(message, 'inline'), !load);
  const { width, height, isSmall } = calculateDimensions(message);

  let className = 'media-inner has-viewer';
  if (isSmall) {
    className += ' small-image';
  }

  let thumbClassName = 'thumbnail';
  if (!mediaData) {
    thumbClassName += ' blur';
  }
  if (!thumbDataUri) {
    thumbClassName += ' empty';
  }

  return (
    <div
      className={className}
      onClick={onClick}
    >
      <img
        src={thumbDataUri}
        className={thumbClassName}
        width={width}
        height={height}
        alt=""
      />
      {!mediaData && (
        <div className="message-media-loading">
          <Spinner color="white" />
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
  const { width, height } = getImageDimensions(message.content.photo!, isOwn, isForwarded);

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
