import React, { FC } from '../lib/teact';

import './Loading.scss';

const Loading: FC = () => {
  return (
    <div className="Loading">
      <i className="icon-loader" />
    </div>
  );
};

export default Loading;
