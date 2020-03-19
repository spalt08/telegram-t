import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { formatMediaDuration } from '../../../util/dateFormat';
import {
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessageVideo,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';
import useProgressiveMedia from '../../../hooks/useProgressiveMedia';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  onClick: (id: number) => void;
};

const Media: FC<IProps> = ({ message, onClick }) => {
  const handleClick = () => {
    onClick(message.id);
  };

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(getMessageMediaHash(message, 'pictogram'));
  const { shouldRenderThumb, shouldRenderFullMedia, transitionClassNames } = useProgressiveMedia(mediaBlobUrl, 'slow');

  const video = getMessageVideo(message);

  return (
    <div onClick={handleClick} className="Media">
      {shouldRenderThumb && (
        <img src={thumbDataUri} className="blur" alt="" />
      )}
      {shouldRenderFullMedia && (
        <img src={mediaBlobUrl} className={transitionClassNames} alt="" />
      )}
      {video && <span className="video-duration">{video.isGif ? 'GIF' : formatMediaDuration(video.duration)}</span>}
    </div>
  );
};

export default memo(Media);
