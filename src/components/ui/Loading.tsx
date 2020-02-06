import React, { FC } from '../../lib/teact/teact';

import Spinner from './Spinner';
import './Loading.scss';

interface IProps {
  color?: 'blue' | 'white' | 'black';
}

const Loading: FC<IProps> = ({ color = 'blue' }) => {
  return (
    <div className="Loading">
      <Spinner color={color} background={color === 'white'} />
    </div>
  );
};

export default Loading;
