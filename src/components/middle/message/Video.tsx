import React, { FC, useCallback, useState } from '../../../lib/teact/teact';

import { ApiMediaFormat, ApiMessage } from '../../../api/types';

import { AUTO_LOAD_MEDIA } from '../../../config';
import { formatMediaDuration } from '../../../util/dateFormat';
import buildClassName from '../../../util/buildClassName';
import { calculateVideoDimensions, AlbumMediaParameters } from '../../common/helpers/mediaDimensions';
import {
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  isForwardedMessage,
  isOwnMessage,
  canMessagePlayVideoInline,
  getMediaTransferState,
} from '../../../modules/helpers';
import useMediaWithDownloadProgress from '../../../hooks/useMediaWithDownloadProgress';
import useShowTransition from '../../../hooks/useShowTransition';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import usePrevious from '../../../hooks/usePrevious';

import ProgressSpinner from '../../ui/ProgressSpinner';

type OwnProps = {
  id?: string;
  message: ApiMessage;
  loadAndPlay?: boolean;
  uploadProgress?: number;
  albumMediaParams?: AlbumMediaParameters;
  lastSyncTime?: number;
  onClick?: () => void;
  onCancelUpload?: () => void;
};

const Video: FC<OwnProps> = ({
  id,
  message,
  loadAndPlay,
  uploadProgress,
  albumMediaParams,
  lastSyncTime,
  onClick,
  onCancelUpload,
}) => {
  const video = message.content.video!;
  const localBlobUrl = video.blobUrl;
  const thumbDataUri = getMessageMediaThumbDataUri(message);

  const [isDownloadAllowed, setIsDownloadAllowed] = useState(AUTO_LOAD_MEDIA);
  const shouldDownload = isDownloadAllowed && loadAndPlay;
  const { mediaData, downloadProgress } = useMediaWithDownloadProgress<ApiMediaFormat.BlobUrl>(
    getMessageMediaHash(message, 'inline'), !shouldDownload, undefined, lastSyncTime,
  );
  const fullMediaData = localBlobUrl || mediaData;
  const {
    isUploading, isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, shouldDownload && !fullMediaData);
  const wasDownloadDisabled = usePrevious(isDownloadAllowed) === false;
  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring, undefined, wasDownloadDisabled);
  const { shouldRenderThumb, transitionClassNames } = useTransitionForMedia(fullMediaData, 'slow');

  const canPlayInline = Boolean(localBlobUrl) || canMessagePlayVideoInline(video);
  const isInline = canPlayInline && loadAndPlay && fullMediaData;
  const isHqPreview = mediaData && !canPlayInline;

  const isOwn = isOwnMessage(message);
  const isForwarded = isForwardedMessage(message);
  const { width, height } = calculateVideoDimensions(video, isOwn, isForwarded, albumMediaParams);

  const handleClick = useCallback(() => {
    if (isUploading) {
      if (onCancelUpload) {
        onCancelUpload();
      }
    } else if (!fullMediaData) {
      setIsDownloadAllowed((isAllowed) => !isAllowed);
    } else if (onClick) {
      onClick();
    }
  }, [fullMediaData, isUploading, onCancelUpload, onClick]);

  const className = buildClassName('media-inner', !isUploading && 'interactive');

  return (
    <div
      id={id}
      className={className}
      onClick={isUploading ? undefined : handleClick}
    >
      {(shouldRenderThumb || !isInline) && (
        <img
          src={thumbDataUri}
          className="thumbnail blur"
          width={width}
          height={height}
          alt=""
        />
      )}
      {isInline && (
        <video
          className={`full-media ${transitionClassNames}`}
          width={width}
          height={height}
          autoPlay
          muted
          loop
          playsinline
          poster={thumbDataUri}
        >
          <source src={fullMediaData} />
        </video>
      )}
      {isHqPreview && (
        <img
          src={mediaData}
          className={`full-media ${transitionClassNames}`}
          width={width}
          height={height}
          alt=""
        />
      )}
      {isHqPreview && !shouldRenderSpinner && (
        <div className="media-loading open shown">
          <div className="message-media-play-button">
            <i className="icon-large-play" />
          </div>
        </div>
      )}
      {shouldRenderSpinner && (
        <div className={`media-loading ${spinnerClassNames}`}>
          <ProgressSpinner progress={transferProgress} onClick={isUploading ? handleClick : undefined} />
        </div>
      )}
      {!fullMediaData && !isDownloadAllowed && (
        <i className="icon-download" />
      )}
      {isTransferring ? (
        <span className="message-upload-progress">{Math.round(transferProgress * 100)}%</span>
      ) : (
        <div className="message-media-duration">{video.isGif ? 'GIF' : formatMediaDuration(video.duration)}</div>
      )}
    </div>
  );
};

export default Video;
