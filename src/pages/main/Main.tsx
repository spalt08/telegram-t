import React, { FC } from '../../lib/teact';

import LeftColumn from './components/left/LeftColumn';
import MiddleColumn from './components/middle/MiddleColumn';
import RightColumn from './components/right/RightColumn';
import MediaViewer from './components/media/MediaViewer';

import './Main.scss';

const Main: FC = () => {
  return (
    <div id="Main">
      <MediaViewer />
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </div>
  );
};

export default Main;
