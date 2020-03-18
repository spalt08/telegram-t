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
  getMessageTransferParams,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useShowTransition from '../../../hooks/useShowTransition';
import useProgressiveMedia from '../../../hooks/useProgressiveMedia';
import buildClassName from '../../../util/buildClassName';

import ProgressSpinner from '../../ui/ProgressSpinner';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  fileTransferProgress?: number;
  albumMediaParams?: AlbumMediaParameters;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelTransfer?: () => void;
};

const Video: FC<IProps> = ({
  message,
  loadAndPlay,
  fileTransferProgress,
  albumMediaParams,
  onClick,
  onCancelTransfer,
}) => {
  const video = message.content.video!;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const localBlobUrl = loadAndPlay ? video.blobUrl : undefined;
  const mediaData = useMedia(getMessageMediaHash(message, 'inline'), !loadAndPlay);
  const { shouldRenderThumb, transitionClassNames } = useProgressiveMedia(mediaData, 'slow');

  const {
    isTransferring, transferProgress,
  } = getMessageTransferParams(message, fileTransferProgress, !mediaData && !localBlobUrl);
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

  const thumbClassName = buildClassName(
    'thumbnail blur',
    !localBlobUrl && 'blur',
  );

  return (
    <div
      className={className}
      onClick={!isTransferring ? onClick : undefined}
    >
      {(shouldRenderThumb || !isInline) && (
        <img
          src={thumbDataUri}
          className={thumbClassName}
          width={width}
          height={height}
          alt=""
        />
      )}
      {isInline && (
        <video
          className={['full-media', transitionClassNames].join(' ')}
          width={width}
          height={height}
          autoPlay
          muted
          loop
          playsinline
          poster={thumbDataUri}
        >
          <source src={mediaData || localBlobUrl} />
        </video>
      )}
      {isHqPreview && (
        <>
          <img
            src={mediaData}
            className={['full-media', transitionClassNames].join(' ')}
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
        <div className={['message-media-loading', spinnerClassNames].join(' ')}>
          <ProgressSpinner progress={transferProgress} onClick={onCancelTransfer} />
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
