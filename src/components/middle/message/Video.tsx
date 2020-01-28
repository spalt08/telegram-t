import { MouseEvent } from 'react';
import React, { FC } from '../../../lib/teact/teact';

import { ApiVideo } from '../../../api/types';
import { formatMediaDuration } from '../../../util/dateFormat';
import { getVideoDimensions } from '../../../util/mediaDimensions';
import { shouldMessagePlayVideoInline } from '../../../modules/helpers';

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
  video: ApiVideo;
  onClick: OnClickHandler;
  options: IRenderMediaOptions;
};

const Video: FC<IProps> = ({ video, onClick, options }) => {
  const {
    isInOwnMessage, isForwarded, mediaData, loadAndPlayMedia,
  } = options;
  const { width, height } = getVideoDimensions(video, isInOwnMessage, isForwarded);
  const shouldPlayInline = shouldMessagePlayVideoInline(video);
  const isInlineVideo = mediaData && loadAndPlayMedia && shouldPlayInline;
  const isHqPreview = mediaData && !shouldPlayInline;
  const { minithumbnail, duration } = video;
  const thumbData = minithumbnail && minithumbnail.data;

  return (
    <div
      className="media-inner has-viewer"
      onClick={onClick}
    >
      {isInlineVideo && (
        <video
          width={width}
          height={height}
          autoPlay
          muted
          loop
          playsinline
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...(thumbData && { poster: `data:image/jpeg;base64, ${thumbData}` })}
        >
          <source src={mediaData} />
        </video>
      )}
      {!isInlineVideo && isHqPreview && (
        <img src={mediaData} width={width} height={height} alt="" />
      )}
      {!isInlineVideo && !isHqPreview && (
        <img
          src={thumbData && `data:image/jpeg;base64, ${thumbData}`}
          width={width}
          height={height}
          alt=""
        />
      )}
      {!isInlineVideo && (
        <div className="message-media-loading">
          <div className="message-media-play-button">
            <i className="icon-large-play" />
          </div>
        </div>
      )}
      <div className="message-media-duration">{formatMediaDuration(duration)}</div>
    </div>
  );
};

export default Video;
