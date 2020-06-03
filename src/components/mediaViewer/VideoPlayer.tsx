import React, {
  FC, memo, useCallback, useLayoutEffect, useRef,
} from '../../lib/teact/teact';

import { IDimensions } from '../../modules/helpers';

import useShowTransition from '../../hooks/useShowTransition';
import useFlag from '../../hooks/useFlag';
import useOnChange from '../../hooks/useOnChange';

import ProgressSpinner from '../ui/ProgressSpinner';

import './VideoPlayer.scss';

type OwnProps = {
  url?: string;
  isGif?: boolean;
  posterData?: string;
  posterSize?: IDimensions;
  downloadProgress?: number;
  isMediaViewerOpen?: boolean;
};

const VideoPlayer: FC<OwnProps> = ({
  url,
  isGif,
  posterData,
  posterSize,
  downloadProgress,
  isMediaViewerOpen,
}) => {
  const videoRef = useRef<HTMLVideoElement>();

  const [isPlaying, setPlaying, setPaused] = useFlag();
  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(!isPlaying, undefined, undefined, 'slow');

  useLayoutEffect(() => {
    if (!isMediaViewerOpen) {
      videoRef.current!.pause();
    }
  }, [isMediaViewerOpen]);

  useOnChange(setPaused, [url]);

  const stopEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying && !isGif) {
      e.stopPropagation();
    }
  }, [isGif, isPlaying]);

  return (
    <div className="VideoPlayer" onClick={stopEvent}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        autoPlay
        playsInline
        controls={isPlaying && !isGif}
        loop={isGif}
        id="media-viewer-video"
        poster={posterData}
        width={posterSize && posterSize.width}
        height={posterSize && posterSize.height}
        onPlaying={setPlaying}
        onPause={setPaused}
      >
        <source src={url} />
      </video>
      {shouldRenderSpinner && (
        <div className={['spinner-container', spinnerClassNames].join(' ')}>
          <ProgressSpinner progress={isPlaying ? 1 : downloadProgress} />
        </div>
      )}
    </div>
  );
};


export default memo(VideoPlayer);
