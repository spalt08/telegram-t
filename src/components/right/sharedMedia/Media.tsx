import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiMessage } from '../../../api/types';

import { formatMediaDuration } from '../../../util/dateFormat';
import {
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
  getMessageVideo,
} from '../../../modules/helpers';
import useMedia from '../../../hooks/useMedia';

import './Media.scss';

type IProps = {
  message: ApiMessage;
  onClick: (id: number) => void;
};

const Media: FC<IProps> = ({ message, onClick }) => {
  const handleClick = () => {
    onClick(message.id);
  };

  const video = getMessageVideo(message);

  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const mediaBlobUrl = useMedia(getMessageMediaHash(message, 'pictogram'));

  return (
    <div onClick={handleClick} tabIndex={-1} className="Media">
      <img src={mediaBlobUrl || thumbDataUri} className={!mediaBlobUrl ? 'blur' : ''} alt="" />
      {video && <span className="video-duration">{video.isGif ? 'GIF' : formatMediaDuration(video.duration)}</span>}
    </div>
  );
};

export default memo(Media);
