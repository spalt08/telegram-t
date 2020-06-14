import React, {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../../../lib/teact/teact';

import { ApiMediaFormat, ApiMessage } from '../../../api/types';

import { AUTO_LOAD_MEDIA } from '../../../config';
import { ROUND_VIDEO_DIMENSIONS } from '../../common/helpers/mediaDimensions';
import { formatMediaDuration } from '../../../util/dateFormat';
import { getMessageMediaHash, getMessageMediaThumbDataUri } from '../../../modules/helpers';
import useMediaWithDownloadProgress from '../../../hooks/useMediaWithDownloadProgress';
import useShowTransition from '../../../hooks/useShowTransition';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import usePrevious from '../../../hooks/usePrevious';
import useBuffering from '../../../hooks/useBuffering';
import buildClassName from '../../../util/buildClassName';
import useHeavyAnimationCheckForVideo from '../../../hooks/useHeavyAnimationCheckForVideo';
import safePlay from '../../../util/safePlay';

import ProgressSpinner from '../../ui/ProgressSpinner';

import './RoundVideo.scss';

type OwnProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  lastSyncTime?: number;
};

const RoundVideo: FC<OwnProps> = ({
  message,
  loadAndPlay,
  lastSyncTime,
}) => {
  const playingProgressRef = useRef<HTMLDivElement>();
  const playerRef = useRef<HTMLVideoElement>();

  const thumbDataUri = getMessageMediaThumbDataUri(message);

  const video = message.content.video!;
  const isProgressive = video.supportsStreaming;

  const [isDownloadAllowed, setIsDownloadAllowed] = useState(AUTO_LOAD_MEDIA);
  const shouldDownload = Boolean(isDownloadAllowed && loadAndPlay && lastSyncTime);
  const { mediaData, downloadProgress } = useMediaWithDownloadProgress(
    getMessageMediaHash(message, 'inline'),
    !shouldDownload,
    isProgressive ? ApiMediaFormat.Progressive : ApiMediaFormat.BlobUrl,
    lastSyncTime,
  );

  const { isBuffered, bufferingHandlers } = useBuffering();
  const isTransferring = isDownloadAllowed && !isBuffered;
  const wasDownloadDisabled = usePrevious(isDownloadAllowed) === false;
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring || (isProgressive && !isBuffered), undefined, wasDownloadDisabled);
  const { shouldRenderThumb, transitionClassNames } = useTransitionForMedia(mediaData, 'slow');

  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isActivated) {
      return;
    }

    const circumference = 94 * 2 * Math.PI;
    const strokeDashOffset = circumference - progress * circumference;

    const playerEl = playerRef.current!;
    const playingProgressEl = playingProgressRef.current!;
    const svgEl = playingProgressEl.firstElementChild;

    if (!svgEl) {
      playingProgressEl.innerHTML = `<svg width="200px" height="200px">
          <circle cx="100" cy="100" r="94" class="progress-circle" transform="rotate(-90, 100, 100)"
            stroke-dasharray="${circumference} ${circumference}"
            stroke-dashoffset="${circumference}"
          />
        </svg>`;
    } else {
      (svgEl.firstElementChild as SVGElement).setAttribute('stroke-dashoffset', strokeDashOffset.toString());
    }

    setProgress(playerEl.currentTime / playerEl.duration);
  }, [isActivated, progress]);

  const shouldPlay = Boolean(mediaData && loadAndPlay);

  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    if (shouldPlay) {
      safePlay(playerRef.current);
    } else {
      playerRef.current.pause();
    }
  }, [shouldPlay]);

  useHeavyAnimationCheckForVideo(playerRef, shouldPlay);

  const handleClick = useCallback(() => {
    if (!mediaData) {
      setIsDownloadAllowed((isAllowed) => !isAllowed);

      return;
    }

    const playerEl = playerRef.current!;
    if (isActivated) {
      if (playerEl.paused) {
        safePlay(playerEl);
      } else {
        playerEl.pause();
      }
    } else {
      playerEl.currentTime = 0;
      setIsActivated(true);
    }
  }, [isActivated, mediaData]);

  const handleTimeUpdate = useCallback((e: React.UIEvent<HTMLVideoElement>) => {
    const playerEl = e.currentTarget;

    setProgress(playerEl.currentTime / playerEl.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsActivated(false);
    setProgress(0);
    safePlay(playerRef.current!);

    requestAnimationFrame(() => {
      playingProgressRef.current!.innerHTML = '';
    });
  }, []);

  return (
    <div
      className="RoundVideo media-inner"
      onClick={handleClick}
    >
      {shouldRenderThumb && (
        <div className="thumbnail-wrapper">
          <img
            src={thumbDataUri}
            className="thumbnail blur"
            width={ROUND_VIDEO_DIMENSIONS}
            height={ROUND_VIDEO_DIMENSIONS}
            alt=""
          />
        </div>
      )}
      {mediaData && (
        <div className="video-wrapper">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={playerRef}
            className={buildClassName('full-media', isTransferring && 'blur', transitionClassNames)}
            width={ROUND_VIDEO_DIMENSIONS}
            height={ROUND_VIDEO_DIMENSIONS}
            autoPlay={!isActivated}
            muted={!isActivated}
            loop={!isActivated}
            playsInline
            poster={thumbDataUri}
            onTimeUpdate={isActivated ? handleTimeUpdate : undefined}
            onEnded={isActivated ? handleEnded : undefined}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...bufferingHandlers}
          >
            <source src={mediaData} />
          </video>
        </div>
      )}
      <div className="progress" ref={playingProgressRef} />
      {shouldSpinnerRender && (
        <div className={`media-loading ${spinnerClassNames}`}>
          <ProgressSpinner progress={downloadProgress} />
        </div>
      )}
      {!mediaData && !isDownloadAllowed && (
        <i className="icon-download" />
      )}
      <div className="message-media-duration">
        {isActivated ? formatMediaDuration(playerRef.current!.currentTime) : formatMediaDuration(video.duration)}
        {(!isActivated || playerRef.current!.paused) && <i className="icon-muted-chat" />}
      </div>
    </div>
  );
};

export default RoundVideo;
