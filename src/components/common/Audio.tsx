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
import useAudioPlayer from '../../hooks/useAudioPlayer';

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
  onPlay: (messageId: number) => void;
  onReadMedia?: () => void;
  onCancelUpload?: () => void;
};

interface ISeekMethods {
  handleStartSeek: (e: React.MouseEvent<HTMLElement>) => void;
  handleSeek: (e: React.MouseEvent<HTMLElement>) => void;
  handleStopSeek: () => void;
}

const AUTO_LOAD = IS_TOUCH_ENV;

const Audio: FC<OwnProps> = ({
  message,
  uploadProgress,
  inSharedMedia,
  date,
  lastSyncTime,
  onPlay,
  onReadMedia,
  onCancelUpload,
}) => {
  const { content: { audio, voice }, isMediaUnread } = message;

  const isSeeking = useRef<boolean>(false);

  // We need to preload on mobiles to enable playing by click.
  const [isActivated, setIsActivated] = useState(false);

  const shouldDownload = isActivated || AUTO_LOAD;

  const { mediaData, downloadProgress } = useMediaWithDownloadProgress(
    getMessageMediaHash(message, 'inline'),
    !(shouldDownload && lastSyncTime),
    audio || IS_OPUS_SUPPORTED ? ApiMediaFormat.Progressive : ApiMediaFormat.BlobUrl,
  );

  const { isBuffered, bufferingHandlers, checkBuffering } = useBuffering();

  const {
    isPlaying, playProgress, playPause, setCurrentTime, audioProxy,
  } = useAudioPlayer(message.id, mediaData, bufferingHandlers, checkBuffering, !AUTO_LOAD);

  const {
    isUploading, isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, isActivated && !isBuffered);

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

    if (!isPlaying) {
      onPlay(message.id);
    }

    if (!isActivated) {
      setIsActivated(true);
    }

    playPause();
  }, [isPlaying, isUploading, message.id, onCancelUpload, onPlay, playPause, isActivated]);

  useEffect(() => {
    if (isPlaying && onReadMedia && isMediaUnread) {
      onReadMedia();
    }
  }, [isPlaying, isMediaUnread, onReadMedia]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isSeeking.current) {
      const seekBar = e.currentTarget.closest('.seekline,.waveform');
      if (seekBar) {
        const { width, left } = seekBar.getBoundingClientRect();
        setCurrentTime(audioProxy.duration * ((e.clientX - left) / width));
      }
    }
  }, [audioProxy, setCurrentTime]);

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
  } else if (isPlaying) {
    buttonClassNames.push('pause');
  } else if (!isPlaying) {
    buttonClassNames.push('play');
  }

  return (
    <div className={className}>
      <Button
        round
        ripple
        size={inSharedMedia ? 'smaller' : 'default'}
        className={buttonClassNames.join(' ')}
        ariaLabel={isPlaying ? 'Pause audio' : 'Play audio'}
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
        ? renderAudio(audio, isPlaying, playProgress, seekHandlers, date)
        : renderVoice(voice!, renderedWaveform, isMediaUnread)}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
    </div>
  );
};

function renderAudio(
  audio: ApiAudio,
  isPlaying: boolean,
  playProgress: number,
  { handleStartSeek, handleSeek, handleStopSeek }: ISeekMethods,
  date?: number,
) {
  const {
    title, performer, duration, fileName,
  } = audio;
  const showSeekline = isPlaying || (playProgress > 0 && playProgress < 1);

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
