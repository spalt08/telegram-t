import React, { FC, useState } from '../../lib/teact/teact';

import './VideoPlayer.scss';

type OwnProps = {
  url: string;
  isGif?: boolean;
};

function stopEvent(e: React.MouseEvent<HTMLDivElement>) {
  e.stopPropagation();
}

const VideoPlayer: FC<OwnProps> = ({ url, isGif }) => {
  const [hasSize, setHasSize] = useState(false);

  function handleLoadedMetadata(e: React.SyntheticEvent<HTMLVideoElement>) {
    const videoEl = e.currentTarget;

    if (videoEl.videoWidth > 0) {
      setHasSize(true);
    }
  }

  const style = hasSize ? '' : 'opacity: 0';

  return (
    <div className="VideoPlayer" onClick={stopEvent}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        autoPlay
        controls={!isGif}
        loop={isGif}
        // @ts-ignore
        style={style}
        id="media-viewer-video"
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={url} />
      </video>
    </div>
  );
};


export default VideoPlayer;
