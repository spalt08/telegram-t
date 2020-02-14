import React, { FC, useMemo } from '../../../lib/teact/teact';

import { ApiVoice } from '../../../api/types';

import { formatMediaDuration } from '../../../util/dateFormat';
import { renderWaveformToDataUri } from '../../../util/waveform';

import Button from '../../ui/Button';

import './Voice.scss';

type IProps = {
  voice: ApiVoice;
  isOwn: boolean;
};

const Voice: FC<IProps> = ({ voice, isOwn }) => {
  const {
    duration,
    waveform,
  } = voice;

  const renderedWaveform = useMemo(() => renderWaveform(waveform, duration, isOwn), [waveform, duration, isOwn]);

  return (
    <div className={`Voice not-implemented ${isOwn ? 'own' : ''}`}>
      <Button round className="toggle-play">
        <i className="icon-play" />
      </Button>
      <div className="content">
        {renderedWaveform}
        <p className="voice-duration">{formatMediaDuration(duration)}</p>
      </div>
    </div>
  );
};

function renderWaveform(waveform?: number[] | undefined, duration = 0, isOwn = false) {
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

  const src = renderWaveformToDataUri(spikes, {
    width, height, spikeWidth, spikeStep, spikeRadius, fillStyle: isOwn ? '#B0DEA6' : '#CBCBCB',
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

export default Voice;
