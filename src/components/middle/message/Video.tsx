import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { formatMediaDuration } from '../../../util/dateFormat';
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
import buildClassName from '../../../util/buildClassName';

import ProgressSpinner from '../../ui/ProgressSpinner';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  uploadProgress?: number;
  albumMediaParams?: AlbumMediaParameters;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelUpload?: () => void;
};

const Video: FC<IProps> = ({
  message,
  loadAndPlay,
  uploadProgress,
  albumMediaParams,
  onClick,
  onCancelUpload,
}) => {
  const video = message.content.video!;
  const localBlobUrl = video.blobUrl;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const {
    mediaData, downloadProgress,
  } = useMediaWithDownloadProgress(getMessageMediaHash(message, 'inline'), !loadAndPlay);
  const { shouldRenderThumb, transitionClassNames } = useTransitionForMedia(localBlobUrl || mediaData, 'slow');
  const {
    isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, !mediaData && !localBlobUrl);
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && loadAndPlay);

  const canPlayInline = localBlobUrl || canMessagePlayVideoInline(video);
  const isInline = canPlayInline && loadAndPlay && (mediaData || localBlobUrl);
  const isHqPreview = mediaData && !canPlayInline;

  const isOwn = isOwnMessage(message);
  const isForwarded = isForwardedMessage(message);
  const { width, height } = calculateVideoDimensions(video, isOwn, isForwarded, albumMediaParams);

  const className = buildClassName(
    'media-inner',
    !isTransferring && 'has-viewer',
  );

  return (
    <div
      className={className}
      onClick={!isTransferring ? onClick : undefined}
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
          <source src={localBlobUrl || mediaData} />
        </video>
      )}
      {isHqPreview && (
        <>
          <img
            src={mediaData}
            className={`full-media ${transitionClassNames}`}
            width={width}
            height={height}
            alt=""
          />
          <div className="message-media-loading open shown">
            <div className="message-media-play-button">
              <i className="icon-large-play" />
            </div>
          </div>
        </>
      )}
      {shouldSpinnerRender && (
        <div className={`message-media-loading ${spinnerClassNames}`}>
          <ProgressSpinner progress={transferProgress} onClick={onCancelUpload} />
        </div>
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
