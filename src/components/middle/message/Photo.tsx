import { MouseEvent } from 'react';
import React, { FC, useRef } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { calculateMediaDimensions } from './util/mediaDimensions';
import {
  getMessagePhoto,
  getMessageWebPagePhoto,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessageTransferParams,
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
  const isMediaLoaded = Boolean(mediaData);
  const isMediaPreloadedRef = useRef<boolean>(isMediaLoaded);

  const {
    isTransferring, transferProgress,
  } = getMessageTransferParams(message, fileTransferProgress, !isMediaLoaded && !localBlobUrl);

  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && load);

  const {
    shouldRender: shouldFullMediaRender,
    transitionClassNames: fullMediaClassNames,
  } = useShowTransition(isMediaLoaded, undefined, isMediaPreloadedRef.current!);

  const { width, height, isSmall } = calculateMediaDimensions(message);

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
  if (!isMediaLoaded && !localBlobUrl) {
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

export default Photo;
