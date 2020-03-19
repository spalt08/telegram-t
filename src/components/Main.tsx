import React, { FC } from '../lib/teact/teact';

import UiLoader from './common/UiLoader';
import MediaViewer from './mediaViewer/MediaViewer';
import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import RightOverlay from './right/RightOverlay';

import './Main.scss';

const Main: FC = () => {
  return (
    <UiLoader page="main" key="main">
      <MediaViewer />
      <RightOverlay />
      <div id="Main">
        <LeftColumn />
        <MiddleColumn />
        <RightColumn />
      </div>
    </UiLoader>
  );
};

export default Main;
