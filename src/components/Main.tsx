import React, { FC } from '../lib/teact/teact';

import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import MediaViewer from './mediaViewer/MediaViewer';

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
