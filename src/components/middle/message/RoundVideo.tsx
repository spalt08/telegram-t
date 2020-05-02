import React, {
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../../../lib/teact/teact';

import { ApiMediaFormat, ApiMessage } from '../../../api/types';
import { formatMediaDuration } from '../../../util/dateFormat';
import {
  getMessageMediaHash,
  getMessageMediaThumbDataUri,
} from '../../../modules/helpers';
import useMediaWithDownloadProgress from '../../../hooks/useMediaWithDownloadProgress';
import useShowTransition from '../../../hooks/useShowTransition';
import useTransitionForMedia from '../../../hooks/useTransitionForMedia';
import buildClassName from '../../../util/buildClassName';
import { ROUND_VIDEO_DIMENSIONS } from '../../common/helpers/mediaDimensions';

import ProgressSpinner from '../../ui/ProgressSpinner';

import './RoundVideo.scss';

type OwnProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  lastSyncTime?: number;
  onCancelDownload?: () => void;
};

const RoundVideo: FC<OwnProps> = ({
  message,
  loadAndPlay,
  lastSyncTime,
  onCancelDownload = () => {
  },
}) => {
  const playingProgressRef = useRef<HTMLDivElement>();
  const playerRef = useRef<HTMLVideoElement>();
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const video = message.content.video!;
  const localBlobUrl = video.blobUrl;
  const thumbDataUri = getMessageMediaThumbDataUri(message);
  const { mediaData, downloadProgress } = useMediaWithDownloadProgress<ApiMediaFormat.BlobUrl>(
    getMessageMediaHash(message, 'inline'), !loadAndPlay, undefined, lastSyncTime,
  );
  const blobUrl = localBlobUrl || mediaData;
  const isTransferring = !blobUrl;
  const { shouldRenderThumb, transitionClassNames } = useTransitionForMedia(blobUrl, 'slow');
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && loadAndPlay);

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

  const handleClick = useCallback(() => {
    const playerEl = playerRef.current!;
    if (isActivated) {
      if (playerEl.paused) {
        playerEl.play();
      } else {
        playerEl.pause();
      }
    } else {
      playerEl.currentTime = 0;
      setIsActivated(true);
    }
  }, [isActivated]);

  const handleTimeUpdate = useCallback((e: React.UIEvent<HTMLVideoElement>) => {
    const playerEl = e.currentTarget;

    setProgress(playerEl.currentTime / playerEl.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsActivated(false);
    setProgress(0);
    playerRef.current!.play();

    requestAnimationFrame(() => {
      playingProgressRef.current!.innerHTML = '';
    });
  }, []);

  const className = buildClassName(
    'RoundVideo',
    'media-inner',
    !isTransferring && 'playable',
  );

  return (
    <div
      className={className}
      onClick={!shouldSpinnerRender ? handleClick : undefined}
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
      {blobUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className={`full-media ${transitionClassNames}`}
          width={ROUND_VIDEO_DIMENSIONS}
          height={ROUND_VIDEO_DIMENSIONS}
          autoPlay={!isActivated}
          muted={!isActivated}
          loop={!isActivated}
          playsinline
          poster={thumbDataUri}
          ref={playerRef}
          onTimeUpdate={isActivated ? handleTimeUpdate : undefined}
          onEnded={isActivated ? handleEnded : undefined}
        >
          <source src={blobUrl} />
        </video>
      )}
      <div className="progress" ref={playingProgressRef} />
      {shouldSpinnerRender && (
        <div className={`media-loading not-implemented ${spinnerClassNames}`}>
          <ProgressSpinner progress={downloadProgress} onClick={onCancelDownload} />
        </div>
      )}
      <div className="message-media-duration">
        {isActivated ? formatMediaDuration(playerRef.current!.currentTime) : formatMediaDuration(video.duration)}
        {(!isActivated || playerRef.current!.paused) && <i className="icon-muted-chat" />}
      </div>
    </div>
  );
};

export default RoundVideo;
