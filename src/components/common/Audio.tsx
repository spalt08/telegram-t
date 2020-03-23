import React, {
  FC, useCallback, useEffect, useMemo, useRef, useState, memo,
} from '../../lib/teact/teact';

import { ApiAudio, ApiMessage, ApiVoice } from '../../api/types';

import { formatMediaDateTime, formatMediaDuration } from '../../util/dateFormat';
import { isOwnMessage, getMessageMediaHash, getMediaTransferState } from '../../modules/helpers';
import useMediaWithDownloadProgress from '../../hooks/useMediaWithDownloadProgress';
import useShowTransition from '../../hooks/useShowTransition';
import { renderWaveformToDataUri } from './helpers/waveform';
import buildClassName from '../../util/buildClassName';

import Button from '../ui/Button';
import ProgressSpinner from '../ui/ProgressSpinner';

import './Audio.scss';

type IProps = {
  message: ApiMessage;
  loadAndPlay?: boolean;
  uploadProgress?: number;
  inSharedMedia?: boolean;
  date?: number;
  onReadMedia?: () => void;
  onCancelUpload?: () => void;
};

const Audio: FC<IProps> = ({
  message,
  uploadProgress,
  inSharedMedia,
  date,
  onReadMedia,
  onCancelUpload,
}) => {
  const { content: { audio, voice }, isMediaUnread } = message;

  const audioRef = useRef<HTMLAudioElement>();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const {
    mediaData, downloadProgress,
  } = useMediaWithDownloadProgress(getMessageMediaHash(message, 'inline'), !isActive);

  const {
    isTransferring, transferProgress,
  } = getMediaTransferState(message, uploadProgress || downloadProgress, isActive && !mediaData);
  const {
    shouldRender: shouldSpinnerRender,
    transitionClassNames: spinnerClassNames,
  } = useShowTransition(isTransferring && isActive);

  const togglePlay = useCallback(() => {
    setIsActive((active) => !active);
  }, []);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      requestAnimationFrame(() => {
        setProgress(audioEl.currentTime / audioEl.duration);
      });
    }
  }, [progress]);

  useEffect(() => {
    if (mediaData) {
      if (!audioRef.current) {
        const audioEl = new window.Audio(mediaData);
        audioEl.addEventListener('timeupdate', () => {
          setProgress(audioEl.currentTime / audioEl.duration);
        });
        audioEl.addEventListener('ended', () => {
          setIsActive(false);
        });
        audioRef.current = audioEl;
      }

      if (isActive) {
        audioRef.current.play();

        if (onReadMedia && isMediaUnread) {
          onReadMedia();
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [mediaData, isActive, isMediaUnread, onReadMedia]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const isOwn = isOwnMessage(message);
  const renderedWaveform = useMemo(() => voice && renderWaveform(voice, progress, isOwn), [voice, progress, isOwn]);

  const className = buildClassName(
    'Audio media-inner',
    isOwn && !inSharedMedia && 'own',
    inSharedMedia && 'smaller',
  );

  const buttonClassNames = ['toggle-play'];
  if (shouldSpinnerRender) {
    buttonClassNames.push('loading');
  } else if (isActive) {
    buttonClassNames.push('pause');
  } else if (audioRef.current) {
    buttonClassNames.push('play');
  }

  return (
    <div className={className}>
      <Button
        round
        size={inSharedMedia ? 'smaller' : 'default'}
        className={buttonClassNames.join(' ')}
        onClick={togglePlay}
      >
        <i className="icon-play" />
        <i className="icon-pause" />
      </Button>
      {shouldSpinnerRender && (
        <div className={buildClassName('message-media-loading', spinnerClassNames)}>
          <ProgressSpinner
            progress={transferProgress}
            transparent
            size={inSharedMedia ? 'm' : 'l'}
            onClick={onCancelUpload}
          />
        </div>
      )}
      {audio ? renderAudio(audio, isActive, progress, date) : renderVoice(voice!, renderedWaveform, isMediaUnread)}
    </div>
  );
};

function renderAudio(audio: ApiAudio, isActive: boolean, progress: number, date?: number) {
  const {
    title, performer, duration, fileName,
  } = audio;
  const showSeekline = isActive || (progress > 0 && progress < 1);

  return (
    <div className="content">
      <p className="title">{title || fileName}</p>
      {showSeekline && (
        <div className="seekline">
          <span className="seekline-progress">
            <i
              // @ts-ignore
              style={`transform: translateX(${progress * 100}%)`}
            />
          </span>
          <span className="seekline-thumb">
            <i
              // @ts-ignore
              style={`transform: translateX(${progress * 100}%)`}
            />
          </span>
        </div>
      )}
      {!showSeekline && (
        <div className="meta">
          {performer && (
            <span className="performer">{performer}</span>
          )}
          {date && <span className="date">{formatMediaDateTime(date * 1000)}</span>}
        </div>
      )}
      <p className="duration">
        {progress > 0 ? `${formatMediaDuration(duration * progress)} / ` : null}
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

function renderWaveform(voice: ApiVoice, progress = 0, isOwn = false) {
  const { waveform, duration } = voice;

  if (!waveform) {
    return null;
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

  const src = renderWaveformToDataUri(spikes, progress, {
    width,
    height,
    spikeWidth,
    spikeStep,
    spikeRadius,
    fillStyle: isOwn ? '#B0DEA6' : '#CBCBCB',
    progressFillStyle: isOwn ? '#53ad53' : '#54a3e6',
  });

  return (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      className="waveform"
    />
  );
}

export default memo(Audio);