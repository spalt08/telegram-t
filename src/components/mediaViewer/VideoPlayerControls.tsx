import React, { FC, useState, useEffect } from '../../lib/teact/teact';

import { formatMediaDuration } from '../../util/dateFormat';
import formatFileSize from './helpers/formatFileSize';

import Button from '../ui/Button';

import './VideoPlayerControls.scss';
import { IS_MOBILE_SCREEN } from '../../util/environment';

type IProps = {
  bufferedDuration: number;
  currentTime: number;
  duration: number;
  fileSize: number;
  isForceVisible: boolean;
  isForceMobileVersion?: boolean;
  showDownloadProgress: boolean;
  isPlayed: boolean;
  isFullscreenSupported: boolean;
  isFullscreen: boolean;
  onChangeFullscreen: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onPlayPause: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSeek: OnChangeHandler;
};

type OnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

const stopEvent = (e: React.MouseEvent<HTMLElement>) => {
  e.stopPropagation();
};

const VideoPlayerControls: FC<IProps> = ({
  bufferedDuration,
  currentTime,
  duration,
  fileSize,
  isForceVisible,
  isForceMobileVersion,
  showDownloadProgress,
  isPlayed,
  isFullscreenSupported,
  isFullscreen,
  onChangeFullscreen,
  onPlayPause,
  onSeek,
}) => {
  const [isVisible, setVisibility] = useState(true);

  useEffect(() => {
    if (isForceVisible) {
      setVisibility(isForceVisible);
    }
  }, [isForceVisible]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>|undefined;

    if (!isForceVisible) {
      if (IS_MOBILE_SCREEN) {
        setVisibility(false);
      } else {
        timeout = setTimeout(() => {
          setVisibility(false);
        }, 3000);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isForceVisible]);

  useEffect(() => {
    if (isVisible || isForceVisible) {
      document.body.classList.add('video-controls-visible');
    }

    return () => {
      document.body.classList.remove('video-controls-visible');
    };
  }, [isForceVisible, isVisible]);

  if (!isVisible && !isForceVisible) {
    return null;
  }

  return (
    <div className={`VideoPlayerControls ${isForceMobileVersion ? 'mobile' : ''}`} onClick={stopEvent}>
      {renderSeekLine(currentTime, duration, bufferedDuration, onSeek)}
      <Button
        ariaLabel="Play"
        size="tiny"
        ripple
        color="translucent-white"
        className="play"
        onClick={onPlayPause}
      >
        <i className={isPlayed ? 'icon-pause' : 'icon-play'} />
      </Button>
      {renderTime(currentTime, duration)}
      {showDownloadProgress && renderFileSize(bufferedDuration / duration, fileSize)}
      {isFullscreenSupported && (
        <Button
          ariaLabel="Fullscreen"
          size="tiny"
          ripple
          color="translucent-white"
          className="fullscreen"
          onClick={onChangeFullscreen}
        >
          <i className={`${isFullscreen ? 'icon-smallscreen' : 'icon-fullscreen'}`} />
        </Button>
      )}
    </div>
  );
};

function renderTime(currentTime: number, duration: number) {
  return (
    <div className="player-time">
      {`${formatMediaDuration(currentTime)} / ${formatMediaDuration(duration)}`}
    </div>
  );
}

function renderFileSize(downloadedPercent: number, totalSize: number) {
  return (
    <div className="player-file-size">
      {`${formatFileSize(totalSize * downloadedPercent)} / ${formatFileSize(totalSize)}`}
    </div>
  );
}

function renderSeekLine(currentTime: number, duration: number, bufferedDuration: number, onSeek: OnChangeHandler) {
  const percentagePlayed = (currentTime / duration) * 100;
  const percentageBuffered = (bufferedDuration / duration) * 100;

  return (
    <div className="player-seekline">
      <div className="player-seekline-track">
        <div
          className="player-seekline-buffered"
          // @ts-ignore teact feature
          style={`width: ${percentageBuffered || 0}%`}
        />
        <div
          className="player-seekline-played"
          // @ts-ignore teact feature
          style={`width: ${percentagePlayed || 0}%`}
        />
        <input
          min="0"
          max="100"
          step={0.01}
          type="range"
          onInput={onSeek}
          className="player-seekline-input"
          value={percentagePlayed || 0}
        />
      </div>
    </div>
  );
}

export default VideoPlayerControls;
