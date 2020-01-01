import React, { FC, memo } from '../lib/teact';

import Spinner from './Spinner';
import './Loading.scss';

const Loading: FC = () => {
  return (
    <div className="Loading">
      <Spinner />
    </div>
  );
};

export default memo(Loading);
