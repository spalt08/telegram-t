import React, { FC } from '../lib/teact/teact';

import MediaViewer from './mediaViewer/MediaViewer.async';
import LeftColumn from './left/LeftColumn';
import MiddleColumn from './middle/MiddleColumn';
import RightColumn from './right/RightColumn';
import RightOverlay from './right/RightOverlay';
import ErrorModalContainer from './ui/ErrorModalContainer';

import './Main.scss';

const Main: FC = () => {
  return (
    <div id="Main">
      <MediaViewer />
      <RightOverlay />
      <ErrorModalContainer />
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </div>
  );
};

export default Main;
