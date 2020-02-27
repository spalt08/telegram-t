import React, { FC } from '../../lib/teact/teact';

import './Spinner.scss';

const Spinner: FC<{
  color?: 'blue' | 'white' | 'black';
  background?: boolean;
}> = ({
  color = 'blue',
  background,
}) => {
  return (
    <div className={`Spinner ${color}${background ? ' with-background' : ''}`}>
      <div />
    </div>
  );
};

export default Spinner;
