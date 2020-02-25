import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { formatMediaDuration } from '../../../util/dateFormat';
import { calculateVideoDimensions } from '../../../util/mediaDimensions';
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

import ProgressSpinner from '../../ui/ProgressSpinner';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  fileTransferProgress?: number;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  onCancelTransfer?: () => void;
};

const Video: FC<IProps> = ({
  message,
  loadAndPlay,
  fileTransferProgress,
  onClick,
  onCancelTransfer,
}) => {
  const video = message.content.video!;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const localBlobUrl = loadAndPlay ? video.blobUrl : undefined;
  const mediaData = useMedia(getMessageMediaHash(message, 'inline'), !loadAndPlay);

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
  const { width, height } = calculateVideoDimensions(video, isOwn, isForwarded);

  let className = 'media-inner';
  if (!isTransferring) {
    className += ' has-viewer';
  }

  let thumbClassName = 'thumbnail blur';
  if (!thumbDataUri) {
    thumbClassName += ' empty';
  }

  return (
    <div
      className={className}
      onClick={!isTransferring ? onClick : undefined}
    >
      {!isInline && !isHqPreview && (
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
        <div className={['message-media-loading', ...spinnerClassNames].join(' ')}>
          <ProgressSpinner progress={transferProgress} onClick={onCancelTransfer} />
        </div>
      )}
      {isTransferring ? (
        <span className="message-upload-progress">{Math.round(transferProgress * 100)}%</span>
      ) : (
        <div className="message-media-duration">{formatMediaDuration(video.duration)}</div>
      )}
    </div>
  );
};

export default Video;
