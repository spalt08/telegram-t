import React, { FC } from '../../lib/teact/teact';

import './Spinner.scss';

const Spinner: FC<{
  color?: 'blue' | 'white' | 'black';
  progress?: number;
  background?: boolean;
}> = ({
  color = 'blue',
  progress,
  background,
}) => {
  return (
    <div className={`Spinner ${color}${background ? ' with-background' : ''}`}>
      <div />
      {typeof progress === 'number' && <span>{Math.round(progress * 100)}%</span>}
    </div>
  );
};

export default Spinner;
