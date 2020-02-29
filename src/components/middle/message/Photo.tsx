import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import {
  getMessagePhoto,
  getMessageWebPagePhoto,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessageTransferParams,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useShowTransition from '../../../hooks/useShowTransition';
import useProgressiveMedia from '../../../hooks/useProgressiveMedia';
import buildClassName from '../../../util/buildClassName';
import { calculateMediaDimensions } from './helpers/mediaDimensions';

import ProgressSpinner from '../../ui/ProgressSpinner';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  fileTransferProgress?: number;
  size?: 'inline' | 'pictogram';
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelTransfer?: () => void;
};

const Photo: FC<IProps> = ({
  message,
  load,
  fileTransferProgress,
  size = 'inline',
  onClick,
  onCancelTransfer,
}) => {
  const photo = (getMessagePhoto(message) || getMessageWebPagePhoto(message))!;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const localBlobUrl = load ? photo.blobUrl : undefined;
  const mediaData = useMedia(getMessageMediaHash(message, size), !load);
  const isMediaLoaded = Boolean(mediaData);
  const { shouldRenderThumb, shouldRenderFullMedia, transitionClassNames } = useProgressiveMedia(mediaData, 'slow');

  const {
    isTransferring, transferProgress,
  } = getMessageTransferParams(message, fileTransferProgress, !isMediaLoaded && !localBlobUrl);

  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && load, undefined, undefined, 'slow');

  const { width, height, isSmall } = calculateMediaDimensions(message);

  const className = buildClassName(
    'media-inner',
    !isTransferring && 'has-viewer',
    isSmall && 'small-image',
    width === height && 'square-image',
  );

  const thumbClassName = buildClassName(
    'thumbnail',
    !localBlobUrl && 'blur',
    !thumbDataUri && 'empty',
  );

  return (
    <div
      className={className}
      onClick={!isTransferring ? onClick : undefined}
    >
      {shouldRenderThumb && (
        <img
          src={localBlobUrl || thumbDataUri}
          className={thumbClassName}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldRenderFullMedia && (
        <img
          src={mediaData}
          className={['full-media', transitionClassNames].join(' ')}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldRenderSpinner && (
        <div className={['message-media-loading', spinnerClassNames].join(' ')}>
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
