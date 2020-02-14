import React, { FC, memo } from '../../../lib/teact/teact';

import { ApiAudio } from '../../../api/types';

import { formatMediaDateTime, formatMediaDuration } from '../../../util/dateFormat';

import Button from '../../ui/Button';

import './Audio.scss';

type IProps = {
  audio: ApiAudio;
  isOwn: boolean;
  smaller?: boolean;
  date?: number;
};

const Audio: FC<IProps> = ({
  audio, isOwn, smaller, date,
}) => {
  const {
    fileName,
    duration,
    performer,
    title,
  } = audio;

  const classNames = ['Audio', 'not-implemented'];
  if (isOwn) {
    classNames.push('own');
  }
  if (smaller) {
    classNames.push('smaller');
  }

  return (
    <div className={classNames.join(' ')}>
      <Button round size={smaller ? 'smaller' : 'default'} className="toggle-play">
        <i className="icon-play" />
      </Button>
      <div className="content">
        <p className="title">{title || fileName}</p>
        {renderPerformerAndDate(performer, date)}
        <p className="duration">{formatMediaDuration(duration)}</p>
      </div>
    </div>
  );
};

function renderPerformerAndDate(performer?: string, date?: number) {
  if (!performer && !date) {
    return null;
  }

  return (
    <div className="meta">
      {performer && <span className="performer">{performer}</span>}
      {date && <span className="date">{formatMediaDateTime(date * 1000)}</span>}
    </div>
  );
}

export default Audio;
