import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { formatMediaDuration } from '../../../util/dateFormat';
import {
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessageVideo,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';

import './Media.scss';

type OwnProps = {
  message: ApiMessage;
  onClick: (id: number) => void;
};

const Media: FC<OwnProps> = ({ message, onClick }) => {
  const handleClick = () => {
    onClick(message.id);
  };

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(getMessageMediaHash(message, 'pictogram'));
  const {
    shouldRenderThumb, shouldRenderFullMedia, transitionClassNames,
  } = useTransitionForMedia(mediaBlobUrl, 'slow');

  const video = getMessageVideo(message);

  return (
    <div onClick={handleClick} className="Media" id={`shared-media${message.id}`}>
      {shouldRenderThumb && (
        <img src={thumbDataUri} className="blur" alt="" />
      )}
      {shouldRenderFullMedia && (
        <img src={mediaBlobUrl} className={`${transitionClassNames} full-media`} alt="" />
      )}
      {video && <span className="video-duration">{video.isGif ? 'GIF' : formatMediaDuration(video.duration)}</span>}
    </div>
  );
};

export default memo(Media);
