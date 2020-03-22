import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { AlbumMediaParameters } from '../../common/helpers/mediaDimensions';

import {
  getMessagePhoto,
  getMessageWebPagePhoto,
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMediaTransferState,
} from '../../../modules/helpers';
import useMediaWithDownloadProgress from '../../../hooks/useMediaWithDownloadProgress';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import useShowTransition from '../../../hooks/useShowTransition';
import buildClassName from '../../../util/buildClassName';
import { calculateMediaDimensions } from './helpers/mediaDimensions';

import ProgressSpinner from '../../ui/ProgressSpinner';

type IProps = {
  message: ApiMessage;
  load?: boolean;
  uploadProgress?: number;
  size?: 'inline' | 'pictogram';
  albumMediaParams?: AlbumMediaParameters;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelUpload?: () => void;
};

const Photo: FC<IProps> = ({
  message,
  load,
  uploadProgress,
  size = 'inline',
  albumMediaParams,
  onClick,
  onCancelUpload,
}) => {
  const photo = (getMessagePhoto(message) || getMessageWebPagePhoto(message))!;
  const localBlobUrl = photo.blobUrl;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const { mediaData, downloadProgress } = useMediaWithDownloadProgress(getMessageMediaHash(message, size), !load);
  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useTransitionForMedia(mediaData || localBlobUrl, 'slow');
  const {
    isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, !mediaData && !localBlobUrl);

  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && load, undefined, undefined, 'slow');

  const { width, height, isSmall } = calculateMediaDimensions(message, albumMediaParams);

  const className = buildClassName(
    'media-inner',
    !isTransferring && 'has-viewer',
    isSmall && 'small-image',
    width === height && 'square-image',
  );

  const thumbClassName = buildClassName(
    'thumbnail blur',
    !thumbDataUri && 'empty',
  );

  return (
    <div
      className={className}
      onClick={!isTransferring ? onClick : undefined}
    >
      {shouldRenderThumb && (
        <img
          src={thumbDataUri}
          className={thumbClassName}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldRenderFullMedia && (
        <img
          src={localBlobUrl || mediaData}
          className={`full-media ${transitionClassNames}`}
          width={width}
          height={height}
          alt=""
        />
      )}
      {shouldRenderSpinner && (
        <div className={`message-media-loading ${spinnerClassNames}`}>
          <ProgressSpinner progress={transferProgress} onClick={onCancelUpload} />
        </div>
      )}
      {isTransferring && (
        <span className="message-upload-progress">{Math.round(transferProgress * 100)}%</span>
      )}
    </div>
  );
};

export default Photo;
