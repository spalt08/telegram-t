import React, { FC } from '../../lib/teact';
import { withGlobal } from '../../lib/teactn';

import { GlobalState } from '../../store/types';
import LeftColumn from './components/left/LeftColumn';
import MiddleColumn from './components/middle/MiddleColumn';
import RightColumn from './components/right/RightColumn';

import './Main.scss';

type IProps = GlobalState;

const Main: FC<IProps> = () => {
  return (
    <div id="Main">
      <LeftColumn />
      <MiddleColumn />
      <RightColumn />
    </div>
  );
};

export default withGlobal(

)(Main);
