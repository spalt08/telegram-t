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
  onClose: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

const VideoPlayer: FC<OwnProps> = ({
  url,
  isGif,
  posterData,
  posterSize,
  downloadProgress,
  isMediaViewerOpen,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>();

  const { isBuffered, bufferingHandlers } = useBuffering();
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
    e.stopPropagation();
  }, []);

  return (
    <div className="VideoPlayer" onClick={!isGif ? stopEvent : undefined}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        autoPlay
        playsInline
        controls={!isGif}
        loop={isGif}
        // This is to force auto playing on mobiles
        muted={isGif}
        id="media-viewer-video"
        poster={posterData}
        width={posterSize && posterSize.width}
        height={posterSize && posterSize.height}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...bufferingHandlers}
      >
        <source src={url} />
      </video>
      {shouldRenderSpinner && (
        <div className={['spinner-container', spinnerClassNames].join(' ')}>
          {!isBuffered && <div className="buffering">Buffering...</div>}
          <ProgressSpinner progress={isBuffered ? 1 : downloadProgress} onClick={onClose} />
        </div>
      )}
    </div>
  );
};


export default memo(VideoPlayer);
