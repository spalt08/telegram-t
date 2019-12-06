import React, { FC } from '../../lib/teact';

import LeftColumn from './components/left/LeftColumn';
import MiddleColumn from './components/middle/MiddleColumn';
import RightColumn from './components/right/RightColumn';

import './Main.scss';

const Main: FC = () => {
  return (
    <div id="Main">
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </div>
  );
};

export default Main;
