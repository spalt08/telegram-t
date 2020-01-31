import React, { FC } from '../../lib/teact/teact';

import './Spinner.scss';

const Spinner: FC<{
  color?: 'blue' | 'white' | 'black';
  progress?: number;
}> = ({
  color = 'blue',
  progress,
}) => {
  return (
    <div className={`Spinner ${color}`}>
      <div />
      {typeof progress === 'number' && <span>{Math.round(progress * 100)}%</span>}
    </div>
  );
};

export default Spinner;
