import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';
import { formatMediaDuration } from '../../../util/dateFormat';
import { calculateVideoDimensions } from '../../../util/mediaDimensions';
import {
  getMessageMediaHash, getMessageMediaThumbDataUri,
  isForwardedMessage,
  isOwnMessage,
  canMessagePlayVideoInline,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';

import Spinner from '../../ui/Spinner';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
};

const Video: FC<IProps> = ({
  message, loadAndPlay, onClick,
}) => {
  const video = message.content.video!;

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaData = useMedia(getMessageMediaHash(message, 'inline'), !loadAndPlay);

  const canPlayInline = canMessagePlayVideoInline(video);
  const isInline = mediaData && loadAndPlay && canPlayInline;
  const isHqPreview = mediaData && !canPlayInline;

  const isOwn = isOwnMessage(message);
  const isForwarded = isForwardedMessage(message);
  const { width, height } = calculateVideoDimensions(video, isOwn, isForwarded);

  return (
    <div
      className="media-inner has-viewer"
      onClick={onClick}
    >
      {!isInline && !isHqPreview && ([
        <img
          src={thumbDataUri}
          className={`thumbnail blur ${!thumbDataUri ? 'empty' : ''}`}
          width={width}
          height={height}
          alt=""
        />,
        loadAndPlay && (
          <div className="message-media-loading">
            <Spinner color="white" />
          </div>
        ),
      ])}
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
          <source src={mediaData} />
        </video>
      )}
      {isHqPreview && ([
        <img
          src={mediaData}
          width={width}
          height={height}
          alt=""
        />,
        <div className="message-media-loading">
          <div className="message-media-play-button">
            <i className="icon-large-play" />
          </div>
        </div>,
      ])}
      <div className="message-media-duration">{formatMediaDuration(video.duration)}</div>
    </div>
  );
};

export default Video;
