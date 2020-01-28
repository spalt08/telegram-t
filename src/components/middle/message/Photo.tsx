import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiPhoto } from '../../../api/types';
import { getImageDimensions } from '../../../util/imageDimensions';
import getMinMediaWidth from './util/minMediaWidth';
import Spinner from '../../ui/Spinner';

import './Media.scss';

type OnClickHandler = (e: MouseEvent<HTMLDivElement>) => void;

interface IRenderMediaOptions {
  isInOwnMessage: boolean;
  isForwarded: boolean;
  mediaData?: string;
  loadAndPlayMedia?: boolean;
  hasText?: boolean;
}

type IProps = {
  photo: ApiPhoto;
  onClick: OnClickHandler;
  options: IRenderMediaOptions;
};

const SMALL_IMAGE_THRESHOLD = 12;

const Photo: FC<IProps> = ({ photo, onClick, options }) => {
  const {
    isInOwnMessage, isForwarded, mediaData, hasText,
  } = options;
  const { width, height } = getImageDimensions(photo, isInOwnMessage, isForwarded);
  const thumbData = photo.minithumbnail && photo.minithumbnail.data;
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

  let thumbClassName = 'thumbnail';
  if (!mediaData) {
    thumbClassName += ' blur';
  }
  if (!thumbData) {
    thumbClassName += ' empty';
  }

  const className = finalWidth < minMediaWidth || finalHeight < minMediaHeight
    ? 'media-inner has-viewer small-image'
    : 'media-inner has-viewer';

  return (
    <div
      className={className}
      onClick={onClick}
    >
      <img
        src={thumbData && `data:image/jpeg;base64, ${thumbData}`}
        className={thumbClassName}
        width={finalWidth}
        height={finalHeight}
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
        width={finalWidth}
        height={finalHeight}
        alt=""
      />
    </div>
  );
};

export default Photo;
