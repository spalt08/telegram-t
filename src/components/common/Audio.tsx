import React, {
  FC, memo, useCallback, useEffect, useMemo, useRef, useState,
} from '../../lib/teact/teact';
import {
  ApiAudio, ApiMediaFormat, ApiMessage, ApiVoice,
} from '../../api/types';

import { IS_OPUS_SUPPORTED, IS_TOUCH_ENV } from '../../util/environment';
import { formatMediaDateTime, formatMediaDuration } from '../../util/dateFormat';
import { getMediaTransferState, getMessageMediaHash, isOwnMessage } from '../../modules/helpers';
import { renderWaveformToDataUri } from './helpers/waveform';
import buildClassName from '../../util/buildClassName';
import renderText from './helpers/renderText';
import useMediaWithDownloadProgress from '../../hooks/useMediaWithDownloadProgress';
import useShowTransition from '../../hooks/useShowTransition';
import useBuffering from '../../hooks/useBuffering';

import Button from '../ui/Button';
import ProgressSpinner from '../ui/ProgressSpinner';

import './Audio.scss';

type OwnProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  uploadProgress?: number;
  inSharedMedia?: boolean;
  date?: number;
  lastSyncTime?: number;
  onReadMedia?: () => void;
  onCancelUpload?: () => void;
};

enum PlayState {
  Idle,
  Playing,
  Paused,
}

interface ISeekMethods {
  handleStartSeek: (e: React.MouseEvent<HTMLElement>) => void;
  handleSeek: (e: React.MouseEvent<HTMLElement>) => void;
  handleStopSeek: () => void;
}

const Audio: FC<OwnProps> = ({
  message,
  uploadProgress,
  inSharedMedia,
  date,
  lastSyncTime,
  onReadMedia,
  onCancelUpload,
}) => {
  const audioRef = useRef<HTMLAudioElement>();

  const { content: { audio, voice }, isMediaUnread } = message;

  const [playState, setPlayState] = useState<PlayState>(PlayState.Idle);
  const isActive = playState === PlayState.Playing;
  const [playProgress, setPlayProgress] = useState<number>(0);
  const isSeeking = useRef<boolean>(false);
  // We need to preload on mobiles to enable playing by click.
  const shouldDownload = (isActive || IS_TOUCH_ENV) && lastSyncTime;

  const { mediaData, downloadProgress } = useMediaWithDownloadProgress(
    getMessageMediaHash(message, 'inline'),
    !shouldDownload,
    IS_OPUS_SUPPORTED ? ApiMediaFormat.Progressive : ApiMediaFormat.BlobUrl,
  );
  const { isBuffered, bufferingHandlers } = useBuffering();
  const {
    isUploading, isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, isActive && !isBuffered);
  const {
    shouldRender: shouldRenderSpinner,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring);

  const handleButtonClick = useCallback(() => {
    if (isUploading) {
      if (onCancelUpload) {
        onCancelUpload();
      }

      return;
    }

    setPlayState((state) => {
      switch (state) {
        case PlayState.Paused:
        case PlayState.Idle:
          audioRef.current!.play();
          return PlayState.Playing;
        case PlayState.Playing:
        default:
          audioRef.current!.pause();
          return PlayState.Paused;
      }
    });
  }, [isUploading, onCancelUpload]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl && audioEl.duration) {
      setPlayProgress(audioEl.currentTime / audioEl.duration);
    }
  }, [playProgress]);

  useEffect(() => {
    if (isActive && onReadMedia && isMediaUnread) {
      onReadMedia();
    }
  }, [isActive, isMediaUnread, onReadMedia]);

  useEffect(() => {
    const audioEl = audioRef.current!;

    return () => {
      audioEl.pause();
    };
  }, []);

  const handleTimeUpdate = useCallback(() => {
    setPlayProgress(audioRef.current!.currentTime / audioRef.current!.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setPlayState(PlayState.Paused);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const audioEl = audioRef.current;
    if (audioEl && isSeeking.current) {
      const seekBar = e.currentTarget.closest('.seekline,.waveform');
      if (seekBar) {
        const { width, left } = seekBar.getBoundingClientRect();
        audioEl.currentTime = (audioEl.duration * ((e.clientX - left) / width));
      }
    }
  }, []);

  const handleStartSeek = useCallback((e: React.MouseEvent<HTMLElement>) => {
    isSeeking.current = true;
    handleSeek(e);
  }, [handleSeek]);

  const handleStopSeek = useCallback(() => {
    isSeeking.current = false;
  }, []);

  const seekHandlers = { handleStartSeek, handleSeek, handleStopSeek };
  const isOwn = isOwnMessage(message);
  const renderedWaveform = useMemo(
    () => voice && renderWaveform(voice, playProgress, isOwn, seekHandlers),
    [voice, playProgress, isOwn, seekHandlers],
  );

  const className = buildClassName(
    'Audio media-inner',
    isOwn && !inSharedMedia && 'own',
    inSharedMedia && 'smaller',
  );

  const buttonClassNames = ['toggle-play'];
  if (shouldRenderSpinner) {
    buttonClassNames.push('loading');
  } else if (isActive) {
    buttonClassNames.push('pause');
  } else if (audioRef.current && playState === PlayState.Paused) {
    buttonClassNames.push('play');
  }

  return (
    <div className={className}>
      <Button
        round
        ripple
        size={inSharedMedia ? 'smaller' : 'default'}
        className={buttonClassNames.join(' ')}
        onClick={handleButtonClick}
      >
        <i className="icon-play" />
        <i className="icon-pause" />
      </Button>
      {shouldRenderSpinner && (
        <div className={buildClassName('media-loading', spinnerClassNames)}>
          <ProgressSpinner
            progress={transferProgress}
            transparent
            size={inSharedMedia ? 'm' : 'l'}
            onClick={handleButtonClick}
          />
        </div>
      )}
      {audio
        ? renderAudio(audio, isActive, playProgress, seekHandlers, date)
        : renderVoice(voice!, renderedWaveform, isMediaUnread)}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={mediaData}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...bufferingHandlers}
      />
    </div>
  );
};

function renderAudio(
  audio: ApiAudio,
  isActive: boolean,
  playProgress: number,
  { handleStartSeek, handleSeek, handleStopSeek }: ISeekMethods,
  date?: number,
) {
  const {
    title, performer, duration, fileName,
  } = audio;
  const showSeekline = isActive || (playProgress > 0 && playProgress < 1);

  return (
    <div className="content">
      <p className="title">{renderText(title || fileName)}</p>
      {showSeekline && (
        <div
          className="seekline"
          onMouseDown={handleStartSeek}
          onMouseMove={handleSeek}
          onMouseUp={handleStopSeek}
        >
          <span className="seekline-progress">
            <i
              // @ts-ignore
              style={`transform: translateX(${playProgress * 100}%)`}
            />
          </span>
          <span className="seekline-thumb">
            <i
              // @ts-ignore
              style={`transform: translateX(${playProgress * 100}%)`}
            />
          </span>
        </div>
      )}
      {!showSeekline && (
        <div className="meta">
          {performer && (
            <span className="performer">{renderText(performer)}</span>
          )}
          {date && <span className="date">{formatMediaDateTime(date * 1000)}</span>}
        </div>
      )}
      <p className="duration">
        {playProgress > 0 ? `${formatMediaDuration(duration * playProgress)} / ` : undefined}
        {formatMediaDuration(duration)}
      </p>
    </div>
  );
}

function renderVoice(voice: ApiVoice, renderedWaveform: any, isMediaUnread?: boolean) {
  return (
    <div className="content">
      {renderedWaveform}
      <p className="voice-duration">
        {formatMediaDuration(voice.duration)}
        {isMediaUnread && <span>&bull;</span>}
      </p>
    </div>
  );
}

function renderWaveform(
  voice: ApiVoice, playProgress = 0, isOwn = false, { handleStartSeek, handleSeek, handleStopSeek }: ISeekMethods,
) {
  const { waveform, duration } = voice;

  if (!waveform) {
    return undefined;
  }

  const reducedLengthHalf = duration < 10 && Math.round(((0.5 + 0.5 * (duration / 10)) * 63) / 2);
  const lengthHalf = Math.round(waveform.length / 2);
  const spikes = reducedLengthHalf
    ? waveform.slice(lengthHalf - reducedLengthHalf, lengthHalf + reducedLengthHalf)
    : waveform;

  const spikeWidth = 2;
  const spikeStep = 4;
  const spikeRadius = 1;
  const width = spikes.length * spikeStep - spikeWidth;
  const height = 23;

  const src = renderWaveformToDataUri(spikes, playProgress, {
    width,
    height,
    spikeWidth,
    spikeStep,
    spikeRadius,
    fillStyle: isOwn ? '#B0DEA6' : '#CBCBCB',
    progressFillStyle: isOwn ? '#53ad53' : '#54a3e6',
  });

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      className="waveform"
      draggable={false}
      onMouseDown={handleStartSeek}
      onMouseMove={handleSeek}
      onMouseUp={handleStopSeek}
    />
  );
}

export default memo(Audio);
