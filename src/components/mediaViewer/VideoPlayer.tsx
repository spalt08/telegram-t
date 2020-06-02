import React, {
  FC, memo, useCallback, useLayoutEffect, useRef,
} from '../../lib/teact/teact';

import { IDimensions } from '../../modules/helpers';

import useShowTransition from '../../hooks/useShowTransition';
import useBuffering from '../../hooks/useBuffering';

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

  const { isBuffered, handleBuffering } = useBuffering(url);
  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(!isBuffered, undefined, undefined, 'slow');

  useLayoutEffect(() => {
    if (!isMediaViewerOpen) {
      videoRef.current!.pause();
    }
  }, [isMediaViewerOpen]);

  const stopEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isBuffered && !isGif) {
      e.stopPropagation();
    }
  }, [isGif, isBuffered]);

  return (
    <div className="VideoPlayer" onClick={stopEvent}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        autoPlay
        playsInline
        controls={isBuffered && !isGif}
        loop={isGif}
        id="media-viewer-video"
        poster={posterData}
        width={posterSize && posterSize.width}
        height={posterSize && posterSize.height}
        onProgress={handleBuffering}
        onPlay={handleBuffering}
      >
        <source src={url} />
      </video>
      {shouldRenderSpinner && (
        <div className={['spinner-container', spinnerClassNames].join(' ')}>
          <ProgressSpinner progress={isBuffered ? 1 : downloadProgress} />
        </div>
      )}
    </div>
  );
};


export default memo(VideoPlayer);
